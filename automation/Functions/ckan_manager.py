import requests
import time
import pandas as pd
import json
import os
import logging
from typing import Dict, Optional, List, Any
from .utils import sanitize_name, setup_logging
import csv

class CKANManager:
    def __init__(self, api_url: str, api_key: str, max_retries: int = 3):
        self.api_url = api_url.rstrip('/')
        self.api_key = api_key
        self.max_retries = max_retries
        self.logger = setup_logging()
        self.session = requests.Session()
        self.session.headers.update({"Authorization": self.api_key})
        self.report_data = []

    def _request_with_retry(self, endpoint: str, method: str = 'get', **kwargs) -> Optional[Dict]:
        """Robust request handler with retry logic."""
        url = f"{self.api_url}/{endpoint}"
        attempts = 0
        while attempts <= self.max_retries:
            try:
                response = getattr(self.session, method)(url, **kwargs)
                response.raise_for_status()
                return response.json()
            except requests.exceptions.HTTPError as e:
                self._log_http_error(e, url, attempts)
                if e.response.status_code in [429, 500, 503]:
                    time.sleep(2 ** attempts)
                    attempts += 1
                    continue
                return None
            except (requests.exceptions.ConnectionError, requests.exceptions.Timeout) as e:
                self.logger.error(f"Connection error: {str(e)}")
                time.sleep(5)
                attempts += 1
            except Exception as e:
                self.logger.error(f"Unexpected error: {str(e)}")
                return None
        return None

    def _log_http_error(self, error, url: str, attempt: int) -> None:
        """Structured HTTP error logging."""
        self.logger.error(
            f"HTTP Error [{error.response.status_code}] "
            f"Attempt {attempt + 1}/{self.max_retries}\n"
            f"URL: {url}\n"
            f"Response: {error.response.text[:500]}"
        )

    def get_dataset(self, name: str) -> Optional[Dict]:
        """Get dataset by name."""
        sanitized_name = sanitize_name(name)
        result = self._request_with_retry('package_show', params={'id': sanitized_name})
        if result and result.get("success"):
            return result["result"]
        return None

    def create_or_update_dataset(self, payload: Dict) -> Optional[str]:
        """Create or update a dataset, preserving existing resources."""
        try:
            if 'name' not in payload:
                self.logger.error("Dataset payload missing 'name'")
                return None

            sanitized_name = sanitize_name(payload['name'])
            payload['name'] = sanitized_name

            existing_dataset = self.get_dataset(sanitized_name)
            if existing_dataset:
                # Preserve existing resources
                payload["resources"] = existing_dataset.get("resources", [])
                payload["id"] = existing_dataset["id"]
                result = self._request_with_retry('package_update', method='post', json=payload)
                action = "updated"
            else:
                # Create new dataset
                result = self._request_with_retry('package_create', method='post', json=payload)
                action = "created"

            if result and result.get("success"):
                dataset_id = result["result"]["id"]
                self.logger.info(f"Dataset {action}: {sanitized_name}")
                return dataset_id
            else:
                error_msg = result.get("error", {}).get("message", "Unknown error") if result else "No response"
                self.logger.error(f"Dataset operation failed: {error_msg}")
                return None
        except Exception as e:
            self.logger.error(f"Dataset error: {str(e)}")
            return None

    def get_resource_by_name(self, dataset_id: str, resource_name: str) -> Optional[Dict]:
        """Get resource by name within a dataset."""
        dataset = self.get_dataset(dataset_id)
        if dataset:
            for resource in dataset.get("resources", []):
                if resource["name"] == resource_name:
                    return resource
        return None

    def create_or_update_resource(self, dataset_id: str, resource_payload: Dict, file_path: str) -> bool:
        """Create or update a resource, ensuring existing resources are preserved."""
        try:
            resource_name = resource_payload.get("name", os.path.basename(file_path))
            existing_resource = self.get_resource_by_name(dataset_id, resource_name)

            files = {"upload": (resource_name, open(file_path, "rb"))}
            data = resource_payload.copy()
            schema_fields = data.pop("schema", {}).get("fields", [])

            if existing_resource:
                # Update existing resource
                data["id"] = existing_resource["id"]
                result = self._request_with_retry('resource_update', method='post', data=data, files=files)
                action = "updated"
            else:
                # Create new resource
                data["package_id"] = dataset_id
                result = self._request_with_retry('resource_create', method='post', data=data, files=files)
                action = "created"

            if result and result.get("success"):
                resource_id = result["result"]["id"]
                self.logger.info(f"Resource {action}: {resource_name}")

                # Push data to DataStore
                df = pd.read_csv(file_path) if file_path.endswith('.csv') else pd.read_excel(file_path)
                self.push_to_datastore(resource_id, df)

                # Update schema (data dictionary)
                if schema_fields:
                    self.update_schema_dictionary(resource_id, schema_fields)
                return True
            return False
        except Exception as e:
            self.logger.error(f"Resource error: {str(e)}")
            return False

    def push_to_datastore(self, resource_id: str, df: pd.DataFrame) -> bool:
        """Push data to CKAN DataStore."""
        try:
            fields = [{"id": col, "type": self._infer_postgres_type(df[col].dtype)} for col in df.columns]
            records = df.to_dict(orient="records")

            payload = {
                "resource_id": resource_id,
                "force": True,
                "fields": fields,
                "records": records
            }

            response = self._request_with_retry('datastore_create', method='post', json=payload)
            if response and response.get("success"):
                self.logger.info(f"Data successfully pushed to DataStore for resource {resource_id}")
                return True
            else:
                self.logger.error(f"Failed to push data to DataStore for resource {resource_id}")
                return False
        except Exception as e:
            self.logger.error(f"DataStore push failed: {str(e)}")
            return False

    def update_schema_dictionary(self, resource_id: str, schema_fields: List[Dict]) -> bool:
        """Update the data dictionary (column descriptions) in CKAN datastore."""
        try:
            response = self._request_with_retry('datastore_search', params={"resource_id": resource_id, "limit": 0})
            if not response or not response.get("success"):
                self.logger.error("Failed to fetch current schema")
                return False

            current_fields = response["result"]["fields"]
            technical_fields = {"_id", "_full_text"}
            filtered_fields = [f for f in current_fields if f["id"] not in technical_fields]

            updated_fields = []
            for field in schema_fields:
                field_id = field["id"]
                matching_field = next((f for f in filtered_fields if f["id"] == field_id), None)
                if matching_field:
                    matching_field["info"] = {
                        "label": field.get("id", ""),
                        "notes": field.get("description", "")
                    }
                    updated_fields.append(matching_field)
                else:
                    updated_fields.append({
                        "id": field_id,
                        "type": "text",
                        "info": {
                            "label": field.get("id", ""),
                            "notes": field.get("description", "")
                        }
                    })

            update_payload = {
                "resource_id": resource_id,
                "fields": updated_fields,
                "force": True
            }

            response = self._request_with_retry('datastore_create', method='post', json=update_payload)
            if response and response.get("success"):
                self.logger.info(f"Schema updated successfully for resource {resource_id}")
                return True
            else:
                self.logger.error(f"Failed to update schema for resource {resource_id}")
                return False
        except Exception as e:
            self.logger.error(f"Schema update failed: {str(e)}")
            return False

    def add_to_report(self, filename: str, success: bool, notes: str) -> None:
        """Add a file processing result to the report."""
        self.report_data.append({
            'filename': filename,
            'success': success,
            'notes': notes,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        })

    def generate_report(self, report_dir: str) -> str:
        """Generate a CSV report of all processed files."""
        if not self.report_data:
            return ""
        report_path = os.path.join(report_dir, f"report_{time.strftime('%Y%m%d_%H%M%S')}.csv")
        fieldnames = ['filename', 'success', 'notes', 'timestamp']
        try:
            with open(report_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(self.report_data)
            self.logger.info(f"Report generated: {report_path}")
            return report_path
        except Exception as e:
            self.logger.error(f"Failed to generate report: {str(e)}")
            return ""

    def _infer_postgres_type(self, dtype) -> str:
        """Map pandas types to PostgreSQL types."""
        type_mapping = {
            'int64': 'bigint',
            'float64': 'double precision',
            'object': 'text',
            'datetime64[ns]': 'timestamp',
            'bool': 'boolean'
        }
        return type_mapping.get(str(dtype), 'text')
