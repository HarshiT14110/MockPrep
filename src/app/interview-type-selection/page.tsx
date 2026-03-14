import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, Users, Code, ChevronRight, Sparkles, Target, BrainCircuit} from 'lucide-react';
import Logo from "../../components/Logo.js";
import "../../index.css";

/* ════════════════════════════════════════
   DESIGN TOKENS  (warm espresso + amber-gold)
   Matches dashboard theme — no Tailwind
════════════════════════════════════════ */
const T = {
  pageBg: "var(--bg-color)",
  cardBg: "var(--card-bg)",
  cardBorder: "var(--border-color)",

  cardActive: "rgba(107,79,59,0.15)",
  cardActiveBorder: "var(--color-accent-brown)",

  accent: "var(--color-accent-brown)",
  accentSoft: "rgba(107,79,59,0.15)",
  accentBorder: "rgba(107,79,59,0.3)",
  accentGlow: "rgba(107,79,59,0.12)",

  text: "var(--text-color)",
  textMuted: "var(--muted-text)",
  textDim: "rgba(0,0,0,0.35)",

  white: "#fff"
};
/* ════ Interfaces (original – untouched) ════ */
interface InterviewCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  link: string;
  isActive: boolean;
  onClick: (title: string) => void;
  tag: string;
}

/* ════ Interview Card ════ */
const InterviewCard: React.FC<InterviewCardProps> = ({
  title, description, icon: Icon, link, isActive, onClick, tag
}) => {
  const [hov, setHov] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -12, scale: 1.02 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onClick(title)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative',
        padding: 40,
        borderRadius: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        cursor: 'pointer',
        background: isActive ? T.cardActive : T.cardBg,
        border: `2px solid ${isActive ? T.cardActiveBorder : T.cardBorder}`,
        boxShadow: isActive
  ? `var(--shadow-lg-layer)`
          : hov
  ? `var(--shadow-md-layer)`
  : `var(--shadow-sm-layer)`,
        transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
        overflow: 'hidden',
      }}
    >
      {/* Corner glow when active */}
      {isActive && (
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 160, height: 160,
          borderRadius: '50%', pointerEvents: 'none',
          background: `radial-gradient(circle, ${T.accentGlow} 0%, transparent 70%)`,
        }} />
      )}

      {/* Tag badge */}
      <div style={{
        position: 'absolute', top: 16, right: 16,
        padding: '4px 12px', borderRadius: 999,
        background: T.accentSoft,
        border: `1px solid ${T.accentBorder}`,
      }}>
        <span style={{
          fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.2em', color: T.accent,
        }}>{tag}</span>
      </div>

      {/* Icon */}
      <motion.div
        animate={isActive ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
        transition={{ duration: 0.5 }}
        style={{
          marginBottom: 32,
          padding: 24,
          borderRadius: 22,
          background: hov || isActive ? T.accent : T.accentSoft,
          color: hov || isActive ? '#fff' : T.accent,
          transition: 'background 0.4s ease, color 0.4s ease',
          boxShadow: hov || isActive ? `0 4px 20px ${T.accent}44` : 'none',
        }}
      >
        <Icon size={42} />
      </motion.div>

      {/* Title */}
      <h2 style={{
        fontSize: 26, fontWeight: 700, color: T.text,
        marginBottom: 16, letterSpacing: '-0.3px',
      }}>{title}</h2>

      {/* Description */}
      <p style={{
        fontSize: 14, color: T.textMuted, fontWeight: 300,
        lineHeight: 1.7, marginBottom: 40, maxWidth: 260,
      }}>{description}</p>

      {/* Launch button (active state) */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{ width: '100%' }}
          >
            <Link to={link} style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: '100%', padding: '14px 0',
                  borderRadius: 14, border: 'none',
                  background: `linear-gradient(135deg, var(--color-accent-brown), var(--color-accent-mocha))`,
                  color: '#fff', fontWeight: 700, fontSize: 15,
                  cursor: 'pointer', letterSpacing: '0.02em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: `0 4px 20px ${T.accent}44`,
                }}
              >
                Launch Session
                <ChevronRight size={16} />
              </motion.button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Idle hint */}
      {!isActive && (
        <span style={{
          fontSize: 12, fontWeight: 700,
          color: hov ? T.accent : T.textDim,
          transition: 'color 0.3s ease',
          letterSpacing: '0.05em',
        }}>
          Click to select
        </span>
      )}
    </motion.div>
  );
};

/* ════════════════════════════════════════
   MAIN PAGE (all logic identical to original)
════════════════════════════════════════ */
export default function InterviewTypeSelectionPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const interviewTypes = [
    {
      title: 'Technical Path',
      description: 'Master data structures, algorithms, and system design with our advanced AI evaluator.',
      icon: Code,
      link: '/technical-interview',
      tag: 'MOST POPULAR',
    },
    {
      title: 'Behavioral Path',
      description: 'Perfect your STAR method responses and soft skills for leadership roles.',
      icon: Users,
      link: '/live-interview?type=behavioral',
      tag: 'ESSENTIAL',
    },
    {
      title: 'HR Roadmap',
      description: 'Navigate foundational questions and cultural fit scenarios with ease.',
      icon: Briefcase,
      link: '/live-interview?type=hr',
      tag: 'FOUNDATION',
    },
  ];

  

