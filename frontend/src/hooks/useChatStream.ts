import { useState, useRef, useCallback } from 'react';
import { Message, Citation, TicketStatus } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function useChatStream() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [status, setStatus] = useState<TicketStatus>('BOT_HANDLING');
  const [citations, setCitations] = useState<Citation[]>([]);
  const [handoffAlert, setHandoffAlert] = useState<{ needsHuman: boolean; reason: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const resetChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    setConversationId(null);
    setStatus('BOT_HANDLING');
    setCitations([]);
    setHandoffAlert(null);
    setError(null);
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(
    async (
      content: string,
      customerName: string = 'Alex Recruiter',
      customerEmail: string = 'recruiter@techcorp.io'
    ) => {
      if (!content.trim() || isStreaming) return;

      setError(null);
      const userMessage: Message = {
        sender_type: 'USER',
        content: content.trim(),
        created_at: new Date().toISOString(),
      };

      // Placeholder for incoming streaming AI response
      const aiPlaceholder: Message = {
        sender_type: 'AI_BOT',
        content: '',
        isStreaming: true,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage, aiPlaceholder]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch(`${API_BASE}/chat/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversation_id: conversationId,
            message: content.trim(),
            customer_name: customerName,
            customer_email: customerEmail,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('ReadableStream not supported in browser');
        }

        const decoder = new TextDecoder('utf-8');
        let rawBuffer = '';
        let accumulatedTokens = '';
        let currentCitations: Citation[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          rawBuffer += decoder.decode(value, { stream: true });
          
          // Normalize \r\n to \n to reliably split SSE events
          const normalized = rawBuffer.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
          const events = normalized.split('\n\n');
          
          // The last element is incomplete buffer
          rawBuffer = events.pop() || '';

          for (const rawEvent of events) {
            const trimmed = rawEvent.trim();
            if (!trimmed) continue;

            const lines = trimmed.split('\n');
            let eventType = 'message';
            let dataStr = '';

            for (const line of lines) {
              const lineTrim = line.trim();
              if (lineTrim.startsWith('event:')) {
                eventType = lineTrim.slice(6).trim();
              } else if (lineTrim.startsWith('data:')) {
                dataStr = lineTrim.slice(5).trim();
              }
            }

            if (!dataStr) continue;

            try {
              const parsed = JSON.parse(dataStr);

              if (eventType === 'init') {
                if (parsed.conversation_id) {
                  setConversationId(parsed.conversation_id);
                }
                if (parsed.status) {
                  setStatus(parsed.status);
                }
              } else if (eventType === 'citations') {
                currentCitations = parsed.citations || [];
                setCitations(currentCitations);
              } else if (eventType === 'handoff') {
                setHandoffAlert({
                  needsHuman: true,
                  reason: parsed.reason,
                });
                setStatus('NEEDS_HUMAN');
              } else if (eventType === 'token') {
                accumulatedTokens += parsed.token;
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  if (lastIdx >= 0) {
                    updated[lastIdx] = {
                      ...updated[lastIdx],
                      sender_type: 'AI_BOT',
                      content: accumulatedTokens,
                      citations: currentCitations,
                      isStreaming: true,
                    };
                  }
                  return updated;
                });
              } else if (eventType === 'done') {
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  if (lastIdx >= 0) {
                    updated[lastIdx] = {
                      ...updated[lastIdx],
                      sender_type: 'AI_BOT',
                      id: parsed.message_id,
                      content: accumulatedTokens,
                      tokens_used: parsed.tokens_used,
                      citations: currentCitations,
                      isStreaming: false,
                    };
                  }
                  return updated;
                });
                if (parsed.status) {
                  setStatus(parsed.status);
                }
              }
            } catch (err) {
              console.warn('Failed to parse SSE JSON payload:', dataStr, err);
            }
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'An error occurred during streaming.');
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].sender_type === 'AI_BOT' && !updated[lastIdx].content) {
              updated[lastIdx] = {
                ...updated[lastIdx],
                content: '⚠️ Connection issue during AI streaming. Please check the backend server or try again.',
                isStreaming: false,
              };
            }
            return updated;
          });
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [conversationId, isStreaming]
  );

  return {
    messages,
    isStreaming,
    conversationId,
    status,
    citations,
    handoffAlert,
    error,
    sendMessage,
    resetChat,
  };
}
