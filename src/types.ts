export type ModuleId = 'geometry' | 'calculus' | 'combinatorics' | 'probability' | 'algorithms';
export type Difficulty = 1 | 2 | 3;
export type NodeId = 'intuition' | 'core' | 'speed' | 'boss';

export interface QuestionOption {
  id: string;
  /** Plain text; wrap maths in $...$ to render it with KaTeX. */
  label: string;
  /** Why this specific distractor is tempting and wrong. Required on every wrong option. */
  trapExplanation?: string;
  /** Numeric value of the option. Used only by scripts/verify.mjs to re-check the answer key. */
  value?: number;
}

export interface Question {
  id: string;
  moduleId: ModuleId;
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
