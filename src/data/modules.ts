import type { ModuleId } from '../types.ts';

export interface ModuleMeta {
  id: ModuleId;
  title: string;
  blurb: string;
  /** Lesson titles shown while a module has no content yet. */
  planned?: string[];
  /** Every lesson is open from the start (a refresher you dip into), instead of unlocking one by one. */
  freeOrder?: boolean;
}

export const MODULES: ModuleMeta[] = [
  {
    id: 'school',
    title: 'School Maths Toolkit',
    blurb: 'Fractions, powers, equations, logarithms and trigonometry: the basics every later module uses',
    freeOrder: true,
  },
  {
    id: 'intro',
    title: 'Mathematical Language',
    blurb: 'Logic, sets, functions, proofs and complex numbers',
  },
  {
    id: 'linalg',
    title: 'Linear Algebra',
    blurb: 'Vectors, matrices, eigenvalues, projections and SVD',
  },
  {
    id: 'calculus',
    title: 'Calculus & Analysis',
    blurb: 'Limits, derivatives, integrals and gradients in many variables',
  },
  {
    id: 'probability',
    title: 'Probability',
    blurb: 'Random events, distributions and limit theorems',
  },
  {
    id: 'statistics',
    title: 'Statistics',
    blurb: 'Learning from data: estimation, inference and regression',
  },
  {
    id: 'optimization',
    title: 'Optimization',
    blurb: 'Convexity, gradient descent and constrained problems',
  },
  {
    id: 'programming',
    title: 'Programming Foundations',
    blurb: 'Python and NumPy as a tool for everything above',
  },
];

export const MODULE_BY_ID = Object.fromEntries(MODULES.map((m) => [m.id, m])) as Record<ModuleId, ModuleMeta>;

/** Progress keys: one per lesson and one per module test (stored as "boss:" for compatibility with saved progress). */
export const lessonKey = (lessonId: string) => `lesson:${lessonId}`;
export const testKey = (moduleId: ModuleId) => `boss:${moduleId}`;

export const HEARTS_PER_SESSION = 3;
/** Practice 1 completes a lesson with at most this many mistakes; more open Extra practice. */
export const PRACTICE_MAX_MISTAKES = 1;
export const LESSON_BONUS_XP = 20;
export const TEST_BONUS_XP = 50;
export const TEST_QUESTIONS = 8;
/** Review: questions per session, spread evenly over the lessons passed so far. */
export const REVIEW_QUESTIONS = 15;
