"use client";

import { ArrowLeft, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { fetchResume_by_id } from '@/lib/api';
import Loader from '@/components/Loader';

interface AnalysisResult {
  id: string;
  userId: string;
  status: string;
  title: string;
  atsScore: number;
  targetRole: string;
  scanCount: number;

  scoreBreakdown: {
    education: number;
    structure: number;
    keywordMatch: number;
    proofOfImpact: number;
    projectQuality: number;
    workExperience: number;
  };

  extractedText: {
    links: {
      github: string | null;
      linkedin: string | null;
      portfolio: string | null;
    };

    tools: string[];
    skills: string[];
    languages: string[];
    frameworks: string[];
    certifications: string[];

    experience: unknown[];

    education: {
      year: string;
      degree: string;
      institution: string;
    }[];

    projects: {
      name: string;
      tier: string;
      techStack: string[];
      description: string;
    }[];
  };

  improvementMessage: {
    overall: string;
    topAction: string;
    roleAlignment: string;
  };

  strengths: {
    title: string;
    description: string;
  }[];

  weaknesses: {
    title: string;
    description: string;
  }[];

  suggestions: {
    area: string;
    priority: string;
    suggestion: string;
  }[];

  createdAt: string;
  updatedAt: string;
}

export default function ResumeDetailsView() {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await axios.get(
          fetchResume_by_id(id),
          {
            withCredentials: true,
          }
        );

        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAnalysis();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (!data) {
    return <div>Analysis not found</div>;
  }

  return (
    <div className="w-full flex flex-col pt-8 px-4 max-w-300 mx-auto min-w-82.5">
      <div className="mb-10">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-muted-dark hover:text-sage transition-colors font-medium text-[11px] uppercase tracking-widest group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted uppercase tracking-[0.2em] font-bold mb-2">Detailed Scan Report</span>
          <h2 className="text-4xl md:text-5xl font-serif tracking-tight mb-3 text-text-main leading-none">
            {data.targetRole.replace(/_/g, ' ')}
          </h2>
          <span className="text-muted-dark text-sm tracking-wide">
            Evaluated on {format(parseISO(data.updatedAt), 'do MMMM yyyy, h:mm a')}
          </span>
        </div>

        <div className="bg-white px-8 py-5 rounded-3xl soft-shadow border border-warm/50 flex flex-col items-end min-w-50">
          <span className="text-[10px] text-muted uppercase tracking-[0.2em] font-bold mb-1">Total ATS Score</span>
          <div className="font-serif text-5xl font-bold flex items-baseline gap-0.5 text-text-main">
            {data.atsScore}
            <span className="text-lg font-sans text-muted font-normal">/100</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="bg-white rounded-3xl p-8 soft-shadow border border-warm/50">
            <h3 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
              Executive Summary
            </h3>
            <p className="text-text-main leading-relaxed mb-6">
              {data.improvementMessage.overall}
            </p>

            <div className="bg-bg-alt rounded-2xl p-5 border border-warm-dark/50">
              <span className="text-[10px] text-sage-dark uppercase tracking-[0.2em] font-bold mb-2 block">
                Top Action
              </span>
              <p className="text-sm font-medium text-text-main">
                {data.improvementMessage.topAction}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-8 soft-shadow border border-warm/50">
              <span className="text-[10px] text-sage uppercase tracking-[0.2em] font-bold mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Key Strengths
              </span>
              <div className="flex flex-col gap-5">
                {data.strengths.length > 0 ? (
                  data.strengths.map((strength, i) => (
                    <div
                      key={i}
                      className="flex flex-col border-b border-warm/30 pb-4 last:border-0 last:pb-0"
                    >
                      <span className="font-serif text-lg font-bold mb-1">
                        {strength.title}
                      </span>

                      <span className="text-sm text-muted-dark leading-snug">
                        {strength.description}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-dark italic">
                    No strengths were identified from this resume analysis.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-bg-alt rounded-3xl p-8 soft-shadow border border-warm-dark/30">
              <span className="text-[10px] text-text-main uppercase tracking-[0.2em] font-bold mb-6 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Critical Weaknesses
              </span>
              <div className="flex flex-col gap-5">
                {data.weaknesses.map((weakness, i) => (
                  <div key={i} className="flex flex-col border-b border-warm/30 pb-4 last:border-0 last:pb-0">
                    <span className="font-serif text-lg font-bold mb-1">{weakness.title}</span>
                    <span className="text-sm text-muted-dark leading-snug">{weakness.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        <div className="flex flex-col gap-8">
          <div className="bg-white rounded-3xl p-8 soft-shadow border border-warm/50">
            <span className="text-[10px] text-muted uppercase tracking-[0.2em] font-bold mb-6 block">
              Score Breakdown
            </span>
            <div className="flex flex-col gap-4">
              {Object.entries(data.scoreBreakdown).map(([key, score]) => (
                <div key={key} className="flex justify-between items-center group">
                  <span className="text-sm font-medium text-text-main capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-serif font-bold text-lg text-sage">{score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Suggestions */}
          <div className="bg-white rounded-3xl p-8 soft-shadow border border-warm/50 flex-1">
            <span className="text-[10px] text-muted uppercase tracking-[0.2em] font-bold mb-6 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-sage" />
              Suggestions Map
            </span>
            <div className="flex flex-col gap-6">
              {data.suggestions.map((sugg, i) => (
                <div key={i} className="flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-serif font-bold text-md">{sugg.area}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${sugg.priority === 'HIGH' ? 'bg-bg-alt-dark text-sage-dark' : 'bg-bg-alt text-muted-dark'
                      }`}>
                      {sugg.priority}
                    </span>
                  </div>
                  <p className="text-xs text-muted-dark leading-relaxed">
                    {sugg.suggestion}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Extracted Profile Bottom Section */}
      <div className="mt-8 bg-white rounded-3xl p-8 soft-shadow border border-warm/50">
        <span className="text-[10px] text-muted uppercase tracking-[0.2em] font-bold mb-6 block">
          Extracted Profile Entities
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-text-main uppercase tracking-wider">Identified Skills</span>
            <div className="flex flex-wrap gap-2">
              {data.extractedText.skills.map((skill, i) => (
                <span key={i} className="px-3 py-1.5 bg-bg-light border border-warm/70 rounded-lg text-xs font-medium text-muted-dark">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-text-main uppercase tracking-wider">Education</span>
            {data.extractedText.education.map((edu, i) => (
              <div key={i} className="flex flex-col bg-bg-light p-3 rounded-xl border border-warm/70">
                <span className="font-serif font-bold text-sage">{edu.degree}</span>
                <span className="text-xs font-medium">{edu.institution}</span>
                <span className="text-[10px] text-muted mt-1">{edu.year}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-text-main uppercase tracking-wider">Extracted Projects</span>
            <div className="flex flex-col gap-3">
              {data.extractedText.projects.map((proj, i) => (
                <div key={i} className="flex flex-col bg-bg-light p-3 rounded-xl border border-warm/70">
                  <span className="font-serif font-bold text-text-main">{proj.name}</span>
                  <span className="text-[10px] text-muted-dark leading-snug mt-1">{proj.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
