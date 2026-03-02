import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserButton, useUser, useAuth } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import DarkModeToggle from '../../components/DarkModeToggle.js';
import {
  LayoutDashboard,
  FileText,
  PlayCircle,
  History,
  TrendingUp,
  BrainCircuit,
  Settings,
  Bell,
  Search,
  Plus,
  Cpu,
  ArrowRight
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  resume_text?: string;
  completed_sessions?: number;
  createdAt?: string;
}

interface DashboardData {
  userProfile: UserProfile | null;
  totalInterviews: number;
  performanceData: { name: string; value: number }[];
  weakAreas: string[];
  suggestedTopics: string[];
  resumeStatus: 'uploaded' | 'not_uploaded';
}

const COLORS = ['#6B4F3B', '#8B6A55', '#D2B48C', '#A67B5B'];

const RadialProgress: React.FC<{ progress: number; label: string }> = ({ progress, label }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-36 h-36 group">
      <div className="absolute inset-0 bg-accent-brown/5 rounded-full scale-90 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle
          className="text-accent-brown/5"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
        <motion.circle
          className="text-accent-brown"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: strokeDashoffset }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-heading font-bold text-accent-brown">{progress}%</span>
        <span className="text-[10px] uppercase tracking-widest font-bold text-accent-brown/50">{label}</span>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { user: clerkUser, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTopic, setActiveTopic] = useState<string | null>("Confidence");

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isSignedIn || !clerkUser) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = await getToken();
        const response = await fetch('/api/dashboard-data', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard data: ${response.status}`);
        }

        const data = await response.json();
        const userProfile = data.user;

        const totalInterviews = userProfile?.completed_sessions || 0;
        const performanceData = [
          { name: 'Technical', value: 45 },
          { name: 'Behavioral', value: 35 },
          { name: 'Logic', value: 20 },
        ];
        const weakAreas = ['System Design', 'Concurrency', 'Public Speaking'];
        const suggestedTopics = ['Microservices', 'Event Loops', 'Confidence'];

        setDashboardData({
          userProfile,
          totalInterviews,
          performanceData,
          weakAreas,
          suggestedTopics,
          resumeStatus: userProfile?.resume_text ? 'uploaded' : 'not_uploaded',
        });
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isSignedIn, clerkUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-bg flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-accent-brown/10 border-t-accent-brown rounded-full animate-spin" />
        <motion.h1
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-lg font-heading tracking-widest text-accent-brown"
        >
          PREPARING YOUR DASHBOARD
        </motion.h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center p-8">
        <div className="premium-card p-12 text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bell className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-heading mb-4 text-red-700">Something went wrong</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <button onClick={() => window.location.reload()} className="premium-button-primary w-full">Try Again</button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { userProfile, totalInterviews, performanceData, weakAreas, suggestedTopics, resumeStatus } = dashboardData;

const calculatedScore = userProfile?.completed_sessions
  ? Math.min(userProfile.completed_sessions * 10, 100)
  : 0;
  

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-accent-brown font-body">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-20 hidden lg:flex flex-col items-center py-8 gap-8 border-r border-accent-brown/5 glass-panel z-50">
        <div className="w-10 h-10 bg-accent-brown rounded-12 flex items-center justify-center shadow-md-layer mb-4">
          <Cpu className="text-primary-bg w-6 h-6" />
        </div>
        {[LayoutDashboard, History, TrendingUp, Settings].map((Icon, i) => (
          <button key={i} className={`p-3 rounded-16 transition-all duration-300 ${i === 0 ? 'bg-accent-brown text-primary-bg shadow-md' : 'text-accent-brown/40 hover:text-accent-brown hover:bg-accent-brown/5'}`}>
            <Icon className="w-6 h-6" />
          </button>
        ))}
      </aside>

      <div className="lg:pl-20">
        {/* Header */}
        <header className="px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 sticky top-0 z-40 glass-panel border-b border-accent-brown/5">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-accent-brown/50 mb-1 block">Dashboard Overview</span>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-heading font-bold"
            >
              Welcome back, <span className="text-gradient-brown">{userProfile?.name?.split(' ')[0] || 'Explorer'}</span>.
            </motion.h1>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative hidden md:block group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-brown/30 group-focus-within:text-accent-brown transition-colors" />
              <input type="text" placeholder="Search sessions..." className="pl-12 pr-6 py-3 bg-accent-brown/5 rounded-full text-sm outline-none border border-transparent focus:border-accent-brown/20 transition-all w-64" />
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <DarkModeToggle />
              <UserButton />
            </div>
          </div>
        </header>

        <main className="p-8 max-w-[1400px] mx-auto">

          {/* Quick Stats Grid — Score cards removed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[
              { label: 'Total Sessions', value: totalInterviews, icon: PlayCircle },
              { label: 'Resume Status', value: resumeStatus === 'uploaded' ? 'Uploaded ✓' : 'Not Uploaded', icon: FileText },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="premium-card p-6 flex items-center gap-5 hover:scale-[1.02] cursor-pointer"
              >
                <div className="w-12 h-12 bg-accent-brown/5 rounded-16 flex items-center justify-center text-accent-brown">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.1em] font-bold opacity-50">{stat.label}</p>
                  <p className="text-2xl font-heading font-bold">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Action Area */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              {/* Performance Hub */}
              <div className="premium-card p-10 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-mocha/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                <div className="flex justify-between items-end mb-10">
                  <div>
                    <h2 className="text-3xl font-heading font-bold mb-2">Performance Hub</h2>
                    <p className="text-sm text-gray-500 font-light">Detailed breakdown of your interview metrics.</p>
                  </div>
                  <div className="flex gap-2">
                    {['W', 'M', 'Y'].map(t => (
                      <button key={t} className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${t === 'M' ? 'bg-accent-brown text-white' : 'text-accent-brown/40 hover:bg-accent-brown/5'}`}>{t}</button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      {totalInterviews === 0 ? (
                          <div className="flex flex-col items-center justify-center h-[250px] text-center text-accent-brown/60">
                            <TrendingUp className="w-10 h-10 mb-4 opacity-40" />
                            <p className="font-semibold">
                              Complete your first interview to unlock performance analytics
                            </p>
                            <p className="text-xs mt-2">
                              Your real performance graph will appear here.
                            </p>
                          </div>
                        ) : (
                          <AreaChart data={performanceData}>
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Area type="monotone" dataKey="value" stroke="#6B4F3B" fill="#D2B48C" />
                            </AreaChart>
                        )}
                    </ResponsiveContainer>
                  </div>
                    
                  <div className="flex flex-col items-center">
                    {totalInterviews === 0 ? (
                      <div className="text-center text-accent-brown/60">
                        <BrainCircuit className="w-8 h-8 mx-auto mb-3 opacity-40" />
                        <p className="text-sm font-semibold">
                          AI Score Available After First Interview
                        </p>
                      </div>
                    ) : (
                      <RadialProgress progress={calculatedScore} label="Interview Score" />
                    )}
                    <div className="mt-8 flex gap-6 text-center">
                      {[
                        { l: 'Logic', color: COLORS[0] },
                        { l: 'Code', color: COLORS[1] },
                        { l: 'Soft', color: COLORS[2] },
                      ].map((item, id) => (
                        <div key={id}>
                          <div className="w-2 h-2 rounded-full mx-auto mb-2" style={{ backgroundColor: item.color }} />
                          <p className="text-[10px] font-bold opacity-40 uppercase">{item.l}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div whileHover={{ y: -5 }} className="bg-accent-brown p-8 rounded-28 text-primary-bg overflow-hidden relative group">
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-700" />
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold font-heading mb-4 leading-tight">Practice makes <br />permanent.</h3>
                    <p className="text-primary-bg/70 text-sm mb-8 font-light max-w-[200px]">Launch a new AI-powered session customized for your domain.</p>
                    <Link to="/interview-type-selection">
                      <button className="px-6 py-3 bg-white text-accent-brown rounded-full font-bold text-sm flex items-center gap-2 group/btn">
                        New Session
                        <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" />
                      </button>
                    </Link>
                  </div>
                </motion.div>

                <div className="premium-card p-8 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold font-heading mb-2">Resume Intelligence</h3>
                    <p className="text-sm text-gray-500 font-light mb-6">Our AI analyzes your experience to tailor questions.</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent-mocha/10 text-accent-mocha rounded-12 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold">{resumeStatus === 'uploaded' ? 'Resume uploaded ✓' : 'No resume'}</span>
                    </div>
                    <Link to="/resume-upload">
                      <button className="text-xs font-bold text-accent-brown hover:underline underline-offset-4 decoration-2">
                        {resumeStatus === 'uploaded' ? 'Update' : 'Upload'}
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights Sidebar */}
            <div className="flex flex-col gap-8">
              <motion.div
                        initial={{ x: -60, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1.2 }}
                        className="premium-card p-8"
                      >
                        <h3 className="text-xl font-heading font-bold mb-6">
                          Personal Profile
                        </h3>

                        <div className="space-y-4 text-sm text-accent-brown/80">

                          <motion.p
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            <strong>Name:</strong> {userProfile?.name || clerkUser?.fullName || "Not Available"}
                          </motion.p>

                          <motion.p
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                          >
                            <strong>Email:</strong>{" "}
                              {userProfile?.email ||
                                clerkUser?.primaryEmailAddress?.emailAddress ||
                                "Not Available"}
                             </motion.p>

                          <motion.p
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.9 }}
                          >
                            <strong>Member Since:</strong>{" "}
                            {userProfile?.createdAt
                              ? new Date(userProfile.createdAt).toDateString()
                              : "N/A"}
                          </motion.p>

                          <motion.p
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 1.2 }}
                          >
                            <strong>Completed Sessions:</strong>{" "}
                            {userProfile?.completed_sessions || 0}
                          </motion.p>

                        </div>
                      </motion.div>
                

                      <div className="premium-card p-8 bg-white/40 border-dashed border-2 border-accent-brown/20 relative">
                          <div className="absolute -top-3 left-8 px-3 bg-primary-bg text-[10px] font-bold tracking-widest text-accent-mocha">
                            GROWTH HUB
                          </div>

                          {/* Quote Section */}
                          <div className="mb-6">
                            <p className="text-sm italic text-accent-brown/70 leading-relaxed">
                              "Confidence comes from preparation. Master your story, refine your skills, and let clarity replace fear."
                            </p>
                          </div>

                          {/* Growth Buttons */}
                          <div className="flex flex-wrap gap-3 mb-6">
                            {["Confidence", "Communication", "System Design", "Problem Solving"].map((topic) => (
                              <button
                                key={topic}
                                onClick={() => setActiveTopic(topic)}
                                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                                  activeTopic === topic
                                    ? "bg-accent-brown text-white"
                                    : "bg-accent-brown/10 text-accent-brown hover:bg-accent-brown/20"
                                }`}
                              >
                                {topic}
                              </button>
                            ))}
                          </div>

                          {/* Expandable Content */}
                          <div className="text-xs text-accent-brown/70 leading-relaxed min-h-[60px]">
                            {activeTopic === "Confidence" && (
                              <p>
                                Practice mock interviews consistently. Record yourself, review body language, and improve clarity.
                                Confidence grows with repetition and structured preparation.
                              </p>
                            )}

                            {activeTopic === "Communication" && (
                              <p>
                                Use structured answers like STAR method. Focus on clarity, brevity, and impact.
                                Avoid filler words and maintain steady pacing.
                              </p>
                            )}

                            {activeTopic === "System Design" && (
                              <p>
                                Break problems into components. Discuss scalability, trade-offs, and bottlenecks.
                                Interviewers evaluate structured thinking more than perfection.
                              </p>
                            )}

                            {activeTopic === "Problem Solving" && (
                              <p>
                                Think out loud. Clarify constraints before coding.
                                Optimize after achieving a correct baseline solution.
                              </p>
                            )}
                          </div>
                        </div>
                

             
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}