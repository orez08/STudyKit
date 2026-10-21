import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import * as pdfParseModule from 'pdf-parse';

async function parsePdfBuffer(buffer: Buffer): Promise<{ text: string; pageCount: number }> {
  try {
    if ((pdfParseModule as any).PDFParse) {
      const parser = new (pdfParseModule as any).PDFParse({ data: buffer });
      const res = await parser.getText();
      const text = (res?.text || '').trim();
      const pageCount = res?.total || res?.pages?.length || 1;
      await parser.destroy();
      return { text, pageCount };
    } else if (typeof (pdfParseModule as any).default === 'function') {
      const res = await (pdfParseModule as any).default(buffer);
      return { text: (res?.text || '').trim(), pageCount: res?.numpages || 1 };
    } else if (typeof pdfParseModule === 'function') {
      const res = await (pdfParseModule as any)(buffer);
      return { text: (res?.text || '').trim(), pageCount: res?.numpages || 1 };
    }
  } catch (err) {
    console.warn('Vector PDF parsing failed:', err);
  }
  return { text: '', pageCount: 1 };
}

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const GEMINI_MODEL = 'gemini-3.8-flash';

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    appName: 'Study Kit',
  });
});

app.get('/api/server-time', (req: Request, res: Response) => {
  res.json({ timestamp: new Date().toISOString() });
});

// Helper to extract JSON from AI response
function extractJSON(text: string) {
  try {
    const cleaned = text.trim();
    const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      return JSON.parse(match[1]);
    }
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse JSON from AI response, raw was:', text);
    throw new Error('AI returned non-JSON format. Please try again.');
  }
}

// 1. Real PDF Upload and Text Extraction with OCR Fallback
app.post('/api/pdf/extract-and-process', async (req: Request, res: Response) => {
  try {
    const { fileBase64, filename = 'document.pdf' } = req.body;

    if (!fileBase64) {
      return res.status(400).json({ error: 'fileBase64 payload is required.' });
    }

    const buffer = Buffer.from(fileBase64, 'base64');
    let extractedText = '';
    let pageCount = 1;
    let isScanned = false;

    let parsed = { text: '', pageCount: 1 };
    try {
      parsed = await parsePdfBuffer(buffer);
    } catch (parseErr) {
      console.warn('parsePdfBuffer threw error, falling back to Gemini OCR:', parseErr);
    }
    extractedText = parsed.text;
    pageCount = parsed.pageCount;

    // Detect scanned PDF with little or no extractable text
    if (!extractedText || extractedText.trim().length < 20) {
      isScanned = true;
      if (process.env.GEMINI_API_KEY) {
        console.log(`Applying Gemini 3.8 Flash OCR to scanned document: ${filename}`);
        const ocrResponse = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: [
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: fileBase64,
              },
            },
            {
              text: 'Transcribe and extract all academic text, headings, formulas, and notes from this document verbatim. Preserve page indications like [Page 1], [Page 2] where detectable.',
            },
          ],
        });
        extractedText = ocrResponse.text || '';
        // If pageCount was default 1, estimate from markers or size
        const pageMatches = extractedText.match(/\[Page \d+\]/gi);
        if (pageMatches) {
          pageCount = Math.max(pageCount, pageMatches.length);
        }
      } else {
        extractedText = `Scanned PDF: ${filename}. Please ensure GEMINI_API_KEY is configured for automated OCR vision processing.`;
      }
    }

    // Format text with clean line breaks
    const cleanedText = extractedText.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');

    res.json({
      success: true,
      data: {
        filename,
        text: cleanedText,
        pageCount,
        isScanned,
        characterCount: cleanedText.length,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/pdf/extract-and-process:', error);
    res.status(500).json({ error: error.message || 'Failed to extract text from PDF.' });
  }
});

// Helper for long-document chunking and hierarchical summarization
function chunkText(text: string, chunkSize: number = 10000): string[] {
  const chunks: string[] = [];
  let currentPos = 0;
  while (currentPos < text.length) {
    let endPos = currentPos + chunkSize;
    if (endPos < text.length) {
      // Find a clean paragraph break or period
      const lastBreak = text.lastIndexOf('\n\n', endPos);
      if (lastBreak > currentPos + chunkSize * 0.6) {
        endPos = lastBreak;
      }
    }
    chunks.push(text.slice(currentPos, endPos));
    currentPos = endPos;
  }
  return chunks;
}

