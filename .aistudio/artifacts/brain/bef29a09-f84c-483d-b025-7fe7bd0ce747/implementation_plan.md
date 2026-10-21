# Study Kit Comprehensive System Upgrade & STEM Intelligence Plan

A full-stack enhancement tackling data security isolation upon logout, study group member request management, accessible shared study materials, voice recording studio UI, landing page animations, reliable non-reloading PDF uploads with numeric percentage counters, and high-precision STEM calculative reasoning for AI Quiz generation and PDF summarization.

## User Review & Critical Decisions

> [!IMPORTANT]
> This plan synthesizes all 12 requested deliverables into a cohesive architecture without breaking existing streak or leaderboard functionality:
> 1. **Complete Data Isolation on Logout**: In-memory state and sensitive cache keys are wiped immediately on logout, while user-specific Firestore data re-hydrates seamlessly upon login.
> 2. **Study Group Member Approval Panel**: Group creators receive a dedicated "Join Requests" management tab with Approve & Decline actions.
> 3. **Shared Study Group Materials Accessibility**: Group members can open, inspect, and copy shared summaries, quizzes, and decks directly into their personal library.
> 4. **Modern Voice Recording Studio UI**: Live animated audio waveform visualizer, recording timer, pause/resume, and playback preview.
> 5. **Hero & Landing Page Animations**: High-performance entrance reveals, floating badge micro-animations, and interactive preview card dynamics.
> 6. **PDF Upload & AI Generation Progress Readouts**: Numeric percentage counters (`Uploading... 45%`, `Generating quiz... 90%`) with resilient, non-refreshing event handlers.
> 7. **STEM Calculative Intelligence**: Mathematical problem-solving, LaTeX formula formatting, step-by-step calculations, and non-repetitive quiz question generation for Math, Physics, Chemistry, and Engineering subjects.

---

## 1. Overview & Core Concept

- **User Data Isolation**: Guarantees that when any student logs out, all personal documents, summaries, quizzes, flashcards, practice tests, and planner tasks are completely cleared from memory and the DOM, remaining securely stored in Firestore and isolated under the user's specific account UID.
- **Study Group Collaboration**: Empowers group creators with full applicant management (viewing pending requests, approving or declining members) and enables all approved members to preview, study, and import materials shared to the group.
- **STEM & Calculative Mastery**: Transforms the Gemini summarizer and quiz engine from generic prose into an advanced STEM tutor capable of breaking down numerical exercises, balancing chemical reactions, deriving physics equations, and generating non-repetitive, high-rigor problem sets.

---

## 2. User Experience & Visual Design

### A. Study Group Creator Request Management
- Group creators see a third tab in their active group: `Join Requests ({count})`.
- Displays pending applicant cards with display name, university/email, request timestamp, and two high-contrast action buttons:
  - **Approve**: Immediately grants member status with `collaborator` permissions and adds them to group chat.
  - **Decline**: Cleanly removes the request without granting access.
- When non-members enter a join code, the UI clearly shows `Request Pending Creator Approval` until accepted.

### B. Shared Materials Access & Preview Modal
- Every shared item card in `Shared Materials` gets an **"Open & Study Material"** primary button.
- Clicking opens a high-fidelity modal viewer allowing members to:
  1. Read the full executive summary, chapter breakdowns, definitions, and formulas.
  2. Take the shared quiz with interactive answer checking.
  3. Review the shared flashcard deck with flip animations.
  4. One-click **"Save to My Library"** to copy the material to their private collection.

### C. Voice Recording Studio UI
- Replaces the basic red box with a polished Audio Recording Studio:
  - Multi-bar animated waveform visualizer responding to recording state.
  - Digital elapsed timer (`00:14 / 05:00`).
  - Tactile control dock: `Pause / Resume`, `Discard`, and `Send Voice Note`.
  - Audio preview player before sending, with clean playback scrubber.

### D. Landing Page Motion & Atmosphere
- Hero Section: Staggered entrance typography with subtle warm amber glow.
- Feature Grid: Staggered card reveals with hover-lift micro-interactions and border luminescence.
- Process Flow (01 to 04): Progressive line highlight tracking the steps.
- Interactive Study Kit Showcase: Live interactive preview of a generated summary and quiz question.

