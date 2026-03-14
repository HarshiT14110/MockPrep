import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';  
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
import AIOrb from "../../components/dashboard/AIOrb.js";
import AnimatedBackground from "../../components/AnimatedBackground.js";
import DashboardScrollHero from "../../components/dashboard/DashboardScrollHero.js";
import AIChatbot from "../../components/dashboard/AIChatbot.js"
  import { useScroll } from "motion/react"
  import Footer from "../../components/Footer.js"

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
  id: string;
  name: string;
  email: string;
  bits?: number;

  plan?: "free" | "pro";   // 👈 ADD THIS LINE

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

  atsScore: number;
  atsSummary: string;

  missingKeywords: string[];
  detectedSkills: string[];
  improvements: string[];
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
      style={{
  position: 'relative',
  overflow: 'hidden',
  borderRadius: 16,
  padding: 24,
  cursor: 'pointer',
  background: T.cardBg,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: `1px solid ${T.cardBorder}`,
}}>
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

  const token = localStorage.getItem("token");
  const isSignedIn = !!token;
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTopic, setActiveTopic] = useState<string | null>("Confidence");
  const [showATS, setShowATS] = useState(false);
  const [atsLoading, setAtsLoading] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const T: Theme = isDark ? DARK : LIGHT;
  const [showSidebar,setShowSidebar] = useState(false);
  const [flipBits, setFlipBits] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { scrollY } = useScroll()
useEffect(() => {

  const unsubscribe = scrollY.on("change", (y) => {

    if (y > window.innerHeight * 0.8) {
      setShowSidebar(true)

      if (!acceptedTerms) {
        setShowTerms(true)
      }

    } else {
      setShowSidebar(false)
    }

  })

  return () => unsubscribe()

}, [acceptedTerms, scrollY])



// 👇 ADD THIS FUNCTION HERE

