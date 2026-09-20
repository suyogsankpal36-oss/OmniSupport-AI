import json
import asyncio
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sse_starlette.sse import EventSourceResponse

from database import get_db
from models import Conversation, Message, TicketStatus, SenderType
from schemas import ChatStreamRequest
from services.rag_service import RAGService
from services.ai_service import AIService

router = APIRouter(prefix="/chat", tags=["Chat & Streaming"])

@router.post("/stream")
async def chat_stream(req: ChatStreamRequest, db: Session = Depends(get_db)):
    """
    Server-Sent Events (SSE) token-by-token streaming endpoint for customer queries.
    Performs RAG context lookup, streams AI tokens, detects human escalation, and records history.
    """
    # 1. Retrieve or create conversation
    conversation = None
    if req.conversation_id:
        conversation = db.query(Conversation).filter(Conversation.id == req.conversation_id).first()
        
    if not conversation:
        conversation = Conversation(
            customer_name=req.customer_name or "Anonymous Customer",
            customer_email=req.customer_email or "customer@example.com",
            status=TicketStatus.BOT_HANDLING,
            summary=AIService.generate_ticket_summary(req.customer_name or "Customer", req.message)
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # 2. Record customer message
    user_msg = Message(
        conversation_id=conversation.id,
        sender_type=SenderType.USER,
        content=req.message,
        tokens_used=len(req.message.split())
    )
    db.add(user_msg)
    db.commit()

    # 3. Detect human handoff intent
    handoff_check = AIService.detect_human_handoff(req.message)
    if handoff_check["needs_human"]:
        conversation.status = TicketStatus.NEEDS_HUMAN
        conversation.priority = handoff_check["priority"]
        conversation.summary = f"[ESCALATED] {handoff_check['reason']}: \"{req.message[:60]}\""
        db.commit()

    # 4. Perform RAG context search
    citations, context_str = RAGService.search_knowledge_base(db, req.message, top_k=3)
    
    # 5. Fetch recent chat history
    past_messages = db.query(Message).filter(Message.conversation_id == conversation.id).order_by(Message.created_at.desc()).limit(6).all()
    history_list = [
        {"role": "user" if m.sender_type == SenderType.USER else "assistant", "content": m.content}
        for m in reversed(past_messages[:-1])
    ]

    conversation_id = conversation.id
    customer_name = conversation.customer_name

    async def event_generator():
        # A. Emit metadata
        yield {
            "event": "init",
            "data": json.dumps({
                "conversation_id": conversation_id,
                "status": conversation.status,
                "priority": conversation.priority,
                "customer_name": customer_name
            })
        }
        
        # B. Emit citations if found
        if citations:
            yield {
                "event": "citations",
                "data": json.dumps({"citations": citations})
            }

        # C. Emit handoff event if escalated
        if handoff_check["needs_human"]:
            yield {
                "event": "handoff",
                "data": json.dumps({
                    "needs_human": True,
                    "reason": handoff_check["reason"],
                    "priority": handoff_check["priority"]
                })
            }

        # D. Stream AI Tokens
        full_response_text = []
        async for token in AIService.stream_response(req.message, context_str, history_list):
            full_response_text.append(token)
            yield {
                "event": "token",
                "data": json.dumps({"token": token})
            }

        completed_text = "".join(full_response_text)
        
        # E. Persist AI message to database
        # Need a fresh session inside generator if run asynchronously
        from database import SessionLocal
        save_db = SessionLocal()
        try:
            citations_json = json.dumps([c["title"] for c in citations]) if citations else None
            ai_msg = Message(
                conversation_id=conversation_id,
                sender_type=SenderType.AI_BOT,
                content=completed_text,
                tokens_used=len(completed_text.split()),
                citations=citations_json
            )
            save_db.add(ai_msg)
            save_db.commit()
            save_db.refresh(ai_msg)
            
            # F. Emit done event
            yield {
                "event": "done",
                "data": json.dumps({
                    "message_id": ai_msg.id,
                    "conversation_id": conversation_id,
                    "tokens_used": ai_msg.tokens_used,
                    "status": conversation.status
                })
            }
        finally:
            save_db.close()

    return EventSourceResponse(event_generator())
