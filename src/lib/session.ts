import type { ModuleId, Question } from '../types.ts';
import { LESSON_BY_ID, QUESTIONS, QUESTION_BY_ID } from '../data/questions.ts';
import { BOSS_QUESTIONS, EXAM_QUESTIONS, MODULES } from '../data/modules.ts';

export function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** A lesson's practice: every question, easiest first, shuffled within a level. */
export function buildLessonSession(lessonId: string): Question[] {
  const qs = LESSON_BY_ID[lessonId].questions;
  return ([1, 2, 3] as const).flatMap((d) => shuffle(qs.filter((q) => q.difficulty === d)));
}

/** Extra practice (Practice 2): easiest first, like Practice 1. */
export function buildExtraSession(lessonId: string): Question[] {
  const qs = LESSON_BY_ID[lessonId].extra;
  return ([1, 2, 3] as const).flatMap((d) => shuffle(qs.filter((q) => q.difficulty === d)));
}

/** Boss quiz: the harder questions of the module, spread over its lessons. */
export function buildBoss(moduleId: ModuleId): Question[] {
  const pool = QUESTIONS.filter((q) => q.moduleId === moduleId && q.difficulty >= 2);
  const groups: Record<string, Question[]> = {};
  for (const q of shuffle(pool)) (groups[q.lessonId] ??= []).push(q);
  const byLesson = Object.values(groups);
  // Round-robin over lessons so that every topic is represented.
  const picked: Question[] = [];
  for (let round = 0; picked.length < BOSS_QUESTIONS && byLesson.some((l) => l.length > round); round++)
    for (const l of shuffle(byLesson)) if (l[round] && picked.length < BOSS_QUESTIONS) picked.push(l[round]);
  return picked.sort((a, b) => a.difficulty - b.difficulty);
}

/** The exam simulator paper: harder questions mixed over every module that has content. */
export function buildExam(): Question[] {
  const modules = MODULES.filter((m) => QUESTIONS.some((q) => q.moduleId === m.id));
  const perModule = Math.ceil(EXAM_QUESTIONS / Math.max(1, modules.length));
  return shuffle(
    shuffle(modules.flatMap((m) => shuffle(QUESTIONS.filter((q) => q.moduleId === m.id && q.difficulty >= 2)).slice(0, perModule))).slice(
      0,
      EXAM_QUESTIONS,
    ),
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
