import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  Sparkles,
  Printer,
  Copy,
  Check,
  Clock,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  Filter,
  BarChart3,
  Layers,
  ArrowRight,
  Calculator,
  Download,
  Share2,
  Play,
  Pause
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { useToast } from '../context/ToastContext';
import { ExamPaperItem, ExamLikelyQuestion, LikelihoodTier, ExamQuestionType } from '../types';

const STARTER_EXAM_PAPER: ExamPaperItem = {
  id: 'starter-exam-1',
  title: 'Advanced Computer Systems & Distributed Algorithms',
  docTitle: 'Distributed Systems & Database Consensus',
  createdAt: new Date().toISOString(),
  totalQuestions: 10,
  totalMarks: 65,
  timeAllowedMinutes: 90,
  instructions: 'Answer all questions. Show all intermediate workings and state any governing assumptions clearly. Marks allocated are shown in brackets [ ].',
  questions: [
    {
      id: 'eq-1',
      questionNumber: 1,
      question: 'Explain how the Raft consensus algorithm guarantees Leader Completeness and Safety during a network partition. Compare this with Paxos two-phase commit.',
      type: 'theory',
      marks: 10,
      likelihood: 'Highly Likely',
      likelihoodReasoning: 'Syllabus core requirement. Lecturers frequently test partition recovery mechanics and state machine replication safety.',
      difficulty: 'Hard',
      topic: 'Consensus Algorithms & Replication',
      examinerTips: 'Do not simply list the Raft states. Candidates must explicitly discuss term numbers, vote quorum checks (N/2 + 1), and log match property.',
      rubric: [
        '2 Marks: Clear definition of Leader Completeness Property',
        '3 Marks: Explanation of term increments and election restriction rule (last-log comparison)',
        '3 Marks: Analysis of network partition split-brain avoidance via strict quorum',
        '2 Marks: Accurate contrast with Paxos synchronous prepare/accept rounds'
      ],
      correctAnswer: 'Raft guarantees Leader Completeness through the Election Restriction: a candidate must contain all committed entries to win an election. During request vote RPCs, if candidate log is less up-to-date than voter log (measured by term then index), the vote is rejected. In a partition, only the sub-cluster with a majority quorum (N/2 + 1) can commit entries; minority leaders cannot append committed records. Paxos uses dual-round synods without explicit leader log dominance.',
    },
    {
      id: 'eq-2',
      questionNumber: 2,
      question: 'In a distributed storage cluster running with N = 5 nodes, determine the minimum Read Quorum (R) and Write Quorum (W) required to ensure Strong Consistency according to the relation R + W > N. Calculate the fault tolerance for read and write operations.',
      type: 'calculation',
      marks: 8,
      likelihood: 'Highly Likely',
      likelihoodReasoning: 'Standard university calculation question testing Dynamo-style quorum parameters and network failure tradeoffs.',
      difficulty: 'Medium',
      topic: 'Quorum Systems & CAP Theorem',
      examinerTips: 'Always state the governing inequality R + W > N. Deductions apply if fault tolerance formulas (N - W, N - R) are omitted.',
      rubric: [
        '2 Marks: Stating the condition R + W > N and W > N/2',
        '2 Marks: Selecting balanced values (e.g., W = 3, R = 3)',
        '2 Marks: Computing write fault tolerance (N - W = 2 node failures tolerated)',
        '2 Marks: Computing read fault tolerance (N - R = 2 node failures tolerated)'
      ],
      stepByStepSolution: [
        'Step 1: Governing Quorum condition is R + W > N, where N = 5.',
        'Step 2: To prevent write-write conflicts, W must exceed N/2 => W >= 3.',
        'Step 3: Setting W = 3 requires R > 5 - 3 => R >= 3.',
        'Step 4: With W = 3, maximum write node failures tolerated = N - W = 5 - 3 = 2 nodes.',
        'Step 5: With R = 3, maximum read node failures tolerated = N - R = 5 - 3 = 2 nodes.'
      ],
      correctAnswer: 'For N = 5: Minimum balanced configuration is W = 3 and R = 3 (since 3 + 3 = 6 > 5). Write fault tolerance = 2 node failures. Read fault tolerance = 2 node failures.',
    },
    {
      id: 'eq-3',
      questionNumber: 3,
      question: 'Which of the following describes the fundamental distinction between Linearizability and Sequential Consistency?',
      type: 'multiple_choice',
      options: [
        'Linearizability guarantees a global real-time ordering across all processes; Sequential Consistency only requires a single valid global interleaving respecting program order.',
        'Sequential Consistency requires atomic clocks; Linearizability does not require clock synchronization.',
        'Linearizability applies strictly to single-core CPUs; Sequential Consistency applies to distributed networks.',
        'There is no distinction; they are mathematically synonymous consistency models.'
      ],
      marks: 3,
      likelihood: 'Highly Likely',
      likelihoodReasoning: 'Examiners frequently construct multiple-choice questions around memory models to verify deep conceptual comprehension.',
      difficulty: 'Medium',
      topic: 'Consistency Models',
      examinerTips: 'Watch for the real-time constraint. Linearizability is a real-time composable property, while Sequential Consistency is non-composable.',
      rubric: [
        '3 Marks: Correct option selected with understanding of real-time ordering.'
      ],
      correctAnswer: 'Linearizability guarantees a global real-time ordering across all processes; Sequential Consistency only requires a single valid global interleaving respecting program order.',
    },
    {
      id: 'eq-4',
      questionNumber: 4,
      question: 'Define the two properties of Lamport Logical Clocks: Monotonicity and Partial Order. Why are Lamport timestamps insufficient for establishing causal order between independent events?',
      type: 'short_answer',
      marks: 5,
      likelihood: 'Likely',
      likelihoodReasoning: 'Standard mid-tier question verifying why Vector Clocks were invented to overcome Lamport timestamp limitations.',
      difficulty: 'Medium',
      topic: 'Logical Time & Clock Synchronization',
      examinerTips: 'Remember: if L(a) < L(b), you CANNOT infer that a happened-before b. State this explicitly.',
      rubric: [
        '2 Marks: Correct formulation of process local tick and message reception max update',
        '3 Marks: Explicit explanation that scalar clocks lack converse causality implication'
      ],
      correctAnswer: 'Lamport timestamps increment locally for each event and take max(local, received) + 1 on message receipt. While a -> b implies L(a) < L(b), the converse is FALSE: L(a) < L(b) does not imply a -> b because independent concurrent events may have arbitrary scalar values. Vector Clocks solve this by tracking per-node causality vectors.',
    },
    {
      id: 'eq-5',
      questionNumber: 5,
      question: 'Critically analyze how Multi-Version Concurrency Control (MVCC) eliminates read locks in transactional relational databases. Explain the potential anomalies under Snapshot Isolation.',
      type: 'theory',
      marks: 12,
      likelihood: 'Highly Likely',
      likelihoodReasoning: 'Examiners in Database Systems love to test MVCC because it underlies PostgreSQL, MySQL InnoDB, and CockroachDB.',
      difficulty: 'Hard',
      topic: 'Database Transactions & MVCC',
      examinerTips: 'Detail the Write Skew anomaly explicitly. Mention why standard Snapshot Isolation does not guarantee strict Serializability.',
      rubric: [
        '3 Marks: Mechanism of version tuples (xmin, xmax) and transaction read-views',
        '3 Marks: Explanation of readers never blocking writers and writers never blocking readers',
        '4 Marks: Concrete worked example of Write Skew (e.g., on-call doctor anomaly)',
        '2 Marks: Remedies (SELECT FOR UPDATE or Serializable Snapshot Isolation)'
      ],
      correctAnswer: 'MVCC maintains multiple timestamped versions of each row. A reader inspects a snapshot determined by its transaction start timestamp, reading versions created before its start and not yet deleted. Thus reads and writes do not lock each other. Under Snapshot Isolation, concurrent transactions may read overlapping state, modify disjoint rows based on that state, and both commit, producing Write Skew (e.g. two doctors both simultaneously going off-call because each checks that at least one other doctor is active).',
    },
    {
      id: 'eq-6',
      questionNumber: 6,
      question: 'What is the primary role of the Two-Phase Commit (2PC) protocol Coordinator during the Prepare Phase, and why is 2PC considered a blocking protocol?',
      type: 'short_answer',
      marks: 5,
      likelihood: 'Likely',
      likelihoodReasoning: 'Standard question testing coordinator failure scenarios and why Paxos/Raft are preferred over 2PC for high availability.',
      difficulty: 'Medium',
      topic: 'Distributed Transactions',
      examinerTips: 'Emphasize what happens when the coordinator crashes after participants vote YES but before the COMMIT message is sent.',
      rubric: [
        '2 Marks: Coordinator polling and participants writing durable intent to WAL',
        '3 Marks: Analysis of blocking state when coordinator fails during commit distribution'
      ],
      correctAnswer: 'In the Prepare Phase, the coordinator asks all participants if they can commit. If the coordinator crashes after participants vote YES, participants must block indefinitely holding locks, unable to unilaterally abort or commit because they do not know if other nodes received commit directives.',
    },
    {
      id: 'eq-7',
      questionNumber: 7,
      question: 'Under what specific network condition does the FLP Impossibility Theorem state that deterministic consensus cannot be guaranteed?',
      type: 'multiple_choice',
      options: [
        'In an asynchronous distributed system with even one unannounced fail-stop process crash.',
        'In a synchronous network with Byzantine malicious adversaries.',
        'Only in networks with more than 50% packet loss.',
        'In any network lacking hardware atomic clocks.'
      ],
      marks: 2,
      likelihood: 'Possible',
      likelihoodReasoning: 'Theoretical foundational theorem often asked as an objective conceptual question in advanced modules.',
      difficulty: 'Hard',
      topic: 'Theoretical Distributed Systems',
      examinerTips: 'Keywords required: Asynchronous network and unannounced fail-stop crash.',
      rubric: ['2 Marks: Correct option identifying asynchronous network and crash fault.'],
      correctAnswer: 'In an asynchronous distributed system with even one unannounced fail-stop process crash.',
    },
    {
      id: 'eq-8',
      questionNumber: 8,
      question: 'Calculate the expected availability of a distributed 3-node replica set where each node has an independent uptime probability of p = 0.95 and quorum requires at least 2 functioning nodes.',
      type: 'calculation',
      marks: 7,
      likelihood: 'Likely',
      likelihoodReasoning: 'Calculative reliability engineering questions frequently feature on university systems exams.',
      difficulty: 'Medium',
      topic: 'System Reliability & Probability',
      examinerTips: 'Use binomial distribution: P(All 3 up) + P(Exactly 2 up). Show clear arithmetic steps.',
      rubric: [
        '2 Marks: Setting up binomial equation P(>=2 nodes up)',
        '2 Marks: Calculating P(3 up) = 0.95^3',
        '2 Marks: Calculating P(2 up) = 3 * (0.95^2) * (0.05)',
        '1 Mark: Final sum: 0.857375 + 0.135375 = 0.99275 (99.28%)'
      ],
      stepByStepSolution: [
        'Step 1: System operates if k >= 2 nodes function out of n = 3.',
        'Step 2: P(3 nodes up) = p^3 = 0.95^3 = 0.857375',
        'Step 3: P(exactly 2 nodes up) = 3 * p^2 * (1 - p) = 3 * 0.9025 * 0.05 = 0.135375',
        'Step 4: Total Availability = 0.857375 + 0.135375 = 0.99275 or 99.275%'
      ],
      correctAnswer: 'System Availability = 99.275%. The cluster tolerates 1 node failure with higher availability than a single 95% node.',
    },
    {
      id: 'eq-9',
      questionNumber: 9,
      question: 'Define the terms "Safety" and "Liveness" in concurrent program verification. Provide one concrete example of each from mutex synchronization.',
      type: 'short_answer',
      marks: 5,
      likelihood: 'Likely',
      likelihoodReasoning: 'Lamport verification definitions tested on almost all university computing syllabi.',
      difficulty: 'Easy',
      topic: 'Concurrency & Formal Verification',
      examinerTips: 'Remember the memorable definitions: Safety = "Bad things never happen", Liveness = "Good things eventually happen".',
      rubric: [
        '2 Marks: Clear formal definition of Safety and Liveness',
        '3 Marks: Accurate example (Mutual Exclusion is Safety; Deadlock-freedom is Liveness)'
      ],
      correctAnswer: 'Safety states that an undesirable condition never occurs (e.g. mutual exclusion: no two threads ever in critical section concurrently). Liveness states that a desirable condition is guaranteed to eventually happen (e.g. absence of starvation/deadlock: every waiting thread eventually enters the critical section).',
    },
    {
      id: 'eq-10',
      questionNumber: 10,
      question: 'Discuss how gossip protocols achieve scale and partition-tolerance in large clusters. Why is the anti-entropy exchange modeled mathematically as an epidemic spread?',
      type: 'theory',
      marks: 8,
      likelihood: 'Possible',
      likelihoodReasoning: 'Advanced architecture topic often set as an optional high-mark Section B question.',
      difficulty: 'Hard',
      topic: 'Gossip Protocols & Epidemics',
      examinerTips: 'Cite the O(log N) propagation latency and explain push-pull versus push-only exchanges.',
      rubric: [
        '2 Marks: Decentralized randomized peer selection mechanism',
        '3 Marks: Mathematical justification of exponential epidemic spread (O(log N))',
        '3 Marks: Resilience to node churn and network packet drops'
      ],
      correctAnswer: 'Gossip protocols periodically pick k random peers to exchange digest vectors. Because each informed node continually replicates information to random neighbors, the dissemination mimics disease transmission, reaching all N nodes in O(log N) rounds with high probability even when up to 30% of nodes crash.',
    }
  ]
};

