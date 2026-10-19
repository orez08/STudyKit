import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client with user-agent telemetry as instructed in gemini-api skill
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const FAST_MODEL = 'gemini-3.1-flash-lite';

// Standard CORS and JSON headers
const defaultHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Safe JSON extractor that strips markdown fences
function cleanAndExtractJSON(text: string): any {
  if (!text) return null;
  let cleaned = text.trim();
  // Strip ```json or ``` code fences
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Attempt fallback repair for trailing commas or minor syntax glitches
    const repaired = cleaned.replace(/,\s*([\]}])/g, '$1');
    return JSON.parse(repaired);
  }
}

// Helper: Retrieval-Augmented Generation (RAG) passage ranker
function retrieveRelevantPassages(query: string, documentText: string, topK: number = 4): { text: string; score: number }[] {
  if (!documentText) return [];
  const paragraphs = documentText.split(/\n\s*\n/).filter((p) => p.trim().length > 30);
  const queryTerms = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

  const scored = paragraphs.map((para) => {
    const lowerPara = para.toLowerCase();
    let score = 0;
    queryTerms.forEach((term) => {
      if (lowerPara.includes(term)) {
        score += 1;
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

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: defaultHeaders,
      body: '',
    };
  }

  // Normalize request path
  const rawPath = event.path || '';
  const subPath = rawPath
    .replace(/^\/\.netlify\/functions\/api/, '')
    .replace(/^\/api/, '')
    .replace(/\/$/, '');

  try {
    // 1. Health Check
    if (subPath === '/health' || subPath === '') {
      return {
        statusCode: 200,
        headers: defaultHeaders,
        body: JSON.stringify({
          status: 'ok',
          service: 'Study Kit Netlify Serverless Backend',
          hasApiKey: !!process.env.GEMINI_API_KEY,
          timestamp: new Date().toISOString(),
        }),
      };
    }

    // Require POST for AI endpoints
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: defaultHeaders,
        body: JSON.stringify({ success: false, error: 'Method Not Allowed' }),
      };
    }

    // Ensure API Key exists
    const ai = getGenAI();
    if (!ai) {
      return {
        statusCode: 503,
        headers: defaultHeaders,
        body: JSON.stringify({
          success: false,
          error: 'GEMINI_API_KEY is not configured in Netlify environment variables.',
        }),
      };
    }

    // Parse incoming JSON body safely
    let body: any = {};
    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch {
        return {
          statusCode: 400,
          headers: defaultHeaders,
          body: JSON.stringify({ success: false, error: 'Malformed JSON payload in request body.' }),
        };
      }
    }

    // 2. AI Quiz Generator Batch Handler (/ai/quiz)
    if (subPath === '/ai/quiz') {
      const {
        content = '',
        batchNumber = 1,
        totalBatches = 1,
        batchSize = 10,
        questionTypes = 'Multiple Choice Questions',
        difficulty = 'Medium',
        focusArea = 'Important Concepts',
        title = 'Study Quiz',
      } = body;

      if (!content || content.trim().length === 0) {
        return {
          statusCode: 400,
          headers: defaultHeaders,
          body: JSON.stringify({ success: false, error: 'Content is required to generate quiz questions.' }),
        };
      }

      // Safe slice of content to guarantee rapid inference (<3s)
      const contentSnippet = content.slice(0, 35000);
      const count = Math.min(Number(batchSize) || 10, 15);

      const prompt = `Generate batch ${batchNumber} of ${totalBatches} containing exactly ${count} interactive study quiz questions based on the source text.
Question Style: ${questionTypes}
Difficulty: ${difficulty}
Focus: ${focusArea}

Requirements for each question:
- question: clear, academically rigorous question directly from source
- type: 'multiple_choice' | 'true_false' | 'fill_in_blank'
- options: array of 4 distinct choices for multiple_choice (or ["True", "False"] for true_false)
- correctAnswer: exact matching string from options
- explanation: concise explanation citing the reason according to the text
- topic: specific subtopic name

Return STRICTLY valid JSON:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text here?",
      "type": "multiple_choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Why Option A is correct.",
      "topic": "Topic Name"
    }
  ]
}

Source text:\n${contentSnippet}`;

      const aiResponse = await ai.models.generateContent({
        model: FAST_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const parsed = cleanAndExtractJSON(aiResponse.text || '{}');
      const rawQuestions: any[] = parsed?.questions || [];

      // Strict validation of output questions
      const validatedQuestions = rawQuestions
        .filter((q) => {
          return (
            q &&
            typeof q.question === 'string' &&
            q.question.trim().length > 5 &&
            typeof q.correctAnswer === 'string' &&
            q.correctAnswer.trim().length > 0
          );
        })
        .map((q, idx) => {
          let opts = Array.isArray(q.options) ? q.options.filter(Boolean) : [];
          if (opts.length < 2) {
            opts = [q.correctAnswer, 'Alternative option', 'Secondary option', 'None of the above'];
          }
          // Ensure correct answer is in options
          if (!opts.includes(q.correctAnswer)) {
            opts[0] = q.correctAnswer;
          }

          return {
            id: `q-b${batchNumber}-${idx + 1}-${Date.now()}`,
            question: q.question.trim(),
            type: q.type || 'multiple_choice',
            options: opts,
            correctAnswer: q.correctAnswer.trim(),
            explanation: q.explanation || 'Based on the provided study materials.',
            topic: q.topic || focusArea,
          };
        });

      return {
        statusCode: 200,
        headers: defaultHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            title,
            difficulty,
            batchNumber,
            totalQuestions: validatedQuestions.length,
            questions: validatedQuestions,
          },
        }),
      };
    }

    // 3. AI Chat Tutor Handler (/ai/chat)
    if (subPath === '/ai/chat') {
      const { message, contextText = '', documentTitle = '' } = body;

      if (!message || message.trim().length === 0) {
        return {
          statusCode: 400,
          headers: defaultHeaders,
          body: JSON.stringify({ success: false, error: 'Message cannot be empty.' }),
        };
      }

      let retrievedContext = '';
      if (contextText && contextText.trim().length > 50) {
        const topPassages = retrieveRelevantPassages(message, contextText, 4);
        if (topPassages.length > 0) {
          retrievedContext = topPassages.map((p, idx) => `[Evidence Passage ${idx + 1}]\n${p.text}`).join('\n\n');
        } else {
          retrievedContext = contextText.slice(0, 20000);
        }
      }

      const systemPrompt = `You are "Ask Study Kit", an expert, encouraging AI study partner and tutor.
When document context is provided, answer using that information and cite passages (e.g. "[Evidence Passage 1]").
If the answer is not in the document, clarify: "While this is not directly in ${documentTitle || 'your document'}, here is the academic explanation:", and explain clearly.
Return STRICTLY valid JSON:
{
  "reply": string (clear markdown with bullets or steps),
  "isGroundedInDocument": boolean,
  "citations": [string],
  "suggestedFollowUps": [string]
}`;

      const userPrompt = `${retrievedContext ? `DOCUMENT CONTEXT (${documentTitle || 'Uploaded Material'}):\n${retrievedContext}\n\n---\n` : 'General study tutoring context.\n\n'}
Student Question: ${message}`;

      const aiResponse = await ai.models.generateContent({
        model: FAST_MODEL,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const parsed = cleanAndExtractJSON(aiResponse.text || '{}');
      return {
        statusCode: 200,
        headers: defaultHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            reply: parsed?.reply || 'I processed your query. Let me know if you would like me to clarify further.',
            isGroundedInDocument: !!parsed?.isGroundedInDocument,
            citations: Array.isArray(parsed?.citations) ? parsed.citations : [],
            suggestedFollowUps: Array.isArray(parsed?.suggestedFollowUps) ? parsed.suggestedFollowUps : [],
          },
        }),
      };
    }

    // 4. AI Document Summarizer Handler (/ai/summarize)
    if (subPath === '/ai/summarize') {
      const {
        content = '',
        title = 'Study Document',
        length = 'Standard Summary',
        style = 'Academic Notes',
        targetLevel = 'University',
        language = 'English',
      } = body;

      if (!content || content.trim().length === 0) {
        return {
          statusCode: 400,
          headers: defaultHeaders,
          body: JSON.stringify({ success: false, error: 'Document text content is required.' }),
        };
      }

      const safeText = content.slice(0, 35000);

      const prompt = `You are Study Kit's academic research analyst.
Summarize the following document into structured notes.
Length: ${length}
Style: ${style}
Level: ${targetLevel}
Language: ${language}

Return strictly a valid JSON object:
{
  "title": "${title}",
  "subject": "Academic Study",
  "overview": "Short 2-3 sentence overview.",
  "executiveSummary": "Concise high level synthesis of core findings.",
  "chapters": [
    {
      "title": "Section Title",
      "mainIdea": "Main conceptual point",
      "keyPoints": ["Point 1", "Point 2"],
      "examples": ["Example 1"],
      "conclusion": "Takeaway"
    }
  ],
  "keyPoints": ["Crucial bullet 1", "Crucial bullet 2"],
  "definitions": [
    { "term": "Term", "definition": "Definition", "pageRef": "Context" }
  ],
  "formulas": [],
  "datesAndFacts": [],
  "keyTakeaways": ["Takeaway 1", "Takeaway 2"],
  "revisionChecklist": ["Review item 1", "Review item 2"]
}

Source text:\n${safeText}`;

      const aiResponse = await ai.models.generateContent({
        model: FAST_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.25,
        },
      });

      const parsed = cleanAndExtractJSON(aiResponse.text || '{}');
      return {
        statusCode: 200,
        headers: defaultHeaders,
        body: JSON.stringify({
          success: true,
          data: parsed,
        }),
      };
    }

    // 5. AI Flashcards Generator Handler (/ai/flashcards)
    if (subPath === '/ai/flashcards') {
      const { content = '', count = 10, title = 'Study Deck' } = body;
      const safeText = content.slice(0, 30000);

      const prompt = `Generate ${Math.min(Number(count) || 10, 15)} high yield flashcards from the text.
Return JSON:
{
  "title": "${title}",
  "flashcards": [
    {
      "front": "Prompt, term, or question",
      "back": "Clear concise answer or definition",
      "category": "Topic Name"
    }
  ]
}

Source text:\n${safeText}`;

      const aiResponse = await ai.models.generateContent({
        model: FAST_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const parsed = cleanAndExtractJSON(aiResponse.text || '{}');
      return {
        statusCode: 200,
        headers: defaultHeaders,
        body: JSON.stringify({
          success: true,
          data: parsed,
        }),
      };
    }

    // 6. AI Practice Test Generator Handler (/ai/practice-test)
    if (subPath === '/ai/practice-test') {
      const {
        content = '',
        title = 'Exam Simulation',
        subject = 'General Studies',
        numQuestions = 10,
        durationMinutes = 20,
        passingScore = 70,
        difficulty = 'Medium',
      } = body;

      if (!content || content.trim().length === 0) {
        return {
          statusCode: 400,
          headers: defaultHeaders,
          body: JSON.stringify({ success: false, error: 'Content is required for practice test.' }),
        };
      }

      const prompt = `Create an academic mock examination with ${Math.min(Number(numQuestions) || 10, 25)} questions based on this study content.
Subject: ${subject}
Title: ${title}
Difficulty: ${difficulty}
Target duration: ${durationMinutes} minutes
Passing score: ${passingScore}%

Format strictly as JSON:
{
  "title": "${title}",
  "subject": "${subject}",
  "durationMinutes": ${durationMinutes},
  "passingScore": ${passingScore},
  "instructions": "Answer all questions to the best of your ability.",
  "questions": [
    {
      "id": "pt1",
      "number": 1,
      "question": "Question text here?",
      "type": "multiple_choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Why Option A is correct according to the study material.",
      "weight": 1
    }
  ]
}

Study content:\n${content.slice(0, 35000)}`;

      const aiResponse = await ai.models.generateContent({
        model: FAST_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.25,
        },
      });

      const parsed = cleanAndExtractJSON(aiResponse.text || '{}');
      return {
        statusCode: 200,
        headers: defaultHeaders,
        body: JSON.stringify({
          success: true,
          data: parsed,
        }),
      };
    }

    // 7. AI Study Planner Generator Handler (/ai/planner)
    if (subPath === '/ai/planner') {
      const {
        subjects = [],
        examDates = [],
        dailyHours = 2,
        preferredDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        goals = '',
      } = body;

      const prompt = `Create a realistic revision timetable and task schedule.
Subjects: ${JSON.stringify(subjects)}
Exams: ${JSON.stringify(examDates)}
Daily hours: ${dailyHours}
Preferred days: ${preferredDays.join(', ')}
Goals: ${goals || 'Excel in examinations'}

Return strictly valid JSON:
{
  "summary": "Custom revision plan designed to maximize retention.",
  "weeklyStudyHours": ${Number(dailyHours) * preferredDays.length},
  "tasks": [
    {
      "id": "t1",
      "title": "Study session title",
      "subject": "Subject Name",
      "dueDate": "Monday",
      "durationMinutes": 45,
      "priority": "High",
      "actionType": "Deep Reading",
      "tips": "Focus on foundational formulas and definitions."
    }
  ],
  "studyTips": ["Space out review sessions", "Test recall with active flashcards"]
}`;

      const aiResponse = await ai.models.generateContent({
        model: FAST_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const parsed = cleanAndExtractJSON(aiResponse.text || '{}');
      return {
        statusCode: 200,
        headers: defaultHeaders,
        body: JSON.stringify({
          success: true,
          data: parsed,
        }),
      };
    }

    // 8. PDF Text Extraction Endpoint Fallback (/pdf/extract-and-process)
    if (subPath === '/pdf/extract-and-process') {
      const { fileBase64, filename = 'document.pdf', text = '' } = body;

      if (text && text.trim().length > 0) {
        return {
          statusCode: 200,
          headers: defaultHeaders,
          body: JSON.stringify({
            success: true,
            data: {
              filename,
              text: text.trim(),
              pageCount: Math.max(1, Math.ceil(text.length / 2500)),
              isScanned: false,
              characterCount: text.length,
            },
          }),
        };
      }

      if (!fileBase64) {
        return {
          statusCode: 400,
          headers: defaultHeaders,
          body: JSON.stringify({ success: false, error: 'fileBase64 or text is required.' }),
        };
      }

      // Use Gemini Multimodal OCR
      const ocrResponse = await ai.models.generateContent({
        model: FAST_MODEL,
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

      const extractedText = (ocrResponse.text || '').replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
      const pageMatches = extractedText.match(/\[Page \d+\]/gi);
      const pageCount = pageMatches ? Math.max(1, pageMatches.length) : Math.max(1, Math.ceil(extractedText.length / 2500));

      return {
        statusCode: 200,
        headers: defaultHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            filename,
            text: extractedText,
            pageCount,
            isScanned: false,
            characterCount: extractedText.length,
          },
        }),
      };
    }

    // 9. Unknown Subpath
    return {
      statusCode: 404,
      headers: defaultHeaders,
      body: JSON.stringify({
        success: false,
        error: `Endpoint '${subPath}' not found on Study Kit Netlify API.`,
      }),
    };
  } catch (err: any) {
    console.error('Unhandled Netlify function error:', err);
    return {
      statusCode: 500,
      headers: defaultHeaders,
      body: JSON.stringify({
        success: false,
        error: err.message || 'Server encountered an unexpected error. Please retry.',
      }),
    };
  }
};
