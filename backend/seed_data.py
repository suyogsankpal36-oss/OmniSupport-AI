import datetime
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import User, UserRole, KnowledgeDocument, Conversation, Message, TicketStatus, TicketPriority, SenderType

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(KnowledgeDocument).count() > 0:
        print("[Seed] Database already contains knowledge documents. Skipping initial seed.")
        db.close()
        return

    print("[Seed] Seeding realistic enterprise SaaS support data...")

    # 1. Seed Users
    users = [
        User(
            email="sarah.lead@omnisupport.ai",
            name="Sarah Jenkins",
            role=UserRole.ADMIN,
            avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
        ),
        User(
            email="alex.chen@omnisupport.ai",
            name="Alex Chen",
            role=UserRole.AGENT,
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
        ),
        User(
            email="elena.r@omnisupport.ai",
            name="Elena Rostova",
            role=UserRole.AGENT,
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        ),
    ]
    for u in users:
        db.add(u)
    db.commit()

    # 2. Seed Knowledge Documents
    docs = [
        KnowledgeDocument(
            title="Billing & Refund Policy",
            category="Billing",
            content="""# Billing & Refund Policy

## 1. Refund Eligibility
- **Annual Subscriptions:** Eligible for a full refund within **14 calendar days** of the initial charge or automatic annual renewal.
- **Monthly Subscriptions:** Eligible for a full refund within **48 hours** of charge. Subsequent monthly fees are non-refundable but can be canceled to prevent future charges.
- **Prorated Credits:** Plan downgrades take effect at the end of the current billing cycle.

## 2. Invoicing & VAT
- VAT/GST invoices are automatically generated on the 1st of every month.
- Download PDF invoices via **Dashboard > Organization Settings > Billing > Invoices**.
- To update your tax ID or billing legal address, submit a ticket to `billing@omnisupport.ai`.

## 3. Accepted Payment Methods
- Credit/Debit cards (Visa, MasterCard, American Express).
- ACH / SEPA Direct Debit for Annual Enterprise agreements ($5,000+ ARR).
- Wire transfer upon request."""
        ),
        KnowledgeDocument(
            title="Developer API & Webhook Specifications",
            category="API Docs",
            content="""# Developer API & Webhook Specifications

## 1. Authentication
All API requests must include your Bearer API key in the HTTP Authorization header:
`Authorization: Bearer omni_sec_live_9941a87b`

## 2. Rate Limits
- **Growth Plan:** 1,000 requests per minute per token.
- **Enterprise Plan:** 10,000 requests per minute with dedicated IP pools.
- Exceeding the limit will return HTTP `429 Too Many Requests` with a `Retry-After` header.

## 3. Webhook Event Delivery
OmniSupport delivers JSON payloads with SHA-256 HMAC signatures:
- `ticket.created`
- `ticket.escalated`
- `message.received`

Verify payloads using your secret:
```python
import hmac, hashlib
signature = hmac.new(WEBHOOK_SECRET.encode(), payload_body, hashlib.sha256).hexdigest()
```"""
        ),
        KnowledgeDocument(
            title="Error Codes & Diagnostic Troubleshooting Guide",
            category="Troubleshooting",
            content="""# Error Codes & Diagnostic Troubleshooting

## 1. Common HTTP Status Codes
- **401 Unauthorized:** Invalid, expired, or missing Bearer token in the request header.
- **403 Forbidden:** The authenticated user lacks permission for this organization resource.
- **429 Rate Limit Exceeded:** Too many requests. Implement exponential backoff.
- **500 Internal Server Error:** Server-side exception. Check `request_id` in your telemetry.
- **502 Bad Gateway / 504 Gateway Timeout:** Upstream AI provider latency spike or network partition.

## 2. Browser Widget Troubleshooting
- Ensure `Cross-Origin-Resource-Policy` allows script embedding from `cdn.omnisupport.ai`.
- Check if Content Security Policy (`CSP`) directive `connect-src` includes `https://api.omnisupport.ai` and `wss://api.omnisupport.ai`."""
        ),
        KnowledgeDocument(
            title="Role-Based Access Control (RBAC) & SSO",
            category="Security",
            content="""# Role-Based Access Control (RBAC) & SSO

## 1. System Roles
- **Owner:** Full administrative rights, billing ownership, domain verification, and SAML configuration.
- **Admin:** Can manage agents, create knowledge documents, and adjust routing rules.
- **Agent:** Can view ticket queues, reply to customers, resolve conversations, and initiate internal notes.
- **Read-Only Observer:** View-only access to analytics dashboards and audit logs.

## 2. Single Sign-On (SSO)
- Supported Identity Providers (IdP): Okta, Google Workspace, Azure AD, OneLogin.
- SAML 2.0 and OIDC endpoints are available in **Organization > Security > Single Sign-On**."""
        ),
        KnowledgeDocument(
            title="Enterprise SLA & Security Compliance",
            category="Security",
            content="""# Enterprise SLA & Security Compliance

## 1. Service Level Agreement (SLA)
- **Uptime Commitment:** 99.99% monthly availability excluding scheduled maintenance.
- **Urgent Priority Response:** < 15 minutes response time (24x7x365).
- **Standard Priority Response:** < 2 hours response time (Business hours).

## 2. Compliance Certifications
- SOC 2 Type II certified annually.
- GDPR and CCPA compliant. Customer data can be scrubbed via Privacy API.
- All data in transit is encrypted using TLS 1.3; data at rest is encrypted using AES-256."""
        ),
        KnowledgeDocument(
            title="Omnichannel Notification Routing & Integrations",
            category="Integrations",
            content="""# Omnichannel Notification Routing & Integrations

## 1. Slack Integration
- Connect OmniSupport to Slack channels (`#support-urgent`, `#support-feed`).
- Agents can reply directly inside Slack threads using the `/reply` shortcut.

## 2. Email Forwarding
- Forward support emails (e.g. `support@yourdomain.com`) to `inbox-xyz@in.omnisupport.ai`.
- Customer replies are automatically parsed and appended to active ticket threads."""
        )
    ]

    for d in docs:
        db.add(d)
    db.commit()

    # 3. Seed Realistic Tickets & Conversations
    now = datetime.datetime.utcnow()
    
    tickets_data = [
        {
            "customer_name": "Marcus Vance",
            "customer_email": "marcus.vance@fintechglobal.io",
            "status": TicketStatus.NEEDS_HUMAN,
            "priority": TicketPriority.URGENT,
            "summary": "[ESCALATED] Customer requested urgent human help regarding webhook signature failures on production cluster.",
            "created_offset_min": 14,
            "messages": [
                (SenderType.USER, "Hi, our production webhook endpoint is failing signature verification on events since 2 hours ago. I need a real engineer immediately!"),
                (SenderType.AI_BOT, "I understand the urgency of production webhook issues. According to our **[Developer API & Webhook Specifications]**, webhooks use SHA-256 HMAC verification. Let me escalate this immediately to our Senior Support Engineer on call."),
                (SenderType.USER, "Thanks, please hurry, payments are stalled.")
            ]
        },
        {
            "customer_name": "Claire Dupont",
            "customer_email": "c.dupont@aerocorp.fr",
            "status": TicketStatus.BOT_HANDLING,
            "priority": TicketPriority.MEDIUM,
            "summary": "[Billing] Inquired about downloading annual VAT invoices for tax reporting.",
            "created_offset_min": 35,
            "messages": [
                (SenderType.USER, "How do I download the VAT invoice for our annual Enterprise renewal?"),
                (SenderType.AI_BOT, "Hello Claire! You can easily download VAT-compliant PDF invoices by going to **Dashboard > Organization Settings > Billing > Invoices**.\n\n*Source: [Doc #1: Billing & Refund Policy]*\n\nWould you like me to guide you to that page?")
            ]
        },
        {
            "customer_name": "David Sterling",
            "customer_email": "david.s@cloudnative.dev",
            "status": TicketStatus.NEEDS_HUMAN,
            "priority": TicketPriority.URGENT,
            "summary": "[ESCALATED] Customer disputing unexpected invoice charge after seat adjustment.",
            "created_offset_min": 52,
            "messages": [
                (SenderType.USER, "I was charged $420 yesterday but I downgraded 3 seats last week. I want to talk to a human to refund this right now."),
                (SenderType.AI_BOT, "I have flagged this for our billing team. Per our **[Billing & Refund Policy]**, seat adjustments and prorated credits are processed within the 14-day refund window. A billing specialist has been notified and will take over this thread.")
            ]
        },
        {
            "customer_name": "Amina Al-Mansoor",
            "customer_email": "amina@dubaiholdings.ae",
            "status": TicketStatus.RESOLVED,
            "priority": TicketPriority.LOW,
            "summary": "[Security] Successfully resolved query on configuring Okta SAML 2.0 Single Sign-On.",
            "created_offset_min": 180,
            "messages": [
                (SenderType.USER, "Does OmniSupport support Okta SAML 2.0 SSO integration?"),
                (SenderType.AI_BOT, "Yes, absolutely! OmniSupport fully supports Okta SAML 2.0 and OIDC. You can configure your identity provider under **Organization > Security > Single Sign-On**.\n\n*Source: [Doc #4: Role-Based Access Control & SSO]*"),
                (SenderType.USER, "Perfect, configured and tested. Thank you!"),
                (SenderType.AI_BOT, "Glad to hear! Marking this ticket as resolved. Have a great day!")
            ]
        },
        {
            "customer_name": "Liam Gallagher",
            "customer_email": "liam@soundwave-app.com",
            "status": TicketStatus.BOT_HANDLING,
            "priority": TicketPriority.MEDIUM,
            "summary": "[API Docs] Inquired about rate limits for Growth tier API calls.",
            "created_offset_min": 110,
            "messages": [
                (SenderType.USER, "What are the API rate limits on the Growth tier?"),
                (SenderType.AI_BOT, "On the Growth tier, the API rate limit is **1,000 requests per minute per token**. If exceeded, the server returns an HTTP 429 status code with a `Retry-After` header.\n\n*Source: [Doc #2: Developer API & Webhook Specifications]*")
            ]
        },
        {
            "customer_name": "Samantha Wu",
            "customer_email": "sam.wu@finscale.co",
            "status": TicketStatus.NEEDS_HUMAN,
            "priority": TicketPriority.MEDIUM,
            "summary": "[ESCALATED] Customer requested custom SOC 2 Type II compliance report for enterprise security review.",
            "created_offset_min": 240,
            "messages": [
                (SenderType.USER, "Our security compliance auditor needs your latest SOC 2 Type II audit report. Can someone send us the signed NDA copy?"),
                (SenderType.AI_BOT, "Our platform is SOC 2 Type II certified annually (*Source: [Doc #5: Enterprise SLA & Security Compliance]*). I am routing your request to our Solutions Lead to provide the encrypted compliance package.")
            ]
        },
        {
            "customer_name": "Oliver Twist",
            "customer_email": "oliver@booksandmore.org",
            "status": TicketStatus.RESOLVED,
            "priority": TicketPriority.LOW,
            "summary": "[General] Successfully guided customer on inviting team members as Agents.",
            "created_offset_min": 400,
            "messages": [
                (SenderType.USER, "How do I add a new support agent to my team?"),
                (SenderType.AI_BOT, "To invite a new agent, go to **Organization Settings > Team Members > Invite Member**, enter their email address, and assign the **Agent** role.\n\n*Source: [Doc #4: Role-Based Access Control & SSO]*"),
                (SenderType.HUMAN_AGENT, "Hi Oliver, Alex from support here just checking in — let us know if your teammate received the invite email!"),
                (SenderType.USER, "Yes they did, all set up now! Thanks Alex.")
            ]
        }
    ]

    for td in tickets_data:
        ticket_time = now - datetime.timedelta(minutes=td["created_offset_min"])
        conv = Conversation(
            customer_name=td["customer_name"],
            customer_email=td["customer_email"],
            status=td["status"],
            priority=td["priority"],
            summary=td["summary"],
            created_at=ticket_time,
            updated_at=ticket_time + datetime.timedelta(minutes=5)
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

        msg_time = ticket_time
        for sender, content in td["messages"]:
            msg = Message(
                conversation_id=conv.id,
                sender_type=sender,
                content=content,
                tokens_used=len(content.split()),
                created_at=msg_time
            )
            db.add(msg)
            msg_time = msg_time + datetime.timedelta(minutes=1)
        db.commit()

    print("[Seed] Successfully seeded users, knowledge docs, and tickets!")
    db.close()

if __name__ == "__main__":
    seed_database()
