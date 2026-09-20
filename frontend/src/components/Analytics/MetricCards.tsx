import React from 'react';
import { Bot, Headphones, CheckCircle2, Clock, Zap, TrendingUp } from 'lucide-react';
import { AnalyticsOverview } from '../../types';

interface MetricCardsProps {
  data: AnalyticsOverview;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ data }) => {
  const cards = [
    {
      title: 'AI Resolution Rate',
      value: `${data.ai_resolution_rate}%`,
      subtitle: 'Queries solved without human intervention',
      icon: Zap,
      color: 'from-brand-600/20 to-indigo-600/20 border-brand-500/30 text-brand-400',
      badge: '+4.2% vs last week',
      badgeColor: 'text-emerald-400 bg-emerald-500/10',
    },
    {
      title: 'Total Inquiries',
      value: data.total_inquiries.toLocaleString(),
      subtitle: 'Conversations handled across channels',
      icon: Bot,
      color: 'from-blue-600/20 to-cyan-600/20 border-blue-500/30 text-blue-400',
      badge: '24/7 Active',
      badgeColor: 'text-blue-300 bg-blue-500/10',
    },
    {
      title: 'Avg AI Response Time',
      value: `${data.avg_response_time_seconds}s`,
      subtitle: 'Token streaming latency',
      icon: Clock,
      color: 'from-purple-600/20 to-pink-600/20 border-purple-500/30 text-purple-400',
      badge: 'Sub-second',
      badgeColor: 'text-purple-300 bg-purple-500/10',
    },
    {
      title: 'Escalated to Human',
      value: data.escalated_to_human.toString(),
      subtitle: 'Smart hand-offs to support reps',
      icon: Headphones,
      color: 'from-amber-600/20 to-orange-600/20 border-amber-500/30 text-amber-400',
      badge: 'Escalation Alert',
      badgeColor: 'text-amber-300 bg-amber-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`p-5 rounded-2xl bg-gradient-to-br bg-slate-900 border ${c.color} shadow-xl relative overflow-hidden group hover:border-brand-400/50 transition`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400">{c.title}</span>
              <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700">
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-2xl font-black text-white tracking-tight">{c.value}</h3>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${c.badgeColor}`}>
                {c.badge}
              </span>
            </div>

            <p className="text-[11px] text-slate-400">{c.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
};
