import React, { useState, useRef } from 'react';
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
];

const difficulties = ['Easy', 'Medium', 'Hard'];
const topics = ['Arrays', 'Strings', 'Trees', 'Graphs', 'Dynamic Programming'];

const dsaQuestions = [
  {
    id: 'q1',
    title: 'Two Sum',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.',
    difficulty: 'Easy',
    topic: 'Arrays',
    starter_code: {
      javascript: '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n  // Your code here\n}',
      python: 'def two_sum(nums, target):\n    # Your code here\n    pass',
    },
    test_cases: [{ input: '[2,7,11,15], 9', expected: '[0,1]' }],
  }
];

export default function CodeEditorPage() {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0].value);
  const [code, setCode] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'problem' | 'output' | 'testcases'>('problem');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [currentQuestion] = useState(dsaQuestions[0]);
  const editorRef = useRef(null);

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
    <div className="h-screen bg-[#FDFCFB] text-accent-brown flex flex-col overflow-hidden relative">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[10%] w-[400px] h-[400px] bg-accent-mocha/10 rounded-full blur-[100px] animate-pulse-soft" />
        <div className="absolute bottom-[-5%] right-[5%] w-[400px] h-[400px] bg-accent-brown/5 rounded-full blur-[100px] animate-float" />
      </div>

      {/* Premium Navigation */}
      <header className="h-18 flex justify-between items-center px-8 z-20 glass-panel border-b border-accent-brown/5 shrink-0">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-accent-brown/5 rounded-12 flex items-center justify-center group-hover:bg-accent-brown group-hover:text-primary-bg transition-all shadow-sm">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="font-heading font-bold text-xl">MockPrep</span>
          </Link>

          <div className="h-8 w-[1px] bg-accent-brown/10" />

          <div className="flex items-center gap-4">
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 bg-accent-brown/5 rounded-full border border-accent-brown/10 text-xs font-bold uppercase tracking-widest hover:bg-accent-brown/10 transition-all">
                {selectedLanguage.toUpperCase()}
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-accent-brown/5 rounded-full border border-accent-brown/10">
              <Sparkles className="w-3 h-3 text-accent-brown" />
              <span className="text-[10px] font-bold uppercase tracking-widest">AI Debugger Ready</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm border border-accent-brown/10 rounded-full shadow-sm">
            <Search className="w-3 h-3 opacity-40" />
            <input placeholder="Find questions..." className="bg-transparent border-none outline-none text-xs w-32 placeholder:text-accent-brown/30 font-light" />
          </div>
          <button className="premium-button-primary !py-2 !px-6 text-sm flex items-center gap-2">
            <Send className="w-4 h-4" />
            Submit
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-grow overflow-hidden z-10 p-4 gap-4">

        {/* Left Panel: Question Details */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-[450px] premium-card flex flex-col bg-white overflow-hidden shrink-0"
        >
          <div className="flex items-center gap-2 p-6 border-b border-accent-brown/5 bg-accent-brown/[0.02]">
            <BookOpen className="w-4 h-4 text-accent-mocha" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Problem Statement</span>
          </div>

          <div className="flex-grow overflow-y-auto p-10 custom-scrollbar">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-md border border-green-100 uppercase">Easy</span>
                <span className="text-[10px] uppercase font-bold text-accent-brown/30 tracking-widest">• 5 min read</span>
              </div>
              <h2 className="text-4xl font-heading font-bold mb-4">{currentQuestion.title}</h2>
            </div>

            <div className="prose prose-brown max-w-none prose-sm font-light leading-relaxed text-gray-600/90">
              <p className="mb-6">{currentQuestion.description}</p>

              <h4 className="text-accent-brown font-bold text-sm uppercase tracking-wider mb-3">Example 1:</h4>
              <div className="bg-accent-brown/5 rounded-16 p-6 border border-accent-brown/10 mb-8 font-mono text-sm">
                <p><span className="opacity-50">Input:</span> nums = [2,7,11,15], target = 9</p>
                <p><span className="opacity-50">Output:</span> [0,1]</p>
                <p className="mt-2 text-xs opacity-70 italic font-sans font-light">Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].</p>
              </div>

              <h4 className="text-accent-brown font-bold text-sm uppercase tracking-wider mb-3">Constraints:</h4>
              <ul className="text-xs space-y-2 opacity-80 list-disc pl-4">
                <li>2 &le; nums.length &le; 10⁴</li>
                <li>-10⁹ &le; nums[i] &le; 10⁹</li>
                <li>-10⁹ &le; target &le; 10⁹</li>
                <li className="font-bold text-accent-brown">Only one valid answer exists.</li>
              </ul>
            </div>
          </div>

          <div className="p-6 bg-accent-brown/5 border-t border-accent-brown/10">
            <button className="w-full py-3 bg-white border border-accent-brown/10 rounded-20 text-xs font-bold uppercase tracking-[0.2em] shadow-sm hover:shadow-elegant transition-all active:scale-95 flex items-center justify-center gap-2">
              Ask AI Mentor
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>

        {/* Right Panel: Editor + Console */}
        <div className="flex flex-col flex-grow gap-4 overflow-hidden">

          {/* Editor Container */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex-grow premium-card bg-white overflow-hidden relative flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-accent-brown/5 z-10">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-accent-mocha" />
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Source Code</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleRunCode} className="flex items-center gap-2 px-4 py-1.5 bg-accent-brown text-primary-bg rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md hover:bg-accent-brown/90 transition-all">
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
                theme="light"
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
            className="h-[280px] premium-card bg-[#1E1E1E] flex flex-col shrink-0"
          >
            <div className="flex items-center px-6 border-b border-white/5">
              <button
                onClick={() => setActiveTab('testcases')}
                className={`py-4 px-6 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === 'testcases' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
              >
                Test Cases
                {activeTab === 'testcases' && <motion.div layoutId="terminal-tab" className="absolute bottom-0 left-0 w-full h-[2px] bg-accent-mocha" />}
              </button>
              <button
                onClick={() => setActiveTab('output')}
                className={`py-4 px-6 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === 'output' ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
              >
                Console Output
                {activeTab === 'output' && <motion.div layoutId="terminal-tab" className="absolute bottom-0 left-0 w-full h-[2px] bg-accent-mocha" />}
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
                    {currentQuestion.test_cases.map((tc, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/40">{i + 1}</div>
                        <div className="flex-grow">
                          <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Input Data</div>
                          <div className="bg-white/5 rounded-12 p-3 font-mono text-xs text-white/80 border border-white/5">{tc.input}</div>
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
    </div>
  );
}

