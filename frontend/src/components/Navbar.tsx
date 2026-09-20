import React, { useState, useEffect } from 'react';
import {
  Bot,
  Headphones,
  BookOpen,
  BarChart2,
  Sparkles,
  Layers,
  Activity,
  Github,
  Globe,
} from 'lucide-react';
import { api } from '../services/api';

interface NavbarProps {
  currentView: 'landing' | 'widget-demo' | 'agent' | 'knowledge' | 'analytics';
  onNavigate: (view: 'landing' | 'widget-demo' | 'agent' | 'knowledge' | 'analytics') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    const check = async () => {
      try {
        await api.checkHealth();
        setBackendStatus('online');
      } catch {
        setBackendStatus('offline');
      }
    };
    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'landing', label: 'Overview', icon: Layers },
    { id: 'widget-demo', label: 'Customer Chatbot', icon: Bot },
    { id: 'agent', label: 'Agent Workspace', icon: Headphones },
    { id: 'knowledge', label: 'Knowledge Base & RAG', icon: BookOpen },
    { id: 'analytics', label: 'Analytics & KPIs', icon: BarChart2 },
  ];

  return (
    <header className="h-16 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between z-40 sticky top-0">
      {/* Brand */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 group text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-base tracking-tight group-hover:text-brand-300 transition">
                OmniSupport
              </span>
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-cyan-400 text-base">
                AI
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block">
              Enterprise Customer Copilot
            </span>
          </div>
        </button>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  isActive
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right status & badges */}
      <div className="flex items-center gap-3">
        {/* Backend health status badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              backendStatus === 'online'
                ? 'bg-emerald-400 animate-pulse'
                : backendStatus === 'offline'
                ? 'bg-rose-500'
                : 'bg-amber-400'
            }`}
          />
          <span className="text-slate-300 hidden sm:inline">
            {backendStatus === 'online' ? 'FastAPI SSE Online' : 'Connecting...'}
          </span>
        </div>

        {/* User profile avatar in agent desk */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80"
            alt="Support Lead"
            className="w-7 h-7 rounded-full border border-brand-500/50 object-cover"
          />
          <div className="hidden lg:block text-left">
            <span className="text-xs font-bold text-slate-200 block leading-tight">
              Sarah Jenkins
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">Support Lead</span>
          </div>
        </div>
      </div>
    </header>
  );
};