const handleCheckATS = async () => {

  if (!dashboardData?.userProfile?.resume_text) return;

  try {

    setAtsLoading(true);

    const token = localStorage.getItem("token");

    const res = await fetch("/api/ats-score", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();

    setDashboardData(prev =>
      prev
        ? {
            ...prev,
            atsScore: data.score || 0,
            atsSummary: data.summary || "",
            missingKeywords: data.missing_keywords || [],
            detectedSkills: data.detected_skills || [],
            improvements: data.improvements || []
          }
        : prev
    );

    setShowATS(true);

  } catch (err) {

    console.error("ATS check failed", err);

  } finally {

    setAtsLoading(false);

  }

};

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isSignedIn) {
  setLoading(false);
  return;
}
      setLoading(true); setError(null);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch('/api/dashboard-data', { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error(`Failed to fetch dashboard data: ${response.status}`);
        const data = await response.json();
        const userProfile = data.user;
        let atsScore = 0;
        let atsSummary = "";
        let missingKeywords: string[] = [];
        let detectedSkills: string[] = [];
        let improvements: string[] = [];
        const totalInterviews = userProfile?.completed_sessions || 0;
        const performanceData = [{ name: 'Technical', value: 45 }, { name: 'Behavioral', value: 35 }, { name: 'Logic', value: 20 }];
        const weakAreas = ['System Design', 'Concurrency', 'Public Speaking'];
        const suggestedTopics = ['Microservices', 'Event Loops', 'Confidence'];
        setDashboardData({
          userProfile,
          totalInterviews,
          performanceData,
          weakAreas,
          suggestedTopics,
          resumeStatus: userProfile?.resume_text ? 'uploaded' : 'not_uploaded',
          atsScore,
          atsSummary,
          missingKeywords,
          detectedSkills,
          improvements
        });
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data.');
      } finally { setLoading(false); }
    };
    fetchDashboardData();
  }, [isSignedIn]);

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

  const {
  userProfile,
  totalInterviews,
  performanceData,
  resumeStatus,
  atsScore,
  atsSummary,
  missingKeywords,
  detectedSkills,
  improvements
} = dashboardData;
  const calculatedScore = userProfile?.completed_sessions ? Math.min(userProfile.completed_sessions * 10, 100) : 0;
  const topicContent: Record<string, string> = {
    Confidence: "Practice mock interviews consistently. Record yourself, review body language, and improve clarity. Confidence grows with repetition and structured preparation.",
    Communication: "Use structured answers like STAR method. Focus on clarity, brevity, and impact. Avoid filler words and maintain steady pacing.",
    "System Design": "Break problems into components. Discuss scalability, trade-offs, and bottlenecks. Interviewers evaluate structured thinking more than perfection.",
    "Problem Solving": "Think out loud. Clarify constraints before coding. Optimize after achieving a correct baseline solution.",
  };

  const SIDEBAR_W = 66;
  const RIGHT_SIDEBAR_W = 66;

  return (
    
    <div style={{ width: '100vw', maxWidth: '100vw', overflowX: 'hidden', minHeight: '100vh', background: T.pageBg, color: T.text, boxSizing: 'border-box', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
<AnimatedBackground/>
<style>
{`
@keyframes lowBitsBlink {
0% { opacity: 1 }
50% { opacity: 0.2 }
100% { opacity: 1 }
}
`}
</style>
      {/* SIDEBAR */}

      {/* LEFT SIDEBAR */}

<aside
style={{
position: 'fixed',
left: 0,
top: 0,
bottom: 0,
width: SIDEBAR_W,

transform: showSidebar ? "translateX(0)" : "translateX(-100%)",
transition: "transform 0.6s ease",

display: 'flex',
flexDirection: 'column',
alignItems: 'center',
justifyContent: 'space-between',

padding: '28px 0',

background: T.sidebarBg,
borderRight: `1px solid ${T.cardBorder}`,
zIndex: 50
}}
>

{/* MOCKPREP VERTICAL TEXT */}

<motion.div
initial={{ opacity: 0, scale: 0.8 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.6 }}
style={{
flex: 1,
display: "flex",
alignItems: "center",
justifyContent: "center"
}}
>

<div
style={{
fontFamily: "AngelRhapsody",
fontSize: 30,
letterSpacing: "0.25em",
color: T.accent,

writingMode: "vertical-rl",
transform: "rotate(180deg)",

textShadow: `0 0 12px ${T.accent}`,
userSelect: "none"
}}
>
MockPrep
</div>

</motion.div>


{/* BOTTOM CONTROLS */}

<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ delay: 0.6 }}
style={{
display: "flex",
flexDirection: "column",
alignItems: "center",
gap: 16
}}
>

<DarkModeToggle />

<button
  onClick={() => {
    localStorage.removeItem("token");
    window.location.href = "/";
  }}
  style={{
    padding: "6px 12px",
    fontSize: 11,
    borderRadius: 8,
    border: `1px solid ${T.accentBorder}`,
    background: T.accentSoft,
    color: T.text,
    cursor: "pointer"
  }}
>
Logout
</button>

</motion.div>

</aside>


              {/* RIGHT SIDEBAR */}

{/* RIGHT SIDEBAR (mirror of left) */}

<aside
style={{
position:'fixed',
right:0,
top:0,
bottom:0,
width:RIGHT_SIDEBAR_W,

transform: showSidebar ? "translateX(0)" : "translateX(100%)",
transition:"transform 0.6s ease",

display:"flex",
alignItems:"center",
justifyContent:"center",

background:T.sidebarBg,
borderLeft:`1px solid ${T.cardBorder}`,
zIndex:50,
overflow:"visible"
}}
>

<motion.div
animate={{ y: [300, -1200] }}
transition={{
duration: 18,
repeat: Infinity,
ease: "linear"
}}
style={{
writingMode: "vertical-rl",
textOrientation: "mixed",
fontFamily: "AngelRhapsody",
fontSize: 42,
fontWeight: 800,
letterSpacing: "0.25em",
color: T.accent,
textShadow: `0 0 16px ${T.accent}`,
whiteSpace: "nowrap",
}}
>
Level up your interview game with realistic mock interviews, AI feedback, and smarter preparation.
</motion.div>

{/* AI ORB */}
<motion.div
animate={{ y: [0, -8, 0] }}
transition={{
duration: 2.2,
repeat: Infinity,
ease: "easeInOut"
}}
style={{
position: "absolute",
bottom: 20,
right: 0,   // pushes orb slightly outside sidebar
width: 120,
height: 120,
display: "flex",
alignItems: "center",
justifyContent: "center",
pointerEvents: "none"
}}
>
</motion.div>

</aside>

      {/* CONTENT */}
    <div
style={{
marginLeft: showSidebar ? SIDEBAR_W : 0,
marginRight: showSidebar ? RIGHT_SIDEBAR_W : 0,

width: showSidebar
  ? `calc(100% - ${SIDEBAR_W + RIGHT_SIDEBAR_W}px)`
  : "100%",

transition: "all 0.6s ease",

boxSizing: "border-box",
overflowX: "hidden"
}}
>
        {/* HEADER */}
        

       {/* HERO FIRST */}
<DashboardScrollHero />

{/* MAIN DASHBOARD */}
<main
style={{
padding:32,
maxWidth:1400,
margin:'0 auto',
position:"relative"
}}
>

<div
style={{
position: "absolute",
top: -120,
left: 0,
right: 0,
height: 180,
pointerEvents: "none",
background: isDark
  ? "linear-gradient(to bottom, transparent, rgba(19,15,9,0.85))"
  : "linear-gradient(to bottom, transparent, rgba(255,255,255,0.9))"
}}
/>




          {/* Stat Cards */}
          <div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 16,
  marginBottom: 28
}}>
            <StatCard label="Total Sessions" value={totalInterviews} icon={PlayCircle} delay={0.1} T={T} />
            <StatCard label="Resume Status" value={resumeStatus === 'uploaded' ? <span>Uploaded <span style={{ color: T.accent }}>✓</span></span> : 'Not Uploaded'} icon={FileText} delay={0.18} T={T} />
             
             
             <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              style={{
                position: 'relative',
                borderRadius: 16,
                padding: 24,
                background: T.cardBg,
                border: `1px solid ${T.cardBorder}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >

            <div>
            <p style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              fontWeight: 600,
              color: T.textMuted
            }}>
            ATS Resume Score
            </p>

            <p
            style={{
            fontSize: 24,
            fontWeight: 700,
            color: T.text
            }}
            >
            {resumeStatus !== "uploaded"
              ? "Upload Resume"
              : atsScore === 0
              ? "Check ATS"
              : `${atsScore}/100`}
            </p>
            </div>

           <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>

{/* CHECK ATS BUTTON */}

{atsScore === 0 && resumeStatus === "uploaded" && (

<motion.button
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
onClick={handleCheckATS}
style={{
padding:"6px 12px",
fontSize:10,
borderRadius:8,
border:`1px solid ${T.accentBorder}`,
background:T.accentSoft,
color:T.text,
cursor:"pointer",
fontWeight:600,
letterSpacing:"0.08em",
textTransform:"uppercase"
}}
>
{atsLoading ? "Checking..." : "Check ATS Score"}

</motion.button>

)}

{/* VIEW REPORT BUTTON */}

{atsScore > 0 && (

<motion.button
whileHover={{ scale: 1.15 }}
whileTap={{ scale: 0.95 }}
onClick={() => setShowATS(true)}
style={{
width:42,
height:42,
borderRadius:10,
border:`1px solid ${T.accentBorder}`,
background:T.accentSoft,
display:"flex",
alignItems:"center",
justifyContent:"center",
cursor:"pointer"
}}
>

👁️

</motion.button>

)}

</div>
            </motion.div>


          </div>

          {/* Main grid */}
<div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>

            {/* Left */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

              {/* Performance Hub */}
              <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: 'relative', overflow: 'hidden', borderRadius: 20, padding: 32, background: isDark 
  ? "rgba(30,23,16,0.65)"
  : "rgba(255,255,255,0.65)",
backdropFilter: "blur(20px)",
WebkitBackdropFilter: "blur(20px)", border: `1px solid ${T.cardBorder}` }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(260px, 1fr))', gap: 32, alignItems: 'center' }}>
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
                          <Tooltip contentStyle={{ background: isDark 
  ? "rgba(30,23,16,0.65)"
  : "rgba(255,255,255,0.65)",
backdropFilter: "blur(20px)",
WebkitBackdropFilter: "blur(20px)", border: `1px solid ${T.cardBorder}`, borderRadius: 12, fontSize: 12, color: T.text }} />
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
              <div style={{
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 20,
  alignItems: "start"
}}>

                  



                {/* New Session */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4, transition: { duration: 0.22 } }}
                  style={{ position: 'relative', overflow: 'hidden', borderRadius: 20, padding: 22, background: `linear-gradient(135deg, ${T.accent} 0%, #9a5806 100%)` }}>
                  <div style={{ position: 'absolute', right: -32, bottom: -32, width: 120, height: 120, borderRadius: '50%', background: 'rgba(0,0,0,0.10)', pointerEvents: 'none' }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <Sparkles size={14} color="rgba(255,235,180,0.7)" />
                      <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.22em', fontWeight: 600, color: 'rgba(255,235,180,0.6)' }}>AI‑Powered</span>
                    </div>
                   <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1.3, margin: '0 0 8px' }}>
                    Practice smarter.
                    </h3>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', maxWidth: 200, lineHeight: 1.6, margin: '0 0 16px' }}>Launch a new AI‑powered session customized for your domain.</p>
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
                  style={{ position: 'relative', overflow: 'hidden', borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: isDark 
  ? "rgba(30,23,16,0.65)"
  : "rgba(255,255,255,0.65)",
backdropFilter: "blur(20px)",
WebkitBackdropFilter: "blur(20px)", border: `1px solid ${T.cardBorder}` }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.accentSoft }}>
                        <Target size={12} color={T.accent} />
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, margin: 0 }}>Resume Intelligence</h3>
                    </div>
                    <p style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.6, margin: 0 }}>Our AI analyzes your experience to tailor questions specifically for you.</p>
                    {resumeStatus === "uploaded" && atsSummary && (
                      <p style={{
                        marginTop: 12,
                        fontSize: 11,
                        color: T.textMuted,
                        lineHeight: 1.6
                      }}>
                        {atsSummary}
                      </p>
                    )}
                  </div>


                      {/* Level + AI Suggestions */}

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr",
                            gap: 12
                          }}
                        >



                        </div>



                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
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


           

            {/* Right sidebar */}<div
