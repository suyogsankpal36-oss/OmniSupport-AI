import React, { useState, useEffect } from 'react';
import { TicketList } from './TicketList';
import { TicketDetail } from './TicketDetail';
import { Ticket } from '../../types';
import { api } from '../../services/api';
import { Headphones, ShieldAlert, Sparkles, Inbox } from 'lucide-react';

export const AgentWorkspace: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const data = await api.getTickets();
      setTickets(data);
      if (!selectedTicket && data.length > 0) {
        setSelectedTicket(data[0]);
      } else if (selectedTicket) {
        const updated = data.find((t) => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 3000);
    return () => clearInterval(interval);
  }, [selectedTicket?.id]);

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-slate-950">
      <TicketList
        tickets={tickets}
        selectedTicketId={selectedTicket?.id ?? null}
        onSelectTicket={(ticket) => setSelectedTicket(ticket)}
        isLoading={isLoading}
      />

      {selectedTicket ? (
        <TicketDetail
          ticket={selectedTicket}
          onTicketUpdated={fetchTickets}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shadow-inner">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-semibold text-slate-300">Select a ticket from the queue</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Review customer messages, inspect AI incident summaries, and send live human responses.
          </p>
        </div>
      )}
    </div>
  );
};
