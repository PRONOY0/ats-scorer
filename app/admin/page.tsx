"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Shield, Clock, Search, Filter, FileText, Activity } from 'lucide-react';
import { fetchResume_admin_api } from '@/lib/api';
import Image from 'next/image';

interface User {
    name: string;
    email: string;
    avatar: string;
}

interface Resume {
    id: string;
    userId: string;
    status: string;
    title: string;
    atsScore: number;
    targetRole: string;
    scanCount: number;
    createdAt: string;
    user?: User;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function AdminPage() {
    const router = useRouter();

    const [resumes, setResumes] = useState<Resume[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [orderBy, setOrderBy] = useState<'latest' | 'oldest'>('latest');

    useEffect(() => {
        const fetchResumes = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(fetchResume_admin_api, {
                    params: { page, limit, orderBy }
                });
                const data = response.data;
                if (data && data.getAllResumes) {
                    setResumes(data.getAllResumes);
                    setPagination(data.pagination);
                }
            } catch (err) {
                console.warn("Failed to fetch resumes from API, falling back to mock data.", err);
            } finally {
                setLoading(false);
            }
        };
        fetchResumes();
    }, [limit, orderBy, page]);

    const handlePrevPage = () => { if (page > 1) setPage(prev => prev - 1); };
    const handleNextPage = () => { if (pagination && page < pagination.totalPages) setPage(prev => prev + 1); };

    const formatRole = (role: string) => role.replace(/_/g, ' ');
    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getScoreColor = (score: number) => {
        if (score >= 70) return 'text-[#CCFF00]';
        if (score >= 40) return 'text-[#FFB800]';
        return 'text-[#FF3366]';
    };

    const getScoreBarColor = (score: number) => {
        if (score >= 70) return '#CCFF00';
        if (score >= 40) return '#FFB800';
        return '#FF3366';
    };

