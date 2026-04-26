"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { HeroSection } from "@/components/findit/HeroSection";
import { HowItWorks } from "@/components/findit/HowItWorks";
import { CTASection } from "@/components/findit/CTASection";
import { Footer } from "@/components/findit/Footer";
import { TestimonialsSection } from '../components/findit/TestimonialsSection';


// Simple animation variants without transition
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Stats data
  const stats = {
    totalItems: 100,
    recovered: 70,
    activeUsers: 30,
    successRate: 86,
  };

  return (
    <motion.div
      className="min-h-screen relative overflow-x-hidden"
      style={{ opacity }}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
    >
      {/* Global Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/30 to-white" />
        <motion.div
          className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-blue-500/15 blur-[140px] rounded-full"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-cyan-400/15 blur-[120px] rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute top-[40%] left-[-5%] w-[500px] h-[500px] bg-purple-400/10 blur-[100px] rounded-full"
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Hero Section */}
      <motion.section
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <HeroSection stats={stats} />
      </motion.section>

      {/* Divider */}
      <motion.div
        className="max-w-6xl mx-auto px-4"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </motion.div>

      {/* Divider */}
      <motion.div
        className="max-w-6xl mx-auto px-4"
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </motion.div>

      {/* How It Works Section */}
      <motion.section
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="py-16 md:py-20"
      >
        <HowItWorks />
      </motion.section>

      {/* Divider */}
      <motion.div
        className="max-w-6xl mx-auto px-4"
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </motion.div>

      {/* Testimonials Section */}
      <motion.section
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="py-16 md:py-20"
      >
        <TestimonialsSection />
      </motion.section>

      {/* Divider */}
      <motion.div
        className="max-w-6xl mx-auto px-4"
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </motion.div>

      {/* CTA Section */}
      <motion.section
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="py-16 md:py-20"
      >
        <CTASection />
      </motion.section>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Footer />
      </motion.div>

      {/* Scroll to Top Button */}
      <motion.button
        className="fixed bottom-6 right-6 z-40 p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </motion.button>
    </motion.div>
  );
}