// 2. AI PDF Summarizer with Hierarchical Section Processing
app.post('/api/ai/summarize', async (req: Request, res: Response) => {
  try {
    const {
      content,
      fileBase64,
      mimeType = 'application/pdf',
      title = 'Study Document',
      length = 'Standard Summary',
      style = 'Academic Notes',
      targetLevel = 'University',
      language = 'English',
    } = req.body;

    if (!content && !fileBase64) {
      return res.status(400).json({ error: 'Please provide either document text or a document file.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Please ensure GEMINI_API_KEY is configured in your project settings.',
      });
    }

    let rawDocumentText = content || '';

    // If PDF base64 provided but no text, extract text first
    if (fileBase64 && (!rawDocumentText || rawDocumentText.trim().length < 20)) {
      try {
        const buffer = Buffer.from(fileBase64, 'base64');
        const parsed = await parsePdfBuffer(buffer);
        if (parsed.text && parsed.text.trim().length >= 20) {
          rawDocumentText = parsed.text;
        }
      } catch (e) {
        console.log('Using direct multimodal PDF input for summarization.');
      }
    }

    // Hierarchical Summarization Strategy for Long Documents
    let sectionSyntheses: string = '';
    const isLongDocument = rawDocumentText && rawDocumentText.length > 15000;

    if (isLongDocument) {
      console.log(`Executing hierarchical chunking on document (${rawDocumentText.length} chars)`);
      const chunks = chunkText(rawDocumentText, 12000);
      const intermediateSummaries: string[] = [];

      for (let i = 0; i < Math.min(chunks.length, 5); i++) {
        const chunkRes = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: `Section ${i + 1} of ${chunks.length}:\n${chunks[i]}\n\nSummarize the core concepts, main idea, and essential formulas/definitions in this section.`,
          config: { temperature: 0.2 },
        });
        if (chunkRes.text) {
          intermediateSummaries.push(`--- SECTION ${i + 1} SUMMARY ---\n${chunkRes.text}`);
        }
      }
      sectionSyntheses = intermediateSummaries.join('\n\n');
    }

    const systemPrompt = `You are Study Kit's expert academic research analyst and tutor.
Your job is to read and analyze this learning material exhaustively, and output a highly detailed, structured, comprehensive educational summary in valid JSON format only. Do not omit any crucial sub-sections, formulas, definitions, or complex arguments. Provide depth for every section.

Options:
- Summary Length: ${length}
- Summary Style: ${style}
- Target Academic Level: ${targetLevel}
- Language: ${language}

Strict requirements:
1. Document Overview: title, subject, estimated page count / sections, comprehensive overview (3-5 sentences).
2. Executive Summary: detailed high-level synthesis of all core arguments, methodologies, and findings.
3. Chapter/Section Summaries: extremely detailed breakdown of every identifiable section or chapter with title, mainIdea, keyPoints (detailed array of strings), examples (detailed array of strings), and conclusion.
4. Key Points: 10 to 20 crucial bullet points with exact page or section citations if present in source (e.g. "(Page 4)" or "(Section 2)"). Never invent page numbers.
5. Important Definitions: exhaustive list of all technical terms with clear, detailed definition and page references.
6. Important Formulas: mathematical or scientific formulas with formula, detailed description of its usage, variable definitions, and units. If none present in source, return empty array [].
7. Important Dates, Names, and Facts: key historical/scientific dates, people, and findings. If none, return empty array [].
8. Solved STEM Calculations & Exercises: If the material covers Mathematics, Physics, Chemistry, Engineering, Computing, or any quantitative/scientific subject, provide detailed solved problems in "solvedCalculations" with problem statement, given parameters, governing equation, step-by-step arithmetic/algebraic solution, and final answer with proper units. If non-quantitative, return empty array [].
9. Key Takeaways: 8 to 12 memorable, insightful takeaways.
10. Revision Checklist: list of 10 to 15 concrete review check items.

Return strictly a JSON object with this shape:
{
  "title": string,
  "subject": string,
  "pageCount": number,
  "overview": string,
  "executiveSummary": string,
  "chapters": [
    {
      "sectionHeading": string,
      "mainIdea": string,
      "keyPoints": [string],
      "examples": [string],
      "conclusion": string
    }
  ],
  "keyPoints": [string],
  "definitions": [
    {
      "term": string,
      "definition": string,
      "pageRef": string
    }
  ],
  "formulas": [
    {
      "formula": string,
      "description": string,
      "variables": string,
      "units": string
    }
  ],
  "solvedCalculations": [
    {
      "problemTitle": string,
      "topic": string,
      "problemStatement": string,
      "givenData": string,
      "formula": string,
      "stepByStepSolution": [string],
      "finalAnswer": string,
      "explanation": string
    }
  ],
  "datesAndFacts": [
    {
      "dateOrFact": string,
      "personOrTopic": string,
      "significance": string
    }
  ],
  "keyTakeaways": [string],
  "revisionChecklist": [string]
}`;

    const parts: any[] = [];
    if (fileBase64 && !isLongDocument) {
      parts.push({
        inlineData: {
          mimeType: mimeType || 'application/pdf',
          data: fileBase64,
        },
      });
    }
    if (sectionSyntheses) {
      parts.push({
        text: `Hierarchical Section Analyses:\n${sectionSyntheses}`,
      });
    }
    if (rawDocumentText) {
      parts.push({
        text: `Document Content:\n${rawDocumentText.slice(0, 80000)}`,
      });
    }
    parts.push({
      text: `Analyze this material titled "${title}" and generate the complete structured summary. Remember: return ONLY raw valid JSON, no surrounding codeblock marks.`,
    });

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: parts,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const result = extractJSON(response.text || '{}');
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error in /api/ai/summarize:', error);
    res.status(500).json({ error: error.message || 'Failed to generate document summary' });
  }
});

