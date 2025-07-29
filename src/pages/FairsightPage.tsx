import { Github } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FairsightPage = () => {
  const navigate = useNavigate();

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

      {/* 🔹 Top-right Navigation */}
      <div className="absolute top-6 right-6 z-20 flex gap-4">
        <button
          onClick={() => navigate("/")}
          className="bg-white hover:bg-gray-200 text-blue-700 font-semibold py-2 px-4 rounded-lg shadow transition"
        >
          Home
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-2 px-4 rounded-lg shadow transition hover:scale-105"
        >
          API Dashboard
        </button>
      </div>

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
