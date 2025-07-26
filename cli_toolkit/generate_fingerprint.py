#!/usr/bin/env python3
"""
Dataset Fingerprinting Script for Ethical AI Governance Toolkit
Generates unique SHA-256 hash and comprehensive schema summary for datasets
"""

import pandas as pd
import numpy as np
import hashlib
import json
import os
from datetime import datetime
import argparse
from pathlib import Path

class DatasetFingerprinter:
    def __init__(self, file_path):
        """
        Initialize DatasetFingerprinter
        
        Args:
            file_path: Path to the dataset file
        """
        self.file_path = Path(file_path)
        self.df = None
        self.fingerprint_data = {}
        
    def load_dataset(self):
        """Load dataset from file"""
        try:
            # Determine file type and load accordingly
            if self.file_path.suffix.lower() == '.csv':
                self.df = pd.read_csv(self.file_path)
            elif self.file_path.suffix.lower() in ['.xlsx', '.xls']:
                self.df = pd.read_excel(self.file_path)
            elif self.file_path.suffix.lower() == '.json':
                self.df = pd.read_json(self.file_path)
            elif self.file_path.suffix.lower() == '.parquet':
                self.df = pd.read_parquet(self.file_path)
            else:
                raise ValueError(f"Unsupported file format: {self.file_path.suffix}")
                
            print(f"✓ Dataset loaded successfully: {self.file_path.name}")
            print(f"  Shape: {self.df.shape}")
            
        except Exception as e:
            raise Exception(f"Error loading dataset: {str(e)}")
    
    def generate_file_hash(self):
        """Generate SHA-256 hash of the file"""
        sha256_hash = hashlib.sha256()
        
        try:
            with open(self.file_path, "rb") as f:
                # Read file in chunks to handle large files
                for chunk in iter(lambda: f.read(4096), b""):
                    sha256_hash.update(chunk)
            
            file_hash = sha256_hash.hexdigest()
            print(f"✓ SHA-256 hash generated: {file_hash[:16]}...")
            
            return file_hash
            
        except Exception as e:
            raise Exception(f"Error generating file hash: {str(e)}")
    
    def generate_content_hash(self):
        """Generate SHA-256 hash of the actual data content (order-independent)"""
        try:
            # Sort columns and rows for consistent hashing
            sorted_df = self.df.reindex(sorted(self.df.columns), axis=1)
            sorted_df = sorted_df.sort_values(by=sorted_df.columns.tolist()).reset_index(drop=True)
            
            # Convert to string representation
            content_string = sorted_df.to_string(index=False)
            content_hash = hashlib.sha256(content_string.encode()).hexdigest()
            
            print(f"✓ Content hash generated: {content_hash[:16]}...")
            return content_hash
            
        except Exception as e:
            print(f"⚠️  Warning: Could not generate content hash: {str(e)}")
            return None
    
    def analyze_schema(self):
        """Analyze dataset schema and structure"""
        schema_info = {
            'columns': {},
            'summary_stats': {},
            'data_quality': {}
        }
        
        print("✓ Analyzing dataset schema...")
        
        # Column analysis
        for col in self.df.columns:
            col_info = {
                'dtype': str(self.df[col].dtype),
                'non_null_count': int(self.df[col].count()),
                'null_count': int(self.df[col].isnull().sum()),
                'null_percentage': float(self.df[col].isnull().sum() / len(self.df) * 100),
                'unique_count': int(self.df[col].nunique()),
                'unique_percentage': float(self.df[col].nunique() / len(self.df) * 100)
            }
            
            # Type-specific analysis
            if self.df[col].dtype in ['int64', 'float64', 'int32', 'float32']:
                # Numerical column
                col_info.update({
                    'min': float(self.df[col].min()) if pd.notna(self.df[col].min()) else None,
                    'max': float(self.df[col].max()) if pd.notna(self.df[col].max()) else None,
                    'mean': float(self.df[col].mean()) if pd.notna(self.df[col].mean()) else None,
                    'median': float(self.df[col].median()) if pd.notna(self.df[col].median()) else None,
                    'std': float(self.df[col].std()) if pd.notna(self.df[col].std()) else None,
                    'q25': float(self.df[col].quantile(0.25)) if pd.notna(self.df[col].quantile(0.25)) else None,
                    'q75': float(self.df[col].quantile(0.75)) if pd.notna(self.df[col].quantile(0.75)) else None
                })
            elif self.df[col].dtype == 'object':
                # Categorical/string column
                top_values = self.df[col].value_counts().head(5)
                col_info.update({
                    'top_values': {str(k): int(v) for k, v in top_values.items()},
                    'avg_length': float(self.df[col].astype(str).str.len().mean()) if not self.df[col].isnull().all() else None,
                    'max_length': int(self.df[col].astype(str).str.len().max()) if not self.df[col].isnull().all() else None
                })
            elif self.df[col].dtype in ['datetime64[ns]', 'datetime64[ns, UTC]']:
                # Datetime column
                col_info.update({
                    'min_date': str(self.df[col].min()) if pd.notna(self.df[col].min()) else None,
                    'max_date': str(self.df[col].max()) if pd.notna(self.df[col].max()) else None,
                    'date_range_days': int((self.df[col].max() - self.df[col].min()).days) if pd.notna(self.df[col].min()) and pd.notna(self.df[col].max()) else None
                })
            elif self.df[col].dtype == 'bool':
                # Boolean column
                value_counts = self.df[col].value_counts()
                col_info.update({
                    'true_count': int(value_counts.get(True, 0)),
                    'false_count': int(value_counts.get(False, 0)),
                    'true_percentage': float(value_counts.get(True, 0) / len(self.df) * 100)
                })
            
            schema_info['columns'][col] = col_info
        
        # Overall summary statistics
        schema_info['summary_stats'] = {
            'total_rows': int(len(self.df)),
            'total_columns': int(len(self.df.columns)),
            'memory_usage_mb': float(self.df.memory_usage(deep=True).sum() / 1024 / 1024),
            'total_cells': int(len(self.df) * len(self.df.columns)),
            'total_null_cells': int(self.df.isnull().sum().sum()),
            'overall_null_percentage': float(self.df.isnull().sum().sum() / (len(self.df) * len(self.df.columns)) * 100)
        }
        
        # Data quality metrics
        schema_info['data_quality'] = {
            'columns_with_nulls': int((self.df.isnull().sum() > 0).sum()),
            'columns_all_unique': int((self.df.nunique() == len(self.df)).sum()),
            'columns_single_value': int((self.df.nunique() == 1).sum()),
            'duplicate_rows': int(self.df.duplicated().sum()),
            'duplicate_percentage': float(self.df.duplicated().sum() / len(self.df) * 100)
        }
        
        # Data type distribution
        dtype_counts = self.df.dtypes.value_counts()
        schema_info['data_type_distribution'] = {str(k): int(v) for k, v in dtype_counts.items()}
        
        return schema_info
    
    def generate_fingerprint(self):
        """Generate complete dataset fingerprint"""
        print("="*60)
        print("DATASET FINGERPRINTING")
        print("="*60)
        
        # File information
        file_stats = os.stat(self.file_path)
        
        self.fingerprint_data = {
            'file_info': {
                'filename': self.file_path.name,
                'file_path': str(self.file_path.absolute()),
                'file_size_bytes': int(file_stats.st_size),
                'file_size_mb': round(file_stats.st_size / 1024 / 1024, 2),
                'file_extension': self.file_path.suffix.lower(),
                'creation_time': datetime.fromtimestamp(file_stats.st_ctime).isoformat(),
                'modification_time': datetime.fromtimestamp(file_stats.st_mtime).isoformat()
            },
            'fingerprint_info': {
                'generated_at': datetime.now().isoformat(),
                'generator_version': '1.0.0',
                'file_hash_sha256': self.generate_file_hash(),
                'content_hash_sha256': self.generate_content_hash()
            },
            'schema': self.analyze_schema()
        }
        
        return self.fingerprint_data
    
    def print_fingerprint_summary(self):
        """Print a formatted summary of the fingerprint"""
        print("\n" + "="*60)
        print("DATASET FINGERPRINT SUMMARY")
        print("="*60)
        
        # Header information
        print(f"Dataset: {self.fingerprint_data['file_info']['filename']}")
        print(f"Generated: {self.fingerprint_data['fingerprint_info']['generated_at']}")
        print(f"File Hash (SHA-256): {self.fingerprint_data['fingerprint_info']['file_hash_sha256']}")
        if self.fingerprint_data['fingerprint_info']['content_hash_sha256']:
            print(f"Content Hash (SHA-256): {self.fingerprint_data['fingerprint_info']['content_hash_sha256']}")
        
        print("\n" + "-"*40)
        print("FILE INFORMATION")
        print("-"*40)
        print(f"File Size: {self.fingerprint_data['file_info']['file_size_mb']} MB")
        print(f"File Type: {self.fingerprint_data['file_info']['file_extension']}")
        print(f"Last Modified: {self.fingerprint_data['file_info']['modification_time']}")
        
        print("\n" + "-"*40)
        print("DATASET STRUCTURE")
        print("-"*40)
        stats = self.fingerprint_data['schema']['summary_stats']
        print(f"Rows: {stats['total_rows']:,}")
        print(f"Columns: {stats['total_columns']:,}")
        print(f"Memory Usage: {stats['memory_usage_mb']:.2f} MB")
        print(f"Total Cells: {stats['total_cells']:,}")
        print(f"Null Cells: {stats['total_null_cells']:,} ({stats['overall_null_percentage']:.2f}%)")
        
        print("\n" + "-"*40)
        print("DATA TYPES")
        print("-"*40)
        for dtype, count in self.fingerprint_data['schema']['data_type_distribution'].items():
            print(f"{dtype}: {count} columns")
        
        print("\n" + "-"*40)
        print("DATA QUALITY")
        print("-"*40)
        quality = self.fingerprint_data['schema']['data_quality']
        print(f"Columns with nulls: {quality['columns_with_nulls']}")
        print(f"Duplicate rows: {quality['duplicate_rows']} ({quality['duplicate_percentage']:.2f}%)")
        print(f"Single-value columns: {quality['columns_single_value']}")
        print(f"All-unique columns: {quality['columns_all_unique']}")
        
        print("\n" + "-"*40)
        print("COLUMN DETAILS")
        print("-"*40)
        for col_name, col_info in self.fingerprint_data['schema']['columns'].items():
            print(f"\n{col_name}:")
            print(f"  Type: {col_info['dtype']}")
            print(f"  Non-null: {col_info['non_null_count']:,} ({100-col_info['null_percentage']:.1f}%)")
            print(f"  Unique: {col_info['unique_count']:,} ({col_info['unique_percentage']:.1f}%)")
            
            if col_info['dtype'] in ['int64', 'float64', 'int32', 'float32']:
                if col_info['mean'] is not None:
                    print(f"  Range: {col_info['min']:.2f} to {col_info['max']:.2f}")
                    print(f"  Mean: {col_info['mean']:.2f}, Std: {col_info['std']:.2f}")
            elif col_info['dtype'] == 'object' and 'top_values' in col_info:
                print(f"  Top values: {list(col_info['top_values'].keys())[:3]}")
                if col_info['avg_length']:
                    print(f"  Avg length: {col_info['avg_length']:.1f} chars")
    
    def save_fingerprint(self, output_path=None):
        """Save fingerprint to JSON file"""
        if output_path is None:
            output_path = self.file_path.with_suffix('.fingerprint.json')
        
        try:
            with open(output_path, 'w') as f:
                json.dump(self.fingerprint_data, f, indent=2, default=str)
            
            print(f"\n✓ Fingerprint saved to: {output_path}")
            return output_path
            
        except Exception as e:
            print(f"⚠️  Error saving fingerprint: {str(e)}")
            return None
    
    def generate_printable_report(self):
        """Generate a printable report suitable for attachments"""
        report_lines = []
        report_lines.append("="*80)
        report_lines.append("DATASET FINGERPRINT REPORT")
        report_lines.append("="*80)
        
        # Essential information for reports
        report_lines.append(f"Dataset: {self.fingerprint_data['file_info']['filename']}")
        report_lines.append(f"Generated: {self.fingerprint_data['fingerprint_info']['generated_at']}")
        report_lines.append(f"SHA-256 Hash: {self.fingerprint_data['fingerprint_info']['file_hash_sha256']}")
        report_lines.append(f"File Size: {self.fingerprint_data['file_info']['file_size_mb']} MB")
        
        stats = self.fingerprint_data['schema']['summary_stats']
        report_lines.append(f"Dimensions: {stats['total_rows']:,} rows × {stats['total_columns']:,} columns")
        report_lines.append(f"Data Quality: {stats['overall_null_percentage']:.2f}% null values")
        
        quality = self.fingerprint_data['schema']['data_quality']
        report_lines.append(f"Duplicates: {quality['duplicate_percentage']:.2f}% of rows")
        
        report_lines.append("\nColumn Summary:")
        for col_name, col_info in self.fingerprint_data['schema']['columns'].items():
            report_lines.append(f"  {col_name}: {col_info['dtype']} ({col_info['unique_count']} unique)")
        
        report_lines.append("="*80)
        
        return "\n".join(report_lines)

