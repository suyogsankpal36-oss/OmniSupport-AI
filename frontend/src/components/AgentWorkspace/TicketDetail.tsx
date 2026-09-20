import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  CheckCircle2,
  User,
  Bot,
  Headphones,
  Mail,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Zap,
  ShieldAlert,
} from 'lucide-react';
import { Ticket, Message } from '../../types';
import { api } from '../../services/api';
import { MarkdownRenderer } from '../ChatWidget/MarkdownRenderer';
import { AISummaryCard } from './AISummaryCard';

interface TicketDetailProps {
  ticket: Ticket;
  onTicketUpdated: () => void;
}

export const TicketDetail: React.FC<TicketDetailProps> = ({ ticket, onTicketUpdated }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isTakingOver, setIsTakingOver] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  const isEscalated = ticket.status === 'NEEDS_HUMAN' || ticket.priority === 'URGENT';

  const fetchMessages = async () => {
    setIsLoadingMessages(true);
    try {
      const data = await api.getTicketMessages(ticket.id);
      setMessages(data);
    } catch (err) {
      console.error('Failed to fetch messages for ticket:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [ticket.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTakeOver = async () => {
    setIsTakingOver(true);
    const greeting = `Hi ${ticket.customer_name}, I'm Sarah Jenkins, Support Lead on call. I have taken over this ticket and am investigating your inquiry directly.`;
    setReplyText(greeting);
    
    // Focus reply input smoothly
    setTimeout(() => {
      replyInputRef.current?.focus();
      replyInputRef.current?.select();
    }, 100);
    setIsTakingOver(false);
  };

  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || isSending) return;

    setIsSending(true);
    try {
      const newMsg = await api.replyToTicket(ticket.id, replyText.trim(), 'Sarah Jenkins (Support Lead)');
      setMessages((prev) => [...prev, newMsg]);
      setReplyText('');
      onTicketUpdated();
    } catch (err) {
      console.error('Failed to send agent reply:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      await api.resolveTicket(ticket.id);
      onTicketUpdated();
    } catch (err) {
      console.error('Failed to resolve ticket:', err);
    } finally {
      setIsResolving(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await api.updateTicketStatus(ticket.id, newStatus);
      onTicketUpdated();
    } catch (err) {
      console.error('Failed to update ticket status:', err);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    try {
      await api.updateTicketStatus(ticket.id, undefined, newPriority);
      onTicketUpdated();
    } catch (err) {
      console.error('Failed to update ticket priority:', err);
    }
  };

  return (
    <div className="flex flex-col h-full flex-1 bg-slate-950 overflow-hidden">
      {/* Top Action Bar */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-200 border border-slate-700 font-bold text-sm">
            {ticket.customer_name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">{ticket.customer_name}</h3>
              <span className="text-xs text-slate-400 font-mono">#{ticket.id}</span>
              {isEscalated && ticket.status !== 'RESOLVED' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold uppercase animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  🔴 Escalated - Needs Response
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-500" /> {ticket.customer_email}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3 text-slate-500" /> Created {new Date(ticket.created_at).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Status, Takeover and Action Buttons */}
        <div className="flex items-center gap-2">
          {/* 1-Click Accept & Take Over Button */}
          {ticket.status !== 'RESOLVED' && (
            <button
              onClick={handleTakeOver}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>⚡ Accept & Take Over Chat</span>
            </button>
          )}

          {/* Priority Selector */}
          <select
            value={ticket.priority}
            onChange={(e) => handlePriorityChange(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl font-semibold focus:outline-none focus:border-brand-500"
          >
            <option value="LOW">🟢 Low Priority</option>
            <option value="MEDIUM">🟡 Medium Priority</option>
            <option value="URGENT">🔴 Urgent Priority</option>
          </select>

          {/* Status Selector */}
          <select
            value={ticket.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl font-semibold focus:outline-none focus:border-brand-500"
          >
            <option value="BOT_HANDLING">🤖 Bot Handling</option>
            <option value="NEEDS_HUMAN">🎧 Needs Human</option>
            <option value="RESOLVED">✅ Resolved</option>
          </select>

          {/* Resolve Button */}
          {ticket.status !== 'RESOLVED' && (
            <button
              onClick={handleResolve}
              disabled={isResolving}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isResolving ? 'Resolving...' : 'Resolve Ticket'}</span>
            </button>
          )}

          <button
            onClick={fetchMessages}
            title="Refresh Conversation"
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Conversation Stream & Copilot Sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left / Center: Conversation Transcript */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-800/80">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoadingMessages ? (
              <div className="flex items-center justify-center h-48 text-xs text-slate-400">
                <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mr-2" />
                Loading conversation transcript...
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No message transcript recorded for this ticket.
              </div>
            ) : (
              messages.map((msg, i) => {
                const isCustomer = msg.sender_type === 'USER';
                const isHumanAgent = msg.sender_type === 'HUMAN_AGENT';

                return (
                  <div
                    key={i}
                    className={`flex gap-3 animate-fade-in ${isCustomer ? 'justify-start' : 'justify-end'}`}
                  >
                    {isCustomer && (
                      <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-2xl p-4 text-xs shadow-md ${
                        isCustomer
                          ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                          : isHumanAgent
                          ? 'bg-emerald-950/80 border border-emerald-800/80 text-emerald-100 rounded-tr-none'
                          : 'bg-brand-950/70 border border-brand-800/60 text-slate-100 rounded-tr-none'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1.5 pb-1 border-b border-slate-800/60">
                        <span className="font-bold flex items-center gap-1 text-[11px]">
                          {isCustomer ? (
                            <span className="text-slate-300">{ticket.customer_name} (Customer)</span>
                          ) : isHumanAgent ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" /> Support Lead (Human)
                            </span>
                          ) : (
                            <span className="text-brand-400 flex items-center gap-1">
                              <Bot className="w-3.5 h-3.5" /> OmniSupport AI Bot
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {msg.created_at ? new Date(msg.created_at).toLocaleTimeString() : ''}
                        </span>
                      </div>

                      {isCustomer ? (
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      ) : (
                        <MarkdownRenderer content={msg.content} />
                      )}
                    </div>

                    {!isCustomer && (
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isHumanAgent ? 'bg-emerald-600 text-white' : 'bg-brand-600 text-white'
                        }`}
                      >
                        {isHumanAgent ? <Headphones className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Human Agent Live Reply Form */}
          <div className="p-3.5 bg-slate-900 border-t border-slate-800">
            <form onSubmit={handleSendReply} className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 font-medium text-emerald-400">
                  <Headphones className="w-3.5 h-3.5" /> Reply as Live Support Specialist
                </span>
                <span>Press Shift+Enter for newline</span>
              </div>

              <div className="flex gap-2">
                <textarea
                  ref={replyInputRef}
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your message to the customer..."
                  className="flex-1 p-2.5 bg-slate-950 border border-slate-750 focus:border-brand-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || isSending}
                  className="px-5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-md shadow-emerald-600/20 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSending ? 'Sending...' : 'Send'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: AI Copilot Assistant & Summary Sidebar */}
        <div className="w-full lg:w-80 p-4 bg-slate-950 overflow-y-auto space-y-4">
          <AISummaryCard
            ticket={ticket}
            onApplySuggestedReply={(text) => {
              setReplyText(text);
              replyInputRef.current?.focus();
            }}
          />

          {/* Ticket Metadata Card */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-xs space-y-3">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Customer Information
            </h4>
            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Name</span>
                <span className="font-medium text-white">{ticket.customer_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Email</span>
                <span className="font-mono text-slate-300 text-[11px]">{ticket.customer_email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Total Turns</span>
                <span className="font-medium text-white">{messages.length}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">SLA Status</span>
                <span className="font-semibold text-emerald-400">Within Target (1.3s)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
