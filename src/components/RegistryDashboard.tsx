import React, { useState, useEffect } from "react";
import { Download, Eye, FileText, AlertTriangle, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface FairsightReport {
  id: string;
  session_id: string;
  model_name: string;
  ethical_score: number;
  bias_score: number;
  fairness_score: number;
  grade: string;
  detailed_reasoning: {
    metric_explanations: Record<string, string>;
    flaw_analysis: string[];
    recommendations: string[];
    statistical_evidence: Record<string, any>;
  };
  bias_results: any[];
  fairness_results: Record<string, any>;
  created_at: string;
  pdf_url?: string;
}

interface RegistryDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const RegistryDashboard: React.FC<RegistryDashboardProps> = ({ user }) => {
  const [reports, setReports] = useState<FairsightReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<FairsightReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, [user.id]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching reports for user:", user);
      
      // Get current user from localStorage as fallback
      const userId = user.id || user.email;
      
      if (!userId) {
        console.error("❌ No user ID found");
        setError("User not authenticated");
        return;
      }

      console.log("📡 Making API call to fetch reports for user:", userId);
      
      // Call the API endpoint to fetch reports
      const response = await fetch(`/api/registry/reports?user_id=${encodeURIComponent(userId)}`);
      
      console.log("📥 API Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("📄 API Response data:", data);
      
      if (data.success) {
        setReports(data.reports || []);
        console.log("✅ Reports loaded successfully:", data.reports?.length || 0, "reports");
      } else {
        throw new Error(data.error || 'Failed to fetch reports');
      }
    } catch (err) {
      console.error("❌ Error fetching reports:", err);
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (report: FairsightReport) => {
    if (!report.pdf_url) {
      toast.error('PDF not available for this report');
      return;
    }

    try {
      const response = await fetch(report.pdf_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.model_name}_report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade?.toUpperCase()) {
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B':
        return 'bg-blue-100 text-blue-800';
      case 'C':
        return 'bg-yellow-100 text-yellow-800';
      case 'D':
      case 'F':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-cyan-500"></div>
        <span className="ml-3 text-gray-300">Loading reports...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-900/20 border-red-500">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-cyan-300 mb-2">Fairsight Registry</h2>
        <p className="text-sm text-gray-400">
          Comprehensive bias and fairness analysis reports
        </p>
      </div>

      {reports.length === 0 ? (
        <Card className="bg-[#121e36]/80 border border-cyan-700">
          <CardContent className="p-8 text-center">
            <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Reports Yet</h3>
            <p className="text-gray-400">
              Submit your first Fairsight audit to see it here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed View</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <Card 
                  key={report.id} 
                  className="bg-[#121e36]/80 border border-cyan-700 hover:border-cyan-500 transition-colors cursor-pointer"
                  onClick={() => setSelectedReport(report)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-white">{report.model_name}</CardTitle>
                      <Badge className={`text-white ${getGradeColor(report.grade)}`}>
                        {report.grade}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Scores */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className={`text-2xl font-bold ${getScoreColor(report.ethical_score)}`}>
                          {report.ethical_score}
                        </div>
                        <div className="text-xs text-gray-400">Ethical</div>
                      </div>
                      <div>
                        <div className={`text-2xl font-bold ${getScoreColor(report.bias_score)}`}>
                          {report.bias_score}
                        </div>
                        <div className="text-xs text-gray-400">Bias</div>
                      </div>
                      <div>
                        <div className={`text-2xl font-bold ${getScoreColor(report.fairness_score)}`}>
                          {report.fairness_score}
                        </div>
                        <div className="text-xs text-gray-400">Fairness</div>
                      </div>
                    </div>

                    {/* Issues Summary */}
                    {report.detailed_reasoning?.flaw_analysis && 
                     report.detailed_reasoning.flaw_analysis.length > 0 && (
                      <div className="text-sm">
                        <div className="flex items-center gap-2 text-red-400 mb-1">
                          <AlertTriangle className="w-4 h-4" />
                          <span>{report.detailed_reasoning.flaw_analysis.length} issues</span>
                        </div>
                        {report.detailed_reasoning.recommendations && 
                         report.detailed_reasoning.recommendations.length > 0 && (
                          <div className="flex items-center gap-2 text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span>{report.detailed_reasoning.recommendations.length} recommendations</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Date */}
                    <div className="text-xs text-gray-400">
                      {formatDate(report.created_at)}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 border-cyan-500 text-cyan-300 hover:bg-cyan-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReport(report);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {report.pdf_url && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 border-green-500 text-green-300 hover:bg-green-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadPDF(report);
                          }}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          PDF
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6">
            {selectedReport ? (
              <div className="space-y-6">
                {/* Report Header */}
                <Card className="bg-[#121e36]/80 border border-cyan-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl text-white">{selectedReport.model_name}</CardTitle>
                        <p className="text-gray-400">Session: {selectedReport.session_id}</p>
                      </div>
                      <Badge className={`text-white px-4 py-2 text-lg ${getGradeColor(selectedReport.grade)}`}>
                        {selectedReport.grade}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${getScoreColor(selectedReport.ethical_score)}`}>
                          {selectedReport.ethical_score}/100
                        </div>
                        <div className="text-sm text-gray-400">Overall Ethical Score</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${getScoreColor(selectedReport.bias_score)}`}>
                          {selectedReport.bias_score}/100
                        </div>
                        <div className="text-sm text-gray-400">Bias Analysis Score</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${getScoreColor(selectedReport.fairness_score)}`}>
                          {selectedReport.fairness_score}/100
                        </div>
                        <div className="text-sm text-gray-400">Fairness Score</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Flaw Analysis */}
                  <Card className="bg-[#1b263b]/80 border border-red-500">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-400">
                        <AlertTriangle className="w-5 h-5" />
                        Issues Detected
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedReport.detailed_reasoning?.flaw_analysis && 
                       selectedReport.detailed_reasoning.flaw_analysis.length > 0 ? (
                        <ul className="space-y-2">
                          {selectedReport.detailed_reasoning.flaw_analysis.map((flaw, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-white">{flaw}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-green-400">No critical issues detected</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card className="bg-[#1b263b]/80 border border-green-500">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedReport.detailed_reasoning?.recommendations && 
                       selectedReport.detailed_reasoning.recommendations.length > 0 ? (
                        <ul className="space-y-2">
                          {selectedReport.detailed_reasoning.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-white">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-400">No specific recommendations</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Metric Explanations */}
                {selectedReport.detailed_reasoning?.metric_explanations && 
                 Object.keys(selectedReport.detailed_reasoning.metric_explanations).length > 0 && (
                  <Card className="bg-[#1b263b]/80 border border-blue-500">
                    <CardHeader>
                      <CardTitle className="text-blue-400">Metric Explanations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(selectedReport.detailed_reasoning.metric_explanations).map(([metric, explanation]) => (
                          <div key={metric} className="border-b border-gray-700 pb-2">
                            <div className="font-semibold text-white mb-1">{metric}</div>
                            <div className="text-sm text-gray-300">{explanation}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex gap-4">
                  {selectedReport.pdf_url && (
                    <Button 
                      onClick={() => downloadPDF(selectedReport)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF Report
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedReport(null)}
                    className="border-gray-500 text-gray-300 hover:bg-gray-700"
                  >
                    Back to Overview
                  </Button>
                </div>
              </div>
            ) : (
              <Card className="bg-[#121e36]/80 border border-cyan-700">
                <CardContent className="p-8 text-center">
                  <Eye className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">Select a Report</h3>
                  <p className="text-gray-400">
                    Choose a report from the overview to see detailed analysis.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default RegistryDashboard; 