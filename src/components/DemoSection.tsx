import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import AssessmentForm from "./AssessmentForm";
import ReportViewer from "./ReportViewer";
import axios from "axios";
import { generatePDF } from "@/utils/pdfGenerator";

type DemoStep = "upload" | "assessment" | "analyzing" | "report";
interface AssessmentAnswers { [questionId: string]: number; }

const DemoSection = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<DemoStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState<AssessmentAnswers>({});
  const [reportData, setReportData] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<'full' | 'bias-only'>('full');

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile && uploadedFile.type.includes("csv")) {
      setFile(uploadedFile);
      setFileName(uploadedFile.name);
      uploadFileToBackend(uploadedFile);
    } else {
      alert("Please upload a CSV file.");
    }
  }

  const uploadFileToBackend = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        setSessionId(response.data.session_id);
        setCurrentStep("assessment");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Try again.");
    }
  };

  const handleAssessmentComplete = (answers: AssessmentAnswers) => {
    setAssessmentAnswers(answers);
    setCurrentStep("analyzing");
    processResults(answers);
  };

  const processResults = async (answers: AssessmentAnswers) => {
    try {
      if (!sessionId) throw new Error("No session ID");

      const assessmentScore = calculateAssessmentScore(answers);
      const [biasResponse, fingerprintResponse] = await Promise.all([
        axios.post('/api/bias/analyze', { session_id: sessionId }),
        axios.post('/api/fingerprint/generate', { session_id: sessionId })
      ]);

      const biasScore = biasResponse.data.bias_score_analysis?.bias_score || 0;
      const combinedScore = Math.round((assessmentScore.totalScore * 0.7) + (biasScore * 0.3));

      const categoryScores = {
        bias_fairness: Math.round((assessmentScore.dimensions.find(d => d.name === "Fairness & Bias")?.normalizedScore || 0) * 0.7 + biasScore * 0.3),
        transparency: assessmentScore.dimensions.find(d => d.name === "Transparency")?.normalizedScore || 0,
        privacy: assessmentScore.dimensions.find(d => d.name === "Privacy & Consent")?.normalizedScore || 0,
        accountability: assessmentScore.dimensions.find(d => d.name === "Accountability")?.normalizedScore || 0,
        robustness: assessmentScore.dimensions.find(d => d.name === "Security")?.normalizedScore || 0,
        human_oversight: assessmentScore.dimensions.find(d => d.name === "Inclusivity")?.normalizedScore || 0
      };

      const badgeResponse = await axios.post('/api/badge/generate', {
        model_name: fileName || 'Dataset Analysis',
        category_scores: categoryScores,
        overall_score: combinedScore,
        threshold: 70
      });

      const reportResponse = await axios.post('/api/report/comprehensive', {
        session_id: sessionId,
        model_name: fileName || 'Dataset Analysis'
      });

      const report = {
        ethicalScore: combinedScore,
        assessmentScore: Math.round(assessmentScore.totalScore),
        biasScore: biasScore,
        grade: getGrade(combinedScore),
        dimensions: assessmentScore.dimensions,
        biasAnalysis: {
          ...biasResponse.data.summary,
          biasScore,
          biasLevel: biasResponse.data.bias_score_analysis?.bias_level || 'UNKNOWN',
          biasReasoning: biasResponse.data.bias_score_analysis?.reasoning || [],
          biasPenalties: biasResponse.data.bias_score_analysis?.penalties || {}
        },
        fingerprint: fingerprintResponse.data.summary,
        issuesFlags: generateIssueFlags(assessmentScore),
        recommendations: generateRecommendations(assessmentScore),
        badgeUrl: badgeResponse.data.badge_image ? `data:image/png;base64,${badgeResponse.data.badge_image}` : undefined,
        biasVisualizations: biasResponse.data.visualizations || {},
        comprehensiveReport: reportResponse.data.report_content,
        sessionId
      };

      setReportData(report);
      setCurrentStep("report");
    } catch (err) {
      console.error("Processing error:", err);
      alert("Failed to analyze. Try again.");
      setCurrentStep("upload");
    }
  };

  const calculateAssessmentScore = (answers: AssessmentAnswers) => {
    const dimensionGroups = {
      "Transparency": { weight: 0.2, questions: ["t1", "t2", "t3"] },
      "Fairness & Bias": { weight: 0.2, questions: ["b1", "b2", "b3"] },
      "Privacy & Consent": { weight: 0.2, questions: ["p1", "p2", "p3", "p4"] },
      "Accountability": { weight: 0.15, questions: ["a1", "a2", "a3"] },
      "Security": { weight: 0.1, questions: ["s1", "s2", "s3"] },
      "Inclusivity": { weight: 0.1, questions: ["i1", "i2", "i3"] },
      "Regulation": { weight: 0.05, questions: ["r1"] }
    };

    const dimensions = Object.entries(dimensionGroups).map(([name, config]) => {
      const scores = config.questions.map(id => answers[id] || 0);
      const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const normalizedScore = (avgScore / 4) * 100;
      return { name, score: avgScore, stars: Math.round(avgScore), weight: config.weight, normalizedScore };
    });

    const totalScore = dimensions.reduce((sum, d) => sum + (d.normalizedScore * d.weight), 0);
    return { dimensions, totalScore };
  };

  const getGrade = (score: number) => score >= 85 ? "Gold" : score >= 70 ? "Silver" : score >= 55 ? "Bronze" : "Needs Improvement";

  const generateIssueFlags = (score: any) =>
    score.dimensions.filter((d: any) => d.normalizedScore < 50).map((d: any) => `Low score in ${d.name} (${d.normalizedScore.toFixed(1)}%)`);

  const generateRecommendations = (score: any) =>
    score.dimensions.flatMap((d: any) => {
      if (d.normalizedScore >= 70) return [];
      switch (d.name) {
        case "Transparency": return ["Enhance data documentation"];
        case "Fairness & Bias": return ["Use bias detection tools"];
        case "Privacy & Consent": return ["Enhance anonymization"];
        case "Accountability": return ["Add audit trails"];
        case "Security": return ["Strengthen encryption"];
        case "Inclusivity": return ["Engage stakeholders"];
        case "Regulation": return ["Ensure policy compliance"];
        default: return [];
      }
    }).slice(0, 3);

  const handleDownloadPDF = async () => {
    if (reportData) await generatePDF(reportData, `ethical-ai-report-${reportData.sessionId || Date.now()}`);
  };

  const handleDownloadBadge = () => {
    if (reportData?.badgeUrl) {
      const link = document.createElement('a');
      link.href = reportData.badgeUrl;
      link.setAttribute('download', 'ethical-ai-badge.png');
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  const resetDemo = () => {
    setCurrentStep("upload");
    setFileName(null);
    setFile(null);
    setAssessmentAnswers({});
    setReportData(null);
    setSessionId(null);
    setAnalysisType('full');
  };

  return (
    <section id="demo" className="relative w-full max-w-6xl mx-auto px-6 py-20 bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
      <motion.h2
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold text-center mb-4"
      >
        Interactive Demo
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.10 }}
        className="text-base text-center mb-10 text-blue-200"
      >
        Upload your CSV dataset and get an AI-generated ethical assessment with independent bias analysis.
      </motion.p>

      {currentStep === "upload" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.20 }}
          className="w-full max-w-md mx-auto bg-[#1e293b] border border-blue-700 rounded-xl p-8 shadow-lg"
        >
          <label
            className="cursor-pointer flex flex-col items-center justify-center min-h-[120px] border-2 border-dashed border-blue-500 hover:border-blue-400 rounded-xl transition-all bg-[#334155] text-white"
            htmlFor="csv-upload"
          >
            <Upload className="mb-2 text-blue-400" size={32} />
            <span className="text-sm text-blue-100">{fileName || "Click to select a CSV file"}</span>
            <input
              ref={fileRef}
              id="csv-upload"
              type="file"
              accept=".csv"
              className="opacity-0 absolute inset-0 z-20 cursor-pointer"
              onChange={handleFileUpload}
              tabIndex={0}
            />
          </label>

          {fileName && (
            <div className="mt-6 text-center space-y-4">
              <p className="text-blue-300 text-sm">Ready to analyze</p>
              <Button
                onClick={() => {
                  setAnalysisType('full');
                  setCurrentStep("assessment");
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Start Ethical Assessment
              </Button>
              <p className="text-xs text-blue-400">
                Assessment + Bias Detection + Fingerprinting + Badge
              </p>
            </div>
          )}
        </motion.div>
      )}

      {currentStep === "assessment" && (
        <AssessmentForm onComplete={handleAssessmentComplete} />
      )}

      {currentStep === "analyzing" && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold mb-2">Analyzing...</h3>
          <p className="text-blue-300">Running bias analysis and generating results.</p>
        </div>
      )}

      {currentStep === "report" && reportData && (
        <div>
          <ReportViewer reportData={reportData} onDownloadPDF={handleDownloadPDF} onDownloadBadge={handleDownloadBadge} />
          <div className="text-center mt-8">
            <Button onClick={resetDemo} variant="outline" className="border-blue-500 text-white hover:bg-blue-700">
              Try Another Dataset
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

export default DemoSection;
