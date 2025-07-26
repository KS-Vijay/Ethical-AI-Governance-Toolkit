import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("⏳ Logging in...");

    try {
      const res = await fetch("http://localhost:8082/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Login failed.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setMessage("✅ Login successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Something went wrong.");
      setLoading(false);
    }
  };

  const getMessageColor = () => {
    if (message.startsWith('✅')) return 'text-green-400';
    if (message.startsWith('⏳')) return 'text-cyan-400';
    return 'text-red-400';
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* BACKGROUND VIDEO - Add your video source here */}
     <video
        className="absolute top-1/2 left-1/2 w-full h-full object-cover -translate-x-1/2 -translate-y-1/2 -z-10"
        autoPlay
        loop
        muted
        playsInline
      >
        { <source src="/V.mp4" type="video/mp4" /> }
      </video>*/
      <div className="absolute inset-0 bg-black/60 -z-10"></div>

      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-gray-900/40 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-8 shadow-2xl shadow-blue-500/10"
        >
          <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-2 tracking-wider">SYSTEM LOGIN</h2>
              <p className="text-blue-300">Authorize access to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className="w-full p-3 bg-black/20 border-2 border-blue-800/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300" />
            <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="w-full p-3 bg-black/20 border-2 border-blue-800/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300" />
            
            {message && <p className={`text-sm text-center ${getMessageColor()}`}>{message}</p>}

            <button type="submit" disabled={loading} className="w-full mt-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold px-4 py-3 rounded-lg hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-lg shadow-cyan-500/20">
              {loading ? "Authenticating..." : "Engage"}
            </button>
          </form>
          
          <p className="text-center text-sm text-gray-400 mt-8">
            No credentials?{" "}
            <Link to="/signup" className="font-medium text-cyan-400 hover:text-cyan-300 hover:underline">
              Register
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}