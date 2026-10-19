# Implementation Plan - Study Kit Netlify Serverless Backend & Resilient Quiz Engine

Resolving the `"Unexpected token '<', '<!DOCTYPE '... is not valid JSON"` issue on Netlify by deploying a TypeScript Netlify serverless function, configuring API redirects, building an enterprise-grade fetch helper, and implementing batched quiz generation with client-side PDF extraction and fallback.

## User Review & Critical Decisions

> [!IMPORTANT]
> - **Architecture Choice Confirmed**: Standalone TypeScript Netlify serverless function handler in `netlify/functions/api.ts` mapping all `/api/*` routes.
> - **Batch Size Confirmed**: 10 questions per batch to comfortably stay within Netlify's 10-second serverless execution timeout limit, running up to 2-3 batches concurrently with live progress tracking and deduplication.
> - **Theme Continuity**: Maintaining the existing charcoal black (`#121212` / `#1C1C1C`), golden yellow (`#F2C230` / `#EAB308`), and white typography design.

---

### 1. Overview & Core Concept

**Study Kit** (studykit2.netlify.app) provides students with AI-powered study tools including quiz generation, PDF summarization, and an interactive study tutor chat. In production on Netlify, API calls to `/api/*` currently route to `index.html` (returning HTML instead of JSON) because no Netlify function handles the route, triggering a JSON parser crash. 

This update resolves the issue end-to-end:
1. **Netlify Functions & Routing**: A TypeScript serverless handler in `netlify/functions/api.ts` paired with `netlify.toml` redirects ensures all `/api/*` requests reach the serverless backend and return JSON.
2. **Safe Fetch Client**: A universal `apiClient` helper wraps all network requests, handles HTTP status codes, automatically retries on 502/504, and displays clear, friendly error messages.
3. **Batched Quiz Generator**: For requests with 10–75 questions, generation runs in 10-question slices with live progress display (`Generating 20/50...`), deduplication, and partial results preservation.
4. **Client-Side PDF Text Extraction**: Extracts text directly in the browser using PDF.js and sends lightweight text payloads (<6MB), eliminating base64 upload timeouts.
5. **Smart Limits & Fill-in-the-Blank Fallback**: Advises users on realistic question counts based on document length and generates an offline fill-in-the-blank quiz if serverless AI requests fail.

---

### 2. User Experience & Visual Design

- **Batch Progress Indicator**: When generating large quizzes (e.g. 30, 50, 75 questions), the modal displays a stepped progress bar:
  - *"Generating questions 1–10 of 50..."*
  - Smooth animation with partial question count accumulation.
- **Question Limit Guidance**: If a user selects 75 questions for a short document (e.g., 1–2 pages), a golden-yellow callout explains:
  - *"Document has approximately 1 page. We recommend 10–15 questions for optimal quality and question relevance."* with a quick "Adjust to 15" button.
- **Graceful Error Handling & Fallback Banner**: If AI services are unreachable or timed out after retries:
  - Friendly banner: *"AI study service is currently busy. Would you like to practice with an instant offline practice quiz?"*
  - Instant button: **"Generate Offline Practice Quiz"** (builds fill-in-the-blank and term matching questions instantly from the extracted document sentences).
- **Aesthetic**: Strictly preserved charcoal black surfaces (`#121212`, `#181818`, `#262626`), high-contrast golden yellow buttons and accents (`#F2C230`), and crisp white text.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Standalone Serverless Handler (`netlify/functions/api.ts`)**:
  - *Chosen Approach*: Route requests through a lightweight TypeScript Netlify handler handling `/api/ai/quiz`, `/api/ai/chat`, `/api/ai/summarize`, `/api/ai/flashcards`, `/api/ai/practice-test`, `/api/ai/planner`, and `/api/health`.
  - *Why*: Eliminates dependencies on heavyweight Express inside serverless, ensures sub-second cold starts, and stays strictly within Netlify's 10s function limit.
  - *Dev Server Parity*: `server.ts` is preserved for local development and containerized environments.
- **Decision 2: Universal Safe API Client (`src/lib/apiClient.ts`)**:
  - *Chosen Approach*: All frontend components (`QuizPage`, `StudyAssistantPage`, `SummarizerPage`, `FlashcardsPage`, `DocumentUploadModal`) migrate to `apiClient.post()` / `apiClient.get()`.
  - *Why*: Replaces scattered `fetch().then(r => r.json())` with standardized `text()` checking, JSON syntax guards, 502/504 retry logic, and user-friendly error translations.
