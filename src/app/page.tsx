import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { useTheme } from "../lib/ThemeContext.js"; // homepage
import {  Video, Code, BarChart3, ArrowRight } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"
import darkLogo from "../assets/dark-logo.png"

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

  const token = localStorage.getItem("token");
const isSignedIn = !!token;
const isLoaded = true;
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
  className="min-h-screen w-full overflow-x-hidden transition-colors duration-500"
  style={{
  backgroundColor: isDark ? "#130f09" : "var(--bg-color)",
  color: isDark ? "#f5e6c8" : "var(--text-color)",
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
        className={`absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none ${
isDark ? "bg-[#c9820a]/20" : "bg-accent-mocha/20"
}`}
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
        className={`absolute -bottom-40 -right-20 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none ${
isDark ? "bg-[#c9820a]/10" : "bg-accent-brown/10"
}`}
      />

      

      {/* Header */}
      <nav
className="fixed top-0 left-0 right-0 z-50 px-8 py-5 flex justify-between items-center backdrop-blur-md"
style={{
background: isDark ? "rgba(28,20,9,0.9)" : "",
borderBottom: isDark ? "1px solid rgba(201,130,10,0.15)" : ""
}}
>
        <div className="flex items-center gap-2">
          <motion.img
  src={isDark ? darkLogo : logo}
  alt="MockPrep Logo"
  initial={{ opacity: 0, scale: 0.8, y: -10 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  transition={{ duration: 0.8 }}
  className="h-10 w-auto sm:h-12 md:h-14 object-contain transition-transform duration-300 hover:scale-105"
/>
          <span className={`text-2xl font-heading font-bold tracking-tight ${isDark ? "text-[#f5e6c8]" : ""}`}>MockPrep</span>
        </div>
        <div className="flex items-center gap-6">
          {isSignedIn ? (
  <button
    onClick={() => {
      localStorage.removeItem("token");
      window.location.reload();
    }}
  >
    Logout
  </button>
) : (
  <button
    onClick={() => {
      window.location.href = "http://localhost:3000/auth/google";
    }}
  >
    Sign in with Google
  </button>
)}
        </div>
      </nav>

      <main className="relative z-10 pt-40 pb-20 px-8 flex flex-col items-center overflow-hidden">
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
            <span
className={`block bg-clip-text text-transparent ${
isDark
? "bg-gradient-to-r from-[#f5e6c8] via-[#e7d7b2] to-[#c9820a]"
: "bg-gradient-to-r from-[#B8B8B8] via-[#E2E2E2] to-[#9E9E9E]"
}`}
>
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
            {!isSignedIn ? (
  <button
  onClick={() => {
    window.location.href = "http://localhost:3000/auth/google";
  }}
  className="px-4 py-2 rounded-lg bg-[#c9820a] text-white font-medium hover:opacity-90 transition"
>
  Sign in with Google
</button>
) : (
  <Link to="/dashboard">
    <button className="premium-button-primary group inline-flex items-center gap-2">
      Go to Dashboard
      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
    </button>
  </Link>
)}
            <button className="premium-button-secondary">
              Watch Demo
            </button>
          </motion.div>
          {isSignedIn && (
  <p className="mt-8 text-xs opacity-40 animate-pulse">
    Press ENTER to continue to dashboard
  </p>
)}
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
              className={`p-10 flex flex-col items-center text-center group rounded-2xl border transition-all
${isDark
? "bg-[#1e1710] border-[#3b2a16]"
: "premium-card"
}`}
            >
              <div className="w-14 h-14 bg-accent-brown/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent-brown group-hover:text-primary-bg transition-colors duration-500">
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

     <footer
className="relative z-10 py-6 mt-24 text-center w-full"
style={{
borderTop: "1px solid rgba(201,130,10,0.15)",
color: "#f5e6c8aa",
background: "#130f09"
}}
>
© {new Date().getFullYear()} MockPrep AI
</footer>
    </motion.div>
  );
}
