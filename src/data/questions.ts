import type { Lesson, ModuleId } from '../types.ts';
import { intro } from './lessons/intro/index.ts';
import { linalg } from './lessons/linalg/index.ts';

/**
 * Every lesson with content, in path order. A lesson file holds the lecture
 * and its practice questions together. See README.md for the format.
 */
export const LESSONS: Lesson[] = [...intro, ...linalg];

export const LESSON_BY_ID: Record<string, Lesson> = Object.fromEntries(LESSONS.map((l) => [l.id, l]));

export const lessonsOf = (moduleId: ModuleId) => LESSONS.filter((l) => l.moduleId === moduleId);

export const QUESTIONS = LESSONS.flatMap((l) => l.questions);

export const QUESTION_BY_ID = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));
