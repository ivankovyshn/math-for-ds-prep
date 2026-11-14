import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { Question, QuestionOption } from '../types.ts';
import { Diagram } from './Diagram.tsx';
import { Pseudocode } from './Pseudocode.tsx';
import { Inline, RichText, Tex } from './RichText.tsx';

/** The problem statement: text, optional formula, diagram and pseudocode. */
export function QuestionBody({ question }: { question: Question }) {
  return (
    <div className="space-y-4">
      {question.codeSnippet && <Pseudocode code={question.codeSnippet} />}
      {question.svgDiagramType && <Diagram type={question.svgDiagramType} />}
      <RichText text={question.promptText} className="text-[17px] leading-relaxed sm:text-lg" />
      {question.mathFormula && (
        <div className="text-xl sm:text-2xl">
          <Tex tex={question.mathFormula} block />
        </div>
      )}
    </div>
  );
}

interface OptionListProps {
  options: QuestionOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** When set, the options are locked and the right / wrong ones are revealed. */
  revealCorrectId?: string;
  disabled?: boolean;
}

/** Chunky answer cards. Number keys 1–5 select them (handled by the parent view). */
export function OptionList({ options, selectedId, onSelect, revealCorrectId, disabled }: OptionListProps) {
  const revealed = revealCorrectId !== undefined;
  return (
    <div className="grid gap-2.5" role="radiogroup" aria-label="Answer options">
      {options.map((o, i) => {
        const selected = o.id === selectedId;
        const isCorrect = revealed && o.id === revealCorrectId;
        const isWrongPick = revealed && selected && !isCorrect;
        const state = isCorrect
          ? 'border-primary bg-primary-soft'
          : isWrongPick
            ? 'border-danger bg-danger-soft'
            : selected
              ? 'border-accent bg-accent-soft'
              : 'border-line bg-surface enabled:hover:bg-surface2';
        const badge = isCorrect
          ? 'border-primary bg-primary text-white'
          : isWrongPick
            ? 'border-danger bg-danger text-white'
            : selected
              ? 'border-accent bg-accent text-white'
              : 'border-line text-muted';
        return (
          <motion.button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled || revealed}
            onClick={() => onSelect(o.id)}
            whileTap={disabled || revealed ? undefined : { scale: 0.98, y: 2 }}
            className={`flex min-h-14 w-full items-center gap-3 rounded-2xl border-2 border-b-4 px-3.5 py-2.5 text-left text-[16px] transition-colors sm:text-[17px] ${state} ${revealed && !isCorrect && !isWrongPick ? 'opacity-55' : ''}`}
          >
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 text-sm font-extrabold ${badge}`}>
              {isCorrect ? <Check size={18} strokeWidth={3} /> : isWrongPick ? <X size={18} strokeWidth={3} /> : i + 1}
            </span>
            <span className="min-w-0 flex-1 py-0.5">
              <Inline text={o.label} />
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
