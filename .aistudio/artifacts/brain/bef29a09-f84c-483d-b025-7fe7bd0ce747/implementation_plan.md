# Exam Likely Questions: Expert Examiner AI Engine

Transform uploaded course materials into high-yield, lecturer-grade predicted exam questions categorized by probability, mark allocation, and comprehensive examiner marking rubrics.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following specifications were confirmed during Phase 1 clarification:
> - **Interaction Mode**: Dual mode offering both a self-paced **Study Revision View** (with collapsible model answers, breakdown of marks, and marking tips) and a timed **Practice Mock Exam View** (with question navigation and simulated exam scoring).
> - **Export Capabilities**: Formatted **Printable PDF Exam Paper** (clean black-and-white academic layout with header, candidate name line, time allowed, and instructions) plus clean **Markdown Export** to copy straight into notes or print.
> - **Exam Distribution**: Balanced exam distribution combining Multiple Choice Questions (MCQs), structured Short Answer definitions, comprehensive Theory essays, and worked step-by-step STEM Calculations.

---

### 1. Overview & Core Concept

- **What It Does**: Simulates an experienced university lecturer and exam board moderator. It scans uploaded documents, identifies core syllabus objectives, heavily stressed principles, formulas, and recurring mechanisms, and formulates high-probability exam questions with likelihood tiers (**Highly Likely**, **Likely**, and **Possible**), exact mark allocations, complete marking schemes, and step-by-step worked solutions for quantitative problems.
- **Target Audience**: University students, secondary scholars, and exam candidates seeking focused revision on what is most probable to appear on their test papers.
- **Key Value**: Eliminates generic flashcard fatigue by pinpointing the specific questions examiners favor, teaching students how marks are awarded and how to structure full-mark responses.

---

### 2. User Experience & Visual Design

#### Navigation Placement & Top-Level Access
- **Sidebar & Mobile Navigation**: Positioned prominently directly between **PDF Summariser** and **AI Quiz Generator** with a distinct `GraduationCap` or `FileSpreadsheet` indicator and a badge reflecting saved exam papers.
- **Header & Active Tab State**: Clean transition into the new `likely-questions` workspace tab, fully wired into `App.tsx`, `Sidebar.tsx`, and `MobileDrawer.tsx`.

#### Key User Flows
1. **Source Selection & Generator Deck**:
   - Source document selector (active uploaded PDF/text or sample preloaded materials).
   - Question Count selector: **10 Questions** (Quick Drill), **20 Questions** (Standard Paper), or **50 Questions** (Comprehensive Mock).
   - Action Button: **"Generate Likely Exam Questions"** with animated loading state indicating "Examiner reviewing syllabus points...".
2. **Dual-Mode Workspace**:
   - **Mode 1: Study Revision**:
     - Visual filter bar: Filter by Likelihood (**All**, **Highly Likely**, **Likely**, **Possible**) and Type (**MCQ**, **Short Answer**, **Theory**, **Calculation**).
     - Question Cards: Clean card presentation with difficulty indicator (Easy/Medium/Hard), Likelihood badge, marks allocated (`[5 Marks]`), and topic citation.
     - Interactive disclosure for Model Answer, Step-by-Step Marking Rubric, and Examiner Tip.
   - **Mode 2: Timed Practice Mock**:
     - Clean simulated test environment with countdown timer calculated from total marks.
     - Question drawer with answered/unanswered progress indicator.
     - Final review screen with auto-grading for objective questions and self-assessed mark allocation for theory/calculation questions.
3. **Export & Print**:
   - One-click **Printable PDF Exam Paper** trigger using `@media print` CSS for a university-style paper with exam code, candidate metadata box, and section breaks.
   - **Copy Markdown** action for seamless export to Notion, Obsidian, or Google Docs.

#### Visual Theme & Spatial Hierarchy
- **Palette**: Sophisticated dark canvas (`#070709`) consistent with Study Kit, with semantic likelihood accents:
  - **Highly Likely**: Ruby/Rose tint (`bg-rose-500/10 text-rose-400 border border-rose-500/30`) with `★ HIGHLY LIKELY` text.
  - **Likely**: Amber/Gold tint (`bg-amber-500/10 text-amber-400 border border-amber-500/30`) with `◆ LIKELY` text.
  - **Possible**: Cyan/Sky tint (`bg-sky-500/10 text-sky-400 border border-sky-500/30`) with `○ POSSIBLE` text.
