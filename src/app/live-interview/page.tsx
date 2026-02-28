import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  StreamVideoClient,
  StreamVideo,
  StreamCall,
  ParticipantView,
  useCallStateHooks,
  useCall,
} from "@stream-io/video-react-sdk";
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff,
  Cpu, Info, CheckCircle, Loader2, ChevronRight
} from 'lucide-react';

const API_KEY = import.meta.env.VITE_STREAM_API_KEY || import.meta.env.VITE_NEXT_PUBLIC_STREAM_API_KEY;

interface Question {
  id: string;
  text: string;
}

interface Feedback {
  strengths: string[];
  improvements: string[];
  overall_feedback: string;
  rating: string;
}

// ─── Text-to-Speech ───────────────────────────────────────────────────────────


// ─── Main Interview UI ────────────────────────────────────────────────────────
const AIInterviewUI: React.FC = () => {
  const call = useCall();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const { useMicrophoneState, useCameraState, useCallEndedAt, useLocalParticipant } = useCallStateHooks();
  const { microphone } = useMicrophoneState();
  const { camera } = useCameraState();
  const callEndedAt = useCallEndedAt();
  const localParticipant = useLocalParticipant();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [analyzingAnswer, setAnalyzingAnswer] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [allFeedback, setAllFeedback] = useState<{ question: string; feedback: Feedback }[]>([]);

  

  const [voiceState, setVoiceState] = useState<
  "idle" | "ai_speaking" | "listening" | "processing"
>("idle");
  const [lastTranscript, setLastTranscript] = useState("");


      const speakText = (text: string, onEnd?: () => void) => {
        window.speechSynthesis.cancel();
        setVoiceState("ai_speaking");

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.92;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onend = () => {
          setVoiceState("idle");
          onEnd?.();
        };

        window.speechSynthesis.speak(utterance);
      };

  const recognitionRef = React.useRef<any>(null);

useEffect(() => {
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.warn("Speech Recognition not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  recognition.onresult = (event: any) => {
  const transcript = event.results[0][0].transcript;
  console.log("🎤 User said:", transcript);

  setLastTranscript(transcript);
  setVoiceState("idle");
  };

  recognition.onerror = (event: any) => {
  console.error("Speech recognition error:", event);
  setVoiceState("idle");
};

  recognitionRef.current = recognition;
}, [currentIndex]);

  // ── Fetch AI Questions ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = await getToken();
        const res = await fetch('/api/generate-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        const qs: Question[] = (data.questions as string[]).map((q, i) => ({
          id: `q${i}`,
          text: q,
        }));
        setQuestions(qs);
        setLoadingQuestions(false);
        speakText(qs[0]?.text || '');
      } catch (err) {
        console.error('Failed to fetch questions:', err);
        setLoadingQuestions(false);
      }
    };
    fetchQuestions();
  }, []);

  // ── Speak on question change ───────────────────────────────────────────────
  useEffect(() => {
  if (questions[currentIndex]) {
    speakText(questions[currentIndex].text, () => {
      setTimeout(() => {
        setVoiceState("listening");
        recognitionRef.current?.start();
      }, 400);
    });
  }
}, [currentIndex, questions]);

  // ── Navigate if call ends ──────────────────────────────────────────────────
  useEffect(() => {
    if (callEndedAt) navigate('/dashboard');
  }, [callEndedAt, navigate]);

  // ── Submit Answer ──────────────────────────────────────────────────────────
  const handleSubmitAnswer = async (spokenAnswer: string) => {
  if (!spokenAnswer || !spokenAnswer.trim()) {
    setVoiceState("idle");
    return;
  }

  if (analyzingAnswer) return; // Prevent double submission

  setVoiceState("processing");
  setAnalyzingAnswer(true);
  setFeedback(null);

  try {
    const token = await getToken();

    const res = await fetch('/api/analyze-answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        question: questions[currentIndex]?.text || "",
        answer: spokenAnswer,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to analyze answer");
    }

    const data = await res.json();

    if (!data?.feedback) {
      throw new Error("Invalid feedback response");
    }

    setFeedback(data.feedback);

    setAllFeedback(prev => [
      ...prev,
      {
        question: questions[currentIndex]?.text || "",
        feedback: data.feedback,
      }
    ]);

  } catch (err) {
    console.error("Analyze error:", err);
  } finally {
  setAnalyzingAnswer(false);
  setVoiceState("idle");

  setTimeout(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setFeedback(null);
      setLastTranscript("");
    } else {
      setSessionComplete(true);
    }
  }, 2500);
}
};
  // ── Next Question ──────────────────────────────────────────────────────────
  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      recognitionRef.current?.stop();
      setFeedback(null);
    } else {
      setSessionComplete(true);
      window.speechSynthesis.cancel();
    }
  };

  // ── Media Controls ─────────────────────────────────────────────────────────
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
    window.speechSynthesis.cancel();
    recognitionRef.current?.stop();

    if (microphone.enabled) {
      await microphone.disable();
    }

    if (camera.enabled) {
      await camera.disable();
    }

    await call?.leave();
  } catch (err) {
    console.error("Error ending call:", err);
  } finally {
    setVoiceState("idle");
    setLastTranscript("");
    navigate('/dashboard');
  }
}, [call, navigate, microphone, camera]);

  // ── Session Complete ───────────────────────────────────────────────────────
  if (sessionComplete) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card p-12 max-w-2xl w-full text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-heading font-bold text-accent-brown mb-2">Interview Complete!</h1>
          <p className="text-accent-brown/60 mb-10">Here's a summary of your performance.</p>

          <div className="space-y-6 text-left mb-10">
            {allFeedback.map((item, i) => (
              <div key={i} className="p-6 bg-accent-brown/5 rounded-20 border border-accent-brown/10">
                <p className="text-xs uppercase tracking-widest text-accent-brown/40 mb-2">Q{i + 1}</p>
                <p className="font-bold text-accent-brown mb-4">{item.question}</p>
                <div className="mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.feedback.rating === 'Excellent' ? 'bg-green-100 text-green-700' :
                    item.feedback.rating === 'Good' ? 'bg-blue-100 text-blue-700' :
                    item.feedback.rating === 'Average' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>{item.feedback.rating}</span>
                </div>
                <p className="text-sm text-accent-brown/70">{item.feedback.overall_feedback}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="premium-button-primary w-full"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Loading Screen ─────────────────────────────────────────────────────────
  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-accent-brown animate-spin" />
        <p className="text-accent-brown/60 font-heading tracking-widest text-sm uppercase">
          Generating questions from your resume...
        </p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  // ── Main UI ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full bg-[#FDFCFB] text-accent-brown flex flex-col">

      {/* Header */}
      <header className="w-full flex justify-between items-center px-8 py-6 z-10 glass-panel border-b border-accent-brown/5">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Cpu className="w-5 h-5" />
          <span className="font-heading font-bold text-xl">MockPrep</span>
        </Link>
        <div className="flex items-center gap-2 text-sm text-accent-brown/60">
          <span className="font-bold text-accent-brown">{currentIndex + 1}</span>
          <span>of</span>
          <span className="font-bold text-accent-brown">{questions.length}</span>
          <span>questions</span>
        </div>
      </header>

      <main className="flex-grow w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 pb-32">

        {/* USER VIDEO */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative premium-card overflow-hidden bg-black rounded-28"
          style={{ minHeight: '400px' }}
        >
          {localParticipant && camera.enabled ? (
            <ParticipantView
              participant={localParticipant}
              trackType="videoTrack"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white/30">
              <VideoOff size={60} />
            </div>
          )}
        </motion.div>

        {/* AI PANEL */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="premium-card bg-white p-8 rounded-28 flex flex-col gap-6"
        >
          {/* Question */}
          <div>
  <span className="text-xs uppercase tracking-widest text-accent-brown/40">
    Question {currentIndex + 1}
  </span>

  <AnimatePresence mode="wait">
    <motion.p
      key={currentQuestion?.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="text-2xl font-heading mt-3 leading-snug"
    >
      {currentQuestion?.text}
    </motion.p>
  </AnimatePresence>

  {/* 🔊 AI Speaking Indicator */}
  {voiceState === "ai_speaking" && (
    <div className="flex items-center gap-3 mt-4">
      <div className="w-3 h-3 bg-accent-brown rounded-full animate-pulse" />
      <p className="text-sm text-accent-brown/60">
        AI is speaking...
      </p>
    </div>
  )}

  {/* 🎤 Listening Indicator with Wave Animation */}
  {voiceState === "listening" && (
    <div className="flex items-center gap-3 mt-4">
      <div className="flex gap-1">
        <div className="w-1 bg-accent-brown animate-wave1" />
        <div className="w-1 bg-accent-brown animate-wave2" />
        <div className="w-1 bg-accent-brown animate-wave3" />
      </div>
      <p className="text-sm text-green-600 font-semibold">
        Listening...
      </p>
    </div>
  )}

  {/* ⚙️ Processing Indicator */}
  {voiceState === "processing" && (
    <div className="flex items-center gap-3 mt-4">
      <Loader2 className="w-4 h-4 animate-spin text-accent-brown" />
      <p className="text-sm text-accent-brown/60">
        Analyzing your answer...
      </p>
    </div>
  )}
</div>

          

          {/* Submit Button */}
          {!feedback && (
  <button
    onClick={() => {
      recognitionRef.current?.stop();
      handleSubmitAnswer(lastTranscript);
    }}
    disabled={analyzingAnswer}
    className="flex items-center justify-center gap-3 px-6 py-4 bg-accent-brown text-white rounded-full font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-mocha transition-colors"
  >
    {analyzingAnswer ? (
      <>
        <Loader2 className="w-4 h-4 animate-spin" />
        Analyzing your answer...
      </>
    ) : (
      <>
        <CheckCircle className="w-4 h-4" />
        Submit Answer
      </>
    )}
  </button>
)}


          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-accent-brown/5 rounded-20 border border-accent-brown/10 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest font-bold text-accent-brown/40">AI Feedback</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    feedback.rating === 'Excellent' ? 'bg-green-100 text-green-700' :
                    feedback.rating === 'Good' ? 'bg-blue-100 text-blue-700' :
                    feedback.rating === 'Average' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>{feedback.rating}</span>
                </div>

                <p className="text-sm text-accent-brown/80">{feedback.overall_feedback}</p>

                {feedback.strengths?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-green-600 mb-2">✓ Strengths</p>
                    <ul className="text-xs text-accent-brown/70 space-y-1">
                      {feedback.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                    </ul>
                  </div>
                )}

                {feedback.improvements?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-orange-500 mb-2">↑ Areas to Improve</p>
                    <ul className="text-xs text-accent-brown/70 space-y-1">
                      {feedback.improvements.map((s, i) => <li key={i}>• {s}</li>)}
                    </ul>
                  </div>
                )}

                <button
                  onClick={handleNextQuestion}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent-brown text-white rounded-full font-bold text-sm hover:bg-accent-mocha transition-colors mt-2"
                >
                  {currentIndex < questions.length - 1 ? (
                    <><ChevronRight className="w-4 h-4" /> Next Question</>
                  ) : (
                    <><CheckCircle className="w-4 h-4" /> Finish Interview</>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tip */}
          {!feedback && (
            <div className="p-4 bg-accent-brown/5 rounded-16 border border-accent-brown/10 flex items-start gap-3">
              <Info className="w-4 h-4 text-accent-brown shrink-0 mt-0.5" />
              <p className="text-xs text-accent-brown/60">
                Take your time. Submit when you're ready — there's no timer pressure.
              </p>
            </div>
          )}
        </motion.div>
      </main>

      {/* Controls */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 px-10 py-6 glass-panel rounded-full shadow-lg z-50 border border-white"
      >
        <button onClick={toggleMic} className={`p-4 rounded-full transition-colors ${isMicMuted ? 'bg-red-100 text-red-600' : 'bg-accent-brown/10 hover:bg-accent-brown/20'}`}>
          {isMicMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
        <button onClick={toggleCamera} className={`p-4 rounded-full transition-colors ${isCameraOff ? 'bg-red-100 text-red-600' : 'bg-accent-brown/10 hover:bg-accent-brown/20'}`}>
          {isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}
        </button>
        <button onClick={endCall} className="px-8 py-4 bg-red-500 text-white rounded-full font-bold flex items-center gap-3 hover:bg-red-600 transition-colors">
          <PhoneOff size={20} /> Exit
        </button>
      </motion.div>
    </div>
  );
};

// ─── Page Wrapper ─────────────────────────────────────────────────────────────
export default function LiveInterviewPage() {
  const { user: clerkUser, isSignedIn } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const interviewId = searchParams.get('interviewId');

  const [client, setClient] = useState<any | null>(null);
  const [call, setCall] = useState<any>(null);

  useEffect(() => {
    if (!isSignedIn || !clerkUser) { navigate('/dashboard'); return; }

    const setupStreamClient = async () => {
      if (!API_KEY) { console.error('Stream API Key missing.'); return; }

      try {
        const response = await fetch('/api/stream-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: clerkUser.id }),
        });
        const data = await response.json();
        if (!data.token) throw new Error("No token received.");

        const streamClient = new StreamVideoClient({
          apiKey: API_KEY,
          user: {
            id: clerkUser.id,
            name: clerkUser.fullName || clerkUser.id,
            image: clerkUser.imageUrl,
          },
          token: data.token,
        });

        setClient(streamClient);

        await navigator.mediaDevices.getUserMedia({ video: true, audio: true }).catch(console.warn);

        const callId = interviewId || `interview-${Date.now()}`;
        const newCall = streamClient.call('default', callId);
        await newCall.join({ create: true });
        setCall(newCall);
      } catch (error) {
        console.error('Stream setup failed:', error);
      }
    };

    setupStreamClient();
  }, [isSignedIn, clerkUser, navigate, interviewId]);

  if (!client || !call) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-accent-brown animate-spin" />
        <p className="text-accent-brown/50 text-sm">Initializing Interview...</p>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <AIInterviewUI />
      </StreamCall>
    </StreamVideo>
  );
}