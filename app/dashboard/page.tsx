"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { analytics_api } from "@/lib/api";
import { useUser } from "@/hooks/useUser";
import {
  ChevronLeft, BarChart2, TrendingUp, TrendingDown,
  Target, Award, Activity, FileText, Brain, ChevronRight,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import GoogleAuthButton from "@/components/AuthButton";

type AnalyticsResponse = {
  totalScans: number;
  avgScore: { _avg: { atsScore: number | null } };
  highestScore: { _max: { atsScore: number | null } };
  bestRole: string;
  mostScannedRole: { targetRole: string };
  scoreOverTime: { atsScore: number; targetRole: string; updatedAt: string }[];
  weakestArea: { label: string; score: number };
  strongest: { label: string; score: number };
  latest: { id: string; title: string; atsScore: number; createdAt: string };
  oldest: { id: string; title: string; atsScore: number; createdAt: string };
};

const fetchAnalyticsData = async () => {
  const response = await axios.get(analytics_api, { withCredentials: true });
  return response.data;
};

type TooltipPayloadItem = { value: number | string; payload: { role: string } };

const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900/95 border border-zinc-800 p-4 rounded-xl">
        <p className="text-zinc-500 font-mono text-[10px] uppercase mb-2">{label}</p>
        <p className="text-[#CCFF00] font-mono text-3xl font-black leading-none mb-1">{payload[0].value}</p>
        <p className="text-white font-mono text-[10px] uppercase tracking-widest">{payload[0].payload.role}</p>
      </div>
    );
  }
  return null;
};