const previewContent: Record<string, string[]> = {
  "Technical Path": [
    "5 AI-generated technical questions",
    "Resume-based question generation",
    "Adaptive difficulty progression",
    "Code & system design evaluation"
  ],
  "Behavioral Path": [
    "6 behavioral interview questions",
    "Real workplace scenarios",
    "Leadership & teamwork focus",
    "AI communication feedback"
  ],
  "HR Roadmap": [
    "6 HR interview questions",
    "Career motivation questions",
    "Culture fit evaluation",
    "Confidence & clarity analysis"
  ]
};

  return (
    <div style={{
      minHeight: '100vh',
      background: T.pageBg,
      color: T.text,
      padding: 32,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Inter, system-ui, sans-serif',
      boxSizing: 'border-box',
    }}>

      {/* Background ambient glows */}
      <div style={{
        position: 'absolute', top: 0, left: '25%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(107,79,59,0.15) 0%, transparent 70%)',
        pointerEvents: 'none', filter: 'blur(40px)',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, right: '25%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(107,79,59,0.15) 0%, transparent 70%)',
        pointerEvents: 'none', filter: 'blur(40px)',
      }} />

      {/* ── Header ── */}
      <header style={{
        width: '100%', maxWidth: 1152,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 80, zIndex: 10,
      }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          
          <motion.div whileHover={{ scale: 1.05 }}>
            <Logo size={42} />
          </motion.div>
          <span style={{ fontWeight: 700, fontSize: 20, color: T.text, letterSpacing: '-0.3px' }}>MockPrep</span>
        </Link>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 16px', borderRadius: 999,
          background: T.accentSoft, border: `1px solid ${T.accentBorder}`,
        }}>
          <Sparkles size={14} color={T.accent} />
          <span style={{
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.2em', color: T.accent,
          }}>
            AI Agent Ready
          </span>
        </div>
      </header>

      {/* ── Hero Text ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: 'center', marginBottom: 64, zIndex: 10 }}
      >
        <h1 style={{
          fontSize: 56, fontWeight: 700, margin: '0 0 16px',
          letterSpacing: '-1.5px', color: T.text, lineHeight: 1.1,
        }}>
          Choose Your{' '}
          <span style={{
            color: T.accent,
            textShadow: `0 0 40px var(--color-accent-brown)44`,
          }}>
            Expedition
          </span>
        </h1>
        <p style={{ fontSize: 18, color: T.textMuted, fontWeight: 300, margin: 0 }}>
          Select a specialized path to begin your AI-guided preparation.
        </p>
      </motion.div>

      {/* ── Cards Grid ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.15, delayChildren: 0.2 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 28,
          maxWidth: 1150,
          width: '100%',
          zIndex: 10,
        }}
      >
        {interviewTypes.map((type, index) => (
          <motion.div
            key={type.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <InterviewCard
              {...type}
              isActive={selectedType === type.title}
              onClick={(title) => setSelectedType(title)}
            />
          </motion.div>
        ))}
      </motion.div>


        <AnimatePresence mode="wait">
  {selectedType && (
    <motion.div
      key={selectedType}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      style={{
        marginTop: 60,
        maxWidth: 700,
        width: "100%",
        padding: 28,
        borderRadius: 18,
        background: T.cardBg,
        border: `1px solid ${T.cardBorder}`,
        boxShadow: `0 6px 30px rgba(0,0,0,0.35)`
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <BrainCircuit size={18} color={T.accent} />
        <h3 style={{ margin: 0, fontSize: 18, color: T.text }}>
          {selectedType} Preview
        </h3>
      </div>

      <ul style={{
        margin: 0,
        paddingLeft: 20,
        display: "flex",
        flexDirection: "column",
        gap: 10
      }}>
        {previewContent[selectedType as keyof typeof previewContent].map((item, index) => (
          <li key={index} style={{
            fontSize: 14,
            color: T.textMuted,
            lineHeight: 1.6
          }}>
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  )}
</AnimatePresence>


      {/* ── Footer Insight ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        style={{
          marginTop: 80,
          display: 'flex', alignItems: 'center', gap: 10,
          color: T.textDim,
          borderTop: `1px solid ${T.cardBorder}`,
          paddingTop: 28,
          zIndex: 10,
        }}
      >
        <Target size={14} color={T.accent} style={{ opacity: 0.6 }} />
        <span style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.2em', color: T.textDim,
        }}>
          Our AI adapts to your selection for maximum realism
        </span>
      </motion.div>
    </div>
  );
}