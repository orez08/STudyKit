import React, { useState } from 'react';
import { BookMarked, Search, FileText, Clock, Sparkles, ChevronRight } from 'lucide-react';
import { StudyDocument } from '../types';

const SAMPLE_DOCS: StudyDocument[] = [
  {
    id: 'doc-1',
    title: 'High-Performance Distributed Databases & Consensus',
    category: 'Computer Science',
    summary: 'A deep-dive synthesis of Raft, Paxos, Vector Clocks, and multi-version concurrency control (MVCC).',
    keyPoints: [
      'Raft divides consensus into leader election, log replication, and safety.',
      'Split-brain scenarios are prevented using strict quorum calculations (N/2 + 1).',
      'Eventual consistency relaxes immediate synchronization for higher partition resilience.'
    ],
    readingTimeMinutes: 8,
    dateAdded: '2026-10-20'
  },
  {
    id: 'doc-2',
    title: 'Neuroplasticity & Synaptic Long-Term Potentiation',
    category: 'Neuroscience',
    summary: 'Overview of biochemical mechanisms supporting memory consolidation and synaptic plasticity.',
    keyPoints: [
      'NMDA and AMPA glutamate receptors drive synaptic strengthening.',
      'Sleep spindle activity during Slow-Wave Sleep transfers short-term memories from hippocampus to cortex.',
      'Active recall tests provoke reconsolidation cycles that reinforce memory traces.'
    ],
    readingTimeMinutes: 6,
    dateAdded: '2026-10-18'
  },
  {
    id: 'doc-3',
    title: 'Machine Learning: Attention Mechanisms & Transformers',
    category: 'Artificial Intelligence',
    summary: 'Self-attention architecture, multi-head projections, and positional encodings in modern LLMs.',
    keyPoints: [
      'Scaled Dot-Product Attention: Softmax((Q * K^T) / sqrt(d_k)) * V.',
      'Self-attention eliminates recurrent sequential bottlenecks, enabling parallel GPU matrix ops.',
      'Positional encodings inject sequence order awareness into permutation-invariant attention matrices.'
    ],
    readingTimeMinutes: 10,
    dateAdded: '2026-10-15'
  }
];

export const LibraryPage: React.FC = () => {
  const [docs, setDocs] = useState<StudyDocument[]>(SAMPLE_DOCS);
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<StudyDocument | null>(docs[0]);

  const filtered = docs.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="border-b border-neutral-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <BookMarked className="w-8 h-8 text-amber-500" />
          My Study Library
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Synthesized document summaries, key takeaways, and reference materials.
        </p>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search study notes, summaries, or categories..."
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document List */}
        <div className="lg:col-span-1 space-y-3">
          {filtered.map((doc) => {
            const isSelected = selectedDoc?.id === doc.id;
            return (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                    : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">
                  {doc.category}
                </div>
                <h3 className="text-sm font-bold text-white mb-2 leading-snug">
                  {doc.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{doc.readingTimeMinutes} min read</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Document Reader / Details */}
        <div className="lg:col-span-2">
          {selectedDoc ? (
            <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900/90 border border-neutral-800">
              <div className="flex items-center gap-2 text-xs text-amber-500 font-semibold mb-2">
                <span>{selectedDoc.category}</span>
                <span>•</span>
                <span>{selectedDoc.readingTimeMinutes} min synthesis</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                {selectedDoc.title}
              </h2>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Executive Summary
                </h4>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  {selectedDoc.summary}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Key Cognitive Takeaways
                </h4>
                <ul className="space-y-2.5">
                  {selectedDoc.keyPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-neutral-300">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 mt-0.5 text-xs">
                        {i + 1}
                      </span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-neutral-900 border border-neutral-800 text-center text-neutral-500">
              Select a document to review its notes and synthesis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
