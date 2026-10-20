# Implementation Plan - Production Data Clear & Dashboard Animations

## Scope & User Choices
Based on your confirmation:
1. **Clear Seed Documents & Study Data**:
   - Empty all default sample PDFs, summaries, quizzes, flashcard decks, and practice tests (`SAMPLE_DOCUMENTS`, `SAMPLE_SUMMARIES`, `SAMPLE_QUIZZES`, `SAMPLE_FLASHCARD_DECKS`, `SAMPLE_PRACTICE_TESTS`, `SAMPLE_TASKS` set to empty `[]`).
   - All newly registered users, visitors, and demo sessions will start with a completely clean, fresh workspace.
   - Clean, friendly empty-state prompts invite users to upload their own first document or create study kits.

2. **Dashboard Animation**:
   - **Subtle Stagger Fade-In**: Add cascading entrance animations (`fadeInUp` with 60ms stagger delays) across the dashboard welcome header, streak tracker, quick actions, analytics chart, and recent study materials.
   - **Gentle Hover Lift on Cards**: Add smooth `-3px` elevation and subtle glow transitions when hovering over quick action tiles, metric cards, and study items.

---

## Proposed Changes

### 1. Data Clearance (`src/data/sampleData.ts` & `src/context/StudyContext.tsx`)
- Reset sample arrays in `sampleData.ts`:
  - `SAMPLE_DOCUMENTS = []`
  - `SAMPLE_SUMMARIES = []`
  - `SAMPLE_QUIZZES = []`
  - `SAMPLE_FLASHCARD_DECKS = []`
  - `SAMPLE_PRACTICE_TESTS = []`
  - `SAMPLE_TASKS = []`
- In `StudyContext.tsx`, ensure default state initializes to clean empty collections if not already customized by the user.

### 2. Dashboard Animation Styles (`src/index.css`)
- Define smooth CSS keyframe `@keyframes fadeInUp`:
  - `from: { opacity: 0, transform: translateY(8px) }`
  - `to: { opacity: 1, transform: translateY(0) }`
- Create stagger classes: `.animate-stagger-1`, `.animate-stagger-2`, `.animate-stagger-3`, `.animate-stagger-4`, `.animate-stagger-5`.
- Create `.card-hover-lift` class for responsive `-3px` hover elevation.

### 3. Dashboard UI Enhancements (`src/pages/DashboardPage.tsx`)
- Apply stagger classes to each major section of the dashboard:
  - Welcome Banner & Header (`animate-stagger-1`)
  - Streak Activity Tracker (`animate-stagger-2`)
  - Quick Actions Grid (`animate-stagger-3`) with `.card-hover-lift` on action tiles
  - Study Goals & Metrics (`animate-stagger-4`) with `.card-hover-lift`
  - Recent Materials & Library Feed (`animate-stagger-5`) with polished empty state: "No documents uploaded yet. Upload a lecture PDF to generate your first summary!"

---

## Verification Plan
1. **Compilation Check**: Run `compile_applet` and `lint_applet` to confirm 0 build errors.
2. **Launch & Data Verification**:
   - Inspect Dashboard, Library, Summarizer, Quizzes, and Flashcards to confirm clean empty launch states.
   - Verify smooth stagger fade-in and hover lift effects on the Dashboard.
