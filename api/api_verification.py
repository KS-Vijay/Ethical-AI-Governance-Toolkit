from flask import Blueprint, request, jsonify
from pymongo import MongoClient
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

api_verification_bp = Blueprint('api_verification', __name__)

# MongoDB connection setup
# Set your MongoDB Atlas connection string as an environment variable
# Example: export MONGODB_URI="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/"
MONGO_URI = os.environ.get('MONGODB_URI')
DB_NAME = os.environ.get('MONGO_DB_NAME', 'test')
COLLECTION_NAME = 'users'

# Initialize MongoDB connection variables
client = None
db = None
api_keys_collection = None

if MONGO_URI:
    logger.info(f"Attempting to connect to MongoDB...")
    logger.info(f"Database: {DB_NAME}")
    logger.info(f"Collection: {COLLECTION_NAME}")
    
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        # Test the connection
        client.admin.command('ping')
        logger.info("✅ MongoDB connection successful")
        db = client[DB_NAME]
        api_keys_collection = db[COLLECTION_NAME]
    except Exception as e:
        logger.error(f"❌ MongoDB connection failed: {e}")
        logger.error("Please check your MONGODB_URI environment variable")
        client = None
        db = None
        api_keys_collection = None
else:
    logger.warning("⚠️ MONGODB_URI environment variable not set. MongoDB features will be disabled.")
    logger.warning("To enable MongoDB, set the MONGODB_URI environment variable with your MongoDB Atlas connection string.")

@api_verification_bp.route('/verify_key', methods=['GET'])
def verify_key():
    """Verify API key with improved error handling and memory management"""
    try:
        # Get API key from query parameters
        api_key = request.args.get('api_key')
        
        # Log the request (without the full API key for security)
        if api_key:
            masked_key = api_key[:8] + "..." + api_key[-4:] if len(api_key) > 12 else "***"
            logger.info(f"Verifying API key: {masked_key}")
        else:
            logger.info("API key verification requested but no key provided")
        
        # Validate API key format
        if not api_key:
            return jsonify({"valid": False, "reason": "API key not provided"}), 400
        
        if not isinstance(api_key, str) or len(api_key) < 10:
            return jsonify({"valid": False, "reason": "Invalid API key format"}), 400
        
        # Check if MongoDB is available
        if api_keys_collection is None:
            logger.warning("MongoDB not available for API key verification")
            return jsonify({"valid": False, "reason": "Database connection not available. Please configure MongoDB."}), 500
        
        # Query database with timeout and error handling
        try:
            record = api_keys_collection.find_one(
                {"apiKey": api_key}, 
                {"email": 1, "name": 1, "company": 1, "_id": 0}
            )
            
            if record:
                logger.info(f"API key verified successfully for user: {record.get('email', 'unknown')}")
                return jsonify({
                    "valid": True, 
                    "email": record.get("email", ""),
                    "name": record.get("name", ""),
                    "company": record.get("company", "")
                })
            else:
                logger.warning(f"API key not found in database: {masked_key}")
                return jsonify({"valid": False, "reason": "API key not found"}), 404
                
        except Exception as db_error:
            logger.error(f"Database query error: {db_error}")
            return jsonify({"valid": False, "reason": "Database query failed"}), 500
            
    except Exception as e:
        logger.error(f"Unexpected error in verify_key: {str(e)}")
        return jsonify({"valid": False, "reason": "Internal server error"}), 500

@api_verification_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for the verification service"""
    try:
        status = {
            "service": "api_verification",
            "status": "healthy",
            "mongodb_connected": api_keys_collection is not None
        }
        
        if api_keys_collection is not None:
            # Test database connection
            try:
                api_keys_collection.find_one()
                status["database_status"] = "connected"
            except Exception as e:
                status["database_status"] = "error"
                status["database_error"] = str(e)
        else:
            status["database_status"] = "not_configured"
            
        return jsonify(status), 200
        
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return jsonify({
            "service": "api_verification",
            "status": "unhealthy",
            "error": str(e)
        }), 500 