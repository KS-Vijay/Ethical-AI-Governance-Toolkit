import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ReportData {
  ethicalScore: number;
  assessmentScore: number;
  biasScore: number;
  grade: string;
  dimensions: Array<{
    name: string;
    score: number;
    stars: number;
    weight: number;
    normalizedScore: number;
  }>;
  biasAnalysis: {
    dataset_shape?: number[];
    bias_risk_level?: string;
    total_missing_percentage?: number;
    protected_attributes?: string[];
    biasScore?: number;
    biasLevel?: string;
    biasReasoning?: string[];
    biasPenalties?: Record<string, number>;
  };
  fingerprint: any;
  issuesFlags: string[];
  recommendations: string[];
  badgeUrl?: string;
  biasVisualizations?: any;
  comprehensiveReport?: string;
  sessionId?: string;
}

export const generatePDF = async (reportData: ReportData, fileName: string = 'ethical-ai-report') => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (2 * margin);
  let yPosition = margin;

  // Set font styles
  const titleFontSize = 24;
  const subtitleFontSize = 16;
  const bodyFontSize = 12;
  const smallFontSize = 10;

  // Header
  pdf.setFontSize(titleFontSize);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Ethical AI Assessment Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  pdf.setFontSize(smallFontSize);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Overall Score Section
  pdf.setFontSize(subtitleFontSize);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Overall Ethical Score', margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(titleFontSize);
  pdf.setTextColor(0, 102, 204); // Blue color
  pdf.text(`${reportData.ethicalScore}/100`, margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(bodyFontSize);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Grade: ${reportData.grade}`, margin, yPosition);
  yPosition += 8;
  pdf.text('Combined Score: Assessment (70%) + Bias Analysis (30%)', margin, yPosition);
  yPosition += 20;

  // Individual Scores Section
  pdf.setFontSize(subtitleFontSize);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Individual Scores', margin, yPosition);
  yPosition += 15;

  // Assessment Score
  pdf.setFontSize(bodyFontSize);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Assessment Score:', margin, yPosition);
  yPosition += 8;
  pdf.setFontSize(18);
  pdf.setTextColor(0, 102, 204); // Blue
  pdf.text(`${reportData.assessmentScore}/100`, margin, yPosition);
  yPosition += 8;
  pdf.setFontSize(bodyFontSize);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Based on questionnaire responses', margin, yPosition);
  yPosition += 15;

  // Bias Score
  pdf.setFont('helvetica', 'bold');
  pdf.text('Bias Analysis Score:', margin, yPosition);
  yPosition += 8;
  pdf.setFontSize(18);
  pdf.setTextColor(255, 140, 0); // Orange
  pdf.text(`${reportData.biasScore}/100`, margin, yPosition);
  yPosition += 8;
  pdf.setFontSize(bodyFontSize);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Automated dataset analysis', margin, yPosition);
  yPosition += 20;

  // Check if we need a new page
  if (yPosition > pageHeight - 100) {
    pdf.addPage();
    yPosition = margin;
  }

  // Dimension Breakdown
  pdf.setFontSize(subtitleFontSize);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Dimension Breakdown', margin, yPosition);
  yPosition += 15;

  reportData.dimensions.forEach((dimension) => {
    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(bodyFontSize);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${dimension.name}:`, margin, yPosition);
    yPosition += 8;
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Score: ${dimension.normalizedScore.toFixed(1)}/100`, margin + 10, yPosition);
    yPosition += 8;
    pdf.text(`Weight: ${(dimension.weight * 100).toFixed(0)}%`, margin + 10, yPosition);
    yPosition += 12;
  });

  // Check if we need a new page
  if (yPosition > pageHeight - 100) {
    pdf.addPage();
    yPosition = margin;
  }

  // Bias Analysis Section
  pdf.setFontSize(subtitleFontSize);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Bias Analysis Results', margin, yPosition);
  yPosition += 15;

  if (reportData.biasAnalysis) {
    pdf.setFontSize(bodyFontSize);
    pdf.setFont('helvetica', 'normal');

    // Bias Score and Level
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Bias Score: ${reportData.biasAnalysis.biasScore}/100`, margin, yPosition);
    yPosition += 8;
    pdf.text(`Bias Level: ${reportData.biasAnalysis.biasLevel}`, margin, yPosition);
    yPosition += 12;

    // Dataset Info
    if (reportData.biasAnalysis.dataset_shape) {
      pdf.text(`Dataset Shape: ${reportData.biasAnalysis.dataset_shape[0]} rows × ${reportData.biasAnalysis.dataset_shape[1]} columns`, margin, yPosition);
      yPosition += 8;
    }

    if (reportData.biasAnalysis.total_missing_percentage !== undefined) {
      pdf.text(`Missing Values: ${reportData.biasAnalysis.total_missing_percentage.toFixed(2)}%`, margin, yPosition);
      yPosition += 8;
    }

    if (reportData.biasAnalysis.protected_attributes && reportData.biasAnalysis.protected_attributes.length > 0) {
      pdf.text(`Protected Attributes: ${reportData.biasAnalysis.protected_attributes.join(', ')}`, margin, yPosition);
      yPosition += 12;
    }

    // Bias Reasoning
    if (reportData.biasAnalysis.biasReasoning && reportData.biasAnalysis.biasReasoning.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Bias Score Reasoning:', margin, yPosition);
      yPosition += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(smallFontSize);
      reportData.biasAnalysis.biasReasoning.forEach((reason) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(`• ${reason}`, margin + 5, yPosition);
        yPosition += 6;
      });
      yPosition += 10;
    }

    // Penalties
    if (reportData.biasAnalysis.biasPenalties) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(bodyFontSize);
      pdf.text('Penalty Breakdown:', margin, yPosition);
      yPosition += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(smallFontSize);
      Object.entries(reportData.biasAnalysis.biasPenalties).forEach(([penaltyType, penaltyValue]) => {
        if (penaltyValue > 0) {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = margin;
          }
          const penaltyName = penaltyType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          pdf.text(`• ${penaltyName}: -${penaltyValue.toFixed(1)} points`, margin + 5, yPosition);
          yPosition += 6;
        }
      });
      yPosition += 10;
    }
  }

  // Check if we need a new page
  if (yPosition > pageHeight - 100) {
    pdf.addPage();
    yPosition = margin;
  }

  // Dataset Fingerprint Section
  if (reportData.fingerprint) {
    pdf.setFontSize(subtitleFontSize);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Dataset Fingerprint', margin, yPosition);
    yPosition += 15;

    pdf.setFontSize(bodyFontSize);
    pdf.setFont('helvetica', 'normal');

    if (reportData.fingerprint.file_hash) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Dataset Hash:', margin, yPosition);
      yPosition += 8;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(smallFontSize);
      pdf.text(reportData.fingerprint.file_hash, margin + 10, yPosition);
      yPosition += 12;
      pdf.setFontSize(bodyFontSize);
    }

    if (reportData.fingerprint.file_size_mb) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('File Size:', margin, yPosition);
      yPosition += 8;
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${reportData.fingerprint.file_size_mb} MB`, margin + 10, yPosition);
      yPosition += 12;
    }

    if (reportData.fingerprint.rows && reportData.fingerprint.columns) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Dimensions:', margin, yPosition);
      yPosition += 8;
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${reportData.fingerprint.rows} rows × ${reportData.fingerprint.columns} columns`, margin + 10, yPosition);
      yPosition += 12;
    }

    yPosition += 10;
  }

  // Badge Section (if available)
  if (reportData.badgeUrl) {
    pdf.setFontSize(subtitleFontSize);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Ethical AI Badge', margin, yPosition);
    yPosition += 15;

    try {
      // Convert base64 image to PDF
      const img = new Image();
      img.src = reportData.badgeUrl;
      
      // Wait for image to load
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Calculate image dimensions to fit on page
      const maxWidth = contentWidth;
      const maxHeight = 60;
      const imgAspectRatio = img.width / img.height;
      
      let imgWidth = maxWidth;
      let imgHeight = imgWidth / imgAspectRatio;
      
      if (imgHeight > maxHeight) {
        imgHeight = maxHeight;
        imgWidth = imgHeight * imgAspectRatio;
      }

      // Center the image
      const imgX = margin + (contentWidth - imgWidth) / 2;
      
      // Add image to PDF
      pdf.addImage(img, 'PNG', imgX, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 10;

      pdf.setFontSize(bodyFontSize);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Display this badge on your project to show your commitment to ethical AI', margin, yPosition);
      yPosition += 20;
    } catch (error) {
      console.error('Error adding badge to PDF:', error);
      pdf.setFontSize(bodyFontSize);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Badge generated successfully', margin, yPosition);
      yPosition += 15;
    }
  }

  // Issues and Recommendations
  if (reportData.issuesFlags.length > 0) {
    pdf.setFontSize(subtitleFontSize);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Issues Flagged', margin, yPosition);
    yPosition += 15;

    pdf.setFontSize(bodyFontSize);
    pdf.setFont('helvetica', 'normal');
    reportData.issuesFlags.forEach((issue) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(`• ${issue}`, margin + 5, yPosition);
      yPosition += 8;
    });
    yPosition += 10;
  }

  if (reportData.recommendations.length > 0) {
    pdf.setFontSize(subtitleFontSize);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Recommendations', margin, yPosition);
    yPosition += 15;

    pdf.setFontSize(bodyFontSize);
    pdf.setFont('helvetica', 'normal');
    reportData.recommendations.forEach((recommendation, index) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(`${index + 1}. ${recommendation}`, margin + 5, yPosition);
      yPosition += 8;
    });
  }

  // Footer
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(smallFontSize);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  // Save the PDF
  pdf.save(`${fileName}.pdf`);
}; 