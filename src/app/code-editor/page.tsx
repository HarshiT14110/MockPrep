import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Editor } from '@monaco-editor/react';
import {
  ChevronDown,
  Play,
  Send,
  CheckCircle,
  XCircle,
  Cpu,
  Sparkles,
  BookOpen,
  Terminal,
  Beaker,
  ChevronRight,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';

const languages = [
  { name: 'JavaScript', value: 'javascript' },
  { name: 'Python', value: 'python' },
  { name: 'Java', value: 'java' },
  { name: 'C++', value: 'cpp' },
  { name: 'C', value: 'c' },
];

const difficulties = ['Easy', 'Medium', 'Hard'];
const topics = ['Arrays', 'Strings', 'Trees', 'Graphs', 'Dynamic Programming'];

interface TestCase {
  input: string;
  expected: string;
}

interface DSAQuestion {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  topic: string;
  starter_code: Record<string, string>;
  test_cases: TestCase[];
  
}

const dsaQuestions: DSAQuestion[] = [
  {
    id: 'q1',
    title: 'Two Sum',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.',
    difficulty: 'Easy',
    topic: 'Arrays',
    starter_code: {
  javascript: `function twoSum(nums, target) {
  // Your code here
}`,

  python: `def two_sum(nums, target):
    # Your code here
    pass`,

  java: `class Solution {
  public int[] twoSum(int[] nums, int target) {
      // Your code here
  }
}`,

  cpp: `#include <vector>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Your code here
}`,

  c: `#include <stdio.h>

void twoSum(int nums[], int size, int target) {
    // Your code here
}`
},
    test_cases: [{ input: '[2,7,11,15], 9', expected: '[0,1]' }],
  }
];

export default function CodeEditorPage() {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0].value);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [code, setCode] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'testcases' | 'output'>('testcases');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [currentQuestion] = useState<DSAQuestion>(dsaQuestions[0]);
  const editorRef = useRef(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    // Check if dropdown exists
    if (
      dropdownRef.current &&
      // Check if clicked element is NOT inside dropdown
      !dropdownRef.current.contains(event.target as Node)
    ) {
      // Close dropdown
      setIsLangOpen(false);
    }
  }

  // Add event listener when component mounts
  document.addEventListener("mousedown", handleClickOutside);

  // Cleanup event listener when component unmounts
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);


    useEffect(() => {
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsHintOpen(false);
    }
  };

  window.addEventListener("keydown", handleEsc);

  return () => {
    window.removeEventListener("keydown", handleEsc);
  };
}, []);


  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    setCode(currentQuestion.starter_code[selectedLanguage] || '');
  };

  const handleLanguageChange = (val: string) => {
    setSelectedLanguage(val);
    setCode(currentQuestion.starter_code[val] || '');
  };

  const handleRunCode = () => {
    setOutput('Compiling and running code test cases...');
    setTimeout(() => {
      setOutput('✓ Test Case 1: [2,7,11,15], 9 -> Expected [0,1], Got [0,1]\n\nExecution Time: 45ms\nMemory Usage: 12.4 MB');
      setActiveTab('output');
    }, 1000);
  };

  return (
    <div className="h-screen bg-[#0B0C10] text-gray-100 flex flex-col overflow-hidden relative">
     
     
      {/* Premium Navigation */}
      <header className="h-16 flex justify-between items-center px-8 backdrop-blur-xl bg-[#0B0C10]/70 border-b border-white/10 shrink-0 relative z-[100]">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-[#151822] rounded-xl flex items-center justify-center group-hover:bg-[#1B1F2A] transition-all">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="font-heading font-bold text-xl">MockPrep</span>
          </Link>

          <div className="h-8 w-[1px] bg-[#A67C52]
hover:bg-[#B58A63]/10" />

          <div className="flex items-center gap-4">
            <div ref={dropdownRef} className="relative">
  <button
    onClick={() => setIsLangOpen(!isLangOpen)}
    className="flex items-center gap-2 px-4 py-2 bg-[#111217] rounded-full border border-white/15 text-xs font-bold uppercase tracking-widest hover:bg-[#20202A] transition-all"
  >
    {languages.find(l => l.value === selectedLanguage)?.name}
    <ChevronDown className="w-3 h-3" />
  </button>

  <AnimatePresence>
    {isLangOpen && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute top-full mt-2 w-44 bg-[#151822] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[999]"
      >
        {languages.map(lang => (
          <button
            key={lang.value}
            onClick={() => {
              handleLanguageChange(lang.value);
              setIsLangOpen(false);
            }}
            className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-[#1B1F2A] transition-all"
          >
            {lang.name}
          </button>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
</div>
            <div className="flex items-center gap-2 px-3 py-1 bg-[#151822] rounded-full border border-white/10 text-gray-300">
              <Sparkles className="w-3 h-3 text-gray-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest">AI Debugger Ready</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-[#111217]/50 backdrop-blur-sm border border-accent-brown/10 rounded-full shadow-sm">
            <Search className="w-3 h-3 opacity-40" />
            <input placeholder="Find questions..." className="bg-transparent border-none outline-none text-xs w-32 placeholder:text-gray-400/30 font-light" />
          </div>
          <button className="premium-button-primary !py-2 !px-6 text-sm flex items-center gap-2">
            <Send className="w-4 h-4" />
            Submit
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 relative z-10 p-4 gap-4 overflow-hidden">

        {/* Left Panel: Question Details */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-[450px] rounded-2xl bg-[#11131A] border border-white/10 flex flex-col overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.4)] shrink-0"
        >
          <div className="flex items-center gap-2 p-6 border-b border-white/15 bg-[#11131A]">
            <BookOpen className="w-4 h-4 text-gray-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Problem Statement</span>
          </div>

          <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-md border border-green-100 uppercase">Easy</span>
                <span className="text-[10px] uppercase font-bold text-gray-400/30 tracking-widest">• 5 min read</span>
              </div>
              <h2 className="text-4xl font-semibold mb-4 tracking-tight">{currentQuestion.title}</h2>
            </div>

            <div className="prose max-w-none prose-sm leading-relaxed text-gray-300">
              <p className="mb-6">{currentQuestion.description}</p>

              <h4 className="text-gray-400 font-bold text-sm uppercase tracking-wider mb-3">Example 1:</h4>
             <div className="bg-[#151822] rounded-xl p-6 border border-white/10 mb-8 font-mono text-sm text-gray-300">
                <p><span className="opacity-50">Input:</span> nums = [2,7,11,15], target = 9</p>
                <p><span className="opacity-50">Output:</span> [0,1]</p>
                <p className="mt-2 text-xs opacity-70 italic font-sans font-light">Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].</p>
              </div>

              <h4 className="text-gray-400 font-bold text-sm uppercase tracking-wider mb-3">Constraints:</h4>
              <ul className="text-xs space-y-2 opacity-80 list-disc pl-4">
                <li>2 &le; nums.length &le; 10⁴</li>
                <li>-10⁹ &le; nums[i] &le; 10⁹</li>
                <li>-10⁹ &le; target &le; 10⁹</li>
                <li className="font-bold text-gray-400">Only one valid answer exists.</li>
              </ul>
            </div>
          </div>

          <div className="p-6 bg-[#11131A] border-t border-white/10">
            <button
  onClick={() => setIsHintOpen(true)}
  className="w-full py-3 bg-[#151822] border border-white/10 rounded-xl text-sm font-semibold tracking-widest text-gray-200 hover:bg-[#1B1F2A] transition-all active:scale-95 flex items-center justify-center gap-2"
>
              Ask AI Mentor
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>

        {/* Right Panel: Editor + Console */}
        <div className="flex flex-col flex-1 gap-4 overflow-hidden">

          {/* Editor Container */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 min-h-0 rounded-2xl bg-[#11131A] border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/15 z-10">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-gray-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Source Code</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleRunCode} 
                className="flex items-center gap-2 px-4 py-1.5 bg-[#C6A56E] hover:bg-[#D4B377] text-black rounded-full text-[11px] font-semibold  tracking-widest transition-all">
                  <Play className="w-3 h-3" />
                  Run Tests
                </button>
              </div>
            </div>

            <div className="flex-grow">
              <Editor
                height="100%"
                language={selectedLanguage}
                value={code}
                theme="vs-dark"
                onMount={handleEditorDidMount}
                onChange={(value) => setCode(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', monospace",
                  lineNumbers: 'on',
                  roundedSelection: true,
                  scrollBeyondLastLine: false,
                  readOnly: false,
                  padding: { top: 20 },
                  cursorStyle: 'line',
                  automaticLayout: true,
                  wordWrap: 'on',
                }}
              />
            </div>
          </motion.div>

          {/* Console / Output Tabs */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className="h-[280px] rounded-2xl bg-[#0E1117] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.4)] flex flex-col shrink-0 overflow-hidden"
          >
            <div className="flex items-center px-6 border-b border-white/5">
              <button
                onClick={() => setActiveTab('testcases')}
                className={`py-4 px-6 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === 'testcases' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
              >
                Test Cases
                {activeTab === 'testcases' && <motion.div layoutId="terminal-tab" className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C6A56E]" />}
              </button>
              <button
                onClick={() => setActiveTab('output')}
                className={`py-4 px-6 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === 'output' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
              >
                Console Output
                {activeTab === 'output' && <motion.div layoutId="terminal-tab" className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C6A56E]" />}
              </button>
              <div className="ml-auto">
                <Beaker className="w-3 h-3 text-white/20" />
              </div>
            </div>

            <div className="flex-grow p-8 overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                {activeTab === 'testcases' && (
                  <motion.div
                    key="testcases"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {currentQuestion?.test_cases?.map((tc: TestCase, i: number) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full bg-[#111217]/10 flex items-center justify-center text-[10px] font-bold text-white/40">{i + 1}</div>
                        <div className="flex-grow">
                          <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Input Data</div>
                          <div className="bg-[#111217]/5 rounded-12 p-3 font-mono text-xs text-gray-300 border border-white/5">{tc.input}</div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'output' && (
                  <motion.div
                    key="output"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-mono text-sm"
                  >
                    {output ? (
                      <pre className="text-green-400/90 whitespace-pre-wrap leading-relaxed">{output}</pre>
                    ) : (
                      <div className="text-white/20 italic flex items-center gap-2">
                        <Terminal className="w-4 h-4" />
                        Ready for execution...
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

                <AnimatePresence>
  {isHintOpen && (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsHintOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999]"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 flex items-center justify-center z-[1000]"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-[500px] bg-[#11131A] border border-white/10 rounded-2xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.6)]"
        >
          <h3 className="text-xl font-semibold mb-4 text-gray-100">
            AI Hint
          </h3>

          <p className="text-gray-400 leading-relaxed mb-6">
            💡 Think about how you can store previously seen numbers while iterating.
            Can you check if the complement (target - current number) already exists?
          </p>

          <button
            onClick={() => setIsHintOpen(false)}
            className="px-4 py-2 bg-[#C6A56E] hover:bg-[#D4B377] text-black rounded-lg font-medium transition-all"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>

    </div>
  );
}

