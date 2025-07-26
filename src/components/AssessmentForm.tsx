import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface AssessmentQuestion {
  id: string;
  question: string;
  dimension: string;
  weight: number;
  options: string[];
  scoring: number[];
}

const assessmentQuestions: AssessmentQuestion[] = [
  // Transparency & Documentation (20%)
  {
    id: "t1",
    question: "Have you documented the source and collection method of this dataset?",
    dimension: "Transparency",
    weight: 0.2,
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    scoring: [0, 1, 2, 3, 4]
  },
  {
    id: "t2",
    question: "Is there a data sheet, model card, or documentation attached to this dataset?",
    dimension: "Transparency",
    weight: 0.2,
    options: ["No documentation", "Basic info", "Partial documentation", "Good documentation", "Comprehensive documentation"],
    scoring: [0, 1, 2, 3, 4]
  },
  {
    id: "t3",
    question: "Can users understand what data is used and why?",
    dimension: "Transparency",
    weight: 0.2,
    options: ["Not at all", "Unclear", "Somewhat clear", "Mostly clear", "Very clear"],
    scoring: [0, 1, 2, 3, 4]
  },
  // Bias & Fairness (20%)
  {
    id: "b1",
    question: "Have you checked for demographic imbalance (e.g., gender, race, age)?",
    dimension: "Fairness & Bias",
    weight: 0.2,
    options: ["No check done", "Basic awareness", "Some analysis", "Thorough analysis", "Comprehensive analysis"],
    scoring: [0, 1, 2, 3, 4]
  },
  {
    id: "b2",
    question: "Did you use any method to reduce/prevent bias in the dataset?",
    dimension: "Fairness & Bias",
    weight: 0.2,
    options: ["No methods", "Minimal effort", "Some methods", "Multiple methods", "Comprehensive approach"],
    scoring: [0, 1, 2, 3, 4]
  },
  {
    id: "b3",
    question: "Have you tested for disparate impact in model predictions across groups?",
    dimension: "Fairness & Bias",
    weight: 0.2,
    options: ["No testing", "Basic testing", "Some testing", "Regular testing", "Comprehensive testing"],
    scoring: [0, 1, 2, 3, 4]
  },
  // Privacy & Consent (20%)
  {
    id: "p1",
    question: "Was the data collected with proper user consent?",
    dimension: "Privacy & Consent",
    weight: 0.2,
    options: ["No consent", "Unclear consent", "Basic consent", "Clear consent", "Explicit informed consent"],
    scoring: [0, 1, 2, 3, 4]
  },
  {
    id: "p2",
    question: "Does this dataset include personally identifiable information (PII)?",
    dimension: "Privacy & Consent",
    weight: 0.2,
    options: ["Extensive PII", "Some PII", "Minimal PII", "Limited PII", "No PII"],
    scoring: [0, 1, 2, 3, 4]
  },
  {
    id: "p3",
    question: "Have you anonymized or masked sensitive fields?",
    dimension: "Privacy & Consent",
    weight: 0.2,
    options: ["No anonymization", "Minimal effort", "Basic anonymization", "Good anonymization", "Full anonymization"],
    scoring: [0, 1, 2, 3, 4]
  },
  {
    id: "p4",
    question: "Do you follow any privacy regulation (GDPR, DPDP Act, etc.)?",
    dimension: "Privacy & Consent",
    weight: 0.2,
    options: ["No compliance", "Aware but not following", "Partial compliance", "Good compliance", "Full compliance"],
    scoring: [0, 1, 2, 3, 4]
  },
  // Accountability (15%)
  {
    id: "a1",
    question: "Who is responsible for ethical oversight in your project?",
    dimension: "Accountability",
    weight: 0.15,
    options: ["No one assigned", "Unclear responsibility", "Someone assigned", "Clear responsibility", "Dedicated ethics team"],
    scoring: [0, 1, 2, 3, 4]
  },
  {
    id: "a2",
    question: "Is there a system in place for handling AI-related complaints or feedback?",
    dimension: "Accountability",
    weight: 0.15,
    options: ["No system", "Basic awareness", "Informal process", "Formal process", "Comprehensive system"],
    scoring: [0, 1, 2, 3, 4]
  },
  {
    id: "a3",
    question: "Can decisions made using this AI be audited or traced back?",
    dimension: "Accountability",
    weight: 0.15,
    options: ["No traceability", "Limited logs", "Basic tracing", "Good tracing", "Full audit trail"],
    scoring: [0, 1, 2, 3, 4]
  },
  // Security & Integrity (10%)
  {
    id: "s1",
    question: "Is the dataset stored securely and access-controlled?",
    dimension: "Security",
    weight: 0.1,
    options: ["No security", "Basic security", "Moderate security", "Good security", "Enterprise security"],
    scoring: [0, 1, 2, 3, 4]
  },
  {
    id: "s2",
    question: "Has the dataset been validated for tampering or integrity loss?",
    dimension: "Security",
    weight: 0.1,
    options: ["No validation", "Basic checks", "Some validation", "Regular validation", "Comprehensive validation"],
    scoring: [0, 1, 2, 3, 4]
  },
  {
    id: "s3",
    question: "Are version changes to this dataset tracked?",
    dimension: "Security",
    weight: 0.1,
    options: ["No tracking", "Basic logs", "Some tracking", "Good tracking", "Full version control"],
    scoring: [0, 1, 2, 3, 4]
  },
  // Inclusivity & Social Impact (10%)
  {
    id: "i1",
    question: "Could this AI harm any vulnerable group if used incorrectly?",
    dimension: "Inclusivity",
    weight: 0.1,
    options: ["High risk", "Moderate risk", "Some risk", "Low risk", "Minimal risk"],
    scoring: [0, 1, 2, 3, 4]
  },
  {
    id: "i2",
    question: "Have stakeholders or affected communities been consulted?",
    dimension: "Inclusivity",
    weight: 0.1,
    options: ["No consultation", "Minimal consultation", "Some consultation", "Good consultation", "Extensive consultation"],
    scoring: [0, 1, 2, 3, 4]
  },
  {
    id: "i3",
    question: "Does the AI solution benefit society broadly?",
    dimension: "Inclusivity",
    weight: 0.1,
    options: ["No benefit", "Minimal benefit", "Some benefit", "Good benefit", "Significant benefit"],
    scoring: [0, 1, 2, 3, 4]
  },
  // Regulatory Compliance (5%)
  {
    id: "r1",
    question: "Are you aware of the legal responsibilities tied to deploying this dataset?",
    dimension: "Regulation",
    weight: 0.05,
    options: ["Not aware", "Minimal awareness", "Some awareness", "Good awareness", "Full awareness"],
    scoring: [0, 1, 2, 3, 4]
  }
];

