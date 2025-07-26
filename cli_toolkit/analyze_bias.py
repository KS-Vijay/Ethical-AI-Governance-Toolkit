#!/usr/bin/env python3
"""
Bias Analysis Script for Ethical AI Governance Toolkit
Analyzes datasets for various types of bias and fairness issues
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
from sklearn.metrics import confusion_matrix, classification_report
import warnings
warnings.filterwarnings('ignore')

class BiasAnalyzer:
    def __init__(self, df, target_col=None, protected_attributes=None):
        """
        Initialize BiasAnalyzer
        
        Args:
            df: pandas DataFrame
            target_col: name of target/outcome column
            protected_attributes: list of protected attribute column names
        """
        self.df = df.copy()
        self.target_col = target_col
        self.protected_attributes = protected_attributes or []
        self.bias_report = {}
        
    def basic_statistics(self):
        """Show basic dataset statistics and class distributions"""
        print("="*60)
        print("BASIC DATASET STATISTICS")
        print("="*60)
        
        print(f"Dataset shape: {self.df.shape}")
        print(f"Number of features: {self.df.shape[1]}")
        print(f"Number of samples: {self.df.shape[0]}")
        
        # Data types
        print("\nData Types:")
        print(self.df.dtypes.value_counts())
        
        # Target distribution if provided
        if self.target_col and self.target_col in self.df.columns:
            print(f"\nTarget Variable ({self.target_col}) Distribution:")
            target_dist = self.df[self.target_col].value_counts(normalize=True)
            print(target_dist)
            
            # Store in report
            self.bias_report['target_distribution'] = target_dist.to_dict()
        
        return self.df.describe()
    
    def missing_values_analysis(self):
        """Analyze missing values and potential bias"""
        print("\n" + "="*60)
        print("MISSING VALUES ANALYSIS")
        print("="*60)
        
        missing_stats = pd.DataFrame({
            'Missing_Count': self.df.isnull().sum(),
            'Missing_Percentage': (self.df.isnull().sum() / len(self.df)) * 100
        })
        missing_stats = missing_stats[missing_stats['Missing_Count'] > 0]
        missing_stats = missing_stats.sort_values('Missing_Percentage', ascending=False)
        
        if len(missing_stats) == 0:
            print("No missing values found!")
        else:
            print("Missing Values Summary:")
            print(missing_stats)
            
            # Flag columns with high missing percentages
            high_missing = missing_stats[missing_stats['Missing_Percentage'] > 20]
            if len(high_missing) > 0:
                print(f"\n⚠️  WARNING: Columns with >20% missing values:")
                for col in high_missing.index:
                    print(f"   - {col}: {high_missing.loc[col, 'Missing_Percentage']:.1f}%")
        
        self.bias_report['missing_values'] = missing_stats.to_dict()
        return missing_stats
    
    def detect_class_imbalance(self, threshold=0.1):
        """Detect columns with major class imbalance"""
        print("\n" + "="*60)
        print("CLASS IMBALANCE DETECTION")
        print("="*60)
        
        imbalanced_cols = {}
        
        for col in self.df.columns:
            if self.df[col].dtype == 'object' or self.df[col].nunique() <= 10:
                value_counts = self.df[col].value_counts(normalize=True)
                
                # Check if any class has less than threshold representation
                min_class_ratio = value_counts.min()
                max_class_ratio = value_counts.max()
                
                if min_class_ratio < threshold:
                    imbalanced_cols[col] = {
                        'min_class_ratio': min_class_ratio,
                        'max_class_ratio': max_class_ratio,
                        'distribution': value_counts.to_dict()
                    }
                    
                    print(f"\n⚠️  IMBALANCE DETECTED in '{col}':")
                    print(f"   Minority class: {min_class_ratio:.1%}")
                    print(f"   Majority class: {max_class_ratio:.1%}")
                    print("   Distribution:")
                    for val, ratio in value_counts.items():
                        print(f"     {val}: {ratio:.1%}")
        
        if not imbalanced_cols:
            print("No major class imbalances detected!")
        
        self.bias_report['class_imbalance'] = imbalanced_cols
        return imbalanced_cols
    
    def protected_attribute_analysis(self):
        """Analyze protected attributes for bias"""
        if not self.protected_attributes:
            print("\n⚠️  No protected attributes specified for analysis")
            return
        
        print("\n" + "="*60)
        print("PROTECTED ATTRIBUTE ANALYSIS")
        print("="*60)
        
        for attr in self.protected_attributes:
            if attr not in self.df.columns:
                print(f"⚠️  Protected attribute '{attr}' not found in dataset")
                continue
                
            print(f"\nAnalyzing protected attribute: {attr}")
            
            # Distribution of protected attribute
            attr_dist = self.df[attr].value_counts(normalize=True)
            print(f"Distribution:")
            for val, ratio in attr_dist.items():
                print(f"  {val}: {ratio:.1%}")
            
            # If target column exists, check for bias
            if self.target_col and self.target_col in self.df.columns:
                self._check_statistical_parity(attr)
                self._check_equalized_odds(attr)
    
    def _check_statistical_parity(self, protected_attr):
        """Check for statistical parity bias"""
        if self.target_col not in self.df.columns:
            return
        
        print(f"\n  Statistical Parity Analysis for {protected_attr}:")
        
        # Check if target column is categorical or numeric
        target_dtype = self.df[self.target_col].dtype
        is_categorical = target_dtype == 'object' or target_dtype.name == 'category'
        
        if is_categorical:
            # For categorical targets, analyze distribution differences
            print(f"    Target column '{self.target_col}' is categorical - analyzing distribution differences")
            
            # Get value counts for each group
            group_distributions = {}
            for group_val in self.df[protected_attr].unique():
                group_data = self.df[self.df[protected_attr] == group_val]
                group_distributions[group_val] = group_data[self.target_col].value_counts(normalize=True)
            
            # Find the most common category for each group
            most_common_by_group = {}
            for group_val, dist in group_distributions.items():
                most_common = dist.idxmax()
                most_common_rate = dist.max()
                most_common_by_group[group_val] = (most_common, most_common_rate)
                print(f"    {group_val}: {most_common} ({most_common_rate:.1%})")
            
            # Calculate distribution difference for the most common category
            rates = [rate for _, rate in most_common_by_group.values()]
            max_rate = max(rates)
            min_rate = min(rates)
            parity_diff = max_rate - min_rate
            
            print(f"    Distribution Difference: {parity_diff:.3f}")
            
            if parity_diff > 0.2:  # 20% threshold for categorical data
                print("    ⚠️  BIAS DETECTED: Significant difference in category distributions")
            else:
                print("    ✓ No significant distribution bias detected")
        else:
            # For numeric targets, calculate mean rates
            try:
                groups = self.df.groupby(protected_attr)[self.target_col].agg(['mean', 'count'])
                
                for group_val, row in groups.iterrows():
                    print(f"    {group_val}: {row['mean']:.1%} positive rate (n={row['count']})")
                
                # Calculate statistical parity difference
                rates = groups['mean']
                max_rate = rates.max()
                min_rate = rates.min()
                parity_diff = max_rate - min_rate
                
                print(f"    Statistical Parity Difference: {parity_diff:.3f}")
                
                if parity_diff > 0.1:  # 10% threshold
                    print("    ⚠️  BIAS DETECTED: Significant difference in positive rates")
                else:
                    print("    ✓ No significant statistical parity bias detected")
            except Exception as e:
                print(f"    ❌ Error in statistical parity analysis: {str(e)}")
                print("    Skipping this analysis due to data type incompatibility")
    
    def _check_equalized_odds(self, protected_attr):
        """Check for equalized odds bias (if predictions available)"""
        # This would require prediction data - placeholder for now
        print(f"  Note: Equalized odds analysis requires prediction data")
    
    def fairness_metrics(self, predictions_col=None):
        """Calculate various fairness metrics"""
        if not predictions_col or predictions_col not in self.df.columns:
            print("\n⚠️  Predictions column not provided - skipping fairness metrics")
            return
        
        print("\n" + "="*60)
        print("FAIRNESS METRICS")
        print("="*60)
        
        for attr in self.protected_attributes:
            if attr not in self.df.columns:
                continue
                
            print(f"\nFairness metrics for {attr}:")
            
            for group_val in self.df[attr].unique():
                group_data = self.df[self.df[attr] == group_val]
                
                if self.target_col in self.df.columns:
                    # True Positive Rate
                    tpr = ((group_data[predictions_col] == 1) & 
                           (group_data[self.target_col] == 1)).sum() / \
                          (group_data[self.target_col] == 1).sum()
                    
                    # False Positive Rate  
                    fpr = ((group_data[predictions_col] == 1) & 
                           (group_data[self.target_col] == 0)).sum() / \
                          (group_data[self.target_col] == 0).sum()
                    
                    print(f"  {group_val}:")
                    print(f"    True Positive Rate: {tpr:.3f}")
                    print(f"    False Positive Rate: {fpr:.3f}")
    
    def create_bias_visualizations(self):
        """Create visualizations for bias analysis"""
        print("\n" + "="*60)
        print("GENERATING BIAS VISUALIZATIONS")
        print("="*60)
        
        # Set up the plotting style
        plt.style.use('default')
        sns.set_palette("husl")
        
        # Calculate number of subplots needed
        n_plots = 1  # Missing values plot
        if self.target_col and self.target_col in self.df.columns:
            n_plots += 1  # Target distribution
        n_plots += len(self.protected_attributes)  # Protected attributes
        
        # Create subplots
        fig, axes = plt.subplots(2, 2, figsize=(15, 12))
        axes = axes.flatten()
        
        plot_idx = 0
        
        # 1. Missing values heatmap
        if plot_idx < len(axes):
            missing_data = self.df.isnull()
            if missing_data.any().any():
                sns.heatmap(missing_data, yticklabels=False, cbar=True, 
                           cmap='viridis', ax=axes[plot_idx])
                axes[plot_idx].set_title('Missing Values Heatmap')
            else:
                axes[plot_idx].text(0.5, 0.5, 'No Missing Values', 
                                  transform=axes[plot_idx].transAxes, 
                                  ha='center', va='center', fontsize=14)
                axes[plot_idx].set_title('Missing Values Analysis')
            plot_idx += 1
        
        # 2. Target distribution
        if self.target_col and self.target_col in self.df.columns and plot_idx < len(axes):
            target_counts = self.df[self.target_col].value_counts()
            axes[plot_idx].pie(target_counts.values, labels=target_counts.index, 
                              autopct='%1.1f%%', startangle=90)
            axes[plot_idx].set_title(f'Target Variable Distribution\n({self.target_col})')
            plot_idx += 1
        
        # 3. Protected attributes analysis
        for attr in self.protected_attributes[:2]:  # Limit to first 2 for space
            if attr in self.df.columns and plot_idx < len(axes):
                attr_counts = self.df[attr].value_counts()
                axes[plot_idx].bar(range(len(attr_counts)), attr_counts.values)
                axes[plot_idx].set_xticks(range(len(attr_counts)))
                axes[plot_idx].set_xticklabels(attr_counts.index, rotation=45)
                axes[plot_idx].set_title(f'Distribution of {attr}')
                axes[plot_idx].set_ylabel('Count')
                plot_idx += 1
        
        # Hide unused subplots
        for i in range(plot_idx, len(axes)):
            axes[i].set_visible(False)
        
        plt.tight_layout()
        plt.savefig('bias_analysis_report.png', dpi=300, bbox_inches='tight')
        plt.show()
        
        # Additional correlation heatmap for numerical features
        numerical_cols = self.df.select_dtypes(include=[np.number]).columns
        if len(numerical_cols) > 1:
            plt.figure(figsize=(10, 8))
            correlation_matrix = self.df[numerical_cols].corr()
            sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', center=0,
                       square=True, fmt='.2f')
            plt.title('Feature Correlation Matrix')
            plt.tight_layout()
            plt.savefig('correlation_heatmap.png', dpi=300, bbox_inches='tight')
            plt.show()
    
    def calculate_bias_score_with_reasoning(self):
        """Calculate bias score and provide detailed reasoning"""
        bias_score = 100  # Start with perfect score
        reasoning = []
        
        # Factor 1: Missing Values Impact (up to 25 points)
        missing_penalty = 0
        if 'missing_values' in self.bias_report:
            high_missing_cols = []
            for col, pct in self.bias_report['missing_values']['Missing_Percentage'].items():
                if pct > 20:
                    high_missing_cols.append((col, pct))
                    missing_penalty += min(5, pct / 4)  # Up to 5 points per column
            
            if high_missing_cols:
                reasoning.append(f"Missing Values: -{missing_penalty:.1f} points")
                reasoning.append("  • High missing values can introduce bias by excluding certain groups")
                for col, pct in high_missing_cols:
                    reasoning.append(f"    - {col}: {pct:.1f}% missing values")
        
        bias_score -= missing_penalty
        
        # Factor 2: Class Imbalance Impact (up to 30 points)
        imbalance_penalty = 0
        if 'class_imbalance' in self.bias_report and self.bias_report['class_imbalance']:
            severe_imbalances = []
            moderate_imbalances = []
            
            for col, data in self.bias_report['class_imbalance'].items():
                min_ratio = data['min_class_ratio']
                if min_ratio < 0.05:  # Severe imbalance
                    severe_imbalances.append((col, min_ratio))
                    imbalance_penalty += 10
                elif min_ratio < 0.1:  # Moderate imbalance
                    moderate_imbalances.append((col, min_ratio))
                    imbalance_penalty += 5
            
            if severe_imbalances or moderate_imbalances:
                reasoning.append(f"Class Imbalance: -{imbalance_penalty:.1f} points")
                reasoning.append("  • Class imbalance can lead to biased model predictions")
                if severe_imbalances:
                    reasoning.append("  • Severe imbalances detected:")
                    for col, ratio in severe_imbalances:
                        reasoning.append(f"    - {col}: minority class = {ratio:.1%}")
                if moderate_imbalances:
                    reasoning.append("  • Moderate imbalances detected:")
                    for col, ratio in moderate_imbalances:
                        reasoning.append(f"    - {col}: minority class = {ratio:.1%}")
        
        bias_score -= imbalance_penalty
        
        # Factor 3: Protected Attribute Analysis (up to 25 points)
        protected_penalty = 0
        if self.protected_attributes and self.target_col:
            for attr in self.protected_attributes:
                if attr in self.df.columns:
                    try:
                        # Check if target column is categorical or numeric
                        target_dtype = self.df[self.target_col].dtype
                        is_categorical = target_dtype == 'object' or target_dtype.name == 'category'
                        
                        if is_categorical:
                            # For categorical targets, analyze distribution differences
                            group_distributions = {}
                            for group_val in self.df[attr].unique():
                                group_data = self.df[self.df[attr] == group_val]
                                group_distributions[group_val] = group_data[self.target_col].value_counts(normalize=True)
                            
                            # Find the most common category for each group
                            most_common_rates = []
                            for group_val, dist in group_distributions.items():
                                most_common_rate = dist.max()
                                most_common_rates.append(most_common_rate)
                            
                            if most_common_rates:
                                parity_diff = max(most_common_rates) - min(most_common_rates)
                                
                                if parity_diff > 0.3:  # Severe bias for categorical
                                    protected_penalty += 10
                                    reasoning.append(f"Protected Attribute Bias ({attr}): -10 points")
                                    reasoning.append(f"  • Severe distribution bias detected: {parity_diff:.3f}")
                                elif parity_diff > 0.2:  # Moderate bias for categorical
                                    protected_penalty += 5
                                    reasoning.append(f"Protected Attribute Bias ({attr}): -5 points")
                                    reasoning.append(f"  • Moderate distribution bias detected: {parity_diff:.3f}")
                        else:
                            # For numeric targets, calculate mean rates
                            groups = self.df.groupby(attr)[self.target_col].agg(['mean', 'count'])
                            if len(groups) > 1:
                                rates = groups['mean']
                                parity_diff = rates.max() - rates.min()
                                
                                if parity_diff > 0.2:  # Severe bias
                                    protected_penalty += 10
                                    reasoning.append(f"Protected Attribute Bias ({attr}): -10 points")
                                    reasoning.append(f"  • Severe statistical parity bias detected: {parity_diff:.3f}")
                                elif parity_diff > 0.1:  # Moderate bias
                                    protected_penalty += 5
                                    reasoning.append(f"Protected Attribute Bias ({attr}): -5 points")
                                    reasoning.append(f"  • Moderate statistical parity bias detected: {parity_diff:.3f}")
                    except Exception as e:
                        # Skip this attribute if analysis fails
                        reasoning.append(f"Protected Attribute Analysis ({attr}): Skipped due to data type incompatibility")
                        continue
        
        bias_score -= protected_penalty
        
        # Factor 4: Dataset Size and Quality (up to 20 points)
        size_penalty = 0
        if len(self.df) < 1000:
            size_penalty += 10
            reasoning.append("Dataset Size: -10 points")
            reasoning.append("  • Small dataset size may not represent all groups adequately")
        elif len(self.df) < 5000:
            size_penalty += 5
            reasoning.append("Dataset Size: -5 points")
            reasoning.append("  • Moderate dataset size - consider larger sample for better representation")
        
        bias_score -= size_penalty
        
        # Ensure score is within bounds
        bias_score = max(0, min(100, bias_score))
        
        # Determine bias level
        if bias_score >= 80:
            bias_level = "LOW"
        elif bias_score >= 60:
            bias_level = "MODERATE"
        else:
            bias_level = "HIGH"
        
        return {
            'bias_score': round(bias_score, 1),
            'bias_level': bias_level,
            'reasoning': reasoning,
            'penalties': {
                'missing_values': missing_penalty,
                'class_imbalance': imbalance_penalty,
                'protected_attributes': protected_penalty,
                'dataset_size': size_penalty
            }
        }

    def generate_bias_report(self):
        """Generate comprehensive bias report"""
        print("\n" + "="*60)
        print("BIAS ANALYSIS SUMMARY REPORT")
        print("="*60)
        
        # Calculate bias score with reasoning
        bias_analysis = self.calculate_bias_score_with_reasoning()
        
        print(f"Overall Bias Score: {bias_analysis['bias_score']}/100")
        print(f"Bias Level: {bias_analysis['bias_level']}")
        print()
        
        print("Detailed Reasoning:")
        if bias_analysis['reasoning']:
            for reason in bias_analysis['reasoning']:
                print(f"  {reason}")
        else:
            print("  • No significant bias factors detected")
        
        print()
        
        # Overall bias risk assessment
        risk_level = bias_analysis['bias_level']
        risk_factors = []
        
        # Check for high missing values
        if 'missing_values' in self.bias_report:
            high_missing = sum(1 for pct in self.bias_report['missing_values']['Missing_Percentage'].values() 
                             if pct > 20)
            if high_missing > 0:
                risk_factors.append(f"{high_missing} columns with >20% missing values")
        
        # Check for class imbalances
        if 'class_imbalance' in self.bias_report and self.bias_report['class_imbalance']:
            severe_imbalances = sum(1 for col_data in self.bias_report['class_imbalance'].values()
                                  if col_data['min_class_ratio'] < 0.05)
            if severe_imbalances > 0:
                risk_factors.append(f"{severe_imbalances} severely imbalanced features")
        
        print(f"Overall Bias Risk Level: {risk_level}")
        
        if risk_factors:
            print("\nRisk Factors Identified:")
            for factor in risk_factors:
                print(f"  • {factor}")
        
        print("\nRecommendations:")
        if risk_level == "HIGH":
            print("  • Immediate action required to address bias issues")
            print("  • Consider data collection improvements")
            print("  • Implement bias mitigation techniques")
            print("  • Review data preprocessing pipeline")
        elif risk_level == "MODERATE":
            print("  • Monitor for bias in model predictions")
            print("  • Consider preprocessing techniques")
            print("  • Implement fairness-aware algorithms")
        else:
            print("  • Continue monitoring for bias")
            print("  • Regular bias audits recommended")
            print("  • Consider expanding dataset diversity")
        
        # Store bias analysis in report
        self.bias_report['bias_score_analysis'] = bias_analysis
        
        return self.bias_report

def main():
    """Main function to run bias analysis"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Analyze dataset for bias')
    parser.add_argument('csv_file', help='Path to CSV file')
    parser.add_argument('--target', help='Target column name')
    parser.add_argument('--protected', nargs='+', help='Protected attribute column names')
    parser.add_argument('--predictions', help='Predictions column name (if available)')
    
    args = parser.parse_args()
    
    try:
        # Load data
        print(f"Loading data from {args.csv_file}...")
        df = pd.read_csv(args.csv_file)
        
        # Initialize analyzer
        analyzer = BiasAnalyzer(df, target_col=args.target, 
                               protected_attributes=args.protected)
        
        # Run analysis
        analyzer.basic_statistics()
        analyzer.missing_values_analysis()
        analyzer.detect_class_imbalance()
        analyzer.protected_attribute_analysis()
        
        if args.predictions:
            analyzer.fairness_metrics(args.predictions)
        
        analyzer.create_bias_visualizations()
        analyzer.generate_bias_report()
        
        print(f"\n✓ Analysis complete! Visualizations saved as PNG files.")
        
    except FileNotFoundError:
        print(f"Error: File '{args.csv_file}' not found.")
    except Exception as e:
        print(f"Error during analysis: {str(e)}")

if __name__ == "__main__":
    main()
