"use client";

import { useState, useRef } from 'react';
import { UploadCloud, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import Loader from '@/components/Loader';
import AuthModal from '@/components/AuthModal';
import { useRouter } from "next/navigation";
import { analyzeResume } from '@/lib/api';
import axios from 'axios';
import { useUser } from '@/hooks/useUser';

const TARGET_ROLES = [
  'FULLSTACK_DEVELOPER',
  'FRONTEND_DEVELOPER',
  'BACKEND_DEVELOPER',
  'ANDROID_DEVELOPER',
  'IOS_DEVELOPER',
  'AI_ML_DEVELOPER',
  'DATA_SCIENCE',
  'UI_UX',
  'DEVOPS'
];

export default function App() {
  const { user, loading } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState(TARGET_ROLES[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAnalyzeClick = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!file) return;

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("resume", file);
      formData.append("targetRole", targetRole);

      const res = await axios.post(
        analyzeResume,
        formData,
        {
          withCredentials: true,
        }
      );

      router.push(`/results/${res.data.resumeId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    await handleAnalyzeClick();
  };

  return (
    <div className="min-h-screen bg-bg-light text-text-main font-sans flex flex-col selection:bg-sage selection:text-white">
      <main className="flex-1 w-full max-w-300 mx-auto px-6 lg:px-12 flex flex-col pt-12 pb-24">
        {isLoading ? (
          <Loader variant="full" text="Scanning Profile Elements..." />
        ) : (
          <div className="w-full flex-1 flex flex-col justify-center items-center">
            <div className="w-full max-w-3xl text-center">
              <div className="mb-12">
                <h1 className="text-5xl sm:text-7xl font-serif font-light leading-[1.1] mb-6 tracking-tight">
                  Unlock your professional <br />
                  <span className="italic text-sage">potential</span> with precision.
                </h1>

                <p className="text-muted-dark max-w-2xl mx-auto text-lg leading-relaxed">
                  Most resumes never get read by humans. Our AI determines if you&apos;re invisible to the algorithms that matter.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center w-full">
                <div className="w-full max-w-150 relative p-4">
                  <div className="flex justify-between items-center mb-4 font-sans text-[10px] text-muted uppercase tracking-[0.2em] font-bold px-4">
                    <span>ANALYSIS WORKSPACE</span>
                    <span>v1</span>
                  </div>

                  <div
                    className={`w-full relative h-70 upload-dashed rounded-3xl flex flex-col items-center justify-center soft-shadow cursor-pointer transition-all group ${isDragging
                      ? 'bg-white scale-[1.02]'
                      : file
                        ? 'bg-white/80 border-sage'
                        : 'bg-white/50 hover:bg-white'
                      }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();

                      if (e.currentTarget.contains(e.relatedTarget as Node)) {
                        return;
                      }

                      setIsDragging(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);

                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        const droppedFile = e.dataTransfer.files[0];

                        if (droppedFile.type === 'application/pdf') {
                          setFile(droppedFile);
                        }
                      }
                    }}
                    onClick={() => {
                      if (!isLoading) {
                        fileInputRef.current?.click();
                      }
                    }}
                  >
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0];

                        if (!selectedFile) return;

                        if (selectedFile.type !== 'application/pdf') {
                          alert('Only PDF files are supported');
                          return;
                        }

                        setFile(selectedFile);
                      }}
                    />

                    {file ? (
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full border border-warm-dark/30 bg-bg-light flex items-center justify-center mb-4">
                          <CheckCircle2 className="w-6 h-6 text-sage" />
                        </div>

                        <p className="font-serif text-xl text-text-main mb-1 truncate max-w-50 lg:max-w-75 font-bold">
                          {file.name}
                        </p>

                        <p className="font-sans text-[10px] text-sage uppercase tracking-widest font-bold">
                          READY FOR ANALYSIS
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-[#F5F4F0] rounded-full flex items-center justify-center mb-6 transition-transform group-hover:scale-105">
                          <UploadCloud className="w-6 h-6 text-sage stroke-[1.5]" />
                        </div>

                        <div className="text-lg font-serif font-bold mb-1">
                          Drop Resume PDF
                        </div>

                        <div className="text-xs text-muted uppercase tracking-widest">
                          PDF ONLY &bull; MAX 2MB &bull; SECURE
                        </div>
                      </>
                    )}
                  </div>

                  <div className="w-full mt-6 flex flex-col items-start px-2">
                    <label className="font-sans text-[10px] text-muted font-bold uppercase tracking-widest mb-3">
                      Target Role
                    </label>

                    <div className="relative w-full">
                      <select
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        disabled={isLoading}
                        className="w-full appearance-none bg-white border border-warm/80 text-text-main px-4 py-3 rounded-xl font-sans text-sm outline-none focus:border-sage transition-colors cursor-pointer disabled:opacity-50 soft-shadow-sm font-medium"
                      >
                        {TARGET_ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>

                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Analyze Button */}
                  <div className="w-full flex justify-center mt-6">
                    <button
                      onClick={handleAnalyzeClick}
                      disabled={!file}
                      className="bg-sage text-white px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide shadow-lg hover:brightness-110 transition-all flex items-center gap-3 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ANALYZE RESUME

                      <ArrowRight className="w-4 h-4 opacity-70 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>


      <footer className="px-6 lg:px-12 py-10 border-t border-warm flex justify-between items-center text-muted max-w-300 mx-auto w-full mt-auto">
        <div className="text-[11px] font-medium">
          Made by Pronoy Roy
        </div>
        <div className="flex gap-6">
          <div className="w-24 h-px bg-warm my-auto"></div>
          <span className="text-[11px] font-serif italic text-sage">Excellence in every line.</span>
        </div>
      </footer>

      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onSuccess={handleAuthSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