def main():
    """Main function to run dataset fingerprinting"""
    parser = argparse.ArgumentParser(description='Generate dataset fingerprint')
    parser.add_argument('dataset_file', help='Path to dataset file')
    parser.add_argument('--output', '-o', help='Output path for fingerprint JSON')
    parser.add_argument('--report', '-r', help='Output path for printable report')
    parser.add_argument('--quiet', '-q', action='store_true', help='Suppress detailed output')
    
    args = parser.parse_args()
    
    try:
        # Initialize fingerprinter
        fingerprinter = DatasetFingerprinter(args.dataset_file)
        
        # Load dataset
        fingerprinter.load_dataset()
        
        # Generate fingerprint
        fingerprinter.generate_fingerprint()
        
        # Print summary unless quiet mode
        if not args.quiet:
            fingerprinter.print_fingerprint_summary()
        
        # Save fingerprint
        json_path = fingerprinter.save_fingerprint(args.output)
        
        # Generate and save printable report
        if args.report:
            report_content = fingerprinter.generate_printable_report()
            with open(args.report, 'w') as f:
                f.write(report_content)
            print(f"✓ Printable report saved to: {args.report}")
        else:
            # Print the report content for copying
            print("\n" + "="*60)
            print("PRINTABLE REPORT (for attachment to governance documents)")
            print("="*60)
            print(fingerprinter.generate_printable_report())
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
