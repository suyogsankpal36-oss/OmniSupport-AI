import React from 'react';
import { Sparkles, AlertTriangle, ShieldCheck, Zap, Copy, Check } from 'lucide-react';
import { Ticket } from '../../types';

interface AISummaryCardProps {
  ticket: Ticket;
  onApplySuggestedReply?: (text: string) => void;
}

export const AISummaryCard: React.FC<AISummaryCardProps> = ({ ticket, onApplySuggestedReply }) => {
  const [copied, setCopied] = React.useState(false);

  const getSuggestedReply = () => {
    if (ticket.summary?.toLowerCase().includes('webhook') || ticket.summary?.toLowerCase().includes('api')) {
      return `Hi ${ticket.customer_name}, I've reviewed your webhook telemetry and error logs. Our engineering team has checked the HMAC signing secret and verified that headers are being properly transmitted. Could you verify if your server endpoint is validating SHA-256 signatures?`;
    }
    if (ticket.summary?.toLowerCase().includes('invoice') || ticket.summary?.toLowerCase().includes('billing') || ticket.summary?.toLowerCase().includes('refund')) {
      return `Hi ${ticket.customer_name}, I am happy to help resolve this billing adjustment. I have checked your account and initiated the prorated credit adjustment for your recent seat changes, which will reflect on your statement within 2-3 business days.`;
    }
    return `Hi ${ticket.customer_name}, thanks for reaching out. I've taken over this ticket and am investigating your request right away.`;
  };

  const suggestedText = getSuggestedReply();

  const handleCopy = () => {
    navigator.clipboard.writeText(suggestedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-900/90 to-brand-950/40 border border-brand-500/30 rounded-2xl shadow-xl space-y-3 relative overflow-hidden">
      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-500/20 text-brand-400 border border-brand-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Copilot Diagnosis</h4>
            <p className="text-[11px] text-slate-400">Automated ticket assessment & context</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
              ticket.priority === 'URGENT'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : ticket.priority === 'MEDIUM'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {ticket.priority} Priority
          </span>
        </div>
      </div>

      {/* AI Summary Content */}
      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
        <p className="font-semibold text-brand-300 mb-1 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-brand-400" /> Executive Summary:
        </p>
        <p className="text-slate-300">{ticket.summary || 'Customer initiated automated support inquiry.'}</p>
      </div>

      {/* Suggested Copilot Reply */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> AI Recommended Resolution:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="hover:text-white flex items-center gap-1 transition text-[10px]"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            {onApplySuggestedReply && (
              <button
                onClick={() => onApplySuggestedReply(suggestedText)}
                className="px-2 py-0.5 bg-brand-600 hover:bg-brand-500 text-white rounded text-[10px] font-semibold transition"
              >
                Insert to Reply
              </button>
            )}
          </div>
        </div>
        <p className="text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 italic leading-relaxed">
          "{suggestedText}"
        </p>
      </div>
    </div>
  );
};
