"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ChevronLeft, Zap, Target, TrendingUp, AlertTriangle, CheckCircle2, ChevronRight, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const MOCK_DATA = {
    "id": "cmp5om2j20003tbj0xei9t001",
    "userId": "Y1AOWJyixDgs7JrKwYNf8sI9KyL2",
    "status": "COMPLETED",
    "title": "BACKEND_DEVELOPER",
    "atsScore": 57,
    "scoreBreakdown": {
        "education": 5,
        "structure": 2,
        "keywordMatch": 10,
        "proofOfImpact": 14,
        "projectQuality": 18,
        "workExperience": 8
    },
    "targetRole": "BACKEND_DEVELOPER",
    "extractedText": {
        "skills": ["C++", "Python", "Java Script", "Type Script", "Next Js", "Node Js", "Express Js", "Mongo DB", "Postgre SQL", "Prisma", "Redis", "Supabase", "Git"],
        "projects": [
            { "name": "Testimonial Hub", "tier": "TIER_1" },
            { "name": "Coding Club Platform", "tier": "TIER_1" },
            { "name": "3D Portfolio Website", "tier": "TIER_0" },
            { "name": "URL Shortener", "tier": "TIER_1" }
        ]
    },
    "improvementMessage": {
        "overall": "The candidate has a strong foundation in backend development, but lacks quantified achievements and work experience.",
        "topAction": "Focus on adding quantified achievements and impact statements to the resume, and consider gaining more work experience.",
        "roleAlignment": "The candidate's skills and experience align with the backend developer role, but need improvement in certain areas."
    },
    "strengths": [
        { "title": "Backend Development", "description": "Strong experience with backend technologies like Node.js, Express.js, and MongoDB." },
        { "title": "Project Management", "description": "Ability to manage multiple projects with varying technologies and complexities." }
    ],
    "weaknesses": [
        { "title": "Lack of Quantified Achievements", "description": "Resume lacks quantified achievements and impact statements for projects." },
        { "title": "Limited Work Experience", "description": "Limited work experience, with no full-time or internship experience mentioned." }
    ],
    "suggestions": [
        { "area": "Resume Structure", "priority": "HIGH", "suggestion": "Improve resume structure and formatting for better readability." },
        { "area": "Project Description", "priority": "MEDIUM", "suggestion": "Add more detailed descriptions of projects, including technologies used and achievements." }
    ]
};

const BREAKDOWN_MAX_SCORES: Record<string, number> = {
    education: 10,
    structure: 10,
    keywordMatch: 20,
    proofOfImpact: 20,
    projectQuality: 20,
    workExperience: 20
};

