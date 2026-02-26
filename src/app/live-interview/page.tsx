import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StreamVideoClient, StreamVideo, Call, useCallStateHooks, useCall, useStreamVideoClient } from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { useUser } from '@clerk/clerk-react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Settings,
  ChevronRight,
  Timer,
  Cpu,
  Sparkles,
  Info
} from 'lucide-react';

const API_KEY = import.meta.env.VITE_STREAM_API_KEY || import.meta.env.VITE_NEXT_PUBLIC_STREAM_API_KEY;

interface Question {
  id: string;
  text: string;
  duration: number; // in seconds
}

const mockQuestions: Question[] = [
  { id: 'q1', text: 'Tell me about yourself and your journey in technology.', duration: 60 },
  { id: 'q2', text: 'Why are you interested in joining our team specifically?', duration: 90 },
  { id: 'q3', text: 'Describe a challenging project where you had to lead a group.', duration: 120 },
  { id: 'q4', text: 'What are your core strengths and areas for growth?', duration: 60 },
  { id: 'q5', text: 'Do you have any questions for our team today?', duration: 30 },
];

const AIInterviewUI: React.FC = () => {
  const call = useCall();
  const client = useStreamVideoClient();
  const navigate = useNavigate();
  const { useMicrophoneState, useCameraState, useCallEndedAt } = useCallStateHooks();
  const { microphone } = useMicrophoneState();
  const { camera } = useCameraState();
  const callEndedAt = useCallEndedAt();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(mockQuestions[0].duration);
  const [progress, setProgress] = useState(100);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  useEffect(() => {
    if (callEndedAt) {
      console.log('Call ended at:', callEndedAt);
      navigate('/dashboard');
    }
  }, [navigate, callEndedAt]);

  useEffect(() => {
    const question = mockQuestions[currentQuestionIndex];
    setTimer(question.duration);
    setProgress(100);

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (currentQuestionIndex < mockQuestions.length - 1) {
            setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
          } else {
            console.log('Interview ended!');
            // call?.endCall(); // Temporarily commented out
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestionIndex, call]);

  useEffect(() => {
    const question = mockQuestions[currentQuestionIndex];
    setProgress((timer / question.duration) * 100);
  }, [timer, currentQuestionIndex]);

  const toggleMic = useCallback(async () => {
    if (call) {
      if (microphone.enabled) {
        await microphone.disable();
      } else {
        await microphone.enable();
      }
      setIsMicMuted(!microphone.enabled);
    }
  }, [call, microphone]);

  const toggleCamera = useCallback(async () => {
    if (call) {
      if (camera.enabled) {
        await camera.disable();
      } else {
        await camera.enable();
      }
      setIsCameraOff(!camera.enabled);
    }
  }, [call, camera]);

  const endCall = useCallback(async () => {
    if (call) {
      await call.leave();
    }
    console.log('Call ended!');
    navigate('/dashboard');
  }, [navigate, call]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const currentQuestion = mockQuestions[currentQuestionIndex];

  return (
    <div className="min-h-screen w-full bg-[#FDFCFB] text-accent-brown flex flex-col items-center">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent-mocha/5 rounded-full blur-[120px] animate-pulse-soft" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent-brown/5 rounded-full blur-[120px] animate-pulse-soft" />
      </div>

      {/* Header */}
      <header className="w-full flex justify-between items-center px-8 py-6 z-10 glass-panel border-b border-accent-brown/5">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-accent-brown/5 rounded-12 flex items-center justify-center group-hover:bg-accent-brown group-hover:text-primary-bg transition-all shadow-sm">
            <Cpu className="w-5 h-5" />
          </div>
          <span className="font-heading font-bold text-xl">MockPrep</span>
        </Link>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-accent-brown/5 rounded-full border border-accent-brown/10">
            <Sparkles className="w-4 h-4 text-accent-brown" />
            <span className="text-[10px] font-bold uppercase tracking-widest">AI EVALUATOR ACTIVE</span>
          </div>
          <div className="flex items-center gap-2 text-accent-mocha">
            <Timer className="w-4 h-4" />
            <span className="text-sm font-mono font-bold">{formatTime(timer)}</span>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-[1600px] grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 z-10">
        {/* User Video Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative premium-card overflow-hidden bg-gray-100 group"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {isCameraOff ? (
              <div className="flex flex-col items-center gap-4 text-accent-brown/20 scale-150">
                <VideoOff className="w-20 h-20" />
                <span className="text-sm font-bold uppercase tracking-widest">Camera Off</span>
              </div>
            ) : (
              <div className="w-full h-full bg-accent-brown/5 flex flex-col items-center justify-center p-12 text-center text-accent-brown/30">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md mb-6 animate-float">
                  <Video className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-heading mb-2">Live Feed Ready</h3>
                <p className="max-w-xs text-sm font-light leading-relaxed">Your professional presence is being analyzed for sentiment and body language.</p>
              </div>
            )}
          </div>

          {/* Internal Overlays */}
          <div className="absolute top-6 left-6 flex flex-col gap-2">
            <div className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border border-white/10">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              Live Feed
            </div>
          </div>

          <div className="absolute bottom-6 right-6 flex items-center gap-4">
            <div className="px-4 py-2 bg-white/80 backdrop-blur-md rounded-20 border border-black/5 shadow-elegant text-[10px] font-bold">
              SIGNAL STRENGTH: EXCELLENT
            </div>
          </div>
        </motion.div>

        {/* AI Interviewer Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative premium-card flex flex-col bg-white overflow-hidden"
        >
          {/* Top Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-accent-brown/5">
            <motion.div
              animate={{ width: `${progress}%` }}
              className="h-full bg-accent-brown shadow-[0_0_10px_rgba(107,79,59,0.5)]"
            />
          </div>

          <div className="p-12 flex flex-col items-center flex-grow text-center">
            {/* AI Avatar */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 0 0 0 rgba(107, 79, 59, 0)",
                  "0 0 0 20px rgba(107, 79, 59, 0.05)",
                  "0 0 0 0 rgba(107, 79, 59, 0)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-32 h-32 rounded-full border-4 border-accent-brown shadow-elegant mb-12 flex items-center justify-center bg-accent-brown p-1"
            >
              <img
                src="https://picsum.photos/seed/ai-avatar/120/120"
                alt="AI Interviewer"
                className="w-full h-full rounded-full object-cover grayscale brightness-110"
              />
            </motion.div>

            {/* Question Display */}
            <div className="max-w-lg mb-12">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent-brown/40 mb-4 block">Current Question</span>
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentQuestion.id}
                  initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="text-3xl md:text-4xl font-heading font-medium leading-tight"
                >
                  {currentQuestion.text}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Question Counter */}
            <div className="flex gap-2 mb-12">
              {mockQuestions.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${i === currentQuestionIndex ? 'w-8 bg-accent-brown' : 'w-2 bg-accent-brown/10'}`}
                />
              ))}
            </div>

            {/* AI Insight Sidebar (Static UI) */}
            <div className="w-full mt-auto p-6 bg-accent-brown/5 rounded-28 border border-accent-brown/10 flex items-start gap-4 text-left">
              <Info className="w-5 h-5 text-accent-brown shrink-0 mt-0.5" />
              <p className="text-xs font-light text-accent-brown/70 leading-relaxed">
                <span className="font-bold opacity-100 uppercase tracking-tighter mr-1 text-[10px]">AI Tip:</span>
                Keep your eye contact steady with the camera. The evaluator is currently tracking your response confidence and vocabulary diversity.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Floating Controls */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
        className="fixed bottom-10 flex items-center gap-6 px-10 py-6 glass-panel rounded-full shadow-lg-layer z-50 border border-white"
      >
        <button
          onClick={toggleMic}
          className={`p-4 rounded-full transition-all duration-300 ${isMicMuted ? 'bg-red-50 text-red-500' : 'bg-accent-brown/5 text-accent-brown hover:bg-accent-brown/10'}`}
        >
          {isMicMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
        <button
          onClick={toggleCamera}
          className={`p-4 rounded-full transition-all duration-300 ${isCameraOff ? 'bg-red-50 text-red-500' : 'bg-accent-brown/5 text-accent-brown hover:bg-accent-brown/10'}`}
        >
          {isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}
        </button>

        <div className="w-[1px] h-8 bg-accent-brown/10 mx-2" />

        <button
          onClick={endCall}
          className="px-8 py-4 bg-red-500 text-white rounded-full font-bold shadow-lg shadow-red-500/20 flex items-center gap-3 hover:bg-red-600 active:scale-95 transition-all"
        >
          <PhoneOff size={20} />
          <span>Exit Session</span>
        </button>

        <div className="w-[1px] h-8 bg-accent-brown/10 mx-2" />

        <button className="p-4 rounded-full bg-accent-brown/5 text-accent-brown hover:bg-accent-brown/10 transition-all">
          <Settings size={22} />
        </button>
      </motion.div>
    </div>
  );
};

export default function LiveInterviewPage() {
  const { user: clerkUser, isSignedIn } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const interviewId = searchParams.get('interviewId');

  const [client, setClient] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [streamUser, setStreamUser] = useState<any | null>(null);
  const [call, setCall] = useState<any | null>(null);

  useEffect(() => {
    if (!isSignedIn || !clerkUser) {
      navigate('/dashboard');
      return;
    }

    const setupStreamClient = async () => {
      if (!API_KEY) {
        console.error('Stream API Key is missing.');
        return;
      }

      const userId = clerkUser.id;
      const userName = clerkUser.fullName || clerkUser.username || userId;
      const userImage = clerkUser.imageUrl;

      try {
        console.log("🎬 Setting up Stream Video Client...");
        const response = await fetch('/api/stream-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        const data = await response.json();
        const fetchedToken = data.token;

        if (!fetchedToken) {
          throw new Error("Failed to receive token from backend.");
        }

        const user: any = {
          id: userId,
          name: userName,
          image: userImage,
        };

        const streamClient = new StreamVideoClient({
          apiKey: API_KEY,
          user,
          token: fetchedToken,
        });

        setClient(streamClient);

        // Force media permission request
        console.log("🎤 Requesting media permissions...");
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        }).catch(err => {
          console.warn("⚠️ Media permission denied or failed:", err);
        });

        // Use interviewId from URL or a fallback
        const callId = interviewId || `interview-${Date.now()}`;
        console.log(`📞 Joining call: ${callId}`);
        const newCall = streamClient.call('default', callId);
        await newCall.join({ create: true });

        setCall(newCall);
        console.log("✅ Call joined successfully.");
      } catch (error) {
        console.error('❌ Failed to setup Stream or join call:', error);
      }
    };

    setupStreamClient();

    return () => {
      // Cleanup
    };
  }, [isSignedIn, clerkUser, navigate, interviewId]);

  if (!client || !call) {
    return (
      <div className="min-h-screen bg-primary-bg flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 border-4 border-accent-brown border-t-transparent rounded-full animate-spin mb-6" />
        <h2 className="text-2xl font-heading mb-2">Initializing Interview Room</h2>
        <p className="text-accent-brown/60 max-w-sm">Please allow camera and microphone access when prompted.</p>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <AIInterviewUI />
    </StreamVideo>
  );
}

