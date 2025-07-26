import { motion } from "framer-motion";
import { Zap, Eye, Database, FileText, BadgeCheck, Globe2 } from "lucide-react";

const features = [
  {
    icon: Zap,
    name: "Ethical Self-Assessment",
    desc: "Run guided checklists for fairness, safety & transparency at every stage.",
    color: "from-cyan-500 to-blue-700"
  },
  {
    icon: Eye,
    name: "Bias Checker",
    desc: "Spot and quantify bias in your datasets and model predictions.",
    color: "from-blue-700 to-cyan-500"
  },
  {
    icon: Database,
    name: "Dataset Fingerprinting",
    desc: "Unique 'fingerprint' and summary stats for reproducible datasets.",
    color: "from-cyan-500 to-blue-700"
  },
  {
    icon: FileText,
    name: "Score Report Generator",
    desc: "Produce clear, exportable scorecards — share your assessment.",
    color: "from-blue-700 to-cyan-500"
  },
  {
    icon: BadgeCheck,
    name: "Badge Generator",
    desc: "Publicly showcase your responsible AI maturity with shareable badges.",
    color: "from-cyan-500 to-blue-700"
  },
  {
    icon: Globe2,
    name: "Public Registry",
    desc: "Opt-in to add your assessment to a global, searchable registry.",
    color: "from-blue-700 to-cyan-500"
  }
];

const FeaturesSection = () => (
  <section
    id="features"
    className="w-full max-w-screen-xl mx-auto py-20 px-6 bg-gradient-to-b from-gray-900 to-black text-white"
  >
    <motion.h2
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="text-4xl font-extrabold mb-14 text-center font-inter text-white drop-shadow-lg"
    >
      🧰 The Toolkit Includes:
    </motion.h2>

    <div className="grid md:grid-cols-3 gap-10">
      {features.map((f, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: idx * 0.07 + 0.1 }}
          viewport={{ once: true }}
        >
          <div
            className={`rounded-xl border border-blue-800/40 bg-gradient-to-br from-gray-800 via-gray-900 to-black p-7 shadow-xl hover:shadow-blue-500/30 transition-all duration-300 backdrop-blur-md group`}
          >
            <div className={`mb-4 w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-br ${f.color} shadow-md`}>
              <f.icon size={28} className="text-white drop-shadow" strokeWidth={2.2} />
            </div>
            <h3 className="font-semibold text-xl mb-2 text-white">{f.name}</h3>
            <p className="text-sm text-gray-300">{f.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

export default FeaturesSection;
