import re
import math
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from models import KnowledgeDocument

def tokenize(text: str) -> List[str]:
    """Basic tokenizer converting string to lowercase alphanumeric tokens, filtering stop words."""
    stop_words = {
        "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", 
        "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", 
        "by", "can", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for", 
        "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", 
        "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "just", 
        "me", "more", "most", "my", "myself", "no", "nor", "not", "now", "of", "off", "on", "once", 
        "only", "or", "other", "our", "ours", "ourselves", "out", "over", "own", "same", "she", 
        "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves", 
        "then", "there", "these", "they", "this", "those", "through", "to", "too", "under", "until", 
        "up", "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", 
        "why", "with", "you", "your", "yours", "yourself", "yourselves"
    }
    words = re.findall(r"\b[a-zA-Z0-9_\-\.]{2,}\b", text.lower())
    return [w for w in words if w not in stop_words]

def compute_similarity(query_tokens: List[str], doc_text: str, doc_title: str, doc_category: str) -> float:
    """Computes relevance score between query tokens and document content/title/category."""
    if not query_tokens:
        return 0.0
    
    doc_tokens = tokenize(doc_text)
    title_tokens = tokenize(doc_title)
    category_tokens = tokenize(doc_category)
    
    if not doc_tokens:
        return 0.0
    
    score = 0.0
    query_token_set = set(query_tokens)
    
    # 1. Exact phrase match bonus
    query_phrase = " ".join(query_tokens)
    if query_phrase and query_phrase in doc_text.lower():
        score += 3.0
    if query_phrase and query_phrase in doc_title.lower():
        score += 5.0
        
    # 2. Title matches (high weight)
    for qt in query_token_set:
        if qt in title_tokens:
            score += 2.5
            
    # 3. Category matches
    for qt in query_token_set:
        if qt in category_tokens:
            score += 2.0
            
    # 4. Token overlap with term frequency & length normalization
    doc_freq = {}
    for t in doc_tokens:
        doc_freq[t] = doc_freq.get(t, 0) + 1
        
    matched_count = 0
    for qt in query_token_set:
        if qt in doc_freq:
            tf = doc_freq[qt]
            # sub-linear TF scaling
            score += (1 + math.log(tf))
            matched_count += 1
            
    # Precision bonus
    if len(query_token_set) > 0:
        coverage = matched_count / len(query_token_set)
        score *= (0.5 + 0.5 * coverage)
        
    return score

class RAGService:
    @staticmethod
    def search_knowledge_base(
        db: Session, 
        query: str, 
        top_k: int = 3, 
        min_score: float = 0.5
    ) -> Tuple[List[Dict[str, Any]], str]:
        """
        Searches KnowledgeDocument records, ranks them, and constructs formatted LLM prompt context.
        Returns (citations_list, formatted_context_str).
        """
        docs = db.query(KnowledgeDocument).all()
        if not docs:
            return [], ""
            
        query_tokens = tokenize(query)
        scored_docs = []
        
        for doc in docs:
            score = compute_similarity(query_tokens, doc.content, doc.title, doc.category)
            if score >= min_score or len(docs) <= top_k:
                scored_docs.append((score, doc))
                
        # Sort by score descending
        scored_docs.sort(key=lambda x: x[0], reverse=True)
        top_matches = scored_docs[:top_k]
        
        citations = []
        context_chunks = []
        
        for rank, (score, doc) in enumerate(top_matches, start=1):
            # Extract a 200-char excerpt around best match or start
            content_snippet = doc.content[:300].strip() + ("..." if len(doc.content) > 300 else "")
            
            citation_entry = {
                "id": doc.id,
                "title": doc.title,
                "category": doc.category,
                "score": round(score, 2),
                "snippet": content_snippet,
                "file_url": doc.file_url
            }
            citations.append(citation_entry)
            
            context_chunks.append(
                f"### [Doc #{doc.id}: {doc.title}] (Category: {doc.category})\n{doc.content}\n"
            )
            
        formatted_context = "\n---\n".join(context_chunks)
        return citations, formatted_context
