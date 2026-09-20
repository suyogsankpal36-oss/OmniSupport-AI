import React from 'react';
import { Sparkles, Bot, Headphones, BookOpen, BarChart2, Zap, ArrowRight } from 'lucide-react';

interface RecruiterBannerProps {
  onNavigate: (view: 'landing' | 'widget-demo' | 'agent' | 'knowledge' | 'analytics') => void;
  currentView: string;
}

export const RecruiterBanner: React.FC<RecruiterBannerProps> = ({ onNavigate, currentView }) => {
  return (
    <div className="bg-gradient-to-r from-slate-950 via-brand-950/60 to-slate-950 border-b border-brand-500/20 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
        </span>
        <span className="font-bold text-slate-200">
          🚀 Recruiter 1-Click Interactive Demo:
        </span>
        <span className="hidden sm:inline text-slate-400 text-[11px]">
          FastAPI SSE Streaming • Google Gemini 2.5 • RAG Context Injection • React 18+
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => onNavigate('widget-demo')}
          className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
            currentView === 'widget-demo'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-slate-900 text-brand-300 hover:bg-slate-800 border border-brand-500/30'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>💬 Customer Chatbot</span>
        </button>

        <button
          onClick={() => onNavigate('agent')}
          className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
            currentView === 'agent'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-slate-900 text-amber-300 hover:bg-slate-800 border border-amber-500/30'
          }`}
        >
          <Headphones className="w-3.5 h-3.5" />
          <span>🛡️ Agent Workspace</span>
        </button>

        <button
          onClick={() => onNavigate('knowledge')}
          className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
            currentView === 'knowledge'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>📚 RAG Docs</span>
        </button>

        <button
          onClick={() => onNavigate('analytics')}
          className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
            currentView === 'analytics'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>📊 Analytics</span>
        </button>
      </div>
    </div>
  );
};
