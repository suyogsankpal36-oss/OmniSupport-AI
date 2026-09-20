from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Conversation, Message, TicketStatus, SenderType, TicketPriority
from schemas import (
    ConversationListItem,
    ConversationResponse,
    ConversationUpdate,
    MessageResponse,
    AgentReplyRequest
)

router = APIRouter(prefix="/tickets", tags=["Tickets & Live Agent Workspace"])

@router.get("", response_model=List[ConversationListItem])
def get_tickets(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List all tickets with status, priority, AI summary, and last message.
    """
    query = db.query(Conversation)
    
    if status and status != "ALL":
        query = query.filter(Conversation.status == status)
    if priority and priority != "ALL":
        query = query.filter(Conversation.priority == priority)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (Conversation.customer_name.ilike(search_fmt)) |
            (Conversation.customer_email.ilike(search_fmt)) |
            (Conversation.summary.ilike(search_fmt))
        )
        
    tickets = query.order_by(Conversation.updated_at.desc()).all()
    
    items = []
    for t in tickets:
        last_msg = db.query(Message).filter(Message.conversation_id == t.id).order_by(Message.created_at.desc()).first()
        msg_count = db.query(Message).filter(Message.conversation_id == t.id).count()
        items.append(
            ConversationListItem(
                id=t.id,
                customer_name=t.customer_name,
                customer_email=t.customer_email,
                status=t.status,
                priority=t.priority,
                summary=t.summary,
                created_at=t.created_at,
                updated_at=t.updated_at,
                last_message=last_msg.content if last_msg else None,
                message_count=msg_count
            )
        )
    return items

@router.get("/{ticket_id}", response_model=ConversationResponse)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """Retrieve full conversation / ticket details."""
    ticket = db.query(Conversation).filter(Conversation.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@router.get("/{ticket_id}/messages", response_model=List[MessageResponse])
def get_ticket_messages(ticket_id: int, db: Session = Depends(get_db)):
    """Fetch full conversation history for a ticket."""
    ticket = db.query(Conversation).filter(Conversation.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    return db.query(Message).filter(Message.conversation_id == ticket_id).order_by(Message.created_at.asc()).all()

@router.post("/{ticket_id}/reply", response_model=MessageResponse)
def agent_reply(
    ticket_id: int,
    reply: AgentReplyRequest,
    db: Session = Depends(get_db)
):
    """
    Human agent sends a live message to the conversation.
    """
    ticket = db.query(Conversation).filter(Conversation.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    msg = Message(
        conversation_id=ticket.id,
        sender_type=SenderType.HUMAN_AGENT,
        content=reply.content,
        tokens_used=len(reply.content.split())
    )
    db.add(msg)
    
    # If ticket was NEEDS_HUMAN, human has taken over
    ticket.updated_at = msg.created_at
    db.commit()
    db.refresh(msg)
    return msg

@router.post("/{ticket_id}/resolve", response_model=ConversationResponse)
def resolve_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """Mark ticket as RESOLVED."""
    ticket = db.query(Conversation).filter(Conversation.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    ticket.status = TicketStatus.RESOLVED
    db.commit()
    db.refresh(ticket)
    return ticket

@router.patch("/{ticket_id}/status", response_model=ConversationResponse)
def update_ticket_status(
    ticket_id: int,
    update: ConversationUpdate,
    db: Session = Depends(get_db)
):
    """Update ticket status, priority, or summary."""
    ticket = db.query(Conversation).filter(Conversation.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    if update.status:
        ticket.status = update.status
    if update.priority:
        ticket.priority = update.priority
    if update.summary:
        ticket.summary = update.summary
        
    db.commit()
    db.refresh(ticket)
    return ticket
