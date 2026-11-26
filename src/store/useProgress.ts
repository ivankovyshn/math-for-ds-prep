import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MistakeEntry } from '../types.ts';

/**
 * Everything that describes a learner. This is the only state that is persisted.
 *
 * Migration note: the shape maps directly onto tables —
 *   profile(xp, streak_count, last_active_date, theme)
 *   completed_nodes(node_key, best_correct, total, completed_at)   -- node_key: lesson:<id> | boss:<module>
 *   lectures_read(lesson_id, read_at)
 *   extra_unlocked(lesson_id, unlocked_at)
 *   mistakes(question_id, misses, correct_streak, last_missed_at)
 * To move to Supabase/PostgreSQL, replace the `persist` storage below with an
 * adapter that reads and writes these rows; the components do not need to change.
 */
export interface ProgressData {
  xp: number;
  streakCount: number;
  /** Local date (YYYY-MM-DD) of the last finished session. */
  lastActiveDate: string | null;
  completedNodes: Record<string, { bestCorrect: number; total: number; completedAt: string }>;
  /** lessonId -> ISO time the lecture was first read to the end. */
  lecturesRead: Record<string, string>;
  /** lessonId -> ISO time Extra practice was opened by a Practice 1 with two or more mistakes. */
  extraUnlocked: Record<string, string>;
  mistakes: Record<string, MistakeEntry>;
  theme: 'dark' | 'light';
}

interface ProgressActions {
  addXp: (amount: number) => void;
  /** Logs an answer. `inReview` answers can clear a mistake; others can only add one. */
  recordAnswer: (questionId: string, correct: boolean, inReview: boolean, seed?: number) => void;
  completeNode: (key: string, correct: number, total: number) => void;
  markLectureRead: (lessonId: string) => void;
  unlockExtra: (lessonId: string) => void;
  touchStreak: () => void;
  toggleTheme: () => void;
  importData: (data: ProgressData) => void;
  reset: () => void;
}

const initial: ProgressData = {
  xp: 0,
  streakCount: 0,
  lastActiveDate: null,
  completedNodes: {},
  lecturesRead: {},
  extraUnlocked: {},
  mistakes: {},
  theme: 'dark',
};

export const localDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDate(d);
};

/** Correct answers in a row (in Review) needed to clear a mistake. */
export const REVIEW_CLEAR_STREAK = 2;

export const useProgress = create<ProgressData & ProgressActions>()(
  persist(
    (set) => ({
      ...initial,

      addXp: (amount) => set((s) => ({ xp: s.xp + amount })),

      recordAnswer: (questionId, correct, inReview, seed) =>
        set((s) => {
          const mistakes = { ...s.mistakes };
          const entry = mistakes[questionId];
          if (!correct) {
            mistakes[questionId] = {
              misses: (entry?.misses ?? 0) + 1,
              correctStreak: 0,
              lastMissedAt: new Date().toISOString(),
              ...(seed !== undefined && { seed }),
            };
          } else if (entry && inReview) {
            if (entry.correctStreak + 1 >= REVIEW_CLEAR_STREAK) delete mistakes[questionId];
            else mistakes[questionId] = { ...entry, correctStreak: entry.correctStreak + 1 };
          }
          return { mistakes };
        }),

      completeNode: (key, correct, total) =>
        set((s) => {
          const prev = s.completedNodes[key];
          return {
            completedNodes: {
              ...s.completedNodes,
              [key]: {
                bestCorrect: Math.max(prev?.bestCorrect ?? 0, correct),
                total,
                completedAt: prev?.completedAt ?? new Date().toISOString(),
              },
            },
          };
        }),

      markLectureRead: (lessonId) =>
        set((s) => (s.lecturesRead[lessonId] ? {} : { lecturesRead: { ...s.lecturesRead, [lessonId]: new Date().toISOString() } })),

      unlockExtra: (lessonId) =>
        set((s) => (s.extraUnlocked[lessonId] ? {} : { extraUnlocked: { ...s.extraUnlocked, [lessonId]: new Date().toISOString() } })),

      touchStreak: () =>
        set((s) => {
          const today = localDate();
          if (s.lastActiveDate === today) return {};
          return {
            lastActiveDate: today,
            streakCount: s.lastActiveDate === yesterday() ? s.streakCount + 1 : 1,
          };
        }),

      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

      // Files exported before v3 may still carry exam results; only known fields are taken.
      importData: ({ xp, streakCount, lastActiveDate, completedNodes, lecturesRead, extraUnlocked, mistakes, theme }) =>
        set({ ...initial, xp, streakCount, lastActiveDate, completedNodes, lecturesRead: lecturesRead ?? {}, extraUnlocked: extraUnlocked ?? {}, mistakes, theme: theme ?? 'dark' }),

      reset: () => set((s) => ({ ...initial, theme: s.theme })),
    }),
    {
      name: 'mathds-progress',
      version: 3,
      // v1 was the entrance-exam trainer: its questions are gone, so only XP, streak and theme carry over.
      migrate: (persisted, version) => {
        const old = (persisted ?? {}) as Partial<ProgressData>;
        if (version < 2) return { ...initial, xp: old.xp ?? 0, streakCount: old.streakCount ?? 0, lastActiveDate: old.lastActiveDate ?? null, theme: old.theme ?? 'dark' };
        // v3 retired the exam simulator: its results are dropped.
        const { examResults: _dropped, ...rest } = old as Partial<ProgressData> & { examResults?: unknown };
        return { ...initial, ...rest };
      },
    },
  ),
);

/** The streak shown to the user: it lapses if a whole day was skipped. */
export function currentStreak(s: Pick<ProgressData, 'streakCount' | 'lastActiveDate'>): number {
  if (!s.lastActiveDate) return 0;
  return s.lastActiveDate === localDate() || s.lastActiveDate === yesterday() ? s.streakCount : 0;
}

export function exportProgress(): ProgressData {
  const { xp, streakCount, lastActiveDate, completedNodes, lecturesRead, extraUnlocked, mistakes, theme } = useProgress.getState();
  return { xp, streakCount, lastActiveDate, completedNodes, lecturesRead, extraUnlocked, mistakes, theme };
}

export function isProgressData(x: unknown): x is ProgressData {
  if (!x || typeof x !== 'object') return false;
  const d = x as Record<string, unknown>;
  return (
    typeof d.xp === 'number' &&
    typeof d.completedNodes === 'object' && d.completedNodes !== null &&
    typeof d.mistakes === 'object' && d.mistakes !== null
  );
}
