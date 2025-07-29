import React, { useState, useEffect } from 'react';

interface FairsightReport {
  id: string;
  session_id: string;
  model_name: string;
  ethical_score: number;
  bias_score: number;
  fairness_score: number;
  grade: string;
  pdf_url?: string;
  created_at: string;
  detailed_reasoning: {
    flaw_analysis: string[];
    recommendations: string[];
  };
}

const Registry = () => {
  const [reports, setReports] = useState<FairsightReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use mock data instead of Supabase to avoid configuration issues
    const mockReports: FairsightReport[] = [
      {
        id: "1",
        session_id: "session_123",
        model_name: "Test Model",
        ethical_score: 85,
        bias_score: 78,
        fairness_score: 82,
        grade: "B",
        created_at: new Date().toISOString(),
        detailed_reasoning: {
          flaw_analysis: ["Minor bias detected", "Slight imbalance"],
          recommendations: ["Collect more diverse data", "Implement bias mitigation"]
        }
      }
    ];
    
    setReports(mockReports);
    setLoading(false);
  }, []);

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
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading Registry...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Fairsight Registry</h1>
          <p className="text-xl text-gray-300">View and manage your ethical AI audit reports</p>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-2xl font-semibold mb-4">No Reports Found</h3>
            <p className="text-gray-400">Submit your first Fairsight audit to see reports here.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <div key={report.id} className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">{report.model_name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(report.grade)}`}>
                    Grade {report.grade}
                  </span>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Ethical Score:</span>
                    <span className="font-semibold">{report.ethical_score}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Bias Score:</span>
                    <span className="font-semibold">{report.bias_score}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Fairness Score:</span>
                    <span className="font-semibold">{report.fairness_score}%</span>
                  </div>
                </div>

                <div className="text-sm text-gray-400 mb-4">
                  Created: {formatDate(report.created_at)}
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Key Issues:</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {report.detailed_reasoning.flaw_analysis.map((flaw, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-400 mr-2">•</span>
                        {flaw}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-4 border-t border-white/20">
                  <h4 className="font-semibold text-sm mb-2">Recommendations:</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {report.detailed_reasoning.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-400 mr-2">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Registry; 