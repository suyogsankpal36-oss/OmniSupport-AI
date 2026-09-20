export type UserRole = 'ADMIN' | 'AGENT' | 'CUSTOMER';

export type TicketStatus = 'BOT_HANDLING' | 'NEEDS_HUMAN' | 'RESOLVED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'URGENT';

export type SenderType = 'USER' | 'AI_BOT' | 'HUMAN_AGENT';

export interface Citation {
  id: number;
  title: string;
  category: string;
  score: number;
  snippet: string;
  file_url?: string | null;
}

export interface Message {
  id?: number;
  conversation_id?: number;
  sender_type: SenderType;
  content: string;
  tokens_used?: number;
  citations?: string | Citation[] | null;
  created_at?: string;
  isStreaming?: boolean;
}

export interface Ticket {
  id: number;
  customer_name: string;
  customer_email: string;
  status: TicketStatus;
  priority: TicketPriority;
  summary: string | null;
  created_at: string;
  updated_at: string;
  last_message?: string | null;
  message_count?: number;
  messages?: Message[];
}

export interface KnowledgeDocument {
  id: number;
  title: string;
  content: string;
  category: string;
  file_url?: string | null;
  created_at: string;
}

export interface CategoryStat {
  category: string;
  document_count: number;
  queries_handled: number;
}

export interface TimelineDataPoint {
  date: string;
  ai_handled: number;
  human_escalated: number;
}

export interface AnalyticsOverview {
  total_inquiries: number;
  ai_resolution_rate: number;
  avg_response_time_seconds: number;
  escalated_to_human: number;
  bot_handling_count: number;
  resolved_count: number;
  category_distribution: CategoryStat[];
  query_volume_timeline: TimelineDataPoint[];
  priority_distribution: {
    LOW: number;
    MEDIUM: number;
    URGENT: number;
  };
}
