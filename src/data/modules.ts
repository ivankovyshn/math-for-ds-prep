import type { ModuleId } from '../types.ts';

export interface ModuleMeta {
  id: ModuleId;
  title: string;
  blurb: string;
  /** Lesson titles shown while a module has no content yet. */
  planned?: string[];
}

export const MODULES: ModuleMeta[] = [
  {
    id: 'intro',
    title: 'Mathematical Language',
    blurb: 'Logic, sets, functions and how proofs work',
    planned: ['Logic and quantifiers', 'Sets and operations', 'Functions and mappings', 'Proof techniques', 'Mathematical induction', 'Complex numbers'],
  },
  {
    id: 'linalg',
    title: 'Linear Algebra',
    blurb: 'Vectors, matrices, determinants, eigenvalues',
  },
  {
    id: 'geometry',
    title: 'Analytic Geometry',
    blurb: 'Lines, planes, conics and surfaces with coordinates',
    planned: ['Coordinates and vectors', 'Dot, cross and triple products', 'Lines in the plane', 'Lines and planes in space', 'Conic sections', 'Polar coordinates', 'Quadric surfaces'],
  },
  {
    id: 'analysis',
    title: 'Analysis I',
    blurb: 'Limits, continuity, derivatives and their uses',
    planned: ['Real numbers, sup and inf', 'Limits of sequences', 'Limits of functions and continuity', 'The derivative', 'Mean value theorems', "Taylor's formula", 'Investigating functions'],
  },
  {
    id: 'datasci',
    title: 'Programming & Data Analysis',
    blurb: 'Python basics, NumPy and working with data',
    planned: ['Python basics', 'Functions and loops', 'Data structures', 'NumPy and vectorisation', 'Descriptive statistics', 'Working with tables'],
  },
];

export const MODULE_BY_ID = Object.fromEntries(MODULES.map((m) => [m.id, m])) as Record<ModuleId, ModuleMeta>;

/** Progress keys: one per lesson practice and one per module boss quiz. */
export const lessonKey = (lessonId: string) => `lesson:${lessonId}`;
export const bossKey = (moduleId: ModuleId) => `boss:${moduleId}`;

export const HEARTS_PER_SESSION = 3;
export const LESSON_BONUS_XP = 20;
export const BOSS_BONUS_XP = 50;
export const BOSS_QUESTIONS = 8;
export const EXAM_QUESTIONS = 10;
export const EXAM_SECONDS = 15 * 60;
