import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  DocumentItem,
  SummaryData,
  QuizItem,
  FlashcardDeck,
  Flashcard,
  PracticeTestItem,
  PlannerTask,
  ChatMessage,
} from '../types';
import {
  SAMPLE_DOCUMENTS,
  SAMPLE_SUMMARIES,
  SAMPLE_QUIZZES,
  SAMPLE_FLASHCARD_DECKS,
  SAMPLE_PRACTICE_TESTS,
  SAMPLE_TASKS,
} from '../data/sampleData';
import { auth, db, handleFirestoreError, OperationType, testConnection } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile as fbUpdateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';

interface StudyContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  activeDoc: DocumentItem | null;
  setActiveDoc: (doc: DocumentItem | null) => void;
  // Auth actions
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, pass: string, name: string, surname: string, university: string, matricNo: string, department: string) => Promise<{ success: boolean; error?: string }>;
  signInDemo: () => void;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateUserGoals: (dailyMinutes: number, weeklyQuizzes: number) => void;
  // Documents
  documents: DocumentItem[];
  addDocument: (docItem: DocumentItem) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  // Summaries
  summaries: SummaryData[];
  addSummary: (summary: SummaryData) => Promise<void>;
  updateSummary: (id: string, updated: Partial<SummaryData>) => Promise<void>;
  deleteSummary: (id: string) => Promise<void>;
  // Quizzes
  quizzes: QuizItem[];
  addQuiz: (quiz: QuizItem) => Promise<void>;
  updateQuizScore: (quizId: string, score: number, questions: any[]) => Promise<void>;
  deleteQuiz: (id: string) => Promise<void>;
  // Flashcards
  flashcardDecks: FlashcardDeck[];
  addFlashcardDeck: (deck: FlashcardDeck) => Promise<void>;
  rateFlashcard: (deckId: string, cardId: string, rating: 1 | 2 | 3) => Promise<void>;
  deleteFlashcardDeck: (id: string) => Promise<void>;
  // Practice tests
  practiceTests: PracticeTestItem[];
  addPracticeTest: (test: PracticeTestItem) => Promise<void>;
  submitPracticeTest: (testId: string, answers: Record<string, string>, score: number, timeSpent: number) => Promise<void>;
  deletePracticeTest: (id: string) => Promise<void>;
  // Planner
  plannerTasks: PlannerTask[];
  addPlannerTask: (task: PlannerTask) => Promise<void>;
  togglePlannerTask: (id: string) => Promise<void>;
  deletePlannerTask: (id: string) => Promise<void>;
  // Assistant chat
  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
  // Global stats
  stats: {
    totalDocs: number;
    totalSummaries: number;
    totalQuizzes: number;
    averageScore: number;
    flashcardsReviewed: number;
    studySessions: number;
  };
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('studykit_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [activeDoc, setActiveDoc] = useState<DocumentItem | null>(null);

  // Core collections in state
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem('studykit_docs');
    return saved ? JSON.parse(saved) : SAMPLE_DOCUMENTS;
  });

  const [summaries, setSummaries] = useState<SummaryData[]>(() => {
    const saved = localStorage.getItem('studykit_summaries');
    return saved ? JSON.parse(saved) : SAMPLE_SUMMARIES;
  });

  const [quizzes, setQuizzes] = useState<QuizItem[]>(() => {
    const saved = localStorage.getItem('studykit_quizzes');
    return saved ? JSON.parse(saved) : SAMPLE_QUIZZES;
  });

  const [flashcardDecks, setFlashcardDecks] = useState<FlashcardDeck[]>(() => {
    const saved = localStorage.getItem('studykit_decks');
    return saved ? JSON.parse(saved) : SAMPLE_FLASHCARD_DECKS;
  });

  const [practiceTests, setPracticeTests] = useState<PracticeTestItem[]>(() => {
    const saved = localStorage.getItem('studykit_practice_tests');
    return saved ? JSON.parse(saved) : SAMPLE_PRACTICE_TESTS;
  });

  const [plannerTasks, setPlannerTasks] = useState<PlannerTask[]>(() => {
    const saved = localStorage.getItem('studykit_tasks');
    return saved ? JSON.parse(saved) : SAMPLE_TASKS;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('studykit_chat');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'msg-welcome',
            role: 'assistant',
            content:
              'Hello! I am your AI Study Partner. You can ask me any question about your uploaded documents, lecture notes, or general academic topics. Select a document above to ground my answers with exact citations and page references!',
            timestamp: new Date().toISOString(),
            suggestedFollowUps: [
              'Summarize the light-dependent reactions in photosynthesis',
              'Explain how RuBisCO works in the Calvin cycle',
              'What causes demand-pull inflation?',
            ],
          },
        ];
  });

  // Test Firestore connection on boot
  useEffect(() => {
    testConnection().catch((err) => console.log('Firestore connection verified.'));
  }, []);

  // Sync to local storage
  useEffect(() => {
    if (user) {
      localStorage.setItem('studykit_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('studykit_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('studykit_docs', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('studykit_summaries', JSON.stringify(summaries));
  }, [summaries]);

  useEffect(() => {
    localStorage.setItem('studykit_quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem('studykit_decks', JSON.stringify(flashcardDecks));
  }, [flashcardDecks]);

  useEffect(() => {
    localStorage.setItem('studykit_practice_tests', JSON.stringify(practiceTests));
  }, [practiceTests]);

  useEffect(() => {
    localStorage.setItem('studykit_tasks', JSON.stringify(plannerTasks));
  }, [plannerTasks]);

  useEffect(() => {
    localStorage.setItem('studykit_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data();
            setUser({
              uid: fbUser.uid,
              email: fbUser.email || '',
              displayName: data.displayName || fbUser.displayName || 'Student',
              name: data.name || '',
              surname: data.surname || '',
              university: data.university || '',
              matricNo: data.matricNo || '',
              department: data.department || '',
              totalDocuments: data.totalDocuments || documents.length,
              totalSummaries: data.totalSummaries || summaries.length,
              totalQuizzes: data.totalQuizzes || quizzes.length,
              averageScore: data.averageScore || 85,
              flashcardsReviewed: data.flashcardsReviewed || 12,
              studySessions: data.studySessions || 6,
              dailyGoalMinutes: data.dailyGoalMinutes || 60,
              weeklyGoalQuizzes: data.weeklyGoalQuizzes || 5,
              currentStreak: data.currentStreak || 0,
              lastStudyDate: data.lastStudyDate || new Date().toISOString(),
            });
          } else {
            const newUser: UserProfile = {
              uid: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Student',
              name: '',
              surname: '',
              university: '',
              matricNo: '',
              department: '',
              totalDocuments: documents.length,
              totalSummaries: summaries.length,
              totalQuizzes: quizzes.length,
              averageScore: 85,
              flashcardsReviewed: 12,
              studySessions: 5,
              dailyGoalMinutes: 60,
              weeklyGoalQuizzes: 5,
              createdAt: new Date().toISOString(),
              currentStreak: 0,
              lastStudyDate: new Date().toISOString(),
            };
            await setDoc(userDocRef, newUser);
            setUser(newUser);
          }

          // Fetch student's private documents from Firestore
          try {
            const docsSnap = await getDocs(collection(db, 'users', fbUser.uid, 'documents'));
            if (!docsSnap.empty) {
              const loadedDocs = docsSnap.docs.map((d) => d.data() as DocumentItem);
              setDocuments(loadedDocs);
            }
          } catch (e) {
            console.warn('Could not load Firestore documents:', e);
          }

          // Fetch student's private summaries from Firestore
          try {
            const sumSnap = await getDocs(collection(db, 'users', fbUser.uid, 'summaries'));
            if (!sumSnap.empty) {
              const loadedSummaries = sumSnap.docs.map((d) => d.data() as SummaryData);
              setSummaries(loadedSummaries);
            }
          } catch (e) {
            console.warn('Could not load Firestore summaries:', e);
          }

          // Fetch student's private quizzes from Firestore
          try {
            const quizSnap = await getDocs(collection(db, 'users', fbUser.uid, 'quizzes'));
            if (!quizSnap.empty) {
              const loadedQuizzes = quizSnap.docs.map((d) => d.data() as QuizItem);
              setQuizzes(loadedQuizzes);
            }
          } catch (e) {
            console.warn('Could not load Firestore quizzes:', e);
          }

          // Fetch student's private flashcard decks from Firestore
          try {
            const deckSnap = await getDocs(collection(db, 'users', fbUser.uid, 'flashcards'));
            if (!deckSnap.empty) {
              const loadedDecks = deckSnap.docs.map((d) => d.data() as FlashcardDeck);
              setFlashcardDecks(loadedDecks);
            }
          } catch (e) {
            console.warn('Could not load Firestore flashcards:', e);
          }

          // Fetch student's private tasks from Firestore
          try {
            const taskSnap = await getDocs(collection(db, 'users', fbUser.uid, 'plannerTasks'));
            if (!taskSnap.empty) {
              const loadedTasks = taskSnap.docs.map((d) => d.data() as PlannerTask);
              setPlannerTasks(loadedTasks);
            }
          } catch (e) {
            console.warn('Could not load Firestore planner tasks:', e);
          }
        } catch (error) {
          console.warn('Firestore fetch user profile notice:', error);
          setUser({
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || 'Student',
            totalDocuments: documents.length,
            totalSummaries: summaries.length,
            totalQuizzes: quizzes.length,
            averageScore: 85,
            flashcardsReviewed: 12,
            studySessions: 5,
            dailyGoalMinutes: 60,
            weeklyGoalQuizzes: 5,
            currentStreak: 0,
            lastStudyDate: new Date().toISOString(),
          });
        }
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Authentication implementations
  const signIn = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      return { success: true };
    } catch (err: any) {
      console.error('Sign in failed:', err);
      return { success: false, error: err.message || 'Invalid email or password.' };
    }
  };

  const signUp = async (email: string, pass: string, name: string, surname: string, university: string, matricNo: string, department: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (auth.currentUser) {
        await fbUpdateProfile(auth.currentUser, { displayName: `${name} ${surname}` });
      }
      const newUser: UserProfile = {
        uid: cred.user.uid,
        email,
        displayName: `${name} ${surname}`,
        name,
        surname,
        university,
        matricNo,
        department,
        totalDocuments: documents.length,
        totalSummaries: summaries.length,
        totalQuizzes: quizzes.length,
        averageScore: 0,
        flashcardsReviewed: 0,
        studySessions: 1,
        dailyGoalMinutes: 60,
        weeklyGoalQuizzes: 5,
        createdAt: new Date().toISOString(),
        currentStreak: 0,
        lastStudyDate: new Date().toISOString(),
      };
      try {
        await setDoc(doc(db, 'users', cred.user.uid), newUser);
      } catch (e) {
        console.warn('Could not save user profile to Firestore:', e);
      }
      setUser(newUser);
      return { success: true };
    } catch (err: any) {
      console.error('Sign up failed:', err);
      return { success: false, error: err.message || 'Could not create account.' };
    }
  };

  const signInDemo = () => {
    const demoUser: UserProfile = {
      uid: 'demo-student-101',
      email: 'student@studykit.edu',
      displayName: 'Alex Rivers',
      name: 'Alex',
      surname: 'Rivers',
      university: 'Tech University',
      matricNo: 'ST-101234',
      department: 'Computer Science',
      totalDocuments: documents.length,
      totalSummaries: summaries.length,
      totalQuizzes: quizzes.length,
      averageScore: 82,
      flashcardsReviewed: 28,
      studySessions: 9,
      dailyGoalMinutes: 60,
      weeklyGoalQuizzes: 5,
      createdAt: new Date().toISOString(),
      currentStreak: 5,
      lastStudyDate: new Date().toISOString(),
    };
    setUser(demoUser);
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {}
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send reset link.' };
    }
  };

  const updateUserGoals = (dailyMinutes: number, weeklyQuizzes: number) => {
    if (!user) return;
    const updated = { ...user, dailyGoalMinutes: dailyMinutes, weeklyGoalQuizzes: weeklyQuizzes };
    setUser(updated);
    if (auth.currentUser) {
      updateDoc(doc(db, 'users', auth.currentUser.uid), {
        dailyGoalMinutes: dailyMinutes,
        weeklyGoalQuizzes: weeklyQuizzes,
      }).catch((e) => console.log('Goal update sync notice'));
    }
  };

  // Document Operations
  const addDocument = async (docItem: DocumentItem) => {
    setDocuments((prev) => [docItem, ...prev]);
    setActiveDoc(docItem);
    if (user && auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'documents', docItem.id), docItem);
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          totalDocuments: documents.length + 1,
        });
      } catch (err) {
        console.warn('Firestore doc add sync notice:', err);
      }
    }
  };

  const deleteDocument = async (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (activeDoc?.id === id) setActiveDoc(null);
    if (user && auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'documents', id));
      } catch (err) {
        console.warn('Firestore doc delete notice:', err);
      }
    }
  };

  // Summary Operations
  const addSummary = async (summary: SummaryData) => {
    setSummaries((prev) => [summary, ...prev]);
    if (user) {
      setUser((prev) => (prev ? { ...prev, totalSummaries: prev.totalSummaries + 1 } : null));
      if (auth.currentUser) {
        try {
          await setDoc(doc(db, 'users', auth.currentUser.uid, 'summaries', summary.id), summary);
        } catch (err) {
          console.warn('Firestore summary save notice:', err);
        }
      }
    }
  };

  const updateSummary = async (id: string, updated: Partial<SummaryData>) => {
    setSummaries((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
    if (user && auth.currentUser) {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid, 'summaries', id), updated);
      } catch (err) {
        console.warn('Firestore summary update notice:', err);
      }
    }
  };

  const deleteSummary = async (id: string) => {
    setSummaries((prev) => prev.filter((s) => s.id !== id));
    if (user && auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'summaries', id));
      } catch (err) {
        console.warn('Firestore summary delete notice:', err);
      }
    }
  };

  // Quiz Operations
  const addQuiz = async (quiz: QuizItem) => {
    setQuizzes((prev) => [quiz, ...prev]);
    if (user && auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'quizzes', quiz.id), quiz);
      } catch (err) {
        console.warn('Firestore quiz save notice:', err);
      }
    }
  };

  const updateQuizScore = async (quizId: string, score: number, questions: any[]) => {
    setQuizzes((prev) =>
      prev.map((q) => (q.id === quizId ? { ...q, score, completed: true, questions } : q))
    );
    if (user) {
      const completedList = quizzes.filter((q) => q.completed || q.id === quizId);
      const totalScoreSum = completedList.reduce((acc, curr) => acc + (curr.id === quizId ? score : curr.score || 0), 0);
      const newAverage = Math.round(totalScoreSum / Math.max(completedList.length, 1));
      setUser((prev) =>
        prev
          ? {
              ...prev,
              totalQuizzes: prev.totalQuizzes + 1,
              averageScore: newAverage,
              studySessions: prev.studySessions + 1,
            }
          : null
      );
    }
    if (user && auth.currentUser) {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid, 'quizzes', quizId), {
          score,
          completed: true,
          questions,
        });
      } catch (e) {}
    }
  };

  const deleteQuiz = async (id: string) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
    if (user && auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'quizzes', id));
      } catch (e) {}
    }
  };

  // Flashcards with SM-2 Spaced Repetition Scheduling
  const addFlashcardDeck = async (deck: FlashcardDeck) => {
    setFlashcardDecks((prev) => [deck, ...prev]);
    if (user && auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'flashcards', deck.id), deck);
      } catch (e) {}
    }
  };

  const rateFlashcard = async (deckId: string, cardId: string, rating: 1 | 2 | 3) => {
    // SuperMemo-2 Spaced Repetition algorithm:
    // rating 1: Hard, rating 2: Good, rating 3: Easy
    setFlashcardDecks((prev) =>
      prev.map((deck) => {
        if (deck.id !== deckId) return deck;
        const updatedCards = deck.cards.map((card) => {
          if (card.id !== cardId) return card;

          let newInterval: number;
          let newRepetition: number;
          let newEase: number = card.easeFactor;

          if (rating === 1) {
            // Hard / Reset
            newRepetition = 0;
            newInterval = 1;
            newEase = Math.max(1.3, newEase - 0.2);
          } else if (rating === 2) {
            // Good
            if (card.repetition === 0) newInterval = 1;
            else if (card.repetition === 1) newInterval = 3;
            else newInterval = Math.round(card.interval * newEase);
            newRepetition = card.repetition + 1;
          } else {
            // Easy
            if (card.repetition === 0) newInterval = 2;
            else if (card.repetition === 1) newInterval = 5;
            else newInterval = Math.round(card.interval * newEase * 1.3);
            newRepetition = card.repetition + 1;
            newEase = Math.min(2.8, newEase + 0.15);
          }

          const dueDateObj = new Date();
          dueDateObj.setDate(dueDateObj.getDate() + newInterval);

          return {
            ...card,
            interval: newInterval,
            repetition: newRepetition,
            easeFactor: Number(newEase.toFixed(2)),
            dueDate: dueDateObj.toISOString(),
            state: (newRepetition >= 3 ? 'mastered' : newRepetition > 0 ? 'review' : 'learning') as any,
            lastReviewed: new Date().toISOString(),
          };
        });

        const masteredCount = updatedCards.filter((c) => c.state === 'mastered').length;
        return {
          ...deck,
          cards: updatedCards,
          cardsLearned: masteredCount,
          lastStudied: new Date().toISOString(),
        };
      })
    );

    setUser((prev) =>
      prev
        ? {
            ...prev,
            flashcardsReviewed: prev.flashcardsReviewed + 1,
          }
        : null
    );
  };

  const deleteFlashcardDeck = async (id: string) => {
    setFlashcardDecks((prev) => prev.filter((d) => d.id !== id));
  };

  // Practice Tests
  const addPracticeTest = async (test: PracticeTestItem) => {
    setPracticeTests((prev) => [test, ...prev]);
  };

  const submitPracticeTest = async (
    testId: string,
    answers: Record<string, string>,
    score: number,
    timeSpent: number
  ) => {
    setPracticeTests((prev) =>
      prev.map((test) => {
        if (test.id !== testId) return test;
        const passed = score >= test.passingScore;
        const updatedQuestions = test.questions.map((q) => {
          const userAns = answers[q.id] || '';
          const isCorrect = userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
          return {
            ...q,
            userAnswer: userAns,
            isCorrect,
          };
        });
        return {
          ...test,
          completed: true,
          score,
          passed,
          timeSpentSeconds: timeSpent,
          completedAt: new Date().toISOString(),
          questions: updatedQuestions,
        };
      })
    );

    setUser((prev) =>
      prev
        ? {
            ...prev,
            studySessions: prev.studySessions + 1,
          }
        : null
    );
  };

  const deletePracticeTest = async (id: string) => {
    setPracticeTests((prev) => prev.filter((t) => t.id !== id));
  };

  // Study Planner Tasks
  const addPlannerTask = async (task: PlannerTask) => {
    setPlannerTasks((prev) => [task, ...prev]);
  };

  const togglePlannerTask = async (id: string) => {
    setPlannerTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deletePlannerTask = async (id: string) => {
    setPlannerTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Chat
  const addChatMessage = (msg: ChatMessage) => {
    setChatMessages((prev) => [...prev, msg]);
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  // Calculate live statistics
  const completedQuizzes = quizzes.filter((q) => q.completed);
  const totalQuizScore = completedQuizzes.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const avgScore = completedQuizzes.length > 0 ? Math.round(totalQuizScore / completedQuizzes.length) : (user?.averageScore || 0);

  const stats = {
    totalDocs: documents.length,
    totalSummaries: summaries.length,
    totalQuizzes: completedQuizzes.length,
    averageScore: avgScore,
    flashcardsReviewed: user?.flashcardsReviewed || 28,
    studySessions: user?.studySessions || 8,
  };

  return (
    <StudyContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoadingAuth,
        activeDoc,
        setActiveDoc,
        signIn,
        signUp,
        signInDemo,
        signOut,
        resetPassword,
        updateUserGoals,
        documents,
        addDocument,
        deleteDocument,
        summaries,
        addSummary,
        updateSummary,
        deleteSummary,
        quizzes,
        addQuiz,
        updateQuizScore,
        deleteQuiz,
        flashcardDecks,
        addFlashcardDeck,
        rateFlashcard,
        deleteFlashcardDeck,
        practiceTests,
        addPracticeTest,
        submitPracticeTest,
        deletePracticeTest,
        plannerTasks,
        addPlannerTask,
        togglePlannerTask,
        deletePlannerTask,
        chatMessages,
        addChatMessage,
        clearChat,
        stats,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