interface AssessmentFormProps {
  onComplete: (answers: Record<string, number>) => void;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({ onComplete }) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentSection, setCurrentSection] = useState(0);

  const sections = [
    { name: "Transparency & Documentation", questions: assessmentQuestions.filter(q => q.dimension === "Transparency") },
    { name: "Fairness & Bias", questions: assessmentQuestions.filter(q => q.dimension === "Fairness & Bias") },
    { name: "Privacy & Consent", questions: assessmentQuestions.filter(q => q.dimension === "Privacy & Consent") },
    { name: "Accountability", questions: assessmentQuestions.filter(q => q.dimension === "Accountability") },
    { name: "Security & Integrity", questions: assessmentQuestions.filter(q => q.dimension === "Security") },
    { name: "Inclusivity & Social Impact", questions: assessmentQuestions.filter(q => q.dimension === "Inclusivity") },
    { name: "Regulatory Compliance", questions: assessmentQuestions.filter(q => q.dimension === "Regulation") }
  ];

  const handleAnswerChange = (questionId: string, value: string) => {
    const question = assessmentQuestions.find(q => q.id === questionId);
    if (question) {
      const score = question.scoring[question.options.indexOf(value)];
      setAnswers(prev => ({ ...prev, [questionId]: score }));
    }
  };

  const isSectionComplete = () =>
    sections[currentSection].questions.every(q => answers[q.id] !== undefined);

  const handleSubmit = () => {
    onComplete(answers);
  };

  const progress = ((currentSection + 1) / sections.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto p-6 text-white"
    >
      <h2 className="text-3xl font-bold mb-4">Ethical Assessment Questionnaire</h2>
      <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
        <div
          className="bg-blue-500 h-2 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      <Card className="bg-[#121a2b] border border-blue-700 mb-8">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">{sections[currentSection].name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {sections[currentSection].questions.map((q) => (
            <div key={q.id} className="space-y-2">
              <Label className="text-white">{q.question}</Label>
              <RadioGroup
                value={q.options.find((o, i) => q.scoring[i] === answers[q.id]) || ""}
                onValueChange={(val) => handleAnswerChange(q.id, val)}
                className="space-y-2"
              >
                {q.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <RadioGroupItem value={opt} id={`${q.id}-${idx}`} />
                    <Label htmlFor={`${q.id}-${idx}`} className="text-gray-300">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          disabled={currentSection === 0}
          onClick={() => setCurrentSection((s) => Math.max(s - 1, 0))}
        >
          Previous
        </Button>

        {currentSection < sections.length - 1 ? (
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!isSectionComplete()}
            onClick={() => setCurrentSection((s) => Math.min(s + 1, sections.length - 1))}
          >
            Next Section
          </Button>
        ) : (
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={!isSectionComplete()}
            onClick={handleSubmit}
          >
            Complete Assessment
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default AssessmentForm;
