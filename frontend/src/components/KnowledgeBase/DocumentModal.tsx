import React, { useState } from 'react';
import { X, BookOpen, Sparkles, FileText, Wand2 } from 'lucide-react';
import { api } from '../../services/api';

interface DocumentModalProps {
  onClose: () => void;
  onSuccess: (newDoc?: any) => void;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Billing');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleTemplates = [
    {
      label: '💳 Custom SLA & Uptime Guarantee',
      title: 'Enterprise 99.999% SLA & Disaster Recovery Policy',
      category: 'Security',
      content: `# Enterprise 99.999% SLA & Disaster Recovery Policy

## 1. Uptime Guarantee
- OmniSupport guarantees 99.999% high availability across all multi-region clusters.
- If availability drops below 99.99%, customers receive an automatic 25% credit on their monthly invoice.

## 2. Disaster Recovery (RTO & RPO)
- **Recovery Time Objective (RTO):** < 15 minutes.
- **Recovery Point Objective (RPO):** < 1 minute with continuous PostgreSQL WAL replication.

## 3. Contacting Enterprise On-Call
Enterprise tier accounts can escalate directly to our dedicated emergency response hotline at \`hotline@omnisupport.ai\`.`,
    },
    {
      label: '🔌 Custom Webhook Payload Specs',
      title: 'Stripe & Shopify Webhook Event Signatures',
      category: 'API Docs',
      content: `# Stripe & Shopify Webhook Event Signatures

## 1. Webhook Signature Headers
All inbound webhook requests from Stripe and Shopify must include signature headers:
- Stripe: \`Stripe-Signature\`
- Shopify: \`X-Shopify-Hmac-SHA256\`

## 2. Python Verification Code Snippet
\`\`\`python
import hmac, hashlib

def verify_shopify_webhook(data, hmac_header, secret):
    digest = hmac.new(secret.encode('utf-8'), data, hashlib.sha256).digest()
    computed_hmac = base64.b64encode(digest)
    return hmac.compare_digest(computed_hmac, hmac_header.encode('utf-8'))
\`\`\`

## 3. Retries
Failed webhooks are automatically retried using exponential backoff over 72 hours.`,
    },
  ];

  const applyTemplate = (t: typeof sampleTemplates[0]) => {
    setTitle(t.title);
    setCategory(t.category);
    setContent(t.content);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Please fill in both title and document content.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const created = await api.createDocument({
        title: title.trim(),
        category,
        content: content.trim(),
      });
      onSuccess(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save document');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">+ Add Knowledge Article</h3>
              <p className="text-xs text-slate-400">Instantly indexed for live RAG retrieval & citations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Sample Presets */}
        <div className="px-5 pt-3 pb-1 bg-slate-950/50 border-b border-slate-800/60 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Wand2 className="w-3 h-3 text-brand-400" /> Quick Templates:
          </span>
          {sampleTemplates.map((t, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyTemplate(t)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-750 text-[10px] text-brand-300 font-medium transition"
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 space-y-1">
              <label className="font-semibold text-slate-300">Article Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Enterprise 99.999% SLA Policy"
                className="w-full p-2.5 bg-slate-950 border border-slate-750 focus:border-brand-500 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-750 focus:border-brand-500 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="Billing">Billing & Refunds</option>
                <option value="API Docs">API & Webhooks</option>
                <option value="Troubleshooting">Troubleshooting</option>
                <option value="Security">Security & Compliance</option>
                <option value="Integrations">Integrations</option>
                <option value="General">General Support</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Article Content (Markdown & Code Snippets Supported)</label>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the policy, technical steps, code samples, or troubleshooting guide here..."
              className="w-full p-3 bg-slate-950 border border-slate-750 focus:border-brand-500 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono text-[11px]"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-[10px] text-slate-500">
              💡 Document is immediately accessible to the RAG AI search engine.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl font-medium transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 text-white rounded-xl font-semibold flex items-center gap-1.5 transition shadow-md shadow-brand-600/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Indexing Document...' : 'Save & Index for AI'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