style={{
display: 'flex',
flexDirection: 'column',
gap: 28
}}
>

              {/* Personal Profile */}
              <motion.div initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: 'relative', overflow: 'hidden', borderRadius: 20, padding: 28, background: isDark 
  ? "rgba(30,23,16,0.65)"
  : "rgba(255,255,255,0.65)",
backdropFilter: "blur(20px)",
WebkitBackdropFilter: "blur(20px)", border: `1px solid ${T.cardBorder}` }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: 128, height: 128, borderRadius: '50%', pointerEvents: 'none', background: `radial-gradient(circle, ${T.accentGlow} 0%, transparent 70%)` }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.accentSoft }}>
                    <Cpu size={12} color={T.accent} />
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
<h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: 0 }}>
Personal Profile
</h3>

{userProfile?.plan === "pro" && (
<span style={{
fontSize:9,
padding:"4px 8px",
borderRadius:999,
background:T.accent,
color:"#fff",
fontWeight:700,
letterSpacing:"0.1em"
}}>
PRO
</span>
)}

</div>
                </div>
                <div
style={{
display: "grid",
gridTemplateColumns: "1fr auto",
gap: 20,
alignItems: "start"
}}
>

{/* LEFT SIDE → PROFILE INFO */}

<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

{[
  {
  label: 'Name',
  value: (
    <>
      {userProfile?.plan === "pro" && (
        <span style={{ marginRight: 6 }}>👑</span>
      )}
      {userProfile?.name || "Not Available"}
    </>
  )
},
  { label: 'Email', value: userProfile?.email || "Not Available" },
  { label: 'Member Since', value: userProfile?.createdAt ? new Date(userProfile.createdAt).toDateString() : "N/A" },
  { label: 'Sessions', value: String(userProfile?.completed_sessions || 0) },
].map(({ label, value }, i) => (

<motion.div
key={label}
initial={{ opacity: 0, x: -10 }}
animate={{ opacity: 1, x: 0 }}
transition={{ delay: 0.4 + i * 0.1 }}
style={{ display: 'flex', flexDirection: 'column', gap: 2 }}
>

<span style={{
fontSize: 9,
textTransform: 'uppercase',
letterSpacing: '0.18em',
fontWeight: 600,
color: T.accent + 'bb'
}}>
{label}
</span>

<span style={{
fontSize: 12,
fontWeight: 500,
color: T.text,
overflow: 'hidden',
textOverflow: 'ellipsis',
whiteSpace: 'nowrap'
}}>
{value}
</span>

</motion.div>

))}

