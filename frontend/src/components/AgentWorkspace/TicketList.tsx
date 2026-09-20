import React, { useState } from 'react';
import { Search, Filter, AlertCircle, CheckCircle2, Bot, Headphones, Clock } from 'lucide-react';
import { Ticket, TicketStatus } from '../../types';

interface TicketListProps {
  tickets: Ticket[];
  selectedTicketId: number | null;
  onSelectTicket: (ticket: Ticket) => void;
  isLoading?: boolean;
}

export const TicketList: React.FC<TicketListProps> = ({
  tickets,
  selectedTicketId,
  onSelectTicket,
  isLoading,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      t.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.summary && t.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const needsHumanCount = tickets.filter((t) => t.status === 'NEEDS_HUMAN').length;
  const botCount = tickets.filter((t) => t.status === 'BOT_HANDLING').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED').length;

  const formatRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const diffMinutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString();
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-full md:w-80 lg:w-96 shrink-0">
      {/* Header & Search */}
      <div className="p-3.5 border-b border-slate-800 space-y-3 bg-slate-950/50">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <span>Ticket Queue</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-medium">
              {tickets.length}
            </span>
          </h2>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets, customers, issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-750 focus:border-brand-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-medium scrollbar-none">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({tickets.length})
          </button>
          <button
            onClick={() => setStatusFilter('NEEDS_HUMAN')}
            className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap flex items-center gap-1 ${
              statusFilter === 'NEEDS_HUMAN'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-950/40 text-amber-300 border border-amber-800/50 hover:bg-amber-900/40'
            }`}
          >
            <Headphones className="w-3 h-3" />
            <span>Escalated</span>
            {needsHumanCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center ml-0.5">
                {needsHumanCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setStatusFilter('BOT_HANDLING')}
            className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap flex items-center gap-1 ${
              statusFilter === 'BOT_HANDLING'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3 h-3" />
            <span>AI Bot</span>
          </button>
          <button
            onClick={() => setStatusFilter('RESOLVED')}
            className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap flex items-center gap-1 ${
              statusFilter === 'RESOLVED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Resolved</span>
          </button>
        </div>
      </div>

      {/* Ticket List Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1.5">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400 space-y-2">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Loading tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-400">No tickets found</p>
            <p>Try clearing your search query or switching filters.</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const isSelected = selectedTicketId === ticket.id;
            const isEscalated = ticket.status === 'NEEDS_HUMAN';

            return (
              <div
                key={ticket.id}
                onClick={() => onSelectTicket(ticket)}
                className={`p-3 rounded-xl cursor-pointer transition relative group ${
                  isSelected
                    ? 'bg-slate-800 border-2 border-brand-500 shadow-md'
                    : isEscalated
                    ? 'bg-amber-950/20 hover:bg-amber-950/30 border border-amber-900/40'
                    : 'bg-slate-900 hover:bg-slate-850 border border-slate-800/80'
                }`}
              >
                {/* Header info */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-xs font-bold text-white truncate group-hover:text-brand-300 transition">
                      {ticket.customer_name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">#{ticket.id}</span>
                  </div>

                  <span className="text-[10px] text-slate-500 whitespace-nowrap flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {formatRelativeTime(ticket.updated_at || ticket.created_at)}
                  </span>
                </div>

                {/* Summary / Last Message */}
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mb-2">
                  {ticket.summary || ticket.last_message || 'Support inquiry conversation'}
                </p>

                {/* Footer Badges */}
                <div className="flex items-center justify-between text-[10px] font-medium pt-1 border-t border-slate-800/40">
                  <div className="flex items-center gap-1.5">
                    {ticket.status === 'NEEDS_HUMAN' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                        <Headphones className="w-3 h-3" /> Needs Human
                      </span>
                    ) : ticket.status === 'RESOLVED' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Resolved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                        <Bot className="w-3 h-3" /> AI Bot
                      </span>
                    )}
                  </div>

                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      ticket.priority === 'URGENT'
                        ? 'text-rose-400 bg-rose-950/40'
                        : ticket.priority === 'MEDIUM'
                        ? 'text-amber-400 bg-amber-950/40'
                        : 'text-slate-400 bg-slate-800'
                    }`}
                  >
                    {ticket.priority}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
