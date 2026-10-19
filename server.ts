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

const GEMINI_MODEL = 'gemini-3.1-flash-lite';

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    appName: 'Study Kit',
  });
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

    const parsed = await parsePdfBuffer(buffer);
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
Your job is to read and analyze this learning material thoroughly, and output an exhaustive, structured educational summary in valid JSON format only.

Options:
- Summary Length: ${length}
- Summary Style: ${style}
- Target Academic Level: ${targetLevel}
- Language: ${language}

Strict requirements:
1. Document Overview: title, subject, estimated page count / sections, short 2-3 sentence overview.
2. Executive Summary: concise high-level synthesis of core argument/findings.
3. Chapter/Section Summaries: break down each identifiable section or chapter with title, mainIdea, keyPoints (array of strings), examples (array of strings), and conclusion.
4. Key Points: 5 to 10 crucial bullet points with exact page or section citations if present in source (e.g. "(Page 4)" or "(Section 2)"). Never invent page numbers.
5. Important Definitions: list of terms with clear definition and page references.
6. Important Formulas: mathematical or scientific formulas with formula, what it is used for, variable definitions, and units. If none present in source, return empty array [].
7. Important Dates, Names, and Facts: key historical/scientific dates, people, and findings. If none, return empty array [].
8. Key Takeaways: 4 to 6 memorable insights.
9. Revision Checklist: list of 5 to 8 concrete review check items.

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
    const batchSize = 25;
    const numBatches = Math.ceil(requestedCount / batchSize);

    for (let batchIndex = 0; batchIndex < numBatches; batchIndex++) {
      const currentBatchCount = Math.min(batchSize, requestedCount - allQuestions.length);
      if (currentBatchCount <= 0) break;

      const prompt = `Generate batch ${batchIndex + 1} of ${numBatches} containing exactly ${currentBatchCount} high quality, academically rigorous interactive quiz questions based directly and strictly on the provided study material.
Question Type preference: ${questionTypes}
Difficulty: ${difficulty}
Focus: ${focusArea}

Requirements:
- question: clear, academically rigorous question directly supported by the source material
- type: 'multiple_choice' | 'true_false' | 'fill_in_blank' | 'short_answer'
- options: array of 4 distinct plausible choices for multiple_choice, or ["True", "False"] for true_false, or empty array [] for fill_in_blank / short_answer.
- correctAnswer: exact correct answer string matching one of the options (or exact phrase for fill_in_blank)
- explanation: comprehensive explanation citing why the answer is correct according to the source text
- pageRef: source citation if available in text (e.g. "Page 3")
- topic: relevant subtopic

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
            temperature: 0.3,
          },
        });
        const batchResult = extractJSON(response.text || '{}');
        if (batchResult && Array.isArray(batchResult.questions)) {
          allQuestions.push(...batchResult.questions);
        }
      } catch (batchErr) {
        console.warn(`Batch ${batchIndex + 1} generation warning:`, batchErr);
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
  try {
    const { message, contextText = '', documentTitle = '', history = [] } = req.body;

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
    console.error('Error in /api/ai/chat:', error);
    res.status(500).json({ error: error.message || 'Failed to process AI chat' });
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
