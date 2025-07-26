#!/usr/bin/env python3
"""
Test script for API verification
"""

import os
import sys
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_api_verification():
    """Test the API verification endpoint"""
    
    # Test API key from your database
    test_api_key = "9dee329d-e148-4829-8ab8-67796d9cb5ab"
    
    # Flask API URL (assuming it's running on port 5000)
    base_url = "http://localhost:5000"
    
    print("Testing API Verification...")
    print(f"API Key: {test_api_key[:8]}...{test_api_key[-4:]}")
    print(f"Base URL: {base_url}")
    print("-" * 50)
    
    try:
        # Test the verify_key endpoint
        response = requests.get(f"{base_url}/verify_key", params={"api_key": test_api_key})
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("valid"):
                print("✅ API key verification successful!")
                print(f"User: {data.get('name', 'N/A')}")
                print(f"Email: {data.get('email', 'N/A')}")
                print(f"Company: {data.get('company', 'N/A')}")
            else:
                print("❌ API key verification failed!")
                print(f"Reason: {data.get('reason', 'Unknown')}")
        else:
            print(f"❌ Request failed with status code: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the Flask API")
        print("Make sure the Flask API is running on port 5000")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_health_check():
    """Test the health check endpoint"""
    
    base_url = "http://localhost:5000"
    
    print("\nTesting Health Check...")
    print("-" * 50)
    
    try:
        response = requests.get(f"{base_url}/health")
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Health check successful!")
            print(f"MongoDB Connected: {data.get('mongodb_connected', 'N/A')}")
            print(f"Database Status: {data.get('database_status', 'N/A')}")
        else:
            print(f"❌ Health check failed with status code: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the Flask API")
        print("Make sure the Flask API is running on port 5000")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    print("API Verification Test Script")
    print("=" * 50)
    
    # Check if MONGODB_URI is set
    mongodb_uri = os.environ.get('MONGODB_URI')
    if mongodb_uri:
        print(f"✅ MONGODB_URI is set: {mongodb_uri[:20]}...")
    else:
        print("❌ MONGODB_URI is not set!")
        print("Please set the MONGODB_URI environment variable")
        sys.exit(1)
    
    # Run tests
    test_health_check()
    test_api_verification() 