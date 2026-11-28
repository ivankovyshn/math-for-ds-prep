export type ModuleId = 'school' | 'intro' | 'linalg' | 'calculus' | 'probability' | 'statistics' | 'optimization' | 'programming';
export type Difficulty = 1 | 2 | 3;

export interface QuestionOption {
  id: string;
  /** Plain text; wrap maths in $...$ to render it with KaTeX. */
  label: string;
  /** Why this specific distractor is tempting and wrong. Required on every wrong option. */
  trapExplanation?: string;
  /**
   * The option as a number or a list of numbers (a vector, or a matrix read row by row).
   * Used only by scripts/verify.mjs to re-check the answer key; the app never shows it.
   */
  value?: number | number[];
}

export interface Question {
  id: string;
  moduleId: ModuleId;
  lessonId: string;
  difficulty: Difficulty;
  /** Plain text; wrap maths in $...$. Use \n\n for a paragraph break. */
  promptText: string;
  /** Optional display formula (KaTeX string, no $ delimiters). */
  mathFormula?: string;
  /** Optional pseudocode block; indentation is preserved. */
  codeSnippet?: string;
  /** Key of a diagram component in src/components/Diagram.tsx. */
  svgDiagramType?: string;
  options: QuestionOption[];
  correctOptionId: string;
  /** First-principles breakdown, one step per entry. Supports $...$. */
  stepByStepSolution: string[];
  keyConceptTag: string;
  /**
   * What the Hint button shows. Defaults to the first solution step; set it when that step already gives the
   * answer away (scripts/verify.mjs checks this).
   */
  hint?: string;
  /** Set on Extra practice (Practice 2) questions; they stay out of module tests. */
  extra?: boolean;
  /**
   * Parametric questions: builds a fresh variant (new numbers, same idea and traps) from a random source.
   * The question object itself holds one fixed variant, used where no seed is known.
   */
  generate?: (rng: Rng) => QuestionVariant;
  /** The seed of the variant shown (parametric questions only). */
  seed?: number;
  /** The random values of this variant, for scripts/verify.mjs. */
  params?: Record<string, number | number[] | number[][]>;
}

/** The parts of a question that change from variant to variant. */
export type QuestionVariant = Pick<Question, 'promptText' | 'options' | 'stepByStepSolution'> &
  Partial<Pick<Question, 'mathFormula' | 'codeSnippet' | 'svgDiagramType' | 'params'>>;

/** A seeded random source: the same seed always gives the same variant. */
export interface Rng {
  /** Uniform in [0, 1). */
  next(): number;
  /** Integer in [lo, hi]. */
  int(lo: number, hi: number): number;
  /** Non-zero integer in [lo, hi]. */
  nonzero(lo: number, hi: number): number;
  pick<T>(items: readonly T[]): T;
  /** Draws with `make` until `ok` accepts the result (rejection sampling). */
  until<T>(make: () => T, ok: (value: T) => boolean): T;
}

/** A question as written in a lesson file; the lesson fills in moduleId and lessonId. */
export type QuestionDraft = Omit<Question, 'moduleId' | 'lessonId' | 'generate' | 'seed' | 'params'>;

/**
 * A parametric question as written in a lesson file. `generate` picks random values and returns the
 * prompt, options (with their trap explanations) and solution for them. The correct option id is fixed.
 */
export interface QuestionTemplate {
  id: string;
  difficulty: Difficulty;
  keyConceptTag: string;
  correctOptionId: string;
  /** See Question.hint; the same text for every variant. */
  hint?: string;
  generate: (rng: Rng) => QuestionVariant;
}

/**
 * One building block of a lecture. All text fields support $...$ maths,
 * blank-line paragraphs and "• " bullets (see RichText).
 */
export type LectureBlock =
  | { kind: 'text'; text: string }
  | { kind: 'formula'; tex: string; caption?: string }
  | { kind: 'box'; variant: 'definition' | 'theorem' | 'tip' | 'pitfall'; title: string; text: string }
  | { kind: 'example'; title: string; prompt: string; steps: string[] }
  | { kind: 'diagram'; type: string; caption?: string }
  /** A Python code block, optionally with the text it prints. */
  | { kind: 'code'; code: string; output?: string; caption?: string }
  | {
      /** A quick multiple-choice question inside the lecture: no hearts, instant explanation. */
      kind: 'quiz';
      /** <lesson id>-q<n>; scripts/verify.mjs re-checks it like a practice question. */
      id: string;
      prompt: string;
      options: QuestionOption[];
      correctOptionId: string;
      /** Shown after any answer. */
      explanation: string;
    };

export interface LectureSection {
  title: string;
  /**
   * The questions this section teaches, as id suffixes ('3' for la-04-3, 'x2' for la-04-x2). The section must
   * hold a worked example, a quick check or a code block that shows the move; the Hint links to it.
   * scripts/verify.mjs checks that every question of the lesson is covered exactly once.
   */
  covers?: string[];
  blocks: LectureBlock[];
}

/** A trusted outside resource for a hard topic, listed at the end of the lecture. */
export interface DeeperLink {
  title: string;
  url: string;
  /** Who publishes it and what form it takes, e.g. "3Blue1Brown · video, 17 min". */
  source: string;
}

export interface Lesson {
  id: string;
  moduleId: ModuleId;
  title: string;
  blurb: string;
  /** Estimated reading time of the lecture, in minutes. */
  minutes: number;
  lecture: LectureSection[];
  /** "Go deeper": outside resources for a topic the short lecture cannot fully carry. */
  deeper?: DeeperLink[];
  /** Practice 1: passed with at most one mistake, it completes the lesson. */
  questions: Question[];
  /** Practice 2 (Extra practice): easier questions on the same ideas, opened by a rough Practice 1. */
  extra: Question[];
}

export interface MistakeEntry {
  misses: number;
  /** Consecutive correct answers in Review mode; the entry is cleared at 2. */
  correctStreak: number;
  lastMissedAt: string;
  /** Seed of the missed variant of a parametric question, so Review can show the same numbers once. */
  seed?: number;
}
