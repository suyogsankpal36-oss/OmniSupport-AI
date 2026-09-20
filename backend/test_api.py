import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_get_documents():
    response = client.get("/api/documents")
    assert response.status_code == 200
    docs = response.json()
    assert len(docs) >= 6
    assert any(d["category"] == "Billing" for d in docs)

def test_rag_search_preview():
    response = client.get("/api/documents/rag/search-preview?q=refund%20policy")
    assert response.status_code == 200
    data = response.json()
    assert "matched_citations" in data
    assert len(data["matched_citations"]) > 0
    assert "Billing" in data["matched_citations"][0]["title"] or "Refund" in data["matched_citations"][0]["title"]

def test_get_tickets():
    response = client.get("/api/tickets")
    assert response.status_code == 200
    tickets = response.json()
    assert len(tickets) >= 5
    assert any(t["status"] == "NEEDS_HUMAN" for t in tickets)

def test_ticket_flow():
    # 1. Fetch tickets
    tickets = client.get("/api/tickets").json()
    ticket_id = tickets[0]["id"]

    # 2. Fetch messages
    msg_res = client.get(f"/api/tickets/{ticket_id}/messages")
    assert msg_res.status_code == 200
    assert len(msg_res.json()) > 0

    # 3. Agent reply
    reply_res = client.post(
        f"/api/tickets/{ticket_id}/reply",
        json={"content": "Hello, I am reviewing your logs right now."}
    )
    assert reply_res.status_code == 200
    assert reply_res.json()["sender_type"] == "HUMAN_AGENT"

    # 4. Resolve ticket
    resolve_res = client.post(f"/api/tickets/{ticket_id}/resolve")
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "RESOLVED"

def test_analytics():
    response = client.get("/api/analytics")
    assert response.status_code == 200
    analytics = response.json()
    assert "ai_resolution_rate" in analytics
    assert "total_inquiries" in analytics
    assert "category_distribution" in analytics
    assert len(analytics["query_volume_timeline"]) == 7

def test_chat_streaming():
    with client.stream("POST", "/api/chat/stream", json={"message": "What is your refund policy?"}) as response:
        assert response.status_code == 200
        content = ""
        for line in response.iter_lines():
            content += line + "\n"
        assert "event: init" in content
        assert "event: token" in content
        assert "event: done" in content
