import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface EmailVerificationProps {
  email: string;
  onVerificationSuccess: () => void;
}

export default function EmailVerification({ email, onVerificationSuccess }: EmailVerificationProps) {
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("⏳ Verifying code...");

    try {
      const res = await fetch("http://localhost:8082/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          verificationCode
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Verification failed.");
        setLoading(false);
        return;
      }
      
      setMessage("✅ Email verified successfully! Redirecting to login...");
      setTimeout(() => {
        onVerificationSuccess();
        navigate("/login");
      }, 1500);

    } catch (error) {
      console.error("Verification error:", error);
      setMessage("Something went wrong.");
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setMessage("⏳ Sending new verification code...");

    try {
      const res = await fetch("http://localhost:8082/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to resend code.");
        setResendLoading(false);
        return;
      }
      
      setMessage("✅ New verification code sent to your email!");
      setResendLoading(false);

    } catch (error) {
      console.error("Resend error:", error);
      setMessage("Something went wrong.");
      setResendLoading(false);
    }
  };

  const getMessageColor = () => {
    if (message.startsWith('✅')) return 'text-green-400';
    if (message.startsWith('⏳')) return 'text-cyan-400';
    return 'text-red-400';
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* BACKGROUND VIDEO */}
      <video
        className="absolute top-1/2 left-1/2 w-full h-full object-cover -translate-x-1/2 -translate-y-1/2 -z-10"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/V.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/60 -z-10"></div>

      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-gray-900/40 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-8 shadow-2xl shadow-blue-500/10"
        >
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-2 tracking-wider">VERIFY EMAIL</h2>
            <p className="text-blue-300">Check your email for the verification code</p>
            <p className="text-sm text-gray-400 mt-2">{email}</p>
          </div>

          <form onSubmit={handleVerification} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                className="w-full p-3 bg-black/20 border-2 border-blue-800/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 text-center text-2xl tracking-widest"
              />
            </div>
            
            {message && <p className={`text-sm text-center ${getMessageColor()}`}>{message}</p>}

            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="w-full mt-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold px-4 py-3 rounded-lg hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-lg shadow-cyan-500/20"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={handleResendCode}
              disabled={resendLoading}
              className="text-cyan-400 hover:text-cyan-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendLoading ? "Sending..." : "Resend Code"}
            </button>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-400">
              Didn't receive the email? Check your spam folder or try resending.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 