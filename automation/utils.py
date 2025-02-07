# utils.py
import os
import logging
from datetime import datetime
import configparser

class ConfigLoader:
    def __init__(self, config_path='config.ini'):
        self.config = configparser.ConfigParser()
        self.config.read(config_path)

        # Directory paths
        self.pending_root_dir = self.config.get('Paths', 'pending_dir')
        self.pending_file_dir = os.path.join(self.pending_root_dir, 'files')
        self.pending_metadata_dir = os.path.join(self.pending_root_dir, 'metadata')
        self.completed_root_dir = self.config.get('Paths', 'completed_dir')
        self.completed_file_dir = os.path.join(self.completed_root_dir, 'files')
        self.completed_metadata_dir = os.path.join(self.completed_root_dir, 'metadata')
        self.completed_report_dir = os.path.join(self.completed_root_dir, 'report')

        # Ensure directories exist
        for path in [
            self.pending_root_dir, self.pending_file_dir, self.pending_metadata_dir,
            self.completed_root_dir, self.completed_file_dir, self.completed_metadata_dir, self.completed_report_dir
        ]:
            os.makedirs(path, exist_ok=True)

        # Database connection parameters
        self.db_params = {
            'dbname': self.config.get('Database', 'dbname'),
            'user': self.config.get('Database', 'user'),
            'password': self.config.get('Database', 'password'),
            'host': self.config.get('Database', 'host')
        }

        # CKAN API details
        self.ckan_api_url = self.config.get('CKAN', 'api_url')
        self.ckan_api_key = self.config.get('CKAN', 'api_key')

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s: %(message)s',
        handlers=[
            logging.FileHandler('datastore_loader.log', encoding='utf-8'),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)