/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { UploadCloud, CheckCircle2, FileText, ChevronDown } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import GoogleAuthButton from '@/components/AuthButton';
import axios from 'axios';
import { analyzeResume } from '@/lib/api';


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

const ANALYSIS_STEPS = [
  'Reading resume',
  'Analyzing role alignment',
  'Evaluating projects',
  'Generating suggestions',
  'Finalizing score'
];

export default function HomePage() {
  const { user, loading } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState(TARGET_ROLES[0]);
  const [isDragging, setIsDragging] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; atsScore: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
      } else {
        setError('Only PDF files are supported.');
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!file) return;

    setError(null);
    setIsAnalyzing(true);
    setResult(null);
    setCompletedSteps(new Set());
    setActiveStep(0);

    const runAnalysis = async () => {
      try {
        let stepIdx = 0;
        const stepInterval = setInterval(() => {
          if (stepIdx < ANALYSIS_STEPS.length - 1) {
            setActiveStep(stepIdx);
            setCompletedSteps(prev => new Set(prev).add(stepIdx));
            stepIdx++;
          }
        }, 8000);

        const formData = new FormData();
        formData.append("resume", file);
        formData.append("targetRole", targetRole);

        const res = await axios.post(analyzeResume, formData, {
          withCredentials: true,
        });

        clearInterval(stepInterval);

        setCompletedSteps(new Set([0, 1, 2, 3, 4]));
        setActiveStep(ANALYSIS_STEPS.length);

        setTimeout(() => {
          setIsAnalyzing(false);
          setResult(res.data.updateResume);
        }, 600);
      } catch (err) {
        setIsAnalyzing(false);
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || "Analysis failed. Please try again.")
      }
    };

    runAnalysis();
  };

  const resetState = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
    setCompletedSteps(new Set());
    setActiveStep(0);
    setDisplayScore(0);
  };

  // Animate the final score
  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    if (!result || isAnalyzing) return;
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setDisplayScore(current);
      if (current >= result.atsScore) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, [result, isAnalyzing]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#060606] text-white flex flex-col font-sans select-none pb-24">
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap');

        body {
          font-family: 'Inter', sans-serif;
          background-color: #060606;
          color: white;
        }

        .font-mono {
          font-family: 'JetBrains Mono', monospace;
        }

        /* Dot Grid Background */
        .bg-grid {
          background-image: radial-gradient(rgba(204,255,0,0.07) 1px, transparent 0);
          background-size: 24px 24px;
        }

        /* Animations */
        @keyframes drift {
          0% { transform: translate(-50px, 0); }
          100% { transform: translate(50px, 0); }
        }

        @keyframes scaleY {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        @keyframes springDown {
          0% { transform: translateY(-100%) scale(0.95); opacity: 0; }
          60% { transform: translateY(10%) scale(1.02); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }

        .orb-bg {
          position: absolute;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(204,255,0,0.15) 0%, transparent 70%);
          filter: blur(80px);
          top: 10%;
          left: 5%;
          z-index: 1;
          animation: drift 15s infinite alternate ease-in-out;
        }

        .scale-y-animation {
          transform-origin: top;
          animation: scaleY 1s forwards;
        }

        .cursor-blink { animation: blink 1s step-end infinite; }
        .auth-modal { animation: springDown 0.6s cubic-bezier(0.175, 0.885, 0.32, 1) forwards; }
      `}} />

      <div className="absolute inset-0 bg-grid z-0 pointer-events-none" />
      <div className="orb-bg pointer-events-none" />

      {/* Main Container - Immersive UI Grid */}
      <div className="relative z-10 w-full flex-1 flex flex-col lg:grid lg:grid-cols-[1.2fr_1fr] p-6 lg:p-12 gap-8 lg:gap-12 lg:h-screen max-w-360 mx-auto overflow-y-auto lg:overflow-hidden">

        {/* Left Section: Hero + Analysis Steps */}
        <section className="flex flex-col justify-center gap-6 pb-8 lg:pb-0 h-full">
          <div>
            <div className="inline-flex items-center px-3 py-1.5 bg-[#18181b] border border-[#27272a] rounded text-[#CCFF00] font-mono text-[11px] tracking-wider mb-6 uppercase">
              [ AI SCORER v1.0.4 ] <span className="ml-1 cursor-blink">|</span>
            </div>

            <h1 className="text-5xl lg:text-[82px] font-black leading-[0.9] tracking-[-0.03em] mb-6 uppercase">
              Your<br />resume is<br /><span className="text-[#CCFF00]">lying</span> to you.
            </h1>

            <p className="text-lg text-[#a1a1aa] max-w-110 leading-normal">
              Most resumes never get read by humans. Our AI determines if you&apos;re invisible to the algorithms that matter.
            </p>
          </div>

          {/* Analysis Steps - Show only during analysis or after result */}
          {(isAnalyzing || result) && (
            <div className="flex flex-col gap-4 mt-4 lg:mt-auto">
              {ANALYSIS_STEPS.map((step, idx) => {
                const isCompleted = completedSteps.has(idx);
                const isActive = activeStep === idx;
                const isPending = !isCompleted && !isActive;

                return (
                  <div key={step} className="flex items-center gap-4 relative">
                    {/* Connecting Line */}
                    {idx !== ANALYSIS_STEPS.length - 1 && (
                      <div className="absolute left-2.75 top-6 w-px h-4 bg-[#27272a]">
                        {(isCompleted || isActive) && (
                          <div className={`absolute top-0 w-1px h-4 bg-[#CCFF00] ${isCompleted ? 'scale-y-100' : 'scale-y-animation'}`} />
                        )}
                      </div>
                    )}

                    {/* Circle */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isCompleted ? 'border-[#CCFF00] bg-[#CCFF00]' : isActive ? 'border-[#CCFF00] bg-transparent relative' : 'border-[#27272a] bg-[#060606]'}`}>
                      {isCompleted ? (
                        <CheckCircle2 size={14} className="text-black" strokeWidth={3} />
                      ) : isActive ? (
                        <div className="w-2 h-2 bg-[#CCFF00] rounded-full animate-[pulse_1.5s_infinite]" />
                      ) : null}
                    </div>

                    {/* Text */}
                    <div className="flex flex-col">
                      <span className={`font-mono text-[11px] uppercase tracking-wider ${isPending ? 'text-[#27272a]' : isCompleted ? 'opacity-40' : 'text-white'}`}>
                        0{idx + 1} {step}
                      </span>
                      {isActive && (
                        <span className="font-mono text-[10px] text-[#a1a1aa] mt-0.5">Cross-referencing tech stacks...</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Right Section: Workspace Base */}
        <section className="flex flex-col justify-center relative lg:pl-8 mt-4 lg:mt-0 h-full">

          {/* Upload Card */}
          <div className="bg-[#18181b]/60 backdrop-blur-xl border border-[#27272a] rounded-2xl p-6 lg:p-8 flex flex-col gap-6 relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-[#CCFF00]/30 transition-colors z-10 w-full mb-auto lg:mb-0">
            <div className="flex justify-between items-center">
              <h3 className="font-mono text-white text-sm lg:text-base uppercase">Analysis Workspace</h3>
              <span className="font-mono text-[#a1a1aa] text-sm">v.24</span>
            </div>

            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => { if (!isAnalyzing) fileInputRef.current?.click(); }}
              className={`border-2 border-dashed rounded-xl p-8 lg:p-12 text-center transition-all duration-300 flex flex-col items-center justify-center ${isAnalyzing ? 'opacity-50 pointer-events-none' : 'cursor-pointer'} ${isDragging ? 'border-[#CCFF00] bg-[#CCFF00]/5' : (file ? 'border-[#CCFF00]/40 bg-[#CCFF00]/5' : 'border-[#27272a] bg-black/20 hover:border-[#CCFF00]/30')}`}
            >
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />

              {file ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border border-[#27272a] bg-[#18181b] flex items-center justify-center mb-3">
                    <CheckCircle2 size={24} className="text-[#CCFF00]" />
                  </div>
                  <p className="font-mono text-sm text-white mb-1 truncate max-w-50 lg:max-w-75 font-bold">{file.name}</p>
                  <p className="font-mono text-[10px] text-[#a1a1aa]">READY FOR ANALYSIS</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <UploadCloud size={40} strokeWidth={1.5} className="text-[#CCFF00] mb-4" />
                  <p className="text-white font-bold mb-2 text-lg">Drop Resume PDF</p>
                  <p className="font-mono text-[10px] text-[#a1a1aa] uppercase tracking-widest mt-2">PDF only • Max 2MB • Secure</p>
                </div>
              )}
            </div>

            {error && <p className="text-red-400 text-xs font-mono text-center -my-2">{error}</p>}

            <div>
              <label className="font-mono block mb-2 text-[#a1a1aa] text-xs lg:text-sm uppercase tracking-wide">Target Role</label>
              <div className="relative">
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  disabled={isAnalyzing}
                  className="w-full appearance-none bg-[#060606] border border-[#27272a] text-white p-3 lg:p-4 rounded-lg font-mono text-xs lg:text-sm outline-none focus:border-[#CCFF00] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {TARGET_ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            {(result && !isAnalyzing) ? (
              <div className="flex flex-col md:flex-row gap-3">
                <button className="flex-1 bg-[#CCFF00] text-black font-bold p-3 lg:p-4 rounded-lg uppercase tracking-wider hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all text-sm lg:text-base">
                  View Full Report &rarr;
                </button>
                <button onClick={resetState} className="flex-1 bg-transparent border border-[#27272a] text-[#a1a1aa] font-bold p-3 lg:p-4 rounded-lg uppercase tracking-wider hover:text-white transition-all text-sm lg:text-base">
                  Re-Analyze
                </button>
              </div>
            ) : (
              <button
                onClick={handleAnalyze}
                disabled={!file || isAnalyzing}
                className={`w-full font-bold p-3 lg:p-4 rounded-lg uppercase tracking-wider transition-all text-sm lg:text-base ${isAnalyzing ? 'bg-[#CCFF00]/50 text-black/50 cursor-wait' : file ? 'bg-[#CCFF00] text-black hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(204,255,0,0.3)]' : 'bg-[#CCFF00]/10 text-[#CCFF00]/50 cursor-not-allowed'}`}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Resume \u2192'}
              </button>
            )}

            <div className="flex justify-center gap-2 mt-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isAnalyzing ? 'bg-[#CCFF00] animate-pulse' : 'bg-[#27272a]'}`} />
              <div className={`w-1.5 h-1.5 rounded-full ${!isAnalyzing && file ? 'bg-[#CCFF00]' : 'bg-[#27272a]'}`} />
              <div className={`w-1.5 h-1.5 rounded-full ${result && !isAnalyzing ? 'bg-[#CCFF00]' : 'bg-[#27272a]'}`} />
            </div>
          </div>

          <div className="mt-6 flex justify-between font-mono text-[#27272a] text-xs uppercase tracking-wider relative z-10 w-full px-2">
            <span>System: Stable</span>
            <span>Auth: {user ? 'Session_Active' : 'Guest'}</span>
          </div>
        </section>
      </div>

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowAuthModal(false)} />
          <div className="auth-modal relative bg-zinc-950 border border-zinc-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center">
            <div className="w-12 h-12 bg-[#CCFF00] rounded-xl flex items-center justify-center mb-6">
              <FileText size={24} className="text-black" />
            </div>
            <h3 className="font-clash font-bold text-2xl mb-2">Sign in required</h3>
            <p className="text-zinc-400 text-center text-sm mb-8">
              Create an account or sign in to save your reports and access full analysis.
            </p>

            <GoogleAuthButton onSuccess={() => setShowAuthModal(false)} />

            <button onClick={() => setShowAuthModal(false)} className="mt-4 text-xs font-mono text-zinc-500 hover:text-white uppercase tracking-widest">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

