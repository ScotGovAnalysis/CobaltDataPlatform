import os
import logging
import configparser
from typing import Dict, Any
import chardet

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
    def __init__(self, config_path: str = 'config.ini'):
        self.config = configparser.ConfigParser()
        if not self.config.read(config_path):
            raise FileNotFoundError(f"Config file not found: {config_path}")
        
        self._validate_config()
        self._initialize_paths()

    def _validate_config(self) -> None:
        """Validate required configuration sections and keys."""
        required_sections = {
            'Paths': ['pending_dir', 'completed_dir'],
            'Database': ['dbname', 'user', 'password', 'host'],
            'CKAN': ['api_url', 'api_key']
        }
        
        for section, keys in required_sections.items():
            if not self.config.has_section(section):
                raise ValueError(f"Missing config section: {section}")
            for key in keys:
                if not self.config.has_option(section, key):
                    raise ValueError(f"Missing key '{key}' in section '{section}'")

    def _initialize_paths(self) -> None:
        """Initialize all directory paths."""
        self.pending_root_dir = self.config.get('Paths', 'pending_dir')
        self.completed_root_dir = self.config.get('Paths', 'completed_dir')
        
        # Subdirectories
        self.pending_file_dir = os.path.join(self.pending_root_dir, 'files')
        self.pending_metadata_dir = os.path.join(self.pending_root_dir, 'metadata')
        self.completed_file_dir = os.path.join(self.completed_root_dir, 'files')
        self.completed_metadata_dir = os.path.join(self.completed_root_dir, 'metadata')
        self.completed_report_dir = os.path.join(self.completed_root_dir, 'report')
        
        # Ensure directories exist
        for path in [
            self.pending_root_dir,
            self.pending_file_dir,
            self.pending_metadata_dir,
            self.completed_root_dir,
            self.completed_file_dir,
            self.completed_metadata_dir,
            self.completed_report_dir
        ]:
            os.makedirs(path, exist_ok=True)

    @property
    def db_params(self) -> Dict[str, str]:
        """Get database connection parameters."""
        return {
            'dbname': self.config.get('Database', 'dbname'),
            'user': self.config.get('Database', 'user'),
            'password': self.config.get('Database', 'password'),
            'host': self.config.get('Database', 'host')
        }

    @property
    def ckan_api_url(self) -> str:
        """Get CKAN API URL."""
        return self.config.get('CKAN', 'api_url')

    @property
    def ckan_api_key(self) -> str:
        """Get CKAN API key."""
        return self.config.get('CKAN', 'api_key')

def setup_logging() -> logging.Logger:
    """Configure structured logging with rotation."""
    logger = logging.getLogger('ckan_loader')
    logger.setLevel(logging.INFO)

    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    # Rotating file handler (10MB x 5 backups)
    file_handler = logging.handlers.RotatingFileHandler(
        'datastore_loader.log',
        maxBytes=10*1024*1024,
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setFormatter(formatter)

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger