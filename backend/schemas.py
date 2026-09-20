from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str = "AGENT"
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Knowledge Document schemas
class KnowledgeDocumentBase(BaseModel):
    title: str
    content: str
    category: str = "General"
    file_url: Optional[str] = None

class KnowledgeDocumentCreate(KnowledgeDocumentBase):
    pass

class KnowledgeDocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    file_url: Optional[str] = None

class KnowledgeDocumentResponse(KnowledgeDocumentBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Message schemas
class MessageBase(BaseModel):
    sender_type: str
    content: str
    tokens_used: int = 0
    citations: Optional[str] = None

class MessageCreate(MessageBase):
    conversation_id: int

class MessageResponse(MessageBase):
    id: int
    conversation_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Conversation / Ticket schemas
class ConversationBase(BaseModel):
    customer_name: str
    customer_email: str
    status: str = "BOT_HANDLING"
    priority: str = "MEDIUM"
    summary: Optional[str] = None

class ConversationCreate(ConversationBase):
    pass

class ConversationUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    summary: Optional[str] = None

class ConversationResponse(ConversationBase):
    id: int
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []
    model_config = ConfigDict(from_attributes=True)

class ConversationListItem(BaseModel):
    id: int
    customer_name: str
    customer_email: str
    status: str
    priority: str
    summary: Optional[str]
    created_at: datetime
    updated_at: datetime
    last_message: Optional[str] = None
    message_count: int = 0
    model_config = ConfigDict(from_attributes=True)

# Chat & Streaming request schemas
class ChatStreamRequest(BaseModel):
    conversation_id: Optional[int] = None
    message: str
    customer_name: Optional[str] = "Anonymous Customer"
    customer_email: Optional[str] = "customer@example.com"

class AgentReplyRequest(BaseModel):
    content: str
    sender_name: Optional[str] = "Support Lead"

# Analytics Schemas
class AnalyticsOverview(BaseModel):
    total_inquiries: int
    ai_resolution_rate: float
    avg_response_time_seconds: float
    escalated_to_human: int
    bot_handling_count: int
    resolved_count: int
    category_distribution: List[Dict[str, Any]]
    query_volume_timeline: List[Dict[str, Any]]
    priority_distribution: Dict[str, int]
