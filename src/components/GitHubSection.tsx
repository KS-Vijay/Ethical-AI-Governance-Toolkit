import { motion } from "framer-motion";
import { Github } from "lucide-react";

const GitHubSection = () => (
  <section id="github" className="w-full max-w-4xl mx-auto px-6 py-16">
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-br from-[#111827] to-[#1f2937] border border-cyan-800 rounded-2xl p-8 gap-6 shadow-xl backdrop-blur-lg"
    >
      <div className="text-white">
        <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-cyan-300">
          <Github className="inline" size={24} /> Open Source • MIT License
        </h2>
        <p className="text-sm text-gray-300 mb-2 leading-relaxed">
          The Ethical AI Governance Toolkit is fully open-source.
          <br />
          Contribute on GitHub or use it freely —{" "}
          <span className="font-mono bg-gray-800 px-2 py-0.5 rounded text-cyan-200">
            MIT License
          </span>
        </p>
      </div>

      <a
        href="https://github.com/KS-Vijay/Ethical-AI-Governance-Toolkit"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-2 md:mt-0 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:scale-105 hover:shadow-cyan-500/40 transition-transform"
      >
        🚀 View on GitHub
      </a>
    </motion.div>
  </section>
);

export default GitHubSection;
