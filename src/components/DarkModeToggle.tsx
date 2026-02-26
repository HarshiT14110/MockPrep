import React from 'react';
import { useTheme } from '../lib/ThemeContext.js';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';

const DarkModeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="p-2 rounded-full bg-white shadow-elegant text-accent-brown hover:bg-gray-100 transition-colors duration-200 dark:bg-gray-800 dark:text-primary-bg dark:hover:bg-gray-700"
      aria-label="Toggle dark mode"
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </motion.button>
  );
};

export default DarkModeToggle;
