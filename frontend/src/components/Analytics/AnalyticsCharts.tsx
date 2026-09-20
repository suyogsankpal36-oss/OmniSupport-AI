import React from 'react';
import { BarChart3, PieChart, Activity, ShieldCheck } from 'lucide-react';
import { AnalyticsOverview } from '../../types';

interface AnalyticsChartsProps {
  data: AnalyticsOverview;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ data }) => {
  const maxQueries = Math.max(...data.query_volume_timeline.map((d) => d.ai_handled + d.human_escalated), 50);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 7-Day Query Volume Timeline */}
      <div className="lg:col-span-2 p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              7-Day Conversation Activity (AI vs Human)
            </h3>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-brand-500" /> AI Resolved
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Human Escalated
            </span>
          </div>
        </div>

        {/* Chart Bars */}
        <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-800">
          {data.query_volume_timeline.map((point, idx) => {
            const aiHeight = (point.ai_handled / maxQueries) * 100;
            const humanHeight = (point.human_escalated / maxQueries) * 100;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="w-full max-w-[36px] flex flex-col items-center justify-end h-full gap-0.5">
                  <div
                    style={{ height: `${humanHeight}%` }}
                    className="w-full bg-amber-500/80 rounded-t-sm group-hover:bg-amber-400 transition"
                    title={`Human Escalated: ${point.human_escalated}`}
                  />
                  <div
                    style={{ height: `${aiHeight}%` }}
                    className="w-full bg-brand-500 rounded-b-sm group-hover:bg-brand-400 transition shadow-sm"
                    title={`AI Handled: ${point.ai_handled}`}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-mono font-medium">
                  {point.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Query Distribution */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Top Queried Categories
          </h3>
        </div>

        <div className="space-y-3 pt-2">
          {data.category_distribution.map((cat, i) => {
            const totalCatQueries = data.category_distribution.reduce((a, b) => a + b.queries_handled, 0) || 1;
            const percentage = Math.round((cat.queries_handled / totalCatQueries) * 100);

            return (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">{cat.category}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{cat.queries_handled} queries ({percentage}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${percentage}%` }}
                    className={`h-full rounded-full ${
                      i === 0
                        ? 'bg-brand-500'
                        : i === 1
                        ? 'bg-indigo-500'
                        : i === 2
                        ? 'bg-purple-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
