import React, { useState, useEffect } from 'react';
import { BarChart2, RotateCcw, Sparkles } from 'lucide-react';
import { AnalyticsOverview } from '../../types';
import { api } from '../../services/api';
import { MetricCards } from './MetricCards';
import { AnalyticsCharts } from './AnalyticsCharts';

export const AnalyticsView: React.FC = () => {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const overview = await api.getAnalytics();
      setData(overview);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-950 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>Executive Copilot Analytics & SLA Dashboard</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                Live Metrics
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Real-time telemetry on AI containment rate, streaming latencies, and escalation bottlenecks
            </p>
          </div>
        </div>

        <button
          onClick={fetchAnalytics}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading executive analytics...
        </div>
      ) : data ? (
        <div className="space-y-6">
          <MetricCards data={data} />
          <AnalyticsCharts data={data} />
        </div>
      ) : (
        <div className="p-12 text-center text-rose-400 text-xs">Failed to load analytics.</div>
      )}
    </div>
  );
};
