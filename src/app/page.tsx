import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useTheme } from "../lib/ThemeContext.js"; // homepage
import { CheckCircle2, Cpu, Video, Code, BarChart3, ArrowRight } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const TypingEffect: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText((prevText) => prevText + text[currentIndex]);
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  return (
  <span>
    {currentText}
    <span className="animate-pulse">|</span>
  </span>
);
};

export default function HomePage() {
  const { theme } = useTheme();
const isDark = theme === "dark";
// Force homepage to always stay in light mode
useEffect(() => {

  // force light theme
  document.documentElement.classList.remove("dark")
  document.documentElement.classList.add("light")

  localStorage.setItem("theme","light")

}, [])
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();
  const [triggerAnimation, setTriggerAnimation] = useState(false);

  // ENTER key logic
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && isLoaded && isSignedIn) {
        setTriggerAnimation(true);

        setTimeout(() => {
          navigate("/dashboard");
        }, 800);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isLoaded, isSignedIn, navigate]);

  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <motion.div
  initial={{ y: 0 }}
  animate={{ y: triggerAnimation ? "-100vh" : 0 }}
  transition={{ duration: 0.8 }}
  className="min-h-screen transition-colors duration-500"
  style={{
    backgroundColor: "var(--bg-color)",
    color: "var(--text-color)",
  }}
>
      {/* Your existing content continues here */}
      {/* Premium Animated Blobs */}
      <motion.div
        style={{ y: backgroundY }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-accent-mocha/20 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div
        style={{ y: backgroundY }}
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [0, -90, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -bottom-40 -right-20 w-[600px] h-[600px] bg-accent-brown/10 rounded-full blur-[120px] pointer-events-none"
      />

      

      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-accent-brown/5 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <motion.img
  src={isDark ? "/dark-logo.png" : "/logo.png"}
  alt="MockPrep Logo"
  initial={{ opacity: 0, scale: 0.8, y: -10 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  transition={{ duration: 0.8 }}
  className="h-10 w-auto sm:h-12 md:h-14 object-contain transition-transform duration-300 hover:scale-105"
/>
          <span className="text-2xl font-heading font-bold tracking-tight">MockPrep AI</span>
        </div>
        <div className="flex items-center gap-6">
          <SignedIn>
            <div className="flex items-center gap-4">
              <UserButton />
            </div>
          </SignedIn>
          <SignedOut>
          <SignInButton mode="modal">
              <button className="text-sm font-semibold hover:text-accent-mocha transition-colors cursor-pointer">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-20 px-8 flex flex-col items-center">
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent-brown/5 rounded-full mb-8 border border-accent-brown/10"
          >
            <span className="w-2 h-2 bg-accent-brown rounded-full animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider opacity-70">Next-gen Interview Prep</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-heading mb-8 leading-[1.1]"
          >
            <span className="block bg-gradient-to-r from-[#B8B8B8] via-[#E2E2E2] to-[#9E9E9E] bg-clip-text text-transparent">
              Level up with
            </span>

            <span className="text-gradient-brown">
              <TypingEffect text="MockPrep" delay={150} />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl bg-gradient-to-r from-[#B8B8B8] via-[#E2E2E2] to-[#9E9E9E] bg-clip-text text-transparent mb-12 max-w-3xl mx-auto font-light leading-relaxed"
          >
            A premium, AI-driven experience designed to help you master technical, behavioral, and video interviews with confidence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <SignedOut>
              <SignInButton mode="modal">
                <button className="premium-button-primary group inline-flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link to="/dashboard">
                <button className="premium-button-primary group inline-flex items-center gap-2">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
            </SignedIn>
            <button className="premium-button-secondary">
              Watch Demo
            </button>
          </motion.div>
          <SignedIn>
  <p className="mt-8 text-xs opacity-40 animate-pulse">
    Press ENTER to continue to dashboard
  </p>
</SignedIn>
        </section>

        {/* Features Preview */}
        <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Video className="w-6 h-6" />,
              title: "AI Video Interviews",
              desc: "React to live AI avatars and get instant sentiment analysis on your video presence."
            },
            {
              icon: <Code className="w-6 h-6" />,
              title: "Technical Mock Tests",
              desc: "Solve DSA problems in an elegant editor with real-time AI feedback."
            },
            {
              icon: <BarChart3 className="w-6 h-6" />,
              title: "Performance Analytics",
              desc: "Visualize your progress with data-driven insights and personalized improvement plans."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="premium-card p-10 flex flex-col items-center text-center group"
            >
              <div className="w-14 h-14 bg-accent-brown/5 rounded-20 flex items-center justify-center mb-6 group-hover:bg-accent-brown group-hover:text-primary-bg transition-colors duration-500">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-heading font-bold mb-4">{feature.title}</h3>
              <p className="text-gray-600/80 dark:text-gray-400 font-light leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </section>
      </main>

      <footer className="relative z-10 py-12 border-t border-accent-brown/5 mt-20 text-center">
        <p className="text-sm opacity-50">&copy; 2026 MockPrep AI. All rights reserved.</p>
      </footer>
    </motion.div>
  );
}