export default function ResultPage() {
  const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [displayScore, setDisplayScore] = useState(0);
    const data = MOCK_DATA; // In a real app, fetch based on 'id'

    useEffect(() => {
        let current = 0;
        const interval = setInterval(() => {
            current += 1;
            setDisplayScore(current);
            if (current >= data.atsScore) clearInterval(interval);
        }, 20);
        return () => clearInterval(interval);
    }, [data.atsScore]);

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#060606] text-white font-sans select-none">
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');

                body { font-family: 'Inter', sans-serif; background-color: #060606; color: white; margin: 0; }
                .font-mono { font-family: 'JetBrains Mono', monospace; }

                .bg-grid {
                    background-image: radial-gradient(rgba(204,255,0,0.07) 1px, transparent 0);
                    background-size: 24px 24px;
                }

                @keyframes drift {
                    0% { transform: translate(-100px, 0); }
                    100% { transform: translate(100px, 0); }
                }

                .orb-bg {
                    position: absolute; width: 600px; height: 600px;
                    background: radial-gradient(circle, rgba(204,255,0,0.15) 0%, transparent 60%);
                    filter: blur(100px); top: 5%; left: 10%; z-index: 0;
                    animation: drift 15s infinite alternate ease-in-out;
                    pointer-events: none;
                }

                .orb-bg-2 {
                    position: absolute; width: 500px; height: 500px;
                    background: radial-gradient(circle, rgba(255,51,102,0.1) 0%, transparent 50%);
                    filter: blur(90px); bottom: 10%; right: 5%; z-index: 0;
                    animation: drift 20s infinite alternate-reverse ease-in-out;
                    pointer-events: none;
                }

                .glass-panel {
                    background: rgba(24, 24, 27, 0.4);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                @keyframes slideUpFade {
                    0% { opacity: 0; transform: translateY(30px); }
                    100% { opacity: 1; transform: translateY(0); }
                }

                .animate-item-1 { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
                .animate-item-2 { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both; }
                .animate-item-3 { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both; }
                .animate-item-4 { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both; }

                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
            `}} />

            <div className="fixed inset-0 bg-grid z-0 pointer-events-none" />
            <div className="fixed orb-bg" />
            <div className="fixed orb-bg-2" />

            {/* Layout Wrapper */}
            <div className="relative z-10 flex flex-col lg:flex-row h-screen max-w-[1600px] mx-auto">
                
                {/* LEFT PANE - SCORE & OVERVIEW */}
                <div className="w-full lg:w-[35%] xl:w-[30%] h-full flex flex-col p-6 lg:p-10 border-b lg:border-b-0 lg:border-r border-white/5 relative glass-panel shrink-0">
                    <button onClick={() => router.push('/')} className="self-start mb-8 text-[#a1a1aa] hover:text-white flex items-center gap-2 font-mono text-xs uppercase tracking-widest transition-colors group">
                        <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Scanner
                    </button>

                    <div className="flex-1 flex flex-col justify-center animate-item-1">
                        <div className="inline-flex items-center self-start px-3 py-1 bg-[#CCFF00]/10 border border-[#CCFF00]/20 rounded text-[#CCFF00] font-mono text-[10px] tracking-wider mb-8 uppercase">
                            <CheckCircle2 size={12} className="mr-2" /> ANALYSIS COMPLETE
                        </div>

                        <h1 className="text-4xl font-black uppercase tracking-tight mb-2 leading-none">
                            {data.targetRole.replace(/_/g, ' ')}
                        </h1>
                        <p className="font-mono text-sm text-[#a1a1aa] mb-12 uppercase tracking-widest">
                            ATS Alignment Report
                        </p>

                        {/* Score Circular Display */}
                        <div className="relative w-64 h-64 mx-auto mb-12 flex items-center justify-center">
                            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                                <circle 
                                    cx="50" cy="50" r="46" fill="none" stroke={displayScore < 40 ? '#FF3366' : displayScore < 70 ? '#FFB800' : '#CCFF00'} 
                                    strokeWidth="4" 
                                    strokeDasharray="289" 
                                    strokeDashoffset={289 - (289 * displayScore) / 100}
                                    strokeLinecap="round"
                                    className="transition-all duration-[20ms] ease-linear"
                                />
                            </svg>
                            <div className="flex flex-col items-center">
                                <div className="flex items-baseline">
                                    <span className="font-mono text-7xl font-black tracking-tighter" style={{ color: displayScore < 40 ? '#FF3366' : displayScore < 70 ? '#FFB800' : '#CCFF00' }}>{displayScore}</span>
                                    <span className="font-mono text-xl text-[#a1a1aa] ml-1">/100</span>
                                </div>
                                <span className="font-mono text-[10px] text-[#a1a1aa] uppercase tracking-[0.2em] mt-2">Overall Match</span>
                            </div>
                        </div>

                        {/* AI Overall Insight */}
                        <div className="bg-black/40 border border-white/5 rounded-xl p-5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#CCFF00]" />
                            <h3 className="font-mono text-xs uppercase tracking-widest text-[#a1a1aa] mb-2 flex items-center gap-2">
                                <Zap size={12} className="text-[#CCFF00]" /> AI Insight
                            </h3>
                            <p className="text-sm text-zinc-300 leading-relaxed">
                                {data.improvementMessage.overall}
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANE - DETAILED STATS */}
                <div className="w-full lg:w-[65%] xl:w-[70%] h-full overflow-y-auto custom-scrollbar p-6 lg:p-12 pb-32">
                    
                    {/* Top Action Box */}
                    <div className="glass-panel rounded-2xl p-6 lg:p-8 mb-8 animate-item-2 flex flex-col md:flex-row items-center gap-6 border-l-4" style={{ borderLeftColor: '#CCFF00' }}>
                        <div className="w-12 h-12 rounded-full bg-[#CCFF00]/10 flex items-center justify-center shrink-0">
                            <Target size={24} className="text-[#CCFF00]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-2">Priority Action</h2>
                            <p className="text-[#a1a1aa] leading-relaxed">{data.improvementMessage.topAction}</p>
                        </div>
                    </div>

                    {/* Breakdown Grid */}
                    <h3 className="font-mono text-sm uppercase tracking-widest text-white mb-6 animate-item-2 flex items-center gap-2">
                        <TrendingUp size={16} className="text-[#a1a1aa]" /> Evaluation Metrics
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-12 animate-item-2">
                        {Object.entries(data.scoreBreakdown).map(([key, value]) => {
                            const max = BREAKDOWN_MAX_SCORES[key] || 20;
                            const percentage = (value / max) * 100;
                            const formatKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                            
                            return (
                                <div key={key} className="bg-[#18181b]/40 border border-white/5 p-5 rounded-xl">
                                    <div className="flex justify-between items-end mb-3">
                                        <span className="text-sm font-medium text-white">{formatKey}</span>
                                        <span className="font-mono text-xs text-[#a1a1aa]">{value}/{max}</span>
                                    </div>
                                    <div className="w-full bg-black rounded-full h-1.5 overflow-hidden">
                                        <div 
                                            className="h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{ 
                                                width: `${percentage}%`, 
                                                backgroundColor: percentage > 70 ? '#CCFF00' : percentage > 40 ? '#FFB800' : '#FF3366'
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Strengths & Weaknesses Split */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12 animate-item-3">
                        {/* Strengths */}
                        <div className="glass-panel p-6 rounded-2xl border-t-2 border-t-[#CCFF00]/50">
                            <h3 className="font-mono text-xs uppercase tracking-widest text-[#CCFF00] mb-6 flex items-center gap-2">
                                <Check size={14} /> Strengths Detected
                            </h3>
                            <div className="flex flex-col gap-4">
                                {data.strengths.map((s, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] mt-2 shrink-0 shadow-[0_0_8px_rgba(204,255,0,0.8)]" />
                                        <div>
                                            <h4 className="text-sm font-bold text-white mb-1">{s.title}</h4>
                                            <p className="text-xs text-[#a1a1aa] leading-relaxed">{s.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Weaknesses */}
                        <div className="glass-panel p-6 rounded-2xl border-t-2 border-t-[#FF3366]/50">
                            <h3 className="font-mono text-xs uppercase tracking-widest text-[#FF3366] mb-6 flex items-center gap-2">
                                <X size={14} /> Critical Gaps
                            </h3>
                            <div className="flex flex-col gap-4">
                                {data.weaknesses.map((w, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF3366] mt-2 shrink-0 shadow-[0_0_8px_rgba(255,51,102,0.8)]" />
                                        <div>
                                            <h4 className="text-sm font-bold text-white mb-1">{w.title}</h4>
                                            <p className="text-xs text-[#a1a1aa] leading-relaxed">{w.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Actionable Suggestions */}
                    <h3 className="font-mono text-sm uppercase tracking-widest text-white mb-6 animate-item-4 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-[#FFB800]" /> Recommended Edits
                    </h3>
                    <div className="flex flex-col gap-3 mb-12 animate-item-4">
                        {data.suggestions.map((sug, i) => (
                            <div key={i} className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-white/[0.02] transition-colors">
                                <div className={`inline-flex items-center justify-center px-2.5 py-1 rounded font-mono text-[10px] tracking-wider uppercase shrink-0 w-20 ${sug.priority === 'HIGH' ? 'bg-[#FF3366]/10 text-[#FF3366]' : 'bg-[#FFB800]/10 text-[#FFB800]'}`}>
                                    {sug.priority}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-white mb-1">{sug.area}</p>
                                    <p className="text-xs text-[#a1a1aa]">{sug.suggestion}</p>
                                </div>
                                <button className="hidden sm:flex w-8 h-8 rounded-full bg-white/5 items-center justify-center hover:bg-white/10 transition-colors text-white shrink-0">
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Extracted Profile Snippet */}
                    <div className="glass-panel rounded-2xl p-6 lg:p-8 animate-item-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-white/1 rounded-full filter blur-3xl" />
                        <h3 className="font-mono text-xs uppercase tracking-widest text-[#a1a1aa] mb-6">Extracted Profile Data</h3>
                        
                        <div className="mb-6">
                            <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider block mb-3">Detected Skills</span>
                            <div className="flex flex-wrap gap-2">
                                {data.extractedText.skills.map(skill => (
                                    <span key={skill} className="px-3 py-1.5 rounded-full bg-black/40 border border-[#27272a] text-xs text-white">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider block mb-3">Portfolio Projects</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {data.extractedText.projects.map((proj, idx) => (
                                    <div key={idx} className="p-3 rounded-lg bg-black/40 border border-[#27272a] flex justify-between items-center">
                                        <span className="text-sm font-medium">{proj.name}</span>
                                        <span className="font-mono text-[10px] text-[#CCFF00] bg-[#CCFF00]/10 px-2 py-0.5 rounded">{proj.tier.replace('_', ' ')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    );
}
