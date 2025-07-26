# AI Integrity Hub - Setup Guide

## Overview
This project provides an ethical AI assessment toolkit with a modern web interface and Python backend for dataset analysis.

## Features
- **Bright Professional Theme**: Updated from black/white to a modern blue theme
- **Comprehensive Assessment**: 20-question ethical assessment covering 7 dimensions
- **Dataset Analysis**: Bias analysis and fingerprinting using existing CLI toolkit
- **Badge Generation**: Ethical AI badges based on assessment scores
- **Downloadable Reports**: PDF reports and badge downloads

## Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.8+ and pip
- Git

## Quick Start (Recommended)

### Windows
```bash
# Double-click or run:
start.bat
```

### Linux/Mac
```bash
# Make executable and run:
chmod +x start.sh
./start.sh
```

This will automatically:
1. Install all dependencies
2. Start the Flask API server (port 5000)
3. Start the React development server (port 8080)
4. Open both servers in separate windows

## Manual Setup

### Frontend Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

### Backend Setup

1. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Start Flask API server**:
   ```bash
   cd api
   python app.py
   ```

   The API will run on `http://localhost:5000`

## Project Structure

```
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── pages/             # Page components
│   └── ...
├── api/                   # Flask backend
│   ├── app.py            # Main API server
│   └── ...
├── cli_toolkit/          # Existing Python modules
│   ├── analyze_bias.py   # Bias analysis
│   └── generate_fingerprint.py # Dataset fingerprinting
├── badge_generator/      # Badge generation
│   └── ethical_badge_generator.py
├── start.bat            # Windows startup script
├── start.sh             # Unix/Linux startup script
├── requirements.txt     # Python dependencies
└── SETUP.md            # This file
```

## Usage

1. **Upload Dataset**: Upload a CSV file through the web interface
2. **Complete Assessment**: Answer 20 ethical assessment questions
3. **Analyze**: Click "Analyze" to run bias analysis and fingerprinting
4. **View Report**: See comprehensive results with visualizations
5. **Download**: Download PDF report and ethical badge

## Assessment Dimensions

- **Transparency & Documentation** (20%): Data source documentation, model cards
- **Fairness & Bias** (20%): Demographic balance, bias detection
- **Privacy & Consent** (20%): User consent, PII handling, anonymization
- **Accountability** (15%): Ethical oversight, complaint handling, audit trails
- **Security** (10%): Data security, integrity validation, version control
- **Inclusivity** (10%): Social impact, stakeholder consultation
- **Regulation** (5%): Legal compliance awareness

## API Endpoints

- `POST /api/upload` - Upload dataset file
- `POST /api/bias/analyze` - Run bias analysis
- `POST /api/fingerprint/generate` - Generate dataset fingerprint
- `POST /api/badge/generate` - Generate ethical badge
- `POST /api/report/comprehensive` - Generate comprehensive report
- `GET /api/download/<session_id>/<filename>` - Download files

## Theme Colors

The application now uses a bright, professional blue theme:
- Primary: #2563eb (Bright Blue)
- Secondary: #eff6ff (Blue 50)
- Accent: #1e40af (Blue 800)
- Light: #3b82f6 (Blue 500)
- Dark: #1d4ed8 (Blue 700)

## Troubleshooting

### File Upload Issues
1. **Ensure Flask server is running** on port 5000
2. **Check proxy configuration** in `vite.config.ts`
3. **Verify file format** is supported (CSV, Excel, JSON, Parquet)
4. **Check browser console** for error messages

### API Connection Issues
1. **Verify Flask server** is running: `http://localhost:5000/health`
2. **Check proxy settings** in Vite config
3. **Ensure CORS** is enabled in Flask app
4. **Check firewall** settings

### Import Errors
1. **Install Python dependencies**: `pip install -r requirements.txt`
2. **Verify module paths** in `api/app.py`
3. **Check Python version** (3.8+ required)

### Visualization Errors
1. **Ensure matplotlib backend** is set to 'Agg'
2. **Check file permissions** for output directories
3. **Verify seaborn** is installed

## Development

- **Frontend**: React + TypeScript + Tailwind CSS + Shadcn/ui
- **Backend**: Flask + Pandas + Scikit-learn + Matplotlib
- **State Management**: React Query for API calls
- **Styling**: Tailwind CSS with custom brand colors
- **Proxy**: Vite proxy configuration for API calls

## Ports Used

- **Frontend**: 8080 (http://localhost:8080)
- **Backend**: 5000 (http://localhost:5000)
- **API Proxy**: Configured in vite.config.ts

## File Upload Support

- **CSV**: Comma-separated values
- **Excel**: .xlsx and .xls files
- **JSON**: JavaScript Object Notation
- **Parquet**: Columnar storage format
- **Max Size**: 100MB per file 