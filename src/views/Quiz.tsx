import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, CheckCircle2, ChevronDown, Clock, Dumbbell, Flame, Heart, HeartCrack, Lightbulb, Target, Trophy, X, XCircle, Zap } from 'lucide-react';
import type { LectureSection, Question } from '../types.ts';
import { LESSON_BY_ID } from '../data/questions.ts';
import { HEARTS_PER_SESSION } from '../data/modules.ts';
import { formatClock, shuffle, xpForQuestion } from '../lib/session.ts';
import { useProgress } from '../store/useProgress.ts';
import { OptionList, QuestionBody } from '../components/QuestionCard.tsx';
import { Inline } from '../components/RichText.tsx';
import { Button, IconButton, Kbd, ProgressBar } from '../components/ui.tsx';
import { isToolsEvent, ToolButtons, ToolsPanel } from '../components/Tools.tsx';
import { LectureBlockView } from './Lecture.tsx';

export interface QuizProps {
  title: string;
  questions: Question[];
  /**
   * 'lesson' uses hearts and can complete a node; 'mistakes' has no hearts and clears mistakes;
   * 'review' (mixed review of passed lessons) has no hearts and only records new mistakes.
   */
  mode: QuizMode;
  nodeKey?: string;
  bonusXp?: number;
  secondsPerQuestion?: number;
  onExit: () => void;
  onRetry: () => void;
  /** When set, the result screen offers to re-read the lesson's lecture. */
  onOpenLecture?: () => void;
  /**
   * Practice 1 of a lesson: the node completes only with at most this many mistakes.
   * More mistakes (or running out of hearts) open Extra practice instead.
   */
  maxMistakes?: number;
  onUnlockExtra?: () => void;
  onStartExtra?: () => void;
}

type Phase = 'answering' | 'feedback';

