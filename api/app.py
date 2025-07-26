#!/usr/bin/env python3
"""
Flask API for Ethical AI Governance Toolkit
Provides REST endpoints to run badge generation, dataset fingerprinting, and bias analysis
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import json
import tempfile
import shutil
from datetime import datetime
from pathlib import Path
import pandas as pd
import numpy as np
from werkzeug.utils import secure_filename
import hashlib
import base64
from io import BytesIO
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
from PIL import Image
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import the classes from the three scripts
import sys
import os

# Add parent directory to path so we can import from cli_toolkit and badge_generator
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

# Import from existing modules
try:
    from badge_generator.ethical_badge_generator import EthicalBadgeGenerator
    from cli_toolkit.generate_fingerprint import DatasetFingerprinter
    from cli_toolkit.analyze_bias import BiasAnalyzer
    from api_verification import api_verification_bp
    print("✅ Successfully imported all modules")
except ImportError as e:
    print(f"❌ Warning: Could not import modules: {e}")
    print(f"Current directory: {current_dir}")
    print(f"Parent directory: {parent_dir}")
    print(f"Python path: {sys.path}")
    print("Please ensure the modules are available in cli_toolkit and badge_generator folders")

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access
app.register_blueprint(api_verification_bp)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['RESULTS_FOLDER'] = 'results'
app.config['ALLOWED_EXTENSIONS'] = {'csv', 'xlsx', 'xls', 'json', 'parquet'}

# Create necessary directories
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['RESULTS_FOLDER'], exist_ok=True)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def generate_session_id():
    """Generate unique session ID for file management"""
    return hashlib.md5(str(datetime.now()).encode()).hexdigest()[:16]

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'services': {
            'badge_generator': True,
            'dataset_fingerprinter': True,
            'bias_analyzer': True
        }
    })

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Upload dataset file and return session info"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        
        # Generate session ID and create session folder
        session_id = generate_session_id()
        session_folder = os.path.join(app.config['UPLOAD_FOLDER'], session_id)
        os.makedirs(session_folder, exist_ok=True)
        
        # Save file
        filename = secure_filename(file.filename) if file.filename else 'uploaded_file'
        file_path = os.path.join(session_folder, filename)
        file.save(file_path)
        
        # Get basic file info
        file_stats = os.stat(file_path)
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'filename': filename,
            'file_size': file_stats.st_size,
            'file_size_mb': round(file_stats.st_size / 1024 / 1024, 2),
            'upload_time': datetime.fromtimestamp(file_stats.st_ctime).isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@app.route('/api/badge/generate', methods=['POST'])
def generate_badge():
    """Generate ethical AI badge"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        required_fields = ['model_name', 'category_scores']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        model_name = data['model_name']
        category_scores = data['category_scores']
        threshold = data.get('threshold', 60)
        overall_score = data.get('overall_score')  # Optional overall score
        
        print(f"Generating badge for model: {model_name}")
        print(f"Category scores: {category_scores}")
        if overall_score is not None:
            print(f"Using provided overall score: {overall_score}")
        
        # Validate category scores
        required_categories = ['bias_fairness', 'transparency', 'privacy', 
                             'accountability', 'robustness', 'human_oversight']
        
        for category in required_categories:
            if category not in category_scores:
                return jsonify({'error': f'Missing score for category: {category}'}), 400
            
            score = category_scores[category]
            if not isinstance(score, (int, float)) or not (0 <= score <= 100):
                return jsonify({'error': f'Invalid score for {category}: must be 0-100'}), 400
        
        # Generate badge
        print("Creating EthicalBadgeGenerator instance...")
        generator = EthicalBadgeGenerator()
        
        print("Generating badge data...")
        badge_data = generator.generate_badge_data(model_name, category_scores, threshold, overall_score)
        
        # Create session folder for results
        session_id = generate_session_id()
        results_folder = os.path.join(app.config['RESULTS_FOLDER'], session_id)
        os.makedirs(results_folder, exist_ok=True)
        
        print(f"Saving badge to: {results_folder}")
        # Save badge files
        saved_files = generator.save_badge(badge_data, results_folder, 
                                         formats=['png', 'svg', 'json'])
        
        # Convert PNG to base64 for frontend display
        png_file = next((f for f in saved_files if f.endswith('.png')), None)
        badge_image_base64 = None
        if png_file:
            with open(png_file, 'rb') as img_file:
                badge_image_base64 = base64.b64encode(img_file.read()).decode('utf-8')
        
        # Prepare response
        print("✅ Badge generation completed successfully")
        
        # Convert pandas/numpy types to native Python types for JSON serialization
        def convert_to_serializable(obj):
            if hasattr(obj, 'to_dict'):
                return obj.to_dict()
            elif hasattr(obj, 'item'):
                return obj.item()
            elif isinstance(obj, dict):
                return {k: convert_to_serializable(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_to_serializable(v) for v in obj]
            elif hasattr(obj, 'dtype'):  # numpy/pandas types
                return obj.item() if hasattr(obj, 'item') else str(obj)
            else:
                return obj
        
        # Convert badge data to JSON-serializable format
        serializable_badge_data = convert_to_serializable(badge_data)
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'badge_data': serializable_badge_data,
            'badge_image': badge_image_base64,
            'files': saved_files,
            'summary': {
                'model_name': badge_data['model_name'],
                'overall_score': badge_data['overall_score'],
                'badge_level': badge_data['badge_level'],
                'passes_threshold': badge_data['passes_threshold'],
                'recommendations': badge_data['recommendations']
            }
        })
        
    except Exception as e:
        import traceback
        print(f"❌ Badge generation failed: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': f'Badge generation failed: {str(e)}'}), 500

@app.route('/api/fingerprint/generate', methods=['POST'])
def generate_fingerprint():
    """Generate dataset fingerprint"""
    try:
        data = request.get_json()
        
        if not data or 'session_id' not in data:
            return jsonify({'error': 'Session ID required'}), 400
        
        session_id = data['session_id']
        session_folder = os.path.join(app.config['UPLOAD_FOLDER'], session_id)
        
        print(f"Generating fingerprint for session: {session_id}")
        print(f"Session folder: {session_folder}")
        
        if not os.path.exists(session_folder):
            return jsonify({'error': 'Invalid session ID'}), 400
        
        # Find the dataset file
        files = os.listdir(session_folder)
        if not files:
            return jsonify({'error': 'No dataset file found'}), 400
        
        dataset_file = os.path.join(session_folder, files[0])
        print(f"Dataset file: {dataset_file}")
        
        # Generate fingerprint using existing class
        print("Creating DatasetFingerprinter instance...")
        fingerprinter = DatasetFingerprinter(dataset_file)
        
        print("Loading dataset...")
        fingerprinter.load_dataset()
        
        print("Generating fingerprint...")
        fingerprint_data = fingerprinter.generate_fingerprint()
        
        # Create results folder
        results_folder = os.path.join(app.config['RESULTS_FOLDER'], session_id)
        os.makedirs(results_folder, exist_ok=True)
        
        print(f"Saving fingerprint to: {results_folder}")
        # Save fingerprint
        json_path = fingerprinter.save_fingerprint(
            os.path.join(results_folder, 'fingerprint.json'))
        
        # Generate printable report
        report_content = fingerprinter.generate_printable_report()
        report_path = os.path.join(results_folder, 'fingerprint_report.txt')
        with open(report_path, 'w') as f:
            f.write(report_content)
        
        # Prepare summary for frontend
        summary = {
            'filename': fingerprint_data['file_info']['filename'],
            'file_size_mb': fingerprint_data['file_info']['file_size_mb'],
            'rows': fingerprint_data['schema']['summary_stats']['total_rows'],
            'columns': fingerprint_data['schema']['summary_stats']['total_columns'],
            'null_percentage': fingerprint_data['schema']['summary_stats']['overall_null_percentage'],
            'duplicate_percentage': fingerprint_data['schema']['data_quality']['duplicate_percentage'],
            'file_hash': fingerprint_data['fingerprint_info']['file_hash_sha256'][:16] + '...',
            'generated_at': fingerprint_data['fingerprint_info']['generated_at']
        }
        
        print("✅ Fingerprint generation completed successfully")
        
        # Convert pandas/numpy types to native Python types for JSON serialization
        def convert_to_serializable(obj):
            if hasattr(obj, 'to_dict'):
                return obj.to_dict()
            elif hasattr(obj, 'item'):
                return obj.item()
            elif isinstance(obj, dict):
                return {k: convert_to_serializable(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_to_serializable(v) for v in obj]
            elif hasattr(obj, 'dtype'):  # numpy/pandas types
                return obj.item() if hasattr(obj, 'item') else str(obj)
            else:
                return obj
        
        # Convert fingerprint data to JSON-serializable format
        serializable_fingerprint_data = convert_to_serializable(fingerprint_data)
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'fingerprint_data': serializable_fingerprint_data,
            'report_content': report_content,
            'summary': summary,
            'files': [json_path, report_path]
        })
        
    except Exception as e:
        import traceback
        print(f"❌ Fingerprint generation failed: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': f'Fingerprint generation failed: {str(e)}'}), 500

@app.route('/api/bias/analyze', methods=['POST'])
def analyze_bias():
    """Analyze dataset for bias"""
    try:
        data = request.get_json()
        
        if not data or 'session_id' not in data:
            return jsonify({'error': 'Session ID required'}), 400
        
        session_id = data['session_id']
        protected_attributes = data.get('protected_attributes', [])
        target_column = data.get('target_column')
        
        session_folder = os.path.join(app.config['UPLOAD_FOLDER'], session_id)
        
        print(f"Analyzing bias for session: {session_id}")
        print(f"Session folder: {session_folder}")
        print(f"Protected attributes: {protected_attributes}")
        print(f"Target column: {target_column}")
        
        if not os.path.exists(session_folder):
            return jsonify({'error': 'Invalid session ID'}), 400
        
        # Find the dataset file
        files = os.listdir(session_folder)
        if not files:
            return jsonify({'error': 'No dataset file found'}), 400
        
        dataset_file = os.path.join(session_folder, files[0])
        print(f"Dataset file: {dataset_file}")
        
        # Load dataset
        print("Loading dataset...")
        if dataset_file.endswith('.csv'):
            df = pd.read_csv(dataset_file)
        elif dataset_file.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(dataset_file)
        else:
            return jsonify({'error': 'Unsupported file format for bias analysis'}), 400
        
        print(f"Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")
        
        # Auto-detect protected attributes if not provided
        if not protected_attributes:
            protected_attributes = auto_detect_protected_attributes(df)
            print(f"Auto-detected protected attributes: {protected_attributes}")
        
        # Auto-detect target column if not provided
        if not target_column:
            target_column = auto_detect_target_column(df)
            print(f"Auto-detected target column: {target_column}")
        
        # Initialize bias analyzer with existing class
        print("Creating BiasAnalyzer instance...")
        analyzer = BiasAnalyzer(df, target_col=target_column, 
                               protected_attributes=protected_attributes)
        
        # Create results folder
        results_folder = os.path.join(app.config['RESULTS_FOLDER'], session_id)
        os.makedirs(results_folder, exist_ok=True)
        
        print(f"Results folder: {results_folder}")
        
        # Change to results directory for plot saving
        original_dir = os.getcwd()
        os.chdir(results_folder)
        
        try:
            print("Running bias analysis...")
            # Run analysis using existing methods
            basic_stats = analyzer.basic_statistics()
            print("Basic statistics completed")
            
            missing_stats = analyzer.missing_values_analysis()
            print("Missing values analysis completed")
            
            imbalance_data = analyzer.detect_class_imbalance()
            print("Class imbalance detection completed")
            
            analyzer.protected_attribute_analysis()
            print("Protected attribute analysis completed")
            
            # Generate visualizations
            print("Generating visualizations...")
            analyzer.create_bias_visualizations()
            print("Visualizations completed")
            
            # Generate bias report
            print("Generating bias report...")
            bias_report = analyzer.generate_bias_report()
            print("Bias report completed")
            
            # Get bias score and reasoning
            bias_analysis = analyzer.bias_report.get('bias_score_analysis', {})
            
        finally:
            os.chdir(original_dir)
        
        # Convert visualizations to base64
        plot_files = ['bias_analysis_report.png', 'correlation_heatmap.png']
        plot_images = {}
        
        for plot_file in plot_files:
            plot_path = os.path.join(results_folder, plot_file)
            if os.path.exists(plot_path):
                with open(plot_path, 'rb') as img_file:
                    plot_images[plot_file] = base64.b64encode(img_file.read()).decode('utf-8')
        
        # Prepare summary
        summary = {
            'dataset_shape': [int(df.shape[0]), int(df.shape[1])],  # Convert tuple to list of ints
            'target_column': target_column,
            'protected_attributes': protected_attributes,
            'total_missing_percentage': float((df.isnull().sum().sum() / (df.shape[0] * df.shape[1])) * 100),
            'duplicate_rows': int(df.duplicated().sum()),  # Convert to native int
            'analysis_timestamp': datetime.now().isoformat(),
            'bias_score': bias_analysis.get('bias_score', 0),
            'bias_level': bias_analysis.get('bias_level', 'UNKNOWN'),
            'bias_reasoning': bias_analysis.get('reasoning', [])
        }
        
        # Add bias risk assessment
        risk_level = bias_analysis.get('bias_level', 'UNKNOWN')
        risk_factors = []
        
        if len(imbalance_data) > 0:
            severe_imbalances = sum(1 for col_data in imbalance_data.values()
                                  if col_data.get('min_class_ratio', 1) < 0.05)
            if severe_imbalances > 0:
                risk_factors.append(f"{severe_imbalances} severely imbalanced features")
        
        # Simple check for high missing values - will be handled by convert_to_serializable later
        if hasattr(missing_stats, 'get') and 'Missing_Percentage' in missing_stats:
            high_missing = sum(1 for pct in missing_stats['Missing_Percentage'] if pct > 20)
            if high_missing > 0:
                risk_factors.append(f"{high_missing} columns with >20% missing values")
        
        summary.update({
            'bias_risk_level': risk_level,
            'risk_factors': risk_factors
        })
        
        print("✅ Bias analysis completed successfully")
        
        # Convert pandas/numpy types to native Python types for JSON serialization
        def convert_to_serializable(obj):
            if hasattr(obj, 'to_dict'):
                return obj.to_dict()
            elif hasattr(obj, 'item'):
                return obj.item()
            elif isinstance(obj, dict):
                return {k: convert_to_serializable(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_to_serializable(v) for v in obj]
            elif hasattr(obj, 'dtype'):  # numpy/pandas types
                return obj.item() if hasattr(obj, 'item') else str(obj)
            else:
                return obj
        
        # Convert all data to JSON-serializable format
        serializable_basic_stats = convert_to_serializable(basic_stats)
        serializable_missing_stats = convert_to_serializable(missing_stats)
        serializable_imbalance_data = convert_to_serializable(imbalance_data)
        serializable_summary = convert_to_serializable(summary)
        serializable_bias_analysis = convert_to_serializable(bias_analysis)
        
        # Save bias analysis results to JSON file for comprehensive report
        bias_results = {
            'session_id': session_id,
            'timestamp': datetime.now().isoformat(),
            'summary': serializable_summary,
            'bias_score_analysis': serializable_bias_analysis,
            'basic_statistics': serializable_basic_stats,
            'missing_values': serializable_missing_stats,
            'class_imbalance': serializable_imbalance_data
        }
        
        bias_results_file = os.path.join(results_folder, 'bias_analysis_results.json')
        with open(bias_results_file, 'w') as f:
            json.dump(bias_results, f, indent=2, default=str)
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'bias_report': bias_report,
            'summary': serializable_summary,
            'visualizations': plot_images,
            'basic_statistics': serializable_basic_stats,
            'missing_values': serializable_missing_stats,
            'class_imbalance': serializable_imbalance_data,
            'bias_score_analysis': serializable_bias_analysis
        })
        
    except Exception as e:
        import traceback
        print(f"❌ Bias analysis failed: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': f'Bias analysis failed: {str(e)}'}), 500

def auto_detect_protected_attributes(df):
    """Auto-detect potential protected attributes in the dataset"""
    protected_attributes = []
    
    # Common protected attribute keywords
    protected_keywords = [
        'gender', 'sex', 'male', 'female', 'man', 'woman',
        'race', 'ethnicity', 'ethnic', 'black', 'white', 'asian', 'hispanic', 'latino',
        'age', 'birth', 'year', 'old', 'young',
        'religion', 'religious', 'muslim', 'christian', 'jewish', 'hindu', 'buddhist',
        'disability', 'disabled', 'handicap',
        'income', 'salary', 'wage', 'wealth', 'poor', 'rich',
        'education', 'degree', 'school', 'university', 'college',
        'marital', 'married', 'single', 'divorced',
        'nationality', 'country', 'origin', 'citizen',
        'sexual', 'orientation', 'lgbt', 'gay', 'lesbian', 'bisexual'
    ]
    
    for col in df.columns:
        col_lower = col.lower()
        # Check if column name contains protected keywords
        if any(keyword in col_lower for keyword in protected_keywords):
            protected_attributes.append(col)
        # Check if column has categorical values that might indicate protected attributes
        elif df[col].dtype == 'object' and df[col].nunique() <= 10:
            # Check for common protected attribute values
            unique_values = df[col].dropna().astype(str).str.lower().unique()
            protected_values = [
                'male', 'female', 'm', 'f', 'man', 'woman',
                'white', 'black', 'asian', 'hispanic', 'latino', 'african', 'american',
                'christian', 'muslim', 'jewish', 'hindu', 'buddhist',
                'yes', 'no', 'true', 'false', '1', '0'
            ]
            if any(any(pv in uv for pv in protected_values) for uv in unique_values):
                protected_attributes.append(col)
    
    return list(set(protected_attributes))  # Remove duplicates

def auto_detect_target_column(df):
    """Auto-detect potential target column in the dataset"""
    target_keywords = [
        'target', 'label', 'outcome', 'result', 'prediction', 'class',
        'success', 'failure', 'approved', 'denied', 'accepted', 'rejected',
        'default', 'fraud', 'churn', 'conversion', 'click', 'purchase',
        'income', 'salary', 'price', 'cost', 'value', 'score',
        'rating', 'review', 'satisfaction', 'quality'
    ]
    
    # Look for columns with target-like names
    for col in df.columns:
        col_lower = col.lower()
        if any(keyword in col_lower for keyword in target_keywords):
            return col
    
    # If no obvious target column, look for binary columns
    for col in df.columns:
        if df[col].dtype in ['int64', 'float64']:
            unique_vals = df[col].dropna().unique()
            if len(unique_vals) == 2 and set(unique_vals).issubset({0, 1, True, False}):
                return col
    
    # If still no target found, return None
    return None

@app.route('/api/report/comprehensive', methods=['POST'])
def generate_comprehensive_report():
    """Generate comprehensive report combining all analyses"""
    try:
        data = request.get_json()
        
        if not data or 'session_id' not in data:
            return jsonify({'error': 'Session ID required'}), 400
        
        session_id = data['session_id']
        model_name = data.get('model_name', 'Unknown Model')
        
        # Check if we have results from previous analyses
        results_folder = os.path.join(app.config['RESULTS_FOLDER'], session_id)
        if not os.path.exists(results_folder):
            return jsonify({'error': 'No analysis results found for this session'}), 400
        
        # Look for existing analysis files
        fingerprint_file = os.path.join(results_folder, 'fingerprint.json')
        
        report_sections = []
        
        # Header
        report_sections.append("="*80)
        report_sections.append("COMPREHENSIVE ETHICAL AI GOVERNANCE REPORT")
        report_sections.append("="*80)
        report_sections.append(f"Model: {model_name}")
        report_sections.append(f"Generated: {datetime.now().isoformat()}")
        report_sections.append(f"Session ID: {session_id}")
        report_sections.append("")
        
        # Dataset Fingerprint Section
        if os.path.exists(fingerprint_file):
            with open(fingerprint_file, 'r') as f:
                fingerprint_data = json.load(f)
            
            report_sections.append("DATASET FINGERPRINT")
            report_sections.append("-" * 40)
            report_sections.append(f"Dataset: {fingerprint_data['file_info']['filename']}")
            report_sections.append(f"SHA-256 Hash: {fingerprint_data['fingerprint_info']['file_hash_sha256']}")
            report_sections.append(f"File Size: {fingerprint_data['file_info']['file_size_mb']} MB")
            report_sections.append(f"Dimensions: {fingerprint_data['schema']['summary_stats']['total_rows']:,} rows × {fingerprint_data['schema']['summary_stats']['total_columns']:,} columns")
            report_sections.append(f"Data Quality: {fingerprint_data['schema']['summary_stats']['overall_null_percentage']:.2f}% null values")
            report_sections.append("")
        
        # Look for badge data in results folder
        badge_files = [f for f in os.listdir(results_folder) if f.endswith('.json') and 'badge' in f.lower()]
        if badge_files:
            with open(os.path.join(results_folder, badge_files[0]), 'r') as f:
                badge_data = json.load(f)
            
            report_sections.append("ETHICAL AI BADGE ASSESSMENT")
            report_sections.append("-" * 40)
            report_sections.append(f"Overall Score: {badge_data['overall_score']:.1f}/100")
            report_sections.append(f"Badge Level: {badge_data['badge_level'].upper()}")
            report_sections.append(f"Passes Threshold: {'✓ YES' if badge_data['passes_threshold'] else '✗ NO'}")
            report_sections.append("")
            
            report_sections.append("Category Scores:")
            for category, score in badge_data['category_scores'].items():
                category_name = category.replace('_', ' ').title()
                report_sections.append(f"  {category_name}: {score:.1f}/100")
            report_sections.append("")
            
            if badge_data.get('recommendations'):
                report_sections.append("Recommendations:")
                for rec in badge_data['recommendations']:
                    report_sections.append(f"  • {rec}")
                report_sections.append("")
        
        # Check for bias analysis results
        bias_plots = [f for f in os.listdir(results_folder) if f.endswith('.png')]
        bias_results_file = os.path.join(results_folder, 'bias_analysis_results.json')
        
        if bias_plots or os.path.exists(bias_results_file):
            report_sections.append("BIAS ANALYSIS SUMMARY")
            report_sections.append("-" * 40)
            
            if bias_plots:
                report_sections.append("Bias analysis completed with visualizations generated.")
                report_sections.append(f"Generated {len(bias_plots)} visualization(s):")
                for plot in bias_plots:
                    report_sections.append(f"  • {plot}")
                report_sections.append("")
            
            # Read bias analysis results if available
            if os.path.exists(bias_results_file):
                try:
                    with open(bias_results_file, 'r') as f:
                        bias_results = json.load(f)
                    
                    bias_analysis = bias_results.get('bias_score_analysis', {})
                    summary = bias_results.get('summary', {})
                    
                    report_sections.append("BIAS SCORE ANALYSIS")
                    report_sections.append("-" * 40)
                    report_sections.append(f"Overall Bias Score: {bias_analysis.get('bias_score', 'N/A')}/100")
                    report_sections.append(f"Bias Level: {bias_analysis.get('bias_level', 'UNKNOWN')}")
                    report_sections.append("")
                    
                    # Add detailed reasoning
                    reasoning = bias_analysis.get('reasoning', [])
                    if reasoning:
                        report_sections.append("Detailed Reasoning:")
                        for reason in reasoning:
                            report_sections.append(f"  {reason}")
                        report_sections.append("")
                    
                    # Add penalties breakdown
                    penalties = bias_analysis.get('penalties', {})
                    if penalties:
                        report_sections.append("Penalty Breakdown:")
                        for penalty_type, penalty_value in penalties.items():
                            if penalty_value > 0:
                                penalty_name = penalty_type.replace('_', ' ').title()
                                report_sections.append(f"  • {penalty_name}: -{penalty_value:.1f} points")
                        report_sections.append("")
                    
                    # Add dataset summary
                    if summary:
                        report_sections.append("Dataset Summary:")
                        report_sections.append(f"  • Shape: {summary.get('dataset_shape', 'N/A')}")
                        report_sections.append(f"  • Missing Values: {summary.get('total_missing_percentage', 'N/A'):.2f}%")
                        report_sections.append(f"  • Duplicate Rows: {summary.get('duplicate_rows', 'N/A')}")
                        if summary.get('protected_attributes'):
                            report_sections.append(f"  • Protected Attributes: {', '.join(summary['protected_attributes'])}")
                        report_sections.append("")
                    
                except Exception as e:
                    report_sections.append("BIAS SCORE ANALYSIS")
                    report_sections.append("-" * 40)
                    report_sections.append("Bias analysis completed but results could not be loaded.")
                    report_sections.append(f"Error: {str(e)}")
                    report_sections.append("")
            else:
                report_sections.append("BIAS SCORE ANALYSIS")
                report_sections.append("-" * 40)
                report_sections.append("Bias analysis completed.")
                report_sections.append("Detailed reasoning and score breakdown available in the bias analysis results.")
                report_sections.append("")
        
        # Conclusions and Recommendations
        report_sections.append("CONCLUSIONS AND RECOMMENDATIONS")
        report_sections.append("-" * 40)
        
        # Determine overall compliance level
        overall_compliance = "UNKNOWN"
        if badge_files:
            if badge_data.get('passes_threshold'):
                overall_compliance = "COMPLIANT"
            else:
                overall_compliance = "NON-COMPLIANT"
        
        report_sections.append(f"Overall Compliance Status: {overall_compliance}")
        report_sections.append("")
        
        report_sections.append("Next Steps:")
        report_sections.append("  1. Review all identified issues and recommendations")
        report_sections.append("  2. Implement suggested improvements")
        report_sections.append("  3. Conduct regular audits and monitoring")
        report_sections.append("  4. Document all governance processes")
        report_sections.append("")
        
        report_sections.append("="*80)
        report_sections.append("END OF REPORT")
        report_sections.append("="*80)
        
        # Save comprehensive report
        report_content = "\n".join(report_sections)
        report_path = os.path.join(results_folder, 'comprehensive_report.txt')
        with open(report_path, 'w') as f:
            f.write(report_content)
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'report_content': report_content,
            'report_file': report_path,
            'compliance_status': overall_compliance,
            'generated_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'Report generation failed: {str(e)}'}), 500

@app.route('/api/download/<session_id>/<filename>', methods=['GET'])
def download_file(session_id, filename):
    """Download generated files"""
    try:
        # Check both results and upload folders
        file_path = None
        
        results_path = os.path.join(app.config['RESULTS_FOLDER'], session_id, filename)
        upload_path = os.path.join(app.config['UPLOAD_FOLDER'], session_id, filename)
        
        if os.path.exists(results_path):
            file_path = results_path
        elif os.path.exists(upload_path):
            file_path = upload_path
        else:
            return jsonify({'error': 'File not found'}), 404
        
        return send_file(file_path, as_attachment=True, download_name=filename)
        
    except Exception as e:
        return jsonify({'error': f'Download failed: {str(e)}'}), 500

@app.route('/api/session/<session_id>/files', methods=['GET'])
def list_session_files(session_id):
    """List all files in a session"""
    try:
        files = []
        
        # Check results folder
        results_folder = os.path.join(app.config['RESULTS_FOLDER'], session_id)
        if os.path.exists(results_folder):
            for filename in os.listdir(results_folder):
                file_path = os.path.join(results_folder, filename)
                file_stats = os.stat(file_path)
                files.append({
                    'filename': filename,
                    'type': 'result',
                    'size': file_stats.st_size,
                    'modified': datetime.fromtimestamp(file_stats.st_mtime).isoformat()
                })
        
        # Check upload folder
        upload_folder = os.path.join(app.config['UPLOAD_FOLDER'], session_id)
        if os.path.exists(upload_folder):
            for filename in os.listdir(upload_folder):
                file_path = os.path.join(upload_folder, filename)
                file_stats = os.stat(file_path)
                files.append({
                    'filename': filename,
                    'type': 'upload',
                    'size': file_stats.st_size,
                    'modified': datetime.fromtimestamp(file_stats.st_mtime).isoformat()
                })
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'files': files
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to list files: {str(e)}'}), 500

@app.route('/api/cleanup/<session_id>', methods=['DELETE'])
def cleanup_session(session_id):
    """Clean up session files"""
    try:
        cleanup_count = 0
        
        # Clean up results folder
        results_folder = os.path.join(app.config['RESULTS_FOLDER'], session_id)
        if os.path.exists(results_folder):
            shutil.rmtree(results_folder)
            cleanup_count += 1
        
        # Clean up upload folder
        upload_folder = os.path.join(app.config['UPLOAD_FOLDER'], session_id)
        if os.path.exists(upload_folder):
            shutil.rmtree(upload_folder)
            cleanup_count += 1
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'cleaned_folders': cleanup_count
        })
        
    except Exception as e:
        return jsonify({'error': f'Cleanup failed: {str(e)}'}), 500

@app.errorhandler(413)
def too_large(e):
    return jsonify({'error': 'File too large'}), 413

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("="*60)
    print("ETHICAL AI GOVERNANCE TOOLKIT - FLASK API")
    print("="*60)
    print("Available endpoints:")
    print("  POST /api/upload - Upload dataset file")
    print("  POST /api/badge/generate - Generate ethical AI badge")
    print("  POST /api/fingerprint/generate - Generate dataset fingerprint")
    print("  POST /api/bias/analyze - Analyze dataset for bias")
    print("  POST /api/report/comprehensive - Generate comprehensive report")
    print("  GET  /api/download/<session_id>/<filename> - Download files")
    print("  GET  /api/session/<session_id>/files - List session files")
    print("  DELETE /api/cleanup/<session_id> - Clean up session")
    print("  GET  /api/health - Health check")
    print("="*60)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
