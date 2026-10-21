export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  name: string;
  surname: string;
  university: string;
  matricNo: string;
  department: string;
  totalDocuments: number;
  totalSummaries: number;
  totalQuizzes: number;
  averageScore: number;
  flashcardsReviewed: number;
  studySessions: number;
  dailyGoalMinutes: number;
  weeklyGoalQuizzes: number;
  createdAt?: string;
  currentStreak: number;
  streakFreezes: number;
  lastFreezeAwardedAt: number;
  lastStudyDate: string; // ISO date
}

export interface DocumentItem {
  id: string;
  name: string;
  size: number;
  pageCount?: number;
  uploadedAt: string;
  extractedText: string;
  fileType: string;
  fileBase64?: string;
}

export interface ChapterSummary {
  sectionHeading: string;
  mainIdea: string;
  keyPoints: string[];
  examples: string[];
  conclusion: string;
}

export interface DefinitionItem {
  term: string;
  definition: string;
  pageRef?: string;
}

export interface FormulaItem {
  formula: string;
  description: string;
  variables: string;
  units: string;
}

export interface DateOrFactItem {
  dateOrFact: string;
  personOrTopic: string;
  significance: string;
}

export interface SolvedProblemItem {
  problemTitle: string;
  topic?: string;
  problemStatement: string;
  givenData?: string;
  formula?: string;
  stepByStepSolution: string[];
  finalAnswer: string;
  explanation?: string;
}

export interface SummaryData {
  id: string;
  docId: string;
  title: string;
  subject?: string;
  pageCount?: number;
  overview: string;
  executiveSummary: string;
  chapters: ChapterSummary[];
  keyPoints: string[];
  definitions: DefinitionItem[];
  formulas: FormulaItem[];
  datesAndFacts: DateOrFactItem[];
  solvedCalculations?: SolvedProblemItem[];
  keyTakeaways: string[];
  revisionChecklist: string[];
  summaryLength: string;
  summaryStyle: string;
  targetLevel: string;
  createdAt: string;
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_in_blank' | 'short_answer';

export interface QuizQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
  explanation: string;
  pageRef?: string;
  topic?: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface QuizItem {
  id: string;
  docId?: string;
  title: string;
  difficulty: string;
  totalQuestions: number;
  score?: number;
  completed: boolean;
  createdAt: string;
  questions: QuizQuestion[];
  focusArea?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  category?: string;
  interval: number; // in days
  repetition: number;
  easeFactor: number; // SuperMemo SM-2 default 2.5
  dueDate: string; // ISO date string
  state: 'new' | 'learning' | 'review' | 'mastered';
  lastReviewed?: string;
}

export interface FlashcardDeck {
  id: string;
  docId?: string;
  title: string;
  topic: string;
  cards: Flashcard[];
  totalCards: number;
  cardsLearned: number;
  lastStudied?: string;
  createdAt: string;
}

export interface PracticeTestQuestion {
  id: string;
  number: number;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options: string[];
  correctAnswer: string;
  explanation: string;
  weight: number;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface PracticeTestItem {
  id: string;
  docId?: string;
  title: string;
  subject: string;
  durationMinutes: number;
  passingScore: number;
  instructions: string;
  questions: PracticeTestQuestion[];
  completed: boolean;
  score?: number;
  passed?: boolean;
  timeSpentSeconds?: number;
  completedAt?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  docId?: string;
  docTitle?: string;
  citations?: string[];
  isGroundedInDocument?: boolean;
  suggestedFollowUps?: string[];
}

export interface PlannerTask {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  durationMinutes: number;
  priority: 'High' | 'Medium' | 'Low';
  actionType: 'Summarise' | 'Revise Flashcards' | 'Practice Test' | 'Deep Reading';
  tips?: string;
  completed: boolean;
}

export interface StudyGroupMember {
  uid: string;
  displayName: string;
  email: string;
  role: 'creator' | 'collaborator' | 'viewer';
  canEdit: boolean; // toggle by creator
  joinedAt: string;
}

export interface SharedStudyItem {
  id: string;
  type: 'summary' | 'quiz' | 'flashcard_deck';
  title: string;
  data: any;
  sharedBy: string;
  sharedAt: string;
}

export interface StudyGroupMessage {
  id: string;
  senderId: string;
  senderName: string;
  type: 'text' | 'file' | 'voice';
  content: string;
  fileUrl?: string;
  fileName?: string;
  audioUrl?: string;
  timestamp: string;
}

export interface GroupJoinRequest {
  uid: string;
  displayName: string;
  email: string;
  requestedAt: string;
}

export interface StudyGroupItem {
  id: string;
  name: string;
  description: string;
  subject: string;
  inviteCode: string;
  createdBy: string;
  isDeactivated?: boolean;
  pendingRequests?: GroupJoinRequest[];
  members: StudyGroupMember[];
  sharedItems: SharedStudyItem[];
  messages?: StudyGroupMessage[];
  createdAt: string;
}

export interface DailyActivityStat {
  date: string;
  notesCreated: number;
  quizzesTaken: number;
  studyHours: number;
}

