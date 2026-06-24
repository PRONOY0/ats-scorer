"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from "react";
import axios from "axios";
import { analytics_api } from '@/lib/api';
import Loader from '@/components/Loader';
import { useRouter } from 'next/navigation';

interface DashboardData {
  totalScans: number;
  avgScore: {
    _avg: {
      atsScore: number;
    };
  };
  highestScore: {
    _max: {
      atsScore: number;
    };
  };
  bestRole: string;
  mostScannedRole: {
    targetRole: string;
  };
  scoreOverTime: {
    atsScore: number;
    targetRole: string;
    updatedAt: string;
  }[];
  weakestArea: {
    label: string;
    score: number;
  };
  strongest: {
    label: string;
    score: number;
  };
  latest: {
    createdAt: string;
    title: string;
    atsScore: number;
    id: string;
  };
  oldest: {
    createdAt: string;
    title: string;
    atsScore: number;
    id: string;
  };
}

type ChartDataPoint = {
  atsScore: number;
  targetRole: string;
  updatedAt: string;
  dateLabel?: string;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataPoint;
  }>;
};

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    return (
      <div className="bg-white p-4 rounded-xl soft-shadow border border-warm/50 text-sm font-sans min-w-40">
        <p className="font-bold text-sage mb-2 border-b border-warm/50 pb-2">{format(parseISO(dataPoint.updatedAt), 'do MMM yyyy, h:mm a')}</p>
        <p className="text-text-main flex gap-2 justify-between items-center mb-1">
          <span className="text-muted text-[10px] uppercase tracking-widest font-bold">Score</span>
          <span className="font-serif font-bold text-lg leading-none text-sage">{dataPoint.atsScore}/100</span>
        </p>
        <p className="text-text-main flex flex-col gap-1 mt-2">
          <span className="text-muted text-[10px] uppercase tracking-widest font-bold">Target Role</span>
          <span className="font-medium text-xs leading-snug line-clamp-2" title={dataPoint.targetRole.replace(/_/g, ' ')}>
            {dataPoint.targetRole.replace(/_/g, ' ')}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export default function DashboardView() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const response = await axios.get<DashboardData>(
          analytics_api,
        );

        setData(response.data);
      } catch (error) {
        console.error(error);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center py-20 text-red-500">
        {error ?? "No dashboard data found"}
      </div>
    );
  }

  const avgScore = Math.round(data.avgScore._avg.atsScore);
  const highestScore = data.highestScore._max.atsScore;

  let messageHeader = "";
  let messageBody = "";

  if (highestScore >= 80) {
    messageHeader = "Strong performance!";
    messageBody =
      `You've already achieved a high ATS score of ${highestScore}/100. Focus on maintaining consistency across different target roles and refining project impact statements.`;
  } else if (highestScore >= 60) {
    messageHeader = "Good foundation!";
    messageBody =
      `Your best score is ${highestScore}/100, which shows solid potential. Review the suggestions from your highest-scoring scans and apply those improvements to other target roles.`;
  } else {
    messageHeader = "Room to grow!";
    messageBody =
      `Your average ATS score is ${avgScore}/100. Focus on improving keyword alignment, project descriptions, and measurable impact to strengthen future applications.`;
  }

  const showDiffMessage = true;

  const chartData = [...data.scoreOverTime].sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()).map(d => ({
    ...d,
    dateLabel: format(parseISO(d.updatedAt), 'MMM dd')
  }));

  const onViewClick = (id: string) => {
    router.push(`/results/${id}`);
  }

  if (data.totalScans === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
        <h2 className="text-6xl font-serif mb-4">
          No Resume Analyses Yet
        </h2>

        <p className="text-muted-dark max-w-xl mb-8 text-xl opacity-85">
          Upload your first resume and start tracking ATS scores,
          strengths, weaknesses, and performance trends.
        </p>

        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 rounded-full bg-sage text-white font-medium hover:opacity-90 transition"
        >
          Analyze Resume
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col pt-8 px-4 max-w-300 mx-auto min-w-[320px]">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div>
          <h2 className="text-4xl font-serif tracking-tight mb-2">Performance Overview</h2>
          <p className="text-muted-dark text-sm max-w-lg">
            Analytics and insights based on your recent resume evaluations.
          </p>
        </div>

        {showDiffMessage && (
          <div className="bg-white px-6 py-5 rounded-2xl soft-shadow border border-warm/50 flex flex-col max-w-sm">
            <span className="text-[10px] text-muted uppercase tracking-[0.2em] font-bold mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sage"></span>
              Trend Analysis
            </span>
            <span className="text-sm text-text-main leading-relaxed">
              <strong className="font-serif text-lg block mb-1 text-sage">{messageHeader}</strong>
              {messageBody}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 px-4">
        <MetricCard label="TOTAL SCANS" value={data.totalScans} />
        <MetricCard label="AVERAGE SCORE" value={Math.round(data.avgScore._avg.atsScore)} suffix="/100" />
        <MetricCard label="HIGHEST SCORE" value={data.highestScore._max.atsScore} suffix="/100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 mb-8">

        <div className="lg:col-span-2 bg-white rounded-3xl p-8 soft-shadow border border-warm/50 flex flex-col h-100">
          <h3 className="font-serif text-xl font-bold mb-6">Score Over Time</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E4DD" />
                <XAxis
                  dataKey="updatedAt"
                  tickFormatter={(val) => format(parseISO(val), 'MMM dd')}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#8C8B82' }}
                  dy={10}
                />
                <YAxis
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#8C8B82' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E6E4DD', strokeWidth: 2, strokeDasharray: '4 4' }} />
                <Line
                  type="monotone"
                  dataKey="atsScore"
                  stroke="#5A5A40"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#5A5A40', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#5A5A40', stroke: '#FDFCFB', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <InsightCard label="BEST PERFORMING ROLE" value={data.bestRole.replace(/_/g, ' ')} />
          <InsightCard label="MOST SCANNED" value={data.mostScannedRole.targetRole.replace(/_/g, ' ')} />

          <div className="grid grid-cols-2 gap-4">
            <InsightMiniCard label="STRONGEST" value={data.strongest.label} score={data.strongest.score} color="text-sage" />
            <InsightMiniCard label="WEAKEST" value={data.weakestArea.label} score={data.weakestArea.score} color="text-amber-700" />
          </div>
        </div>

      </div>

      <div className="px-4">
        <div className="bg-white rounded-3xl p-6 soft-shadow border border-warm/50 flex flex-col">
          <div className="flex items-center gap-2 mb-6 px-2">
            <span className="text-[10px] text-muted uppercase tracking-[0.2em] font-bold">Recent Scans</span>
          </div>

          <div className="w-full overflow-x-auto pb-4">
            <div className="min-w-200">
              <div className="grid grid-cols-12 gap-6 px-4 py-4 border-b border-warm/40 text-[10px] uppercase tracking-[0.2em] font-bold text-muted">
                <div className="col-span-4">Role Target</div>
                <div className="col-span-3">Date</div>
                <div className="col-span-3">Score</div>
                <div className="col-span-2 text-right">Action</div>
              </div>

              <div className="flex flex-col">
                {[data.latest, data.oldest].filter(Boolean).map((scan) => (
                  <div key={scan.id} className="grid grid-cols-12 gap-6 px-4 py-6 items-center border-b border-warm/40 last:border-0 hover:bg-bg-light/30 transition-colors group">
                    <div className="col-span-4 font-serif font-bold text-lg text-text-main pr-4 uppercase">
                      {scan.title.replace(/_/g, ' ')}
                    </div>
                    <div className="col-span-3 text-sm text-muted-dark font-medium uppercase tracking-wide">
                      {format(parseISO(scan.createdAt), 'do MMM yyyy')}
                    </div>
                    <div className="col-span-3 flex items-center gap-4">
                      <span className="font-serif font-bold text-xl flex items-baseline gap-0.5 w-15 text-sage shrink-0">
                        {scan.atsScore}
                        <span className="text-xs font-sans text-muted font-normal">/100</span>
                      </span>
                      <div className="w-24 h-1.5 bg-warm/60 rounded-full overflow-hidden">
                        <div className="h-full bg-sage rounded-full" style={{ width: `${scan.atsScore}%` }}></div>
                      </div>
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <button
                        onClick={() => { onViewClick(scan.id) }}
                        className="px-5 py-2.5 rounded-full border border-warm/80 text-[11px] font-bold tracking-wider text-text-main hover:bg-sage hover:text-white hover:border-sage transition-all flex items-center gap-2 group/btn uppercase"
                      >
                        VIEW
                        <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 transition-all" />
                      </button>
                    </div>
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

function MetricCard({ label, value, suffix }: { label: string, value: string | number, suffix?: string }) {
  return (
    <div className="bg-white rounded-3xl p-8 soft-shadow border border-warm/50 flex flex-col justify-between items-start">
      <span className="text-[10px] text-muted uppercase tracking-[0.2em] font-bold mb-4">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-5xl font-serif font-light tracking-tight">{value}</span>
        {suffix && <span className="text-xl font-serif text-muted font-medium">{suffix}</span>}
      </div>
    </div>
  )
}

function InsightCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 soft-shadow border border-warm/50 flex flex-col h-full justify-center">
      <span className="text-[10px] text-muted uppercase tracking-[0.2em] font-bold mb-2">{label}</span>
      <span className="text-lg font-semibold tracking-tight">{value}</span>
    </div>
  )
}

function InsightMiniCard({ label, value, score, color }: { label: string, value: string, score: number, color: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 soft-shadow border border-warm/50 flex flex-col justify-between min-h-30">
      <span className="text-[10px] text-muted uppercase tracking-[0.2em] font-bold mb-2">{label}</span>
      <div>
        <div className={`text-2xl font-serif ${color} font-bold mb-1`}>{score}%</div>
        <div className="text-xs font-medium text-text-main line-clamp-1 truncate" title={value}>{value}</div>
      </div>
    </div>
  )
}