const scoreColor = (score: number) =>
  score >= 70 ? "#CCFF00" : score >= 40 ? "#FFB800" : "#FF3366";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        const res = await fetchAnalyticsData();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setDataLoading(false);
      }
    };

    load();
  }, [user]);

  const formatRole = (role: string) => role.replace(/_/g, " ");
  const formatArea = (area: string) =>
    area.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

  if (authLoading || dataLoading) return (
    <div className="min-h-screen bg-[#060606] flex items-center justify-center relative">
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(204,255,0,0.05) 1px, transparent 0)",
          backgroundSize: "32px 32px"
        }}
      />
      <Activity size={32} className="animate-pulse relative z-10" style={{ color: '#CCFF00' }} />
    </div>
  );

  if (!user) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <div className="auth-modal relative bg-zinc-950 border border-zinc-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center">
        <div className="w-12 h-12 bg-[#CCFF00] rounded-xl flex items-center justify-center mb-6">
          <FileText size={24} className="text-black" />
        </div>
        <h3 className="font-clash font-bold text-2xl mb-2">Sign in required</h3>
        <p className="text-zinc-400 text-center text-sm mb-8">
          Create an account or sign in to save your reports and access full analysis.
        </p>

        <GoogleAuthButton />

        <button className="mt-4 text-xs font-mono text-zinc-500 hover:text-white uppercase tracking-widest">
          Cancel
        </button>
      </div>
    </div>
  )

  if (!data) return (
    <div className="min-h-screen bg-[#060606] flex items-center justify-center text-zinc-500 font-mono text-sm">
      Failed to load analytics
    </div>
  );


  const hasScans = data.totalScans > 0;

  const chartData = data.scoreOverTime.map((item) => ({
    date: new Date(item.updatedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
    score: item.atsScore,
    role: item.targetRole,
  }));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&display=swap');
        @keyframes drift { 0% { transform: translate(-50px,-50px); } 100% { transform: translate(50px,50px); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        .su1 { animation: slideUp 0.55s cubic-bezier(.16,1,.3,1) 0.05s both; }
        .su2 { animation: slideUp 0.55s cubic-bezier(.16,1,.3,1) 0.15s both; }
        .su3 { animation: slideUp 0.55s cubic-bezier(.16,1,.3,1) 0.25s both; }
        .orb { position:fixed; width:600px; height:600px; background:radial-gradient(circle, rgba(204,255,0,0.08) 0%, transparent 60%); filter:blur(100px); top:5%; left:15%; z-index:0; pointer-events:none; animation:drift 20s infinite alternate ease-in-out; }
        .glass { background:rgba(24,24,27,0.4); backdrop-filter:blur(24px); border:1px solid rgba(255,255,255,0.05); }
        .card { transition: border-color 0.2s, transform 0.2s; }
        .card:hover { border-color: rgba(255,255,255,0.1) !important; transform: translateY(-2px); }
        .card-lime:hover { border-color: rgba(204,255,0,0.2) !important; }
        .card-amber:hover { border-color: rgba(255,184,0,0.2) !important; }
        .scan-row { transition: background 0.15s; }
        .scan-row:hover { background: rgba(255,255,255,0.03); }
        .view-btn { transition: all 0.2s; }
        .view-btn:hover { background: #CCFF00 !important; color: #000 !important; }
        .recharts-cartesian-axis-tick-value { fill: #52525b; font-family: 'JetBrains Mono', monospace; font-size: 10px; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }
      `}</style>

      <div className="min-h-screen bg-[#060606] text-white relative p-16 overflow-x-hidden">

        {/* Dot grid bg */}
        <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(rgba(204,255,0,0.05) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="orb" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 pb-24">

          {/* Back */}
          <button
            onClick={() => router.push("/")}
            className="su1 flex items-center gap-2 text-zinc-500 hover:text-white font-mono text-[11px] uppercase tracking-widest transition-colors mb-9 bg-transparent border-none cursor-pointer group"
          >
            <ChevronLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
            Back to Scanner
          </button>

          {/* ROW 1: Profile + 3 metric cards */}
          <div className="su1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">

            {/* Profile */}
            <div className="glass card card-lime rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-[#CCFF00]/5 rounded-full blur-2xl pointer-events-none" />
              <div className="w-20 h-20 rounded-full border-2 border-zinc-800 bg-black mb-4 overflow-hidden relative z-10">
                <Image
                  src={user?.photoURL || "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Brian"}
                  alt={user?.displayName || "user"}
                  width={80} height={80}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <h1 className="font-mono font-bold text-[13px] uppercase tracking-widest mb-4 z-10 text-center">
                {user?.displayName || "—"}
              </h1>
              {hasScans ? (
                <div className="bg-[#CCFF00]/10 border border-[#CCFF00]/20 px-3 py-1.5 rounded flex items-center gap-1.5 z-10">
                  <Target size={11} className="text-[#CCFF00]" />
                  <span className="font-mono text-[10px] text-[#CCFF00] uppercase tracking-wider">
                    Best: {formatRole(data.bestRole)}
                  </span>
                </div>
              ) : (
                <div className="bg-zinc-800 border border-white/5 px-3 py-1.5 rounded">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase">No Scans Yet</span>
                </div>
              )}
            </div>

            {/* Highest Score */}
            <div className="glass card rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent to-[#CCFF00]" />
              <div className="flex justify-between items-start mb-4">
                <div className="w-11 h-11 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center">
                  <Award size={20} className="text-[#CCFF00]" />
                </div>
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider text-right leading-relaxed">
                  Highest<br />Score
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-mono text-5xl font-black text-[#CCFF00] tracking-tight leading-none">
                    {hasScans ? data.highestScore._max.atsScore ?? "—" : "—"}
                  </span>
                  {hasScans && <span className="font-mono text-lg text-zinc-600">/100</span>}
                </div>
                <span className="font-mono text-[10px] text-zinc-700 uppercase">
                  {hasScans ? formatRole(data.bestRole) : "—"}
                </span>
              </div>
            </div>

            {/* Avg Score */}
            <div className="glass card rounded-3xl p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="w-11 h-11 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <Activity size={20} className="text-zinc-500" />
                </div>
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider text-right leading-relaxed">
                  Average<br />Score
                </span>
              </div>
              <span className="font-mono text-5xl font-black tracking-tight">
                {hasScans ? Math.floor(data.avgScore._avg.atsScore || 0) : "—"}
              </span>
            </div>

            {/* Total Scans */}
            <div className="glass card rounded-3xl p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="w-11 h-11 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <FileText size={20} className="text-zinc-500" />
                </div>
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider text-right leading-relaxed">
                  Total<br />Scans
                </span>
              </div>
              <span className="font-mono text-5xl font-black tracking-tight">{data.totalScans}</span>
            </div>
          </div>

          {/* ROW 2: Chart + Strong/Weak */}
          <div className="su2 grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

            {/* Chart */}
            <div className="glass card rounded-3xl p-7 lg:col-span-2">
              <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-6 gap-4">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2 mb-1.5">
                    <BarChart2 size={18} className="text-[#CCFF00]" /> Score Trajectory
                  </h2>
                  <p className="text-sm text-zinc-500">Your ATS match progression over time</p>
                </div>
                <div className="flex items-center gap-2 bg-[#CCFF00]/8 border border-[#CCFF00]/15 px-3 py-1.5 rounded-lg self-start">
                  <TrendingUp size={14} className="text-[#CCFF00]" />
                  <span className="font-mono text-[#CCFF00] font-bold text-xs">Score Over Time</span>
                </div>
              </div>

              {hasScans && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tickMargin={12} />
                    <YAxis axisLine={false} tickLine={false} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
                    <Tooltip cursor={{ stroke: "#27272a", strokeWidth: 1 }} content={<CustomTooltip />} />
                    <ReferenceLine y={50} stroke="#52525b" strokeDasharray="5 5" opacity={0.4} />
                    <Line type="monotone" dataKey="score" stroke="#CCFF00" strokeWidth={3}
                      dot={{ r: 4, fill: "#060606", stroke: "#CCFF00", strokeWidth: 2 }}
                      activeDot={{ r: 7, fill: "#CCFF00", stroke: "#060606", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-zinc-800">
                  <BarChart2 size={40} className="mb-3" />
                  <span className="font-mono text-xs text-zinc-600 uppercase">No data available</span>
                </div>
              )}
            </div>

            {/* Strongest + Weakest */}
            <div className="flex flex-col gap-5">
              <div className="glass card card-lime rounded-3xl p-6 flex-1 relative overflow-hidden" style={{ borderTop: "2px solid rgba(204,255,0,0.35)" }}>
                <div className="absolute -right-4 -bottom-4 opacity-[0.04]"><Brain size={90} /></div>
                <div className="flex items-center justify-between mb-3">
                  <TrendingUp size={18} className="text-[#CCFF00]" />
                  {hasScans && (
                    <span className="font-mono text-xs text-[#CCFF00] bg-[#CCFF00]/10 px-2.5 py-0.5 rounded font-bold">
                      {data.strongest.score}%
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-1.5">{hasScans ? formatArea(data.strongest.label) : "—"}</h3>
                <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">Strongest Area</p>
              </div>

              <div className="glass card card-amber rounded-3xl p-6 flex-1 relative overflow-hidden" style={{ borderTop: "2px solid rgba(255,184,0,0.35)" }}>
                <div className="absolute -right-4 -bottom-4 opacity-[0.04]"><Activity size={90} /></div>
                <div className="flex items-center justify-between mb-3">
                  <TrendingDown size={18} className="text-[#FFB800]" />
                  {hasScans && (
                    <span className="font-mono text-xs text-[#FFB800] bg-[#FFB800]/10 px-2.5 py-0.5 rounded font-bold">
                      {data.weakestArea.score}%
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-1.5">{hasScans ? formatArea(data.weakestArea.label) : "—"}</h3>
                <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">Weakest Area</p>
              </div>
            </div>
          </div>

          {/* ROW 3: Recent Scans */}
          <div className="su3 glass rounded-3xl overflow-hidden">
            <div className="px-7 py-5 border-b border-white/5 bg-black/20 flex items-center gap-2">
              <FileText size={14} className="text-zinc-600" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">Recent Scans</span>
            </div>

            {hasScans ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-125">
                  <thead>
                    <tr className="border-b border-white/5 bg-zinc-900/40">
                      {["Role Target", "Date", "Score", "Action"].map((h, i) => (
                        <th key={h} className={`px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-zinc-600 font-normal ${i === 3 ? "text-right" : "text-left"}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[data.latest, data.oldest].filter(Boolean).map((scan) => (
                      <tr key={scan.id} className="scan-row border-b border-white/4 last:border-0">
                        <td className="px-5 py-4 text-sm font-bold uppercase">{formatRole(scan.title)}</td>
                        <td className="px-5 py-4 font-mono text-xs text-zinc-500">
                          {new Date(scan.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-sm font-bold" style={{ color: scoreColor(scan.atsScore) }}>
                              {scan.atsScore}/100
                            </span>
                            <div className="w-14 h-1 bg-zinc-900 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-1000"
                                style={{ width: `${scan.atsScore}%`, background: scoreColor(scan.atsScore) }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            className="view-btn inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 border-none text-white font-mono text-[10px] uppercase tracking-wider cursor-pointer"
                            onClick={() => router.push(`/results/${scan.id}`)}
                          >
                            View <ChevronRight size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 px-6 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center mb-5">
                  <FileText size={22} className="text-zinc-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">No scans yet</h3>
                <p className="text-zinc-600 text-sm mb-7 max-w-xs">
                  Upload your resume and pick a target role to generate your first ATS report.
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="px-7 py-3 bg-[#CCFF00] text-black font-mono font-bold text-xs uppercase tracking-wider rounded-lg border-none cursor-pointer hover:bg-[#d9ff26] transition-colors"
                >
                  Start First Scan
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}