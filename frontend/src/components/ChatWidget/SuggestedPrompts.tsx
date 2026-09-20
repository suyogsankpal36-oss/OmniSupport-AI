import React from 'react';
import { CreditCard, Zap, ShieldAlert, Sparkles, Code2 } from 'lucide-react';

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ onSelectPrompt, disabled }) => {
  const prompts = [
    {
      icon: CreditCard,
      badge: 'RAG Citation Test',
      label: 'Refund & Cancellation Policy',
      text: 'What is your refund and cancellation policy?',
      detail: 'Tests document-aware RAG citation matching and VAT invoice download guidance.',
      color: 'border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-900/30 text-emerald-300',
      badgeColor: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50',
    },
    {
      icon: Code2,
      badge: 'Code Block Test',
      label: 'Configure Webhooks for Stripe',
      text: 'How do I configure Webhooks for Stripe events?',
      detail: 'Tests syntax-highlighted Python/FastAPI code rendering & copy-to-clipboard.',
      color: 'border-brand-500/40 bg-brand-950/20 hover:bg-brand-900/30 text-brand-300',
      badgeColor: 'bg-brand-900/60 text-brand-300 border-brand-700/50',
    },
    {
      icon: ShieldAlert,
      badge: 'Escalation Test',
      label: 'Urgent Human Escalation',
      text: 'I have an urgent billing error, connect me with a human',
      detail: 'Tests automated sentiment detection, urgent tagging, and live agent hand-off.',
      color: 'border-rose-500/40 bg-rose-950/20 hover:bg-rose-900/30 text-rose-300',
      badgeColor: 'bg-rose-900/60 text-rose-300 border-rose-700/50',
    },
  ];

  return (
    <div className="space-y-2.5 py-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse-subtle" />
          <span>Click a Test Scenario to Run:</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">1-Click Demo</span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {prompts.map((p, idx) => {
          const Icon = p.icon;
          return (
            <button
              key={idx}
              disabled={disabled}
              onClick={() => onSelectPrompt(p.text)}
              className={`flex flex-col text-left p-3 rounded-xl border transition shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.99] ${p.color}`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-brand-200">
                  <Icon className="w-4 h-4 shrink-0" />
                  {p.label}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-semibold ${p.badgeColor}`}>
                  {p.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-1 italic mb-1">
                "{p.text}"
              </p>
              <p className="text-[10px] text-slate-400">
                {p.detail}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
