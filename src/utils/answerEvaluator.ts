// Intelligent answer evaluator for written/short-answer questions and objective questions

export interface EvaluationResult {
  isCorrect: boolean;
  score: number; // 0.0 to 1.0
  feedback: string;
}

export interface QuestionGradingItem {
  id: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation?: string;
  acceptableKeywords?: string[];
  type?: string;
}

// Common academic stop words to ignore when comparing conceptual keywords
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any',
  'are', 'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below',
  'between', 'both', 'but', 'by', 'can', 'cannot', 'could', 'did', 'do', 'does',
  'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has',
  'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his',
  'how', 'i', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself',
  'let\'s', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off',
  'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out',
  'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that',
  'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was',
  'wasn\'t', 'we', 'were', 'weren\'t', 'what', 'when', 'where', 'which', 'while',
  'who', 'whom', 'why', 'with', 'won\'t', 'would', 'you', 'your', 'yours', 'yourself',
  'yourselves', 'answer', 'defined', 'definition', 'refers', 'meaning', 'known', 'called'
]);

/**
 * Computes Levenshtein distance between two strings
 */
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return dp[m][n];
}

/**
 * Checks if two words are similar (accounting for minor spelling typos)
 */
function isWordSimilar(w1: string, w2: string): boolean {
  if (w1 === w2) return true;
  if (Math.abs(w1.length - w2.length) > 2) return false;
  const maxLen = Math.max(w1.length, w2.length);
  const threshold = maxLen > 7 ? 2 : maxLen > 4 ? 1 : 0;
  return levenshteinDistance(w1, w2) <= threshold;
}

/**
 * Cleans text for normalization
 */
