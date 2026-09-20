import { Ticket, KnowledgeDocument, AnalyticsOverview, Message } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const api = {
  // Knowledge Documents
  async getDocuments(category?: string, search?: string): Promise<KnowledgeDocument[]> {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/documents?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch documents');
    return res.json();
  },

  async createDocument(data: { title: string; content: string; category: string; file_url?: string }): Promise<KnowledgeDocument> {
    const res = await fetch(`${API_BASE}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create document');
    return res.json();
  },

  async deleteDocument(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/documents/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete document');
  },

  async getRAGPreview(query: string): Promise<any> {
    const res = await fetch(`${API_BASE}/documents/rag/search-preview?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to fetch RAG preview');
    return res.json();
  },

  // Tickets
  async getTickets(status?: string, priority?: string, search?: string): Promise<Ticket[]> {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    if (priority && priority !== 'ALL') params.append('priority', priority);
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/tickets?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch tickets');
    return res.json();
  },

  async getTicket(id: number): Promise<Ticket> {
    const res = await fetch(`${API_BASE}/tickets/${id}`);
    if (!res.ok) throw new Error('Failed to fetch ticket');
    return res.json();
  },

  async getTicketMessages(id: number): Promise<Message[]> {
    const res = await fetch(`${API_BASE}/tickets/${id}/messages`);
    if (!res.ok) throw new Error('Failed to fetch ticket messages');
    return res.json();
  },

  async replyToTicket(ticketId: number, content: string, senderName: string = 'Support Lead'): Promise<Message> {
    const res = await fetch(`${API_BASE}/tickets/${ticketId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, sender_name: senderName }),
    });
    if (!res.ok) throw new Error('Failed to send reply');
    return res.json();
  },

  async resolveTicket(ticketId: number): Promise<Ticket> {
    const res = await fetch(`${API_BASE}/tickets/${ticketId}/resolve`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to resolve ticket');
    return res.json();
  },

  async updateTicketStatus(ticketId: number, status?: string, priority?: string): Promise<Ticket> {
    const res = await fetch(`${API_BASE}/tickets/${ticketId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, priority }),
    });
    if (!res.ok) throw new Error('Failed to update ticket status');
    return res.json();
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsOverview> {
    const res = await fetch(`${API_BASE}/analytics`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  // Health
  async checkHealth(): Promise<{ status: string }> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Backend offline');
    return res.json();
  }
};
