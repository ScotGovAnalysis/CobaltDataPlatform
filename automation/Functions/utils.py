import os
import logging
import configparser
from typing import Dict, Any
import chardet
import json
import csv

def sanitize_name(name: str) -> str:
    """Sanitize names for CKAN/PostgreSQL compatibility."""
    return (
        ''.join(c if c.isalnum() or c == '_' else '_'
        for c in name.strip())
        .strip('_')
        .lower()
        .replace(' ', '_')
    )

class ConfigLoader:
    def __init__(self, config_path='config.ini'):
        self.config = configparser.ConfigParser()
        self.config.read(config_path)
        self._initialize_paths()

    def _initialize_paths(self):
        """Initialize directory paths."""
        self.pending_root_dir = self.config.get('Paths', 'pending_dir')
        self.completed_root_dir = self.config.get('Paths', 'completed_dir')
        self.pending_file_dir = os.path.join(self.pending_root_dir, 'files')
        self.pending_metadata_dir = os.path.join(self.pending_root_dir, 'metadata')
        self.completed_file_dir = os.path.join(self.completed_root_dir, 'files')
        self.completed_metadata_dir = os.path.join(self.completed_root_dir, 'metadata')
        self.completed_report_dir = os.path.join(self.completed_root_dir, 'report')

        for path in [
            self.pending_root_dir, self.pending_file_dir, self.pending_metadata_dir,
            self.completed_root_dir, self.completed_file_dir, self.completed_metadata_dir, self.completed_report_dir
        ]:
            os.makedirs(path, exist_ok=True)

    @property
    def db_params(self) -> Dict[str, str]:
        return {
            "dbname": self.config.get('Database', 'dbname'),
            "user": self.config.get('Database', 'user'),
            "password": self.config.get('Database', 'password'),
            "host": self.config.get('Database', 'host')
        }

    @property
    def ckan_api_url(self) -> str:
        return self.config.get('CKAN', 'api_url')

    @property
    def ckan_api_key(self) -> str:
        return self.config.get('CKAN', 'api_key')

def setup_logging() -> logging.Logger:
    """Configure logging."""
    logger = logging.getLogger('ckan_loader')
    logger.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')

    file_handler = logging.FileHandler('datastore_loader.log', encoding='utf-8')
    file_handler.setFormatter(formatter)

    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(formatter)

    logger.addHandler(file_handler)
    logger.addHandler(stream_handler)
    return logger

def load_metadata(self, filename: str) -> Dict:
    """Load and validate metadata file."""
    metadata_matches = [
        f for f in os.listdir(self.config.pending_metadata_dir)
        if f.startswith(f"metadata_{os.path.splitext(filename)[0]}")
    ]
    if not metadata_matches:
        raise ValueError("No matching metadata file found")
    latest_metadata = max(metadata_matches)
    metadata_path = os.path.join(self.config.pending_metadata_dir, latest_metadata)
    try:
        with open(metadata_path, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
            if not isinstance(metadata, dict):
                raise ValueError("Metadata is not a dictionary")
            return metadata
    except Exception as e:
        raise ValueError(f"Metadata load failed: {str(e)}")