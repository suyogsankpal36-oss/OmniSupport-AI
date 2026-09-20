import React from 'react';
import {
  Bot,
  Headphones,
  Sparkles,
  Zap,
  BookOpen,
  BarChart2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Code2,
  Database,
  Cpu,
  Layers,
} from 'lucide-react';
import { ChatWindow } from './ChatWidget/ChatWindow';

interface LandingPageProps {
  onNavigate: (view: 'landing' | 'widget-demo' | 'agent' | 'knowledge' | 'analytics') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center space-y-6 max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-950/80 border border-brand-500/30 text-xs font-semibold text-brand-300 shadow-inner">
            <Sparkles className="w-4 h-4 text-brand-400 animate-pulse-subtle" />
            <span>Next-Generation AI Support Copilot Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Turn Support Inquiries into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-cyan-400 to-indigo-400">
              Instant Resolutions.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
            Enterprise-grade customer copilot inspired by Intercom AI and Zendesk. Features token-by-token
            SSE streaming, document-aware RAG context injection, and seamless live agent escalation.
          </p>

          {/* 1-Click Recruiter Demo Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('widget-demo')}
              className="px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm flex items-center gap-2 transition shadow-xl shadow-brand-600/25 hover:scale-105 active:scale-95"
            >
              <Bot className="w-5 h-5" />
              <span>💬 Test Customer Chatbot</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => onNavigate('agent')}
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 font-bold text-sm flex items-center gap-2 transition shadow-xl hover:scale-105 active:scale-95"
            >
              <Headphones className="w-5 h-5 text-amber-400" />
              <span>🛡️ Explore Agent Dashboard</span>
            </button>
          </div>

          {/* Tech Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4 text-xs font-mono text-slate-400">
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              ⚡ FastAPI SSE Streaming
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              🧠 Google Gemini 2.5
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              ⚛️ React 18 + TypeScript
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              🔍 RAG Context & Citations
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              🗄️ PostgreSQL / SQLite
            </span>
          </div>
        </div>

        {/* Live Interactive Embed Container */}
        <div className="mt-8 max-w-4xl mx-auto rounded-3xl p-3 bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-slate-700/80 shadow-2xl">
          <div className="flex items-center justify-between px-4 py-2 text-xs text-slate-400 border-b border-slate-850 mb-3 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 font-semibold text-slate-300">Live Customer Support Widget Demo</span>
            </div>
            <span className="hidden sm:inline text-emerald-400 font-semibold">● Real-time SSE Stream Active</span>
          </div>

          <div className="h-[520px] w-full">
            <ChatWindow embedded={true} />
          </div>
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section className="py-16 px-4 lg:px-8 max-w-7xl mx-auto border-t border-slate-850">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Engineered for Enterprise Support Teams
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Everything needed to automate first-response triage while empowering human specialists.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 transition space-y-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Token-by-Token AI Streaming</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              FastAPI Server-Sent Events (SSE) stream answers with sub-second time-to-first-token. Full support for rich markdown, tables, and syntax-highlighted code.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition space-y-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Grounded RAG & Citations</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Queries are matched against the KnowledgeDocument index. Grounded snippets are injected into the prompt and verified citations are attached to responses.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition space-y-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Headphones className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Smart Human Escalation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sentiment detection triggers ticket transition to <code className="text-amber-300">NEEDS_HUMAN</code>. AI generates an instant issue summary so agents take over seamlessly.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 lg:px-8 max-w-7xl mx-auto border-t border-slate-850 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>
          <span className="font-bold text-slate-300">OmniSupport AI</span> • Production-Ready Full-Stack Portfolio Platform
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('widget-demo')} className="hover:text-slate-300">
            Customer Widget
          </button>
          <button onClick={() => onNavigate('agent')} className="hover:text-slate-300">
            Agent Desk
          </button>
          <button onClick={() => onNavigate('knowledge')} className="hover:text-slate-300">
            RAG Base
          </button>
          <button onClick={() => onNavigate('analytics')} className="hover:text-slate-300">
            Analytics
          </button>
        </div>
      </footer>
    </div>
  );
};
