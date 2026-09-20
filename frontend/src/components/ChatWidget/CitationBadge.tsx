import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, ExternalLink, Sparkles } from 'lucide-react';
import { Citation } from '../../types';

interface CitationBadgeProps {
  citations: Citation[];
}

export const CitationBadge: React.FC<CitationBadgeProps> = ({ citations }) => {
  const [expanded, setExpanded] = useState(false);

  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-2 mb-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-brand-300 transition shadow-sm"
      >
        <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse-subtle" />
        <span className="font-medium">
          {citations.length} Knowledge {citations.length === 1 ? 'Source' : 'Sources'} Grounded
        </span>
        {expanded ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
      </button>

      {expanded && (
        <div className="mt-2 p-3 bg-slate-900/90 border border-slate-750 rounded-xl space-y-2.5 animate-slide-up text-xs shadow-xl">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-brand-400" /> Grounded Context Sources (RAG)
          </div>
          {citations.map((c, i) => (
            <div key={i} className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 hover:border-brand-500/50 transition">
              <div className="flex items-center justify-between font-semibold text-slate-200">
                <span className="text-brand-300">
                  #{c.id}: {c.title}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-brand-950 text-brand-400 border border-brand-800">
                  {c.category}
                </span>
              </div>
              <p className="mt-1 text-slate-400 line-clamp-2 text-[11px] leading-relaxed">
                {c.snippet}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
