import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import DemoSection from "@/components/DemoSection";
import FlowChartSection from "@/components/FlowChartSection";
import WhyItMattersSection from "@/components/WhyItMattersSection";
import GitHubSection from "@/components/GitHubSection";
import AboutSection from "@/components/AboutSection";
import FooterSection from "@/components/FooterSection";
import SectionDivider from "@/components/SectionDivider";

const HomeLoggedIn = () => {
  const navigate = useNavigate();
  
  // Inactivity timeout functionality
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  // Check if user is actually logged in
  const isLoggedIn = user && (user.id || user.email) && localStorage.getItem("token");
  
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

  // Set up inactivity monitoring
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
      return;
    }

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
  }, [isLoggedIn]);

  // Redirect if not logged in
  if (!isLoggedIn) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="relative min-h-screen font-inter overflow-x-hidden text-white">
      {/* 🔹 Full-Page Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover z-[-2]"
      >
        <source src="/home.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* 🔹 Dark Overlay */}
      <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 z-[-1]" />

      {/* 🔷 Top Navbar */}
      <nav className="w-full bg-white/5 backdrop-blur-md shadow-lg shadow-cyan-500/10 py-4 px-8 flex justify-between items-center border-b border-cyan-400/20 relative z-20">
        <h1 className="text-xl font-bold text-cyan-400 drop-shadow-[0_0_5px_rgba(0,255,255,0.4)]">
          FAIRSIGHT
        </h1>
                   <div className="space-x-6 flex items-center">
             <button
               onClick={() => navigate("/home")}
               className="text-cyan-400 border-b-2 border-cyan-400 transition-colors duration-300"
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
                className="text-gray-300 hover:text-cyan-400 transition-colors duration-300"
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

      {/* 🔹 All Home Page Sections */}
      <div className="relative z-10">
        <HeroSection />
        <SectionDivider/>
        <FeaturesSection />
        <SectionDivider/>
        <DemoSection />
        <SectionDivider/>
        <FlowChartSection/>
        <SectionDivider/>
        <WhyItMattersSection/>
        <SectionDivider/>
        <GitHubSection/>
        <SectionDivider/>
        <AboutSection />
        <FooterSection/>
      </div>
    </div>
  );
};

export default HomeLoggedIn; 