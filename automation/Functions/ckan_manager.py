import requests
import time
import pandas as pd
import json
import logging
from typing import Dict, Optional, List, Any
from .utils import sanitize_name, setup_logging
import os
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

    def _request_with_retry(
        self,
        endpoint: str,
        method: str = 'get',
        **kwargs
    ) -> Optional[Dict]:
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
            except (requests.exceptions.ConnectionError, 
                    requests.exceptions.Timeout) as e:
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
        """Get dataset by name with cache."""
        return self._request_with_retry(
            'package_show',
            params={'id': sanitize_name(name)}
        )

    def create_update_dataset(self, payload: Dict) -> Optional[str]:
        """Create or update dataset with conflict resolution."""
        try:
            if 'name' not in payload:
                self.logger.error("Dataset payload missing 'name'")
                return None

            # Sanitize and validate dataset name
            payload['name'] = sanitize_name(payload['name'])
            
            # Check existing dataset
            existing = self.get_dataset(payload['name'])  # Correct variable name

            if existing is None:
                self.logger.info(f"Creating new dataset: {payload['name']}")
                result = self._request_with_retry(
                    'package_create',
                    method='post',
                    json=payload
                )
            else:
                self.logger.info(f"Updating existing dataset: {payload['name']}")
                payload['id'] = existing['result']['id']
                result = self._request_with_retry(
                    'package_update',
                    method='post',
                    json=payload
                )

            if not result or not result.get('success'):
                error_msg = result.get('error', {}).get('message', 'Unknown error') if result else 'No response'
                self.logger.error(f"Dataset operation failed: {error_msg}")
                return None

            return result["result"]["id"]
        except Exception as e:
            self.logger.error(f"Dataset error: {str(e)}")
            return None

    def _update_dataset(self, id: str, payload: Dict) -> Optional[str]:
        """Update existing dataset."""
        payload['id'] = id
        response = self._request_with_retry(
            'package_update',
            method='post',
            json=payload
        )
        return response['result']['id'] if response else None

    def manage_resource(
        self,
        dataset_id: str,
        file_path: str,
        metadata: Dict
    ) -> bool:
        """Full resource lifecycle management."""
        resource_name = metadata.get('name', os.path.basename(file_path))
        existing_resource = self._get_resource_by_name(dataset_id, resource_name)
        
        # Prepare upload
        files = {"upload": (resource_name, open(file_path, "rb"))}
        data = metadata.copy()
        schema_fields = data.pop("schema", {}).get("fields", [])

        # Update existing resource or create new one
        if existing_resource:
            data["id"] = existing_resource["id"]
            result = self._request_with_retry(
                'resource_update',
                method='post',
                data=data,
                files=files
            )
            action = "updated"
        else:
            data["package_id"] = dataset_id
            result = self._request_with_retry(
                'resource_create',
                method='post',
                data=data,
                files=files
            )
            action = "created"

        if result and result.get("success"):
            resource_id = result["result"]["id"]
            self.logger.info(f"Resource {action}: {resource_name}")
            
            # Push to DataStore and update schema
            df = pd.read_csv(file_path) if file_path.endswith('.csv') else pd.read_excel(file_path)
            self.push_to_datastore(resource_id, df)
            
            if schema_fields:
                self.update_schema_dictionary(resource_id, schema_fields)
            return True
        return False

    def push_to_datastore(self, resource_id: str, df: pd.DataFrame) -> bool:
        """Push data to CKAN DataStore with cleaning."""
        try:
            # Clean DataFrame
            df = df.where(pd.notnull(df), None)
            df = df.astype(object).where(pd.notnull(df), None)
            
            fields = [{"id": col, "type": self._infer_postgres_type(df[col].dtype)} 
                     for col in df.columns]
            
            records = []
            for record in df.to_dict(orient="records"):
                cleaned = {k: (v if pd.notnull(v) and v != float('inf') else None) 
                          for k, v in record.items()}
                records.append(cleaned)
            
            payload = {
                "resource_id": resource_id,
                "force": True,
                "fields": fields,
                "records": records
            }
            
            response = self._request_with_retry(
                'datastore_create',
                method='post',
                json=payload
            )
            return response and response.get("success")
        except Exception as e:
            self.logger.error(f"DataStore push failed: {str(e)}")
            return False

    def update_schema_dictionary(self, resource_id: str, schema_fields: List[Dict]) -> bool:
        """Update the data dictionary in CKAN datastore."""
        try:
            # Fetch current schema
            response = self._request_with_retry(
                'datastore_search',
                params={"resource_id": resource_id, "limit": 0}
            )
            if not response or not response.get("success"):
                self.logger.error("Failed to fetch current schema")
                return False
            
            current_fields = response["result"]["fields"]
            technical_fields = {"_id", "_full_text"}
            filtered_fields = [f for f in current_fields if f["id"] not in technical_fields]
            
            # Merge schema updates
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
            
            # Apply updates
            update_payload = {
                "resource_id": resource_id,
                "fields": updated_fields,
                "force": True
            }
            response = self._request_with_retry(
                'datastore_create',
                method='post',
                json=update_payload
            )
            return response and response.get("success")
        except Exception as e:
            self.logger.error(f"Schema update failed: {str(e)}")
            return False

    def _get_resource_by_name(self, dataset_id: str, resource_name: str) -> Optional[Dict]:
        """Get resource by name within a dataset."""
        dataset = self.get_dataset(dataset_id)
        if dataset:
            for resource in dataset.get("resources", []):
                if resource["name"] == resource_name:
                    return resource
        return None

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
            return report_path
        except Exception as e:
            self.logger.error(f"Failed to generate report: {str(e)}")
            return ""