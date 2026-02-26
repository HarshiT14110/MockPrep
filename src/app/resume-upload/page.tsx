import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UploadCloud, FileText } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

export default function ResumeUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const searchParams = useSearchParams()[0];
  const navigate = useNavigate();
  const interviewType = searchParams.get('type') || 'general';

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
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setSelectedFile(event.dataTransfer.files[0]);
      setUploadSuccess(false);
      setError(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) {
      setError('Please select a file and ensure you are logged in.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadSuccess(false);

    try {
      console.log("🚀 Starting resume upload and parse...");
      const formData = new FormData();
      formData.append('resume', selectedFile);

      const response = await fetch("/api/upload-resume", {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to parse resume on the server.');
      }

      const data = await response.json();
      const extractedText = data.text;
      console.log("✅ Resume parsed successfully. Extracted text length:", extractedText.length);

      setUploadSuccess(true);
      setTimeout(() => {
        navigate(`/live-interview?type=${interviewType}`);
      }, 1500);
    } catch (err) {
      setError('Failed to upload/parse resume. Please try again.');
      console.error('Resume processing error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg font-body text-accent-brown p-8 flex flex-col items-center justify-center">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-5xl font-heading mb-12 text-center"
      >
        Upload Your Resume
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white p-8 rounded-30px shadow-elegant max-w-2xl w-full text-center border border-gray-100"
      >
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-accent-brown/50 rounded-20px p-12 mb-8 flex flex-col items-center justify-center cursor-pointer hover:border-accent-brown transition-colors duration-300"
        >
          <UploadCloud size={64} className="text-accent-brown/70 mb-4" />
          <p className="text-lg mb-2">Drag & drop your resume here, or</p>
          <label htmlFor="file-upload" className="cursor-pointer text-accent-brown font-semibold hover:underline">
            click to browse
          </label>
          <input
            id="file-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex items-center justify-center gap-4 mb-8 p-4 bg-primary-bg rounded-20px"
          >
            <FileText size={24} className="text-accent-brown" />
            <span className="text-gray-800 font-medium">{selectedFile.name}</span>
          </motion.div>
        )}

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 mb-4"
          >
            {error}
          </motion.p>
        )}

        <motion.button
          onClick={handleUpload}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!selectedFile || isUploading}
          className="px-10 py-4 bg-accent-brown text-primary-bg rounded-30px text-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Uploading...' : 'Analyze Resume & Start Interview'}
        </motion.button>

        {uploadSuccess && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-green-600 mt-4"
          >
            Resume uploaded successfully! Redirecting...
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
