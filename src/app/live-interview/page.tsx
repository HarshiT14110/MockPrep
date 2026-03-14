import React, { useEffect, useState, useCallback } from 'react';
import * as blazeface from "@tensorflow-models/blazeface";
import AIRecruiterAvatar from "../../components/AIRecruiterAvatar.js";
import recruiterAvatar from "../../assets/recruiter.png";
import darkLogo from "../../assets/dark-logo.png";
import { motion, AnimatePresence } from 'motion/react';
import {
  StreamVideoClient, StreamVideo, StreamCall,
  ParticipantView, useCallStateHooks, useCall,
} from "@stream-io/video-react-sdk";
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff,
  Cpu, Info, CheckCircle, Loader2, ChevronRight
} from 'lucide-react';
const API = import.meta.env.VITE_API_URL || "https://mockprep-backend-0eaw.onrender.com";
const API_KEY = import.meta.env.VITE_STREAM_API_KEY || import.meta.env.VITE_NEXT_PUBLIC_STREAM_API_KEY;

/* ════════════════════════════════════════
   DESIGN TOKENS  (warm espresso + amber-gold)
════════════════════════════════════════ */
const T = {
  pageBg:        '#130f09',
  sidebarBg:     '#1c1409',
  cardBg:        '#1e1710',
  cardBorder:    'rgba(255,200,100,0.07)',
  headerBg:      'rgba(19,15,9,0.92)',
  accent:        '#c9820a',
  accentSoft:    'rgba(201,130,10,0.14)',
  accentBorder:  'rgba(201,130,10,0.24)',
  accentGlow:    'rgba(201,130,10,0.10)',
  text:          '#f5e6c8',
  textMuted:     'rgba(245,230,200,0.40)',
  textDim:       'rgba(245,230,200,0.18)',
  green:         '#4ade80',
  greenSoft:     'rgba(74,222,128,0.12)',
  greenBorder:   'rgba(74,222,128,0.25)',
  orange:        '#fb923c',
  orangeSoft:    'rgba(251,146,60,0.12)',
  red:           '#f87171',
  redSoft:       'rgba(248,113,113,0.15)',
};

/* ════ Interfaces (original – untouched) ════ */
interface Question { id: string; text: string; }
interface Feedback {
  strengths: string[]; improvements: string[];
  overall_feedback: string; rating: string;
}
interface AIInterviewUIProps {
  client: any;
  call: any;
  setClient: React.Dispatch<any>;
  user: any;
}

/* ════ Voice Wave Bars ════ */
const WaveBars: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <motion.div
        key={i}
        animate={{ scaleY: [0.4, 1, 0.4] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
        style={{
          width: 3, height: 18, borderRadius: 2,
          background: T.accent, transformOrigin: 'center',
        }}
      />
    ))}
  </div>
);

/* ════ Rating Badge ════ */
const ratingStyle = (rating: string): React.CSSProperties => {
  if (rating === 'Excellent') return { background: T.greenSoft, color: T.green, border: `1px solid ${T.greenBorder}` };
  if (rating === 'Good')      return { background: T.accentSoft, color: T.accent, border: `1px solid ${T.accentBorder}` };
  if (rating === 'Average')   return { background: T.orangeSoft, color: T.orange, border: `1px solid rgba(251,146,60,0.3)` };
  return { background: T.redSoft, color: T.red, border: `1px solid rgba(248,113,113,0.3)` };
};

