import { DocumentItem, SummaryData, QuizItem, FlashcardDeck, PracticeTestItem, PlannerTask } from '../types';

export const SAMPLE_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-bio-101',
    name: 'Photosynthesis_and_Energy_Transfer.pdf',
    size: 2450000,
    pageCount: 18,
    uploadedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    fileType: 'application/pdf',
    extractedText: `CHAPTER 4: CELLULAR BIOENERGETICS & PHOTOSYNTHESIS
Photosynthesis is the fundamental biological process by which autotrophic organisms convert solar photon energy into stable chemical potential energy stored in carbohydrates (Page 2).

SECTION 4.1: THE CHLOROPLAST ARCHITECTURE
Photosynthesis in eukaryotic autotrophs occurs within double-membrane organelles termed chloroplasts. The inner fluid-filled space is the stroma, which contains soluble enzymes, chloroplast DNA, and ribosomes. Embedded within the stroma is an intricate network of disc-like membranous sacs termed thylakoids, stacked into granum (plural: grana). The thylakoid membrane encloses the thylakoid lumen. Chlorophyll a and accessory pigments (chlorophyll b, carotenoids) reside in photosystems embedded in this lipid bilayer (Page 4).

SECTION 4.2: THE LIGHT-DEPENDENT REACTIONS
The light reactions take place within the thylakoid membranes. When a photon strikes pigment molecules in Photosystem II (P680), electrons are excited to a higher energy level and transferred through an electron transport chain containing plastoquinone, cytochrome b6f complex, and plastocyanin to Photosystem I (P700). 
Water photolysis occurs at the oxygen-evolving complex of PSII:
2 H2O -> 4 H+ + 4 e- + O2 (Page 7).
This releases oxygen as a vital byproduct and generates a steep electrochemical proton gradient (delta pH) across the thylakoid membrane into the lumen. As protons translocate back into the stroma through CF0-CF1 ATP synthase, ADP is phosphorylated into ATP via chemiosmosis. Electrons from PSI reduce NADP+ to NADPH via ferredoxin-NADP+ reductase (FNR).

SECTION 4.3: THE LIGHT-INDEPENDENT REACTIONS (THE CALVIN-BENSON CYCLE)
The Calvin Cycle occurs within the stroma and does not directly depend on photons, but requires the ATP and NADPH generated in the light reactions. The cycle consists of three fundamental phases:
1. Carbon Fixation: The enzyme Ribulose-1,5-bisphosphate carboxylase/oxygenase (RuBisCO) catalyzes the carboxylation of ribulose-1,5-bisphosphate (RuBP, a 5-carbon sugar) with carbon dioxide (CO2), forming an unstable 6-carbon intermediate that spontaneously cleaves into two molecules of 3-phosphoglycerate (3-PGA) (Page 11).
2. Reduction Phase: ATP and NADPH are consumed to reduce 3-PGA into glyceraldehyde-3-phosphate (G3P). For every 3 turns of the cycle (fixing 3 CO2 molecules), 6 G3P are produced; one net G3P exits the cycle to synthesize glucose, fructose, and starch.
3. Regeneration of RuBP: The remaining 5 G3P molecules are rearranged through a series of complex phosphorylated sugar transformations consuming additional ATP to regenerate 3 molecules of RuBP, allowing the cycle to sustain continuous carbon assimilation (Page 14).

SECTION 4.4: PHOTOINHIBITION AND FACTORS AFFECTING PHOTOSYNTHESIS
Photosynthetic rate is constrained by three primary environmental variables described by Blackman's Principle of Limiting Factors:
- Irradiance (Light intensity): Beyond the light saturation point, additional photons cause photo-oxidation and D1 protein damage in PSII.
- Carbon Dioxide Concentration: Atmospheric CO2 (~420 ppm) is typically rate-limiting for C3 plants at high light.
- Temperature: Photosynthetic enzymatic reactions exhibit a thermal optimum (typically 20°C–30°C for temperate species); exceeding the optimum triggers RuBisCO denaturation and increases oxygenase activity leading to wasteful photorespiration (Page 16).`,
  },
  {
    id: 'doc-econ-201',
    name: 'Macroeconomics_Inflation_and_Monetary_Policy.pdf',
    size: 1840000,
    pageCount: 14,
    uploadedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    fileType: 'application/pdf',
    extractedText: `PRINCIPLES OF MONETARY ECONOMICS: INFLATION, INTEREST RATES & CENTRAL BANK POLICY
Inflation is defined as a sustained and generalized increase in the aggregate price level of goods and services over an extended period, which corresponds to an erosion of the purchasing power of money (Page 3).

SECTION 1: THE MEASUREMENT OF PRICE INDICES
Price level dynamics are predominantly tracked using two standard metrics:
1. Consumer Price Index (CPI): A Laspeyres-type fixed basket index measuring price changes of a typical consumption bundle purchased by urban households. Formula: CPI = (Cost of Market Basket in Current Year / Cost of Market Basket in Base Year) * 100.
2. Core Inflation vs. Headline Inflation: Core inflation excludes volatile food and energy components to identify underlying persistent structural trend inflation (Page 5).

SECTION 2: THE THEORETICAL DRIVERS OF INFLATION
Economists categorize the origins of inflation into two overarching mechanisms:
- Demand-Pull Inflation: Occurs when aggregate demand (AD = C + I + G + (X - M)) exceeds aggregate supply near full employment capacity ("too much money chasing too few goods").
- Cost-Push Inflation: Initiated by adverse supply shocks that elevate marginal production costs (e.g., global oil supply interruptions or geopolitical conflicts shifting the Short-Run Aggregate Supply curve inward).
- The Quantity Theory of Money (Fisher Equation):
M * V = P * Y
where M is money supply, V is velocity of circulation, P is aggregate price level, and Y is real GDP. Under classical neutrality assumptions with constant V and Y in the long run, growth in M translates directly into proportional increases in P (Page 9).

SECTION 3: CENTRAL BANK MANDATES AND TRANSMISSION CHANNELS
Modern central banks manage inflation through open market operations and policy interest rate adjustments (e.g., the Fed Funds Rate or Bank of England Base Rate).
The Monetary Transmission Mechanism operates through:
- Interest Rate Channel: Higher policy rates increase borrowing costs for businesses and mortgage holders, dampening consumption and capital expenditures.
- Asset Price Channel: Elevated discount rates depress equity and real estate valuations, inducing negative wealth effects.
- Exchange Rate Channel: Higher domestic yields attract foreign portfolio inflows, appreciating the home currency and lowering imported inflation (Page 12).`,
  },
];

