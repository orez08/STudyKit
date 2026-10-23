import React, { useState } from 'react';
import { BookOpen, RotateCw, Check, ArrowLeft, ArrowRight, Sparkles, Flame } from 'lucide-react';
import { useStudy } from '../context/StudyContext';

interface Flashcard {
  id: string;
  category: string;
  front: string;
  back: string;
  mastered: boolean;
}

const INITIAL_CARDS: Flashcard[] = [
  {
    id: 'c1',
    category: 'Computer Science',
    front: 'What is the Cap Theorem in distributed systems?',
    back: 'It states that a distributed data store can only simultaneously provide at most two out of three guarantees: Consistency, Availability, and Partition Tolerance.',
    mastered: true
  },
  {
    id: 'c2',
    category: 'Computer Science',
    front: 'What is the difference between TCP and UDP?',
    back: 'TCP is connection-oriented, reliable, and ordered via handshakes/ACKs. UDP is connectionless, unordered, and lightweight, ideal for gaming/streaming.',
    mastered: false
  },
  {
    id: 'c3',
    category: 'Biology & Medicine',
    front: 'What is the role of ribosomes in the cell?',
    back: 'Ribosomes are molecular machines responsible for translating mRNA codons into polypeptide protein chains.',
    mastered: true
  },
  {
    id: 'c4',
    category: 'Psychology',
    front: 'What is the Spacing Effect (Spaced Repetition)?',
    back: 'The phenomenon whereby learning is greater when studying is spread out over time, as opposed to studying the same amount of content in a single session (cramming).',
    mastered: false
  }
];

export const FlashcardsPage: React.FC = () => {
  const { recordStudySession } = useStudy();
  const [cards, setCards] = useState<Flashcard[]>(INITIAL_CARDS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = cards[currentIdx];

  const handleFlip = () => setFlipped(!flipped);

  const handleNext = () => {
    setFlipped(false);
    setCurrentIdx((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setFlipped(false);
    setCurrentIdx((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleMarkMastered = async () => {
    setCards((prev) =>
      prev.map((c, i) => (i === currentIdx ? { ...c, mastered: !c.mastered } : c))
    );
    await recordStudySession(15);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-12">
      <div className="border-b border-neutral-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-amber-500" />
          Active Recall Flashcards
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Review cards using active recall and spaced intervals to cement long-term neural connections.
        </p>
      </div>

      {/* Card Carousel Box */}
      <div className="flex flex-col items-center">
        <div className="w-full flex items-center justify-between text-xs text-neutral-400 mb-3 px-2">
          <span className="font-semibold text-amber-500 uppercase tracking-wider">{card.category}</span>
          <span>Card {currentIdx + 1} of {cards.length}</span>
        </div>

        {/* 3D Flip Card */}
        <div
          onClick={handleFlip}
          className="w-full min-h-[300px] sm:min-h-[340px] rounded-3xl bg-neutral-900 border border-neutral-800 p-8 flex flex-col justify-between cursor-pointer hover:border-neutral-700 transition-all relative overflow-hidden group shadow-xl select-none"
        >
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              {flipped ? 'Answer / Concept' : 'Question / Prompt'}
            </span>
            <div className="flex items-center gap-1.5 text-neutral-400 group-hover:text-amber-400 transition-colors">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Click to Flip</span>
            </div>
          </div>

          <div className="my-auto py-4 text-center">
            <h2 className="text-lg sm:text-2xl font-bold text-white leading-relaxed">
              {flipped ? card.back : card.front}
            </h2>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-800/80">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMarkMastered();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                card.mastered
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              {card.mastered ? 'Mastered' : 'Mark as Mastered'}
            </button>
            <span className="text-[11px] text-neutral-500">Spaced Interval: 3 days</span>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={handlePrev}
            className="w-11 h-11 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center justify-center cursor-pointer transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleFlip}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
          >
            <RotateCw className="w-4 h-4" />
            Flip Card
          </button>
          <button
            onClick={handleNext}
            className="w-11 h-11 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center justify-center cursor-pointer transition-all"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
