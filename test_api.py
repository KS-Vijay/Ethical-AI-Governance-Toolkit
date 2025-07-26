#!/usr/bin/env python3
"""
Simple test script to verify API endpoints are working
"""

import requests
import json
import time

def test_api():
    base_url = "http://localhost:5000"
    
    print("Testing AI Integrity Hub API...")
    print("=" * 50)
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/api/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("API is running correctly!")
    print("You can now:")
    print("1. Start the frontend: npm run dev")
    print("2. Open http://localhost:8080")
    print("3. Upload a CSV file and test the assessment")
    
    return True

if __name__ == "__main__":
    test_api() 