export const SAMPLE_SUMMARIES: SummaryData[] = [
  {
    id: 'sum-bio-101',
    docId: 'doc-bio-101',
    title: 'Cellular Bioenergetics & Photosynthesis Master Revision Notes',
    subject: 'Molecular Biology & Botany',
    pageCount: 18,
    overview: 'An in-depth academic examination of chloroplast ultrastructure, photophosphorylation in the thylakoid membrane, and the enzymatic phases of the Calvin Cycle.',
    executiveSummary: 'Photosynthesis transforms electromagnetic solar radiation into stable organic carbon bonds through two coupled stages: the thylakoid light-dependent electron cascade yielding ATP and NADPH, and the stromatic Calvin-Benson cycle fixing atmospheric CO2 into triose phosphates via RuBisCO.',
    chapters: [
      {
        sectionHeading: 'Chloroplast Architecture & Thylakoid Organization',
        mainIdea: 'Eukaryotic photosynthesis is compartmentalized inside double-membrane chloroplasts.',
        keyPoints: [
          'Thylakoid membranes contain chlorophyll-protein complexes and ATP synthase enzymes.',
          'Granum stacking maximizes membrane surface area for light absorption.',
          'Stroma houses the soluble enzymes necessary for carbon fixation (Page 4).',
        ],
        examples: ['Comparison between stroma (analogous to mitochondrial matrix) and lumen.'],
        conclusion: 'Structural partitioning creates isolated proton compartments essential for chemiosmosis.',
      },
      {
        sectionHeading: 'Light Reactions & Photolysis',
        mainIdea: 'Photon absorption at PSII and PSI drives non-cyclic photophosphorylation and water splitting.',
        keyPoints: [
          'Photolysis at the oxygen-evolving complex splits water: 2H2O -> 4H+ + 4e- + O2.',
          'Cytochrome b6f pumps protons into the lumen establishing the electrochemical proton gradient.',
          'Terminal electron reduction converts NADP+ to NADPH catalyzed by FNR (Page 7).',
        ],
        examples: ['Z-scheme electron transport diagram from PSII through cytochrome complex to PSI.'],
        conclusion: 'Provides the high-energy reducing equivalents required for subsequent enzymatic carbon capture.',
      },
      {
        sectionHeading: 'The Calvin-Benson Cycle & RuBisCO Kinetics',
        mainIdea: 'The three-phase light-independent reaction reduces CO2 into glyceraldehyde-3-phosphate.',
        keyPoints: [
          'RuBisCO fixes 1 CO2 onto RuBP yielding two 3-phosphoglycerate molecules (Page 11).',
          'ATP and NADPH reduction consumes 6 ATP and 6 NADPH per 3 CO2 fixed.',
          'One net G3P is exported for hexose synthesis; 5 G3P regenerate 3 RuBP consuming 3 ATP.',
        ],
        examples: ['Synthesis of glucose-6-phosphate from triose phosphate precursors in the cytoplasm.'],
        conclusion: 'Requires 9 ATP and 6 NADPH per synthesized triose phosphate.',
      },
    ],
    keyPoints: [
      'Photosynthesis is divided into thylakoid light reactions and stromatic Calvin cycle (Page 2).',
      'Water photolysis is the source of all biogenic atmospheric oxygen (Page 7).',
      'ATP synthase harnesses the electrochemical proton gradient across the thylakoid membrane via chemiosmosis.',
      'RuBisCO is the primary carboxylating enzyme but suffers from competitive oxygenation (photorespiration) at elevated temperatures (Page 16).',
      'Net synthesis of one 6-carbon glucose molecule requires fixing 6 CO2 using 18 ATP and 12 NADPH.',
    ],
    definitions: [
      {
        term: 'RuBisCO',
        definition: 'Ribulose-1,5-bisphosphate carboxylase/oxygenase; the most abundant protein on Earth, catalyzing the rate-limiting carbon fixation step in the Calvin cycle.',
        pageRef: 'Page 11',
      },
      {
        term: 'Photolysis',
        definition: 'The photochemical cleavage of water molecules into diatomic oxygen, protons, and electrons at the manganese-containing oxygen-evolving complex of PSII.',
        pageRef: 'Page 7',
      },
      {
        term: 'Chemiosmosis',
        definition: 'The movement of hydrogen ions down their electrochemical concentration gradient across a semipermeable membrane through ATP synthase to generate ATP.',
        pageRef: 'Page 8',
      },
    ],
    formulas: [
      {
        formula: '2 H2O -> 4 H+ + 4 e- + O2',
        description: 'Photolysis of water occurring at Photosystem II (P680)',
        variables: 'H2O = water, H+ = protons in thylakoid lumen, e- = electrons, O2 = molecular oxygen',
        units: 'Stoichiometric molar ratio',
      },
      {
        formula: '6 CO2 + 6 H2O + light -> C6H12O6 + 6 O2',
        description: 'Overall chemical reaction of oxygenic photosynthesis',
        variables: 'CO2 = carbon dioxide, C6H12O6 = glucose',
        units: 'Standard thermodynamic balance',
      },
    ],
    datesAndFacts: [
      {
        dateOrFact: 'F.F. Blackman (1905)',
        personOrTopic: 'Principle of Limiting Factors',
        significance: 'Formulated the biological law stating that when a process depends on multiple factors, its rate is governed by the factor nearest its minimum value.',
      },
      {
        dateOrFact: 'Melvin Calvin (1950s)',
        personOrTopic: 'Calvin-Benson-Bassham Cycle',
        significance: 'Elucidated the light-independent enzymatic pathway of carbon fixation using carbon-14 radioactive labeling in Chlorella pyrenoidosa.',
      },
    ],
    keyTakeaways: [
      'Light reactions synthesize ATP and NADPH while releasing O2 from water.',
      'Calvin cycle synthesizes carbohydrates in the stroma using light reaction energy products.',
      'Photosystem II absorbs at 680nm, while Photosystem I absorbs at 700nm.',
      'Temperature, CO2 concentration, and photon flux density act as co-limiting factors.',
    ],
    revisionChecklist: [
      'Draw and label the Z-scheme of non-cyclic electron flow from PSII to PSI.',
      'Compare proton accumulation mechanisms in mitochondria vs chloroplasts.',
      'Explain the three enzymatic stages of the Calvin Cycle (Fixation, Reduction, Regeneration).',
      'Calculate the ATP and NADPH expenditure needed to yield one mol of maltose.',
      'Differentiate between chlorophyll a absorption spectrum and photosynthetic action spectrum.',
    ],
    summaryLength: 'Standard Summary',
    summaryStyle: 'Academic Notes',
    targetLevel: 'University',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

export const SAMPLE_QUIZZES: QuizItem[] = [
  {
    id: 'quiz-bio-1',
    docId: 'doc-bio-101',
    title: 'Photosynthesis & Bioenergetics Comprehensive Test',
    difficulty: 'Medium',
    totalQuestions: 5,
    score: 80,
    completed: true,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    focusArea: 'Important Concepts',
    questions: [
      {
        id: 'q1',
        question: 'Where does the photolysis of water occur during the light-dependent reactions?',
        type: 'multiple_choice',
        options: [
          'Inside the chloroplast stroma',
          'At the oxygen-evolving complex of Photosystem II in the thylakoid membrane',
          'Within the intermembrane space of the chloroplast envelope',
          'At the ferredoxin-NADP+ reductase enzyme complex',
        ],
        correctAnswer: 'At the oxygen-evolving complex of Photosystem II in the thylakoid membrane',
        userAnswer: 'At the oxygen-evolving complex of Photosystem II in the thylakoid membrane',
        isCorrect: true,
        explanation: 'Water photolysis (2 H2O -> 4 H+ + 4 e- + O2) takes place at the luminal side of Photosystem II (P680) via the manganese-calcium oxygen-evolving cluster.',
        pageRef: 'Page 7',
        topic: 'Light Reactions',
      },
      {
        id: 'q2',
        question: 'Which enzyme catalyzes the primary carbon fixation reaction in the Calvin Cycle?',
        type: 'multiple_choice',
        options: ['ATP Synthase', 'RuBisCO', 'Phosphofructokinase', 'PEP Carboxylase'],
        correctAnswer: 'RuBisCO',
        userAnswer: 'RuBisCO',
        isCorrect: true,
        explanation: 'RuBisCO (Ribulose-1,5-bisphosphate carboxylase/oxygenase) combines atmospheric CO2 with RuBP to yield 3-PGA.',
        pageRef: 'Page 11',
        topic: 'Calvin Cycle',
      },
      {
        id: 'q3',
        question: 'The thylakoid lumen becomes more acidic (lower pH) than the stroma during active electron transport.',
        type: 'true_false',
        options: ['True', 'False'],
        correctAnswer: 'True',
        userAnswer: 'True',
        isCorrect: true,
        explanation: 'Protons are pumped into the thylakoid lumen by cytochrome b6f and released during photolysis, dropping the luminal pH to approximately 4.5–5.0 while the stroma remains ~8.0.',
        pageRef: 'Page 8',
        topic: 'Chemiosmosis',
      },
      {
        id: 'q4',
        question: 'How many net molecules of Glyceraldehyde-3-Phosphate (G3P) exit the Calvin Cycle for every 3 molecules of CO2 fixed?',
        type: 'multiple_choice',
        options: ['1 G3P', '3 G3P', '6 G3P', '12 G3P'],
        correctAnswer: '1 G3P',
        userAnswer: '3 G3P',
        isCorrect: false,
        explanation: 'Fixing 3 CO2 yields 6 G3P molecules. However, 5 of these are required to regenerate 3 RuBP molecules, leaving exactly 1 net G3P for carbohydrate export.',
        pageRef: 'Page 14',
        topic: 'Calvin Cycle Stoichiometry',
      },
      {
        id: 'q5',
        question: 'What is the primary wavelength absorbed maximally by the reaction center of Photosystem I?',
        type: 'multiple_choice',
        options: ['450 nm', '550 nm', '680 nm', '700 nm'],
        correctAnswer: '700 nm',
        userAnswer: '700 nm',
        isCorrect: true,
        explanation: 'Photosystem I has a special reaction center chlorophyll a dimer denoted P700 because its absorbance peak is at 700 nm.',
        pageRef: 'Page 6',
        topic: 'Photosystems',
      },
    ],
  },
];

export const SAMPLE_FLASHCARD_DECKS: FlashcardDeck[] = [
  {
    id: 'deck-bio-1',
    docId: 'doc-bio-101',
    title: 'Cellular Respiration & Photosynthesis High-Yield Cards',
    topic: 'Biochemistry',
    totalCards: 6,
    cardsLearned: 4,
    lastStudied: new Date(Date.now() - 3600000 * 8).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    cards: [
      {
        id: 'c1',
        front: 'What is the exact reaction of water photolysis in Photosystem II?',
        back: '2 H2O -> 4 H+ + 4 e- + O2. Produces atmospheric oxygen and feeds electrons to the P680 reaction center.',
        hint: 'Involves 2 molecules of water producing oxygen gas.',
        category: 'Photochemistry',
        interval: 3,
        repetition: 2,
        easeFactor: 2.5,
        dueDate: new Date(Date.now() + 3600000 * 24 * 3).toISOString(),
        state: 'mastered',
      },
      {
        id: 'c2',
        front: 'What molecule acts as the terminal electron acceptor in the non-cyclic light reactions?',
        back: 'NADP+, which is reduced to NADPH by the enzyme ferredoxin-NADP+ reductase (FNR).',
        hint: 'A phosphorylated dinucleotide coenzyme.',
        category: 'Electron Transport',
        interval: 1,
        repetition: 1,
        easeFactor: 2.3,
        dueDate: new Date(Date.now() + 3600000 * 24).toISOString(),
        state: 'learning',
      },
      {
        id: 'c3',
        front: 'Name the 3 distinct phases of the Calvin-Benson Cycle.',
        back: '1. Carbon Fixation (catalyzed by RuBisCO)\n2. Reduction (3-PGA to G3P consuming ATP/NADPH)\n3. RuBP Regeneration (consuming ATP)',
        hint: 'Fixation -> Reduction -> Regeneration',
        category: 'Calvin Cycle',
        interval: 4,
        repetition: 3,
        easeFactor: 2.6,
        dueDate: new Date(Date.now() + 3600000 * 24 * 4).toISOString(),
        state: 'mastered',
      },
      {
        id: 'c4',
        front: 'Why is RuBisCO considered an inefficient enzyme?',
        back: 'Because it can catalyze photorespiration by fixing O2 instead of CO2, consuming ATP without producing sugars, especially when stomata close in high heat.',
        hint: 'Competitive oxygenase activity.',
        category: 'Enzymology',
        interval: 2,
        repetition: 1,
        easeFactor: 2.4,
        dueDate: new Date().toISOString(),
        state: 'review',
      },
      {
        id: 'c5',
        front: 'How many ATP and NADPH are consumed to generate one net molecule of hexose glucose?',
        back: '18 ATP and 12 NADPH (generated from 6 turns of the Calvin cycle fixing 6 CO2).',
        hint: 'Double the requirement of one triose phosphate.',
        category: 'Stoichiometry',
        interval: 1,
        repetition: 0,
        easeFactor: 2.5,
        dueDate: new Date().toISOString(),
        state: 'new',
      },
      {
        id: 'c6',
        front: 'Define Chemiosmosis across the thylakoid membrane.',
        back: 'The generation of ATP using energy stored in a transmembrane electrochemical proton gradient (higher [H+] in lumen, lower in stroma) through ATP synthase.',
        hint: 'Proton-motive force driving phosphorylation.',
        category: 'Bioenergetics',
        interval: 3,
        repetition: 2,
        easeFactor: 2.5,
        dueDate: new Date(Date.now() + 3600000 * 24 * 2).toISOString(),
        state: 'mastered',
      },
    ],
  },
];

export const SAMPLE_PRACTICE_TESTS: PracticeTestItem[] = [
  {
    id: 'test-bio-midterm',
    docId: 'doc-bio-101',
    title: 'Cellular Bioenergetics Midterm Mock Exam',
    subject: 'Biology 101',
    durationMinutes: 15,
    passingScore: 70,
    instructions: 'This mock examination evaluates your comprehension of chloroplast mechanics, photophosphorylation, and the Calvin cycle. Manage your time carefully.',
    completed: false,
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: 'pt-1',
        number: 1,
        question: 'Which photosystem reaction center is responsible for the photolysis of water?',
        type: 'multiple_choice',
        options: ['Photosystem I (P700)', 'Photosystem II (P680)', 'ATP Synthase Complex', 'RuBisCO Enzyme'],
        correctAnswer: 'Photosystem II (P680)',
        explanation: 'Photosystem II reaction center P680 pulls electrons from water via the oxygen-evolving complex.',
        weight: 20,
      },
      {
        id: 'pt-2',
        number: 2,
        question: 'In eukaryotic plant cells, where is the highest concentration of protons found during the peak of light reactions?',
        type: 'multiple_choice',
        options: ['Cytoplasm', 'Chloroplast Stroma', 'Thylakoid Lumen', 'Outer Mitochondrial Membrane'],
        correctAnswer: 'Thylakoid Lumen',
        explanation: 'Protons accumulate in the narrow thylakoid lumen from photolysis and cytochrome b6f pumping, generating a proton gradient.',
        weight: 20,
      },
      {
        id: 'pt-3',
        number: 3,
        question: 'Cyclic photophosphorylation generates both ATP and NADPH.',
        type: 'true_false',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'Cyclic electron flow involves only Photosystem I and generates ATP without producing NADPH or releasing oxygen.',
        weight: 20,
      },
      {
        id: 'pt-4',
        number: 4,
        question: 'How many molecules of CO2 must enter the Calvin cycle to produce one molecule of glucose?',
        type: 'multiple_choice',
        options: ['1', '3', '6', '12'],
        correctAnswer: '6',
        explanation: 'Since glucose is a 6-carbon sugar (C6H12O6), 6 turns of the cycle (fixing 6 CO2) are required.',
        weight: 20,
      },
      {
        id: 'pt-5',
        number: 5,
        question: 'Which compound is regenerated at the conclusion of the Calvin cycle to accept incoming CO2?',
        type: 'multiple_choice',
        options: ['Oxaloacetate', 'Ribulose-1,5-bisphosphate (RuBP)', '3-phosphoglycerate', 'Pyruvate'],
        correctAnswer: 'Ribulose-1,5-bisphosphate (RuBP)',
        explanation: 'The regeneration phase consumes ATP to restructure G3P back into RuBP.',
        weight: 20,
      },
    ],
  },
];

