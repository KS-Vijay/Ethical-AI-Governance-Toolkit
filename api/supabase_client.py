#!/usr/bin/env python3
"""
Custom Supabase client wrapper for handling compatibility issues
"""

import os
import logging
from typing import Optional, List, Dict, Any
import requests
import json
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)

class SupabaseClient:
    """Custom Supabase client wrapper for storage operations"""
    
    def __init__(self, url: str, key: str):
        self.url = url.rstrip('/')
        self.key = key
        self.headers = {
            'Authorization': f'Bearer {key}',
            'Content-Type': 'application/json',
            'apikey': key
        }
        self.storage_url = f"{self.url}/storage/v1"
        
    def test_connection(self) -> bool:
        """Test if the Supabase connection works"""
        try:
            # Test with a simple API call
            response = requests.get(f"{self.url}/rest/v1/", headers=self.headers)
            return response.status_code in [200, 401, 403]  # Any response means connection works
        except Exception as e:
            logger.error(f"Connection test failed: {e}")
            return False
    
    def list_buckets(self) -> List[Dict[str, Any]]:
        """List all storage buckets"""
        try:
            url = f"{self.storage_url}/bucket"
            logger.info(f"Requesting buckets URL: {url}")
            logger.info(f"Headers: {self.headers}")
            
            response = requests.get(url, headers=self.headers)
            logger.info(f"Buckets response status: {response.status_code}")
            logger.info(f"Buckets response text: {response.text[:200]}...")
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning(f"Failed to list buckets: {response.status_code} - {response.text}")
                return []
        except Exception as e:
            logger.error(f"Error listing buckets: {e}")
            return []
    
    def list_files(self, bucket_name: str, path: str = "") -> List[Dict[str, Any]]:
        """List files in a bucket"""
        try:
            url = f"{self.storage_url}/object/list/{bucket_name}"
            if path:
                url += f"?prefix={path}"
            
            # Add debug logging
            logger.info(f"Requesting URL: {url}")
            logger.info(f"Headers: {self.headers}")
            
            response = requests.get(url, headers=self.headers)
            logger.info(f"Response status: {response.status_code}")
            logger.info(f"Response text: {response.text[:200]}...")
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning(f"Failed to list files: {response.status_code} - {response.text}")
                return []
        except Exception as e:
            logger.error(f"Error listing files: {e}")
            return []
    
    def upload_file(self, bucket_name: str, path: str, file_data: bytes, content_type: str = "application/octet-stream") -> bool:
        """Upload a file to Supabase storage"""
        try:
            url = f"{self.storage_url}/object/{bucket_name}/{path}"
            
            headers = {
                'Authorization': f'Bearer {self.key}',
                'apikey': self.key,
                'Content-Type': content_type
            }
            
            response = requests.post(url, data=file_data, headers=headers)
            
            if response.status_code in [200, 201]:
                logger.info(f"Successfully uploaded {path} to {bucket_name}")
                return True
            else:
                logger.error(f"Failed to upload {path}: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error uploading file: {e}")
            return False
    
    def get_public_url(self, bucket_name: str, path: str) -> str:
        """Get public URL for a file"""
        return f"{self.url}/storage/v1/object/public/{bucket_name}/{path}"
    
    def download_file(self, bucket_name: str, path: str) -> Optional[bytes]:
        """Download a file from Supabase storage"""
        try:
            url = f"{self.storage_url}/object/{bucket_name}/{path}"
            response = requests.get(url, headers=self.headers)
            
            if response.status_code == 200:
                return response.content
            else:
                logger.error(f"Failed to download {path}: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error downloading file: {e}")
            return None
    
    def delete_file(self, bucket_name: str, path: str) -> bool:
        """Delete a file from Supabase storage"""
        try:
            url = f"{self.storage_url}/object/{bucket_name}/{path}"
            response = requests.delete(url, headers=self.headers)
            
            if response.status_code in [200, 204]:
                logger.info(f"Successfully deleted {path} from {bucket_name}")
                return True
            else:
                logger.error(f"Failed to delete {path}: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error deleting file: {e}")
            return False
    
    def create_bucket(self, bucket_name: str, public: bool = True) -> bool:
        """Create a new storage bucket"""
        try:
            url = f"{self.storage_url}/bucket"
            
            data = {
                "id": bucket_name,
                "name": bucket_name,
                "public": public
            }
            
            response = requests.post(url, headers=self.headers, json=data)
            
            if response.status_code in [200, 201]:
                logger.info(f"Successfully created bucket: {bucket_name}")
                return True
            else:
                logger.warning(f"Failed to create bucket {bucket_name}: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error creating bucket: {e}")
            return False

def create_supabase_client(url: str, key: str) -> Optional[SupabaseClient]:
    """Create and test a Supabase client"""
    try:
        client = SupabaseClient(url, key)
        
        # Test the connection
        if client.test_connection():
            logger.info("✅ Supabase client created and connection verified")
            return client
        else:
            logger.warning("⚠️ Supabase connection test failed")
            return None
            
    except Exception as e:
        logger.error(f"❌ Error creating Supabase client: {e}")
        return None

# Global client instance
_supabase_client: Optional[SupabaseClient] = None

def get_supabase_client() -> Optional[SupabaseClient]:
    """Get the global Supabase client instance"""
    global _supabase_client
    
    if _supabase_client is None:
        # Initialize with default credentials
        url = os.environ.get('SUPABASE_URL', 'https://yqqqjizgrzxzrcgprwci.supabase.co')
        # Try different environment variable names for the API key
        key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or os.environ.get('SUPABASE_ANON_KEY')
        if not key:
            logger.warning("⚠️ No API key provided - SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY not found in environment variables")
            return None
        
        _supabase_client = create_supabase_client(url, key)
    
    return _supabase_client 