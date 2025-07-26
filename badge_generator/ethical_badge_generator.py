#!/usr/bin/env python3
"""
Ethical AI Badge Generator
Creates visual badges for AI models based on ethical compliance scores
"""

import json
import argparse
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont
import io
import base64
import os
from pathlib import Path

class EthicalBadgeGenerator:
    def __init__(self):
        """Initialize the badge generator with default settings"""
        self.badge_templates = {
            'excellent': {
                'color': '#2E8B57',  # Sea Green
                'text_color': '#FFFFFF',
                'border_color': '#1F5F3F',
                'label': 'EXCELLENT',
                'min_score': 90
            },
            'good': {
                'color': '#4169E1',  # Royal Blue
                'text_color': '#FFFFFF',
                'border_color': '#2E4BC7',
                'label': 'GOOD',
                'min_score': 75
            },
            'satisfactory': {
                'color': '#FFD700',  # Gold
                'text_color': '#000000',
                'border_color': '#E6C200',
                'label': 'SATISFACTORY',
                'min_score': 60
            },
            'needs_improvement': {
                'color': '#FF8C00',  # Dark Orange
                'text_color': '#FFFFFF',
                'border_color': '#E67E00',
                'label': 'NEEDS IMPROVEMENT',
                'min_score': 40
            },
            'insufficient': {
                'color': '#DC143C',  # Crimson
                'text_color': '#FFFFFF',
                'border_color': '#B71C1C',
                'label': 'INSUFFICIENT',
                'min_score': 0
            }
        }
        
        self.ethical_categories = {
            'bias_fairness': 'Bias & Fairness',
            'transparency': 'Transparency',
            'privacy': 'Privacy Protection',
            'accountability': 'Accountability',
            'robustness': 'Robustness',
            'human_oversight': 'Human Oversight'
        }
        
    def calculate_overall_score(self, category_scores):
        """Calculate overall ethical score from category scores"""
        if not category_scores:
            return 0
        
        # Weighted average (can be customized)
        weights = {
            'bias_fairness': 0.25,
            'transparency': 0.15,
            'privacy': 0.20,
            'accountability': 0.15,
            'robustness': 0.15,
            'human_oversight': 0.10
        }
        
        total_weighted_score = 0
        total_weight = 0
        
        for category, score in category_scores.items():
            if category in weights:
                total_weighted_score += score * weights[category]
                total_weight += weights[category]
        
        if total_weight == 0:
            return sum(category_scores.values()) / len(category_scores)
        
        return total_weighted_score / total_weight
    
    def determine_badge_level(self, score):
        """Determine badge level based on score"""
        for level, config in reversed(list(self.badge_templates.items())):
            if score >= config['min_score']:
                return level
        return 'insufficient'
    
    def create_badge_image(self, badge_level, score, model_name, category_scores=None, 
                          width=400, height=300):
        """Create badge image using PIL"""
        
        # Get badge configuration
        config = self.badge_templates[badge_level]
        
        # Create image
        img = Image.new('RGB', (width, height), 'white')
        draw = ImageDraw.Draw(img)
        
        # Try to load fonts, fall back to default if not available
        try:
            title_font = ImageFont.truetype("arial.ttf", 24)
            score_font = ImageFont.truetype("arial.ttf", 48)
            text_font = ImageFont.truetype("arial.ttf", 16)
            small_font = ImageFont.truetype("arial.ttf", 12)
        except:
            try:
                title_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 24)
                score_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 48)
                text_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 16)
                small_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 12)
            except:
                # Use default font
                title_font = ImageFont.load_default()
                score_font = ImageFont.load_default()
                text_font = ImageFont.load_default()
                small_font = ImageFont.load_default()
        
        # Draw border
        border_width = 8
        draw.rectangle([0, 0, width-1, height-1], 
                      outline=config['border_color'], 
                      width=border_width)
        
        # Draw header background
        header_height = 80
        draw.rectangle([border_width, border_width, 
                       width-border_width, header_height], 
                      fill=config['color'])
        
        # Draw title
        title_text = "ETHICAL AI BADGE"
        title_bbox = draw.textbbox((0, 0), title_text, font=title_font)
        title_width = title_bbox[2] - title_bbox[0]
        draw.text(((width - title_width) // 2, 20), title_text, 
                 fill=config['text_color'], font=title_font)
        
        # Draw badge level
        level_text = config['label']
        level_bbox = draw.textbbox((0, 0), level_text, font=text_font)
        level_width = level_bbox[2] - level_bbox[0]
        draw.text(((width - level_width) // 2, 45), level_text, 
                 fill=config['text_color'], font=text_font)
        
        # Draw score circle
        circle_center_x = width // 2
        circle_center_y = 140
        circle_radius = 40
        
        # Draw circle background
        draw.ellipse([circle_center_x - circle_radius, circle_center_y - circle_radius,
                     circle_center_x + circle_radius, circle_center_y + circle_radius],
                    fill=config['color'], outline=config['border_color'], width=3)
        
        # Draw score
        score_text = f"{score:.0f}"
        score_bbox = draw.textbbox((0, 0), score_text, font=score_font)
        score_width = score_bbox[2] - score_bbox[0]
        score_height = score_bbox[3] - score_bbox[1]
        draw.text((circle_center_x - score_width // 2, 
                  circle_center_y - score_height // 2 - 5), 
                 score_text, fill=config['text_color'], font=score_font)
        
        # Draw model name
        model_text = f"Model: {model_name}"
        model_bbox = draw.textbbox((0, 0), model_text, font=text_font)
        model_width = model_bbox[2] - model_bbox[0]
        draw.text(((width - model_width) // 2, 200), model_text, 
                 fill='black', font=text_font)
        
        # Draw category scores if provided
        if category_scores:
            y_start = 230
            for i, (category, cat_score) in enumerate(category_scores.items()):
                if i >= 3:  # Limit to 3 categories for space
                    break
                category_name = self.ethical_categories.get(category, category)
                cat_text = f"{category_name}: {cat_score:.0f}"
                draw.text((20, y_start + i * 15), cat_text, 
                         fill='black', font=small_font)
        
        # Draw timestamp
        timestamp = datetime.now().strftime("%Y-%m-%d")
        timestamp_text = f"Generated: {timestamp}"
        draw.text((20, height - 25), timestamp_text, 
                 fill='gray', font=small_font)
        
        return img
    
    def create_svg_badge(self, badge_level, score, model_name, category_scores=None):
        """Create badge as SVG (scalable vector graphics)"""
        config = self.badge_templates[badge_level]
        
        svg_template = f"""
        <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
            <!-- Background -->
            <rect width="400" height="300" fill="white" stroke="{config['border_color']}" stroke-width="8"/>
            
            <!-- Header -->
            <rect x="8" y="8" width="384" height="72" fill="{config['color']}"/>
            
            <!-- Title -->
            <text x="200" y="35" text-anchor="middle" fill="{config['text_color']}" 
                  font-family="Arial, sans-serif" font-size="24" font-weight="bold">
                ETHICAL AI BADGE
            </text>
            
            <!-- Badge Level -->
            <text x="200" y="60" text-anchor="middle" fill="{config['text_color']}" 
                  font-family="Arial, sans-serif" font-size="16">
                {config['label']}
            </text>
            
            <!-- Score Circle -->
            <circle cx="200" cy="140" r="40" fill="{config['color']}" 
                    stroke="{config['border_color']}" stroke-width="3"/>
            
            <!-- Score Text -->
            <text x="200" y="155" text-anchor="middle" fill="{config['text_color']}" 
                  font-family="Arial, sans-serif" font-size="48" font-weight="bold">
                {score:.0f}
            </text>
            
            <!-- Model Name -->
            <text x="200" y="210" text-anchor="middle" fill="black" 
                  font-family="Arial, sans-serif" font-size="16">
                Model: {model_name}
            </text>
        """
        
        # Add category scores
        if category_scores:
            y_pos = 240
            for i, (category, cat_score) in enumerate(category_scores.items()):
                if i >= 3:  # Limit for space
                    break
                category_name = self.ethical_categories.get(category, category)
                svg_template += f"""
                <text x="20" y="{y_pos}" fill="black" 
                      font-family="Arial, sans-serif" font-size="12">
                    {category_name}: {cat_score:.0f}
                </text>
                """
                y_pos += 15
        
        # Add timestamp
        timestamp = datetime.now().strftime("%Y-%m-%d")
        svg_template += f"""
            <text x="20" y="285" fill="gray" 
                  font-family="Arial, sans-serif" font-size="12">
                Generated: {timestamp}
            </text>
        </svg>
        """
        
        return svg_template
    
    def generate_badge_data(self, model_name, category_scores, threshold=60, overall_score=None):
        """Generate complete badge data including pass/fail determination"""
        if overall_score is not None:
            # Use provided overall score instead of calculating from category scores
            calculated_score = overall_score
        else:
            # Calculate overall score from category scores
            calculated_score = self.calculate_overall_score(category_scores)
            
        badge_level = self.determine_badge_level(calculated_score)
        passes_threshold = calculated_score >= threshold
        
        badge_data = {
            'model_name': model_name,
            'overall_score': calculated_score,
            'badge_level': badge_level,
            'passes_threshold': passes_threshold,
            'threshold': threshold,
            'category_scores': category_scores,
            'badge_config': self.badge_templates[badge_level],
            'generated_at': datetime.now().isoformat(),
            'recommendations': self._generate_recommendations(category_scores, calculated_score)
        }
        
        return badge_data
    
    def _generate_recommendations(self, category_scores, overall_score):
        """Generate recommendations based on scores"""
        recommendations = []
        
        if overall_score < 60:
            recommendations.append("Overall ethical compliance needs significant improvement")
        
        for category, score in category_scores.items():
            category_name = self.ethical_categories.get(category, category)
            if score < 50:
                recommendations.append(f"Critical improvement needed in {category_name}")
            elif score < 70:
                recommendations.append(f"Consider enhancing {category_name} measures")
        
        if not recommendations:
            recommendations.append("Maintain current ethical standards and continue monitoring")
        
        return recommendations
    
    def save_badge(self, badge_data, output_dir="badges", formats=['png', 'svg', 'json']):
        """Save badge in specified formats"""
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        model_name_clean = "".join(c for c in badge_data['model_name'] 
                                 if c.isalnum() or c in (' ', '-', '_')).rstrip()
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        base_filename = f"{model_name_clean}_{badge_data['badge_level']}_{timestamp}"
        
        saved_files = []
        
        # Save PNG
        if 'png' in formats:
            img = self.create_badge_image(
                badge_data['badge_level'],
                badge_data['overall_score'],
                badge_data['model_name'],
                badge_data['category_scores']
            )
            png_path = output_path / f"{base_filename}.png"
            img.save(png_path)
            saved_files.append(str(png_path))
        
        # Save SVG
        if 'svg' in formats:
            svg_content = self.create_svg_badge(
                badge_data['badge_level'],
                badge_data['overall_score'],
                badge_data['model_name'],
                badge_data['category_scores']
            )
            svg_path = output_path / f"{base_filename}.svg"
            with open(svg_path, 'w') as f:
                f.write(svg_content)
            saved_files.append(str(svg_path))
        
        # Save JSON metadata
        if 'json' in formats:
            json_path = output_path / f"{base_filename}.json"
            with open(json_path, 'w') as f:
                json.dump(badge_data, f, indent=2)
            saved_files.append(str(json_path))
        
        return saved_files
    
    def print_badge_summary(self, badge_data):
        """Print a summary of the badge"""
        print("="*60)
        print("ETHICAL AI BADGE SUMMARY")
        print("="*60)
        print(f"Model: {badge_data['model_name']}")
        print(f"Overall Score: {badge_data['overall_score']:.1f}/100")
        print(f"Badge Level: {badge_data['badge_level'].upper()}")
        print(f"Passes Threshold ({badge_data['threshold']}): {'✓ YES' if badge_data['passes_threshold'] else '✗ NO'}")
        
        print(f"\nCategory Scores:")
        for category, score in badge_data['category_scores'].items():
            category_name = self.ethical_categories.get(category, category)
            print(f"  {category_name}: {score:.1f}/100")
        
        print(f"\nRecommendations:")
        for rec in badge_data['recommendations']:
            print(f"  • {rec}")
        
        print(f"\nGenerated: {badge_data['generated_at']}")

def main():
    """Main function for command-line usage"""
    parser = argparse.ArgumentParser(description='Generate Ethical AI Badge')
    parser.add_argument('--model-name', required=True, help='Name of the AI model')
    parser.add_argument('--scores', required=True, help='JSON file with category scores or JSON string')
    parser.add_argument('--threshold', type=float, default=60, help='Minimum score threshold (default: 60)')
    parser.add_argument('--output-dir', default='badges', help='Output directory for badges')
    parser.add_argument('--formats', nargs='+', default=['png', 'svg', 'json'], 
                       choices=['png', 'svg', 'json'], help='Output formats')
    
    args = parser.parse_args()
    
    try:
        # Load scores
        if os.path.isfile(args.scores):
            with open(args.scores, 'r') as f:
                category_scores = json.load(f)
        else:
            category_scores = json.loads(args.scores)
        
        # Generate badge
        generator = EthicalBadgeGenerator()
        badge_data = generator.generate_badge_data(
            args.model_name, 
            category_scores, 
            args.threshold
        )
        
        # Print summary
        generator.print_badge_summary(badge_data)
        
        # Save badge
        saved_files = generator.save_badge(badge_data, args.output_dir, args.formats)
        
        print(f"\n✓ Badge generated and saved:")
        for file_path in saved_files:
            print(f"  {file_path}")
        
        # Show pass/fail status
        if badge_data['passes_threshold']:
            print(f"\n🏆 BADGE AWARDED: {badge_data['badge_level'].upper()}")
        else:
            print(f"\n❌ BADGE NOT AWARDED: Score {badge_data['overall_score']:.1f} below threshold {args.threshold}")
        
    except Exception as e:
        print(f"Error generating badge: {str(e)}")
        return 1
    
    return 0

# Example usage function
def example_usage():
    """Example of how to use the badge generator programmatically"""
    generator = EthicalBadgeGenerator()
    
    # Example scores
    example_scores = {
        'bias_fairness': 85,
        'transparency': 78,
        'privacy': 92,
        'accountability': 73,
        'robustness': 88,
        'human_oversight': 65
    }
    
    # Generate badge
    badge_data = generator.generate_badge_data("ExampleModel_v1.0", example_scores, threshold=75)
    
    # Print summary
    generator.print_badge_summary(badge_data)
    
    # Save badge
    saved_files = generator.save_badge(badge_data)
    print(f"Badge files saved: {saved_files}")

if __name__ == "__main__":
    # Uncomment the next line to run example
    # example_usage()
    
    # Run command-line interface
    exit(main())
