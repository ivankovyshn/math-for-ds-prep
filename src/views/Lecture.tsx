import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, ArrowRight, BookOpen, Clock, Eye, HelpCircle, Lightbulb, PenLine, Sparkles, Target, X } from 'lucide-react';
import type { LectureBlock, Lesson } from '../types.ts';
import { MODULE_BY_ID } from '../data/modules.ts';
import { useProgress } from '../store/useProgress.ts';
import { Diagram } from '../components/Diagram.tsx';
import { Inline, RichText, Tex } from '../components/RichText.tsx';
import { Button, IconButton, Kbd, ProgressBar } from '../components/ui.tsx';

interface Props {
  lesson: Lesson;
  /** Number of the lesson inside its module, for the header. */
  number: number;
  onExit: () => void;
  onStartPractice: () => void;
}

/**
 * The lecture of a lesson, shown one section at a time.
 * Reaching the last section marks the lecture as read, which unlocks the practice.
 */
export function Lecture({ lesson, number, onExit, onStartPractice }: Props) {
  const [idx, setIdx] = useState(0);
  const markLectureRead = useProgress((s) => s.markLectureRead);
  const sections = lesson.lecture;
  const section = sections[idx];
  const last = idx === sections.length - 1;

  useEffect(() => {
    if (last) markLectureRead(lesson.id);
  }, [last, lesson.id, markLectureRead]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [idx]);

  const next = () => (last ? onStartPractice() : setIdx(idx + 1));
  const back = () => setIdx(Math.max(0, idx - 1));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest('button') && e.key === 'Enter') return;
      if (e.key === 'ArrowRight' || e.key === 'Enter') next();
      else if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 bg-bg/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-3">
          <IconButton label="Close lecture" className="!h-10 !w-10 shrink-0 !border-0 !bg-transparent" onClick={onExit}>
            <X size={24} />
          </IconButton>
          <ProgressBar value={(idx + 1) / sections.length} tone="accent" className="flex-1" />
          <span className="flex items-center gap-1 text-sm font-extrabold tabular-nums text-muted" title="Estimated reading time">
            <Clock size={16} /> {lesson.minutes} min
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-36 pt-2">
        <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
          <BookOpen size={14} /> {MODULE_BY_ID[lesson.moduleId].title} · Lesson {number} · {idx + 1} / {sections.length}
        </div>
        {idx === 0 && <h1 className="mb-1 text-3xl font-extrabold leading-tight">{lesson.title}</h1>}
        <AnimatePresence mode="wait">
          <motion.article
            key={idx}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.16 }}
            className="space-y-5"
          >
            <h2 className="text-2xl font-extrabold leading-tight text-accent">{section.title}</h2>
            {section.blocks.map((b, i) => (
              <LectureBlockView key={i} block={b} />
            ))}
            {last && (
              <div className="rounded-2xl border-2 border-primary bg-primary-soft px-4 py-3 text-[15px]">
                <div className="flex items-center gap-2 font-extrabold text-primary">
                  <Sparkles size={18} /> Lecture complete
                </div>
                <p className="mt-1">Practice is unlocked: {lesson.questions.length} questions, 3 hearts. You can come back to this lecture at any time.</p>
              </div>
            )}
          </motion.article>
        </AnimatePresence>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t-2 border-line bg-bg">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button tone="neutral" onClick={back} disabled={idx === 0} aria-label="Previous section" className="!px-4">
            <ArrowLeft size={20} />
          </Button>
          <span className="hidden flex-1 items-center gap-1.5 text-xs text-muted sm:flex">
            <Kbd>←</Kbd> <Kbd>→</Kbd> navigate
          </span>
          <Button tone={last ? 'primary' : 'accent'} className="flex-1 sm:flex-none sm:w-60" onClick={next}>
            {last ? (
              <>
                <Target size={18} /> Start practice
              </>
            ) : (
              <>
                Next <ArrowRight size={18} />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

const boxStyles = {
  definition: { icon: PenLine, tone: 'border-accent bg-accent-soft', head: 'text-accent', label: 'Definition' },
  theorem: { icon: Lightbulb, tone: 'border-primary bg-primary-soft', head: 'text-primary', label: 'Key fact' },
  tip: { icon: Sparkles, tone: 'border-warn bg-surface', head: 'text-warn', label: 'Intuition' },
  pitfall: { icon: AlertTriangle, tone: 'border-danger bg-danger-soft', head: 'text-danger', label: 'Common trap' },
} as const;

/** Renders one lecture block; also used by the author's page (#all). */
export function LectureBlockView({ block }: { block: LectureBlock }) {
  switch (block.kind) {
    case 'text':
      return <RichText text={block.text} className="text-[17px] leading-relaxed" />;

    case 'formula':
      return (
        <figure className="rounded-2xl border-2 border-line bg-surface px-4 py-3">
          <div className="text-lg sm:text-xl">
            <Tex tex={block.tex} block />
          </div>
          {block.caption && (
            <figcaption className="mt-1 text-center text-sm text-muted">
              <Inline text={block.caption} />
            </figcaption>
          )}
        </figure>
      );

    case 'box': {
      const s = boxStyles[block.variant];
      const Icon = s.icon;
      return (
        <section className={`rounded-2xl border-l-4 px-4 py-3 ${s.tone}`}>
          <h3 className={`mb-1.5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider ${s.head}`}>
            <Icon size={15} className="shrink-0" /> {s.label} · {block.title}
          </h3>
          <RichText text={block.text} className="leading-relaxed" />
        </section>
      );
    }

    case 'example':
      return <Example block={block} />;

    case 'diagram':
      return (
        <figure>
          <Diagram type={block.type} large />
          {block.caption && (
            <figcaption className="mt-2 text-center text-sm text-muted">
              <Inline text={block.caption} />
            </figcaption>
          )}
        </figure>
      );

    case 'check':
      return <Check block={block} />;
  }
}

/** Worked example: the solution is revealed one step at a time. */
function Example({ block }: { block: Extract<LectureBlock, { kind: 'example' }> }) {
  const [shown, setShown] = useState(0);
  const done = shown >= block.steps.length;
  return (
    <section className="rounded-2xl border-2 border-line bg-surface">
      <div className="px-4 pt-3">
        <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-accent">
          <PenLine size={15} /> Worked example · {block.title}
        </h3>
        <RichText text={block.prompt} className="leading-relaxed" />
      </div>
      <ol className="space-y-2.5 px-4 pt-3">
        {block.steps.slice(0, shown).map((step, i) => (
          <motion.li key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 leading-relaxed">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-extrabold text-accent">{i + 1}</span>
            <span className="min-w-0 flex-1">
              <Inline text={step} />
            </span>
          </motion.li>
        ))}
      </ol>
      <div className="flex gap-2 px-4 py-3">
        {!done ? (
          <>
            <button type="button" onClick={() => setShown(shown + 1)} className="rounded-xl bg-accent-soft px-3 py-2 text-sm font-extrabold text-accent">
              {shown === 0 ? 'Show first step' : 'Next step'}
            </button>
            <button type="button" onClick={() => setShown(block.steps.length)} className="rounded-xl px-3 py-2 text-sm font-bold text-muted hover:text-fg">
              Show all
            </button>
          </>
        ) : (
          <span className="text-sm font-bold text-primary">Done: {block.steps.length} steps</span>
        )}
      </div>
    </section>
  );
}

/** "Check yourself": think first, then reveal. */
function Check({ block }: { block: Extract<LectureBlock, { kind: 'check' }> }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="rounded-2xl border-2 border-dashed border-warn px-4 py-3">
      <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-warn">
        <HelpCircle size={15} /> Check yourself
      </h3>
      <RichText text={block.prompt} className="leading-relaxed" />
      {open ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 rounded-xl bg-surface px-3 py-2">
          <RichText text={block.answer} className="leading-relaxed" />
        </motion.div>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="mt-3 flex items-center gap-1.5 rounded-xl bg-surface px-3 py-2 text-sm font-extrabold text-warn">
          <Eye size={16} /> Show answer
        </button>
      )}
    </section>
  );
}