/* ════════════════════════════════════════
   AI INTERVIEW UI
════════════════════════════════════════ */
const AIInterviewUI: React.FC<AIInterviewUIProps> = ({ client, call, setClient, user }) => {
  const navigate = useNavigate();
  const interviewType =
  new URLSearchParams(window.location.search).get("type") || "technical";
  const getToken = () => localStorage.getItem("token");
  const { useMicrophoneState, useCameraState, useCallEndedAt, useLocalParticipant } = useCallStateHooks();
  const { microphone } = useMicrophoneState();
  const { camera } = useCameraState();
  const callEndedAt = useCallEndedAt();
  const localParticipant = useLocalParticipant();
  const [aiMouthLevel, setAiMouthLevel] = useState(0);
  const [questions, setQuestions]         = useState<Question[]>([]);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [currentIndex, setCurrentIndex]   = useState(0);
  
  const questionLimit =
  interviewType === "hr" || interviewType === "behavioral"
    ? 6
    : 5;
  
  
  const [isMicMuted, setIsMicMuted]       = useState(false);
  const [isCameraOff, setIsCameraOff]     = useState(false);
  const [feedback, setFeedback]           = useState<Feedback | null>(null);
  const [analyzingAnswer, setAnalyzingAnswer] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [allFeedback, setAllFeedback]     = useState<{ question: string; feedback: Feedback }[]>([]);
  const [voiceState, setVoiceState]       = useState<"idle"|"ai_speaking"|"listening"|"processing">("idle");
  const [audioLevel, setAudioLevel] = useState(0);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [lastTranscript, setLastTranscript] = useState("");
  const [warningCount, setWarningCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [faceModel, setFaceModel] = useState<any>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  
  const speakText = (text: string, onEnd?: () => void) => {

  window.speechSynthesis.cancel();
  setVoiceState("ai_speaking");

  const utterance = new SpeechSynthesisUtterance(text);

  const voices = speechSynthesis.getVoices();
  const maleVoice =
    voices.find(v => v.name.includes("Google US English")) ||
    voices.find(v => v.name.includes("Male")) ||
    voices[0];

  if (maleVoice) utterance.voice = maleVoice;

  utterance.rate = 0.92;
  utterance.pitch = 0.95;

  let audioContext: any;
  let analyser: any;
  let dataArray: Uint8Array;

  utterance.onstart = () => {

    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 64;
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    const detect = () => {

      analyser.getByteFrequencyData(dataArray);

      const avg =
        dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

      setAiMouthLevel(avg / 255);

      if (voiceState === "ai_speaking") {
        requestAnimationFrame(detect);
      }
    };

    detect();
  };

  utterance.onend = () => {
    setVoiceState("idle");
    setAiMouthLevel(0);
    onEnd?.();
  };

  speechSynthesis.speak(utterance);
};

  const recognitionRef = React.useRef<any>(null);

  const triggerFaceWarning = (reason: string) => {

  setWarningCount(prev => {

    const next = prev + 1;

    setShowWarning(true);

    setTimeout(() => {
      setShowWarning(false);
    }, 3000);

    if (next >= 3) {
      alert("Interview ended due to suspicious camera activity.");
      endCall();
    }

    return next;

  });

};


  const startInterview = () => {
  setInterviewStarted(true);

  const elem = document.documentElement;

  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if ((elem as any).webkitRequestFullscreen) {
    (elem as any).webkitRequestFullscreen();
  } else if ((elem as any).msRequestFullscreen) {
    (elem as any).msRequestFullscreen();
  }
};

  useEffect(() => {
  const handleUnload = () => {
    try {
      window.speechSynthesis.cancel();
      recognitionRef.current?.stop();

      call?.camera?.disable().catch(() => {});
      call?.microphone?.disable().catch(() => {});
    } catch (err) {
      console.warn("Cleanup error:", err);
    }
  };

  window.addEventListener("beforeunload", handleUnload);

  return () => {
    window.removeEventListener("beforeunload", handleUnload);
  };
}, [call]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { console.warn("Speech Recognition not supported."); return; }
    const recognition = new SpeechRecognition();
    recognition.continuous = false; recognition.interimResults = false; recognition.lang = "en-US";
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setLastTranscript(transcript); setVoiceState("idle");
    };
    recognition.onerror = (event: any) => { console.error("Speech recognition error:", event); setVoiceState("idle"); };
    recognitionRef.current = recognition;
  }, [currentIndex]);


    useEffect(() => {

  if (!interviewStarted) return;

  let audioContext: any;
  let analyser: any;
  let microphone: any;
  let stream: any;

  const startAudioDetection = async () => {

    stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    audioContext = new AudioContext();

    analyser = audioContext.createAnalyser();

    microphone = audioContext.createMediaStreamSource(stream);

    microphone.connect(analyser);

    const data = new Uint8Array(analyser.frequencyBinCount);

    const detect = () => {

  if (!interviewStarted) return;

  analyser.getByteFrequencyData(data);

  const avg = data.reduce((a, b) => a + b, 0) / data.length;

  setAudioLevel(avg);

  const score = Math.min(100, Math.round(avg / 2));

  setConfidenceScore(score);

  requestAnimationFrame(detect);
};

    detect();
  };

  startAudioDetection();

  return () => {
    stream?.getTracks().forEach((t: any) => t.stop());
    audioContext?.close();
  };

}, [interviewStarted]);


  useEffect(() => {
  const loadModel = async () => {
    const model = await blazeface.load();
    setFaceModel(model);
  };

  loadModel();
}, []);



  useEffect(() => {
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
  };

  window.addEventListener("keydown", handleKey);

  return () => {
    window.removeEventListener("keydown", handleKey);
  };
}, []);


  useEffect(() => {

  const triggerWarning = () => {
    setWarningCount(prev => {
      const next = prev + 1;

      setShowWarning(true);

      setTimeout(() => {
        setShowWarning(false);
      }, 3000);

      if (next >= 3) {
        alert("Interview ended due to suspicious activity.");
        endCall();
      }

      return next;
    });
  };

  const handleVisibility = () => {
    if (document.hidden) {
      triggerWarning();
    }
  };

  const handleBlur = () => {
    triggerWarning();
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      triggerWarning();
    }
  };

  document.addEventListener("visibilitychange", handleVisibility);
  window.addEventListener("blur", handleBlur);
  document.addEventListener("fullscreenchange", handleFullscreen);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibility);
    window.removeEventListener("blur", handleBlur);
    document.removeEventListener("fullscreenchange", handleFullscreen);
  };

}, []);



  useEffect(() => {
    const fetchQuestions = async () => {
      if (!interviewStarted) return;
      try {
        const token = getToken();

/* detect interview type from URL */
const interviewType =
  new URLSearchParams(window.location.search).get("type") || "technical";

let endpoint = `${API}/api/generate-questions`;
let method = "POST";

if (interviewType === "hr" || interviewType === "behavioral") {
  endpoint = `${API}/api/interview-questions?type=${interviewType}`;
  method = "GET";
}

const res = await fetch(endpoint, {
  method,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
});
        const data = await res.json();
        const qs: Question[] = (data.questions as string[]).map((q, i) => ({ id: `q${i}`, text: q }));
        setQuestions(qs); setLoadingQuestions(false); speakText(qs[0]?.text || '');
      } catch (err) { console.error('Failed to fetch questions:', err); setLoadingQuestions(false); }
    };
    fetchQuestions();
  }, [interviewStarted]);

  useEffect(() => {
    if (questions[currentIndex]) {
      speakText(questions[currentIndex].text, () => {
        setTimeout(() => { setVoiceState("listening"); 
          try {
  recognitionRef.current?.stop();
  setTimeout(() => {
    recognitionRef.current?.start();
  }, 150);
} catch {}
         }, 400);
      });
    }
  }, [currentIndex, questions]);

  
  useEffect(() => {

  if (!faceModel || !interviewStarted || !videoRef.current) return;

  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    })
    .catch(() => {});

  const interval = setInterval(async () => {

    if (!videoRef.current) return;

    const predictions = await faceModel.estimateFaces(videoRef.current, false);

    if (predictions.length === 0) {
      triggerFaceWarning("No face detected");
    }

    if (predictions.length > 1) {
      triggerFaceWarning("Multiple faces detected");
    }

    if (predictions.length === 1) {

      const face = predictions[0];

      const leftEye = face.landmarks[0];
      const rightEye = face.landmarks[1];

      const eyeDistance = Math.abs(leftEye[0] - rightEye[0]);

      if (eyeDistance < 20) {
        triggerFaceWarning("Looking away from screen");
      }

    }

  }, 3000);

  return () => clearInterval(interval);

}, [faceModel, interviewStarted]);


  useEffect(() => { if (callEndedAt) navigate('/dashboard'); }, [callEndedAt, navigate]);

  const handleSubmitAnswer = async (spokenAnswer: string) => {
    if (!spokenAnswer || !spokenAnswer.trim()) { setVoiceState("idle"); return; }
    if (analyzingAnswer) return;
    setVoiceState("processing"); setAnalyzingAnswer(true); setFeedback(null);
    try {
      const token = getToken();
      const res = await fetch(`${API}/api/analyze-answer`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ question: questions[currentIndex]?.text || "", answer: spokenAnswer }) });
      if (!res.ok) throw new Error("Failed to analyze answer");
      const data = await res.json();
      if (!data?.feedback) throw new Error("Invalid feedback response");
      setFeedback(data.feedback);
      setAllFeedback(prev => [...prev, { question: questions[currentIndex]?.text || "", feedback: data.feedback }]);
    } catch (err) { console.error("Analyze error:", err); }
    finally {
      setAnalyzingAnswer(false); setVoiceState("idle");
      setTimeout(() => {

  recognitionRef.current?.stop();

  if (currentIndex < questionLimit - 1) {

    setCurrentIndex(prev => prev + 1);
    setFeedback(null);
    setLastTranscript("");

  } else {

    setSessionComplete(true);
    window.speechSynthesis.cancel();

  }

}, 1500);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questionLimit - 1) { setCurrentIndex(prev => prev + 1); recognitionRef.current?.stop(); setFeedback(null); }
    else { setSessionComplete(true); window.speechSynthesis.cancel(); }
  };

  const toggleMic = useCallback(async () => {
    if (!call) return;
    if (microphone.enabled) { await microphone.disable(); setIsMicMuted(true); }
    else { await microphone.enable(); setIsMicMuted(false); }
  }, [microphone, call]);

  const toggleCamera = useCallback(async () => {
    if (!call) return;
    if (camera.enabled) { await camera.disable(); setIsCameraOff(true); }
    else { await camera.enable(); setIsCameraOff(false); }
  }, [camera, call]);

  const endCall = useCallback(async () => {
    try {
      window.speechSynthesis.cancel(); recognitionRef.current?.stop();
      if (call?.camera) await call.camera.disable().catch(() => {});
     if (call?.microphone) await call.microphone.disable().catch(() => {});

// Force stop all device tracks
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => stream.getTracks().forEach(track => track.stop()))
  .catch(() => {});
      await call?.leave().catch(() => {}); await client?.disconnectUser().catch(() => {});
      setClient(null);
      setTimeout(() => navigate("/dashboard"), 300);
    } catch (err) { console.error("Exit error:", err); }
  }, [call, client, navigate, setClient]);

  const [finalReport, setFinalReport]   = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
  if (!sessionComplete) return;

  const cleanupMedia = async () => {
    try {
      window.speechSynthesis.cancel();
      recognitionRef.current?.stop();

      if (call?.camera) {
        await call.camera.disable().catch(() => {});
      }

      if (call?.microphone) {
        await call.microphone.disable().catch(() => {});
      }

      // Stop browser media tracks completely
      
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => stream.getTracks().forEach(track => track.stop()))
    .catch(() => {});

    } catch (err) {
      console.warn("Media cleanup error:", err);
    }
  };

  cleanupMedia();

  const generateReport = async () => {
    try {
      setReportLoading(true);

      const token = getToken();

      const res = await fetch(`${API}/api/generate-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          feedbackList: allFeedback
        })
      });

      const data = await res.json();

      setFinalReport(data.report);

    } catch (err) {
      console.error("Report generation failed:", err);
    } finally {
      setReportLoading(false);
    }
  };

  generateReport();

}, [sessionComplete]);
  /* ── Session Complete ── */
  if (sessionComplete) {
    return (
      <div style={{ minHeight: '100vh', background: T.pageBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {showWarning && (
  <motion.div
    initial={{ y: -40, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{
      position: "fixed",
      top: 20,
      left: "50%",
      transform: "translateX(-50%)",
      background: "#f87171",
      color: "#fff",
      padding: "10px 20px",
      borderRadius: 8,
      fontWeight: 600,
      zIndex: 9999,
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
    }}
  >
    ⚠ Please stay on the interview screen ({warningCount}/3)
  </motion.div>
)}
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ maxWidth: 720, width: '100%', borderRadius: 24, padding: 48, background: T.cardBg, border: `1px solid ${T.cardBorder}`, position: 'relative', overflow: 'hidden' }}
        >
          {/* Corner glow */}
          <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: `radial-gradient(circle, ${T.accentGlow} 0%, transparent 70%)`, pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: T.accentSoft, border: `1px solid ${T.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={18} color={T.accent} />
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 700, color: T.text, margin: 0, letterSpacing: '-0.5px' }}>Interview Report Card</h1>
          </div>
          <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 36 }}>Candidate: {user?.fullName}</p>

          {reportLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: T.textMuted, padding: '24px 0' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${T.accentBorder}`, borderTopColor: T.accent, animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: 14 }}>Generating Final Report…</span>
            </div>
          )}

          {finalReport && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

              {/* Strengths */}
              <div style={{ borderRadius: 16, padding: 20, background: T.greenSoft, border: `1px solid ${T.greenBorder}` }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: T.green, marginBottom: 14 }}>⭐ Strengths</p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 0, margin: 0, listStyle: 'none' }}>
                  {finalReport.strengths?.map((s: string, i: number) => (
                    <li key={i} style={{ fontSize: 13, color: T.text, display: 'flex', gap: 8 }}>
                      <span style={{ color: T.green }}>•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div style={{ borderRadius: 16, padding: 20, background: T.orangeSoft, border: `1px solid rgba(251,146,60,0.25)` }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: T.orange, marginBottom: 14 }}>📈 Areas of Improvement</p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 0, margin: 0, listStyle: 'none' }}>
                  {finalReport.improvements?.map((s: string, i: number) => (
                    <li key={i} style={{ fontSize: 13, color: T.text, display: 'flex', gap: 8 }}>
                      <span style={{ color: T.orange }}>•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Overall */}
              <div style={{ borderRadius: 16, padding: 20, background: T.accentSoft, border: `1px solid ${T.accentBorder}` }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: T.accent, marginBottom: 8 }}>Overall Rating</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 10 }}>{finalReport.overall_rating}</p>
                <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.7, margin: 0 }}>{finalReport.overall_summary}</p>
              </div>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/dashboard")}
            style={{ marginTop: 32, width: '100%', padding: '14px 0', borderRadius: 14, border: 'none', background: `linear-gradient(135deg, ${T.accent} 0%, #9a5806 100%)`, color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: `0 4px 20px ${T.accent}44` }}
          >
            Back to Dashboard
          </motion.button>
        </motion.div>
      </div>
    );
  }

  /* ── Loading ── */
  if (loadingQuestions) {
    if (!interviewStarted) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#130f09",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 32,
        color: "#f5e6c8"
      }}
    >

      <h1 style={{ fontSize: 28, fontWeight: 700 }}>
        Camera & Microphone Check
      </h1>

      <p style={{ color: "rgba(245,230,200,0.5)", fontSize: 14 }}>
        Make sure your camera and microphone are working before starting.
      </p>

      <div
        style={{
          width: 420,
          height: 260,
          borderRadius: 18,
          overflow: "hidden",
          background: "#000",
          border: "1px solid rgba(255,200,100,0.1)"
        }}
      >
        {localParticipant && camera.enabled ? (
          <ParticipantView participant={localParticipant} trackType="videoTrack" />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            Camera Off
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 20 }}>

        <button
          onClick={toggleMic}
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            border: "none",
            background: "#c9820a",
            color: "#fff",
            cursor: "pointer"
          }}
        >
          Toggle Mic
        </button>

        <button
          onClick={toggleCamera}
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            border: "none",
            background: "#c9820a",
            color: "#fff",
            cursor: "pointer"
          }}
        >
          Toggle Camera
        </button>

      </div>

      <button
        onClick={startInterview}
        style={{
          marginTop: 10,
          padding: "14px 40px",
          borderRadius: 12,
          border: "none",
          fontWeight: 700,
          fontSize: 16,
          background: "linear-gradient(135deg,#c9820a,#9a5806)",
          color: "#fff",
          cursor: "pointer"
        }}
      >
        Start Interview
      </button>

      <p style={{ fontSize: 11, opacity: 0.4 }}>
        Interview will start in fullscreen mode
      </p>

    </div>
  );
}
    return (
      <div style={{ minHeight: '100vh', background: T.pageBg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: `2px solid ${T.accentBorder}`, borderTopColor: T.accent, animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.25em', color: T.textMuted }}>Generating questions from your resume…</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  /* ── Main UI ── */
  return (
    <div style={{ minHeight: '100vh', width: '100%', background: T.pageBg, color: T.text, display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif', boxSizing: 'border-box' }}>
      
      
      {showWarning && (
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#f87171",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: 8,
          fontWeight: 600,
          zIndex: 9999
        }}
      >
        ⚠ Suspicious Activity Detected ({warningCount}/3)
      </motion.div>
    )}
      
      
      
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <header style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px', zIndex: 10, background: T.headerBg, borderBottom: `1px solid ${T.cardBorder}`, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxSizing: 'border-box' }}>
          <Link
              to="/dashboard"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 12
              }}
            >

              <img
                src={darkLogo}
                alt="MockPrep"
                style={{
                  height: 38,
                  width: "auto",
                  objectFit: "contain"
                }}
              />

              <span
                style={{
                  fontWeight: 700,
                  fontSize: 20,
                  color: T.text
                }}
              >
                MockPrep
              </span>

            </Link>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Progress bar */}
          <div style={{ width: 140, height: 4, borderRadius: 4, background: T.accentSoft, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{ height: '100%', background: T.accent, borderRadius: 4 }}
            />
          </div>
          <span style={{ fontSize: 13, color: T.textMuted }}>
            <span style={{ color: T.accent, fontWeight: 700 }}>{currentIndex + 1}</span>
            {' / '}
            <span style={{ fontWeight: 700, color: T.text }}>{questionLimit}</span>
          </span>
        </div>
      </header>

      {/* Main Grid */}
      <main style={{ flex: 1, width: '100%', maxWidth: 1600, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: '28px 32px 120px', boxSizing: 'border-box' }}>

        {/* USER VIDEO */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ position: 'relative', background: '#0a0807', borderRadius: 20, overflow: 'hidden', minHeight: 400, border: `1px solid ${T.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {localParticipant && camera.enabled ? (
            <div style={{ width: "100%", height: "100%" }}>
  <ParticipantView participant={localParticipant} trackType="videoTrack" />
  <video
  ref={videoRef}
  autoPlay
  muted
  playsInline
  style={{ display: "none" }}
/>
</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <VideoOff size={52} color={T.textDim} />
              <span style={{ fontSize: 13, color: T.textDim }}>Camera off</span>
            </div>
          )}

          {/* Camera status pill */}
          <div style={{ position: 'absolute', bottom: 16, left: 16, padding: '6px 14px', borderRadius: 999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: isMicMuted ? T.red : T.green }} />
            <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>{isMicMuted ? 'Muted' : 'Live'}</span>
          </div>
        </motion.div>

        {/* AI PANEL */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ background: T.cardBg, borderRadius: 20, padding: 32, display: 'flex', flexDirection: 'column', gap: 24, border: `1px solid ${T.cardBorder}`, position: 'relative', overflow: 'hidden' }}
        >
          {/* Corner glow */}
          <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: `radial-gradient(circle, ${T.accentGlow} 0%, transparent 70%)`, pointerEvents: 'none' }} />


          {/* AI Recruiter Avatar */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 10
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 10
                }}
              >

                <AIRecruiterAvatar
                  speaking={voiceState === "ai_speaking"}
                  mouthLevel={aiMouthLevel}
                />
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#f5e6c8"
                    }}
                  >
                    AI Recruiter
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(245,230,200,0.5)"
                    }}
                  >
                    Senior Hiring Manager
                  </div>
                </div>

              </div>

              

            </div>


          {/* Question */}
          <div style={{ position: 'relative' }}>
            <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700, color: T.accent + 'aa' }}>
              Question {currentIndex + 1} / {questionLimit}
            </span>

            <AnimatePresence mode="wait">
              <motion.p
                key={currentQuestion?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                style={{ fontSize: 22, fontWeight: 700, color: T.text, marginTop: 10, lineHeight: 1.45, marginBottom: 0 }}
              >
                {currentQuestion?.text}
              </motion.p>
            </AnimatePresence>

            {/* Voice state indicators */}
            {voiceState === "ai_speaking" && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }}
                  style={{ width: 8, height: 8, borderRadius: '50%', background: T.accent }} />
                <span style={{ fontSize: 12, color: T.textMuted }}>AI is speaking…</span>
              </div>
            )}

            {voiceState === "listening" && (
              
            <div style={{ display: "flex", gap: 4 }}>

              {[1,2,3,4,5].map((i) => {

                const height = Math.max(6, audioLevel / 10);

                return (
                  <motion.div
                    key={i}
                    animate={{
                      height: height + Math.random() * 12
                    }}
                    transition={{
                      duration: 0.2
                    }}
                    style={{
                      width: 4,
                      background: "#4ade80",
                      borderRadius: 2
                    }}
                  />
                );
              })}

            </div> )}

            {voiceState === "listening" && lastTranscript && (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: "rgba(245,230,200,0.6)",
                  background: "rgba(255,255,255,0.04)",
                  padding: "8px 12px",
                  borderRadius: 8
                }}
              >
                You said: {lastTranscript}
              </div>
            )}

            {voiceState === "processing" && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${T.accentBorder}`, borderTopColor: T.accent, animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontSize: 12, color: T.textMuted }}>Analyzing your answer…</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          {!feedback && (
            <motion.button
              whileHover={{ scale: analyzingAnswer ? 1 : 1.02 }}
              whileTap={{ scale: analyzingAnswer ? 1 : 0.97 }}
              onClick={() => { recognitionRef.current?.stop(); handleSubmitAnswer(lastTranscript); }}
              disabled={analyzingAnswer}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '14px 24px', borderRadius: 14, border: 'none',
                background: analyzingAnswer ? T.accentSoft : `linear-gradient(135deg, ${T.accent} 0%, #9a5806 100%)`,
                color: analyzingAnswer ? T.textMuted : '#fff',
                fontWeight: 700, fontSize: 14, cursor: analyzingAnswer ? 'not-allowed' : 'pointer',
                boxShadow: analyzingAnswer ? 'none' : `0 4px 16px ${T.accent}44`,
                transition: 'all 0.3s ease',
              }}
            >
              {analyzingAnswer ? (
                <>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${T.accentBorder}`, borderTopColor: T.accent, animation: 'spin 0.8s linear infinite' }} />
                  Analyzing your answer…
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Submit Answer
                </>
              )}
            </motion.button>
          )}

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ padding: 20, background: T.accentSoft, borderRadius: 16, border: `1px solid ${T.accentBorder}`, display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 700, color: T.textDim }}>AI Feedback</span>
                  <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, ...ratingStyle(feedback.rating) }}>
                    {feedback.rating}
                  </span>
                </div>

                <p style={{ fontSize: 13, color: T.text, lineHeight: 1.65, margin: 0 }}>{feedback.overall_feedback}</p>

                {feedback.strengths?.length > 0 && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: T.green, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>✓ Strengths</p>
                    <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {feedback.strengths.map((s, i) => (
                        <li key={i} style={{ fontSize: 12, color: T.textMuted, display: 'flex', gap: 8 }}>
                          <span style={{ color: T.green }}>•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {feedback.improvements?.length > 0 && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: T.orange, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>↑ Areas to Improve</p>
                    <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {feedback.improvements.map((s, i) => (
                        <li key={i} style={{ fontSize: 12, color: T.textMuted, display: 'flex', gap: 8 }}>
                          <span style={{ color: T.orange }}>•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleNextQuestion}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${T.accent} 0%, #9a5806 100%)`, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: `0 4px 16px ${T.accent}44`, marginTop: 4 }}
                >
                  {currentIndex < questions.length - 1 ? (
                    <><ChevronRight size={16} /> Next Question</>
                  ) : (
                    <><CheckCircle size={16} /> Finish Interview</>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>


            {/* Confidence Meter */}

<div
  style={{
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    background: "rgba(74,222,128,0.08)",
    border: "1px solid rgba(74,222,128,0.2)"
  }}
>

  <div
    style={{
      fontSize: 11,
      color: "#4ade80",
      fontWeight: 700,
      marginBottom: 6
    }}
  >
    Speaking Confidence
  </div>

  <div
    style={{
      width: "100%",
      height: 6,
      background: "rgba(255,255,255,0.1)",
      borderRadius: 6,
      overflow: "hidden"
    }}
  >

    <motion.div
      animate={{ width: `${confidenceScore}%` }}
      transition={{ duration: 0.4 }}
      style={{
        height: "100%",
        background: "#4ade80"
      }}
    />

  </div>

</div>


          {/* Tip */}
          {!feedback && (
            <div style={{ padding: 16, background: T.accentSoft, borderRadius: 12, border: `1px solid ${T.accentBorder}`, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <Info size={14} color={T.accent} style={{ marginTop: 1, flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: T.textMuted, margin: 0, lineHeight: 1.6 }}>
                Take your time. Submit when you're ready — there's no timer pressure.
              </p>
            </div>
          )}
        </motion.div>
      </main>

      {/* Controls Bar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '16px 32px', borderRadius: 999, zIndex: 50,
          background: T.cardBg,
          border: `1px solid ${T.cardBorder}`,
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        }}
      >
        {/* Mic */}
        <motion.button
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
          onClick={toggleMic}
          style={{ width: 52, height: 52, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isMicMuted ? T.redSoft : T.accentSoft, color: isMicMuted ? T.red : T.accent, transition: 'all 0.25s ease' }}
        >
          {isMicMuted ? <MicOff size={22} /> : <Mic size={22} />}
        </motion.button>

        {/* Camera */}
        <motion.button
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
          onClick={toggleCamera}
          style={{ width: 52, height: 52, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isCameraOff ? T.redSoft : T.accentSoft, color: isCameraOff ? T.red : T.accent, transition: 'all 0.25s ease' }}
        >
          {isCameraOff ? <VideoOff size={22} /> : <Video size={22} />}
        </motion.button>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: T.cardBorder }} />

        {/* End Call */}
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={endCall}
          style={{ padding: '12px 24px', borderRadius: 999, border: 'none', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 16px rgba(239,68,68,0.4)' }}
        >
          <PhoneOff size={18} /> Exit
        </motion.button>
      </motion.div>
    </div>
  );
};

/* ════════════════════════════════════════
   PAGE WRAPPER  (original logic untouched)
════════════════════════════════════════ */
export default function LiveInterviewPage() {
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "/dashboard";
}

const payload = JSON.parse(atob(token.split(".")[1]));

const isSignedIn = true;

const user = {
  id: payload.userId,
  fullName: "User"
};
  const navigate = useNavigate();
  
  const [searchParams] = useSearchParams();
  const interviewId = searchParams.get('interviewId');
  const [client, setClient] = useState<any | null>(null);
  const [call, setCall]     = useState<any>(null);
  const initialized = React.useRef(false);

  useEffect(() => {

  if (initialized.current) return;
  initialized.current = true;

  if (!isSignedIn || !user) {
    navigate("/dashboard");
    return;
  }

  const setupStreamClient = async () => {
    if (!API_KEY) {
      console.error("Stream API Key missing.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

const response = await fetch(`${API}/api/stream-token`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({ userId: user.id })
});
      const data = await response.json();

      if (!data.token) throw new Error("No token received.");

      const streamClient = StreamVideoClient.getOrCreateInstance({
  apiKey: API_KEY,
  user: {
    id: user.id,
    name: user.fullName || "User"
  },
  token: data.token
});

      setClient(streamClient);

      await navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .catch(console.warn);

      const callId = interviewId || `interview-${Date.now()}`;
      const newCall = streamClient.call("default", callId);

      await newCall.join({ create: true });

      setCall(newCall);

    } catch (error) {
      console.error("Stream setup failed:", error);
    }
  };

  setupStreamClient();

}, [isSignedIn, user, navigate, interviewId]);

  if (!client || !call) {
    return (
      <div style={{ minHeight: '100vh', background: '#130f09', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(201,130,10,0.2)', borderTopColor: '#c9820a', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: 13, color: 'rgba(245,230,200,0.4)' }}>Initializing Interview…</p>
      </div>
    );
  }

  

  return client ? (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <AIInterviewUI client={client} call={call} setClient={setClient} user={user} />
      </StreamCall>
    </StreamVideo>
  ) : null;
}