import { Github } from "lucide-react";

const FooterSection = () => (
  <footer className="w-full bg-gradient-to-r from-[#0e1a2b] to-[#102337] py-10 px-6 text-white shadow-inner">
    <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto gap-6 md:gap-0">
      <div className="flex items-center gap-4 text-sm">
        <a
          href="https://github.com/your-repo/ethical-ai-governance-toolkit"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-300 hover:text-white hover:underline transition duration-200"
        >
          <Github size={18} className="inline-block" /> GitHub
        </a>
        <span className="hidden md:inline text-gray-500">|</span>
        <a
          href="#"
          className="text-blue-300 hover:text-white hover:underline transition duration-200"
        >
          Privacy Policy
        </a>
      </div>
      <div className="text-xs text-gray-400 text-center md:text-right leading-relaxed">
        © {new Date().getFullYear()} <span className="text-white font-medium">Ethical AI Governance Toolkit</span> &mdash; Demo Only.
        <br className="md:hidden" />
        Not legal advice. Use responsibly.
      </div>
    </div>
  </footer>
);

export default FooterSection;
