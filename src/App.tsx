import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./app/page.js";
import DashboardPage from "./app/dashboard/page.js";
import InterviewTypeSelectionPage from "./app/interview-type-selection/page.js";
import LiveInterviewPage from "./app/live-interview/page.js";
import TechnicalInterviewPage from "./app/technical-interview/page.js";
import CodeEditorPage from "./app/code-editor/page.js";
import ResumeUploadPage from "./app/resume-upload/page.js";
import BecomeProPage from "./pages/BecomeProPage.js";
import AnimatedBackground from "./components/AnimatedBackground.js";
import { ThemeProvider } from "./lib/ThemeContext.js";
import AuthSuccess from "./app/auth-success/page.js";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/interview-type-selection"
        element={
          <ProtectedRoute>
            <InterviewTypeSelectionPage />
          </ProtectedRoute>
        }
      />

        <Route path="/auth-success" element={<AuthSuccess />} />

      <Route
        path="/resume-upload"
        element={
          <ProtectedRoute>
            <ResumeUploadPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/live-interview"
        element={
          <ProtectedRoute>
            <LiveInterviewPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/technical-interview"
        element={
          <ProtectedRoute>
            <TechnicalInterviewPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/code-editor"
        element={
          <ProtectedRoute>
            <CodeEditorPage />
          </ProtectedRoute>
        }
      />

      <Route path="/become-pro" element={<BecomeProPage />} />

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