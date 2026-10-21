import React, { useState } from 'react';
import {
  X,
  BookOpen,
  FileText,
  HelpCircle,
  Layers,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Download,
  Check,
  Calculator,
} from 'lucide-react';
import { SharedStudyItem, SummaryData, QuizItem, FlashcardDeck } from '../types';
import { useToast } from '../context/ToastContext';

interface SharedMaterialModalProps {
  item: SharedStudyItem | null;
  onClose: () => void;
  onSaveToLibrary: (item: SharedStudyItem) => void;
}

export const SharedMaterialModal: React.FC<SharedMaterialModalProps> = ({
  item,
  onClose,
  onSaveToLibrary,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'content'>('content');
  const [copied, setCopied] = useState(false);

  // Quiz interactive state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Flashcard interactive state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!item) return null;

  const handleSave = () => {
    onSaveToLibrary(item);
    showToast({
      category: 'task',
      title: 'Saved to Library!',
      message: `"${item.title}" has been saved to your private collection.`,
      durationMs: 4000,
    });
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0A0A0A] border border-[#222222] rounded-2xl shadow-2xl flex flex-col overflow-hidden font-['Poppins']">
        {/* Header */}
        <div className="p-5 border-b border-[#1C1C1C] flex items-center justify-between gap-4 bg-[#0F0F0F]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D97706] to-[#EA580C] text-white flex items-center justify-center shrink-0 shadow-md">
              {item.type === 'summary' && <FileText className="w-5 h-5" />}
              {item.type === 'quiz' && <HelpCircle className="w-5 h-5" />}
              {item.type === 'flashcard_deck' && <Layers className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#1A1A1A] text-[#FDE047] uppercase tracking-wider border border-[#2E2E2E]">
                  {item.type.replace('_', ' ')}
                </span>
                <span className="text-xs text-neutral-400 truncate">Shared by {item.sharedBy}</span>
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-white font-['Clash_Display'] truncate mt-0.5">
                {item.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-gradient-to-r from-[#D97706] to-[#EA580C] hover:from-[#B45309] hover:to-[#C2410C] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-[#D97706]/20 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save to My Library</span>
              <span className="sm:hidden">Save</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-[#141414] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* TYPE 1: SUMMARY VIEWER */}
          {item.type === 'summary' && (
            <div className="space-y-6">
              {/* Document Overview */}
              {item.data?.overview && (
                <div className="p-4 rounded-xl bg-[#0F0F0F] border border-[#1F1F1F] space-y-2">
                  <h3 className="text-xs uppercase font-bold tracking-wider text-[#D97706] font-['Clash_Display']">
                    Document Overview
                  </h3>
                  <p className="text-xs text-neutral-200 leading-relaxed">{item.data.overview}</p>
                </div>
              )}

              {/* Executive Summary */}
              {item.data?.executiveSummary && (
                <div className="p-4 rounded-xl bg-[#0F0F0F] border border-[#1F1F1F] space-y-2">
                  <h3 className="text-xs uppercase font-bold tracking-wider text-[#FDE047] font-['Clash_Display']">
                    Executive Summary
                  </h3>
                  <p className="text-xs text-neutral-200 leading-relaxed whitespace-pre-line">
                    {item.data.executiveSummary}
                  </p>
                </div>
              )}

              {/* Chapter-by-Chapter Breakdown */}
              {item.data?.chapters && item.data.chapters.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white font-['Clash_Display']">
                    Chapter & Section Breakdown ({item.data.chapters.length})
                  </h3>
                  <div className="space-y-3">
                    {item.data.chapters.map((ch: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl bg-[#080808] border border-[#1C1C1C] space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-[#FDE047] bg-[#141414] px-1.5 py-0.5 rounded border border-[#262626]">
                            {(idx + 1).toString().padStart(2, '0')}
                          </span>
                          <h4 className="text-xs font-semibold text-white font-['Clash_Display']">
                            {ch.sectionHeading}
                          </h4>
                        </div>
                        {ch.mainIdea && (
                          <p className="text-xs text-neutral-300 italic pl-6">{ch.mainIdea}</p>
                        )}
                        {ch.keyPoints && ch.keyPoints.length > 0 && (
                          <ul className="space-y-1 pl-10 list-disc text-xs text-neutral-300">
                            {ch.keyPoints.map((kp: string, kidx: number) => (
                              <li key={kidx}>{kp}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Solved STEM Calculations if present */}
              {item.data?.solvedCalculations && item.data.solvedCalculations.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-[#FDE047]" />
                    <h3 className="text-sm font-semibold text-white font-['Clash_Display']">
                      Solved STEM Problems & Calculations ({item.data.solvedCalculations.length})
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {item.data.solvedCalculations.map((calc: any, cidx: number) => (
                      <div key={cidx} className="p-4 rounded-xl bg-[#080808] border border-[#222222] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white font-['Clash_Display']">
                            {calc.problemTitle}
                          </span>
                          {calc.topic && (
                            <span className="text-[10px] text-neutral-400 bg-[#141414] px-2 py-0.5 rounded border border-[#262626]">
                              {calc.topic}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-300">{calc.problemStatement}</p>
                        {calc.formula && (
                          <div className="font-mono text-xs text-[#FDE047] bg-[#000000] p-2 rounded border border-[#1C1C1C]">
                            Formula: {calc.formula}
                          </div>
                        )}
                        {calc.finalAnswer && (
                          <div className="text-xs font-semibold text-emerald-400">
                            Answer: {calc.finalAnswer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Takeaways */}
              {item.data?.keyTakeaways && item.data.keyTakeaways.length > 0 && (
                <div className="p-4 rounded-xl bg-[#0F0F0F] border border-[#1F1F1F] space-y-3">
                  <h3 className="text-xs uppercase font-bold tracking-wider text-[#D97706] font-['Clash_Display']">
                    Key Academic Takeaways
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {item.data.keyTakeaways.map((kt: string, kidx: number) => (
                      <div key={kidx} className="p-2.5 rounded-lg bg-[#080808] border border-[#1C1C1C] flex items-start gap-2 text-xs text-neutral-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#D97706] shrink-0 mt-0.5" />
                        <span>{kt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TYPE 2: INTERACTIVE QUIZ VIEWER */}
          {item.type === 'quiz' && (
            <div className="space-y-6">
              {(() => {
                const quizQuestions = item.data?.questions || [];
                const currentQ = quizQuestions[currentQuizIndex];
                if (!currentQ) {
                  return (
                    <div className="text-center py-10 text-neutral-400 text-xs">
                      No questions formatted in this shared quiz assessment.
                    </div>
                  );
                }

                const userAns = selectedAnswers[currentQ.id];
                const totalQ = quizQuestions.length;
                const correctCount = quizQuestions.filter(
                  (q: any) => selectedAnswers[q.id] === q.correctAnswer
                ).length;
                const scorePercentage = Math.round((correctCount / totalQ) * 100);

                return (
                  <div className="space-y-6">
                    {/* Progress Bar & Question Info */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#1C1C1C]">
                      <div>
                        <span className="text-xs font-semibold text-[#FDE047] font-['Clash_Display']">
                          Question {currentQuizIndex + 1} of {totalQ}
                        </span>
                        <p className="text-[11px] text-neutral-400">{currentQ.topic || 'Assessment Question'}</p>
                      </div>
                      <span className="text-xs font-mono px-2.5 py-1 bg-[#141414] border border-[#262626] rounded-lg text-neutral-300">
                        Answered: {Object.keys(selectedAnswers).length} / {totalQ}
                      </span>
                    </div>

                    {/* Question Statement */}
                    <div className="p-5 rounded-2xl bg-[#0F0F0F] border border-[#222222] space-y-3">
                      <p className="text-sm font-semibold text-white leading-relaxed">{currentQ.question}</p>
                      {currentQ.pageRef && (
                        <span className="text-[10px] font-mono text-neutral-400 bg-[#050505] px-2 py-0.5 rounded border border-[#1C1C1C]">
                          Source: {currentQ.pageRef}
                        </span>
                      )}
                    </div>

                    {/* Options */}
                    <div className="space-y-2.5">
                      {currentQ.options?.map((opt: string, optIdx: number) => {
                        const isSelected = userAns === opt;
                        const isCorrectAnswer = opt === currentQ.correctAnswer;
                        const showResult = quizSubmitted;

                        let styleClasses = 'bg-[#080808] border-[#1C1C1C] text-neutral-200 hover:border-[#D97706]/60';
                        if (isSelected && !showResult) {
                          styleClasses = 'bg-[#D97706]/15 border-[#D97706] text-white shadow-sm';
                        } else if (showResult && isCorrectAnswer) {
                          styleClasses = 'bg-emerald-950/40 border-emerald-600 text-emerald-200';
                        } else if (showResult && isSelected && !isCorrectAnswer) {
                          styleClasses = 'bg-red-950/40 border-red-700 text-red-200';
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => {
                              if (!quizSubmitted) {
                                setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: opt }));
                              }
                            }}
                            className={`w-full p-4 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${styleClasses}`}
                          >
                            <span>{opt}</span>
                            {isSelected && !showResult && (
                              <CheckCircle2 className="w-4 h-4 text-[#FDE047] shrink-0" />
                            )}
                            {showResult && isCorrectAnswer && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                            {showResult && isSelected && !isCorrectAnswer && (
                              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Worked Solution Explanation if submitted */}
                    {quizSubmitted && currentQ.explanation && (
                      <div className="p-4 rounded-xl bg-[#0F0F0F] border border-[#2A2A2A] space-y-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#FDE047]">
                          Worked Solution & Reference:
                        </span>
                        <p className="text-xs text-neutral-300 leading-relaxed font-mono whitespace-pre-line">
                          {currentQ.explanation}
                        </p>
                      </div>
                    )}

                    {/* Navigation dock */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#1C1C1C]">
                      <button
                        type="button"
                        disabled={currentQuizIndex === 0}
                        onClick={() => setCurrentQuizIndex((prev) => Math.max(0, prev - 1))}
                        className="px-4 py-2 bg-[#141414] border border-[#262626] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                      </button>

                      {!quizSubmitted ? (
                        currentQuizIndex === totalQ - 1 ? (
                          <button
                            type="button"
                            onClick={() => setQuizSubmitted(true)}
                            className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold rounded-xl shadow-md cursor-pointer"
                          >
                            Submit Quiz Assessment
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setCurrentQuizIndex((prev) => Math.min(totalQ - 1, prev + 1))}
                            className="px-4 py-2 bg-[#141414] border border-[#262626] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>Next</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-[#FDE047]">
                            Score: {correctCount}/{totalQ} ({scorePercentage}%)
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setQuizSubmitted(false);
                              setSelectedAnswers({});
                              setCurrentQuizIndex(0);
                            }}
                            className="px-3 py-1.5 bg-[#141414] text-xs font-semibold rounded-lg text-neutral-300 hover:text-white cursor-pointer"
                          >
                            Retake
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TYPE 3: FLASHCARD DECK VIEWER */}
          {item.type === 'flashcard_deck' && (
            <div className="space-y-6">
              {(() => {
                const cards = item.data?.cards || [];
                const currentCard = cards[currentCardIndex];
                if (!currentCard) {
                  return (
                    <div className="text-center py-10 text-neutral-400 text-xs">
                      No cards found in this shared flashcard deck.
                    </div>
                  );
                }

                return (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between text-xs text-neutral-400 pb-2 border-b border-[#1C1C1C]">
                      <span className="font-semibold text-white font-['Clash_Display']">
                        Card {currentCardIndex + 1} of {cards.length}
                      </span>
                      <span className="text-[11px] font-mono text-[#FDE047]">
                        Click card to flip
                      </span>
                    </div>

                    {/* Flip Card Container */}
                    <div
                      onClick={() => setIsFlipped((prev) => !prev)}
                      className="min-h-[220px] sm:min-h-[260px] p-8 rounded-2xl bg-[#0F0F0F] border border-[#2A2A2A] hover:border-[#D97706]/70 transition-all flex flex-col justify-between cursor-pointer select-none shadow-xl"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                          {isFlipped ? 'Answer / Solution' : 'Question / Concept'}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {isFlipped ? 'Back' : 'Front'}
                        </span>
                      </div>

                      <div className="py-6 text-center">
                        <p className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                          {isFlipped ? currentCard.back : currentCard.front}
                        </p>
                        {currentCard.hint && !isFlipped && (
                          <p className="text-xs text-neutral-400 mt-2 italic">Hint: {currentCard.hint}</p>
                        )}
                      </div>

                      <div className="text-center text-[10px] text-neutral-500">
                        Tap anywhere on this card to flip
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        disabled={currentCardIndex === 0}
                        onClick={() => {
                          setIsFlipped(false);
                          setCurrentCardIndex((prev) => Math.max(0, prev - 1));
                        }}
                        className="px-4 py-2 bg-[#141414] border border-[#262626] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Previous Card</span>
                      </button>

                      <button
                        type="button"
                        disabled={currentCardIndex === cards.length - 1}
                        onClick={() => {
                          setIsFlipped(false);
                          setCurrentCardIndex((prev) => Math.min(cards.length - 1, prev + 1));
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-[#D97706] to-[#EA580C] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                      >
                        <span>Next Card</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#080808] border-t border-[#1C1C1C] flex items-center justify-between text-xs text-neutral-400">
          <span>Study Kit Collaborative Knowledge Hub</span>
          <button
            onClick={handleSave}
            className="text-[#D97706] hover:text-[#EA580C] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save to My Library to study offline</span>
          </button>
        </div>
      </div>
    </div>
  );
};