</div>


{/* RIGHT SIDE → BITS BOX */}
<div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
<div
style={{
perspective:1000
}}
>

<motion.div

onHoverStart={()=>setFlipBits(true)}
onHoverEnd={()=>setFlipBits(false)}

animate={{ rotateY: flipBits ? 180 : 0 }}

transition={{ duration:0.6 }}

style={{
position:"relative",
width:120,
height:120,

transformStyle:"preserve-3d",

cursor:"pointer"
}}
>


{/* FRONT SIDE */}

<div
style={{

position:"absolute",
inset:0,

display:"flex",
flexDirection:"column",
alignItems:"center",
justifyContent:"center",

borderRadius:14,

background:`linear-gradient(135deg, ${T.accentSoft}, transparent)`,

border:`1px solid ${T.accentBorder}`,

boxShadow:`0 8px 24px ${T.accent}22`,

backfaceVisibility:"hidden"

}}
>

<div style={{
width:42,
height:42,
borderRadius:10,

display:"flex",
alignItems:"center",
justifyContent:"center",

background:T.accentSoft,
border:`1px solid ${T.accentBorder}`,

marginBottom:6
}}>
⚡
</div>

<span style={{
fontSize:9,
letterSpacing:"0.2em",
textTransform:"uppercase",
fontWeight:700,
color:T.accent
}}>
Bits
</span>

