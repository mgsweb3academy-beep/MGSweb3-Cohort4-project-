import type {
  Lesson,
  TutorAnswer,
  QuizQuestion,
  QuizAttempt,
  Recommendation,
  InstructorDraft,
} from 'types';

// Lesson library is intentionally small and grounded in the current mock content.
export const MOCK_LESSON_LIBRARY: Lesson[] = [
  {
    id: 'lesson-solidity-fundamentals',
    courseId: 'crs1',
    title: 'Solidity Fundamentals',
    contentType: 'markdown',
    textContent: `Solidity is the language used for writing smart contracts on EVM-compatible chains. A contract is a set of state variables and functions that are deployed to a blockchain. Use visibility modifiers like public, private, and internal to control how functions are accessed. Events are a way to emit structured logs that can be indexed by off-chain clients.`,
    order: 1,
  },
  {
    id: 'lesson-smart-contract-security',
    courseId: 'crs2',
    title: 'Smart Contract Security',
    contentType: 'markdown',
    textContent: `Smart contract security starts with least privilege, safe arithmetic, and clear function boundaries. Reentrancy occurs when an external call re-enters a contract before state updates are complete. Access control should be explicit and auditable, and any user-controlled input must be validated before use.`,
    order: 1,
  },
  {
    id: 'lesson-evm-internals',
    courseId: 'crs4',
    title: 'EVM Internals',
    contentType: 'markdown',
    textContent: `The EVM executes bytecode in a deterministic stack machine. Gas is the unit that limits execution cost and prevents infinite loops. Storage writes are expensive and persistent; memory is transient and cheaper. Transactions are atomic, so a failing call reverts state changes.`,
    order: 1,
  },
];

export const MOCK_QUIZ_BANK: QuizQuestion[] = [
  {
    id: 'q1',
    lessonId: 'lesson-solidity-fundamentals',
    type: 'multiple_choice',
    prompt: 'Which visibility modifier is used when a function should be callable from outside the contract?',
    options: ['private', 'internal', 'public', 'hidden'],
    correctAnswer: 'public',
    explanation: 'A public function can be called externally and is part of the contract interface.',
    points: 1,
  },
  {
    id: 'q2',
    lessonId: 'lesson-solidity-fundamentals',
    type: 'true_false',
    prompt: 'Events are the right mechanism for emitting structured, indexable logs from a smart contract.',
    correctAnswer: 'true',
    explanation: 'Events are intended for structured log emission and can be indexed by indexers.',
    points: 1,
  },
  {
    id: 'q3',
    lessonId: 'lesson-smart-contract-security',
    type: 'short_answer',
    prompt: 'Name the main security issue caused when an external call re-enters a function before a contract has finished its state update.',
    correctAnswer: 'reentrancy',
    explanation: 'The issue is reentrancy, commonly exposed when external calls happen before state updates are done.',
    points: 2,
  },
  {
    id: 'q4',
    lessonId: 'lesson-evm-internals',
    type: 'multiple_choice',
    prompt: 'Which EVM resource is used to limit execution cost and prevent runaway computation?',
    options: ['storage', 'gas', 'memory', 'stack'],
    correctAnswer: 'gas',
    explanation: 'Gas is the execution meter and is charged for each computational step.',
    points: 1,
  },
];

const tutorAnswers: TutorAnswer[] = [];
const quizAttempts: QuizAttempt[] = [];
const instructorDrafts: InstructorDraft[] = [];

export function getLessonById(lessonId: string): Lesson | undefined {
  return MOCK_LESSON_LIBRARY.find((lesson) => lesson.id === lessonId);
}

