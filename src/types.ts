export type ModuleId = 'intro' | 'linalg' | 'geometry' | 'analysis' | 'datasci';
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
}

/** A question as written in a lesson file; the lesson fills in moduleId and lessonId. */
export type QuestionDraft = Omit<Question, 'moduleId' | 'lessonId'>;

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
  | { kind: 'check'; prompt: string; answer: string };

export interface LectureSection {
  title: string;
  blocks: LectureBlock[];
}

export interface Lesson {
  id: string;
  moduleId: ModuleId;
  title: string;
  blurb: string;
  /** Estimated reading time of the lecture, in minutes. */
  minutes: number;
  lecture: LectureSection[];
  questions: Question[];
}

export interface MistakeEntry {
  misses: number;
  /** Consecutive correct answers in Review mode; the entry is cleared at 2. */
  correctStreak: number;
  lastMissedAt: string;
}

export interface ExamResult {
  id: string;
  finishedAt: string;
  durationSec: number;
  timeLimitSec: number;
  questionIds: string[];
  /** questionId -> chosen option id (missing = unanswered). */
  answers: Record<string, string>;
}
