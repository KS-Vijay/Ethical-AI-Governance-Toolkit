import { motion } from "framer-motion";

const WhyItMattersSection = () => (
  <section
    id="why"
    className="mx-auto w-full max-w-3xl px-6 py-16 bg-[#0f1a2e] rounded-2xl shadow-2xl border border-cyan-800 backdrop-blur-lg"
  >
    <motion.h2
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-3xl md:text-4xl font-extrabold font-inter mb-6 text-left text-cyan-300"
    >
      Why It Matters
    </motion.h2>

    <motion.p
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="text-base text-gray-300 leading-relaxed mb-4"
    >
      Unchecked AI can amplify bias, discriminate unfairly, or make decisions without transparency.
      For developers, this means legal exposure, reputational risk, and lost user trust. For
      society, it can reinforce inequalities and harm vulnerable groups.
    </motion.p>

    <motion.p
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.22 }}
      className="text-base text-gray-300 leading-relaxed"
    >
      The Ethical AI Governance Toolkit provides a practical, open-source way to assess, document,
      and demonstrate responsible AI — building technology everyone can rely on.
    </motion.p>
  </section>
);

export default WhyItMattersSection;