export const SAMPLE_TASKS: PlannerTask[] = [
  {
    id: 'task-1',
    title: 'Review Photosynthesis Z-Scheme & Photolysis Diagrams',
    subject: 'Biology',
    dueDate: new Date(Date.now() + 3600000 * 24).toISOString().split('T')[0],
    durationMinutes: 45,
    priority: 'High',
    actionType: 'Deep Reading',
    tips: 'Focus on electron carriers: plastoquinone, cytochrome b6f, plastocyanin, ferredoxin.',
    completed: true,
  },
  {
    id: 'task-2',
    title: 'Practice 20 Flashcards on Calvin Cycle Stoichiometry',
    subject: 'Biology',
    dueDate: new Date(Date.now() + 3600000 * 24 * 2).toISOString().split('T')[0],
    durationMinutes: 30,
    priority: 'Medium',
    actionType: 'Revise Flashcards',
    tips: 'Recall the exact ATP/NADPH ratio (3:2) for each CO2 fixed.',
    completed: false,
  },
  {
    id: 'task-3',
    title: 'Complete Macroeconomics Mock Test on Central Bank Rates',
    subject: 'Economics',
    dueDate: new Date(Date.now() + 3600000 * 24 * 3).toISOString().split('T')[0],
    durationMinutes: 60,
    priority: 'High',
    actionType: 'Practice Test',
    tips: 'Review the interest rate and exchange rate transmission channels before starting.',
    completed: false,
  },
  {
    id: 'task-4',
    title: 'Summarize Chapter 5 Lecture Notes on Neurobiology',
    subject: 'Neuroscience',
    dueDate: new Date(Date.now() + 3600000 * 24 * 5).toISOString().split('T')[0],
    durationMinutes: 50,
    priority: 'Medium',
    actionType: 'Summarise',
    tips: 'Export summary as PDF to attach in revision binder.',
    completed: false,
  },
];
