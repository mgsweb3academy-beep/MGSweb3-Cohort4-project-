'use client';

import * as React from 'react';
import { Button, Card } from 'ui';

export default function DashboardPage() {
  const [lessonId, setLessonId] = React.useState('lesson-solidity-fundamentals');
  const [question, setQuestion] = React.useState('How should I explain visibility modifiers in a smart contract?');
  const [answer, setAnswer] = React.useState<string | null>(null);
  const [recommendation, setRecommendation] = React.useState<string | null>(null);
  const [quizState, setQuizState] = React.useState<{ score: number; maxScore: number; answers: Array<{ prompt: string; submittedAnswer: string; isCorrect: boolean; pointsAwarded: number }> } | null>(null);

  const askTutor = async () => {
    const res = await fetch('/api/v1/ai/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId, question }),
    });
    const payload = await res.json();
    setAnswer(payload.answer);
  };

  const getRecommendation = async () => {
    const res = await fetch('/api/v1/ai/recommendation?userId=user_demo');
    const payload = await res.json();
    setRecommendation(`${payload.lessonTitle} — ${payload.reason}`);
  };

  const runQuiz = async () => {
    const res = await fetch('/api/v1/ai/quiz?lessonId=lesson-solidity-fundamentals');
    const payload = await res.json();
    const answers = payload.questions.reduce((acc: Record<string, string>, q: { id: string; correctAnswer?: string }) => {
      acc[q.id] = q.correctAnswer ?? '';
      return acc;
    }, {});

    const submit = await fetch('/api/v1/ai/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId: 'lesson-solidity-fundamentals', answers }),
    });
    const quizPayload = await submit.json();
    setQuizState({
      score: quizPayload.score,
      maxScore: quizPayload.maxScore,
      answers: quizPayload.answers,
    });
  };

  return (
    <main className="min-h-screen bg-[var(--ink)] text-[var(--chalk)] p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-[var(--signal)]">Student dashboard</p>
          <h1 className="text-3xl font-semibold">Welcome back to Corridor</h1>
          <p className="max-w-2xl text-[var(--dim)]">Your cohort work, task status, and manager updates stay in one place.</p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-[var(--ink-2)] p-6">
            <h2 className="text-xl font-semibold">Active tasks</h2>
            <p className="mt-2 text-[var(--dim)]">Your team is currently in review for Auth service.</p>
          </Card>
          <Card className="bg-[var(--ink-2)] p-6">
            <h2 className="text-xl font-semibold">Manager updates</h2>
            <p className="mt-2 text-[var(--dim)]">Reopened 3 tasks that were merged without a review.</p>
          </Card>
        </div>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="bg-[var(--ink-2)] p-6">
            <div className="mb-4">
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-[var(--signal)]">AI tutor</p>
              <h2 className="text-xl font-semibold">Grounded lesson help</h2>
            </div>
            <label className="mb-2 block text-sm text-[var(--dim)]">Lesson</label>
            <select value={lessonId} onChange={(e) => setLessonId(e.target.value)} className="mb-3 w-full rounded border border-[var(--line)] bg-[var(--ink)] p-2 text-[var(--chalk)]">
              <option value="lesson-solidity-fundamentals">Solidity Fundamentals</option>
              <option value="lesson-smart-contract-security">Smart Contract Security</option>
              <option value="lesson-evm-internals">EVM Internals</option>
            </select>
            <label className="mb-2 block text-sm text-[var(--dim)]">Question</label>
            <textarea value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full rounded border border-[var(--line)] bg-[var(--ink)] p-2 text-[var(--chalk)]" rows={4} />
            <div className="mt-3 flex gap-2">
              <Button onClick={askTutor}>Ask tutor</Button>
            </div>
            {answer && <div className="mt-4 rounded border border-[var(--line)] bg-[var(--ink)] p-4 text-sm text-[var(--chalk)]">{answer}</div>}
          </Card>

          <Card className="bg-[var(--ink-2)] p-6">
            <div className="mb-4">
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-[var(--signal)]">Quiz & recommendation</p>
              <h2 className="text-xl font-semibold">Practice and next-step guidance</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Button onClick={runQuiz}>Generate quiz score</Button>
                {quizState && (
                  <div className="mt-3 rounded border border-[var(--line)] bg-[var(--ink)] p-4 text-sm">
                    <p className="text-[var(--signal)]">Score: {quizState.score} / {quizState.maxScore}</p>
                    <ul className="mt-2 space-y-2">
                      {quizState.answers.map((item) => (
                        <li key={item.prompt} className="border-b border-[var(--line)] pb-2 last:border-0 last:pb-0">
                          <p>{item.prompt}</p>
                          <p className="text-[var(--dim)]">Answer: {item.submittedAnswer || '—'}</p>
                          <p className={item.isCorrect ? 'text-[var(--signal)]' : 'text-[var(--mark)]'}>{item.isCorrect ? 'Correct' : 'Needs review'} · {item.pointsAwarded} pts</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div>
                <Button onClick={getRecommendation}>Get recommendation</Button>
                {recommendation && <div className="mt-3 rounded border border-[var(--line)] bg-[var(--ink)] p-4 text-sm text-[var(--chalk)]">{recommendation}</div>}
              </div>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