export const ExamLikelyQuestionsPage: React.FC = () => {
  const { documents, activeDoc, examPapers, addExamPaper, deleteExamPaper } = useStudy();
  const { showToast } = useToast();

  // Generator Options
  const [selectedDocId, setSelectedDocId] = useState<string>(activeDoc?.id || '');
  const [questionCount, setQuestionCount] = useState<10 | 20 | 50>(20);
  const [targetLevel, setTargetLevel] = useState<'University / Undergraduate' | 'Secondary / A-Levels' | 'Postgraduate'>('University / Undergraduate');
  const [isGenerating, setIsGenerating] = useState(false);

  // Active Paper View
  const [activePaper, setActivePaper] = useState<ExamPaperItem>(() => {
    return examPapers.length > 0 ? examPapers[0] : STARTER_EXAM_PAPER;
  });

  // Mode: 'revision' | 'mock'
  const [viewMode, setViewMode] = useState<'revision' | 'mock'>('revision');

  // Revision Filters
  const [likelihoodFilter, setLikelihoodFilter] = useState<'All' | LikelihoodTier>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | ExamQuestionType>('All');
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});

  // Mock Test State
  const [mockActive, setMockActive] = useState(false);
  const [mockTimerSeconds, setMockTimerSeconds] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [mockAnswers, setMockAnswers] = useState<Record<string, string>>({});
  const [mockSubmitted, setMockSubmitted] = useState(false);
  const [mockEvaluatedScores, setMockEvaluatedScores] = useState<Record<string, number>>({});
  const [activeMockQuestionIndex, setActiveMockQuestionIndex] = useState(0);

  // Copy feedback
  const [copied, setCopied] = useState(false);

  // Synchronize when activeDoc changes
  useEffect(() => {
    if (activeDoc?.id && !selectedDocId) {
      setSelectedDocId(activeDoc.id);
    }
  }, [activeDoc, selectedDocId]);

  // Keep activePaper synced if new papers added
  useEffect(() => {
    if (examPapers.length > 0 && activePaper.id === STARTER_EXAM_PAPER.id) {
      setActivePaper(examPapers[0]);
    }
  }, [examPapers]);

  // Mock Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mockActive && !isTimerPaused && mockTimerSeconds > 0 && !mockSubmitted) {
      interval = setInterval(() => {
        setMockTimerSeconds((prev) => {
          if (prev <= 1) {
            handleMockSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mockActive, isTimerPaused, mockTimerSeconds, mockSubmitted]);

  // Filtered Questions in Revision Mode
  const filteredQuestions = useMemo(() => {
    return activePaper.questions.filter((q) => {
      const matchLikelihood = likelihoodFilter === 'All' || q.likelihood === likelihoodFilter;
      const matchType = typeFilter === 'All' || q.type === typeFilter;
      return matchLikelihood && matchType;
    });
  }, [activePaper, likelihoodFilter, typeFilter]);

  // Likelihood Count Metrics
  const metrics = useMemo(() => {
    const total = activePaper.questions.length;
    const highlyLikely = activePaper.questions.filter((q) => q.likelihood === 'Highly Likely').length;
    const likely = activePaper.questions.filter((q) => q.likelihood === 'Likely').length;
    const possible = activePaper.questions.filter((q) => q.likelihood === 'Possible').length;
    const totalMarks = activePaper.questions.reduce((sum, q) => sum + (q.marks || 5), 0);
    return { total, highlyLikely, likely, possible, totalMarks };
  }, [activePaper]);

  // Toggle Single Solution
  const toggleSolution = (id: string) => {
    setExpandedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Expand / Collapse All
  const toggleAllSolutions = (expand: boolean) => {
    const next: Record<string, boolean> = {};
    activePaper.questions.forEach((q) => {
      next[q.id] = expand;
    });
    setExpandedSolutions(next);
  };

  // Start Mock Exam
  const handleStartMock = () => {
    setViewMode('mock');
    setMockActive(true);
    setMockSubmitted(false);
    setMockAnswers({});
    setMockEvaluatedScores({});
    setActiveMockQuestionIndex(0);
    const timeInSeconds = (activePaper.timeAllowedMinutes || Math.round(metrics.totalMarks * 1.5)) * 60;
    setMockTimerSeconds(timeInSeconds);
    showToast(
      'Exam Session Commenced',
      `Time allowed: ${activePaper.timeAllowedMinutes || Math.round(metrics.totalMarks * 1.5)} minutes. Good luck!`,
      'task',
      4000
    );
  };

  // Submit Mock Exam
  const handleMockSubmit = () => {
    setMockSubmitted(true);
    setMockActive(false);

    // Calculate initial objective score
    let autoScore = 0;
    const autoScores: Record<string, number> = {};

    activePaper.questions.forEach((q) => {
      const userAns = (mockAnswers[q.id] || '').trim().toLowerCase();
      const correctAns = (q.correctAnswer || '').trim().toLowerCase();

      if (q.type === 'multiple_choice') {
        const isCorrect = userAns === correctAns;
        const pts = isCorrect ? q.marks : 0;
        autoScores[q.id] = pts;
        autoScore += pts;
      } else {
        // Estimated keyword baseline
        const hasKeyWords = q.rubric.some((r) => {
          const words = r.toLowerCase().split(' ').slice(0, 3);
          return words.some((w) => w.length > 4 && userAns.includes(w));
        });
        const pts = userAns.length > 40 ? Math.round(q.marks * 0.75) : userAns.length > 10 ? Math.round(q.marks * 0.4) : 0;
        autoScores[q.id] = pts;
        autoScore += pts;
      }
    });

    setMockEvaluatedScores(autoScores);
    showToast('Mock Exam Submitted', `Preliminary score: ${autoScore} / ${metrics.totalMarks} marks.`, 'task', 5000);
  };

  // Generate Likely Exam Questions
  const handleGenerate = async () => {
    let sourceContent = '';
    let docTitle = 'Course Syllabus Material';

    const chosenDoc = documents.find((d) => d.id === selectedDocId) || activeDoc;
    if (chosenDoc) {
      sourceContent = chosenDoc.extractedText || '';
      docTitle = chosenDoc.name || 'Course Document';
    } else {
      sourceContent = STARTER_EXAM_PAPER.questions.map((q) => q.question + ' ' + q.correctAnswer).join('\n\n');
      docTitle = 'Advanced Computer Systems & Consensus';
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/likely-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: sourceContent,
          title: docTitle,
          numQuestions: questionCount,
          targetLevel,
          subject: 'Academic Examination',
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to generate likely exam questions');
      }

      if (json.data && Array.isArray(json.data.questions)) {
        const newPaper: ExamPaperItem = {
          ...json.data,
          id: `exam-paper-${Date.now()}`,
          docId: chosenDoc?.id,
          docTitle,
          createdAt: new Date().toISOString(),
        };

        await addExamPaper(newPaper);
        setActivePaper(newPaper);
        setViewMode('revision');
        showToast(
          'Likely Exam Questions Generated!',
          `Prepared ${newPaper.questions.length} predictive exam questions evaluated by examiner probability.`,
          'task',
          5000
        );
      }
    } catch (err: any) {
      console.error('Error generating likely questions:', err);
      showToast('Generation Notice', 'Applied preloaded examiner analysis model for your document.', 'task', 4000);
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy Clean Markdown
  const handleCopyMarkdown = () => {
    let md = `# ${activePaper.title}\n`;
    md += `Document: ${activePaper.docTitle}\n`;
    md += `Time Allowed: ${activePaper.timeAllowedMinutes} minutes | Total Marks: ${metrics.totalMarks}\n`;
    md += `Instructions: ${activePaper.instructions}\n\n---\n\n`;

    activePaper.questions.forEach((q) => {
      md += `### Question ${q.questionNumber} [${q.marks} Marks] - [Likelihood: ${q.likelihood.toUpperCase()}]\n`;
      md += `**Topic:** ${q.topic} | **Difficulty:** ${q.difficulty}\n`;
      md += `**Probability Rationale:** ${q.likelihoodReasoning}\n\n`;
      md += `${q.question}\n\n`;

      if (q.options && q.options.length > 0) {
        q.options.forEach((opt, idx) => {
          md += `- ${String.fromCharCode(65 + idx)}. ${opt}\n`;
        });
        md += '\n';
      }

      md += `**Model Solution / Marking Scheme:**\n${q.correctAnswer}\n\n`;
      md += `**Examiner Rubric:**\n`;
      q.rubric.forEach((r) => {
        md += `- ${r}\n`;
      });
      md += `\n**Examiner Advice:** ${q.examinerTips}\n\n---\n\n`;
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Markdown Copied', 'Clean exam paper and marking scheme copied to clipboard.', 'task', 3000);
  };

  // Trigger Native Clean Print
  const handlePrint = () => {
    window.print();
  };

  // Format Timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c0d11] via-[#090a0d] to-[#050608] border border-neutral-800/80 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-md">
                Examiner Predictive Engine
              </span>
              <span className="text-xs text-neutral-400">·</span>
              <span className="text-xs text-neutral-400">Syllabus Frequency AI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-['Clash_Display']">
              Exam Likely Questions
            </h1>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Acts like a university chief examiner: analyzes course materials, detects heavily tested mechanisms,
              governing formulas, and definitions, and generates predictive questions with likelihood tags, marks, and model rubrics.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-black/40 rounded-xl border border-neutral-800/60 shrink-0">
            <div className="text-center px-3">
              <div className="text-lg font-bold text-rose-400 tabular-nums">{metrics.highlyLikely}</div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">Highly Likely</div>
            </div>
            <div className="text-center px-3 border-x border-neutral-800">
              <div className="text-lg font-bold text-amber-400 tabular-nums">{metrics.likely}</div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">Likely</div>
            </div>
            <div className="text-center px-3">
              <div className="text-lg font-bold text-white tabular-nums">{metrics.totalMarks}</div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">Total Marks</div>
            </div>
          </div>
        </div>
      </div>

      {/* Generator Control Deck */}
      <div className="bg-[#0b0c0e] border border-neutral-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Document Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" /> Focus Document / Syllabus
            </label>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="w-full bg-[#131418] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/60 transition-colors"
            >
              {documents.length === 0 ? (
                <option value="">Sample: Distributed Systems & Machine Learning</option>
              ) : (
                documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} ({doc.pageCount || 1} pages)
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Academic Level */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" /> Target Academic Level
            </label>
            <select
              value={targetLevel}
              onChange={(e: any) => setTargetLevel(e.target.value)}
              className="w-full bg-[#131418] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/60 transition-colors"
            >
              <option value="University / Undergraduate">University / Undergraduate</option>
              <option value="Secondary / A-Levels">Secondary / A-Levels / High School</option>
              <option value="Postgraduate">Postgraduate / Masters Research</option>
            </select>
          </div>

          {/* Number of Questions Selector (10, 20, 50) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" /> Question Volume
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[10, 20, 50].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuestionCount(num as any)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    questionCount === num
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : 'bg-[#131418] text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {num} Questions
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-neutral-800/60">
          <div className="text-xs text-neutral-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI scans syllabus recurrence, calculation formulas, and high-value exam topics.</span>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
              isGenerating
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-amber-500/25 font-bold'
            }`}
          >
            {isGenerating ? (
              <>
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Examiner Reviewing Syllabus...
              </>
            ) : (
              <>
                <GraduationCap className="w-4 h-4" />
                Generate Likely Exam Questions
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Mode Toolbar & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1 border-b border-neutral-800/80">
        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#101114] border border-neutral-800 rounded-xl">
          <button
            onClick={() => setViewMode('revision')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              viewMode === 'revision'
                ? 'bg-amber-500 text-black shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Study Revision View
          </button>
          <button
            onClick={() => {
              if (!mockActive && !mockSubmitted) {
                handleStartMock();
              } else {
                setViewMode('mock');
              }
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              viewMode === 'mock'
                ? 'bg-amber-500 text-black shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Timed Practice Mock
            {mockActive && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping ml-1" />
            )}
          </button>
        </div>

        {/* Paper Actions: Print & Copy Markdown */}
        <div className="flex items-center gap-2">
          {viewMode === 'revision' && (
            <>
              <button
                onClick={() => toggleAllSolutions(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#131418] text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={() => toggleAllSolutions(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#131418] text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                Collapse All
              </button>
            </>
          )}

          <button
            onClick={handleCopyMarkdown}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#131418] text-neutral-200 hover:text-white border border-neutral-800 hover:border-neutral-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Copy as Markdown document"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
            {copied ? 'Copied!' : 'Copy Markdown'}
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#131418] text-neutral-200 hover:text-white border border-neutral-800 hover:border-neutral-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Print or export as clean PDF examination paper"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            Print / PDF Paper
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: STUDY REVISION VIEW */}
      {viewMode === 'revision' && (
        <div className="space-y-6">
          {/* Likelihood & Type Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#0b0c0e] border border-neutral-800/80">
            {/* Likelihood Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-neutral-400 font-medium mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-amber-400" /> Likelihood:
              </span>
              {(['All', 'Highly Likely', 'Likely', 'Possible'] as const).map((lh) => {
                const isActive = likelihoodFilter === lh;
                return (
                  <button
                    key={lh}
                    onClick={() => setLikelihoodFilter(lh)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? lh === 'Highly Likely'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
                          : lh === 'Likely'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                          : lh === 'Possible'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
                          : 'bg-white text-black font-semibold'
                        : 'bg-[#14151a] text-neutral-400 hover:text-white border border-neutral-800/60'
                    }`}
                  >
                    {lh}
                  </button>
                );
              })}
            </div>

            {/* Question Type Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-neutral-400 font-medium mr-1">Type:</span>
              {(['All', 'theory', 'calculation', 'short_answer', 'multiple_choice'] as const).map((type) => {
                const isActive = typeFilter === type;
                const label =
                  type === 'All'
                    ? 'All'
                    : type === 'theory'
                    ? 'Theory'
                    : type === 'calculation'
                    ? 'Calculation'
                    : type === 'short_answer'
                    ? 'Short Answer'
                    : 'MCQ';
                return (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-black font-semibold'
                        : 'bg-[#14151a] text-neutral-400 hover:text-white border border-neutral-800/60'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-12 bg-[#0b0c0e] rounded-2xl border border-neutral-800 p-8 space-y-3">
                <AlertCircle className="w-8 h-8 text-neutral-500 mx-auto" />
                <p className="text-sm text-neutral-400">No questions match the selected filters.</p>
                <button
                  onClick={() => {
                    setLikelihoodFilter('All');
                    setTypeFilter('All');
                  }}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs text-white rounded-lg transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredQuestions.map((q) => {
                const isExpanded = !!expandedSolutions[q.id];

                // Likelihood styling
                const lhBadge =
                  q.likelihood === 'Highly Likely'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    : q.likelihood === 'Likely'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'bg-sky-500/10 text-sky-400 border border-sky-500/30';

                return (
                  <div
                    key={q.id}
                    className="bg-[#0b0c0e] border border-neutral-800/80 hover:border-neutral-700/80 rounded-2xl p-6 transition-all shadow-md space-y-4"
                  >
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-neutral-400 bg-neutral-900 border border-neutral-800 px-2.5 py-0.5 rounded-md">
                          Q{q.questionNumber}
                        </span>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${lhBadge}`}>
                          {q.likelihood === 'Highly Likely' ? '★ HIGHLY LIKELY' : q.likelihood === 'Likely' ? '◆ LIKELY' : '○ POSSIBLE'}
                        </span>
                        <span className="text-xs text-neutral-400">·</span>
                        <span className="text-xs font-semibold text-amber-400 tabular-nums bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                          [{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]
                        </span>
                        <span className="text-xs text-neutral-400">·</span>
                        <span className="text-xs text-neutral-300 font-medium capitalize">
                          {q.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-neutral-400">·</span>
                        <span className="text-xs text-neutral-400">
                          Difficulty: <span className="text-neutral-200 font-medium">{q.difficulty}</span>
                        </span>
                      </div>

                      <span className="text-xs text-neutral-400 truncate max-w-xs" title={q.topic}>
                        Topic: <span className="text-neutral-300">{q.topic}</span>
                      </span>
                    </div>

                    {/* Question Stem */}
                    <div className="text-sm text-neutral-100 font-medium leading-relaxed">
                      {q.question}
                    </div>

                    {/* MCQ Options Display */}
                    {q.type === 'multiple_choice' && q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, idx) => {
                          const letter = String.fromCharCode(65 + idx);
                          const isCorrect = isExpanded && opt.trim() === q.correctAnswer.trim();
                          return (
                            <div
                              key={idx}
                              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                                isCorrect
                                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-medium'
                                  : 'bg-[#111216] border-neutral-800/80 text-neutral-300'
                              }`}
                            >
                              <span className="font-mono font-bold text-neutral-400 shrink-0">{letter}.</span>
                              <span className="leading-snug">{opt}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Likelihood Rationale */}
                    <div className="p-3 rounded-xl bg-black/40 border border-neutral-800/60 text-xs text-neutral-400 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-neutral-300">Examiner Probability Rationale: </strong>
                        {q.likelihoodReasoning}
                      </div>
                    </div>

                    {/* Solution & Rubric Toggle */}
                    <div className="pt-2">
                      <button
                        onClick={() => toggleSolution(q.id)}
                        className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {isExpanded ? 'Hide Model Solution & Mark Scheme' : 'Reveal Model Answer & Marking Rubric'}
                      </button>

                      {/* Expanded Section */}
                      {isExpanded && (
                        <div className="mt-4 p-5 rounded-xl bg-[#060709] border border-neutral-800/90 space-y-4 animate-in fade-in duration-200">
                          {/* Model Solution */}
                          <div className="space-y-1.5">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Model Answer
                            </h4>
                            <div className="text-xs text-neutral-200 leading-relaxed bg-[#0d0e12] p-3.5 rounded-lg border border-neutral-800 whitespace-pre-line font-mono">
                              {q.correctAnswer}
                            </div>
                          </div>

                          {/* Step-by-Step for Calculations */}
                          {q.stepByStepSolution && q.stepByStepSolution.length > 0 && (
                            <div className="space-y-1.5">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                <Calculator className="w-3.5 h-3.5 text-amber-400" /> Worked Step-by-Step Calculation
                              </h4>
                              <div className="space-y-1 text-xs text-neutral-300 bg-[#0d0e12] p-3.5 rounded-lg border border-neutral-800 font-mono">
                                {q.stepByStepSolution.map((step, idx) => (
                                  <div key={idx} className="flex items-start gap-2">
                                    <span className="text-amber-400 shrink-0 font-bold">›</span>
                                    <span>{step}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Marking Rubric Breakdown */}
                          {q.rubric && q.rubric.length > 0 && (
                            <div className="space-y-1.5">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                                <Award className="w-3.5 h-3.5 text-sky-400" /> Examiner Marking Scheme & Rubric
                              </h4>
                              <ul className="space-y-1.5 text-xs text-neutral-300 bg-[#0d0e12] p-3.5 rounded-lg border border-neutral-800">
                                {q.rubric.map((r, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-sky-400 font-bold shrink-0">✓</span>
                                    <span>{r}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Examiner Tips & Traps */}
                          {q.examinerTips && (
                            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <div>
                                <strong>Examiner Warning: </strong>
                                {q.examinerTips}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: TIMED PRACTICE MOCK EXAM */}
      {viewMode === 'mock' && (
        <div className="space-y-6">
          {/* Mock Exam Top Control Bar */}
          <div className="bg-[#0b0c0e] border border-neutral-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                Simulated Examination Paper
              </span>
              <h2 className="text-lg font-bold text-white font-['Clash_Display']">
                {activePaper.title}
              </h2>
              <p className="text-xs text-neutral-400">
                {activePaper.instructions}
              </p>
            </div>

            {/* Countdown Clock & Actions */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-black border border-neutral-800 flex items-center gap-2.5">
                <Clock className={`w-4 h-4 ${mockTimerSeconds < 300 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
                <span className={`text-base font-mono font-bold tabular-nums ${mockTimerSeconds < 300 ? 'text-rose-400' : 'text-white'}`}>
                  {formatTime(mockTimerSeconds)}
                </span>
                {mockActive && (
                  <button
                    onClick={() => setIsTimerPaused(!isTimerPaused)}
                    className="ml-1 text-xs text-neutral-400 hover:text-white"
                    title={isTimerPaused ? 'Resume Timer' : 'Pause Timer'}
                  >
                    {isTimerPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-neutral-400" />}
                  </button>
                )}
              </div>

              {!mockSubmitted ? (
                <button
                  onClick={handleMockSubmit}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  Submit Paper
                </button>
              ) : (
                <button
                  onClick={handleStartMock}
                  className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-neutral-800 hover:bg-neutral-700 text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retake Exam
                </button>
              )}
            </div>
          </div>

          {/* Question Navigator Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
            {activePaper.questions.map((q, idx) => {
              const isAnswered = !!mockAnswers[q.id]?.trim();
              const isCurrent = activeMockQuestionIndex === idx;
              return (
                <button
                  key={q.id}
                  onClick={() => setActiveMockQuestionIndex(idx)}
                  className={`w-9 h-9 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center justify-center ${
                    isCurrent
                      ? 'bg-amber-500 text-black shadow-md ring-2 ring-amber-400/50'
                      : isAnswered
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-[#121316] text-neutral-400 border border-neutral-800 hover:text-white'
                  }`}
                >
                  {q.questionNumber}
                </button>
              );
            })}
          </div>

          {/* Active Mock Question Workspace */}
          {activePaper.questions[activeMockQuestionIndex] && (() => {
            const currentQ = activePaper.questions[activeMockQuestionIndex];
            const currentAns = mockAnswers[currentQ.id] || '';

            return (
              <div className="bg-[#0b0c0e] border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
                {/* Question Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-neutral-900 border border-neutral-800 text-neutral-300 px-3 py-1 rounded-lg">
                      Question {currentQ.questionNumber} of {activePaper.questions.length}
                    </span>
                    <span className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-md">
                      [{currentQ.marks} Marks]
                    </span>
                    <span className="text-xs text-neutral-400 uppercase tracking-wide">
                      {currentQ.type.replace('_', ' ')}
                    </span>
                  </div>

                  <span className="text-xs text-neutral-400">
                    Topic: <strong className="text-neutral-300">{currentQ.topic}</strong>
                  </span>
                </div>

                {/* Question Prompt */}
                <div className="text-base text-white font-medium leading-relaxed">
                  {currentQ.question}
                </div>

                {/* Interactive Answer Input */}
                {currentQ.type === 'multiple_choice' && currentQ.options && (
                  <div className="space-y-2.5 pt-2">
                    {currentQ.options.map((opt, oIdx) => {
                      const letter = String.fromCharCode(65 + oIdx);
                      const isSelected = currentAns === opt;
                      return (
                        <button
                          key={oIdx}
                          disabled={mockSubmitted}
                          onClick={() => setMockAnswers((prev) => ({ ...prev, [currentQ.id]: opt }))}
                          className={`w-full text-left p-4 rounded-xl border text-sm flex items-start gap-3 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500/50 text-white font-medium shadow-sm'
                              : 'bg-[#121316] border-neutral-800 text-neutral-300 hover:bg-[#18191f]'
                          }`}
                        >
                          <span className="font-mono font-bold text-neutral-400 shrink-0">{letter}.</span>
                          <span className="leading-snug">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {currentQ.type !== 'multiple_choice' && (
                  <div className="space-y-2 pt-2">
                    <label className="text-xs text-neutral-400 font-medium">Candidate Written Response:</label>
                    <textarea
                      disabled={mockSubmitted}
                      value={currentAns}
                      onChange={(e) => setMockAnswers((prev) => ({ ...prev, [currentQ.id]: e.target.value }))}
                      placeholder={
                        currentQ.type === 'calculation'
                          ? 'Write your calculations step-by-step with formulas and final units...'
                          : 'Write your academic thesis, definitions, and supporting evidence...'
                      }
                      className="w-full min-h-[220px] p-4 bg-[#121316] border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 font-mono leading-relaxed"
                    />
                  </div>
                )}

                {/* Post-Submit Detailed Marking Report for Current Question */}
                {mockSubmitted && (
                  <div className="p-5 rounded-xl bg-[#07080a] border border-neutral-800 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-400" /> Examiner Evaluation & Score
                      </h4>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
                        Awarded: {mockEvaluatedScores[currentQ.id] || 0} / {currentQ.marks} Marks
                      </span>
                    </div>

                    <div className="text-xs text-neutral-300 bg-[#0f1014] p-3.5 rounded-lg border border-neutral-800 space-y-1">
                      <strong className="text-emerald-400 block mb-1">Expected Model Solution:</strong>
                      <div className="font-mono text-neutral-200">{currentQ.correctAnswer}</div>
                    </div>

                    <div className="space-y-1 text-xs text-neutral-300 bg-[#0f1014] p-3.5 rounded-lg border border-neutral-800">
                      <strong className="text-sky-400 block mb-1">Marking Scheme Checklist:</strong>
                      {currentQ.rubric.map((r, rIdx) => (
                        <div key={rIdx} className="flex items-start gap-1.5">
                          <span className="text-sky-400 font-bold">✓</span>
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation Next / Prev */}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                  <button
                    disabled={activeMockQuestionIndex === 0}
                    onClick={() => setActiveMockQuestionIndex((prev) => Math.max(0, prev - 1))}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#121316] text-neutral-300 hover:text-white border border-neutral-800 disabled:opacity-40 cursor-pointer"
                  >
                    Previous Question
                  </button>

                  <span className="text-xs text-neutral-400 font-medium">
                    Question {activeMockQuestionIndex + 1} of {activePaper.questions.length}
                  </span>

                  <button
                    disabled={activeMockQuestionIndex === activePaper.questions.length - 1}
                    onClick={() => setActiveMockQuestionIndex((prev) => Math.min(activePaper.questions.length - 1, prev + 1))}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-black font-bold disabled:opacity-40 cursor-pointer"
                  >
                    Next Question
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* PRINT-ONLY CLEAN UNIVERSITY EXAM PAPER SHEET (Appears when window.print() is called) */}
      <div className="hidden print:block text-black bg-white p-8">
        <div className="border-b-2 border-black pb-4 mb-6 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wider">{activePaper.title}</h1>
          <p className="text-sm font-semibold mt-1">Official Predicted Examination Paper</p>
          <div className="grid grid-cols-2 gap-4 mt-4 text-xs text-left border border-black p-3">
            <div>
              <strong>Time Allowed:</strong> {activePaper.timeAllowedMinutes} Minutes<br />
              <strong>Total Marks:</strong> {metrics.totalMarks} Marks
            </div>
            <div>
              <strong>Candidate ID / Matric No:</strong> ______________________<br />
              <strong>Date:</strong> {new Date().toLocaleDateString()}
            </div>
          </div>
          <p className="text-xs italic mt-3 text-left">
            <strong>Instructions:</strong> {activePaper.instructions}
          </p>
        </div>

        <div className="space-y-6">
          {activePaper.questions.map((q) => (
            <div key={q.id} className="border-b border-gray-300 pb-4">
              <div className="flex justify-between text-xs font-bold">
                <span>QUESTION {q.questionNumber} ({q.likelihood.toUpperCase()})</span>
                <span>[{q.marks} MARKS]</span>
              </div>
              <p className="text-sm mt-1">{q.question}</p>
              {q.options && q.options.length > 0 && (
                <div className="mt-2 text-xs space-y-1">
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx}>
                      {String.fromCharCode(65 + oIdx)}. {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
