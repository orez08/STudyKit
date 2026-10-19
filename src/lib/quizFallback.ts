import { QuizQuestion } from '../types';

/**
 * Client-Side Fill-in-the-Blank & Conceptual Quiz Generator Fallback
 * Used when network is offline or AI serverless timeouts occur repeatedly.
 * Parses high-signal sentences from the source document and generates verified questions.
 */
export function generateClientSideFallbackQuiz(
  text: string,
  requestedCount: number = 10,
  title: string = 'Offline Practice Assessment'
): { title: string; difficulty: string; totalQuestions: number; questions: QuizQuestion[] } {
  if (!text || text.trim().length === 0) {
    throw new Error('No content available to generate offline questions.');
  }

  // 1. Break down into sentences
  const rawSentences = text
    .replace(/\[Page \d+\]/g, '')
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => {
      // Keep sentences with substantive informational length (between 40 and 220 chars)
      return s.length >= 40 && s.length <= 220 && !s.startsWith('#') && !s.startsWith('http');
    });

  // 2. Extract vocabulary bank for plausible distractor options
  const words = text
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 5 && w.length <= 16 && !/^(the|this|that|with|from|have|they|which|there|their|about|would|these|other)$/i.test(w));

  const uniqueWordBank = Array.from(new Set(words));

  const questions: QuizQuestion[] = [];
  const usedSentences = new Set<string>();

  for (const sentence of rawSentences) {
    if (questions.length >= requestedCount) break;
    if (usedSentences.has(sentence)) continue;

    // Look for strong keywords in the sentence (nouns, capitalized concepts, technical words)
    const sentenceWords = sentence
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .map((w) => w.trim())
      .filter((w) => w.length >= 5 && !/^(about|above|across|after|against|along|among|around|because|before|behind|below|beneath|beside|between|beyond|during|except|inside|into|near|outside|since|through|throughout|toward|under|until|upon|within|without)$/i.test(w));

    if (sentenceWords.length < 4) continue;

    // Pick a candidate target word (prefer middle of sentence)
    const candidateIdx = Math.floor(sentenceWords.length / 2);
    const targetWord = sentenceWords[candidateIdx];

    // Create fill in the blank sentence
    const regex = new RegExp(`\\b${targetWord}\\b`, 'i');
    if (!regex.test(sentence)) continue;

    const blankSentence = sentence.replace(regex, '______');

    // Create 3 distractors from the document word bank
    const distractors = uniqueWordBank
      .filter((w) => w.toLowerCase() !== targetWord.toLowerCase() && Math.abs(w.length - targetWord.length) <= 4)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // If word bank is small, add generic academic distractors
    const backupDistractors = ['Mechanism', 'Factor', 'Framework', 'Variable', 'Function', 'Process'];
    while (distractors.length < 3) {
      const backup = backupDistractors[distractors.length];
      if (!distractors.includes(backup) && backup.toLowerCase() !== targetWord.toLowerCase()) {
        distractors.push(backup);
      }
    }

    const options = [targetWord, ...distractors].sort(() => Math.random() - 0.5);

    questions.push({
      id: `fallback-q-${questions.length + 1}-${Date.now()}`,
      question: `Complete the key statement from your study material:\n\n"${blankSentence}"`,
      type: 'multiple_choice',
      options,
      correctAnswer: targetWord,
      explanation: `According to your document: "${sentence}"`,
      topic: 'Document Key Concepts',
      pageRef: 'Document Context',
    });

    usedSentences.add(sentence);
  }

  // If questions are still fewer than requested, create True/False assertions from remaining sentences
  if (questions.length < requestedCount) {
    for (const sentence of rawSentences) {
      if (questions.length >= requestedCount) break;
      if (usedSentences.has(sentence)) continue;

      questions.push({
        id: `fallback-tf-${questions.length + 1}-${Date.now()}`,
        question: `Based directly on your study materials, evaluate the truth of the following statement:\n\n"${sentence}"`,
        type: 'true_false',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: `This statement appears directly in your uploaded study document.`,
        topic: 'Core Understanding',
        pageRef: 'Document Context',
      });

      usedSentences.add(sentence);
    }
  }

  return {
    title,
    difficulty: 'Medium',
    totalQuestions: questions.length,
    questions,
  };
}
