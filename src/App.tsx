import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignIn, SignUp } from '@clerk/clerk-react';

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
          <>
            <SignedIn>
              <DashboardPage />
            </SignedIn>
            <SignedOut>
              <Navigate to="/" />
            </SignedOut>
          </>
        }
      />

      <Route path="/interview-type-selection" element={<SignedIn><InterviewTypeSelectionPage /></SignedIn>} />
      <Route path="/resume-upload" element={<SignedIn><ResumeUploadPage /></SignedIn>} />
      <Route path="/live-interview" element={<SignedIn><LiveInterviewPage /></SignedIn>} />
      <Route path="/technical-interview" element={<SignedIn><TechnicalInterviewPage /></SignedIn>} />
      <Route path="/code-editor" element={<SignedIn><CodeEditorPage /></SignedIn>} />

      <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
      <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />

      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
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