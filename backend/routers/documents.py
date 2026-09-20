from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import KnowledgeDocument
from schemas import (
    KnowledgeDocumentCreate,
    KnowledgeDocumentUpdate,
    KnowledgeDocumentResponse
)
from services.rag_service import RAGService

router = APIRouter(prefix="/documents", tags=["Knowledge Documents"])

@router.get("", response_model=List[KnowledgeDocumentResponse])
def get_documents(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Fetch all knowledge base documents with optional filtering."""
    query = db.query(KnowledgeDocument)
    if category and category != "All":
        query = query.filter(KnowledgeDocument.category == category)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (KnowledgeDocument.title.ilike(search_fmt)) |
            (KnowledgeDocument.content.ilike(search_fmt))
        )
    return query.order_by(KnowledgeDocument.created_at.desc()).all()

@router.post("", response_model=KnowledgeDocumentResponse, status_code=201)
def create_document(
    doc_in: KnowledgeDocumentCreate,
    db: Session = Depends(get_db)
):
    """Create a new knowledge base article."""
    doc = KnowledgeDocument(
        title=doc_in.title,
        content=doc_in.content,
        category=doc_in.category or "General",
        file_url=doc_in.file_url
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

@router.get("/{doc_id}", response_model=KnowledgeDocumentResponse)
def get_document(doc_id: int, db: Session = Depends(get_db)):
    """Retrieve a single document by ID."""
    doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.put("/{doc_id}", response_model=KnowledgeDocumentResponse)
def update_document(
    doc_id: int,
    doc_in: KnowledgeDocumentUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing knowledge base document."""
    doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if doc_in.title is not None:
        doc.title = doc_in.title
    if doc_in.content is not None:
        doc.content = doc_in.content
    if doc_in.category is not None:
        doc.category = doc_in.category
    if doc_in.file_url is not None:
        doc.file_url = doc_in.file_url
        
    db.commit()
    db.refresh(doc)
    return doc

@router.delete("/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    """Delete a document."""
    doc = db.query(KnowledgeDocument).filter(KnowledgeDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(doc)
    db.commit()
    return {"message": "Document deleted successfully", "id": doc_id}

@router.get("/rag/search-preview")
def test_rag_search(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    """Test RAG search ranking and citation generator for a given query."""
    citations, context = RAGService.search_knowledge_base(db, q, top_k=3)
    return {
        "query": q,
        "matched_citations": citations,
        "injected_context_preview": context
    }
