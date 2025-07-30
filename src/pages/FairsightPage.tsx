import { Github } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

const FairsightPage = () => {
  const navigate = useNavigate();
  
  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const isLoggedIn = user && (user.id || user.email) && token;
  


  // Inactivity timeout functionality
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Reset inactivity timer
  const resetInactivityTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      toast.error("Session expired due to inactivity. Please log in again.");
      handleLogout();
    }, INACTIVITY_TIMEOUT);
  };

  // Handle user activity
  const handleUserActivity = () => {
    resetInactivityTimer();
  };

  // Set up inactivity monitoring for logged-in users
  useEffect(() => {
    if (isLoggedIn) {
      // Start inactivity timer
      resetInactivityTimer();

      // Add event listeners for user activity
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      events.forEach(event => {
        document.addEventListener(event, handleUserActivity, true);
      });

      // Cleanup function
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        events.forEach(event => {
          document.removeEventListener(event, handleUserActivity, true);
        });
      };
    }
  }, [isLoggedIn]);

  return (
    <div className="relative min-h-screen font-inter overflow-x-hidden text-white bg-black">
      {/* 🎥 Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/V.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* 🔷 Overlay */}
      <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 z-10" />

      {/* 🔷 Top Navbar for logged-in users */}
      {isLoggedIn ? (
        <nav className="w-full bg-white/5 backdrop-blur-md shadow-lg shadow-cyan-500/10 py-4 px-8 flex justify-between items-center border-b border-cyan-400/20 relative z-20">
          <h1 className="text-xl font-bold text-cyan-400 drop-shadow-[0_0_5px_rgba(0,255,255,0.4)]">
            FAIRSIGHT
          </h1>
                     <div className="space-x-6 flex items-center">
             <button
               onClick={() => navigate("/home")}
               className="text-gray-300 hover:text-cyan-400 transition-colors duration-300"
             >
               Home
             </button>
             <button
               onClick={() => navigate("/dashboard")}
               className="text-gray-300 hover:text-cyan-400 transition-colors duration-300"
             >
               Dashboard
             </button>
                           <button
                onClick={() => navigate("/fairsight")}
                className="text-cyan-400 border-b-2 border-cyan-400 transition-colors duration-300"
              >
                Fairsight
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
      ) : (
        /* 🔹 Top-right Navigation for non-logged-in users */
        <div className="absolute top-6 right-6 z-20 flex gap-4">
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition"
          >
            Home
          </button>
        </div>
      )}

      {/* 🔹 Main Content */}
      <main className="relative z-20 flex flex-col justify-center items-center text-center px-6 pt-36 pb-16 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Introducing{" "}
          <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
            Fairsight
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8">
          Fairsight is our Python library powering ethical evaluations and bias
          analysis — now accessible via secure APIs. Access premium features
          through your generated API keys.
        </p>
      </main>

      {/* 🔹 GitHub Section */}
      <div className="relative z-20 px-6 pb-16 flex justify-center">
        <div className="w-full max-w-4xl bg-[#0d1a2d] border border-blue-800 rounded-xl shadow-lg p-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-left">
            <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
              <Github size={20} /> Open Source • MIT License
            </h3>
            <p className="text-gray-300 text-sm mt-2">
              The Fairsight Python library is fully open-source.
              <br />
              Contribute on GitHub or use it freely —{" "}
              <code className="bg-[#1c2b40] text-cyan-300 px-2 py-0.5 rounded">
                MIT License
              </code>
              .
            </p>
          </div>
          <a
            href="https://github.com/KS-Vijay/fairsight"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
          >
            🚀 View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
};

export default FairsightPage;
