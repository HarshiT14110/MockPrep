import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn, SignIn, SignUp } from '@clerk/clerk-react';
import HomePage from './app/page.js';
import DashboardPage from './app/dashboard/page.js';
import InterviewTypeSelectionPage from './app/interview-type-selection/page.js';
import LiveInterviewPage from './app/live-interview/page.js';
import TechnicalInterviewPage from './app/technical-interview/page.js';
import CodeEditorPage from './app/code-editor/page.js';
import ResumeUploadPage from './app/resume-upload/page.js';
import AnimatedBackground from './components/AnimatedBackground.js';
import { ThemeProvider } from './lib/ThemeContext.js';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/dashboard"
        element={
          <SignedIn>
            <DashboardPage />
          </SignedIn>
        }
      />
      <Route
        path="/interview-type-selection"
        element={
          <SignedIn>
            <InterviewTypeSelectionPage />
          </SignedIn>
        }
      />
      <Route
        path="/resume-upload"
        element={
          <SignedIn>
            <ResumeUploadPage />
          </SignedIn>
        }
      />
      <Route
        path="/live-interview"
        element={
          <SignedIn>
            <LiveInterviewPage />
          </SignedIn>
        }
      />
      <Route
        path="/technical-interview"
        element={
          <SignedIn>
            <TechnicalInterviewPage />
          </SignedIn>
        }
      />
      <Route
        path="/code-editor"
        element={
          <SignedIn>
            <CodeEditorPage />
          </SignedIn>
        }
      />
      <Route path="/sign-in/*" element={<div className="flex items-center justify-center min-h-screen bg-primary-bg"><SignIn routing="path" path="/sign-in" /></div>} />
      <Route path="/sign-up/*" element={<div className="flex items-center justify-center min-h-screen bg-primary-bg"><SignUp routing="path" path="/sign-up" /></div>} />
      <Route path="*" element={<NotFound />} /> {/* Basic 404 handler */}
    </Routes>
  );
}

function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-bg font-body">
      <h1 className="text-4xl font-heading text-accent-brown">404 - Page Not Found</h1>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AnimatedBackground />
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
}

