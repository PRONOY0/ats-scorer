"use client";

import { ArrowRight, ListFilter } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import axios from "axios";
import { useEffect, useState } from "react";
import { fetchResume_api } from '@/lib/api';
import Loader from '@/components/Loader';
import { useRouter } from 'next/navigation';

interface Resume {
  id: string;
  title: string;
  atsScore: number;
  targetRole: string;
  updatedAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ResumeResponse {
  message: string;
  getAllResumes: Resume[];
  pagination: Pagination;
}

export default function ResumesView() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [limit, setLimit] = useState(6);
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 1,
  });

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setLoading(true);

        const response = await axios.get<ResumeResponse>(
          fetchResume_api,
          {
            params: {
              page,
              limit,
              sort: sortOrder,
            },
          }
        );

        setResumes(response.data.getAllResumes);
        setPagination(response.data.pagination);
      } catch (error) {
        console.error(error);
        setError("Failed to fetch resumes");
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, [page, limit, sortOrder]);

  const totalPages = pagination.totalPages;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  const onViewClick = (id: string) => {
    router.push(`/results/${id}`)
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
        <h2 className="text-6xl font-serif mb-4">
          Something Went Wrong
        </h2>

        <p className="text-muted-dark max-w-xl mb-8 text-xl opacity-85">
          {error}
        </p>

        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-full bg-sage text-white font-medium hover:opacity-90 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col pt-8 px-4 max-w-250 mx-auto min-w-[320px]">

      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-serif tracking-tight mb-2 text-text-main line-clamp-1">Scan History</h2>
          <p className="text-muted-dark text-sm max-w-lg">
            Review all your targeted resumes and evaluation scores across different roles.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-bg-alt p-2 rounded-xl border border-warm-dark/40 shadow-sm">
          <div className="flex items-center gap-2 px-3 border-r border-warm-dark/50">
            <ListFilter className="w-4 h-4 text-sage-dark" />
            <span className="text-[10px] text-sage-dark uppercase tracking-widest font-bold">Filter</span>
          </div>

          <div className="flex items-center gap-3 pr-2">
            <div className="flex flex-col">
              <span className="text-[9px] text-sage-dark/80 uppercase font-bold tracking-widest mx-2">Sort By</span>
              <select
                className="text-xs font-semibold text-text-main bg-transparent outline-none cursor-pointer px-2 py-1 focus:ring-0"
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value as 'latest' | 'oldest');
                  setPage(1);
                }}
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            <div className="w-px h-6 bg-warm-dark/50"></div>

            <div className="flex flex-col">
              <span className="text-[9px] text-sage-dark/80 uppercase font-bold tracking-widest mx-2">Show</span>
              <select
                className="text-xs font-semibold text-text-main bg-transparent outline-none cursor-pointer px-2 py-1 focus:ring-0"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={3}>3 per page</option>
                <option value={6}>6 per page</option>
                <option value={10}>10 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 soft-shadow border border-warm/50 flex flex-col">
        <div className="w-full overflow-x-auto pb-4">
          <div className="min-w-175">

            <div className="grid grid-cols-12 gap-6 px-4 py-4 border-b border-warm-dark/50 text-[10px] uppercase tracking-[0.2em] font-bold text-muted">
              <div className="col-span-5">Role Target</div>
              <div className="col-span-3">Date Scanned</div>
              <div className="col-span-2">ATS Score</div>
              <div className="col-span-2 text-right text-transparent select-none">Action</div>
            </div>

            <div className="flex flex-col">
              {resumes.map((scan) => (
                <div key={scan.id} className="grid grid-cols-12 gap-6 px-4 py-6 items-center border-b border-warm/40 last:border-0 hover:bg-bg-light/30 transition-colors group">
                  <div className="col-span-5 font-serif font-bold text-lg text-text-main pr-4 uppercase">
                    {scan.targetRole.replace(/_/g, ' ')}
                  </div>
                  <div className="col-span-3 text-sm text-muted-dark font-medium uppercase tracking-wide">
                    {format(parseISO(scan.updatedAt), 'do MMM yyyy, h:mm a')}
                  </div>
                  <div className="col-span-2 flex items-center gap-4">
                    <span className={`font-serif font-bold text-2xl flex items-baseline gap-0.5 ${scan.atsScore >= 50 ? 'text-sage' : 'text-amber-700'}`}>
                      {scan.atsScore}
                      <span className="text-xs font-sans text-muted font-normal">/100</span>
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button
                      onClick={() => { onViewClick(scan.id) }}
                      className="px-5 py-2.5 rounded-full border border-warm/80 text-[11px] font-bold tracking-wider text-text-main group-hover:bg-sage group-hover:text-white group-hover:border-sage transition-all flex items-center gap-2 group/btn uppercase"
                    >
                      VIEW
                      <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 transition-all text-sage group-hover:text-white" />
                    </button>
                  </div>
                </div>
              ))}
              {resumes.length === 0 && (
                <div className="py-12 text-center text-muted-dark font-medium text-md">
                  No resume at the current moment
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6 pt-6 border-t border-warm/50 px-4">
          <span className="text-xs font-medium text-muted-dark">
            Showing {(page - 1) * limit + 1}-
            {Math.min(page * limit, pagination.total)}
            {" "}of {pagination.total} Resumes
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-warm/80 rounded-lg text-xs font-bold text-text-main hover:bg-bg-alt transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="px-4 py-2 border border-warm/80 rounded-lg text-xs font-bold text-text-main hover:bg-bg-alt hover:text-sage transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-text-main"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