### E. Resilient PDF Upload & Generation Percentage Displays
- Fixes file input event bubbling and form submit defaults that previously caused unexpected browser refreshes.
- Real-time numerical progress bar:
  - `Uploading document... 25%`
  - `Extracting & parsing text... 55%`
  - `Analyzing chapter structures... 85%`
  - `Ready to study! 100%`
- Quiz Generator Progress:
  - `Scanning document text... 20%`
  - `Formulating calculative & conceptual questions... 60%`
  - `Generating step-by-step explanations... 90%`
  - `Quiz ready! 100%`

### F. STEM & Calculative Formatting
- **Formulas & Math Notation**: Clear monospace and formatted mathematical expressions ($E = mc^2$, $\Delta x = v_0 t + \frac{1}{2} a t^2$, chemical reaction equations).
- **Calculations Tab in Summarizer**: Detailed "Solved Exercises & Problems" section with:
  - *Problem Statement*
  - *Given Parameters & Units*
  - *Step-by-Step Derivation / Substitution*
  - *Final Answer highlighted with proper SI units*
- **STEM Quiz Questions**: Applied numerical questions with plausible calculation distractors and full worked solutions in the explanation field.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Explicit Scoped In-Memory Tear-Down on SignOut**:
  - *Chosen Approach*: `signOut()` synchronously empties React state (`documents: []`, `summaries: []`, `quizzes: []`, etc.) and deletes active session storage keys (`studykit_active_uid`).
  - *Why*: Prevents browser memory leaks and guarantees that an unauthenticated viewer or a subsequent user never sees previous session documents.
- **Decision 2: In-Memory / Firestore Group Request Architecture**:
  - *Chosen Approach*: Store `pendingRequests: GroupJoinRequest[]` inside group document schema, updated via atomic array operations.
  - *Why*: Allows creators to approve/decline without complex backend migrations, keeping collaboration instant and responsive.
- **Decision 3: Non-Repetition Stem Hashing for AI Quiz Generator**:
  - *Chosen Approach*: Implement a 2-tier deduplication check (Jaccard word stem overlap + target answer uniqueness) in `server.ts`, with explicit system prompt instructions forbidding repetitive templates.
  - *Why*: Guarantees that quizzes with 5, 10, or 20 questions cover distinct sections of the PDF rather than asking the same definition with different wording.

---

## 4. Technical Architecture & Data Strategy

### Component & System Interaction

```
┌────────────────────────────────────────────────────────┐
│                        App.tsx                         │
│  - Guard authenticated views: if !isAuthenticated,    │
│    force public view (zero private data in DOM)        │
│  ┌──────────────────────────────────────────────────┐  │
│  │                  StudyProvider                   │  │
│  │  - User data loaded ONLY for active uid          │  │
│  │  - signOut() resets all state to []              │  │
│  │  - Study group request handlers (approve/decline)│  │
│  └──────────────────────────────────────────────────┘  │
│  ┌────────────────────────┬─────────────────────────┐  │
│  │    StudyGroupsPage     │   DocumentUploadModal   │  │
│  │  - Requests Tab        │  - Progress counter     │  │
│  │  - Material Viewer     │  - Non-refreshing drop  │  │
│  │  - Waveform Voice Dock │  - Browser PDF parse    │  │
│  └────────────────────────┴─────────────────────────┘  │
│  ┌────────────────────────┬─────────────────────────┐  │
│  │      LandingPage       │        server.ts        │  │
│  │  - Hero motion reveal  │  - /api/ai/quiz (STEM)  │  │
│  │  - Feature hover lift  │  - /api/ai/summarize    │  │
│  │  - Step sequence line  │    (Calculative Solved) │  │
│  └────────────────────────┴─────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### Data Model Additions

```typescript
// Study Group Join Request
interface GroupJoinRequest {
  uid: string;
  displayName: string;
  email: string;
  university?: string;
  requestedAt: string;
}

// STEM Solved Problem Definition
interface SolvedProblemItem {
  problemTitle: string;
  topic: string;
  problemStatement: string;
  givenData: string;
  formula: string;
  stepByStepSolution: string[];
  finalAnswer: string;
  explanation: string;
}
```
