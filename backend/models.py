import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

def utc_now():
    return datetime.datetime.now(datetime.timezone.utc)

class UserRole(str):
    ADMIN = "ADMIN"
    AGENT = "AGENT"
    CUSTOMER = "CUSTOMER"

class TicketStatus(str):
    BOT_HANDLING = "BOT_HANDLING"
    NEEDS_HUMAN = "NEEDS_HUMAN"
    RESOLVED = "RESOLVED"

class TicketPriority(str):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    URGENT = "URGENT"

class SenderType(str):
    USER = "USER"
    AI_BOT = "AI_BOT"
    HUMAN_AGENT = "HUMAN_AGENT"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(50), default=UserRole.AGENT, nullable=False)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(100), default="General", index=True, nullable=False)
    file_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(255), default="Anonymous Customer", nullable=False)
    customer_email = Column(String(255), default="customer@example.com", nullable=False)
    status = Column(String(50), default=TicketStatus.BOT_HANDLING, index=True, nullable=False)
    priority = Column(String(50), default=TicketPriority.MEDIUM, index=True, nullable=False)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_type = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    tokens_used = Column(Integer, default=0)
    citations = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    conversation = relationship("Conversation", back_populates="messages")
