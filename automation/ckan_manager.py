import requests
import logging
import json
import time
import csv
import os
from datetime import datetime
import shutil

class CKANManager:
    def __init__(self, api_url, api_key):
        self.api_url = api_url
        self.api_key = api_key
        self.logger = logging.getLogger(__name__)
        self.report_data = []
        
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

    def _try_purge_endpoints(self, dataset_name):
        """Try different purge endpoints available in CKAN."""
        endpoints = [
            'package_purge',
            'dataset_purge',
            'group_purge',
            'organization_purge'
        ]
        
        for endpoint in endpoints:
            try:
                self.logger.info(f"Attempting to purge using {endpoint}")
                result = self._make_request(endpoint, 
                                          method='post',
                                          json={"id": dataset_name})
                if result and result.get("success"):
                    return True
            except Exception as e:
                self.logger.warning(f"Failed with {endpoint}: {str(e)}")
                continue
        return False

    def cleanup_zombie_dataset(self, dataset_name):
        """Attempt to clean up a zombie dataset registration with multiple strategies."""
        try:
            self.logger.info(f"Starting aggressive cleanup for zombie dataset: {dataset_name}")
            
            # Strategy 1: Try different purge endpoints
            if self._try_purge_endpoints(dataset_name):
                self.logger.info("Successfully purged dataset through standard endpoints")
            
            # Strategy 2: Try to delete the dataset first, then purge
            delete_result = self._make_request('package_delete', 
                                             method='post',
                                             json={"id": dataset_name})
            if delete_result:
                self.logger.info("Successfully deleted dataset, attempting purge")
                self._try_purge_endpoints(dataset_name)
            
            # Strategy 3: Try to unregister the dataset
            unregister_result = self._make_request('dataset_unregister', 
                                                  method='post',
                                                  json={"id": dataset_name})
            if unregister_result:
                self.logger.info("Successfully unregistered dataset")
            
            # Wait for operations to complete
            time.sleep(3)
            
            # Verify cleanup was successful
            verify = self._make_request('package_show', 
                                      params={"id": dataset_name})
            
            if verify is None:  # Dataset not found, which is good
                self.logger.info(f"Successfully cleaned up zombie dataset: {dataset_name}")
                return True
            else:
                self.logger.error(f"Failed to clean up zombie dataset: {dataset_name}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error during zombie dataset cleanup: {str(e)}")
            return False

    def force_refresh_dataset(self, dataset_id):
        """Force refresh a dataset registration."""
        result = self._make_request('package_update', 
                                  method='post',
                                  json={"id": dataset_id, "force": True})
        return result is not None and result.get("success", False)

    def create_or_update_dataset(self, dataset_payload):
        """Create or update a dataset, with enhanced zombie handling."""
        try:
            # Sanitize dataset name to remove spaces and special characters
            dataset_payload["name"] = dataset_payload["name"].lower().replace(" ", "_")
            dataset_payload["name"] = ''.join(c if c.isalnum() or c == '_' else '' 
                                            for c in dataset_payload["name"])
            
            # Try to get existing dataset
            existing_dataset = self.get_dataset_by_name(dataset_payload["name"])
            
            if existing_dataset:
                # Update existing dataset
                dataset_payload["id"] = existing_dataset["id"]
                result = self._make_request('package_update', 
                                          method='post',
                                          json=dataset_payload)
            else:
                # Try to create new dataset
                result = self._make_request('package_create', 
                                          method='post',
                                          json=dataset_payload)
                
                # Handle potential zombie dataset
                if result and not result.get("success") and result.get("error") == "conflict":
                    self.logger.warning(f"Detected possible zombie dataset: {dataset_payload['name']}")
                    
                    # Try to clean up the zombie dataset
                    if self.cleanup_zombie_dataset(dataset_payload["name"]):
                        # Retry creation after cleanup
                        self.logger.info("Retrying dataset creation after cleanup")
                        # Wait a moment before retrying
                        time.sleep(2)
                        result = self._make_request('package_create', 
                                                  method='post',
                                                  json=dataset_payload)
                    else:
                        # If cleanup failed, try with a modified name
                        self.logger.warning("Cleanup failed, trying with modified dataset name")
                        dataset_payload["name"] = f"{dataset_payload['name']}_{int(time.time())}"
                        result = self._make_request('package_create', 
                                                  method='post',
                                                  json=dataset_payload)
            
            if result and result.get("success"):
                dataset_id = result["result"]["id"]
                # Force refresh the dataset
                if self.force_refresh_dataset(dataset_id):
                    self.logger.info(f"Successfully {'updated' if existing_dataset else 'created'} "
                                   f"and refreshed dataset: {dataset_payload['name']}")
                    return dataset_id
            
            return None
            
        except Exception as e:
            self.logger.error(f"Failed to handle dataset: {str(e)}")
            return None

    def get_resource_by_name(self, dataset_id, resource_name):
        """Get resource by name within a dataset."""
        dataset = self.get_dataset_by_name(dataset_id)
        if dataset:
            for resource in dataset.get("resources", []):
                if resource["name"] == resource_name:
                    return resource
        return None

    def update_schema_dictionary(self, resource_id, schema_fields):
        """
        Update the data dictionary (column descriptions) in CKAN datastore using datastore_create.
        """
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
                    self.logger.warning(f"Field '{field_id}' not found in current schema. Skipping.")

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

    def push_to_datastore(self, resource_id, df):
        """
        Push the resource to the CKAN DataStore.
        """
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