<span style={{
fontSize:28,
fontWeight:800,
color:T.text
}}>
{userProfile?.bits ?? 0}
</span>

</div>


{/* BACK SIDE */}

<div
style={{

position:"absolute",
inset:0,

display:"flex",
alignItems:"center",
justifyContent:"center",

borderRadius:14,

background:T.accent,

color:"#fff",

fontSize:14,
fontWeight:700,

transform:"rotateY(180deg)",

backfaceVisibility:"hidden"
}}
>

<button
onClick={()=>window.location.href="/become-pro"}

style={{
background:"transparent",
border:"none",
color:"#fff",
fontWeight:700,
cursor:"pointer"
}}
>

Purchase Bits

</button>

</div>


</motion.div>
</div>
{userProfile?.bits !== undefined && userProfile.bits < 3 && (

<div
style={{
marginTop:8,
fontSize:11,
fontWeight:700,
color:"#ff5757",
animation:"lowBitsBlink 1.2s infinite"
}}
>

⚠ Only {userProfile?.bits} Bits Left

</div>

)}</div>

</div>
              </motion.div>



              {/* Growth Hub */}
              <motion.div initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.42, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: 'relative', overflow: 'hidden', borderRadius: 20, padding: 28, background: isDark 
  ? "rgba(30,23,16,0.65)"
  : "rgba(255,255,255,0.65)",
backdropFilter: "blur(20px)",
WebkitBackdropFilter: "blur(20px)", border: `1px solid ${T.accentBorder}` }}>
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
        <Footer T={T} isDark={isDark} />

        <AIChatbot />
        <AnimatePresence>


                  

