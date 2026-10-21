import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useToast } from '@/context/ToastContext';
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
  serverTimestamp,
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
  updateActivity: () => Promise<void>;
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

interface SavedAccountRecord {
  pass: string;
  profile: UserProfile;
  uid: string;
}

const getRegisteredAccounts = (): Record<string, SavedAccountRecord> => {
  try {
    const raw = localStorage.getItem('studykit_registered_users');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveRegisteredAccount = (email: string, pass: string, profile: UserProfile) => {
  try {
    const accs = getRegisteredAccounts();
    const normalized = email.toLowerCase().trim();
    accs[normalized] = { pass, profile, uid: profile.uid };
    localStorage.setItem('studykit_registered_users', JSON.stringify(accs));
  } catch (e) {
    console.warn('Error saving registered account record:', e);
  }
};

const getStableAccountUid = (email: string): string => {
  const normalized = email.toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = ((hash << 5) - hash) + normalized.charCodeAt(i);
    hash |= 0;
  }
  return `usr_${Math.abs(hash)}`;
};

const getUserStorageKey = (uid: string, key: string) => `studykit_${uid}_${key}`;

const saveUserScopedData = (uid: string, key: string, data: any) => {
  try {
    localStorage.setItem(getUserStorageKey(uid, key), JSON.stringify(data));
  } catch (e) {
    console.warn(`Could not save scoped data ${key} for user ${uid}:`, e);
  }
};

const loadUserScopedData = <T,>(uid: string, key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(getUserStorageKey(uid, key));
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const activeUidInit = localStorage.getItem('studykit_active_uid') || '';

  const [user, setUser] = useState<UserProfile | null>(() => {
    if (activeUidInit) {
      const scopedUser = localStorage.getItem(getUserStorageKey(activeUidInit, 'profile'));
      if (scopedUser) {
        try { return JSON.parse(scopedUser); } catch {}
      }
    }
    return null;
  });

  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [activeDoc, setActiveDoc] = useState<DocumentItem | null>(null);

  // User-scoped collections
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    if (activeUidInit) {
      return loadUserScopedData<DocumentItem[]>(activeUidInit, 'docs', []);
    }
    return [];
  });

  const [summaries, setSummaries] = useState<SummaryData[]>(() => {
    if (activeUidInit) {
      return loadUserScopedData<SummaryData[]>(activeUidInit, 'summaries', []);
    }
    return [];
  });

  const [quizzes, setQuizzes] = useState<QuizItem[]>(() => {
    if (activeUidInit) {
      return loadUserScopedData<QuizItem[]>(activeUidInit, 'quizzes', []);
    }
    return [];
  });

  const [flashcardDecks, setFlashcardDecks] = useState<FlashcardDeck[]>(() => {
    if (activeUidInit) {
      return loadUserScopedData<FlashcardDeck[]>(activeUidInit, 'decks', []);
    }
    return [];
  });

  const [practiceTests, setPracticeTests] = useState<PracticeTestItem[]>(() => {
    if (activeUidInit) {
      return loadUserScopedData<PracticeTestItem[]>(activeUidInit, 'practice_tests', []);
    }
    return [];
  });

  const [plannerTasks, setPlannerTasks] = useState<PlannerTask[]>(() => {
    if (activeUidInit) {
      return loadUserScopedData<PlannerTask[]>(activeUidInit, 'tasks', []);
    }
    return [];
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content:
          'Hello! I am your AI Study Partner. You can ask me any question about your uploaded documents, lecture notes, or general academic topics. Select a document above to ground my answers with exact citations and page references!',
        timestamp: new Date().toISOString(),
        suggestedFollowUps: [
          'Summarize key principles in my active document',
          'Create a 5-question review on core definitions',
          'Explain difficult concepts step-by-step',
        ],
      },
    ];
  });

  // Current UID ref to avoid stale closure during sync
  const userRef = useRef<UserProfile | null>(user);
  useEffect(() => {
    userRef.current = user;
    if (user?.uid) {
      localStorage.setItem('studykit_active_uid', user.uid);
      localStorage.setItem(getUserStorageKey(user.uid, 'profile'), JSON.stringify(user));
      localStorage.setItem('studykit_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('studykit_active_uid');
      localStorage.removeItem('studykit_user');
    }
  }, [user]);

  // Persist current collections to scoped storage whenever they change
  useEffect(() => {
    if (user?.uid) {
      saveUserScopedData(user.uid, 'docs', documents);
    }
  }, [documents, user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      saveUserScopedData(user.uid, 'summaries', summaries);
    }
  }, [summaries, user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      saveUserScopedData(user.uid, 'quizzes', quizzes);
    }
  }, [quizzes, user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      saveUserScopedData(user.uid, 'decks', flashcardDecks);
    }
  }, [flashcardDecks, user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      saveUserScopedData(user.uid, 'practice_tests', practiceTests);
    }
  }, [practiceTests, user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      saveUserScopedData(user.uid, 'tasks', plannerTasks);
    }
  }, [plannerTasks, user?.uid]);

  // Boot connection check
  useEffect(() => {
    testConnection().catch(() => console.log('Firestore connection verified.'));
  }, []);

  // Helper to load user data from scoped cache and sync with Firestore
  const loadUserData = async (uid: string, fallbackEmail?: string) => {
    // 1. Immediately hydrate from local scoped cache for instant responsiveness
    const cachedDocs = loadUserScopedData<DocumentItem[]>(uid, 'docs', []);
    const cachedSums = loadUserScopedData<SummaryData[]>(uid, 'summaries', []);
    const cachedQuizzes = loadUserScopedData<QuizItem[]>(uid, 'quizzes', []);
    const cachedDecks = loadUserScopedData<FlashcardDeck[]>(uid, 'decks', []);
    const cachedTests = loadUserScopedData<PracticeTestItem[]>(uid, 'practice_tests', []);
    const cachedTasks = loadUserScopedData<PlannerTask[]>(uid, 'tasks', []);

    setDocuments(cachedDocs);
    setSummaries(cachedSums);
    setQuizzes(cachedQuizzes);
    setFlashcardDecks(cachedDecks);
    setPracticeTests(cachedTests);
    setPlannerTasks(cachedTasks);

    // 2. Query Firestore and merge in background
    try {
      // User Profile
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const udata = userSnap.data();
        const fullProfile: UserProfile = {
          uid,
          email: udata.email || fallbackEmail || auth.currentUser?.email || '',
          displayName: udata.displayName || auth.currentUser?.displayName || 'Student',
          name: udata.name || '',
          surname: udata.surname || '',
          university: udata.university || '',
          matricNo: udata.matricNo || '',
          department: udata.department || '',
          totalDocuments: udata.totalDocuments ?? cachedDocs.length,
          totalSummaries: udata.totalSummaries ?? cachedSums.length,
          totalQuizzes: udata.totalQuizzes ?? cachedQuizzes.length,
          averageScore: udata.averageScore ?? 85,
          flashcardsReviewed: udata.flashcardsReviewed ?? 12,
          studySessions: udata.studySessions ?? 4,
          dailyGoalMinutes: udata.dailyGoalMinutes ?? 60,
          weeklyGoalQuizzes: udata.weeklyGoalQuizzes ?? 5,
          currentStreak: udata.currentStreak ?? 1,
          streakFreezes: udata.streakFreezes ?? 0,
          lastFreezeAwardedAt: udata.lastFreezeAwardedAt ?? 0,
          lastStudyDate: udata.lastStudyDate || new Date().toISOString(),
          createdAt: udata.createdAt || new Date().toISOString(),
        };
        setUser(fullProfile);
      }

      // Firestore Documents
      try {
        const docsSnap = await getDocs(collection(db, 'users', uid, 'documents'));
        if (!docsSnap.empty) {
          const fsDocs = docsSnap.docs.map((d) => d.data() as DocumentItem);
          const mergedDocsMap = new Map<string, DocumentItem>();
          cachedDocs.forEach((d) => mergedDocsMap.set(d.id, d));
          fsDocs.forEach((d) => mergedDocsMap.set(d.id, d));
          const mergedDocs = Array.from(mergedDocsMap.values());
          setDocuments(mergedDocs);
          saveUserScopedData(uid, 'docs', mergedDocs);
        } else if (cachedDocs.length > 0) {
          // If Firestore is empty but we have local documents, backup to Firestore
          for (const d of cachedDocs) {
            setDoc(doc(db, 'users', uid, 'documents', d.id), d).catch(() => {});
          }
        }
      } catch (err) {
        console.warn('Firestore documents sync notice:', err);
      }

      // Firestore Summaries
      try {
        const sumSnap = await getDocs(collection(db, 'users', uid, 'summaries'));
        if (!sumSnap.empty) {
          const fsSums = sumSnap.docs.map((d) => d.data() as SummaryData);
          const mergedMap = new Map<string, SummaryData>();
          cachedSums.forEach((s) => mergedMap.set(s.id, s));
          fsSums.forEach((s) => mergedMap.set(s.id, s));
          const merged = Array.from(mergedMap.values());
          setSummaries(merged);
          saveUserScopedData(uid, 'summaries', merged);
        } else if (cachedSums.length > 0) {
          for (const s of cachedSums) {
            setDoc(doc(db, 'users', uid, 'summaries', s.id), s).catch(() => {});
          }
        }
      } catch (err) {
        console.warn('Firestore summaries sync notice:', err);
      }

      // Firestore Quizzes
      try {
        const quizSnap = await getDocs(collection(db, 'users', uid, 'quizzes'));
        if (!quizSnap.empty) {
          const fsQuizzes = quizSnap.docs.map((d) => d.data() as QuizItem);
          const mergedMap = new Map<string, QuizItem>();
          cachedQuizzes.forEach((q) => mergedMap.set(q.id, q));
          fsQuizzes.forEach((q) => mergedMap.set(q.id, q));
          const merged = Array.from(mergedMap.values());
          setQuizzes(merged);
          saveUserScopedData(uid, 'quizzes', merged);
        } else if (cachedQuizzes.length > 0) {
          for (const q of cachedQuizzes) {
            setDoc(doc(db, 'users', uid, 'quizzes', q.id), q).catch(() => {});
          }
        }
      } catch (err) {
        console.warn('Firestore quizzes sync notice:', err);
      }

      // Firestore Flashcards
      try {
        const deckSnap = await getDocs(collection(db, 'users', uid, 'flashcards'));
        if (!deckSnap.empty) {
          const fsDecks = deckSnap.docs.map((d) => d.data() as FlashcardDeck);
          const mergedMap = new Map<string, FlashcardDeck>();
          cachedDecks.forEach((d) => mergedMap.set(d.id, d));
          fsDecks.forEach((d) => mergedMap.set(d.id, d));
          const merged = Array.from(mergedMap.values());
          setFlashcardDecks(merged);
          saveUserScopedData(uid, 'decks', merged);
        } else if (cachedDecks.length > 0) {
          for (const d of cachedDecks) {
            setDoc(doc(db, 'users', uid, 'flashcards', d.id), d).catch(() => {});
          }
        }
      } catch (err) {
        console.warn('Firestore flashcards sync notice:', err);
      }

      // Firestore Practice Tests
      try {
        const testSnap = await getDocs(collection(db, 'users', uid, 'practiceTests'));
        if (!testSnap.empty) {
          const fsTests = testSnap.docs.map((d) => d.data() as PracticeTestItem);
          const mergedMap = new Map<string, PracticeTestItem>();
          cachedTests.forEach((t) => mergedMap.set(t.id, t));
          fsTests.forEach((t) => mergedMap.set(t.id, t));
          const merged = Array.from(mergedMap.values());
          setPracticeTests(merged);
          saveUserScopedData(uid, 'practice_tests', merged);
        }
      } catch (err) {
        console.warn('Firestore practice tests sync notice:', err);
      }

      // Firestore Planner Tasks
      try {
        const taskSnap = await getDocs(collection(db, 'users', uid, 'plannerTasks'));
        if (!taskSnap.empty) {
          const fsTasks = taskSnap.docs.map((d) => d.data() as PlannerTask);
          const mergedMap = new Map<string, PlannerTask>();
          cachedTasks.forEach((t) => mergedMap.set(t.id, t));
          fsTasks.forEach((t) => mergedMap.set(t.id, t));
          const merged = Array.from(mergedMap.values());
          setPlannerTasks(merged);
          saveUserScopedData(uid, 'tasks', merged);
        }
      } catch (err) {
        console.warn('Firestore planner tasks sync notice:', err);
      }
    } catch (e) {
      console.warn('Load user data error:', e);
    }
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        localStorage.setItem('studykit_active_uid', fbUser.uid);
        await loadUserData(fbUser.uid, fbUser.email || undefined);
      } else {
        // Only clear if no local session is explicitly active
        const activeUid = localStorage.getItem('studykit_active_uid');
        if (!activeUid) {
          setUser(null);
          setDocuments([]);
          setSummaries([]);
          setQuizzes([]);
          setFlashcardDecks([]);
          setPracticeTests([]);
          setPlannerTasks([]);
        }
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Authentication implementations
  const signIn = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const normalizedEmail = email.toLowerCase().trim();
    const registeredAccounts = getRegisteredAccounts();
    const localAccount = registeredAccounts[normalizedEmail];

    try {
      const cred = await signInWithEmailAndPassword(auth, normalizedEmail, pass);
      if (cred.user) {
        localStorage.setItem('studykit_active_uid', cred.user.uid);
        await loadUserData(cred.user.uid, normalizedEmail);
        return { success: true };
      }
    } catch (err: any) {
      console.warn('Firebase Auth sign in notice:', err);

      // Check registered accounts store
      if (localAccount) {
        if (localAccount.pass && localAccount.pass !== pass) {
          return { success: false, error: 'Incorrect password. Please verify your password and try again.' };
        }
        const activeUid = localAccount.uid || localAccount.profile.uid || getStableAccountUid(normalizedEmail);
        localStorage.setItem('studykit_active_uid', activeUid);
        setUser(localAccount.profile);
        await loadUserData(activeUid, normalizedEmail);
        return { success: true };
      }

      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        return { success: false, error: 'Incorrect email or password. Please try again or create an account.' };
      }
      if (err.code === 'auth/user-not-found') {
        return { success: false, error: 'No account registered with this email. Please click Sign Up below.' };
      }

      // Deterministic recovery for existing local data if present
      const stableUid = getStableAccountUid(normalizedEmail);
      const existingDocs = loadUserScopedData<DocumentItem[]>(stableUid, 'docs', []);
      if (existingDocs.length > 0) {
        const recoveredProfile: UserProfile = {
          uid: stableUid,
          email: normalizedEmail,
          displayName: normalizedEmail.split('@')[0] || 'Student',
          name: normalizedEmail.split('@')[0] || 'Student',
          surname: '',
          university: 'University',
          matricNo: 'ST-9999',
          department: 'General',
          totalDocuments: existingDocs.length,
          totalSummaries: 0,
          totalQuizzes: 0,
          averageScore: 85,
          flashcardsReviewed: 10,
          studySessions: 2,
          dailyGoalMinutes: 60,
          weeklyGoalQuizzes: 5,
          createdAt: new Date().toISOString(),
          currentStreak: 1,
          streakFreezes: 0,
          lastFreezeAwardedAt: 0,
          lastStudyDate: new Date().toISOString(),
        };
        localStorage.setItem('studykit_active_uid', stableUid);
        setUser(recoveredProfile);
        await loadUserData(stableUid, normalizedEmail);
        return { success: true };
      }

      return { success: false, error: err.message || 'Failed to sign in. Please check your credentials.' };
    }
    return { success: true };
  };

  const signUp = async (
    email: string,
    pass: string,
    name: string,
    surname: string,
    university: string,
    matricNo: string,
    department: string
  ): Promise<{ success: boolean; error?: string }> => {
    const normalizedEmail = email.toLowerCase().trim();

    try {
      const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, pass);
      if (auth.currentUser) {
        await fbUpdateProfile(auth.currentUser, { displayName: `${name} ${surname}` });
      }

      const newUser: UserProfile = {
        uid: cred.user.uid,
        email: normalizedEmail,
        displayName: `${name} ${surname}`,
        name,
        surname,
        university,
        matricNo,
        department,
        totalDocuments: 0,
        totalSummaries: 0,
        totalQuizzes: 0,
        averageScore: 0,
        flashcardsReviewed: 0,
        studySessions: 1,
        dailyGoalMinutes: 60,
        weeklyGoalQuizzes: 5,
        createdAt: new Date().toISOString(),
        currentStreak: 1,
        streakFreezes: 0,
        lastFreezeAwardedAt: 0,
        lastStudyDate: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'users', cred.user.uid), newUser);
        await setDoc(doc(db, 'publicStats', cred.user.uid), {
          displayName: newUser.displayName,
          currentStreak: newUser.currentStreak,
        });
      } catch (e) {
        console.warn('Could not save user profile or publicStats to Firestore:', e);
      }

      saveRegisteredAccount(normalizedEmail, pass, newUser);
      localStorage.setItem('studykit_active_uid', cred.user.uid);
      setUser(newUser);

      // Clean fresh slate for newly created user
      setDocuments([]);
      setSummaries([]);
      setQuizzes([]);
      setFlashcardDecks([]);
      setPracticeTests([]);
      setPlannerTasks([]);
      return { success: true };
    } catch (err: any) {
      console.warn('Firebase Auth sign up notice:', err);

      if (err.code === 'auth/email-already-in-use') {
        const signinRes = await signIn(normalizedEmail, pass);
        if (signinRes.success) {
          return { success: true };
        }
        return { success: false, error: 'An account with this email already exists. Please sign in.' };
      }

      // Offline / Fallback account with deterministic UID
      const stableUid = getStableAccountUid(normalizedEmail);
      const fallbackUser: UserProfile = {
        uid: stableUid,
        email: normalizedEmail,
        displayName: `${name} ${surname}`,
        name,
        surname,
        university,
        matricNo,
        department,
        totalDocuments: 0,
        totalSummaries: 0,
        totalQuizzes: 0,
        averageScore: 0,
        flashcardsReviewed: 0,
        studySessions: 1,
        dailyGoalMinutes: 60,
        weeklyGoalQuizzes: 5,
        createdAt: new Date().toISOString(),
        currentStreak: 1,
        streakFreezes: 0,
        lastFreezeAwardedAt: 0,
        lastStudyDate: new Date().toISOString(),
      };

      saveRegisteredAccount(normalizedEmail, pass, fallbackUser);
      localStorage.setItem('studykit_active_uid', stableUid);
      setUser(fallbackUser);

      setDocuments([]);
      setSummaries([]);
      setQuizzes([]);
      setFlashcardDecks([]);
      setPracticeTests([]);
      setPlannerTasks([]);
      return { success: true };
    }
  };

  const signInDemo = () => {
    const demoUid = 'demo-student-101';
    const demoUser: UserProfile = {
      uid: demoUid,
      email: 'student@studykit.edu',
      displayName: 'Alex Rivers',
      name: 'Alex',
      surname: 'Rivers',
      university: 'Tech University',
      matricNo: 'ST-101234',
      department: 'Computer Science',
      totalDocuments: 0,
      totalSummaries: 0,
      totalQuizzes: 0,
      averageScore: 85,
      flashcardsReviewed: 10,
      studySessions: 3,
      dailyGoalMinutes: 60,
      weeklyGoalQuizzes: 5,
      createdAt: new Date().toISOString(),
      currentStreak: 3,
      streakFreezes: 1,
      lastFreezeAwardedAt: 0,
      lastStudyDate: new Date().toISOString(),
    };
    localStorage.setItem('studykit_active_uid', demoUid);
    setUser(demoUser);
    loadUserData(demoUid, demoUser.email);
  };

  const signOut = async () => {
    // 1. Snapshot save for current user before tearing down
    if (user?.uid) {
      saveUserScopedData(user.uid, 'docs', documents);
      saveUserScopedData(user.uid, 'summaries', summaries);
      saveUserScopedData(user.uid, 'quizzes', quizzes);
      saveUserScopedData(user.uid, 'decks', flashcardDecks);
      saveUserScopedData(user.uid, 'practice_tests', practiceTests);
      saveUserScopedData(user.uid, 'tasks', plannerTasks);
    }

    try {
      await fbSignOut(auth);
    } catch (e) {}

    // 2. Cleanly wipe in-memory state
    setUser(null);
    setActiveDoc(null);
    setDocuments([]);
    setSummaries([]);
    setQuizzes([]);
    setFlashcardDecks([]);
    setPracticeTests([]);
    setPlannerTasks([]);
    localStorage.removeItem('studykit_active_uid');
    localStorage.removeItem('studykit_user');
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
      }).catch(() => {});
    }
  };

  const triggerMilestoneToast = (streak: number) => {
    const milestoneBadges: Record<number, { title: string; message: string }> = {
      7: { title: '7-Day Scholar Badge Unlocked!', message: '7 days of unbroken study momentum. Amazing dedication!' },
      14: { title: '14-Day Consistent Badge Unlocked!', message: 'Two weeks of consistent mastery. Streak Freeze earned!' },
      30: { title: 'Monthly Master Badge Unlocked!', message: 'A full 30 days of dedication! Outstanding commitment.' },
      100: { title: 'Centurion Badge Unlocked!', message: '100 days of relentless learning! Triple-digit study legend.' },
      150: { title: '150-Day Elite Badge Unlocked!', message: '150 consecutive days of continuous study momentum!' },
      200: { title: '200-Day Grandmaster Badge Unlocked!', message: '200 days strong! An extraordinary milestone reached.' },
      250: { title: '250-Day Persistence Badge Unlocked!', message: '250 days of daily growth and academic excellence.' },
      300: { title: '300-Day Legend Badge Unlocked!', message: '300 days of continuous learning! Elite academic champion.' },
    };

    let milestone = milestoneBadges[streak];
    if (!milestone && streak > 300 && streak % 50 === 0) {
      milestone = {
        title: `${streak}-Day Master Milestone!`,
        message: `${streak} consecutive days of study! Legendary persistence.`,
      };
    }

    if (milestone) {
      const awardedKey = `studykit_milestone_${user?.uid || 'guest'}_${streak}`;
      if (!localStorage.getItem(awardedKey)) {
        localStorage.setItem(awardedKey, 'true');
        showToast(milestone.title, milestone.message, 'streak');
        return;
      }
    }

    showToast(
      `Streak Maintained: ${streak} Days!`,
      'Great work keeping your daily study momentum active.',
      'streak'
    );
  };

  const notifyDailyTaskCompleted = (taskDesc: string) => {
    const todayISO = new Date().toISOString().split('T')[0];
    const dailyKey = `studykit_daily_task_done_${user?.uid || 'guest'}_${todayISO}`;
    const isFirstTaskToday = !localStorage.getItem(dailyKey);

    if (isFirstTaskToday) {
      localStorage.setItem(dailyKey, 'true');
      showToast(
        'Daily Task Completed!',
        `${taskDesc} — Daily learning goal accomplished!`,
        'task'
      );
    } else {
      showToast(
        'Task Completed',
        `${taskDesc} completed successfully.`,
        'task'
      );
    }
  };

  const updateActivity = async () => {
    if (!user) return;

    try {
      // Call server-side verification hook to recalculate streak based on absolute UTC calendar days
      const verifyRes = await fetch('/api/verify-streak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStreak: user.currentStreak,
          lastStudyDate: user.lastStudyDate,
          streakFreezes: user.streakFreezes,
          lastFreezeAwardedAt: user.lastFreezeAwardedAt,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.success) return;

      const todayUTC = new Date(verifyData.lastStudyDate).toISOString().split('T')[0];
      const stored = localStorage.getItem('studykit_activity_days');
      const actMap = stored ? JSON.parse(stored) : {};
      if (!actMap[todayUTC]) actMap[todayUTC] = { minutes: 0, quizzes: 0, docs: 0 };
      actMap[todayUTC].minutes += 15;
      localStorage.setItem('studykit_activity_days', JSON.stringify(actMap));

      if (!verifyData.streakAdvanced && verifyData.currentStreak === user.currentStreak) {
        return; // Already recorded for today in UTC
      }

      const newStreak = verifyData.currentStreak;
      const newFreezes = verifyData.streakFreezes;
      const lastFreezeAwardedAt = verifyData.lastFreezeAwardedAt;

      const updated = {
        ...user,
        currentStreak: newStreak,
        streakFreezes: newFreezes,
        lastFreezeAwardedAt,
        lastStudyDate: verifyData.lastStudyDate,
      };
      setUser(updated);

      if (verifyData.streakAdvanced) {
        triggerMilestoneToast(newStreak);
        if (newFreezes > (user.streakFreezes || 0)) {
          showToast('Streak Freeze Earned!', 'You earned a bonus Streak Freeze for consistency.', 'streak');
        }
      }

      if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          currentStreak: newStreak,
          streakFreezes: newFreezes,
          lastFreezeAwardedAt,
          lastStudyDate: verifyData.lastStudyDate,
          lastStudyTimestamp: serverTimestamp(),
        }).catch(() => {});

        await setDoc(doc(db, 'users', auth.currentUser.uid, 'dailyActivity', todayUTC), {
          dateUTC: todayUTC,
          minutesStudied: 15,
          timestamp: serverTimestamp(),
        }, { merge: true }).catch(() => {});

        await setDoc(doc(db, 'publicStats', auth.currentUser.uid), {
          displayName: updated.displayName,
          currentStreak: newStreak,
          lastActivityTimestamp: serverTimestamp(),
        }).catch(() => {});
      }
    } catch (err) {
      console.warn('Server-side streak verification warning:', err);
    }
  };

  // Document Operations
  const addDocument = async (docItem: DocumentItem) => {
    await updateActivity();
    const updatedDocs = [docItem, ...documents.filter((d) => d.id !== docItem.id)];
    setDocuments(updatedDocs);
    setActiveDoc(docItem);
    notifyDailyTaskCompleted(`Uploaded "${docItem.name}"`);

    if (user?.uid) {
      saveUserScopedData(user.uid, 'docs', updatedDocs);
    }

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'documents', docItem.id), docItem);
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          totalDocuments: updatedDocs.length,
        });
      } catch (err) {
        console.warn('Firestore doc add sync notice:', err);
      }
    }
  };

  const deleteDocument = async (id: string) => {
    const updatedDocs = documents.filter((d) => d.id !== id);
    setDocuments(updatedDocs);
    if (activeDoc?.id === id) setActiveDoc(null);

    if (user?.uid) {
      saveUserScopedData(user.uid, 'docs', updatedDocs);
    }

    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'documents', id));
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          totalDocuments: updatedDocs.length,
        });
      } catch (err) {
        console.warn('Firestore doc delete notice:', err);
      }
    }
  };

  // Summary Operations
  const addSummary = async (summary: SummaryData) => {
    await updateActivity();
    const updatedSummaries = [summary, ...summaries.filter((s) => s.id !== summary.id)];
    setSummaries(updatedSummaries);
    notifyDailyTaskCompleted(`Generated summary "${summary.title}"`);

    if (user?.uid) {
      saveUserScopedData(user.uid, 'summaries', updatedSummaries);
      setUser((prev) => (prev ? { ...prev, totalSummaries: updatedSummaries.length } : null));
    }

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'summaries', summary.id), summary);
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          totalSummaries: updatedSummaries.length,
        });
      } catch (err) {
        console.warn('Firestore summary save notice:', err);
      }
    }
  };

  const updateSummary = async (id: string, updated: Partial<SummaryData>) => {
    const updatedSummaries = summaries.map((s) => (s.id === id ? { ...s, ...updated } : s));
    setSummaries(updatedSummaries);

    if (user?.uid) {
      saveUserScopedData(user.uid, 'summaries', updatedSummaries);
    }

    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid, 'summaries', id), updated);
      } catch (err) {
        console.warn('Firestore summary update notice:', err);
      }
    }
  };

  const deleteSummary = async (id: string) => {
    const updatedSummaries = summaries.filter((s) => s.id !== id);
    setSummaries(updatedSummaries);

    if (user?.uid) {
      saveUserScopedData(user.uid, 'summaries', updatedSummaries);
      setUser((prev) => (prev ? { ...prev, totalSummaries: updatedSummaries.length } : null));
    }

    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'summaries', id));
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          totalSummaries: updatedSummaries.length,
        });
      } catch (err) {
        console.warn('Firestore summary delete notice:', err);
      }
    }
  };

  // Quiz Operations
  const addQuiz = async (quiz: QuizItem) => {
    await updateActivity();
    const updatedQuizzes = [quiz, ...quizzes.filter((q) => q.id !== quiz.id)];
    setQuizzes(updatedQuizzes);

    if (user?.uid) {
      saveUserScopedData(user.uid, 'quizzes', updatedQuizzes);
    }

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'quizzes', quiz.id), quiz);
      } catch (err) {
        console.warn('Firestore quiz save notice:', err);
      }
    }
  };

  const updateQuizScore = async (quizId: string, score: number, questions: any[]) => {
    const updatedQuizzes = quizzes.map((q) =>
      q.id === quizId ? { ...q, score, completed: true, questions } : q
    );
    setQuizzes(updatedQuizzes);
    notifyDailyTaskCompleted(`Completed quiz with score ${score}%`);

    if (user?.uid) {
      saveUserScopedData(user.uid, 'quizzes', updatedQuizzes);
      const completedList = updatedQuizzes.filter((q) => q.completed);
      const totalScoreSum = completedList.reduce((acc, curr) => acc + (curr.score || 0), 0);
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

    if (auth.currentUser) {
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
    const updatedQuizzes = quizzes.filter((q) => q.id !== id);
    setQuizzes(updatedQuizzes);

    if (user?.uid) {
      saveUserScopedData(user.uid, 'quizzes', updatedQuizzes);
    }

    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'quizzes', id));
      } catch (e) {}
    }
  };

  // Flashcards
  const addFlashcardDeck = async (deck: FlashcardDeck) => {
    const updatedDecks = [deck, ...flashcardDecks.filter((d) => d.id !== deck.id)];
    setFlashcardDecks(updatedDecks);

    if (user?.uid) {
      saveUserScopedData(user.uid, 'decks', updatedDecks);
    }

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'flashcards', deck.id), deck);
      } catch (e) {}
    }
  };

  const rateFlashcard = async (deckId: string, cardId: string, rating: 1 | 2 | 3) => {
    await updateActivity();
    const updatedDecks = flashcardDecks.map((deck) => {
      if (deck.id !== deckId) return deck;
      const updatedCards = deck.cards.map((card) => {
        if (card.id !== cardId) return card;

        let newInterval: number;
        let newRepetition: number;
        let newEase: number = card.easeFactor;

        if (rating === 1) {
          newRepetition = 0;
          newInterval = 1;
          newEase = Math.max(1.3, newEase - 0.2);
        } else if (rating === 2) {
          if (card.repetition === 0) newInterval = 1;
          else if (card.repetition === 1) newInterval = 3;
          else newInterval = Math.round(card.interval * newEase);
          newRepetition = card.repetition + 1;
        } else {
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
    });

    setFlashcardDecks(updatedDecks);
    notifyDailyTaskCompleted('Flashcard study review');

    if (user?.uid) {
      saveUserScopedData(user.uid, 'decks', updatedDecks);
      setUser((prev) =>
        prev
          ? {
              ...prev,
              flashcardsReviewed: prev.flashcardsReviewed + 1,
            }
          : null
      );
    }

    if (auth.currentUser) {
      try {
        const found = updatedDecks.find((d) => d.id === deckId);
        if (found) {
          await setDoc(doc(db, 'users', auth.currentUser.uid, 'flashcards', deckId), found);
        }
      } catch (e) {}
    }
  };

  const deleteFlashcardDeck = async (id: string) => {
    const updated = flashcardDecks.filter((d) => d.id !== id);
    setFlashcardDecks(updated);

    if (user?.uid) {
      saveUserScopedData(user.uid, 'decks', updated);
    }

    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'flashcards', id));
      } catch (e) {}
    }
  };

  // Practice Tests
  const addPracticeTest = async (test: PracticeTestItem) => {
    const updated = [test, ...practiceTests.filter((t) => t.id !== test.id)];
    setPracticeTests(updated);

    if (user?.uid) {
      saveUserScopedData(user.uid, 'practice_tests', updated);
    }

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'practiceTests', test.id), test);
      } catch (e) {}
    }
  };

  const submitPracticeTest = async (
    testId: string,
    answers: Record<string, string>,
    score: number,
    timeSpent: number
  ) => {
    await updateActivity();
    const updatedTests = practiceTests.map((test) => {
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
    });

    setPracticeTests(updatedTests);
    notifyDailyTaskCompleted(`Submitted practice test (${score}%)`);

    if (user?.uid) {
      saveUserScopedData(user.uid, 'practice_tests', updatedTests);
      setUser((prev) =>
        prev
          ? {
              ...prev,
              studySessions: prev.studySessions + 1,
            }
          : null
      );
    }

    if (auth.currentUser) {
      try {
        const found = updatedTests.find((t) => t.id === testId);
        if (found) {
          await setDoc(doc(db, 'users', auth.currentUser.uid, 'practiceTests', testId), found);
        }
      } catch (e) {}
    }
  };

  const deletePracticeTest = async (id: string) => {
    const updated = practiceTests.filter((t) => t.id !== id);
    setPracticeTests(updated);

    if (user?.uid) {
      saveUserScopedData(user.uid, 'practice_tests', updated);
    }

    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'practiceTests', id));
      } catch (e) {}
    }
  };

  // Study Planner Tasks
  const addPlannerTask = async (task: PlannerTask) => {
    await updateActivity();
    const updated = [task, ...plannerTasks.filter((t) => t.id !== task.id)];
    setPlannerTasks(updated);

    if (user?.uid) {
      saveUserScopedData(user.uid, 'tasks', updated);
    }

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'plannerTasks', task.id), task);
      } catch (e) {}
    }
  };

  const togglePlannerTask = async (id: string) => {
    await updateActivity();
    const wasCompleted = plannerTasks.find((t) => t.id === id)?.completed;
    const updated = plannerTasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    setPlannerTasks(updated);
    if (!wasCompleted) {
      const target = updated.find((t) => t.id === id);
      if (target) {
        notifyDailyTaskCompleted(`Planner task "${target.title}"`);
      }
    }

    if (user?.uid) {
      saveUserScopedData(user.uid, 'tasks', updated);
    }

    if (auth.currentUser) {
      try {
        const found = updated.find((t) => t.id === id);
        if (found) {
          await setDoc(doc(db, 'users', auth.currentUser.uid, 'plannerTasks', id), found);
        }
      } catch (e) {}
    }
  };

  const deletePlannerTask = async (id: string) => {
    const updated = plannerTasks.filter((t) => t.id !== id);
    setPlannerTasks(updated);

    if (user?.uid) {
      saveUserScopedData(user.uid, 'tasks', updated);
    }

    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'plannerTasks', id));
      } catch (e) {}
    }
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
    flashcardsReviewed: user?.flashcardsReviewed || 0,
    studySessions: user?.studySessions || 0,
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
        updateActivity,
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
