// Local AI engine — generates realistic study content without external API calls.
// Produces summaries, key points, quiz questions, and chat responses using
// template-based natural language generation tuned to study/education context.

const SUBJECT_BANK = [
  'Biology', 'Chemistry', 'Physics', 'Mathematics', 'History', 'Literature',
  'Computer Science', 'Economics', 'Psychology', 'Philosophy', 'Statistics',
  'Engineering', 'Sociology', 'Political Science', 'Geography',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface SummaryResult {
  summary: string;
  keyPoints: string[];
}

export async function generateSummary(
  text: string,
  subject?: string
): Promise<SummaryResult> {
  await delay(1800 + Math.random() * 1200);

  const cleanText = text.trim();
  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
  const sentences = cleanText.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const topic = subject || pick(SUBJECT_BANK);
  const firstSentence = sentences[0] || 'the provided material';

  const summary = `This ${topic} document covers ${wordCount} words across ${sentences.length} key sections. ` +
    `The central theme revolves around ${firstSentence.toLowerCase().slice(0, 80)}. ` +
    `The material builds progressively from foundational concepts to applied examples, ` +
    `emphasizing critical relationships between core principles. ` +
    `Key definitions are introduced early and reinforced through worked examples, ` +
    `making the content suitable for both initial learning and exam revision. ` +
    `The document concludes with synthesis questions that connect earlier sections.`;

  const keyPointTemplates = [
    `Core definition of ${topic.toLowerCase()} terminology is established in the opening section`,
    `The material presents ${sentences.length} distinct conceptual frameworks`,
    `Worked examples demonstrate practical application of theoretical principles`,
    `Cause-and-effect relationships are mapped across multiple subtopics`,
    `Comparative analysis highlights differences between related concepts`,
    `The concluding section synthesizes earlier material into a unified model`,
    `Diagrams and tables reinforce spatial and categorical understanding`,
    `Historical context grounds abstract ideas in real-world development`,
    `Problem-solving strategies are scaffolded from simple to complex cases`,
    `Common misconceptions are explicitly addressed with corrective explanations`,
  ];

  const keyPoints = pickN(keyPointTemplates, 5);
  return { summary, keyPoints };
}

export interface QuizQuestionResult {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUESTION_TEMPLATES = [
  (topic: string) => ({
    question: `Which of the following best defines the primary concept of ${topic}?`,
    options: [
      `A systematic framework for understanding ${topic.toLowerCase()} principles and their applications`,
      `An unrelated collection of facts with no underlying structure`,
      `A single formula that solves all problems in the field`,
      `A historical event with no modern relevance`,
    ],
    correctIndex: 0,
    explanation: `The primary concept of ${topic} is best understood as a structured framework connecting principles to applications.`,
  }),
  (topic: string) => ({
    question: `What is the main purpose of studying ${topic}?`,
    options: [
      `To memorize isolated facts for short-term recall`,
      `To develop analytical thinking and understand underlying mechanisms`,
      `To replace practical experience entirely`,
      `To avoid engaging with other disciplines`,
    ],
    correctIndex: 1,
    explanation: `Studying ${topic} builds analytical thinking and reveals the mechanisms behind real-world phenomena.`,
  }),
  (topic: string) => ({
    question: `Which approach is most effective when learning ${topic}?`,
    options: [
      `Reading passively without taking notes`,
      `Cramming the night before an exam`,
      `Active recall combined with spaced practice`,
      `Ignoring foundational concepts entirely`,
    ],
    correctIndex: 2,
    explanation: `Active recall and spaced repetition are evidence-based strategies for durable learning in ${topic}.`,
  }),
  (topic: string) => ({
    question: `A key principle in ${topic} is best described as:`,
    options: [
      `Random outcomes with no predictable patterns`,
      `Consistent relationships that hold under defined conditions`,
      `Rules that change depending on the day of the week`,
      `Concepts that only apply in one specific scenario`,
    ],
    correctIndex: 1,
    explanation: `Key principles in ${topic} describe consistent relationships valid under defined conditions.`,
  }),
  (topic: string) => ({
    question: `Which scenario demonstrates correct application of ${topic} concepts?`,
    options: [
      `Applying a formula without understanding its assumptions`,
      `Identifying the relevant principle, then verifying conditions before use`,
      `Memorizing the answer without working through the problem`,
      `Guessing based on pattern matching alone`,
    ],
    correctIndex: 1,
    explanation: `Correct application requires identifying the right principle and verifying its conditions hold.`,
  }),
  (topic: string) => ({
    question: `What distinguishes a strong from a weak explanation in ${topic}?`,
    options: [
      `Length and verbosity of the answer`,
      `Use of technical jargon regardless of accuracy`,
      `Logical coherence supported by evidence and examples`,
      `Agreement with the most popular opinion`,
    ],
    correctIndex: 2,
    explanation: `Strong explanations in ${topic} are logically coherent and backed by evidence.`,
  }),
  (topic: string) => ({
    question: `Which study strategy is least effective for mastering ${topic}?`,
    options: [
      `Spaced practice over multiple sessions`,
      `Self-testing with practice questions`,
      `Re-reading notes repeatedly without recall`,
      `Connecting new ideas to prior knowledge`,
    ],
    correctIndex: 2,
    explanation: `Re-reading without recall creates illusions of competence; active retrieval is far more effective.`,
  }),
  (topic: string) => ({
    question: `In ${topic}, a "model" is best understood as:`,
    options: [
      `An exact replica of reality with no simplifications`,
      `A simplified representation that captures essential features`,
      `A guess with no supporting evidence`,
      `A purely artistic interpretation`,
    ],
    correctIndex: 1,
    explanation: `Models in ${topic} simplify reality while preserving the features relevant to the question.`,
  }),
  (topic: string) => ({
    question: `Which is a sign of deep understanding in ${topic}?`,
    options: [
      `Reciting definitions verbatim`,
      `Explaining concepts in your own words and applying them to new problems`,
      `Recognizing familiar problems without solving them`,
      `Memorizing the textbook page numbers`,
    ],
    correctIndex: 1,
    explanation: `Deep understanding shows when you can paraphrase and transfer concepts to novel situations.`,
  }),
  (topic: string) => ({
    question: `When facing an unfamiliar ${topic} problem, the best first step is:`,
    options: [
      `Immediately guess the final answer`,
      `Identify what is given, what is asked, and which principles apply`,
      `Skip the problem entirely`,
      `Copy a similar solved example without analysis`,
    ],
    correctIndex: 1,
    explanation: `Structuring the problem — given, asked, applicable principles — is the strongest first step.`,
  }),
];

export async function generateQuiz(
  topic: string,
  numQuestions: number,
  _difficulty?: 'easy' | 'medium' | 'hard',
): Promise<QuizQuestionResult[]> {
  void _difficulty;
  await delay(1500 + Math.random() * 1500);

  const count = Math.max(3, Math.min(10, numQuestions));
  const templates = pickN(QUESTION_TEMPLATES, count);
  return templates.map((t, i) => ({
    id: `q-${i}-${Date.now()}`,
    ...t(topic || 'the subject'),
  }));
}

const CHAT_RESPONSES = [
  (q: string) => `Great question about "${q.slice(0, 60)}". Let me break this down step by step.\n\n` +
    `First, it helps to identify the core concept. The underlying principle here connects several ideas you've likely seen in your coursework — once you frame it that way, the details fall into place more naturally.\n\n` +
    `A useful approach is to start with what you already know and build outward. Try sketching the relationships between the key terms, then check each link with a concrete example.\n\n` +
    `If you'd like, I can generate a quick quiz on this topic or pull together a summary you can review later.`,
  (q: string) => `Here's how I'd approach "${q.slice(0, 60)}":\n\n` +
    `1. Clarify what's being asked — restate the problem in your own words.\n` +
    `2. List the relevant principles and formulas.\n` +
    `3. Map the given information to each principle.\n` +
    `4. Work through the solution, checking units and assumptions at each step.\n` +
    `5. Sanity-check the final answer against intuition.\n\n` +
    `This five-step framework works across most quantitative and conceptual problems. Want me to apply it to a specific example?`,
  (q: string) => `That's a topic many students find tricky. The key insight for "${q.slice(0, 60)}" is that the surface details differ, but the underlying structure is shared with concepts you already understand.\n\n` +
    `Think of it like this: the new vocabulary is just a label for a pattern you've practiced before. Once you make that connection explicit, the confusion usually resolves.\n\n` +
    `I'd recommend creating a comparison table — old concept vs. new concept — and noting exactly where they align and where they diverge. That single exercise tends to lock in the understanding.`,
  (q: string) => `Let me give you a structured explanation of "${q.slice(0, 60)}".\n\n` +
    `**Definition:** The core idea is a relationship between inputs and outputs that holds under specific conditions.\n\n` +
    `**Why it matters:** It lets you predict outcomes without measuring every case, which is the foundation of efficient problem-solving.\n\n` +
    `**Common pitfall:** Students often forget to check whether the conditions are met before applying it — always verify assumptions first.\n\n` +
    `**Next step:** Try two practice problems, one where conditions hold and one where they don't, and compare your reasoning.`,
  (q: string) => `Good — this is exactly the kind of question that deepens understanding. For "${q.slice(0, 60)}":\n\n` +
    `The most effective study technique here is interleaving. Instead of drilling one type of problem repeatedly, mix related problem types in the same session. Research shows this feels harder in the moment but produces much stronger retention.\n\n` +
    `Pair that with retrieval practice: close your notes and write everything you remember, then check what you missed. Repeat with shorter gaps each round.\n\n` +
    `Would you like me to set up a study plan for this topic this week?`,
];

export async function generateChatResponse(prompt: string): Promise<string> {
  await delay(900 + Math.random() * 1100);
  return pick(CHAT_RESPONSES)(prompt);
}

export const SUGGESTED_PROMPTS = [
  'Explain the most effective study techniques for long-term retention',
  'How do I prepare for an exam in one week?',
  'Create a study schedule for my upcoming exams',
  'What is the Feynman technique and how do I use it?',
  'How can I improve my focus while studying?',
  'Explain active recall and spaced repetition',
];

export const RECOMMENDATIONS = [
  {
    title: 'Focus on weak areas',
    description: 'Your quiz scores in Biology are 23% lower than your average. Generate a targeted quiz to close the gap.',
    action: 'Generate quiz',
    icon: 'target',
  },
  {
    title: 'Maintain your streak',
    description: "You're on a 5-day study streak. A 30-minute session today keeps it alive and boosts retention.",
    action: 'Log study time',
    icon: 'flame',
  },
  {
    title: 'Review past notes',
    description: "You summarized 3 notes last week but haven't revisited them. Spaced recall improves memory.",
    action: 'Open notes',
    icon: 'book',
  },
  {
    title: 'Plan ahead for exams',
    description: 'Your Calculus exam is in 9 days. Block out 2-hour review sessions starting this weekend.',
    action: 'Open planner',
    icon: 'calendar',
  },
];
