import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  RotateCcw,
  Bot,
  User,
  ShieldCheck,
  Headphones,
  Sparkles,
  AlertCircle,
  CreditCard,
  Code2,
  ShieldAlert,
} from 'lucide-react';
import { useChatStream } from '../../hooks/useChatStream';
import { MarkdownRenderer } from './MarkdownRenderer';
import { CitationBadge } from './CitationBadge';
import { SuggestedPrompts } from './SuggestedPrompts';
import { Citation } from '../../types';

interface ChatWindowProps {
  embedded?: boolean;
  onClose?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ embedded = false, onClose }) => {
  const {
    messages,
    isStreaming,
    conversationId,
    status,
    citations,
    handoffAlert,
    error,
    sendMessage,
    resetChat,
  } = useChatStream();

  const [input, setInput] = useState('');
  const [customerName, setCustomerName] = useState('Alex Recruiter');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isStreaming) return;
    const textToSend = input.trim();
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    sendMessage(textToSend, customerName, 'recruiter@techcorp.io');
  };

  const handleSelectPrompt = (promptText: string) => {
    if (isStreaming) return;
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    sendMessage(promptText, customerName, 'recruiter@techcorp.io');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden ${embedded ? 'h-full w-full' : 'h-[620px] w-[420px]'}`}>
      {/* Header */}
      <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">OmniSupport Copilot</h3>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-md">
                AI + RAG
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              {status === 'NEEDS_HUMAN' ? (
                <span className="flex items-center gap-1 text-amber-400 font-medium">
                  <Headphones className="w-3 h-3" /> Live Agent Escalated
                </span>
              ) : (
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Instant Gemini Response
                </span>
              )}
              {conversationId && (
                <span className="text-slate-500 font-mono text-[10px]">#{conversationId}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setInput('');
              resetChat();
            }}
            title="Reset conversation"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition text-xs font-semibold px-2"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Escalation Notification Banner */}
      {handoffAlert && (
        <div className="px-4 py-2 bg-gradient-to-r from-amber-950/80 to-slate-900 border-b border-amber-800/40 flex items-center justify-between animate-fade-in text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <Headphones className="w-4 h-4 shrink-0 text-amber-400 animate-bounce" />
            <div>
              <span className="font-semibold">Smart Escalation Triggered:</span>{' '}
              <span className="text-amber-200/90">{handoffAlert.reason}</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono uppercase font-bold">
            Live Ticket Created
          </span>
        </div>
      )}

      {/* Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-3 py-1">
            <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-800/40 to-slate-850/40 border border-slate-800 text-center space-y-1.5">
              <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-400 mx-auto flex items-center justify-center border border-brand-500/20 shadow-inner">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-200">OmniSupport AI Copilot</h4>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                Experience real-time token streaming, document context injection (RAG), and smart live human escalation.
              </p>
            </div>

            {/* 3 Clickable Prompt Chips */}
            <SuggestedPrompts
              onSelectPrompt={handleSelectPrompt}
              disabled={isStreaming}
            />
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isUser = msg.sender_type === 'USER';
            const isHumanAgent = msg.sender_type === 'HUMAN_AGENT';

            return (
              <div
                key={idx}
                className={`flex gap-3 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="shrink-0 mt-0.5">
                    {isHumanAgent ? (
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm" title="Human Support Agent">
                        <Headphones className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-sm" title="AI Bot">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-md ${
                    isUser
                      ? 'bg-brand-600 text-white rounded-tr-none'
                      : isHumanAgent
                      ? 'bg-emerald-950/60 border border-emerald-800/60 text-slate-100 rounded-tl-none'
                      : 'bg-slate-800/90 border border-slate-700/60 text-slate-100 rounded-tl-none'
                  }`}
                >
                  {isHumanAgent && (
                    <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Live Support Specialist
                    </div>
                  )}

                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div>
                      {msg.content ? (
                        <MarkdownRenderer content={msg.content} />
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-400 py-1">
                          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse delay-75" />
                          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse delay-150" />
                          <span className="text-[11px] ml-1 text-slate-400">Thinking & retrieving context...</span>
                        </div>
                      )}

                      {/* Display Citations if available */}
                      {Array.isArray(msg.citations) && msg.citations.length > 0 && (
                        <CitationBadge citations={msg.citations as Citation[]} />
                      )}

                      {msg.isStreaming && msg.content && (
                        <span className="inline-block w-1.5 h-3.5 bg-brand-400 ml-1 animate-pulse align-middle" />
                      )}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="shrink-0 mt-0.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-slate-200 shadow-sm" title="Customer">
                      <User className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {error && (
          <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Bar when conversation is active */}
      {messages.length > 0 && (
        <div className="px-3 py-1.5 bg-slate-950/80 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            disabled={isStreaming}
            onClick={() => handleSelectPrompt('What is your refund and cancellation policy?')}
            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-medium text-emerald-300 whitespace-nowrap flex items-center gap-1 transition disabled:opacity-50 active:scale-95"
          >
            <CreditCard className="w-3 h-3" /> 💳 Refund Policy
          </button>
          <button
            type="button"
            disabled={isStreaming}
            onClick={() => handleSelectPrompt('How do I configure Webhooks for Stripe events?')}
            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-medium text-brand-300 whitespace-nowrap flex items-center gap-1 transition disabled:opacity-50 active:scale-95"
          >
            <Code2 className="w-3 h-3" /> 🔌 Stripe Webhook
          </button>
          <button
            type="button"
            disabled={isStreaming}
            onClick={() => handleSelectPrompt('I have an urgent billing error, connect me with a human')}
            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-medium text-rose-300 whitespace-nowrap flex items-center gap-1 transition disabled:opacity-50 active:scale-95"
          >
            <ShieldAlert className="w-3 h-3" /> 🚨 Human Escalation
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 bg-slate-950/90 border-t border-slate-800">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? 'AI is generating response...' : 'Ask a question or select a prompt chip above...'}
            disabled={isStreaming}
            className="flex-1 max-h-28 min-h-[42px] px-3.5 py-2.5 bg-slate-900 border border-slate-750 focus:border-brand-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition resize-none disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="h-[42px] px-4 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-md shadow-brand-600/20 disabled:cursor-not-allowed disabled:text-slate-500"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>

        <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-brand-400" /> Grounded in Knowledge Base (RAG)
          </span>
          <span>Press Enter to send</span>
        </div>
      </div>
    </div>
  );
};