{showTerms && (

<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}

style={{
position: "fixed",
inset: 0,
background: "rgba(0,0,0,0.55)",
backdropFilter: "blur(6px)",
display: "flex",
alignItems: "center",
justifyContent: "center",
zIndex: 1100
}}
>

<motion.div
initial={{ scale: 0.85, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
exit={{ scale: 0.85, opacity: 0 }}

style={{
  width: "min(640px, 90vw)",
borderRadius: 22,
padding: 36,

background: isDark
? "rgba(30,23,16,0.75)"
: "rgba(255,255,255,0.85)",

backdropFilter: "blur(20px)",

border: `1px solid ${T.cardBorder}`,
boxShadow: "0 30px 60px rgba(0,0,0,0.35)"
}}
>

<h2 style={{
fontSize: 26,
fontWeight: 700,
marginBottom: 16
}}>
Terms & Conditions
</h2>


<p style={{fontSize:13,color:T.textMuted,marginBottom:20}}>
MockPrep uses AI processing which consumes Bits from your account.
Please review the usage rules below.
</p>


<div style={{
display:"flex",
flexDirection:"column",
gap:10,
fontSize:13,
lineHeight:1.7
}}>

<p>⚡ Chatbot Question → <b>1 Bit</b></p>

<p>🎤 Start Interview → <b>3 Bits</b></p>

<p>📊 ATS Score Check → <b>2 Bits</b></p>

<p>📄 ATS Detailed Report → <b>4 Bits</b></p>

<p>📑 Final Interview Report → <b>5 Bits</b></p>

<p style={{
marginTop:10,
padding:10,
borderRadius:10,
background:T.accentSoft,
border:`1px solid ${T.accentBorder}`
}}>
Currently you have <b>{userProfile?.bits ?? 0} Bits</b> in your Bank.
</p>

</div>


<div style={{
marginTop:24,
display:"flex",
alignItems:"center",
gap:10
}}>

<input
type="checkbox"
checked={acceptedTerms}
onChange={(e)=>setAcceptedTerms(e.target.checked)}
/>

<span style={{fontSize:13}}>
I agree to the Bits usage policy
</span>

</div>


<button
disabled={!acceptedTerms}
onClick={()=>{
setShowTerms(false)
}}

style={{
marginTop:20,
width:"100%",
padding:"12px",
borderRadius:12,
border:"none",
background: acceptedTerms ? T.accent : "#999",
color:"#fff",
fontWeight:600,
cursor: acceptedTerms ? "pointer" : "not-allowed"
}}
>

Continue to Dashboard

</button>

</motion.div>
</motion.div>

)}




          {showATS && (

          <motion.div
            onClick={() => setShowATS(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
          >

          <motion.div
          onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", stiffness: 160 }}
            style={{
              width: 720,
              maxHeight: "85vh",
              overflowY: "auto",
              borderRadius: 22,
              padding: 36,
              background: isDark 
  ? "rgba(30,23,16,0.65)"
  : "rgba(255,255,255,0.65)",
backdropFilter: "blur(20px)",
WebkitBackdropFilter: "blur(20px)",
              border: `1px solid ${T.cardBorder}`,
              boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
              fontFamily: "Inter, sans-serif"
            }}
            >

            <div style={{ marginBottom: 28 }}>

              <h2 style={{
              fontSize: 28,
              fontWeight: 700,
              fontFamily: "Space Grotesk",
              letterSpacing: "-0.5px"
              }}>
              AI Resume Intelligence
              </h2>

              <p style={{
              fontSize: 13,
              color: T.textMuted
              }}>
              Advanced ATS analysis generated from your resume
              </p>

              </div>

          <div style={{ marginBottom: 24 }}>
            <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 28,
            padding: "10px 18px",
            borderRadius: 999,
            background: T.accentSoft,
            border: `1px solid ${T.accentBorder}`
            }}
            >

            <span style={{ fontWeight: 600 }}>ATS Score</span>

            <span style={{
            fontWeight: 700,
            fontSize: 18,
            color: T.accent,
textShadow: `0 0 10px ${T.accent}66`
            }}>
            {atsScore}/100
            </span>

            </motion.div>
          </div>

          {missingKeywords.length > 0 && (

<div style={{
marginBottom: 28,
padding: 20,
borderRadius: 14,
background: T.accentSoft,
border: `1px solid ${T.accentBorder}`
}}>

<h3 style={{
fontSize: 16,
fontWeight: 600,
marginBottom: 12
}}>
Missing Keywords
</h3>

<div style={{
display: "flex",
flexWrap: "wrap",
gap: 8
}}>
{missingKeywords.map((k,i)=>(
<span key={i} style={{
padding: "6px 12px",
fontSize: 12,
borderRadius: 999,
background: "#ff5757",
color: "#fff",
fontWeight: 500
}}>
{k}
</span>
))}
</div>

</div>

)}

          {detectedSkills.length > 0 && (

<div style={{
marginBottom: 28,
padding: 20,
borderRadius: 14,
background: T.accentSoft,
border: `1px solid ${T.accentBorder}`
}}>

<h3 style={{
fontSize: 16,
fontWeight: 600,
marginBottom: 12
}}>
Detected Skills
</h3>

<div style={{
display: "flex",
flexWrap: "wrap",
gap: 8
}}>
{detectedSkills.map((s,i)=>(
<span key={i} style={{
padding: "6px 12px",
fontSize: 12,
borderRadius: 999,
background: "#2ecc71",
color: "#fff",
fontWeight: 500
}}>
{s}
</span>
))}
</div>

</div>

)}

          {improvements.length > 0 && (

<div style={{
padding: 20,
borderRadius: 14,
background: T.accentSoft,
border: `1px solid ${T.accentBorder}`
}}>

<h3 style={{
fontSize: 16,
fontWeight: 600,
marginBottom: 12
}}>
Suggested Improvements
</h3>

<ul style={{ paddingLeft: 18 }}>
{improvements.map((s,i)=>(
<li key={i} style={{ marginBottom: 6 }}>
{s}
</li>
))}
</ul>

</div>

)}

         <motion.button
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
onClick={() => setShowATS(false)}
style={{
marginTop: 30,
padding: "12px 28px",
borderRadius: 12,
border: "none",
background: T.accent,
color: "#fff",
fontWeight: 600,
cursor: "pointer",
boxShadow: "0 8px 18px rgba(0,0,0,0.25)"
}}
>
Close Report
</motion.button>

          </motion.div>
          </motion.div>

          )}
          </AnimatePresence>
          
      </div>
    </div>
  );
}