import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, Code } from 'lucide-react';

interface TechnicalOptionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  link: string;
}

const TechnicalOptionCard: React.FC<TechnicalOptionCardProps> = ({ title, description, icon: Icon, link }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -10, boxShadow: '0 15px 40px rgba(0, 0, 0, 0.12)' }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-white p-8 rounded-30px shadow-elegant flex flex-col items-center text-center border border-gray-100"
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="mb-6 p-4 bg-primary-bg rounded-full"
      >
        <Icon size={48} className="text-accent-brown" />
      </motion.div>
      <h2 className="text-3xl font-heading mb-4 text-accent-brown">{title}</h2>
      <p className="text-gray-700 mb-8 flex-grow">{description}</p>
      <Link to={link}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 bg-accent-brown text-primary-bg rounded-30px font-semibold shadow-md hover:shadow-lg transition-all duration-300 ease-in-out"
        >
          Select
        </motion.button>
      </Link>
    </motion.div>
  );
};

export default function TechnicalInterviewPage() {
  const options = [
    {
      title: 'Mock Interview (DSA + Core CS)',
      description: 'Practice data structures, algorithms, and core computer science concepts with AI.',
      icon: BookOpen,
      link: '/live-interview?type=technical-mock',
    },
    {
      title: 'Code Editor',
      description: 'Solve coding challenges in multiple languages.',
      icon: Code,
      link: '/code-editor',
    },
  ];

  return (
    <div className="min-h-screen bg-primary-bg font-body text-accent-brown p-8 flex flex-col items-center">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-5xl font-heading mb-12 text-center"
      >
        Technical Interview Options
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.2, delayChildren: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full"
      >
        {options.map((option, index) => (
          <motion.div
            key={option.title}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.15 }}
          >
            <TechnicalOptionCard {...option} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
