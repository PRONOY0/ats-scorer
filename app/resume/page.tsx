"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  ChevronLeft, ChevronRight, Search, FileText,
  Calendar, ArrowRight, Activity, Filter, Target
} from 'lucide-react';
import { fetchResume_api } from '@/lib/api';

interface Resume {
  id: string;
  userId: string;
  status: string;
  title: string;
  atsScore: number;
  targetRole: string;
  scanCount: number;
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const formatRole = (role: string) => role.replace(/_/g, ' ');

const formatDate = (isoString: string) =>
  new Date(isoString).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

const getScoreColor = (score: number) => {
  if (score >= 70) return '#CCFF00';
  if (score >= 40) return '#FFB800';
  return '#FF3366';
};


export default function HistoryPage() {
  const router = useRouter();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [orderBy, setOrderBy] = useState<'latest' | 'oldest'>('latest');


  useEffect(() => {
    let cancelled = false;

    const fetchResumes = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(fetchResume_api, {
          params: { page, limit, orderBy },
          withCredentials: true,
        });

        if (cancelled) return;

        const data = response.data;
        if (data?.getAllResumes) {
          setResumes(data.getAllResumes);
          setPagination(data.pagination);
        }
      } catch (err) {
        if (cancelled) return;
        console.warn('API request failed.', err);
        setError('Failed to load resumes. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchResumes();

    return () => { cancelled = true; };
  }, [page, limit, orderBy]);

  const handlePrevPage = () => setPage(p => Math.max(1, p - 1));
  const handleNextPage = () => {
    if (pagination && page < pagination.totalPages) setPage(p => p + 1);
  };


  return (
    <>
      <style>{`
        @keyframes drift {
          0%   { transform: translate(-50px, -50px); }
          100% { transform: translate(50px,   50px); }
        }
        @keyframes slideUpFade {
          0%   { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0);    }
        }
        .animate-item-1 { animation: slideUpFade 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
        .animate-item-2 { animation: slideUpFade 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
        .animate-item-3 { animation: slideUpFade 0.6s cubic-bezier(0.16,1,0.3,1) 0.3s both; }
        .orb-drift { animation: drift 20s infinite alternate ease-in-out; }
      `}</style>

      <div
        className="min-h-screen relative text-white select-none py-24 overflow-y-auto p-2 lg:p-16"
        style={{
          backgroundColor: '#060606',
          backgroundImage: 'radial-gradient(rgba(204,255,0,0.05) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      >
        {/* Orb */}
        <div
          className="orb-drift fixed w-150 h-150 rounded-full pointer-events-none z-0"
          style={{
            background: 'radial-gradient(circle, rgba(204,255,0,0.08) 0%, transparent 60%)',
            filter: 'blur(100px)',
            top: '10%',
            left: '20%',
          }}
        />


        <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-10 min-h-screen flex flex-col">


          <div className="animate-item-1 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-zinc-400 hover:text-white flex items-center gap-2 font-mono text-xs uppercase tracking-widest transition-colors group mb-6"
              >
                <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </button>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-2">My Scans</h1>
              <p className="text-zinc-400 text-sm max-w-md leading-relaxed">
                Your historical algorithmic performance. Review past resumes, track iterations,
                and revisit detailed breakdown reports.
              </p>
            </div>


            <div
              className="p-4 rounded-2xl flex flex-wrap items-center gap-4 self-start md:self-end"
              style={{
                background: 'rgba(24,24,27,0.4)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderLeftColor: '#CCFF00',
                borderLeftWidth: '4px',
              }}
            >
              <div className="flex items-center gap-3 mr-2 w-full lg:w-fit">
                <Filter size={16} className="text-zinc-400" />
                <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">Sort &amp; Show:</span>
              </div>


              <div className="relative group w-full xl:w-fit">
                <select
                  value={orderBy}
                  onChange={(e) => { setOrderBy(e.target.value as 'latest' | 'oldest'); setPage(1); }}
                  className="w-full appearance-none bg-[#18181b] border border-[#27272a] text-white pl-4 pr-10 py-2 rounded-lg font-mono text-xs uppercase focus:border-[#CCFF00] transition-colors cursor-pointer outline-none hover:border-[#CCFF00]/50"
                >
                  <option value="latest" className="bg-[#18181b]">Newest First</option>
                  <option value="oldest" className="bg-[#18181b]">Oldest First</option>
                </select>
                
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-hover:text-[#CCFF00] transition-colors" />
              </div>


              <div className="relative group w-full xl:w-fit">
                <select
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  className="w-full xl:w-fit appearance-none bg-[#18181b] border border-[#27272a] text-white pl-4 pr-10 py-2 rounded-lg font-mono text-xs uppercase focus:border-[#CCFF00] transition-colors cursor-pointer outline-none hover:border-[#CCFF00]/50"
                >
                  <option value="6" className="bg-[#18181b]">6 / Page</option>
                  <option value="12" className="bg-[#18181b]">12 / Page</option>
                  <option value="24" className="bg-[#18181b]">24 / Page</option>
                </select>

                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-hover:text-[#CCFF00] transition-colors" />
              </div>
            </div>
          </div>


          {loading && (
            <div className="flex-1 flex items-center justify-center min-h-100">
              <Activity size={32} className="animate-pulse" style={{ color: '#CCFF00' }} />
            </div>
          )}


          {!loading && error && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <p className="text-red-400 font-mono text-sm uppercase tracking-widest">{error}</p>
            </div>
          )}


          {!loading && !error && resumes.length > 0 && (
            <div className="animate-item-2 flex-1 flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {resumes.map((resume) => {
                  const scoreColor = getScoreColor(resume.atsScore);
                  return (
                    <div
                      key={resume.id}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && router.push(`/results/${resume.id}`)}
                      onClick={() => router.push(`/results/${resume.id}`)}
                      className="p-6 rounded-2xl flex flex-col h-full group hover:-translate-y-1 transition-all cursor-pointer border border-white/5 hover:border-white/20 hover:bg-white/2"
                      style={{
                        background: 'rgba(24,24,27,0.4)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                      }}
                    >

                      <div className="flex justify-between items-start mb-6">
                        <div className="bg-black/50 border border-white/10 px-3 py-1.5 rounded-md flex items-center gap-2">
                          <Target size={12} className="text-zinc-400" />
                          <span className="font-mono text-xs text-white uppercase font-bold">
                            {formatRole(resume.targetRole)}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest mb-1">Score</span>
                          <span className="font-mono text-4xl font-black leading-none" style={{ color: scoreColor }}>
                            {resume.atsScore}
                          </span>
                        </div>
                      </div>


                      <div className="mt-auto">
                        <div className="w-full bg-black/50 rounded-full h-1.5 mb-6 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{ width: `${resume.atsScore}%`, backgroundColor: scoreColor }}
                          />
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-400 uppercase tracking-wider">
                            <Calendar size={12} />
                            {formatDate(resume.createdAt)}
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-mono text-[10px] text-white uppercase tracking-widest font-bold">
                            Review <ArrowRight size={12} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>


              {pagination && pagination.totalPages > 1 && (
                <div className="animate-item-3 mt-auto flex justify-center pb-8">
                  <div
                    className="p-1.5 rounded-full flex items-center gap-2"
                    style={{
                      background: 'rgba(24,24,27,0.4)',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <button
                      onClick={handlePrevPage}
                      disabled={page <= 1}
                      className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="font-mono text-xs px-4 uppercase tracking-widest text-zinc-400">
                      Page <span className="text-white font-bold">{page}</span> of{' '}
                      <span className="text-white font-bold">{pagination.totalPages}</span>
                    </span>
                    <button
                      onClick={handleNextPage}
                      disabled={page >= pagination.totalPages}
                      className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}


          {!loading && !error && resumes.length === 0 && (
            <div className="animate-item-2 flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-[#18181b] rounded-full flex items-center justify-center mb-6">
                <FileText size={32} className="text-zinc-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No past scans found</h2>
              <p className="text-zinc-400 max-w-sm mb-8">
                You haven&apos;t scanned any resumes matching these filters yet.
                Start a new scan from the homepage.
              </p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 font-bold uppercase tracking-wider text-sm rounded-lg hover:-translate-y-0.5 transition-all font-mono"
                style={{ backgroundColor: '#CCFF00', color: '#000' }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 0 20px rgba(204,255,0,0.3)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
              >
                New Scan
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}