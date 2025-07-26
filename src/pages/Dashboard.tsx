import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// For a more futuristic feel, consider adding an icon library
// import { Key, LogOut, Home, Zap } from 'react-feather';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", email: "", company: "" });
  const [apiKey, setApiKey] = useState("********--NOT_GENERATED--********");
  const [loadingKey, setLoadingKey] = useState(false);

  // Redirect to login if user/token not found (functionality unchanged)
  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userData || !token) {
      navigate("/login");
      return;
    }

    setUser(JSON.parse(userData));
  }, [navigate]);

  // Handle API key generation (functionality unchanged)
  const handleGenerateApiKey = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoadingKey(true);

    try {
      const res = await fetch("http://localhost:8082/generate-api-key", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.apiKey) {
        setApiKey(data.apiKey);
      } else {
        setApiKey("********--ERROR--********");
      }
    } catch {
      setApiKey("********--ERROR--********");
    }

    setLoadingKey(false);
  };

  // Handle logout (functionality unchanged)
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen bg-gray-900 text-gray-200 font-sans overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        {/* Place your video file in the `public` folder */}
        <source src="/V.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Overlay to darken the video */}
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-10"></div>


      {/* Main Container - positioned above the video */}
      <div className="relative z-20">
        {/* Top Nav - Glassmorphism Effect */}
        <nav className="w-full bg-white/5 backdrop-blur-md shadow-lg shadow-cyan-500/10 py-4 px-8 flex justify-between items-center border-b border-cyan-400/20">
          <h1 className="text-xl font-bold text-cyan-400 drop-shadow-[0_0_5px_rgba(0,255,255,0.4)]">
            FAIRSIGHT
          </h1>
          <div className="space-x-6 flex items-center">
            <button
              onClick={() => navigate("/")}
              className="text-gray-300 hover:text-cyan-400 transition-colors duration-300"
            >
              Home
            </button>
            <button
              onClick={() => alert("Plans coming soon!")}
              className="text-gray-300 hover:text-cyan-400 transition-colors duration-300"
            >
              Plans
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500/80 text-white px-4 py-2 rounded-md hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/40 transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </nav>

        {/* Main Content Card - Glassmorphism Effect */}
        <main className="max-w-3xl mx-auto mt-16 bg-gray-900/40 backdrop-blur-xl shadow-2xl shadow-cyan-500/10 rounded-xl p-8 border border-cyan-300/20">
          <h2 className="text-3xl font-bold text-center mb-6">
            Welcome, <span className="text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]">{user.name}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300 mb-8 border-t border-b border-cyan-400/10 py-6">
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="font-semibold text-cyan-400 text-sm">📧 Email</p>
              <p className="font-mono">{user.email}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="font-semibold text-cyan-400 text-sm">🏢 Company</p>
              <p className="font-mono">{user.company}</p>
            </div>
          </div>

          <div className="mt-8">
            <p className="font-semibold text-gray-200 mb-2">🔑 Your Secure API Key</p>
            <div className="relative">
                <input
                    readOnly
                    value={apiKey}
                    className="w-full p-3 border-2 border-cyan-400/30 rounded-md bg-gray-900/80 text-center font-mono text-lg text-lime-300 tracking-wider focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                />
            </div>
            <button
              onClick={handleGenerateApiKey}
              disabled={loadingKey}
              className="mt-4 w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-4 py-3 rounded-md hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-cyan-500/50"
            >
              {loadingKey ? "Generating..." : "Generate New Key"}
            </button>
          </div>

          {/* Future Section */}
          <div className="mt-10 text-center text-gray-500 text-sm italic">
            📊 Previous Reports section initializing soon...
          </div>
        </main>
      </div>
    </div>
  );
}