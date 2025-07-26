import React from "react";
import { motion } from "framer-motion";
import { Download, Star, AlertTriangle, CheckCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportData as PDFReportData } from "@/utils/pdfGenerator";

interface DimensionScore {
  name: string;
  score: number;
  stars: number;
  weight: number;
}

interface ReportData extends PDFReportData {
  fingerprint: any;
  biasVisualizations?: any;
  comprehensiveReport?: string;
  sessionId?: string;
}

interface ReportViewerProps {
  reportData: ReportData;
  onDownloadPDF: () => void;
  onDownloadBadge: () => void;
}

const ReportViewer: React.FC<ReportViewerProps> = ({
  reportData,
  onDownloadPDF,
  onDownloadBadge,
}) => {
  const getGradeColor = (grade: string) => {
    switch (grade.toLowerCase()) {
      case "gold":
        return "bg-yellow-500";
      case "silver":
        return "bg-gray-400";
      case "bronze":
        return "bg-yellow-700";
      default:
        return "bg-gray-500";
    }
  };

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < count ? "text-yellow-400 fill-current" : "text-gray-500"}`}
      />
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto p-6 space-y-6 text-white"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-cyan-300 mb-2">Ethical AI Assessment Report</h2>
        <p className="text-sm text-gray-400">
          Comprehensive analysis of your dataset and AI model
        </p>
      </div>

      {/* Overall Score */}
      <Card className="bg-[#121e36]/80 border border-cyan-700 shadow-2xl backdrop-blur-md">
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-4xl font-bold text-cyan-300">{reportData.ethicalScore}/100</div>
            <Badge
              className={`text-white px-4 py-2 text-lg shadow-md ${getGradeColor(
                reportData.grade
              )}`}
            >
              {reportData.grade}
            </Badge>
          </div>
          <h3 className="text-xl font-semibold text-white">Combined Ethical Score</h3>
          <p className="text-sm text-gray-400 mt-2">
            Assessment (70%) + Bias Analysis (30%)
          </p>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#101b30]/80 border border-blue-600 shadow-xl backdrop-blur">
          <CardContent className="p-6 text-center">
            <h4 className="text-lg font-semibold text-blue-300 mb-2">Assessment Score</h4>
            <div className="text-3xl font-bold text-blue-500 mb-2">
              {reportData.assessmentScore}/100
            </div>
            <p className="text-sm text-gray-400">Based on questionnaire responses</p>
          </CardContent>
        </Card>

        <Card className="bg-[#101b30]/80 border border-orange-500 shadow-xl backdrop-blur">
          <CardContent className="p-6 text-center">
            <h4 className="text-lg font-semibold text-orange-300 mb-2">Bias Analysis Score</h4>
            <div className="text-3xl font-bold text-orange-400 mb-2">
              {reportData.biasScore}/100
            </div>
            <p className="text-sm text-gray-400">Automated dataset analysis</p>
          </CardContent>
        </Card>
      </div>

      {/* Dimension Breakdown */}
      <Card className="bg-[#101d35]/80 border border-cyan-700 shadow-lg backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-300">
            <CheckCircle className="w-5 h-5 text-cyan-400" />
            Dimension Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reportData.dimensions.map((dimension, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-white">{dimension.name}</span>
                  <span className="text-sm text-gray-400">
                    {dimension.score.toFixed(1)}/4
                  </span>
                </div>
                <div className="flex gap-1">{renderStars(dimension.stars)}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Issues */}
      <Card className="bg-[#1b263b]/80 border border-red-500 shadow-lg backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            Issues Flagged
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reportData.issuesFlags.length > 0 ? (
            <ul className="space-y-2">
              {reportData.issuesFlags.map((issue, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                  <span className="text-sm text-white">{issue}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-green-400">No critical issues detected</p>
          )}
        </CardContent>
      </Card>

      {/* Fingerprint Section */}
      {reportData.fingerprint && (
        <Card className="bg-[#0f1a2e]/80 border border-cyan-600 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-cyan-300">Dataset Fingerprint</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white">
              <div>
                <p className="font-semibold">Dataset Hash</p>
                <p className="text-xs break-all text-gray-400">
                  {reportData.fingerprint.file_hash}
                </p>
              </div>
              <div>
                <p className="font-semibold">Size</p>
                <p className="text-gray-400">{reportData.fingerprint.file_size_mb} MB</p>
              </div>
              <div>
                <p className="font-semibold">Dimensions</p>
                <p className="text-gray-400">
                  {reportData.fingerprint.rows} rows × {reportData.fingerprint.columns} columns
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {reportData.recommendations.length > 0 && (
        <Card className="bg-[#121f38]/80 border border-green-500 shadow-md backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-green-400">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-white">
              {reportData.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Badge */}
      {reportData.badgeUrl && (
        <Card className="bg-[#101d35]/80 border border-cyan-700 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-cyan-300">Ethical AI Badge</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <img src={reportData.badgeUrl} alt="Badge" className="mx-auto max-w-xs mb-4" />
            <p className="text-sm text-gray-300">
              Display this badge on your project to show your commitment to ethical AI
            </p>
          </CardContent>
        </Card>
      )}

      {/* Download */}
      <div className="flex justify-center gap-4 pt-6">
        <Button
          onClick={onDownloadPDF}
          className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-md"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
        {reportData.badgeUrl && (
          <Button
            onClick={onDownloadBadge}
            variant="outline"
            className="border-cyan-600 text-cyan-400 hover:bg-cyan-900/20"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Badge
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default ReportViewer;
