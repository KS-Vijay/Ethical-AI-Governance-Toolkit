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
  const [activeTab, setActiveTab] = useState<string>("overview");

  useEffect(() => {
    fetchReports();
  }, [user.id]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching reports for user:", user);
      
      // Get current user's email from localStorage or props
      const userEmail = user.email;
      if (!userEmail) {
        throw new Error("No user email found");
      }

      // Call the API endpoint to fetch reports with user email
      const response = await fetch(`http://localhost:5000/api/registry/reports?email=${userEmail}`);
      
      console.log("📥 API Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("📄 API Response data:", data);
      
      if (data.success) {
        // Transform the reports to include proper PDF URLs
        const transformedReports = (data.reports || []).map((report: any) => ({
          id: report.id,
          session_id: report.session_id,
          model_name: report.model_name,
          ethical_score: report.ethical_score,
          detailed_reasoning: report.detailed_reasoning || {
            metric_explanations: {},
            flaw_analysis: [],
            recommendations: [],
            statistical_evidence: {}
          },
          bias_results: report.bias_results || [],
          fairness_results: report.fairness_results || {},
          created_at: report.created_at,
          pdf_url: report.pdf_url || null
        }));
        
        setReports(transformedReports);
        console.log("✅ Reports loaded successfully:", transformedReports.length, "reports");
      } else {
        throw new Error(data.error || 'Failed to fetch reports');
      }
    } catch (err) {
      console.error("❌ Error fetching reports:", err);
      setError("Failed to load reports. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (report: FairsightReport) => {
    try {
      if (!report.pdf_url) {
        toast.error('PDF not available for this report');
        return;
      }

      // Create a temporary anchor element to trigger the download
      const a = document.createElement('a');
      a.href = report.pdf_url;
      a.download = `${report.model_name.replace(/\s+/g, '_')}_report.pdf`;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success('Opening PDF in new tab...');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to open PDF. Please try again.');
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
          <Button 
            onClick={fetchReports} 
            className="mt-4 bg-red-600 hover:bg-red-700"
          >
            Retry
          </Button>
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
            <Button 
              onClick={fetchReports} 
              className="mt-4 bg-cyan-600 hover:bg-cyan-700"
            >
              Refresh
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                    <div className=" text-center">
                      <div>
                        <div className={`text-2xl font-bold ${getScoreColor(report.ethical_score)}`}>
                          {report.ethical_score}
                        </div>
                        <div className="text-xs text-gray-400">Ethical</div>
                      </div>
                    </div>

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
                          setActiveTab("detailed");
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
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
                    <div className="">
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${getScoreColor(selectedReport.ethical_score)}`}>
                          {selectedReport.ethical_score}/100
                        </div>
                        <div className="text-sm text-gray-400">Overall Ethical Score</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* PDF Preview */}
                {selectedReport.pdf_url && (
                  <Card className="bg-[#121e36]/80 border border-cyan-700">
                    <CardHeader>
                      <CardTitle className="text-white">Report Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-96 w-full bg-gray-900 rounded-md overflow-hidden">
                        <iframe 
                          src={selectedReport.pdf_url} 
                          className="w-full h-full"
                          title={`PDF Preview: ${selectedReport.model_name}`}
                        />
                      </div>
                      <Button 
                        onClick={() => downloadPDF(selectedReport)}
                        className="mt-4 bg-green-600 hover:bg-green-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Full PDF
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex gap-4">
                  <Button 
                    onClick={() => {
                      setSelectedReport(null);
                      setActiveTab("overview");
                    }}
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