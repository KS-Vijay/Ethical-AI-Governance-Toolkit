import { motion } from "framer-motion";

const HeroSection = () => (
  <section
    id="hero"
    className="relative min-h-[90vh] w-full flex flex-col justify-center items-center px-6 pb-12 pt-28 text-white overflow-hidden"
  >
    {/* 🟦 Content Overlay */}
    <div className="relative z-10 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight drop-shadow-lg"
        style={{ letterSpacing: "-0.03em" }}
      >
        Ethics,{" "}
        <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
          Verified
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="max-w-xl text-lg md:text-xl mb-8 text-gray-300 mx-auto"
      >
        Your open-source toolkit for ethical AI — empower your models with bias
        checks, transparency, and real accountability.
      </motion.p>

      <motion.a
        href="#demo"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.98 }}
        className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 rounded-lg font-semibold text-white text-lg shadow-lg transition-all focus:ring-2 focus:ring-blue-500 hover:shadow-xl"
      >
        Try the Toolkit
      </motion.a>
    </div>
  </section>
);

export default HeroSection;
