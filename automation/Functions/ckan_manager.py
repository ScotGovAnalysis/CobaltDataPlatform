import requests
import logging
import time
import csv
import os
from datetime import datetime
import pandas as pd
import psycopg2

class CKANManager:
    def __init__(self, api_url, api_key, db_params=None):
        self.api_url = api_url
        self.api_key = api_key
        self.db_params = db_params  # Optional: For direct DB checks
        self.logger = logging.getLogger(__name__)
        self.report_data = []

    def infer_postgres_type(self, dtype):
        """Map pandas data types to PostgreSQL types."""
        type_mapping = {
            'int64': 'BIGINT',
            'float64': 'FLOAT',
            'object': 'TEXT',
            'datetime64[ns]': 'TIMESTAMP',
            'bool': 'BOOLEAN'
        }
        return type_mapping.get(str(dtype), 'TEXT')

    def _make_request(self, endpoint, method='get', **kwargs):
        """Make HTTP request to CKAN API with proper headers."""
        headers = {"Authorization": self.api_key}
        if method in ['post', 'put'] and 'files' not in kwargs:
            headers["Content-Type"] = "application/json"

        url = f"{self.api_url}/{endpoint}"
        try:
            response = getattr(requests, method)(url, headers=headers, **kwargs)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            self.logger.error(f"HTTP error occurred: {str(e)}")
            if e.response.status_code == 409:
                return {"success": False, "error": "conflict"}
            return None
        except Exception as e:
            self.logger.error(f"Request failed: {str(e)}")
            return None

    def get_dataset_by_name(self, dataset_name):
        """Get dataset by name, handling both direct lookup and search."""
        # Try direct lookup first
        result = self._make_request('package_show', params={"id": dataset_name})
        if result and result.get("success"):
            return result["result"]

        # If not found, try searching
        search_result = self._make_request('package_search',
                                         params={"q": f"name:{dataset_name}"})
        if search_result and search_result.get("success"):
            results = search_result["result"]["results"]
            if results:
                return results[0]
        return None

    def _check_db_for_dataset(self, dataset_name):
        """Check PostgreSQL directly for dataset existence."""
        if not self.db_params:
            return False

        query = """
        SELECT EXISTS(
            SELECT 1 FROM package 
            WHERE name = %s 
            OR id = %s
        )
        """
        try:
            with psycopg2.connect(**self.db_params) as conn:
                with conn.cursor() as cur:
                    cur.execute(query, (dataset_name, dataset_name))
                    return cur.fetchone()[0]
        except Exception as e:
            self.logger.error(f"Database check failed: {str(e)}")
            return False

    def cleanup_zombie_dataset(self, dataset_name):
        """Safely clean up zombie datasets that exist in CKAN's backend but lack a proper package entry."""
        try:
            # Verify it's a true zombie (exists in backend but not via API)
            api_result = self._make_request('package_show', params={"id": dataset_name})
            db_result = self._check_db_for_dataset(dataset_name)

            if api_result is None and db_result:
                self.logger.warning(f"Detected zombie dataset: {dataset_name}")
                # Use CKAN's standard purge endpoint
                purge_result = self._make_request('dataset_purge',
                                                method='post',
                                                json={"id": dataset_name})
                return purge_result and purge_result.get("success")
            return False
        except Exception as e:
            self.logger.error(f"Cleanup failed: {str(e)}")
            return False

    def create_or_update_dataset(self, dataset_payload, zombie_cleanup=False):
        """Create or update a dataset, preserving existing resources."""
        try:
            # Sanitize dataset name
            original_name = dataset_payload["name"].lower().replace(" ", "_")
            dataset_payload["name"] = ''.join(c if c.isalnum() or c == '_' else ''
                                            for c in original_name)

            # Check for existing dataset
            existing_dataset = self.get_dataset_by_name(dataset_payload["name"])

            if existing_dataset:
                # Preserve existing resources by including them in the payload
                dataset_payload["resources"] = existing_dataset.get("resources", [])
                dataset_payload["id"] = existing_dataset["id"]
                
                # Update existing dataset
                result = self._make_request('package_update',
                                        method='post',
                                        json=dataset_payload)
            else:
                # Attempt dataset creation
                result = self._make_request('package_create',
                                        method='post',
                                        json=dataset_payload)

                # Handle conflicts safely
                if not result or (not result.get("success") and "conflict" in str(result.get("error"))):
                    self.logger.warning(f"Conflict detected for {dataset_payload['name']}")
                    if zombie_cleanup:
                        self.cleanup_zombie_dataset(dataset_payload["name"])

                    # Re-check if dataset exists post-conflict
                    existing_dataset = self.get_dataset_by_name(dataset_payload["name"])
                    if existing_dataset:
                        self.logger.info("Dataset exists after conflict. Updating instead.")
                        dataset_payload["resources"] = existing_dataset.get("resources", [])
                        dataset_payload["id"] = existing_dataset["id"]
                        result = self._make_request('package_update',
                                                method='post',
                                                json=dataset_payload)
                    else:
                        self.logger.warning("No dataset found post-conflict. Using fallback name.")
                        dataset_payload["name"] = f"{original_name}_{int(time.time())}"
                        result = self._make_request('package_create',
                                                method='post',
                                                json=dataset_payload)

            if result and result.get("success"):
                return result["result"]["id"]
            return None

        except Exception as e:
            self.logger.error(f"Dataset error: {str(e)}")
            return None

    def get_resource_by_name(self, dataset_id, resource_name):
        """Get resource by name within a dataset."""
        dataset = self.get_dataset_by_name(dataset_id)
        if dataset:
            for resource in dataset.get("resources", []):
                if resource["name"] == resource_name:
                    return resource
        return None

    def create_or_update_resource(self, dataset_id, resource_payload, file_path):
        """Create or update a resource, ensuring existing resources are preserved."""
        try:
            resource_name = resource_payload["name"]
            existing_resource = self.get_resource_by_name(dataset_id, resource_name)

            # Prepare upload
            files = {"upload": (resource_name, open(file_path, "rb"))}
            data = resource_payload.copy()
            schema_fields = data.pop("schema", {}).get("fields", [])

            # Update existing resource or create new one
            if existing_resource and existing_resource["name"] == resource_name:
                data["id"] = existing_resource["id"]
                result = self._make_request('resource_update',
                                          method='post',
                                          data=data,
                                          files=files)
                action = "updated"
            else:
                data["package_id"] = dataset_id
                result = self._make_request('resource_create',
                                          method='post',
                                          data=data,
                                          files=files)
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

        except Exception as e:
            self.logger.error(f"Resource error: {str(e)}")
            return False

    def push_to_datastore(self, resource_id, df):
        """Push the resource to the CKAN DataStore."""
        try:
            # Prepare the fields payload
            fields = [
                {"id": col, "type": self.infer_postgres_type(df[col].dtype)}
                for col in df.columns
            ]

            # Prepare the records payload
            records = df.to_dict(orient="records")

            # Create the DataStore table
            datastore_create_payload = {
                "resource_id": resource_id,
                "force": True,  # Override read-only restriction
                "fields": fields,
                "records": records  # Include data records
            }

            response = requests.post(
                f"{self.api_url}/datastore_create",
                json=datastore_create_payload,
                headers={"Authorization": self.api_key}
            )

            if response.status_code == 200:
                self.logger.info(f"Resource {resource_id} successfully pushed to DataStore.")
            else:
                self.logger.error(f"Failed to push resource to DataStore: {response.text}")
        except requests.exceptions.RequestException as e:
            self.logger.error(f"API request failed: {e}")
            if hasattr(e, "response"):
                self.logger.error(f"Response content: {e.response.text}")

    def update_schema_dictionary(self, resource_id, schema_fields):
        """Update the data dictionary (column descriptions) in CKAN datastore."""
        try:
            # Verify the resource exists
            resource_check = self._make_request('resource_show', params={"id": resource_id})
            if not resource_check or not resource_check.get("success"):
                self.logger.error(f"Resource ID {resource_id} does not exist. Cannot update schema.")
                return False

            # Fetch the current schema from the Datastore
            response = requests.post(
                f"{self.api_url}/datastore_search",
                json={"resource_id": resource_id, "limit": 0},
                headers={"Authorization": self.api_key}
            )
            if response.status_code != 200:
                self.logger.error(f"Failed to fetch current schema: {response.text}")
                return False

            current_fields = response.json()["result"]["fields"]
            technical_fields = {"_id", "_full_text"}  # Exclude technical fields
            filtered_current_fields = [
                field for field in current_fields if field["id"] not in technical_fields
            ]

            # Merge existing fields with new descriptions
            updated_fields = []
            for field in schema_fields:
                field_id = field["id"]
                matching_field = next((f for f in filtered_current_fields if f["id"] == field_id), None)
                if matching_field:
                    matching_field["info"] = {
                        "label": field.get("id", ""),
                        "notes": field.get("description", "")
                    }
                    updated_fields.append(matching_field)
                else:
                    self.logger.warning(f"Field '{field_id}' not found in current schema. Adding as new field.")
                    updated_fields.append({
                        "id": field_id,
                        "type": "text",  # Default type, adjust as needed
                        "info": {
                            "label": field.get("id", ""),
                            "notes": field.get("description", "")
                        }
                    })

            # Prepare payload for datastore_create
            update_payload = {
                "resource_id": resource_id,
                "fields": updated_fields,
                "force": True  # Override read-only restriction
            }

            # Update the schema
            response = requests.post(
                f"{self.api_url}/datastore_create",
                json=update_payload,
                headers={"Authorization": self.api_key}
            )
            if response.status_code == 200:
                self.logger.info("✅ Data dictionary updated successfully using datastore_create")
                return True
            else:
                self.logger.error(f"❌ Failed to update dictionary: {response.text}")
                return False
        except requests.exceptions.RequestException as e:
            self.logger.error(f"API request failed: {e}")
            if hasattr(e, "response"):
                self.logger.error(f"Response content: {e.response.text}")
            return False

    def add_to_report(self, filename, success, notes):
        """Add a file processing result to the report data."""
        self.report_data.append({
            'filename': filename,
            'success': 1 if success else 0,
            'notes': notes,
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })

    def generate_report(self, report_dir):
        """Generate a CSV report of all processed files."""
        if not self.report_data:
            return

        report_path = os.path.join(report_dir, f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv")
        fieldnames = ['filename', 'success', 'notes', 'timestamp']

        with open(report_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(self.report_data)

        self.logger.info(f"Report generated: {report_path}")
        return report_path