// 3. AI Quiz Generator with chunked batching up to 100 questions
app.post('/api/ai/quiz', async (req: Request, res: Response) => {
  try {
    const {
      content,
      fileBase64,
      title = 'Study Quiz',
      numQuestions = 5,
      questionTypes = 'Multiple Choice Questions',
      difficulty = 'Medium',
      focusArea = 'Important Concepts',
    } = req.body;

    if (!content && !fileBase64) {
      return res.status(400).json({ error: 'Content or file is required to generate a quiz.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

    const requestedCount = Number(numQuestions) || 5;
    let allQuestions: any[] = [];
    const batchSize = Math.min(requestedCount, 15);
    const numBatches = Math.ceil(requestedCount / batchSize);

    // Stop words for accurate stem comparison
    const stopWords = new Set([
      'what', 'which', 'where', 'when', 'how', 'why', 'who', 'does', 'that', 'this',
      'these', 'those', 'from', 'with', 'about', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'between', 'under', 'their', 'there', 'would', 'could',
      'should', 'is', 'are', 'was', 'were', 'the', 'and', 'for', 'primary', 'function',
    ]);

    // Enhanced deduplication helper to strictly prevent repeating questions
    const isQuestionTooSimilar = (qCandidate: any, existingList: any[]): boolean => {
      if (!qCandidate?.question || !qCandidate?.correctAnswer) return true;

      const cleanText = (t: string) =>
        t
          .toLowerCase()
          .replace(/[^a-z0-9 ]/g, ' ')
          .split(/\s+/)
          .filter((w) => w.length > 2 && !stopWords.has(w));

      const candidateWords = new Set(cleanText(qCandidate.question));
      const candidateAnswer = qCandidate.correctAnswer.toLowerCase().trim().replace(/^(the|a|an)\s+/, '');

      // Ensure candidate options are distinct
      if (Array.isArray(qCandidate.options)) {
        const uniqueOpts = new Set(qCandidate.options.map((o: any) => String(o).trim().toLowerCase()));
        if (qCandidate.type === 'multiple_choice' && uniqueOpts.size < 3) return true;
      }

      for (const existing of existingList) {
        const existWords = new Set(cleanText(existing.question));
        const existAnswer = existing.correctAnswer.toLowerCase().trim().replace(/^(the|a|an)\s+/, '');

        // 1. Same exact or near-identical answer
        if (candidateAnswer === existAnswer && candidateAnswer.length > 2) {
          return true;
        }

        // 2. High question stem overlap (Jaccard similarity > 0.35)
        let intersection = 0;
        candidateWords.forEach((w) => {
          if (existWords.has(w)) intersection++;
        });
        const union = new Set([...candidateWords, ...existWords]).size;
        const similarity = union > 0 ? intersection / union : 0;

        if (similarity > 0.35) {
          return true;
        }

        // 3. Duplicate question string prefix
        const stemA = qCandidate.question.toLowerCase().slice(0, 35);
        const stemB = existing.question.toLowerCase().slice(0, 35);
        if (stemA === stemB) {
          return true;
        }
      }
      return false;
    };

    for (let batchIndex = 0; batchIndex < numBatches; batchIndex++) {
      const neededCount = requestedCount - allQuestions.length;
      if (neededCount <= 0) break;
      const currentBatchCount = Math.min(batchSize, neededCount + 2); // Request slight surplus for filtering

      const alreadyCoveredSummary = allQuestions.length > 0
        ? `\nAlready generated questions in this quiz (DO NOT REPEAT ANY OF THESE CONCEPTS OR QUESTION STEMS):\n${allQuestions
            .slice(-15)
            .map((q, i) => `${i + 1}. Concept: "${q.topic || 'General'}" - Question: "${q.question.slice(0, 90)}" - Target Answer: "${q.correctAnswer}"`)
            .join('\n')}\n`
        : '';

      const prompt = `Generate exactly ${currentBatchCount} distinct, high-quality academic interactive quiz questions EXCLUSIVELY and STRICTLY grounded in the provided source PDF content. DO NOT include any generic, outside, or unnecessary questions. Every question must be directly derived from specific sentences, data, formulas, or concepts inside the source text.

CRITICAL NON-REPETITION & STRICT GROUNDING MANDATE:
- Every question MUST cover a completely different paragraph, concept, formula, mechanism, definition, or topic from the PDF.
- DO NOT repeat concepts, facts, or target vocabulary words that were already asked.
- Avoid duplicate question templates or generic filler questions.
- Distribute questions progressively through the exact text provided.
${alreadyCoveredSummary}
Question Type preference: ${questionTypes}
Difficulty: ${difficulty}
Focus: ${focusArea}

STEM & CALCULATIVE SUBJECT MASTERY:
- If the content covers Mathematics, Physics, Chemistry, Engineering, Computing, or any quantitative/scientific subject:
  1. Formulate applied numerical exercises, formula evaluations, and algorithmic/chemical problem-solving questions.
  2. Use clean mathematical and scientific notations (LaTeX or clean symbols e.g. E = mc^2, F = ma, pH = -log[H+]).
  3. In the "explanation" field, always provide a complete, numbered step-by-step calculation:
     - Step 1: Identify given variables & units
     - Step 2: State the formula or principle
     - Step 3: Substitute values and calculate step-by-step
     - Step 4: Final answer with proper SI units
  4. Options: For multiple choice, construct mathematically plausible distractors representing common student calculation slips (e.g., inverted fractions, sign errors, unit conversion slips).

Requirements:
- question: clear, academically rigorous question directly supported by the source material
- type: 'multiple_choice' | 'true_false' | 'fill_in_blank' | 'short_answer'
- options: array of 4 distinct plausible choices for multiple_choice, or ["True", "False"] for true_false, or empty array [] for fill_in_blank / short_answer.
- correctAnswer: exact correct answer string matching one of the options (or exact phrase for fill_in_blank)
- explanation: comprehensive explanation citing why the answer is correct according to the source text (with full worked calculations for STEM problems)
- pageRef: source citation if available in text (e.g. "Page 3")
- topic: specific, unique subtopic

Return strictly valid JSON object:
{
  "questions": [
    {
      "id": string,
      "question": string,
      "type": string,
      "options": [string],
      "correctAnswer": string,
      "explanation": string,
      "pageRef": string,
      "topic": string
    }
  ]
}

Source text:\n${(content || '').slice(0, 80000)}`;

      const parts: any[] = [];
      if (fileBase64 && batchIndex === 0) {
        parts.push({
          inlineData: { mimeType: 'application/pdf', data: fileBase64 },
        });
      }
      parts.push({ text: prompt });

      try {
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: parts,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.45,
          },
        });
        const batchResult = extractJSON(response.text || '{}');
        if (batchResult && Array.isArray(batchResult.questions)) {
          for (const candidate of batchResult.questions) {
            if (!isQuestionTooSimilar(candidate, allQuestions)) {
              allQuestions.push(candidate);
              if (allQuestions.length >= requestedCount) break;
            }
          }
        }
      } catch (batchErr) {
        console.warn(`Batch ${batchIndex + 1} generation warning:`, batchErr);
      }
    }

    // If API returned fewer questions than requested, generate distinct concept questions from text
    if (allQuestions.length < requestedCount) {
      const rawText = content || '';
      const paragraphs = rawText
        .split(/\n\s*\n|\.\s+/)
        .map((p: string) => p.trim())
        .filter((p: string) => p.length > 30);

      const existingAnswers = new Set(allQuestions.map((q) => q.correctAnswer.toLowerCase().trim()));

      for (let i = 0; i < paragraphs.length && allQuestions.length < requestedCount; i++) {
        const para = paragraphs[i];
        const words = para.replace(/[^a-zA-Z0-9 ]/g, '').split(/\s+/).filter((w: string) => w.length > 4 && !stopWords.has(w.toLowerCase()));
        if (words.length < 2) continue;

        const candidateKeyword = words[Math.floor(words.length / 3)] || words[0];
        const normalizedKey = candidateKeyword.toLowerCase();
        if (existingAnswers.has(normalizedKey)) continue;

        const otherWords = words.filter((w: string) => w.toLowerCase() !== normalizedKey);
        const distractors = otherWords.slice(0, 3);
        while (distractors.length < 3) {
          distractors.push(`Secondary Concept ${distractors.length + 1}`);
        }

        const options = [candidateKeyword, ...distractors].sort(() => Math.random() - 0.5);

        const newQ = {
          id: `q-gen-${Date.now()}-${allQuestions.length + 1}`,
          question: `In reference to "${para.slice(0, 75)}...", which key term or mechanism is primary?`,
          type: 'multiple_choice',
          options,
          correctAnswer: candidateKeyword,
          explanation: `Directly derived from the learning material: "${para.slice(0, 110)}..."`,
          pageRef: `Section ${allQuestions.length + 1}`,
          topic: focusArea || 'Key Concepts',
        };

        if (!isQuestionTooSimilar(newQ, allQuestions)) {
          allQuestions.push(newQ);
          existingAnswers.add(normalizedKey);
        }
      }
    }

    if (allQuestions.length === 0) {
      throw new Error('Failed to generate quiz questions from document.');
    }

    const result = {
      title: title,
      difficulty: difficulty,
      totalQuestions: allQuestions.length,
      questions: allQuestions.slice(0, requestedCount),
    };

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error in /api/ai/quiz:', error);
    res.status(500).json({ error: error.message || 'Failed to generate quiz' });
  }
});

