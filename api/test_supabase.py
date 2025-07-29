#!/usr/bin/env python3
"""
Test script to check Supabase connection
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Get environment variables
supabase_url = os.environ.get('SUPABASE_URL')
supabase_key = os.environ.get('SUPABASE_ANON_KEY')

print(f"SUPABASE_URL: {supabase_url}")
print(f"SUPABASE_ANON_KEY: {supabase_key[:20]}..." if supabase_key else "None")

if supabase_url and supabase_key:
    try:
        from supabase import create_client, Client
        supabase: Client = create_client(supabase_url, supabase_key)
        print("✅ Supabase client initialized successfully")
        
        # Test a simple query
        result = supabase.table('fairsight_reports').select('*').limit(1).execute()
        print(f"✅ Database connection successful. Found {len(result.data)} records")
        
    except Exception as e:
        print(f"❌ Error connecting to Supabase: {e}")
else:
    print("❌ Supabase credentials not found in environment variables") 