export function Quiz({ title, questions, mode, nodeKey, bonusXp = 0, secondsPerQuestion, onExit, onRetry, onOpenLecture, maxMistakes, onUnlockExtra, onStartExtra }: QuizProps) {
  const { addXp, recordAnswer, completeNode, touchStreak } = useProgress.getState();

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('answering');
  const [lastCorrect, setLastCorrect] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [hearts, setHearts] = useState(HEARTS_PER_SESSION);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [lastXp, setLastXp] = useState(0);
  const [outcome, setOutcome] = useState<null | Outcome>(null);
  // A lesson that was already passed stays passed; Practice 1 only gates the first pass.
  const [wasCompleted] = useState(() => !!(nodeKey && useProgress.getState().completedNodes[nodeKey]));
  const [timeLeft, setTimeLeft] = useState(secondsPerQuestion ?? 0);
  const [showSteps, setShowSteps] = useState(false);
  // Hint: the first step of the solution (or the question's own hint), for half the XP of the question.
  const [hint, setHint] = useState(false);
  const [lastHint, setLastHint] = useState(false);
  // The lecture section that teaches this question, opened over the session so that nothing is lost.
  const [sectionOpen, setSectionOpen] = useState(false);

  const q = questions[idx];
  // Options are shuffled once per question so that positions cannot be memorised.
  const options = useMemo(() => shuffle(q.options), [q]);
  const correctOption = q.options.find((o) => o.id === q.correctOptionId)!;
  const pickedOption = q.options.find((o) => o.id === selected);
  const hintText = q.hint ?? q.stepByStepSolution[0];
  const taught = teachingSection(q);

  const check = (timeout = false) => {
    if (phase !== 'answering' || outcome) return;
    if (!timeout && !selected) return;
    const correct = !timeout && selected === q.correctOptionId;
    recordAnswer(q.id, correct, mode === 'mistakes', q.seed);
    if (correct) {
      const full = mode === 'mistakes' ? 5 : xpForQuestion(q);
      const xp = hint ? Math.ceil(full / 2) : full;
      addXp(xp);
      setLastXp(xp);
      setXpEarned((v) => v + xp);
      setCorrectCount((v) => v + 1);
      setCombo(combo + 1);
      setBestCombo((b) => Math.max(b, combo + 1));
    } else {
      setCombo(0);
      if (mode === 'lesson') setHearts((h) => h - 1);
    }
    setLastCorrect(correct);
    setLastHint(hint);
    setTimedOut(timeout);
    setShowSteps(!correct);
    setPhase('feedback');
  };

  const finish = (result: 'passed' | 'failed') => {
    touchStreak();
    const mistakes = idx + 1 - correctCount;
    const tooMany = maxMistakes !== undefined && mistakes > maxMistakes;
    if (onUnlockExtra && (result === 'failed' || tooMany)) onUnlockExtra();
    if (result === 'passed' && tooMany && !wasCompleted) return setOutcome('extra');
    if (result === 'passed' && nodeKey) {
      completeNode(nodeKey, correctCount, questions.length);
      addXp(bonusXp);
      setXpEarned((v) => v + bonusXp);
    }
    setOutcome(result);
  };

  const next = () => {
    if (phase !== 'feedback' || outcome) return;
    if (mode === 'lesson' && hearts <= 0) return finish('failed');
    if (idx + 1 >= questions.length) return finish('passed');
    setIdx(idx + 1);
    setSelected(null);
    setHint(false);
    setSectionOpen(false);
    setPhase('answering');
    setTimeLeft(secondsPerQuestion ?? 0);
  };

  // Countdown for the speed drill.
  useEffect(() => {
    if (!secondsPerQuestion || phase !== 'answering' || outcome) return;
    if (timeLeft <= 0) {
      check(true);
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase, outcome, secondsPerQuestion]);

  // Keyboard: 1–5 select an option, H shows the hint, Enter checks / continues.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (outcome || sectionOpen || isToolsEvent(e)) return;
      if (phase === 'answering' && (e.key === 'h' || e.key === 'H') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setHint(true);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (phase === 'answering') check();
        else next();
      } else if (phase === 'answering' && /^[1-5]$/.test(e.key)) {
        const o = options[Number(e.key) - 1];
        if (o) setSelected(o.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (outcome) {
    return (
      <ResultScreen
        outcome={outcome}
        mode={mode}
        title={title}
        correct={correctCount}
        total={questions.length}
        answered={idx + 1}
        xp={xpEarned}
        bestCombo={bestCombo}
        onExit={onExit}
        onRetry={onRetry}
        onOpenLecture={onOpenLecture}
        onStartExtra={onStartExtra}
        maxMistakes={maxMistakes}
      />
    );
  }

  const answeredCount = idx + (phase === 'feedback' ? 1 : 0);
  const lowTime = !!secondsPerQuestion && timeLeft <= 15;

  return (
    <div className="tools-shift flex min-h-dvh flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-bg/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-3">
          <IconButton
            label="Leave session"
            className="!h-10 !w-10 shrink-0 !border-0 !bg-transparent"
            onClick={() => {
              if (answeredCount === 0 || window.confirm('Leave this session? Your progress in it will be lost.')) onExit();
            }}
          >
            <X size={24} />
          </IconButton>
          <ProgressBar value={answeredCount / questions.length} className="flex-1" />
          <ToolButtons />
          {combo >= 2 && (
            <motion.span key={combo} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="flex items-center gap-0.5 font-extrabold text-warn" title="Correct answers in a row">
              <Flame size={20} fill="currentColor" />
              {combo}
            </motion.span>
          )}
          {mode === 'lesson' && (
            <motion.span key={hearts} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="flex items-center gap-1 font-extrabold text-danger" title="Hearts left">
              <Heart size={22} fill="currentColor" />
              {hearts}
            </motion.span>
          )}
        </div>
      </header>

      {/* Problem */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-44 pt-2">
        <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted">
          <span>{title} · {idx + 1} / {questions.length}</span>
          {!!secondsPerQuestion && (
            <span className={`flex items-center gap-1 tabular-nums ${lowTime ? 'text-danger' : ''}`}>
              <Clock size={15} />
              {formatClock(timeLeft)}
            </span>
          )}
        </div>
        <>
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.18 }}
            className="space-y-5"
          >
            <QuestionBody question={q} />
            <OptionList
              options={options}
              selectedId={selected}
              onSelect={setSelected}
              revealCorrectId={phase === 'feedback' ? q.correctOptionId : undefined}
            />
            {hint && phase === 'answering' && (
              <motion.section initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border-l-4 border-warn bg-surface px-4 py-3">
                <h3 className="mb-1 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-warn">
                  <Lightbulb size={15} className="shrink-0" /> Hint{q.hint ? '' : ' · the first step'}
                </h3>
                <p className="leading-relaxed"><Inline text={hintText} /></p>
                {taught && (
                  <button
                    type="button"
                    onClick={() => setSectionOpen(true)}
                    className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-surface2 px-2.5 py-1.5 text-sm font-bold text-accent hover:brightness-110"
                  >
                    <BookOpen size={15} className="shrink-0" /> See it in the lecture: {taught.title}
                  </button>
                )}
              </motion.section>
            )}
          </motion.div>
        </>
      </main>

      {/* Check bar */}
      {phase === 'answering' && (
        <div data-tools-bar className="tools-shift-fixed fixed inset-x-0 bottom-0 border-t-2 border-line bg-bg">
          <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <span className="hidden items-center gap-1.5 text-xs text-muted sm:flex">
              <Kbd>1</Kbd>–<Kbd>{options.length}</Kbd> select · <Kbd>H</Kbd> hint · <Kbd>Enter</Kbd> check
            </span>
            <div className="flex w-full gap-3 sm:w-auto">
              <Button
                tone="neutral"
                className="!px-4"
                disabled={hint}
                onClick={() => setHint(true)}
                aria-label="Hint: show the first step of the solution, for half the XP"
                title="Hint (H): the first step of the solution, for half the XP"
              >
                <Lightbulb size={19} /> <span className="hidden sm:inline">Hint</span>
              </Button>
              <Button className="flex-1 sm:w-52 sm:flex-none" disabled={!selected} onClick={() => check()}>
                Check
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* First-principles feedback drawer */}
      <AnimatePresence>
        {phase === 'feedback' && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className={`tools-shift-fixed fixed inset-x-0 bottom-0 z-20 flex max-h-[78dvh] flex-col border-t-4 ${lastCorrect ? 'border-primary' : 'border-danger'} bg-surface shadow-[0_-12px_40px_rgba(0,0,0,0.35)]`}
            role="status"
            aria-live="polite"
          >
            <div className="mx-auto w-full max-w-2xl flex-1 space-y-4 overflow-y-auto px-4 pt-4">
              <div className={`flex items-center gap-2.5 text-xl font-extrabold ${lastCorrect ? 'text-primary' : 'text-danger'}`}>
                {lastCorrect ? <CheckCircle2 size={28} /> : <XCircle size={28} />}
                <span>{lastCorrect ? (combo >= 3 ? `Correct — ${combo} in a row!` : 'Correct!') : timedOut ? 'Time is up' : 'Not quite'}</span>
                {lastCorrect && (
                  <span className="ml-auto flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-sm">
                    <Zap size={15} fill="currentColor" /> +{lastXp} XP{lastHint ? ' · hint' : ''}
                  </span>
                )}
              </div>

              {!lastCorrect && (
                <div className="rounded-2xl border-2 border-line bg-bg px-4 py-3">
                  <div className="mb-1 text-xs font-extrabold uppercase tracking-wider text-primary">Correct answer</div>
                  <div className="text-[17px]"><Inline text={correctOption.label} /></div>
                </div>
              )}

              {!lastCorrect && pickedOption?.trapExplanation && (
                <section className="rounded-2xl bg-danger-soft px-4 py-3">
                  <h3 className="mb-1 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-danger">
                    <Target size={15} className="shrink-0" /> Distractor analysis · why your choice is a trap
                  </h3>
                  <p className="leading-relaxed"><Inline text={pickedOption.trapExplanation} /></p>
                </section>
              )}

              <section className="rounded-2xl border-2 border-line">
                <button
                  type="button"
                  onClick={() => setShowSteps((v) => !v)}
                  aria-expanded={showSteps}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-accent"
                >
                  <Lightbulb size={16} className="shrink-0" /> Why this works · first-principles breakdown
                  <ChevronDown size={18} className={`ml-auto transition-transform ${showSteps ? 'rotate-180' : ''}`} />
                </button>
                {showSteps && (
                  <ol className="space-y-2.5 px-4 pb-4">
                    {q.stepByStepSolution.map((step, i) => (
                      <li key={i} className="flex gap-3 leading-relaxed">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-extrabold text-accent">{i + 1}</span>
                        <span className="min-w-0"><Inline text={step} /></span>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              <div className="pb-1 text-xs font-bold text-muted">Key concept: {q.keyConceptTag}</div>
            </div>

            <div className="mx-auto w-full max-w-2xl px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <Button full tone={lastCorrect ? 'primary' : 'danger'} onClick={next}>
                Continue <Kbd>Enter</Kbd>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ToolsPanel pageKey={`${idx}-${q.id}`} pageLabel={`Question ${idx + 1}`} pin={q.promptText} suspended={phase === 'feedback' || sectionOpen} />

      <AnimatePresence>
        {sectionOpen && taught && <SectionSheet section={taught} lessonTitle={LESSON_BY_ID[q.lessonId].title} onClose={() => setSectionOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}

/** The lecture section whose `covers` lists this question (by its id suffix). */
function teachingSection(q: Question): LectureSection | undefined {
  const lesson = LESSON_BY_ID[q.lessonId];
  const suffix = q.id.slice(q.lessonId.length + 1);
  return lesson?.lecture.find((s) => s.covers?.includes(suffix));
}

/** One lecture section over the running session: read the worked example, then return to the question. */
function SectionSheet({ section, lessonTitle, onClose }: { section: LectureSection; lessonTitle: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={section.title}
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        exit={{ y: 40 }}
        transition={{ duration: 0.18 }}
        className="flex max-h-[88dvh] w-full max-w-2xl flex-col rounded-t-3xl border-2 border-line bg-bg shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b-2 border-line px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
              <BookOpen size={14} className="shrink-0" /> <span className="truncate">{lessonTitle} · lecture</span>
            </div>
            <h2 className="truncate text-lg font-extrabold text-accent">{section.title}</h2>
          </div>
          <IconButton label="Back to the question (Esc)" className="!h-10 !w-10 shrink-0" onClick={onClose}>
            <X size={22} />
          </IconButton>
        </div>
        <div className="space-y-5 overflow-y-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {section.blocks.map((b, i) => (
            <LectureBlockView key={i} block={b} />
          ))}
          <Button full tone="neutral" onClick={onClose}>
            Back to the question
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

type Outcome = 'passed' | 'failed' | 'extra';
export type QuizMode = 'lesson' | 'mistakes' | 'review';

function ResultScreen(p: {
  outcome: Outcome;
  mode: QuizMode;
  title: string;
  correct: number;
  total: number;
  answered: number;
  xp: number;
  bestCombo: number;
  onExit: () => void;
  onRetry: () => void;
  onOpenLecture?: () => void;
  onStartExtra?: () => void;
  maxMistakes?: number;
}) {
  const passed = p.outcome === 'passed';
  const extra = p.outcome === 'extra';
  const finished = passed || extra;
  const pending = useProgress((s) => Object.keys(s.mistakes).length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') p.onExit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-6 px-5 py-10 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 14 }}
        className={`flex h-28 w-28 items-center justify-center rounded-full ${passed ? 'bg-primary-soft text-primary' : extra ? 'bg-accent-soft text-accent' : 'bg-danger-soft text-danger'}`}
      >
        {passed ? <Trophy size={60} /> : extra ? <Dumbbell size={60} /> : <HeartCrack size={60} />}
      </motion.div>
      <div>
        <h1 className="text-3xl font-extrabold">
          {passed ? (p.mode === 'mistakes' ? 'Mistakes cleared up' : p.mode === 'review' ? 'Review complete' : 'Complete!') : extra ? 'Almost there' : 'Out of hearts'}
        </h1>
        <p className="mt-2 text-muted">
          {extra
            ? `${p.total - p.correct} mistakes — this lesson needs at most ${p.maxMistakes}. Extra practice has new, gentler questions on the same ideas; pass it to unlock the next lesson.`
            : !passed && p.onStartExtra
              ? 'Three mistakes end a session. Extra practice is now open: new, gentler questions on the same ideas. Passing it unlocks the next lesson.'
              : passed
            ? p.mode === 'review'
              ? p.correct === p.total
                ? 'A clean sheet: every topic you have passed is still solid.'
                : `${p.total - p.correct} missed question${p.total - p.correct === 1 ? '' : 's'} went to Mistakes. Re-solve them there.`
              : p.mode === 'mistakes'
              ? pending > 0
                ? `${pending} question${pending === 1 ? '' : 's'} still in Mistakes. A question leaves after two correct answers in a row.`
                : 'Mistakes is empty: every missed concept has been re-solved.'
              : p.title
            : p.onOpenLecture
              ? 'Three mistakes end a session. Re-read the lecture — the missed questions are also waiting in Mistakes.'
              : 'Three mistakes end a session. The missed questions are waiting in Mistakes — study the breakdowns, then try again.'}
        </p>
      </div>
      <div className="grid w-full grid-cols-3 gap-3">
        <Stat label="Correct" value={`${p.correct}/${finished ? p.total : p.answered}`} tone="text-primary" />
        <Stat label="XP earned" value={`+${p.xp}`} tone="text-warn" />
        <Stat label="Best streak" value={String(p.bestCombo)} tone="text-accent" />
      </div>
      <div className="flex w-full flex-col gap-3">
        {!passed && p.onStartExtra && (
          <Button full tone="accent" onClick={p.onStartExtra}>
            <Dumbbell size={18} /> Start extra practice
          </Button>
        )}
        {!passed && <Button full tone={p.onStartExtra ? 'neutral' : 'accent'} onClick={p.onRetry}>Try again</Button>}
        {!passed && p.onOpenLecture && <Button full tone="neutral" onClick={p.onOpenLecture}>Re-read the lecture</Button>}
        <Button full tone={passed ? 'primary' : 'neutral'} onClick={p.onExit}>
          {passed ? 'Continue' : 'Back to path'}
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border-2 border-line bg-surface px-2 py-3">
      <div className={`text-2xl font-extrabold tabular-nums ${tone}`}>{value}</div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-muted">{label}</div>
    </div>
  );
}
