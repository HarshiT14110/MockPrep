import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  const navigate = useNavigate();

  const {
    useMicrophoneState,
    useCameraState,
    useCallEndedAt,
    useLocalParticipant,
  } = useCallStateHooks();

  const { microphone } = useMicrophoneState();
  const { camera } = useCameraState();
  const callEndedAt = useCallEndedAt();
  const localParticipant = useLocalParticipant();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(mockQuestions[0].duration);
  const [progress, setProgress] = useState(100);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  /* ================= TIMER LOGIC ================= */

  useEffect(() => {
    if (callEndedAt) {
      navigate('/dashboard');
    }
  }, [callEndedAt, navigate]);

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
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestionIndex]);

  useEffect(() => {
    const question = mockQuestions[currentQuestionIndex];
    setProgress((timer / question.duration) * 100);
  }, [timer, currentQuestionIndex]);

  /* ================= CONTROLS ================= */

  const toggleMic = useCallback(async () => {
    if (!call) return;

    if (microphone.enabled) {
      await microphone.disable();
      setIsMicMuted(true);
    } else {
      await microphone.enable();
      setIsMicMuted(false);
    }
  }, [microphone, call]);

  const toggleCamera = useCallback(async () => {
    if (!call) return;

    if (camera.enabled) {
      await camera.disable();
      setIsCameraOff(true);
    } else {
      await camera.enable();
      setIsCameraOff(false);
    }
  }, [camera, call]);

  const endCall = useCallback(async () => {
    await call?.leave();
    navigate('/dashboard');
  }, [call, navigate]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  const currentQuestion = mockQuestions[currentQuestionIndex];

  /* ================= UI ================= */

  return (
    <div className="min-h-screen w-full bg-[#FDFCFB] text-accent-brown flex flex-col items-center">

      {/* Header */}
      <header className="w-full flex justify-between items-center px-8 py-6 z-10 glass-panel border-b border-accent-brown/5">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Cpu className="w-5 h-5" />
          <span className="font-heading font-bold text-xl">MockPrep</span>
        </Link>

        <div className="flex items-center gap-4">
          <Timer className="w-4 h-4" />
          <span className="font-mono font-bold">{formatTime(timer)}</span>
        </div>
      </header>

      <main className="flex-grow w-full max-w-[1600px] grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">

        {/* USER VIDEO */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative premium-card overflow-hidden bg-black rounded-28"
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
          className="premium-card bg-white p-12 rounded-28 flex flex-col"
        >
          <div className="mb-8">
            <span className="text-xs uppercase tracking-widest text-accent-brown/40">
              Current Question
            </span>

            <AnimatePresence mode="wait">
              <motion.p
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="text-3xl font-heading mt-4"
              >
                {currentQuestion.text}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="mt-auto p-6 bg-accent-brown/5 rounded-20 border border-accent-brown/10 flex items-start gap-4 text-left">
            <Info className="w-5 h-5 text-accent-brown shrink-0 mt-0.5" />
            <p className="text-xs font-light text-accent-brown/70">
              Maintain eye contact and speak clearly for better AI evaluation.
            </p>
          </div>
        </motion.div>
      </main>

      {/* CONTROLS */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-10 flex items-center gap-6 px-10 py-6 glass-panel rounded-full shadow-lg z-50 border border-white"
      >
        <button
          onClick={toggleMic}
          className={`p-4 rounded-full ${
            isMicMuted ? 'bg-red-100 text-red-600' : 'bg-accent-brown/10'
          }`}
        >
          {isMicMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        <button
          onClick={toggleCamera}
          className={`p-4 rounded-full ${
            isCameraOff ? 'bg-red-100 text-red-600' : 'bg-accent-brown/10'
          }`}
        >
          {isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}
        </button>

        <button
          onClick={endCall}
          className="px-8 py-4 bg-red-500 text-white rounded-full font-bold flex items-center gap-3 hover:bg-red-600"
        >
          <PhoneOff size={20} />
          Exit
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
  const [call, setCall] = useState<any>(null);

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
    <div className="min-h-screen flex items-center justify-center">
      Initializing Interview...
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

