import type { Question } from '../types.ts';
import { geometry } from './questions/geometry.ts';
import { calculus } from './questions/calculus.ts';
import { combinatorics } from './questions/combinatorics.ts';
import { probability } from './questions/probability.ts';
import { algorithms } from './questions/algorithms.ts';

/**
 * The complete question bank. Each module file holds 12 questions:
 * four per difficulty level (1 = intuition, 2 = core mechanics, 3 = exam level).
 * See README.md for how to add a question.
 */
export const QUESTIONS: Question[] = [
  ...geometry,
  ...calculus,
  ...combinatorics,
  ...probability,
  ...algorithms,
];

export const QUESTION_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q]),
);
