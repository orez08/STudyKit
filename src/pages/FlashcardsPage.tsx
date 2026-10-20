import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  RotateCw,
  Shuffle,
  Maximize2,
  Minimize2,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Search,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Sliders,
  HelpCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useStudy } from '@/context/StudyContext';
import { FlashcardDeck, Flashcard } from '@/types';
import { apiClient } from '@/lib/apiClient';
import { studyCache } from '@/lib/cache';

export const FlashcardsPage: React.FC = () => {
  const { documents, summaries, flashcardDecks, addFlashcardDeck, rateFlashcard, deleteFlashcardDeck } =
    useStudy();

  const [selectedDeckId, setSelectedDeckId] = useState<string>(flashcardDecks[0]?.id || '');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddCardModal, setShowAddCardModal] = useState(false);

  // Generator form
  const [isCreatingDeck, setIsCreatingDeck] = useState(false);
  const [numCards, setNumCards] = useState(8);
  const [deckSource, setDeckSource] = useState<'doc' | 'summary' | 'manual'>('doc');
  const [sourceDocId, setSourceDocId] = useState(documents[0]?.id || '');
  const [sourceSummaryId, setSourceSummaryId] = useState(summaries[0]?.id || '');
  const [manualText, setManualText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual card fields
  const [manualFront, setManualFront] = useState('');
  const [manualBack, setManualBack] = useState('');
  const [manualHint, setManualHint] = useState('');

  const activeDeck = flashcardDecks.find((d) => d.id === selectedDeckId) || flashcardDecks[0];

  const currentCards = activeDeck?.cards || [];
  const filteredCards = searchQuery
    ? currentCards.filter(
        (c) =>
          c.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.back.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentCards;

  const currentCard = filteredCards[currentCardIndex] || filteredCards[0];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % Math.max(1, filteredCards.length));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + filteredCards.length) % Math.max(1, filteredCards.length));
  };

  const handleShuffle = () => {
    if (!activeDeck) return;
    const shuffled = [...activeDeck.cards].sort(() => Math.random() - 0.5);
    activeDeck.cards = shuffled;
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const handleRating = async (rating: 1 | 2 | 3) => {
    if (!activeDeck || !currentCard) return;
    await rateFlashcard(activeDeck.id, currentCard.id, rating);
    handleNext();
  };

  const handleGenerateDeck = async () => {
    setError(null);
    setIsGenerating(true);

    try {
      let content = '';
      let title = 'Study Deck';

      if (deckSource === 'doc') {
        const doc = documents.find((d) => d.id === sourceDocId);
        if (!doc) throw new Error('Please select a document.');
        content = doc.extractedText || '';
        title = `${doc.name.replace(/\.[^/.]+$/, '')} Revision Deck`;
      } else if (deckSource === 'summary') {
        const sum = summaries.find((s) => s.id === sourceSummaryId);
        if (!sum) throw new Error('Please select a summary.');
        content = `${sum.title}\n${sum.overview}\n${sum.keyPoints.join('\n')}\n${sum.definitions
          .map((d) => `${d.term}: ${d.definition}`)
          .join('\n')}`;
        title = `${sum.title} Cards`;
      } else {
        if (!manualText.trim()) throw new Error('Please enter text to extract flashcards.');
        content = manualText;
        title = 'Custom Flashcards';
      }

      const cacheParams = {
        snippet: content.slice(0, 1500),
        numCards,
        topic: 'Revision',
      };

      let flashcardData = studyCache.get<any>('flashcards', cacheParams);

      if (!flashcardData) {
        const data = await apiClient.post<{ success: boolean; data: any }>('/api/ai/flashcards', {
          content,
          title,
          numCards,
          topic: 'Revision',
        });

        if (!data.success || !data.data) throw new Error('Invalid format returned by AI.');
        flashcardData = data.data;
        studyCache.set('flashcards', cacheParams, flashcardData);
      }

      const newCards: Flashcard[] = flashcardData.cards.map((c: any, idx: number) => ({
        id: `card-${Date.now()}-${idx}`,
        front: c.front,
        back: c.back,
        hint: c.hint,
        category: c.category || 'Core Concept',
        interval: 1,
        repetition: 0,
        easeFactor: 2.5,
        dueDate: new Date().toISOString(),
        state: 'new',
      }));

      const newDeck: FlashcardDeck = {
        id: `deck-${Date.now()}`,
        title: flashcardData.deckTitle || title,
        topic: 'Academic Revision',
        cards: newCards,
        totalCards: newCards.length,
        cardsLearned: 0,
        createdAt: new Date().toISOString(),
      };

      await addFlashcardDeck(newDeck);
      setSelectedDeckId(newDeck.id);
      setIsCreatingDeck(false);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    } catch (err: any) {
      console.error('Flashcard generation error:', err);
      setError(err.message || 'Failed to generate flashcards.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddManualCard = () => {
    if (!manualFront.trim() || !manualBack.trim() || !activeDeck) return;
    const newCard: Flashcard = {
      id: `card-${Date.now()}`,
      front: manualFront,
      back: manualBack,
      hint: manualHint || undefined,
      category: 'Manual',
      interval: 1,
      repetition: 0,
      easeFactor: 2.5,
      dueDate: new Date().toISOString(),
      state: 'new',
    };
    activeDeck.cards.push(newCard);
    activeDeck.totalCards += 1;
    setManualFront('');
    setManualBack('');
    setManualHint('');
    setShowAddCardModal(false);
  };

  return (
    <div
      className={`p-4 sm:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in ${
        isFullscreen ? 'fixed inset-0 z-50 bg-[#121212] overflow-y-auto max-w-none' : ''
      }`}
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2A2A2A]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F2C230] uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Spaced-Repetition Active Recall</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-['Outfit']">
            AI Flashcards
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Powered by the SM-2 algorithm to optimize memory consolidation and retention.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreatingDeck(!isCreatingDeck)}
            className="px-4 py-2.5 bg-[#F2C230] hover:bg-[#e0b127] text-black font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isCreatingDeck ? 'Cancel' : 'Generate New Deck'}</span>
          </button>
        </div>
      </div>

      {/* GENERATE DECK MODAL / ACCORDION */}
      {isCreatingDeck && (
        <div className="p-6 rounded-2xl bg-[#1C1C1C] border border-[#2F2F2F] space-y-5 shadow-xl">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#F2C230]" />
            <span>Flashcard Generation Settings</span>
          </h2>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setDeckSource('doc')}
              className={`p-3 rounded-xl border text-xs font-semibold ${
                deckSource === 'doc'
                  ? 'bg-[#262626] border-[#F2C230] text-white'
                  : 'bg-[#151515] border-[#2A2A2A] text-neutral-400'
              }`}
            >
              Library PDF
            </button>
            <button
              onClick={() => setDeckSource('summary')}
              className={`p-3 rounded-xl border text-xs font-semibold ${
                deckSource === 'summary'
                  ? 'bg-[#262626] border-[#F2C230] text-white'
                  : 'bg-[#151515] border-[#2A2A2A] text-neutral-400'
              }`}
            >
              Summary Notes
            </button>
            <button
              onClick={() => setDeckSource('manual')}
              className={`p-3 rounded-xl border text-xs font-semibold ${
                deckSource === 'manual'
                  ? 'bg-[#262626] border-[#F2C230] text-white'
                  : 'bg-[#151515] border-[#2A2A2A] text-neutral-400'
              }`}
            >
              Paste Content
            </button>
          </div>

          {deckSource === 'doc' && (
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Choose Document
              </label>
              <select
                value={sourceDocId}
                onChange={(e) => setSourceDocId(e.target.value)}
                className="w-full bg-[#141414] border border-[#333333] rounded-lg px-3 py-2 text-xs text-white"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {deckSource === 'summary' && (
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Choose Summary
              </label>
              <select
                value={sourceSummaryId}
                onChange={(e) => setSourceSummaryId(e.target.value)}
                className="w-full bg-[#141414] border border-[#333333] rounded-lg px-3 py-2 text-xs text-white"
              >
                {summaries.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {deckSource === 'manual' && (
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Paste Material
              </label>
              <textarea
                rows={3}
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Paste topics or notes..."
                className="w-full bg-[#141414] border border-[#333333] rounded-lg p-2.5 text-xs text-white"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1">Number of Cards</label>
            <select
              value={numCards}
              onChange={(e) => setNumCards(Number(e.target.value))}
              className="w-48 bg-[#141414] border border-[#333333] rounded-lg px-3 py-2 text-xs text-white"
            >
              <option value={5}>5 Cards</option>
              <option value={8}>8 Cards (Standard)</option>
              <option value={12}>12 Cards (Deep Deck)</option>
              <option value={16}>16 Cards (Exam Cram)</option>
            </select>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            onClick={handleGenerateDeck}
            disabled={isGenerating}
            className="px-6 py-2.5 bg-[#F2C230] text-black font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isGenerating ? 'Synthesizing Flashcards...' : 'Generate Deck with AI'}</span>
          </button>
        </div>
      )}

      {/* DECK SELECTOR & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-neutral-400">Deck:</label>
          <select
            value={selectedDeckId}
            onChange={(e) => {
              setSelectedDeckId(e.target.value);
              setCurrentCardIndex(0);
              setIsFlipped(false);
            }}
            className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-lg px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-[#F2C230]"
          >
            {flashcardDecks.map((deck) => (
              <option key={deck.id} value={deck.id}>
                {deck.title} ({deck.cards.length} cards)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            className="p-2 text-neutral-300 hover:text-white bg-[#1E1E1E] hover:bg-[#282828] border border-[#2E2E2E] rounded-lg transition-colors"
            title="Shuffle Cards"
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-neutral-300 hover:text-white bg-[#1E1E1E] hover:bg-[#282828] border border-[#2E2E2E] rounded-lg transition-colors"
            title="Toggle Fullscreen Study Mode"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowAddCardModal(true)}
            className="px-3 py-1.5 bg-[#252525] hover:bg-[#303030] border border-[#383838] text-neutral-200 text-xs font-medium rounded-lg flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-[#F2C230]" />
            <span>Add Card</span>
          </button>
        </div>
      </div>

      {/* THE 3D FLIP CARD INTERFACE */}
      {currentCard ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-mono">
              Card {currentCardIndex + 1} of {filteredCards.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#252525] text-[#F2C230] font-mono font-medium">
                {currentCard.category || 'General'}
              </span>
              <span className="text-neutral-500">·</span>
              <span className="text-[11px] text-neutral-400">
                Repetitions: {currentCard.repetition} · Ease: {currentCard.easeFactor}
              </span>
            </div>
          </div>

          {/* Interactive Card */}
          <div
            onClick={handleFlip}
            className="relative min-h-[300px] sm:min-h-[360px] rounded-3xl bg-[#1E1E1E] border-2 border-[#333333] hover:border-[#F2C230]/60 p-8 sm:p-12 flex flex-col justify-between cursor-pointer transition-all shadow-2xl group select-none"
          >
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span className="font-semibold uppercase tracking-wider">
                {isFlipped ? 'Answer & Explanation' : 'Prompt / Question'}
              </span>
              <span className="text-[11px] text-[#F2C230] group-hover:underline flex items-center gap-1">
                <RotateCw className="w-3 h-3" />
                Click anywhere to flip
              </span>
            </div>

            <div className="my-auto py-6 text-center">
              {isFlipped ? (
                <div className="space-y-4">
                  <p className="text-lg sm:text-xl font-medium text-white leading-relaxed whitespace-pre-line">
                    {currentCard.back}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-['Outfit'] leading-snug">
                    {currentCard.front}
                  </h3>
                  {currentCard.hint && (
                    <p className="text-xs text-neutral-400 italic">
                      Hint: {currentCard.hint}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="text-center text-[11px] text-neutral-500">
              {isFlipped
                ? 'Rate your recall below to schedule the next revision'
                : 'Test your active recall before revealing the answer'}
            </div>
          </div>

          {/* SPATIAL REPETITION RATING CONTROLS (SuperMemo SM-2) */}
          {isFlipped ? (
            <div className="p-4 rounded-2xl bg-[#1C1C1C] border border-[#2E2E2E] space-y-2">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block text-center">
                How well did you remember this concept?
              </span>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleRating(1)}
                  className="py-3 px-4 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800 text-red-200 text-xs font-semibold transition-all text-center"
                >
                  <span className="block font-bold">Hard (Reset)</span>
                  <span className="text-[10px] text-red-300/80">Review tomorrow (1 day)</span>
                </button>
                <button
                  onClick={() => handleRating(2)}
                  className="py-3 px-4 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800 text-amber-200 text-xs font-semibold transition-all text-center"
                >
                  <span className="block font-bold">Good</span>
                  <span className="text-[10px] text-amber-300/80">Review in 3 days</span>
                </button>
                <button
                  onClick={() => handleRating(3)}
                  className="py-3 px-4 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800 text-emerald-200 text-xs font-semibold transition-all text-center"
                >
                  <span className="block font-bold">Easy (Mastered)</span>
                  <span className="text-[10px] text-emerald-300/80">Review in 5+ days</span>
                </button>
              </div>
            </div>
          ) : (
            /* Navigation when not flipped */
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrev}
                className="px-4 py-2 bg-[#242424] hover:bg-[#2E2E2E] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Card</span>
              </button>
              <button
                onClick={handleFlip}
                className="px-6 py-2.5 bg-[#F2C230] text-black text-xs font-bold rounded-lg shadow-sm"
              >
                Reveal Answer
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-[#242424] hover:bg-[#2E2E2E] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                <span>Next Card</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-[#1C1C1C] text-neutral-400">
          No cards found in this deck. Click "Generate New Deck" above!
        </div>
      )}

      {/* ADD MANUAL CARD MODAL */}
      {showAddCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#1C1C1C] border border-[#2E2E2E] rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white font-['Outfit']">Add Custom Card</h3>
            <div>
              <label className="text-xs text-neutral-300 block mb-1">Front (Question or Term)</label>
              <input
                type="text"
                value={manualFront}
                onChange={(e) => setManualFront(e.target.value)}
                placeholder="e.g. What is the role of ATP Synthase?"
                className="w-full bg-[#141414] border border-[#333333] rounded-lg p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-300 block mb-1">Back (Answer or Definition)</label>
              <textarea
                rows={3}
                value={manualBack}
                onChange={(e) => setManualBack(e.target.value)}
                placeholder="e.g. Synthesizes ATP from ADP and inorganic phosphate via chemiosmosis."
                className="w-full bg-[#141414] border border-[#333333] rounded-lg p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-300 block mb-1">Hint (Optional)</label>
              <input
                type="text"
                value={manualHint}
                onChange={(e) => setManualHint(e.target.value)}
                placeholder="e.g. Involves proton-motive force"
                className="w-full bg-[#141414] border border-[#333333] rounded-lg p-2.5 text-xs text-white"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowAddCardModal(false)}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddManualCard}
                className="px-4 py-2 bg-[#F2C230] text-black text-xs font-bold rounded-lg"
              >
                Save Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
