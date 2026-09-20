import React, { useState } from 'react';
import { MessageSquare, X, Sparkles } from 'lucide-react';
import { ChatWindow } from './ChatWindow';

export const FloatingWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 animate-slide-up origin-bottom-right">
          <ChatWindow onClose={() => setIsOpen(false)} />
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Support Chat"
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-xl hover:shadow-brand-500/30 hover:scale-105 active:scale-95 transition duration-200 border border-brand-400/30"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-950"></span>
        </span>

        {isOpen ? (
          <X className="w-6 h-6 transition transform group-hover:rotate-90 duration-200" />
        ) : (
          <div className="flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
        )}
      </button>
    </div>
  );
};
