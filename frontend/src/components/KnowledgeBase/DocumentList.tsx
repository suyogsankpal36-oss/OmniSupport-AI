import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Trash2,
  ExternalLink,
  Sparkles,
  FileCode,
  CheckCircle,
  Eye,
  PlusCircle,
} from 'lucide-react';
import { KnowledgeDocument } from '../../types';
import { api } from '../../services/api';
import { DocumentModal } from './DocumentModal';
import { MarkdownRenderer } from '../ChatWidget/MarkdownRenderer';

export const DocumentList: React.FC = () => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);

  // RAG Search Tester State
  const [ragQuery, setRagQuery] = useState('');
  const [ragResults, setRagResults] = useState<any | null>(null);
  const [isTestingRag, setIsTestingRag] = useState(false);

  const fetchDocuments = async (autoSelectId?: number) => {
    setIsLoading(true);
    try {
      const data = await api.getDocuments(categoryFilter, searchQuery);
      setDocuments(data);
      if (autoSelectId) {
        const found = data.find((d) => d.id === autoSelectId);
        if (found) setSelectedDoc(found);
      } else if (data.length > 0 && !selectedDoc) {
        setSelectedDoc(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [categoryFilter, searchQuery]);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this document from the AI knowledge base?')) return;
    try {
      await api.deleteDocument(id);
      if (selectedDoc?.id === id) setSelectedDoc(null);
      fetchDocuments();
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  const handleTestRag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragQuery.trim()) return;
    setIsTestingRag(true);
    try {
      const res = await api.getRAGPreview(ragQuery);
      setRagResults(res);
    } catch (err) {
      console.error('RAG preview error:', err);
    } finally {
      setIsTestingRag(false);
    }
  };

  const categories = ['All', 'Billing', 'API Docs', 'Troubleshooting', 'Security', 'Integrations'];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>Knowledge Base & RAG Index</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-medium">
                {documents.length} Articles
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Documents automatically indexed and injected into Gemini / RAG context window during customer support chats
            </p>
          </div>
        </div>

        {/* Dynamic Add Document Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-brand-600/25 hover:scale-105 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Document</span>
        </button>
      </div>

      {/* Main Grid: Articles + Inspector & Live RAG Tester */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Filters and Article Catalog */}
        <div className="w-full lg:w-96 border-r border-slate-800/80 flex flex-col bg-slate-900/40">
          <div className="p-3 border-b border-slate-800 space-y-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles & documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-750 focus:border-brand-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-medium scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                    categoryFilter === cat
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* List of articles */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading knowledge base...</div>
            ) : documents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No documents match the filter.</div>
            ) : (
              documents.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-3 rounded-xl cursor-pointer transition border ${
                      isSelected
                        ? 'bg-slate-800/90 border-brand-500 shadow-md'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white line-clamp-1">{doc.title}</span>
                      <button
                        onClick={(e) => handleDelete(doc.id, e)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded transition opacity-60 hover:opacity-100"
                        title="Delete document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2 font-mono">
                      {doc.content.slice(0, 100)}...
                    </p>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-brand-950 text-brand-300 border border-brand-800 font-medium">
                        {doc.category}
                      </span>
                      <span className="text-slate-500 font-mono">Doc #{doc.id}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center / Right Column: Article Inspector & Interactive RAG Query Tester */}
        <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6 bg-slate-950">
          {/* Interactive RAG Ranking Tester */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-900 to-brand-950/30 border border-brand-500/30 rounded-2xl shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-400 animate-pulse-subtle" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live RAG Context Retrieval Tester
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-mono">
                Similarity Engine
              </span>
            </div>

            <form onSubmit={handleTestRag} className="flex gap-2">
              <input
                type="text"
                value={ragQuery}
                onChange={(e) => setRagQuery(e.target.value)}
                placeholder="Test a query, e.g., 'What is the refund timeline for annual plans?' or 'HMAC verification'"
                className="flex-1 p-2 bg-slate-950 border border-slate-750 focus:border-brand-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!ragQuery.trim() || isTestingRag}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isTestingRag ? 'Searching...' : 'Test Match'}</span>
              </button>
            </form>

            {ragResults && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 animate-fade-in text-xs">
                <div className="flex items-center justify-between text-[11px] font-semibold text-brand-300">
                  <span>Matched Context Chunks ({ragResults.matched_citations.length}):</span>
                  <span className="text-slate-400 font-normal">Score Threshold &gt; 0.5</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {ragResults.matched_citations.map((c: any, i: number) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-750 space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-200">
                        <span>#{c.id}: {c.title}</span>
                        <span className="text-[10px] text-emerald-400 font-mono">Score: {c.score}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{c.snippet}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Selected Document Full View */}
          {selectedDoc ? (
            <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-brand-950 text-brand-300 border border-brand-800 font-bold uppercase">
                      {selectedDoc.category}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Doc #{selectedDoc.id}</span>
                  </div>
                  <h1 className="text-lg font-bold text-white">{selectedDoc.title}</h1>
                </div>
              </div>

              <div className="text-xs text-slate-200 leading-relaxed font-sans">
                <MarkdownRenderer content={selectedDoc.content} />
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">
              Select an article on the left to preview its content and markdown formatting.
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <DocumentModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={(newDoc) => {
            fetchDocuments(newDoc?.id);
          }}
        />
      )}
    </div>
  );
};
