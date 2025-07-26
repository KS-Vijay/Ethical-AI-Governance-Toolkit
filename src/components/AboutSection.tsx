import { motion } from "framer-motion";

const AboutSection = () => (
  <section id="about" className="w-full max-w-3xl mx-auto px-6 py-16">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-[#101b2d] to-[#182c43] border border-blue-800 rounded-2xl p-8 shadow-md shadow-blue-900"
    >
      <h2 className="text-2xl font-extrabold mb-4 text-white tracking-tight">
        🚀 About the Team
      </h2>
      <p className="text-sm text-blue-300 mb-3 leading-relaxed">
        Created by <strong className="text-white">Team Runtime Terror</strong> — a group of engineers, designers, and ethicists building tools for transparent, responsible AI.
      </p>
      <p className="text-sm text-blue-400 italic">
        Built during the <span className="text-white font-medium">“Hackfest by SAP” Hackathon 2025</span>.
      </p>
    </motion.div>
  </section>
);

export default AboutSection;
