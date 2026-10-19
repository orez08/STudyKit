import React, { useState } from 'react';
import {
  Copy,
  Download,
  Share2,
  FileDown,
  Sparkles,
  HelpCircle,
  Layers,
  MessageSquare,
  Check,
  Edit3,
  RefreshCw,
  MinusCircle,
  PlusCircle,
  Smile,
  BookOpen,
  Bookmark,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SummaryData } from '../types';
import { useStudy } from '../context/StudyContext';

interface SummaryViewerProps {
  summary: SummaryData;
  onGenerateQuiz?: (summary: SummaryData) => void;
  onGenerateFlashcards?: (summary: SummaryData) => void;
  onAskAI?: (summary: SummaryData, mode?: 'general' | 'simple') => void;
  onRegenerate?: () => void;
}

export const SummaryViewer: React.FC<SummaryViewerProps> = ({
  summary,
  onGenerateQuiz,
  onGenerateFlashcards,
  onAskAI,
  onRegenerate,
}) => {
  const { updateSummary } = useStudy();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedExecutiveSummary, setEditedExecutiveSummary] = useState(summary.executiveSummary);
  const [activeSection, setActiveSection] = useState<'all' | 'chapters' | 'formulas' | 'checklist'>('all');
  const [checklistCompleted, setChecklistCompleted] = useState<Record<number, boolean>>({});

  const handleCopy = () => {
    const textToCopy = `
${summary.title}
Subject: ${summary.subject || 'General'}
--------------------------------------------------
DOCUMENT OVERVIEW:
${summary.overview}

EXECUTIVE SUMMARY:
${summary.executiveSummary}

KEY POINTS:
${summary.keyPoints.map((kp) => `• ${kp}`).join('\n')}

DEFINITIONS:
${summary.definitions.map((d) => `• ${d.term}: ${d.definition} ${d.pageRef ? `(${d.pageRef})` : ''}`).join('\n')}

KEY TAKEAWAYS:
${summary.keyTakeaways.map((kt) => `• ${kt}`).join('\n')}

REVISION CHECKLIST:
${summary.revisionChecklist.map((c) => `[ ] ${c}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const textContent = `${summary.title}\nStudy Kit Structured Summary\n\n${summary.overview}\n\nEXECUTIVE SUMMARY:\n${summary.executiveSummary}\n\nKEY POINTS:\n${summary.keyPoints.join('\n')}\n\nKEY TAKEAWAYS:\n${summary.keyTakeaways.join('\n')}`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${summary.title.replace(/\s+/g, '_')}_Summary.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadDocx = () => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>${summary.title}</title><meta charset='utf-8'></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px;">
        <h1 style="color: #171717;">${summary.title}</h1>
        <p><strong>Subject:</strong> ${summary.subject || 'General'} | <strong>Pages:</strong> ${summary.pageCount || 1} | <strong>Level:</strong> ${summary.targetLevel}</p>
        <hr/>
        <h2>Document Overview</h2>
        <p>${summary.overview}</p>
        <h2>Executive Summary</h2>
        <p>${summary.executiveSummary}</p>
        <h2>Key Points</h2>
        <ul>${summary.keyPoints.map((kp) => `<li>${kp}</li>`).join('')}</ul>
        <h2>Important Definitions</h2>
        <ul>${summary.definitions.map((d) => `<li><strong>${d.term}:</strong> ${d.definition} ${d.pageRef ? `<em>(${d.pageRef})</em>` : ''}</li>`).join('')}</ul>
        ${summary.formulas && summary.formulas.length > 0 ? `<h2>Important Formulas</h2><ul>${summary.formulas.map((f) => `<li><strong>${f.formula}</strong>: ${f.description} (Units: ${f.units})</li>`).join('')}</ul>` : ''}
        <h2>Key Takeaways</h2>
        <ul>${summary.keyTakeaways.map((kt) => `<li>${kt}</li>`).join('')}</ul>
        <h2>Revision Checklist</h2>
        <ul>${summary.revisionChecklist.map((c) => `<li>[ ] ${c}</li>`).join('')}</ul>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${summary.title.replace(/\s+/g, '_')}_Summary.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleSaveEdit = () => {
    updateSummary(summary.id, { executiveSummary: editedExecutiveSummary });
    setIsEditing(false);
  };

  const toggleChecklistItem = (index: number) => {
    setChecklistCompleted((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-2xl shadow-xl overflow-hidden print:bg-white print:text-black print:border-none">
      {/* Top Action Bar */}
      <div className="p-4 bg-[#050505] border-b border-[#1C1C1C] flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span className="font-semibold text-white">{summary.summaryLength}</span>
          <span>·</span>
          <span>{summary.summaryStyle}</span>
          <span>·</span>
          <span>{summary.targetLevel}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-[#141414] hover:bg-[#1E1E1E] border border-[#242424] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Copy Summary text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownloadTxt}
            className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-[#141414] hover:bg-[#1E1E1E] border border-[#242424] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Download TXT file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>TXT</span>
          </button>

          <button
            onClick={handleDownloadDocx}
            className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-[#141414] hover:bg-[#1E1E1E] border border-[#242424] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Download DOCX / Word file"
          >
            <Download className="w-3.5 h-3.5 text-[#FDE047]" />
            <span>DOCX</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-[#141414] hover:bg-[#1E1E1E] border border-[#242424] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Print or Export PDF"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-[#141414] hover:bg-[#1E1E1E] border border-[#242424] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit'}</span>
          </button>

          {/* Quick downstream learning triggers */}
          {onGenerateQuiz && (
            <button
              onClick={() => onGenerateQuiz(summary)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#D97706] to-[#EA580C] hover:from-[#B45309] hover:to-[#C2410C] rounded-lg transition-all flex items-center gap-1.5 shadow-sm shadow-[#D97706]/20 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Generate Quiz</span>
            </button>
          )}

          {onGenerateFlashcards && (
            <button
              onClick={() => onGenerateFlashcards(summary)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#141414] hover:bg-[#1E1E1E] border border-[#262626] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-[#FDE047]" />
              <span>Create Flashcards</span>
            </button>
          )}

          {onAskAI && (
            <button
              onClick={() => onAskAI(summary, 'general')}
              className="px-3 py-1.5 text-xs font-medium text-neutral-200 hover:text-white bg-[#141414] hover:bg-[#1E1E1E] border border-[#262626] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#FDE047]" />
              <span>Ask AI Partner</span>
            </button>
          )}

          {/* New Explain Simply button */}
          <button
            onClick={() => onAskAI && onAskAI(summary, 'simple')}
            className="px-3 py-1.5 text-xs font-medium text-neutral-200 hover:text-white bg-[#141414] hover:bg-[#1E1E1E] border border-[#262626] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FDE047]" />
            <span>Explain Simply</span>
          </button>
        </div>
      </div>

      {/* Main Reading Viewport */}
      <div className="p-6 sm:p-10 space-y-10 max-w-4xl mx-auto">
        {/* 1. DOCUMENT OVERVIEW */}
        <section className="space-y-3 pb-8 border-b border-[#1C1C1C]">
          <div className="flex items-center gap-2 text-xs text-[#D97706] font-semibold tracking-wider uppercase font-['Clash_Display']">
            <BookOpen className="w-4 h-4 text-[#FDE047]" />
            <span>Document Overview</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white font-['Clash_Display'] tracking-tight">
            {summary.title}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
            {summary.subject && (
              <>
                <span>Subject: <strong className="text-white">{summary.subject}</strong></span>
                <span>·</span>
              </>
            )}
            {summary.pageCount && (
              <>
                <span>{summary.pageCount} Pages Analyzed</span>
                <span>·</span>
              </>
            )}
            <span>Created {new Date(summary.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed pt-2">
            {summary.overview}
          </p>
        </section>

        {/* 2. EXECUTIVE SUMMARY */}
        <section className="space-y-3 p-5 rounded-xl bg-[#0F0F0F] border border-[#1F1F1F]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2 font-['Clash_Display']">
              <span className="w-2 h-2 rounded-full bg-[#D97706]" />
              Executive Summary
            </h3>
            {isEditing && (
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1 bg-gradient-to-r from-[#D97706] to-[#EA580C] text-white text-xs font-semibold rounded cursor-pointer"
              >
                Save Changes
              </button>
            )}
          </div>
          {isEditing ? (
            <textarea
              rows={4}
              value={editedExecutiveSummary}
              onChange={(e) => setEditedExecutiveSummary(e.target.value)}
              className="w-full bg-[#050505] border border-[#2E2E2E] rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#D97706]"
            />
          ) : (
            <p className="text-sm text-neutral-200 leading-relaxed">
              {summary.executiveSummary}
            </p>
          )}
        </section>

        {/* 3. CHAPTER-BY-CHAPTER BREAKDOWN */}
        {summary.chapters && summary.chapters.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white font-['Clash_Display']">
                Chapter-by-Chapter Breakdown
              </h3>
              <span className="text-xs text-neutral-400 font-mono">
                ({summary.chapters.length} sections)
              </span>
            </div>

            <div className="space-y-5">
              {summary.chapters.map((chapter, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-[#0F0F0F] border border-[#1F1F1F] space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-semibold font-mono text-[#FDE047] bg-[#D97706]/15 border border-[#D97706]/30 px-2 py-0.5 rounded">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <div>
                      <h4 className="text-base font-semibold text-white font-['Clash_Display']">
                        {chapter.sectionHeading}
                      </h4>
                      <p className="text-xs text-neutral-300 mt-1 italic">
                        {chapter.mainIdea}
                      </p>
                    </div>
                  </div>

                  {chapter.keyPoints && chapter.keyPoints.length > 0 && (
                    <ul className="space-y-1.5 pl-6 list-disc text-xs text-neutral-300">
                      {chapter.keyPoints.map((kp, kidx) => (
                        <li key={kidx} className="leading-relaxed">
                          {kp}
                        </li>
                      ))}
                    </ul>
                  )}

                  {chapter.conclusion && (
                    <div className="mt-2 pt-2 border-t border-[#1C1C1C] text-xs text-neutral-400">
                      <strong className="text-neutral-300">Takeaway: </strong>
                      {chapter.conclusion}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. KEY POINTS */}
        {summary.keyPoints && summary.keyPoints.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-white font-['Clash_Display']">
              Key Academic Points
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {summary.keyPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-[#0F0F0F] border border-[#1C1C1C] flex items-start gap-3 text-xs text-neutral-200 leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] mt-1.5 shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. IMPORTANT DEFINITIONS */}
        {summary.definitions && summary.definitions.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-white font-['Clash_Display']">
              Important Definitions & Terms
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {summary.definitions.map((def, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#0F0F0F] border border-[#1F1F1F] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#FDE047]">{def.term}</span>
                    {def.pageRef && (
                      <span className="text-[10px] text-neutral-400 font-mono bg-[#050505] px-1.5 py-0.5 rounded border border-[#1C1C1C]">
                        {def.pageRef}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">{def.definition}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. IMPORTANT FORMULAS (if any) */}
        {summary.formulas && summary.formulas.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-white font-['Clash_Display']">
              Formulas & Quantitative Relationships
            </h3>
            <div className="space-y-3">
              {summary.formulas.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#0A0A0A] border border-[#222222] space-y-2 font-mono"
                >
                  <div className="p-2.5 rounded bg-[#050505] border border-[#1C1C1C] text-sm text-[#FDE047] font-semibold text-center">
                    {item.formula}
                  </div>
                  <div className="text-xs text-neutral-300 space-y-1 font-sans">
                    <p><strong className="text-white">Usage:</strong> {item.description}</p>
                    {item.variables && (
                      <p className="text-neutral-400 text-[11px]"><strong className="text-neutral-300">Variables:</strong> {item.variables}</p>
                    )}
                    {item.units && (
                      <p className="text-neutral-400 text-[11px]"><strong className="text-neutral-300">Units:</strong> {item.units}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 7. IMPORTANT DATES, NAMES, AND FACTS */}
        {summary.datesAndFacts && summary.datesAndFacts.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-white font-['Clash_Display']">
              Important Dates, People & Historical Facts
            </h3>
            <div className="space-y-2">
              {summary.datesAndFacts.map((fact, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-[#0F0F0F] border border-[#1F1F1F] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#FDE047]">{fact.dateOrFact}</span>
                    <span className="text-neutral-400">·</span>
                    <span className="font-medium text-white">{fact.personOrTopic}</span>
                  </div>
                  <span className="text-neutral-300 text-right">{fact.significance}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 8. KEY TAKEAWAYS */}
        {summary.keyTakeaways && summary.keyTakeaways.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-white font-['Clash_Display']">
              Key Takeaways for Exam Success
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {summary.keyTakeaways.map((takeaway, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#0F0F0F] border border-[#1F1F1F] flex items-start gap-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                  <p className="text-xs text-neutral-200 leading-relaxed">{takeaway}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 9. REVISION CHECKLIST */}
        {summary.revisionChecklist && summary.revisionChecklist.length > 0 && (
          <section className="space-y-4 p-6 rounded-2xl bg-[#0F0F0F] border border-[#1F1F1F]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white font-['Clash_Display']">
                  Interactive Revision Checklist
                </h3>
                <p className="text-xs text-neutral-400">
                  Mark each concept once you feel confident explaining it without notes
                </p>
              </div>
              <span className="text-xs font-mono text-[#FDE047] bg-[#D97706]/15 border border-[#D97706]/30 px-2.5 py-1 rounded-full">
                {Object.values(checklistCompleted).filter(Boolean).length} / {summary.revisionChecklist.length} Complete
              </span>
            </div>

            <div className="space-y-2 pt-2">
              {summary.revisionChecklist.map((item, idx) => {
                const isChecked = !!checklistCompleted[idx];
                return (
                  <button
                    key={idx}
                    onClick={() => toggleChecklistItem(idx)}
                    className={`w-full p-3 rounded-lg text-left text-xs transition-all flex items-start gap-3 cursor-pointer ${
                      isChecked
                        ? 'bg-[#141414] text-neutral-400 line-through border border-[#222222]'
                        : 'bg-[#0A0A0A] text-white hover:bg-[#121212] border border-[#1C1C1C]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                        isChecked
                          ? 'bg-[#D97706] border-[#D97706] text-white'
                          : 'border-neutral-500'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
