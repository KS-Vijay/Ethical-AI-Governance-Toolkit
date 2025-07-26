import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import DemoSection from "@/components/DemoSection";
import FlowChartSection from "@/components/FlowChartSection";
import WhyItMattersSection from "@/components/WhyItMattersSection";
import GitHubSection from "@/components/GitHubSection";
import AboutSection from "@/components/AboutSection";
import FooterSection from "@/components/FooterSection";
import SectionDivider from "@/components/SectionDivider";

const Index = () => {
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

      {/* 🔹 Login / Sign Up Buttons */}
      <div className="absolute top-6 right-6 z-20 flex gap-4">
        <a
          href="/login"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition"
        >
          Login
        </a>
        <a
          href="/signup"
          className="bg-white hover:bg-gray-200 text-blue-700 font-semibold py-2 px-4 rounded-lg shadow-md transition"
        >
          Sign Up
        </a>
      </div>

      {/* 🔹 All Home Page Sections */}
      <div className="relative z-10">
        <HeroSection />
        <SectionDivider />
        <FeaturesSection />
        <SectionDivider />
        <DemoSection />
        <SectionDivider />
        <FlowChartSection />
        <SectionDivider />
        <WhyItMattersSection />
        <SectionDivider />
        <GitHubSection />
        <SectionDivider />
        <AboutSection />
        <FooterSection />
      </div>
    </div>
  );
};

export default Index;