// 4. AI Flashcard Generator
app.post('/api/ai/flashcards', async (req: Request, res: Response) => {
  try {
    const { content, fileBase64, title = 'Study Deck', numCards = 8, topic = 'General' } = req.body;

    if (!content && !fileBase64) {
      return res.status(400).json({ error: 'Content or file is required to generate flashcards.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

    const prompt = `Generate exactly ${numCards} active-recall revision flashcards from this study material.
Title: ${title}
Topic: ${topic}

Each flashcard should follow active-recall best practices:
- Front: A sharp prompt, concept, question, or definition trigger
- Back: Concise, precise explanation, solution, or definition
- Category / Tag: Subtopic
- Hint: A helpful clue for revision

Return strictly a JSON object:
{
  "deckTitle": string,
  "totalCards": number,
  "cards": [
    {
      "id": string,
      "front": string,
      "back": string,
      "hint": string,
      "category": string
    }
  ]
}

Source Material:\n${(content || '').slice(0, 80000)}`;

    const parts: any[] = [];
    if (fileBase64) {
      parts.push({
        inlineData: { mimeType: 'application/pdf', data: fileBase64 },
      });
    }
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: parts,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const result = extractJSON(response.text || '{}');
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error in /api/ai/flashcards:', error);
    res.status(500).json({ error: error.message || 'Failed to generate flashcards' });
  }
});

// 5. Practice Test / Mock Exam Generator
app.post('/api/ai/practice-test', async (req: Request, res: Response) => {
  try {
    const {
      content,
      title = 'Exam Simulation',
      subject = 'General Studies',
      numQuestions = 10,
      durationMinutes = 20,
      passingScore = 70,
      difficulty = 'Medium',
    } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required for practice test.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

    const prompt = `Create an academic mock examination simulation with ${numQuestions} questions based on this study content.
Subject: ${subject}
Title: ${title}
Difficulty: ${difficulty}
Target duration: ${durationMinutes} minutes
Passing score: ${passingScore}%

Provide balanced exam questions (multiple choice, true/false, conceptual short answer with model solution).
Format strictly as JSON:
{
  "title": string,
  "subject": string,
  "durationMinutes": number,
  "passingScore": number,
  "instructions": string,
  "questions": [
    {
      "id": string,
      "number": number,
      "question": string,
      "type": "multiple_choice" | "true_false" | "short_answer",
      "options": [string],
      "correctAnswer": string,
      "explanation": string,
      "weight": number
    }
  ]
}

Study content:\n${content.slice(0, 80000)}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.25,
      },
    });

    const result = extractJSON(response.text || '{}');
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error in /api/ai/practice-test:', error);
    res.status(500).json({ error: error.message || 'Failed to create practice test' });
  }
});

// Helper: Retrieval-Augmented Generation (RAG) passage ranker
function retrieveRelevantPassages(query: string, documentText: string, topK: number = 3): { text: string; score: number }[] {
  if (!documentText) return [];
  const paragraphs = documentText.split(/\n\s*\n/).filter((p) => p.trim().length > 40);
  const queryTerms = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

  const scored = paragraphs.map((para) => {
    const lowerPara = para.toLowerCase();
    let score = 0;
    queryTerms.forEach((term) => {
      if (lowerPara.includes(term)) {
        score += 1;
        // Exact term frequency boost
        const occurrences = (lowerPara.match(new RegExp(term, 'g')) || []).length;
        score += occurrences * 0.5;
      }
    });
    return { text: para.trim(), score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter((p) => p.score > 0);
}

// 6. Ask Study Kit with RAG Passage Grounding
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { message = '', contextText = '', documentTitle = '', history = [] } = req.body || {};
  try {

    if (!message) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

    // Step 1 & 2: RAG Passage Retrieval
    let retrievedContext = '';
    let hasMatchingPassages = false;

    if (contextText && contextText.trim().length > 100) {
      const topPassages = retrieveRelevantPassages(message, contextText, 4);
      if (topPassages.length > 0) {
        hasMatchingPassages = true;
        retrievedContext = topPassages.map((p, idx) => `[Passage ${idx + 1}]\n${p.text}`).join('\n\n');
      } else {
        // Fallback to broader document context slice
        retrievedContext = contextText.slice(0, 30000);
      }
    }

    const systemPrompt = `You are "Ask Study Kit", an expert, patient, and encouraging AI study partner and tutor.
When a reference document is provided, you must prioritize information from that document to answer the student's question, and cite specific pages, chapters, or sections where available in the text.
If the answer is found in the document, explain it clearly and cite the document evidence (e.g., "(Page 4)").
If the answer cannot be found in the document, explicitly inform the student: "This isn't explicitly mentioned in ${documentTitle || 'your document'}, but here is the general academic explanation:", and clearly distinguish between document facts and general knowledge.
Always format with clear headings, bullet points, or step-by-step logic.
Provide 2-3 suggested follow-up questions at the end that the student can click to ask next.

Return strictly a JSON object:
{
  "reply": string (markdown supported),
  "isGroundedInDocument": boolean,
  "citations": [string],
  "suggestedFollowUps": [string]
}`;

    const prompt = `${retrievedContext ? `RETRIEVED DOCUMENT EVIDENCE (${documentTitle || 'Uploaded Document'}):\n${retrievedContext}\n\n---\n` : 'No specific document selected. Provide standard academic tutoring.\n\n'}
Student Question: ${message}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const result = extractJSON(response.text || '{}');
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error in /api/ai/chat, falling back to local RAG generator:', error);
    try {
      const topPassages = contextText ? retrieveRelevantPassages(message, contextText, 3) : [];
      const reply = topPassages.length > 0
        ? `Based on ${documentTitle || 'your document'}, here is what relates to your question:\n\n${topPassages.map(p => `• ${p.text}`).join('\n\n')}\n\nThis addresses the core concepts from the referenced passages.`
        : `Regarding your question about "${message}": Based on general academic principles and your study materials, this concept involves key foundational theories and structured study steps. Make sure to review the core definitions and practice related problems.`;

      return res.json({
        success: true,
        data: {
          reply,
          isGroundedInDocument: topPassages.length > 0,
          citations: topPassages.map((_, idx) => `Passage ${idx + 1}`),
          suggestedFollowUps: [
            "Can you summarize the key takeaways?",
            "What are the most important terms to memorize?",
            "Give me a practice quiz question on this topic."
          ]
        }
      });
    } catch (fallbackErr) {
      return res.status(500).json({ error: error.message || 'Failed to process AI chat' });
    }
  }
});

// 7. AI Study Planner Generator
app.post('/api/ai/planner', async (req: Request, res: Response) => {
  try {
    const { subjects = [], examDates = [], dailyHours = 2, preferredDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], goals = '' } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

    const prompt = `Create a realistic, balanced, personalized revision study timetable and task list for a student.
Subjects: ${JSON.stringify(subjects)}
Upcoming Exams / Deadlines: ${JSON.stringify(examDates)}
Available study time per day: ${dailyHours} hours
Preferred study days: ${preferredDays.join(', ')}
Special goals: ${goals || 'Achieve top grades and master weak areas'}

Generate an actionable revision plan with concrete study tasks, review sessions, and milestone dates.
Return strictly valid JSON:
{
  "summary": string,
  "weeklyStudyHours": number,
  "tasks": [
    {
      "id": string,
      "title": string,
      "subject": string,
      "dueDate": string (YYYY-MM-DD or day indicator),
      "durationMinutes": number,
      "priority": "High" | "Medium" | "Low",
      "actionType": "Summarise" | "Revise Flashcards" | "Practice Test" | "Deep Reading",
      "tips": string
    }
  ],
  "studyTips": [string]
}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const result = extractJSON(response.text || '{}');
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error in /api/ai/planner:', error);
    res.status(500).json({ error: error.message || 'Failed to generate study plan' });
  }
});

// Server-side absolute UTC streak verification hook with 24-48h rolling window precision
app.post('/api/verify-streak', (req: Request, res: Response) => {
  try {
    const { currentStreak = 0, lastStudyDate = '', streakFreezes = 0, lastFreezeAwardedAt = 0 } = req.body;
    const now = new Date();
    const last = lastStudyDate ? new Date(lastStudyDate) : now;
    
    const todayUTC = now.toISOString().split('T')[0];
    const lastUTC = last.toISOString().split('T')[0];

    if (todayUTC === lastUTC) {
      return res.json({
        success: true,
        currentStreak,
        streakFreezes,
        lastFreezeAwardedAt,
        lastStudyDate: now.toISOString(),
        streakAdvanced: false,
      });
    }

    const diffMs = now.getTime() - last.getTime();
    const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
    let newStreak = currentStreak;
    let newFreezes = streakFreezes;
    let newFreezeAwardedAt = lastFreezeAwardedAt;

    // Precise 24-48 hour rolling window & calendar day check preventing early/late resets
    if (diffMs > 48 * 60 * 60 * 1000 || diffDays > 2) {
      if (newFreezes > 0 && diffMs <= 72 * 60 * 60 * 1000) {
        newFreezes -= 1;
        newStreak += 1; // Protected by streak freeze within grace window
      } else {
        newStreak = 1; // Reset streak if elapsed time exceeds window without freeze
      }
    } else if (diffMs >= 24 * 60 * 60 * 1000 || diffDays === 1 || diffDays === 2) {
      if (diffDays === 2 && newFreezes > 0) {
        newFreezes -= 1;
      }
      newStreak += 1;
    } else {
      return res.json({
        success: true,
        currentStreak,
        streakFreezes,
        lastFreezeAwardedAt,
        lastStudyDate: now.toISOString(),
        streakAdvanced: false,
      });
    }

    if (newStreak % 14 === 0 && newStreak !== newFreezeAwardedAt) {
      if (newFreezes < 3) {
        newFreezes += 1;
        newFreezeAwardedAt = newStreak;
      }
    }

    res.json({
      success: true,
      currentStreak: newStreak,
      streakFreezes: newFreezes,
      lastFreezeAwardedAt: newFreezeAwardedAt,
      lastStudyDate: now.toISOString(),
      streakAdvanced: newStreak > currentStreak,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Streak verification failed' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const port = process.env.PORT || 3000;

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Study Kit server listening on port ${port} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer();
