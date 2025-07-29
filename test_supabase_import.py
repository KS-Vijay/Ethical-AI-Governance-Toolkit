#!/usr/bin/env python3
"""
Test script to check Supabase import
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("🔍 Testing Supabase import...")

try:
    # Try to import websockets.asyncio first to handle the dependency issue
    try:
        import websockets.asyncio
        print("✅ websockets.asyncio imported successfully")
    except ImportError:
        # If websockets.asyncio is not available, try to install it or use a fallback
        print("⚠️ websockets.asyncio not available, trying alternative import...")
        import asyncio
        import websockets
        # Monkey patch if needed
        if not hasattr(websockets, 'asyncio'):
            websockets.asyncio = asyncio
        print("✅ Alternative websockets import successful")
    
    from supabase import create_client, Client
    print("✅ Supabase import successful")
    
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_ANON_KEY')
    
    if supabase_url and supabase_key:
        supabase: Client = create_client(supabase_url, supabase_key)
        print("✅ Supabase client initialized successfully")
    else:
        print("⚠️ Supabase credentials not found in environment variables")
        print("SUPABASE_URL:", supabase_url)
        print("SUPABASE_ANON_KEY:", "***" if supabase_key else "None")
        
except ImportError as e:
    print(f"❌ Supabase import failed: {e}")
except Exception as e:
    print(f"❌ Error initializing Supabase: {e}")

print("🏁 Test completed")