    return (
        <div
            className="min-h-screen relative text-white pb-24 overflow-y-auto select-none"
            style={{
                backgroundColor: '#060606',
                fontFamily: "'Inter', sans-serif",
                backgroundImage: 'radial-gradient(rgba(204,255,0,0.05) 1px, transparent 0)',
                backgroundSize: '32px 32px',
            }}
        >
            
            <div
                className="fixed w-150 h-150 rounded-full pointer-events-none z-0"
                style={{
                    background: 'radial-gradient(circle, rgba(204,255,0,0.08) 0%, transparent 60%)',
                    filter: 'blur(100px)',
                    top: '10%',
                    left: '20%',
                    animation: 'drift 20s infinite alternate ease-in-out',
                }}
            />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&family=JetBrains+Mono:wght@400;500;700;800&display=swap');
                @keyframes drift {
                    0% { transform: translate(-50px, -50px); }
                    100% { transform: translate(50px, 50px); }
                }
                @keyframes slideUpFade {
                    0% { opacity: 0; transform: translateY(30px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-item-1 { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
                .animate-item-2 { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both; }
                .animate-item-3 { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both; }
            `}</style>

            <div className="relative z-10 max-w-350 mx-auto p-6 md:p-10 min-h-screen">

                <button
                    onClick={() => router.push('/')}
                    className="animate-item-1 text-zinc-400 hover:text-white flex items-center gap-2 font-mono text-xs uppercase tracking-widest transition-colors group mb-8"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                    <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Scanner
                </button>

                <div className="animate-item-1 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <div
                            className="inline-flex items-center px-3 py-1 rounded text-[10px] tracking-wider mb-4 uppercase border"
                            style={{
                                backgroundColor: 'rgba(204,255,0,0.10)',
                                borderColor: 'rgba(204,255,0,0.20)',
                                color: '#CCFF00',
                                fontFamily: "'JetBrains Mono', monospace",
                            }}
                        >
                            <Shield size={12} className="mr-2" /> Global Admin
                        </div>
                        <h1 className="text-4xl font-black tracking-tight uppercase">System Resume Logs</h1>
                        <p
                            className="text-sm text-zinc-400 mt-2 max-w-lg uppercase tracking-wider"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                            Monitoring global candidate analysis flow and metrics validation.
                        </p>
                    </div>

                    <div
                        className="flex items-center gap-4 p-2 rounded-xl"
                        style={{
                            background: 'rgba(24,24,27,0.4)',
                            backdropFilter: 'blur(24px)',
                            WebkitBackdropFilter: 'blur(24px)',
                            border: '1px solid rgba(255,255,255,0.05)',
                        }}
                    >
                        <div className="bg-[#18181b] border border-[#27272a] rounded-lg px-4 py-2 flex items-center gap-2">
                            <span
                                className="text-xs text-zinc-400 uppercase"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                                Total Scans:
                            </span>
                            <span
                                className="text-lg font-bold"
                                style={{ color: '#CCFF00', fontFamily: "'JetBrains Mono', monospace" }}
                            >
                                {pagination?.total || 0}
                            </span>
                        </div>
                    </div>
                </div>

                <div
                    className="animate-item-2 p-4 md:p-6 rounded-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-4 border-l-4"
                    style={{
                        background: 'rgba(24,24,27,0.4)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderLeftColor: '#CCFF00',
                        borderLeftWidth: '4px',
                    }}
                >
                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-3">
                            <Filter size={16} className="text-zinc-400" />
                            <span
                                className="text-xs uppercase tracking-widest text-zinc-400"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                                Filters:
                            </span>
                        </div>

                        <div className="relative group">
                            <select
                                value={orderBy}
                                onChange={(e) => { setOrderBy(e.target.value as 'latest' | 'oldest'); setPage(1); }}
                                className="appearance-none bg-[#18181b] border border-[#27272a] text-white px-4 py-2 pr-10 rounded-lg text-xs uppercase cursor-pointer outline-none transition-colors focus:border-[#CCFF00] hover:border-[#CCFF00]/50"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                                <option value="latest">Sort: Latest</option>
                                <option value="oldest">Sort: Oldest</option>
                            </select>
                            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-hover:text-[#CCFF00] transition-colors" />
                        </div>

                        <div className="flex items-center gap-2">
                            <span
                                className="text-xs uppercase text-zinc-400"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                                Show:
                            </span>
                            <select
                                value={limit}
                                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                                className="appearance-none bg-[#18181b] border border-[#27272a] text-white px-3 py-2 rounded-lg text-xs uppercase cursor-pointer outline-none focus:border-[#CCFF00] transition-colors"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                                <option value="5">05</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                        </div>
                    </div>

                    {pagination && (
                        <div
                            className="flex items-center gap-4 text-xs"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                            <span className="text-zinc-400 uppercase tracking-wider">
                                Page <span className="text-white">{page}</span> of <span className="text-white">{pagination.totalPages || 1}</span>
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={page <= 1}
                                    className="w-8 h-8 flex items-center justify-center rounded bg-[#18181b] border border-[#27272a] hover:border-[#CCFF00] hover:text-[#CCFF00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={handleNextPage}
                                    disabled={page >= pagination.totalPages}
                                    className="w-8 h-8 flex items-center justify-center rounded bg-[#18181b] border border-[#27272a] hover:border-[#CCFF00] hover:text-[#CCFF00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div
                    className="animate-item-3 rounded-3xl overflow-hidden flex flex-col relative border border-white/5"
                    style={{
                        background: 'rgba(24,24,27,0.4)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                    }}
                >
                    {loading && (
                        <div className="absolute inset-0 z-20 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                            <div className="flex flex-col items-center">
                                <Activity size={32} className="animate-pulse mb-4" style={{ color: '#CCFF00' }} />
                                <span
                                    className="text-xs tracking-widest uppercase animate-pulse"
                                    style={{ color: '#CCFF00', fontFamily: "'JetBrains Mono', monospace" }}
                                >
                                    Querying Database...
                                </span>
                            </div>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="p-12 flex flex-col items-center text-center">
                            <Shield size={32} className="text-red-500 mb-4" />
                            <h3 className="font-bold text-lg text-white mb-2 uppercase">Connection Failed</h3>
                            <p
                                className="text-sm text-zinc-400 uppercase max-w-md"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                                {error}
                            </p>
                        </div>
                    )}

                    {!loading && !error && resumes.length === 0 && (
                        <div className="p-16 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-[#18181b] flex items-center justify-center mb-6">
                                <FileText size={24} className="text-zinc-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 uppercase tracking-wide">No Records Found</h3>
                            <p
                                className="text-zinc-500 max-w-sm text-sm uppercase tracking-widest"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                                The database query returned zero active resumes for the specified filters.
                            </p>
                        </div>
                    )}

                    {!loading && !error && resumes.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-250">
                                <thead>
                                    <tr className="border-b border-white/5 bg-[#18181b]/50">
                                        {['Candidate Profile', 'Target Role', 'Scan Count', 'System Score', 'Timestamp', 'Ref ID'].map((col, i) => (
                                            <th
                                                key={col}
                                                className={`p-5 font-mono text-[10px] uppercase tracking-wider text-zinc-400 ${i === 0 ? 'pl-8' : ''} ${i === 5 ? 'pr-8 text-right' : ''}`}
                                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                            >
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {resumes.map((resume) => (
                                        <tr
                                            key={resume.id}
                                            className="border-b border-white/5 last:border-0 hover:bg-white/4 transition-colors group"
                                        >
                                            <td className="p-5 pl-8">
                                                <div className="flex items-center gap-4">
                                                    {resume.user?.avatar ? (
                                                        <Image
                                                            src={resume.user.avatar}
                                                            alt="avatar"
                                                            width={40}
                                                            height={40}
                                                            className="w-10 h-10 rounded-full border border-[#27272a] group-hover:border-[#CCFF00]/50 transition-colors"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center group-hover:border-[#CCFF00]/50 transition-colors">
                                                            <span
                                                                className="text-xs text-zinc-400"
                                                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                                            >
                                                                N/A
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-bold truncate max-w-37.5">
                                                            {resume.user?.name || 'Anonymous User'}
                                                        </div>
                                                        <div
                                                            className="text-[10px] text-zinc-400 truncate max-w-37.5"
                                                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                                        >
                                                            {resume.user?.email || 'No email provided'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-5">
                                                <span
                                                    className="bg-black border border-white/10 px-2.5 py-1 rounded text-[10px] text-zinc-300 uppercase"
                                                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                                >
                                                    {formatRole(resume.targetRole)}
                                                </span>
                                            </td>

                                            <td className="p-5">
                                                <div className="flex items-center gap-2">
                                                    <Activity
                                                        size={14}
                                                        style={{ color: resume.scanCount > 1 ? '#CCFF00' : '#a1a1aa' }}
                                                    />
                                                    <span
                                                        className="text-sm font-bold text-white"
                                                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                                    >
                                                        {resume.scanCount}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className={`text-sm font-bold tracking-tight ${getScoreColor(resume.atsScore)}`}
                                                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                                    >
                                                        {resume.atsScore}/100
                                                    </span>
                                                    <div className="w-16 h-1.5 bg-black rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-1000"
                                                            style={{
                                                                width: `${resume.atsScore}%`,
                                                                backgroundColor: getScoreBarColor(resume.atsScore),
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-5">
                                                <div
                                                    className="flex items-center gap-2 text-xs text-zinc-400 uppercase"
                                                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                                >
                                                    <Clock size={12} />
                                                    {formatDate(resume.createdAt)}
                                                </div>
                                            </td>

                                            <td className="p-5 pr-8 text-right">
                                                <span
                                                    className="text-[10px] text-zinc-600 group-hover:text-zinc-400 transition-colors uppercase tracking-widest bg-black px-2 py-1 border border-zinc-800 rounded"
                                                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                                >
                                                    {resume.id}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}