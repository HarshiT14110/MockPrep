import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserButton, useUser, useAuth } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { useTheme } from "../../lib/ThemeContext.js";
import DarkModeToggle from '../../components/DarkModeToggle.js';
import {
  LayoutDashboard, FileText, PlayCircle, History,
  TrendingUp, BrainCircuit, Settings, Bell, Search,
  Plus, Sparkles, Cpu, Zap, Target, ChevronRight
} from 'lucide-react';
import Logo from "../../components/Logo.js";
import darkLogo from "../../assets/dark-logo.png";
import logo from "../../assets/logo.png";

const DARK = {
  pageBg:       '#130f09',
  sidebarBg:    '#1c1409',
  cardBg:       '#1e1710',
  cardBorder:   'rgba(255,200,100,0.07)',
  headerBg:     'rgba(19,15,9,0.92)',
  accent:       '#c9820a',
  accentSoft:   'rgba(201,130,10,0.14)',
  accentBorder: 'rgba(201,130,10,0.24)',
  accentGlow:   'rgba(201,130,10,0.10)',
  text:         '#f5e6c8',
  textMuted:    'rgba(245,230,200,0.40)',
  textDim:      'rgba(245,230,200,0.18)',
};
const LIGHT = {
  pageBg:       '#faf6ef',
  sidebarBg:    '#f2ece0',
  cardBg:       '#ffffff',
  cardBorder:   'rgba(160,110,30,0.10)',
  headerBg:     'rgba(250,246,239,0.94)',
  accent:       '#b06e08',
  accentSoft:   'rgba(176,110,8,0.09)',
  accentBorder: 'rgba(176,110,8,0.20)',
  accentGlow:   'rgba(176,110,8,0.06)',
  text:         '#1a1208',
  textMuted:    'rgba(26,18,8,0.45)',
  textDim:      'rgba(26,18,8,0.22)',
};

type Theme = typeof DARK;

interface UserProfile {
  id: string; name: string; email: string;
  resume_text?: string; completed_sessions?: number; createdAt?: string;
}
interface DashboardData {
  userProfile: UserProfile | null; totalInterviews: number;
  performanceData: { name: string; value: number }[];
  weakAreas: string[]; suggestedTopics: string[];
  resumeStatus: 'uploaded' | 'not_uploaded';
}

