import { motion } from "framer-motion";
import { Upload, SearchCheck, FileCheck2, BadgeCheck } from "lucide-react";

const steps = [
  { title: "Upload", icon: Upload },
  { title: "Analyze", icon: SearchCheck },
  { title: "Report", icon: FileCheck2 },
  { title: "Badge", icon: BadgeCheck },
];

const FlowChartSection = () => (
  <section
    id="how-it-works"
    className="w-full max-w-4xl mx-auto py-20 px-6 bg-gradient-to-b from-[#0e172b] to-[#101f3a] rounded-xl shadow-lg shadow-blue-900"
  >
    <motion.h2
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-3xl md:text-4xl font-extrabold mb-10 text-center text-white"
    >
      🔄 How It Works
    </motion.h2>

    <div className="flex items-center justify-center flex-col sm:flex-row gap-10 sm:gap-6">
      {steps.map((step, idx) => (
        <motion.div
          key={step.title}
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: idx * 0.15 }}
          viewport={{ once: true }}
          className="flex flex-col items-center relative"
        >
          <div className="rounded-full bg-gradient-to-br from-blue-700 to-blue-500 p-5 mb-3 shadow-md shadow-blue-800">
            <step.icon size={28} className="text-white drop-shadow" strokeWidth={2.1} />
          </div>
          <p className="font-semibold text-base text-blue-200 tracking-wide">{step.title}</p>

          {/* Horizontal connector for desktop */}
          {idx !== steps.length - 1 && (
            <div className="hidden sm:block absolute top-7 right-[-40px] w-16 h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" />
          )}
        </motion.div>
      ))}
    </div>

    {/* Vertical connector for mobile */}
    <div className="sm:hidden flex flex-col items-center mt-8">
      {steps.slice(1).map((_, idx) => (
        <div key={idx} className="w-1 h-10 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full my-1"></div>
      ))}
    </div>
  </section>
);

export default FlowChartSection;