export function createTutorAnswer(lessonId: string, question: string): TutorAnswer {
  const lesson = getLessonById(lessonId);
  const answerText = lesson
    ? `According to “${lesson.title}”, the lesson frames this around ${lesson.textContent?.slice(0, 120)}... In practice, you should anchor your answer in the contract’s public interface, safety checks, and the lesson’s stated constraints.`
    : 'I could not trace that lesson in the current lesson bank.';

  const answer: TutorAnswer = {
    id: `tutor-${Date.now()}`,
    lessonId,
    lessonTitle: lesson?.title ?? 'Unknown lesson',
    question,
    answer: answerText,
    evidence: lesson ? [{ lessonId: lesson.id, lessonTitle: lesson.title, excerpt: lesson.textContent || '' }] : [],
    confidence: 0.93,
    createdAt: new Date().toISOString(),
  };

  tutorAnswers.unshift(answer);
  return answer;
}

export function getQuizQuestions(lessonId: string): QuizQuestion[] {
  return MOCK_QUIZ_BANK.filter((question) => question.lessonId === lessonId);
}

export function gradeQuizAttempt(lessonId: string, answers: Record<string, string>): QuizAttempt {
  const questions = getQuizQuestions(lessonId);
  const score = questions.reduce((running, question) => {
    const answer = (answers[question.id] ?? '').trim().toLowerCase();
    const actual = (question.correctAnswer ?? '').trim().toLowerCase();
    const isCorrect = answer === actual;
    return running + (isCorrect ? question.points : 0);
  }, 0);

  const maxScore = questions.reduce((sum, question) => sum + (question.points ?? 0), 0);
  const result: QuizAttempt = {
    id: `quiz-${Date.now()}`,
    lessonId,
    score,
    maxScore,
    completedAt: new Date().toISOString(),
    answers: questions.map((question) => ({
      questionId: question.id,
      prompt: question.prompt,
      submittedAnswer: answers[question.id] ?? '',
      isCorrect: (answers[question.id] ?? '').trim().toLowerCase() === (question.correctAnswer ?? '').trim().toLowerCase(),
      pointsAwarded: ((answers[question.id] ?? '').trim().toLowerCase() === (question.correctAnswer ?? '').trim().toLowerCase()) ? question.points : 0,
    })),
  };

  quizAttempts.unshift(result);
  return result;
}

export function getLatestQuizAttempt(lessonId: string): QuizAttempt | undefined {
  return quizAttempts.find((attempt) => attempt.lessonId === lessonId);
}

export function createRecommendation(userId: string): Recommendation {
  const byUser = userId.length % 2 === 0 ? 'lesson-smart-contract-security' : 'lesson-evm-internals';
  const lesson = getLessonById(byUser);

  return {
    lessonId: byUser,
    lessonTitle: lesson?.title ?? 'Recommended lesson',
    reason: `Your recent progress shows the next best step is ${lesson?.title ?? 'the next lesson'} because you are ready to deepen the concept you just touched.`,
    confidence: 0.89,
  };
}

export function createInstructorDraft(courseId: string, type: 'announcement' | 'rubric' | 'content_suggestion', context: string): InstructorDraft {
  const base = {
    announcement: {
      title: 'Weekly cohort announcement',
      content: `This week’s cohort focus is to finish the latest lesson review and upload a task update before the next review cycle. Use the task board and manager log to keep your team aligned.`,
    },
    rubric: {
      title: 'Task review rubric',
      content: `Review rubric: 40% correctness, 30% clarity of commit intent, 20% test coverage, 10% documentation quality. Request changes if one dimension is missing.`,
    },
    content_suggestion: {
      title: 'Suggested content improvement',
      content: `Add a short lesson recap and one remediation example to the course. This keeps the next task from becoming a purely code-only exercise.`,
    },
  }[type];

  const draft: InstructorDraft = {
    id: `draft-${Date.now()}`,
    courseId,
    type,
    title: base.title,
    content: `${base.content}\n\nInstructor context: ${context}`,
    requiresApproval: true,
    createdAt: new Date().toISOString(),
    status: 'draft',
  };

  instructorDrafts.unshift(draft);
  return draft;
}

export function getInstructorDrafts(courseId: string): InstructorDraft[] {
  return instructorDrafts.filter((draft) => draft.courseId === courseId);
}
