import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
const API = import.meta.env.VITE_API_URL || "https://mockprep-backend-0eaw.onrender.com";

/* ════════════════════════════════════════
   DESIGN TOKENS  (warm espresso + amber-gold)
════════════════════════════════════════ */
const T = {
  pageBg:       '#130f09',
  cardBg:       '#1e1710',
  cardBorder:   'rgba(255,200,100,0.07)',
  accent:       '#c9820a',
  accentSoft:   'rgba(201,130,10,0.14)',
  accentBorder: 'rgba(201,130,10,0.24)',
  accentGlow:   'rgba(201,130,10,0.10)',
  text:         '#f5e6c8',
  textMuted:    'rgba(245,230,200,0.40)',
  textDim:      'rgba(245,230,200,0.18)',
  green:        '#4ade80',
  greenSoft:    'rgba(74,222,128,0.10)',
  greenBorder:  'rgba(74,222,128,0.22)',
  red:          '#f87171',
  redSoft:      'rgba(248,113,113,0.10)',
  redBorder:    'rgba(248,113,113,0.25)',
};

export default function ResumeUploadPage() {
  /* ── All original state & logic untouched ── */
  const [selectedFile, setSelectedFile]   = useState<File | null>(null);
  const [isUploading, setIsUploading]     = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [dragOver, setDragOver]           = useState(false);
  const token = localStorage.getItem("token");
  const searchParams                      = useSearchParams()[0];
  const navigate                          = useNavigate();
  const interviewType                     = searchParams.get('type') || 'general';

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are accepted.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setUploadSuccess(false);
      setError(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are accepted.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setUploadSuccess(false);
      setError(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleUpload = async () => {
  if (!selectedFile || !token) {
    setError('Please select a file and ensure you are logged in.');
    return;
  }

  setIsUploading(true);
  setError(null);
  setUploadSuccess(false);

  try {
    const formData = new FormData();
    formData.append("resume", selectedFile);

    const response = await fetch(`${API}/api/upload-resume`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) throw new Error("Upload failed");

    const data = await response.json();
    const extractedText: string = data?.text || "";

    setUploadSuccess(true);

  } catch (err) {
    console.error("Resume processing error:", err);
    setError("Failed to upload/parse resume. Please try again.");
  } finally {
    setIsUploading(false);
  }
};

  return (
    <div style={{
      minHeight: '100vh',
      background: T.pageBg,
      color: T.text,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes ping{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:0}}`}</style>

      {/* Ambient glows */}
      <div style={{ position: 'absolute', top: '-10%', left: '20%', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${T.accentGlow} 0%, transparent 70%)`, pointerEvents: 'none', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '20%', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${T.accentGlow} 0%, transparent 70%)`, pointerEvents: 'none', filter: 'blur(40px)' }} />

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: 'center', marginBottom: 48, zIndex: 1 }}
      >
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 700, color: T.accent + 'cc', marginBottom: 12 }}>
          Resume Intelligence
        </p>
        <h1 style={{ fontSize: 48, fontWeight: 700, color: T.text, margin: 0, letterSpacing: '-1px', lineHeight: 1.1 }}>
          Upload Your{' '}
          <span style={{ color: T.accent, textShadow: `0 0 40px ${T.accent}44` }}>Resume</span>
        </h1>
        <p style={{ fontSize: 15, color: T.textMuted, marginTop: 14, fontWeight: 300 }}>
          Our AI will analyze your experience to tailor interview questions for you.
        </p>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        style={{
          background: T.cardBg,
          border: `1px solid ${T.cardBorder}`,
          borderRadius: 24,
          padding: 40,
          maxWidth: 600,
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 1,
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        }}
      >
        {/* Card corner glow */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${T.accentGlow} 0%, transparent 70%)`, pointerEvents: 'none' }} />

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('file-upload')?.click()}
          style={{
            border: `2px dashed ${dragOver ? T.accent : selectedFile ? T.accentBorder : 'rgba(255,200,100,0.15)'}`,
            borderRadius: 16,
            padding: '48px 24px',
            marginBottom: 28,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            background: dragOver ? T.accentSoft : selectedFile ? 'rgba(201,130,10,0.06)' : 'transparent',
            transition: 'all 0.3s ease',
            position: 'relative',
          }}
        >
          <motion.div
            animate={dragOver ? { scale: 1.15 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              width: 72, height: 72, borderRadius: 20, marginBottom: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: selectedFile ? T.accentSoft : 'rgba(255,200,100,0.08)',
              border: `1px solid ${selectedFile ? T.accentBorder : 'rgba(255,200,100,0.12)'}`,
            }}
          >
            {selectedFile
              ? <FileText size={32} color={T.accent} />
              : <UploadCloud size={32} color={dragOver ? T.accent : T.textDim} />
            }
          </motion.div>

          {selectedFile ? (
            <>
              <p style={{ fontSize: 15, fontWeight: 600, color: T.text, margin: '0 0 6px' }}>{selectedFile.name}</p>
              <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>
                {(selectedFile.size / 1024).toFixed(0)} KB · PDF
              </p>
            </>
          ) : (
            <>
              <p style={{ fontSize: 15, color: T.text, margin: '0 0 6px', fontWeight: 500 }}>
                Drag & drop your resume here
              </p>
              <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>
                or{' '}
                <span style={{ color: T.accent, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                  click to browse
                </span>
              </p>
              <p style={{ fontSize: 11, color: T.textDim, marginTop: 10 }}>PDF files only</p>
            </>
          )}

          <input
            id="file-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px', borderRadius: 12, marginBottom: 20,
              background: T.redSoft, border: `1px solid ${T.redBorder}`,
            }}
          >
            <AlertCircle size={16} color={T.red} style={{ flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: T.red, margin: 0 }}>{error}</p>
          </motion.div>
        )}

        {/* Upload Button */}
        {!uploadSuccess && (
          <motion.button
            onClick={handleUpload}
            whileHover={{ scale: !selectedFile || isUploading ? 1 : 1.03 }}
            whileTap={{ scale: !selectedFile || isUploading ? 1 : 0.97 }}
            disabled={!selectedFile || isUploading}
            style={{
              width: '100%', padding: '15px 0',
              borderRadius: 14, border: 'none',
              background: !selectedFile || isUploading
                ? T.accentSoft
                : `linear-gradient(135deg, ${T.accent} 0%, #9a5806 100%)`,
              color: !selectedFile || isUploading ? T.textMuted : '#fff',
              fontWeight: 700, fontSize: 15, cursor: !selectedFile || isUploading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: !selectedFile || isUploading ? 'none' : `0 4px 20px ${T.accent}44`,
              transition: 'all 0.3s ease',
            }}
          >
            {isUploading ? (
              <>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${T.accentBorder}`, borderTopColor: T.accent, animation: 'spin 0.8s linear infinite' }} />
                Uploading…
              </>
            ) : (
              <>
                <UploadCloud size={18} />
                Upload Resume
              </>
            )}
          </motion.button>
        )}

        {/* Success */}
        {uploadSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
          >
            {/* Success icon with ping */}
            <div style={{ position: 'relative', width: 64, height: 64 }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: T.greenSoft, animation: 'ping 1.2s ease 1' }} />
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: T.greenSoft, border: `1px solid ${T.greenBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={28} color={T.green} />
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 17, fontWeight: 700, color: T.green, margin: '0 0 6px' }}>
                Resume uploaded successfully!
              </p>
              <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>
                Your resume has been saved and will be used during interviews.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/dashboard")}
              style={{
                marginTop: 4,
                padding: '13px 32px',
                borderRadius: 14, border: 'none',
                background: `linear-gradient(135deg, ${T.accent} 0%, #9a5806 100%)`,
                color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: `0 4px 20px ${T.accent}44`,
              }}
            >
              Go to Dashboard
              <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}