- **Decision 3: Client-Side PDF.js Extraction**:
  - *Chosen Approach*: Text is parsed in the browser via `pdfjs-dist` (or canvas/text layer) and only plain text strings are sent to the AI backend.
  - *Why*: Multi-megabyte PDF binaries trigger Netlify request payload limits (6MB) and slow upload speeds. Plain text extraction is fast, instant, and keeps requests under 50KB.
- **Decision 4: Batch Size of 10 with Concurrency Pool (2-3 parallel)**:
  - *Chosen Approach*: Multi-question quizzes are partitioned into batches of 10 questions. If requesting 50 questions, 5 batches are dispatched with a max concurrency of 2-3 to avoid rate limits while completing in <10 seconds per batch.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Frontend (Vite React SPA)                       │
├────────────────────────────────────────────────────────────────────────┤
│  QuizPage.tsx          StudyAssistantPage.tsx     SummarizerPage.tsx   │
│  - Batch Coordinator   - Grounded Chat            - Key takeaways      │
│  - Progress State      - Citations                - Section outlines   │
│  - Smart Limits Warning                                                │
│  - Offline Fallback                                                    │
├────────────────────────────────────────────────────────────────────────┤
│                src/lib/apiClient.ts (Universal Fetch Helper)           │
│    - Safe res.text() -> JSON.parse                                     │
│    - Status Code Validation (ok / 502 / 504 retry)                     │
│    - Friendly Error Message Formatting                                 │
├────────────────────────────────────────────────────────────────────────┤
│                src/lib/pdfClient.ts (Browser PDF Extractor)            │
│    - PDF.js text layer extraction (page-by-page)                       │
│    - Text trimming (<500KB safe payload)                               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP POST /api/*
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Netlify Edge / Redirects                        │
├────────────────────────────────────────────────────────────────────────┤
│  netlify.toml                                                          │
│  - [[redirects]] from = "/api/*" to = "/.netlify/functions/api/:splat" │
│  - [[redirects]] from = "/*"     to = "/index.html" status = 200       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│          Netlify Serverless Function (netlify/functions/api.ts)        │
├────────────────────────────────────────────────────────────────────────┤
│  - Secure process.env.GEMINI_API_KEY access                            │
│  - Fast model: gemini-3.1-flash-lite / gemini-3.8-flash                │
│  - Compact JSON responseSchema & prompt engineering                    │
│  - Output validator & code-fence stripper                              │
│  - Strict try/catch: ALWAYS returns application/json with status code  │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 5. Implementation Steps & Deliverables

1. **Netlify Configuration (`netlify.toml`)**:
   - Configure `functions = "netlify/functions"` in `[build]`.
   - Setup exact redirect order: `/api/* -> /.netlify/functions/api/:splat` (status 200), followed by SPA fallback `/* -> /index.html` (status 200).
2. **Serverless Function Handler (`netlify/functions/api.ts`)**:
   - Implement the Netlify handler routing `health`, `ai/quiz`, `ai/chat`, `ai/summarize`, `ai/flashcards`, `ai/practice-test`, and `ai/planner`.
   - Securely read `process.env.GEMINI_API_KEY`.
   - Implement strict JSON output validation, code-fence sanitization, and structured error responses.
3. **Resilient API Client (`src/lib/apiClient.ts`)**:
   - Implement `apiClient.post` and `apiClient.get` with text parsing, JSON guards, 1 automatic retry on 502/504, and user-friendly error translations.
4. **Browser PDF Text Extraction (`src/lib/pdfClient.ts`)**:
   - Implement browser-native PDF extraction using `pdfjs-dist` to parse documents page-by-page and trim safe payloads.
5. **Quiz Engine Overhaul (`src/pages/QuizPage.tsx`)**:
   - Implement batch generator (10 questions per batch, max 2-3 in parallel).
   - Add live progress tracker (`"Generating 20/50 questions..."`).
   - Add duplicate question filtering and schema validation.
   - Add smart question limit warning based on document page/word count.
   - Add client-side sentence-based fill-in-the-blank fallback generator if all retries fail.
6. **Chat Integration (`src/pages/StudyAssistantPage.tsx`)**:
   - Integrate `apiClient` for conversational tutor chat with clean error messages and auto-retry.
7. **Deployment & Environment Setup Guide**:
   - Provide exact Netlify environment variables list (`GEMINI_API_KEY`).
   - Provide CLI and Git deployment instructions.
   - Provide testing checklist.