const RadialProgress: React.FC<{ progress: number; label: string; T: Theme }> = ({ progress, label, T }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  return (
    <div style={{ position: 'relative', width: 144, height: 144 }}>
      <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 120 120">
        <defs>
          <linearGradient id="radGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={T.accent} />
            <stop offset="100%" stopColor="#e8a83a" />
          </linearGradient>
        </defs>
        <circle strokeWidth="6" stroke={T.accentSoft} fill="transparent" r={radius} cx="60" cy="60" />
        <motion.circle strokeWidth="6" strokeDasharray={circumference} strokeLinecap="round"
          stroke="url(#radGrad)" fill="transparent" r={radius} cx="60" cy="60"
          initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset }}
          transition={{ duration: 2.2, ease: "easeOut", delay: 0.5 }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: T.text, letterSpacing: '-0.5px' }}>{progress}%</span>
        <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 600, color: T.accent + 'aa', marginTop: 2 }}>{label}</span>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: React.ReactNode; icon: React.ElementType; delay?: number; T: Theme }> = ({ label, value, icon: Icon, delay = 0, T }) => {
  const [hov, setHov] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ position: 'relative', overflow: 'hidden', borderRadius: 16, padding: 24, cursor: 'pointer', background: T.cardBg, border: `1px solid ${T.cardBorder}`, transform: hov ? 'translateY(-3px)' : 'translateY(0)', transition: 'transform 0.2s ease' }}>
      {hov && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `linear-gradient(135deg, ${T.accentGlow} 0%, transparent 60%)` }} />}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.accentSoft, border: `1px solid ${T.accentBorder}` }}>
          <Icon size={20} color={T.accent} />
        </div>
        <div>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, color: T.textMuted, marginBottom: 4, margin: 0 }}>{label}</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: T.text, margin: 0 }}>{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

const NavItem: React.FC<{ icon: React.ElementType; active?: boolean; index: number; T: Theme }> = ({ icon: Icon, active, index, T }) => {
  const [hov, setHov] = useState(false);
  return (
    <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ position: 'relative', width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', background: active ? T.accent : 'transparent', color: active ? '#fff' : T.textMuted, boxShadow: active ? `0 4px 18px ${T.accent}55` : 'none', transform: hov && !active ? 'translateX(2px)' : 'none', transition: 'all 0.25s ease' }}>
      <Icon size={20} />
      {active && (
        <motion.div layoutId="activeNav"
          style={{ position: 'absolute', left: -12, top: '50%', transform: 'translateY(-50%)', width: 2, height: 20, borderRadius: 2, background: T.accent }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
      )}
    </motion.button>
  );
};

const TopicPill: React.FC<{ topic: string; active: boolean; onClick: () => void; T: Theme }> = ({ topic, active, onClick, T }) => (
  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={onClick}
    style={{ padding: '8px 16px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: active ? 'none' : `1px solid ${T.accentBorder}`, background: active ? T.accent : T.accentSoft, color: active ? '#fff' : T.textMuted, boxShadow: active ? `0 2px 12px ${T.accent}44` : 'none', transition: 'all 0.25s ease' }}>
    {topic}
  </motion.button>
);

export default function DashboardPage() {
  const { user: clerkUser, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTopic, setActiveTopic] = useState<string | null>("Confidence");
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const T: Theme = isDark ? DARK : LIGHT;

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isSignedIn || !clerkUser) { setLoading(false); return; }
      setLoading(true); setError(null);
      try {
        const token = await getToken();
        const response = await fetch('/api/dashboard-data', { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error(`Failed to fetch dashboard data: ${response.status}`);
        const data = await response.json();
        const userProfile = data.user;
        const totalInterviews = userProfile?.completed_sessions || 0;
        const performanceData = [{ name: 'Technical', value: 45 }, { name: 'Behavioral', value: 35 }, { name: 'Logic', value: 20 }];
        const weakAreas = ['System Design', 'Concurrency', 'Public Speaking'];
        const suggestedTopics = ['Microservices', 'Event Loops', 'Confidence'];
        setDashboardData({ userProfile, totalInterviews, performanceData, weakAreas, suggestedTopics, resumeStatus: userProfile?.resume_text ? 'uploaded' : 'not_uploaded' });
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data.');
      } finally { setLoading(false); }
    };
    fetchDashboardData();
  }, [isSignedIn, clerkUser]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, background: DARK.pageBg }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes ping{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:0}}`}</style>
      <div style={{ position: 'relative', width: 56, height: 56 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${DARK.accent}33`, animation: 'ping 1s ease infinite' }} />
        <div style={{ width: 56, height: 56, borderRadius: '50%', border: `2px solid ${DARK.accent}22`, borderTopColor: DARK.accent, animation: 'spin 0.8s linear infinite' }} />
      </div>
      <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.8, repeat: Infinity }}
        style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.3em', fontWeight: 600, color: DARK.textMuted }}>
        Preparing your workspace…
      </motion.p>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.pageBg, padding: 16 }}>
      <div style={{ borderRadius: 20, padding: 40, textAlign: 'center', maxWidth: 360, background: T.cardBg, border: `1px solid ${T.cardBorder}` }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(220,60,60,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Bell size={28} color="#e05555" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 12 }}>Something went wrong</h2>
        <p style={{ fontSize: 14, color: T.textMuted, marginBottom: 32 }}>{error}</p>
        <button onClick={() => window.location.reload()} style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: T.accent, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Try Again</button>
      </div>
    </div>
  );

  if (!dashboardData) return null;

  const { userProfile, totalInterviews, performanceData, resumeStatus } = dashboardData;
  const calculatedScore = userProfile?.completed_sessions ? Math.min(userProfile.completed_sessions * 10, 100) : 0;
  const topicContent: Record<string, string> = {
    Confidence: "Practice mock interviews consistently. Record yourself, review body language, and improve clarity. Confidence grows with repetition and structured preparation.",
    Communication: "Use structured answers like STAR method. Focus on clarity, brevity, and impact. Avoid filler words and maintain steady pacing.",
    "System Design": "Break problems into components. Discuss scalability, trade-offs, and bottlenecks. Interviewers evaluate structured thinking more than perfection.",
    "Problem Solving": "Think out loud. Clarify constraints before coding. Optimize after achieving a correct baseline solution.",
  };

  const SIDEBAR_W = 66;

  return (
    <div style={{ width: '100vw', maxWidth: '100vw', overflowX: 'hidden', minHeight: '100vh', background: T.pageBg, color: T.text, boxSizing: 'border-box', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* SIDEBAR */}
      <aside style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: SIDEBAR_W, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 0', gap: 20, zIndex: 50, background: T.sidebarBg, borderRight: `1px solid ${T.cardBorder}` }}>
        <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} style={{ marginBottom: 12 }}>
          
          <img
            src={isDark ? darkLogo : logo}
            alt="MockPrep"
            style={{
              height: 44,
              width: 44,
              objectFit: "contain",
              filter: isDark ? "drop-shadow(0 0 10px rgba(201,130,10,0.5))" : "none"
            }}
          />
          
        </motion.div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
          {[LayoutDashboard, History, TrendingUp, Settings].map((Icon, i) => (
            <NavItem key={i} icon={Icon} active={i === 0} index={i} T={T} />
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <UserButton />
        </motion.div>
      </aside>

      {/* CONTENT */}
      <div style={{ marginLeft: SIDEBAR_W, width: `calc(100% - ${SIDEBAR_W}px)`, boxSizing: 'border-box', overflowX: 'hidden' }}>

        {/* HEADER */}
        <motion.header initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, position: 'sticky', top: 0, zIndex: 40, background: T.headerBg, borderBottom: `1px solid ${T.cardBorder}`, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', boxSizing: 'border-box' }}>
          <div>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 600, color: T.accent + 'cc', margin: '0 0 4px' }}>Dashboard Overview</p>
            <h1 style={{ fontSize: 30, fontWeight: 700, color: T.text, margin: 0, letterSpacing: '-0.5px' }}>
              Welcome back, <span style={{ color: T.accent }}>{userProfile?.name?.split(' ')[0] || 'Explorer'}</span><span style={{ color: T.accent }}>.</span>
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} color={T.textDim} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" placeholder="Search sessions…" style={{ paddingLeft: 38, paddingRight: 20, paddingTop: 10, paddingBottom: 10, fontSize: 12, borderRadius: 12, outline: 'none', background: T.accentSoft, border: `1px solid ${T.accentBorder}`, color: T.text, width: 200 }} />
            </div>
            <DarkModeToggle />
          </div>
        </motion.header>

        {/* MAIN */}
        <main style={{ padding: 32, maxWidth: 1400, margin: '0 auto', boxSizing: 'border-box' }}>

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 28 }}>
            <StatCard label="Total Sessions" value={totalInterviews} icon={PlayCircle} delay={0.1} T={T} />
            <StatCard label="Resume Status" value={resumeStatus === 'uploaded' ? <span>Uploaded <span style={{ color: T.accent }}>✓</span></span> : 'Not Uploaded'} icon={FileText} delay={0.18} T={T} />
          </div>

          {/* Main grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>

            {/* Left */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Performance Hub */}
              <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: 'relative', overflow: 'hidden', borderRadius: 20, padding: 32, background: T.cardBg, border: `1px solid ${T.cardBorder}` }}>
                <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', pointerEvents: 'none', background: `radial-gradient(circle, ${T.accentGlow} 0%, transparent 70%)` }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, position: 'relative' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.accentSoft }}>
                        <Zap size={12} color={T.accent} />
                      </div>
                      <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: 0 }}>Performance Hub</h2>
                    </div>
                    <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>Detailed breakdown of your interview metrics</p>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['W', 'M', 'Y'].map(t => (
                      <button key={t} style={{ width: 32, height: 32, borderRadius: 10, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', background: t === 'M' ? T.accent : 'transparent', color: t === 'M' ? '#fff' : T.textDim, boxShadow: t === 'M' ? `0 2px 10px ${T.accent}55` : 'none' }}>{t}</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
                  <div style={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      {totalInterviews === 0 ? (
                        <div style={{ height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                          <div style={{ width: 48, height: 48, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.accentSoft, marginBottom: 16 }}>
                            <TrendingUp size={20} color={T.accent} style={{ opacity: 0.4 }} />
                          </div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: T.textMuted, margin: 0 }}>Complete your first interview</p>
                          <p style={{ fontSize: 12, color: T.textDim, marginTop: 4 }}>to unlock performance analytics</p>
                        </div>
                      ) : (
                        <AreaChart data={performanceData}>
                          <defs>
                            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={T.accent} stopOpacity={0.35} />
                              <stop offset="95%" stopColor={T.accent} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={T.cardBorder} />
                          <XAxis dataKey="name" tick={{ fontSize: 10, fill: T.textMuted }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: T.textMuted }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: 12, fontSize: 12, color: T.text }} />
                          <Area type="monotone" dataKey="value" stroke={T.accent} strokeWidth={2} fill="url(#areaFill)" />
                        </AreaChart>
                      )}
                    </ResponsiveContainer>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
                    {totalInterviews === 0 ? (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.accentSoft, margin: '0 auto 16px' }}>
                          <BrainCircuit size={24} color={T.accent} style={{ opacity: 0.4 }} />
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: T.textMuted, margin: 0 }}>AI Score Available</p>
                        <p style={{ fontSize: 12, color: T.textDim, marginTop: 4 }}>After first interview</p>
                      </div>
                    ) : (
                      <RadialProgress progress={calculatedScore} label="Interview Score" T={T} />
                    )}
                    <div style={{ display: 'flex', gap: 24, textAlign: 'center' }}>
                      {[{ l: 'Logic', op: 'ff' }, { l: 'Code', op: 'aa' }, { l: 'Soft', op: '66' }].map(item => (
                        <div key={item.l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.accent + item.op }} />
                          <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: T.textDim, margin: 0 }}>{item.l}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

                {/* New Session */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4, transition: { duration: 0.22 } }}
                  style={{ position: 'relative', overflow: 'hidden', borderRadius: 20, padding: 32, background: `linear-gradient(135deg, ${T.accent} 0%, #9a5806 100%)` }}>
                  <div style={{ position: 'absolute', right: -32, bottom: -32, width: 176, height: 176, borderRadius: '50%', background: 'rgba(0,0,0,0.10)', pointerEvents: 'none' }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <Sparkles size={14} color="rgba(255,235,180,0.7)" />
                      <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.22em', fontWeight: 600, color: 'rgba(255,235,180,0.6)' }}>AI‑Powered</span>
                    </div>
                    <h3 style={{ fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1.3, margin: '0 0 12px' }}>Practice makes<br />permanent.</h3>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', maxWidth: 200, lineHeight: 1.6, margin: '0 0 28px' }}>Launch a new AI‑powered session customized for your domain.</p>
                    <Link to="/interview-type-selection" style={{ textDecoration: 'none' }}>
                      <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.92)', color: T.accent, fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
                        New Session
                        <div style={{ width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.accentSoft }}>
                          <Plus size={12} color={T.accent} />
                        </div>
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>

                {/* Resume Intelligence */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.42, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  style={{ position: 'relative', overflow: 'hidden', borderRadius: 20, padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: T.cardBg, border: `1px solid ${T.cardBorder}` }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.accentSoft }}>
                        <Target size={12} color={T.accent} />
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, margin: 0 }}>Resume Intelligence</h3>
                    </div>
                    <p style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.6, margin: 0 }}>Our AI analyzes your experience to tailor questions specifically for you.</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.accentSoft, border: `1px solid ${T.accentBorder}` }}>
                        <FileText size={16} color={T.accent} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>
                        {resumeStatus === 'uploaded' ? <span>Resume uploaded <span style={{ color: T.accent }}>✓</span></span> : 'No resume yet'}
                      </span>
                    </div>
                    <Link to="/resume-upload" style={{ textDecoration: 'none' }}>
                      <motion.button whileHover={{ x: 3 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: T.accent, background: 'none', border: 'none', cursor: 'pointer' }}>
                        {resumeStatus === 'uploaded' ? 'Update' : 'Upload'}
                        <ChevronRight size={14} />
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Right sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Personal Profile */}
              <motion.div initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: 'relative', overflow: 'hidden', borderRadius: 20, padding: 28, background: T.cardBg, border: `1px solid ${T.cardBorder}` }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: 128, height: 128, borderRadius: '50%', pointerEvents: 'none', background: `radial-gradient(circle, ${T.accentGlow} 0%, transparent 70%)` }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.accentSoft }}>
                    <Cpu size={12} color={T.accent} />
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: 0 }}>Personal Profile</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { label: 'Name', value: userProfile?.name || clerkUser?.fullName || "Not Available" },
                    { label: 'Email', value: userProfile?.email || clerkUser?.primaryEmailAddress?.emailAddress || "Not Available" },
                    { label: 'Member Since', value: userProfile?.createdAt ? new Date(userProfile.createdAt).toDateString() : "N/A" },
                    { label: 'Sessions', value: String(userProfile?.completed_sessions || 0) },
                  ].map(({ label, value }, i) => (
                    <motion.div key={label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 600, color: T.accent + 'bb' }}>{label}</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Growth Hub */}
              <motion.div initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.42, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: 'relative', overflow: 'hidden', borderRadius: 20, padding: 28, background: T.cardBg, border: `1px solid ${T.accentBorder}` }}>
                <div style={{ position: 'absolute', top: 0, right: 24, transform: 'translateY(-50%)' }}>
                  <span style={{ padding: '4px 12px', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', borderRadius: 999, background: T.pageBg, color: T.accent, border: `1px solid ${T.accentBorder}` }}>Growth Hub</span>
                </div>
                <blockquote style={{ fontSize: 12, fontStyle: 'italic', lineHeight: 1.7, color: T.textMuted, borderLeft: `2px solid ${T.accent}55`, paddingLeft: 12, margin: '12px 0 24px' }}>
                  "Confidence comes from preparation. Master your story, refine your skills."
                </blockquote>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                  {["Confidence", "Communication", "System Design", "Problem Solving"].map(topic => (
                    <TopicPill key={topic} topic={topic} active={activeTopic === topic} onClick={() => setActiveTopic(topic)} T={T} />
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  {activeTopic && (
                    <motion.div key={activeTopic} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}
                      style={{ fontSize: 12, lineHeight: 1.7, minHeight: 56, borderRadius: 12, padding: 16, background: T.accentSoft, border: `1px solid ${T.accentBorder}`, color: T.textMuted }}>
                      {topicContent[activeTopic]}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}