import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, Users, Code, ChevronRight, Sparkles, Target, BrainCircuit } from 'lucide-react';
import { Cpu } from 'lucide-react';

interface InterviewCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  link: string;
  isActive: boolean;
  onClick: (title: string) => void;
  tag: string;
}

const InterviewCard: React.FC<InterviewCardProps> = ({ title, description, icon: Icon, link, isActive, onClick, tag }) => {
  return (
    <motion.div
      whileHover={{ y: -12, scale: 1.02 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`premium-card relative p-10 flex flex-col items-center text-center group cursor-pointer border-2 ${isActive ? 'border-accent-brown ring-4 ring-accent-brown/5' : 'border-transparent'}`}
      onClick={() => onClick(title)}
    >
      <div className="absolute top-4 right-4 px-3 py-1 bg-accent-brown/5 rounded-full border border-accent-brown/10">
        <span className="text-[10px] font-bold uppercase tracking-widest text-accent-brown/60">{tag}</span>
      </div>

      <motion.div
        animate={isActive ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
        transition={{ duration: 0.5 }}
        className="mb-8 p-6 bg-accent-brown/5 text-accent-brown rounded-28 group-hover:bg-accent-brown group-hover:text-primary-bg transition-colors duration-500 shadow-sm-layer"
      >
        <Icon size={42} />
      </motion.div>

      <h2 className="text-3xl font-heading font-bold mb-4">{title}</h2>
      <p className="text-gray-600/80 font-light leading-relaxed mb-10 text-sm">
        {description}
      </p>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="w-full"
          >
            <Link to={link}>
              <button className="premium-button-primary w-full py-4 group/btn inline-flex items-center justify-center gap-2">
                Launch Session
                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {!isActive && (
        <div className="text-xs font-bold text-accent-brown/30 group-hover:text-accent-brown transition-colors">
          Click to select
        </div>
      )}
    </motion.div>
  );
};

export default function InterviewTypeSelectionPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const interviewTypes = [
    {
      title: 'Technical Path',
      description: 'Master data structures, algorithms, and system design with our advanced AI evaluator.',
      icon: Code,
      link: '/technical-interview',
      tag: 'MOST POPULAR'
    },
    {
      title: 'Behavioral Path',
      description: 'Perfect your STAR method responses and soft skills for leadership roles.',
      icon: Users,
      link: '/resume-upload?type=behavioral',
      tag: 'ESSENTIAL'
    },
    {
      title: 'HR Roadmap',
      description: 'Navigate foundational questions and cultural fit scenarios with ease.',
      icon: Briefcase,
      link: '/resume-upload?type=hr',
      tag: 'FOUNDATION'
    },
  ];

  return (
    <div className="min-h-screen bg-primary-bg font-body text-accent-brown p-8 flex flex-col items-center relative overflow-hidden dark:bg-gray-900 dark:text-primary-bg">
      {/* Background blobs for consistency */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-mocha/5 rounded-full blur-[120px] pointer-events-none animate-pulse-soft" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-brown/5 rounded-full blur-[120px] pointer-events-none animate-pulse-soft" />

      <header className="w-full max-w-6xl flex justify-between items-center mb-20 z-10">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-accent-brown/5 rounded-12 flex items-center justify-center group-hover:bg-accent-brown group-hover:text-primary-bg transition-all">
            <Cpu className="w-5 h-5" />
          </div>
          <span className="font-heading font-bold text-xl">MockPrep</span>
        </Link>
        <div className="flex items-center gap-2 px-4 py-2 bg-accent-brown/5 rounded-full border border-accent-brown/10">
          <Sparkles className="w-4 h-4 text-accent-brown" />
          <span className="text-[10px] font-bold uppercase tracking-widest">AI Agent Ready</span>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 z-10"
      >
        <h1 className="text-5xl md:text-6xl font-heading font-bold mb-4 tracking-tight">Choose Your <span className="text-gradient-brown">Expedition</span></h1>
        <p className="text-gray-500 font-light text-lg">Select a specialized path to begin your AI-guided preparation.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.15, delayChildren: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl w-full z-10"
      >
        {interviewTypes.map((type, index) => (
          <motion.div
            key={type.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <InterviewCard
              {...type}
              isActive={selectedType === type.title}
              onClick={(title) => setSelectedType(title)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Footer Insight */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-20 flex items-center gap-3 text-accent-brown/40 border-t border-accent-brown/5 pt-8 z-10"
      >
        <Target className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-[0.2em]">Our AI adapts to your selection for maximum realism</span>
      </motion.div>
    </div>
  );
}