export function normalizeText(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Removes conversational / introductory boilerplate from student answers
 */
function stripIntroductoryPhrases(text: string): string {
  let cleaned = normalizeText(text);
  cleaned = cleaned.replace(
    /^(the answer is|it is|it's|they are|this is|meaning of|definition of|i think it is|the term is|referred to as)\s+/i,
    ''
  );
  return cleaned.trim();
}

/**
 * Extracts essential keywords (nouns, technical verbs, numbers)
 */
function extractConceptKeywords(text: string): string[] {
  const words = normalizeText(text).split(' ');
  return words.filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
}

/**
 * Smart local evaluator for written/short-answer questions.
 * Handles synonyms, varied phrasing, typos, and keyword detection.
 */
export function evaluateWrittenAnswerLocal(
  userAnswer: string,
  correctAnswer: string,
  explanation?: string,
  acceptableKeywords?: string[]
): EvaluationResult {
  const rawUser = (userAnswer || '').trim();
  const rawCorrect = (correctAnswer || '').trim();

  // If user provided empty answer
  if (!rawUser) {
    return {
      isCorrect: false,
      score: 0,
      feedback: 'No answer was provided.',
    };
  }

  const normUser = normalizeText(rawUser);
  const normCorrect = normalizeText(rawCorrect);
  const strippedUser = stripIntroductoryPhrases(rawUser);
  const strippedCorrect = stripIntroductoryPhrases(rawCorrect);

  // 1. Direct match (normalized)
  if (normUser === normCorrect || strippedUser === strippedCorrect) {
    return {
      isCorrect: true,
      score: 1.0,
      feedback: 'Correct! Accurate answer that directly matches the reference solution.',
    };
  }

  // 2. Numeric comparison: if both contain numbers
  const userNumbers = rawUser.match(/-?\d+(?:\.\d+)?/g);
  const correctNumbers = rawCorrect.match(/-?\d+(?:\.\d+)?/g);
  if (userNumbers && correctNumbers && userNumbers.length === correctNumbers.length) {
    const allNumbersMatch = userNumbers.every((n, i) => {
      const uVal = parseFloat(n);
      const cVal = parseFloat(correctNumbers[i]);
      return Math.abs(uVal - cVal) < 0.05 || (cVal !== 0 && Math.abs((uVal - cVal) / cVal) < 0.02);
    });
    if (allNumbersMatch) {
      return {
        isCorrect: true,
        score: 1.0,
        feedback: 'Correct! Numerical calculation and quantitative value match accurately.',
      };
    }
  }

  // 3. Substring & Containment:
  // E.g., Correct is "mitochondria", user wrote "It is the mitochondria that makes ATP"
  const correctWords = extractConceptKeywords(strippedCorrect);
  const userWords = extractConceptKeywords(strippedUser);

  // If correct answer is a short target term (1-3 words) and user answer contains it
  if (correctWords.length > 0 && correctWords.length <= 4) {
    const foundAllShortWords = correctWords.every((cw) =>
      userWords.some((uw) => isWordSimilar(uw, cw))
    );
    if (foundAllShortWords) {
      return {
        isCorrect: true,
        score: 1.0,
        feedback: 'Correct! Your written response correctly identifies the key concept.',
      };
    }
  }

  // If user answer is a short target term and correct answer contains it
  if (userWords.length > 0 && userWords.length <= 4) {
    const userFoundInCorrect = userWords.every((uw) =>
      correctWords.some((cw) => isWordSimilar(uw, cw))
    );
    if (userFoundInCorrect && userWords.length >= Math.min(2, correctWords.length)) {
      return {
        isCorrect: true,
        score: 1.0,
        feedback: 'Correct! Your answer accurately specifies the core subject.',
      };
    }
  }

  // 4. Acceptable keywords list check (if provided by AI or question data)
  if (acceptableKeywords && acceptableKeywords.length > 0) {
    const matchedKeywords = acceptableKeywords.filter((kw) => {
      const normKw = normalizeText(kw);
      return (
        normUser.includes(normKw) ||
        userWords.some((uw) => isWordSimilar(uw, normKw))
      );
    });
    const matchRatio = matchedKeywords.length / acceptableKeywords.length;
    if (matchRatio >= 0.5) {
      return {
        isCorrect: true,
        score: matchRatio >= 0.75 ? 1.0 : 0.8,
        feedback: `Correct! You included essential key concepts: ${matchedKeywords.join(', ')}.`,
      };
    }
  }

  // 5. Semantic concept coverage & Jaccard token overlap
  if (correctWords.length > 0) {
    let matchedCount = 0;
    const matchedTerms: string[] = [];

    correctWords.forEach((cw) => {
      const match = userWords.find((uw) => isWordSimilar(uw, cw));
      if (match) {
        matchedCount++;
        matchedTerms.push(cw);
      }
    });

    // Also check if user mentioned terms from explanation
    if (explanation) {
      const explanationWords = extractConceptKeywords(explanation);
      userWords.forEach((uw) => {
        if (!matchedTerms.includes(uw) && explanationWords.some((ew) => isWordSimilar(uw, ew))) {
          matchedCount += 0.5;
        }
      });
    }

    const coverageRatio = matchedCount / Math.max(1, correctWords.length);

    if (coverageRatio >= 0.6) {
      return {
        isCorrect: true,
        score: coverageRatio >= 0.8 ? 1.0 : 0.85,
        feedback: `Correct! Well explained. You captured the critical points: ${matchedTerms.join(', ')}.`,
      };
    } else if (coverageRatio >= 0.35) {
      return {
        isCorrect: true, // Marked as correct with partial credit
        score: 0.7,
        feedback: `Partially correct. You noted ${matchedTerms.join(', ')}, but missed some additional key details.`,
      };
    }
  }

  // 6. Typo tolerance on whole phrase using Levenshtein distance
  const maxPhraseLen = Math.max(strippedUser.length, strippedCorrect.length);
  if (maxPhraseLen > 0 && maxPhraseLen <= 25) {
    const dist = levenshteinDistance(strippedUser, strippedCorrect);
    if (dist <= 2) {
      return {
        isCorrect: true,
        score: 0.95,
        feedback: 'Correct! (Minor spelling variation noted).',
      };
    }
  }

  return {
    isCorrect: false,
    score: 0,
    feedback: `Incorrect. The expected answer is: "${rawCorrect}".`,
  };
}

/**
 * Batch evaluates written/short-answer questions using AI backend with local fallback.
 */
export async function gradeWrittenQuestions(
  items: QuestionGradingItem[]
): Promise<Record<string, EvaluationResult>> {
  const results: Record<string, EvaluationResult> = {};

  if (!items || items.length === 0) return results;

  // Filter only written/short-answer items or items with no options
  const writtenItems = items.filter(
    (item) =>
      item.type === 'short_answer' ||
      item.type === 'written' ||
      item.type === 'fill_in_blank' ||
      !item.type
  );

  // If no written items, return empty
  if (writtenItems.length === 0) {
    return results;
  }

  // Attempt backend AI grading with a 5-second timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('/api/ai/grade-written-answers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: writtenItems }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.grades)) {
        data.grades.forEach((g: any) => {
          if (g && g.id) {
            results[g.id] = {
              isCorrect: Boolean(g.isCorrect),
              score: typeof g.score === 'number' ? g.score : g.isCorrect ? 1.0 : 0.0,
              feedback: g.feedback || (g.isCorrect ? 'Correct!' : 'Incorrect answer.'),
            };
          }
        });
      }
    }
  } catch (err) {
    console.warn('AI Grading API request failed or timed out, applying smart local semantic evaluation:', err);
  }

  // Fill in any questions not graded by API using the smart local evaluator
  writtenItems.forEach((item) => {
    if (!results[item.id]) {
      results[item.id] = evaluateWrittenAnswerLocal(
        item.userAnswer,
        item.correctAnswer,
        item.explanation,
        item.acceptableKeywords
      );
    }
  });

  return results;
}

/**
 * Universal evaluator for any question (multiple choice, true/false, or written)
 */
export function evaluateSingleObjectiveAnswer(userAnswer: string, correctAnswer: string): boolean {
  const user = (userAnswer || '').trim().toLowerCase();
  const correct = (correctAnswer || '').trim().toLowerCase();
  if (!user || !correct) return false;

  if (user === correct) return true;

  // Normalize choice prefixes like "A)", "1.", "B - "
  const stripPrefix = (s: string) => s.replace(/^[a-d1-4][\.\)\:\-]\s*/, '').trim();
  if (stripPrefix(user) === stripPrefix(correct)) return true;

  return false;
}
