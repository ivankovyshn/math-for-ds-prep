import type { Difficulty, ModuleId, NodeId, Question } from '../types.ts';
import { QUESTIONS, QUESTION_BY_ID } from '../data/questions.ts';
import { MODULES } from '../data/modules.ts';

export function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const pick = (moduleId: ModuleId, difficulty: Difficulty) =>
  QUESTIONS.filter((q) => q.moduleId === moduleId && q.difficulty === difficulty);

/** Selects the questions for one node of the skill path. */
export function buildNodeSession(moduleId: ModuleId, nodeId: NodeId): Question[] {
  const d1 = pick(moduleId, 1);
  const d2 = pick(moduleId, 2);
  const d3 = pick(moduleId, 3);
  switch (nodeId) {
    case 'intuition':
      // All level-1 questions, then one taste of level 2.
      return [...shuffle(d1), ...shuffle(d2).slice(0, 1)];
    case 'core':
      // One warm-up, all level-2 questions, one stretch question.
      return [...shuffle(d1).slice(0, 1), ...shuffle(d2), ...shuffle(d3).slice(0, 1)];
    case 'speed':
      return shuffle([...shuffle(d2).slice(0, 3), ...shuffle(d3).slice(0, 3)]);
    case 'boss':
      return [...shuffle(d2).slice(0, 3), ...shuffle(d3)];
  }
}

/** Two questions per module, mixed: the exam simulator paper. */
export function buildExam(): Question[] {
  return shuffle(
    MODULES.flatMap((m) => shuffle(QUESTIONS.filter((q) => q.moduleId === m.id && q.difficulty >= 2)).slice(0, 2)),
  );
}

/** Up to `limit` questions from the mistake queue, oldest mistakes first. */
export function buildReview(mistakes: Record<string, { lastMissedAt: string }>, limit = 7): Question[] {
  return Object.entries(mistakes)
    .filter(([id]) => QUESTION_BY_ID[id])
    .sort((a, b) => a[1].lastMissedAt.localeCompare(b[1].lastMissedAt))
    .slice(0, limit)
    .map(([id]) => QUESTION_BY_ID[id]);
}

export const xpForQuestion = (q: Question) => 8 + 2 * q.difficulty;

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
