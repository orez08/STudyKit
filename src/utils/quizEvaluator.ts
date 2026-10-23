import { QuizQuestion } from '../types';

export interface EvaluationResult {
  isCorrect: boolean;
  score: number; // 1 for correct, 0.5 for partial, 0 for incorrect
  feedback: string;
  matchedConcepts: string[];
  primaryExpected: string;
}

/**
 * Normalizes text for clean semantic and fuzzy matching:
 * - Lowercases text
 * - Strips punctuation and symbols
/**
 * Normalizes text for clean semantic and fuzzy matching:
 * - Lowercases text
 * - Strips punctuation and symbols
 * - Collapses multiple whitespaces
 * - Strips common articles (a, an, the)
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'\[\]]/g, ' ')
    .replace(/\b(the|a|an)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes text while also stripping filler linking words for deep concept comparison
 */
export function normalizeForConcept(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'\[\]]/g, ' ')
    .replace(/\b(the|a|an|is|are|it|its|of|in|to|for|with|by|at|and|or|that|which|from|into)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Computes Levenshtein edit distance between two strings
 */
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

/**
 * Calculates similarity ratio between 0.0 and 1.0
 */
export function stringSimilarity(str1: string, str2: string): number {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshteinDistance(s1, s2);
  return (maxLen - dist) / maxLen;
}

/**
 * Checks if a concept phrase or its key roots are contained in normalized user input
 */
function checkConceptPresent(userInputNormalized: string, concept: string): boolean {
  const normConcept = normalizeText(concept);
  if (!normConcept) return false;

  // Direct substring check
  if (userInputNormalized.includes(normConcept)) return true;

  // Word token check
  const conceptWords = normConcept.split(' ').filter(w => w.length > 2);
  if (conceptWords.length === 0) return false;

  const userWords = userInputNormalized.split(' ').filter(w => w.length > 2);
  const matchedWords = conceptWords.filter(cw =>
    userWords.some(uw => uw === cw || stringSimilarity(uw, cw) >= 0.8)
  );

  return matchedWords.length / conceptWords.length >= 0.65;
}

/**
 * Evaluates a written learner answer against a question's acceptable answers, key concepts, and explanation.
 * Features multi-layered tolerance:
 * 1. Normalized exact match (ignores case, punctuation, articles)
 * 2. High fuzzy similarity (tolerates minor spelling/character typos)
 * 3. Bidirectional containment (answer contains expected or expected contains answer)
 * 4. Token overlap (contains the core informative words)
 * 5. Conceptual keyword analysis
 */
export function evaluateWrittenAnswer(userInput: string, question: QuizQuestion): EvaluationResult {
  const rawInput = userInput ? userInput.trim() : '';
  const normInput = normalizeText(rawInput);
  const deepNormInput = normalizeForConcept(rawInput);

  const acceptable = (question.acceptableAnswers && question.acceptableAnswers.length > 0)
    ? question.acceptableAnswers
    : (question.options && typeof question.correctAnswer === 'number')
    ? [question.options[question.correctAnswer]]
    : [];

  const primaryExpected = acceptable[0] || (question.explanation ? question.explanation.slice(0, 100) : 'See explanation');
  const keyConcepts = question.keyConcepts || [];

  if (!rawInput) {
    return {
      isCorrect: false,
      score: 0,
      feedback: 'No answer provided. Expected: ' + primaryExpected,
      matchedConcepts: [],
      primaryExpected,
    };
  }

  // 1. Check against acceptable answers list
  for (const ans of acceptable) {
    const normAns = normalizeText(ans);
    const deepNormAns = normalizeForConcept(ans);

    // 1A. Exact normalized match
    if (normInput === normAns || deepNormInput === deepNormAns) {
      return {
        isCorrect: true,
        score: 1,
        feedback: 'Correct! Spot-on answer matching the expected concept.',
        matchedConcepts: keyConcepts,
        primaryExpected,
      };
    }

    // 1B. Bidirectional containment (e.g., student writes "ATP" and expected is "ATP production",
    // or student writes "It is QuickSort algorithm" and expected is "QuickSort")
    if (
      (normAns.length >= 3 && normInput.includes(normAns)) ||
      (normInput.length >= 3 && normAns.includes(normInput)) ||
      (deepNormAns.length >= 3 && deepNormInput.includes(deepNormAns)) ||
      (deepNormInput.length >= 3 && deepNormAns.includes(deepNormInput))
    ) {
      return {
        isCorrect: true,
        score: 1,
        feedback: 'Correct! Your response clearly conveys the target principle.',
        matchedConcepts: keyConcepts,
        primaryExpected,
      };
    }

    // 1C. High fuzzy similarity for minor typos (e.g. "mitocondria" for "mitochondria")
    const sim = stringSimilarity(normInput, normAns);
    if (sim >= 0.78) {
      return {
        isCorrect: true,
        score: 1,
        feedback: `Correct! (Matched "${ans}")`,
        matchedConcepts: keyConcepts,
        primaryExpected,
      };
    }

    // 1D. Word token Jaccard overlap for descriptive sentences
    const userWords = new Set(deepNormInput.split(' ').filter(w => w.length > 2));
    const ansWords = new Set(deepNormAns.split(' ').filter(w => w.length > 2));
    if (userWords.size > 0 && ansWords.size > 0) {
      let intersection = 0;
      userWords.forEach(uw => {
        if (ansWords.has(uw)) intersection++;
      });
      const overlap = intersection / ansWords.size;
      if (overlap >= 0.6) {
        return {
          isCorrect: true,
          score: 1,
          feedback: 'Correct! You accurately captured all the necessary components.',
          matchedConcepts: keyConcepts,
          primaryExpected,
        };
      }
    }
  }

  // 2. Conceptual Keyword Analysis
  const matchedConcepts: string[] = [];
  for (const concept of keyConcepts) {
    if (checkConceptPresent(normInput, concept) || checkConceptPresent(deepNormInput, concept)) {
      matchedConcepts.push(concept);
    }
  }

  if (keyConcepts.length > 0) {
    const coverage = matchedConcepts.length / keyConcepts.length;

    if (coverage >= 0.5) {
      return {
        isCorrect: true,
        score: 1,
        feedback: `Great job! Identified ${matchedConcepts.length}/${keyConcepts.length} core concepts: [${matchedConcepts.join(', ')}].`,
        matchedConcepts,
        primaryExpected,
      };
    } else if (coverage > 0) {
      return {
        isCorrect: false,
        score: 0.5,
        feedback: `Partially correct (+0.5 pt). Mentioned [${matchedConcepts.join(', ')}], but missed: [${keyConcepts.filter(c => !matchedConcepts.includes(c)).join(', ')}].`,
        matchedConcepts,
        primaryExpected,
      };
    }
  }

  // 3. Fallback: Check against informative tokens in explanation
  if (question.explanation) {
    const normExplanation = normalizeForConcept(question.explanation);
    const inputWords = deepNormInput.split(' ').filter(w => w.length > 3);
    if (inputWords.length >= 2) {
      const matchedWords = inputWords.filter(w => normExplanation.includes(w));
      if (matchedWords.length / inputWords.length >= 0.7) {
        return {
          isCorrect: true,
          score: 1,
          feedback: 'Correct! Your explanation accurately describes the underlying scientific mechanisms.',
          matchedConcepts: matchedWords,
          primaryExpected,
        };
      }
    }
  }

  return {
    isCorrect: false,
    score: 0,
    feedback: `Incorrect. Expected answer: "${primaryExpected}". Review the concept benchmark below.`,
    matchedConcepts: [],
    primaryExpected,
  };
}