- **Typography**: Display typography in `Plus Jakarta Sans` / `Clash Display`, with monospace tabular numerals for marks and timer, and formatted LaTeX-style formula blocks for calculations.

---

### 3. Key Product Decisions & Trade-Offs

- **Hierarchical Examiner Prompting vs Standard Quiz Generator**:
  - *Chosen Approach*: Dedicated backend endpoint `/api/ai/likely-questions` using `gemini-3.8-flash` with examiner role instructions, syllabus frequency weighting, and strict schema validation for likelihood tiers, marks, rubric points, and calculation steps.
  - *Why*: Standard quizzes emphasize basic recall, while real exam papers emphasize synthesis, mark weighting, distractor plausibility, and structured step-by-step grading rubrics.
- **Client Persistence in StudyContext**:
  - *Chosen Approach*: Persist generated papers into user-scoped local storage and Firestore with unique IDs so students can revisit past exam papers without re-generating them.
  - *Why*: Generating 20–50 complex examiner questions involves token usage; caching and persistence ensures instant load and offline revision.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App Navigation (App.tsx)                        │
│   Dashboard  |  PDF Summariser  |  Exam Likely Questions  |  AI Quiz   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ activeTab = 'likely-questions'
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   ExamLikelyQuestionsPage.tsx                          │
│  ┌─────────────────────────┐  ┌──────────────────────────────────────┐ │
│  │ Document Selector       │  │ Generation Controls (10 / 20 / 50)   │ │
│  │ & Syllabus Topic Filter │  │ Button: Generate Likely Questions    │ │
│  └─────────────────────────┘  └──────────────────────────────────────┘ │
│                                                                        │
│  Mode Switcher: [ Study Revision View ]   [ Timed Practice Mock View ] │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Question Cards Grid (Filter by: Highly Likely | Likely | Type)  │  │
│  │  - Probability Tier (Highly Likely / Likely / Possible)           │  │
│  │  - Allocated Marks (e.g., 2, 5, 10, 20 marks)                    │  │
│  │  - Model Answer & Examiner Scheme Dropdown                       │  │
│  │  - Step-by-Step Calculation Rubric                               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  Export Toolbar: [ Print Clean PDF Paper ]  [ Copy Clean Markdown ]   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ POST /api/ai/likely-questions
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Backend Engine (server.ts)                           │
│  - System Prompt: Expert University Examiner & Moderator               │
│  - Chunked Document Analysis & Concept Recurrence Frequency            │
│  - Structured JSON Response with Likelihood, Marks & Marking Rubric    │
└────────────────────────────────────────────────────────────────────────┘
```

#### Data Model (`src/types/index.ts`)
```typescript
export type LikelihoodTier = 'Highly Likely' | 'Likely' | 'Possible';
export type ExamQuestionType = 'multiple_choice' | 'short_answer' | 'theory' | 'calculation';

export interface ExamLikelyQuestion {
  id: string;
  questionNumber: number;
  question: string;
  type: ExamQuestionType;
  options?: string[]; // For MCQ
  correctAnswer: string;
  marks: number;
  likelihood: LikelihoodTier;
  likelihoodReasoning: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  examinerTips: string;
  rubric: string[];
  stepByStepSolution?: string[];
}

export interface ExamPaperItem {
  id: string;
  docId?: string;
  docTitle: string;
  title: string;
  createdAt: string;
  totalQuestions: number;
  totalMarks: number;
  questions: ExamLikelyQuestion[];
  instructions?: string;
}
```

#### API Specification (`server.ts`)
- **Endpoint**: `POST /api/ai/likely-questions`
- **Request Body**:
  - `content`: string (document text)
  - `fileBase64`: string (optional PDF)
  - `title`: string
  - `numQuestions`: 10 | 20 | 50
  - `targetLevel`: 'Undergraduate' | 'Secondary' | 'Postgraduate'
- **Response**: JSON conforming to `ExamPaperItem` with balanced distributions, deduplicated questions, and examiner rubrics.
