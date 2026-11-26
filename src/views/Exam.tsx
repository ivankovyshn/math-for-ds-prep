import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock, Flag, X } from 'lucide-react';
import type { ExamResult, Question } from '../types.ts';
import { EXAM_SECONDS } from '../data/modules.ts';
import { formatClock, shuffle } from '../lib/session.ts';
import { useProgress } from '../store/useProgress.ts';
import { OptionList, QuestionBody } from '../components/QuestionCard.tsx';
import { Button, IconButton, Kbd } from '../components/ui.tsx';

interface ExamProps {
  questions: Question[];
  onExit: () => void;
  onFinished: (result: ExamResult) => void;
}

/**
 * Timed exam: no feedback, free navigation between questions, one submission.
 * The diagnostic breakdown is shown afterwards by ExamSummary.
 */
export function Exam({ questions, onExit, onFinished }: ExamProps) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(EXAM_SECONDS);
  const [confirming, setConfirming] = useState(false);
  const submitted = useRef(false);
  const startedAt = useRef(Date.now());

  const q = questions[idx];
  const optionOrder = useMemo(
    () => Object.fromEntries(questions.map((x) => [x.id, shuffle(x.options)])),
    [questions],
  );
  const options = optionOrder[q.id];
  const answered = questions.filter((x) => answers[x.id]).length;

  const submit = () => {
    if (submitted.current) return;
    submitted.current = true;
    const { recordAnswer, addXp, saveExam, touchStreak } = useProgress.getState();
    let correct = 0;
    for (const x of questions) {
      const ok = answers[x.id] === x.correctOptionId;
      if (ok) correct++;
      // Wrong and unanswered questions go to the review queue.
      recordAnswer(x.id, ok, false, x.seed);
    }
    addXp(correct * 10);
    touchStreak();
    const result: ExamResult = {
      id: `exam-${Date.now()}`,
      finishedAt: new Date().toISOString(),
      durationSec: Math.min(EXAM_SECONDS, Math.round((Date.now() - startedAt.current) / 1000)),
      timeLimitSec: EXAM_SECONDS,
      questionIds: questions.map((x) => x.id),
      answers,
      seeds: Object.fromEntries(questions.filter((x) => x.seed !== undefined).map((x) => [x.id, x.seed!])),
    };
    saveExam(result);
    onFinished(result);
  };

  // Countdown based on wall-clock time, so it stays right if the tab sleeps.
  useEffect(() => {
    const t = setInterval(() => {
      const left = EXAM_SECONDS - Math.floor((Date.now() - startedAt.current) / 1000);
      setTimeLeft(left);
    }, 500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const go = (delta: number) => setIdx((i) => Math.max(0, Math.min(questions.length - 1, i + delta)));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (confirming) {
        if (e.key === 'Enter') submit();
        else if (e.key === 'Escape') setConfirming(false);
        return;
      }
      if (/^[1-5]$/.test(e.key)) {
        const o = options[Number(e.key) - 1];
        if (o) setAnswers((a) => ({ ...a, [q.id]: o.id }));
      } else if (e.key === 'Enter' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (idx === questions.length - 1 && e.key === 'Enter') setConfirming(true);
        else go(1);
      } else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const lowTime = timeLeft <= 120;
  const last = idx === questions.length - 1;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b-2 border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-2.5">
          <IconButton
            label="Abandon exam"
            className="!h-10 !w-10 shrink-0 !border-0 !bg-transparent"
            onClick={() => {
              if (window.confirm('Abandon the exam? Nothing will be saved.')) onExit();
            }}
          >
            <X size={24} />
          </IconButton>
          <div className="flex-1 text-sm font-extrabold uppercase tracking-wider text-muted">Exam simulator</div>
          <div className={`flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-lg font-extrabold tabular-nums ${lowTime ? 'border-danger text-danger' : 'border-line'}`}>
            <Clock size={18} />
            {formatClock(timeLeft)}
          </div>
        </div>
        {/* Question navigator */}
        <div className="mx-auto flex w-full max-w-2xl gap-1.5 px-4 pb-2.5">
          {questions.map((x, i) => (
            <button
              key={x.id}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`Question ${i + 1}${answers[x.id] ? ', answered' : ''}`}
              aria-current={i === idx}
              className={`h-8 flex-1 rounded-lg border-2 text-xs font-extrabold transition-colors ${
                i === idx
                  ? 'border-accent bg-accent text-white'
                  : answers[x.id]
                    ? 'border-accent bg-accent-soft text-accent'
                    : 'border-line bg-surface text-muted'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-32 pt-4">
        <>
          <motion.div key={q.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className="space-y-5">
            <div className="text-xs font-bold uppercase tracking-wider text-muted">Problem {idx + 1} of {questions.length}</div>
            <QuestionBody question={q} />
            <OptionList options={options} selectedId={answers[q.id] ?? null} onSelect={(id) => setAnswers((a) => ({ ...a, [q.id]: id }))} />
          </motion.div>
        </>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t-2 border-line bg-bg">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Button tone="neutral" disabled={idx === 0} onClick={() => go(-1)} aria-label="Previous question">
            <ArrowLeft size={20} />
          </Button>
          <span className="flex-1 text-center text-sm font-bold text-muted">{answered} / {questions.length} answered</span>
          {last ? (
            <Button tone="primary" onClick={() => setConfirming(true)}>
              <Flag size={18} /> Submit
            </Button>
          ) : (
            <Button tone="accent" onClick={() => go(1)}>
              Next <ArrowRight size={20} />
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {confirming && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-5" onClick={() => setConfirming(false)}>
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm space-y-4 rounded-3xl border-2 border-line bg-surface p-6 text-center"
              role="dialog"
              aria-modal="true"
              aria-label="Submit exam"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-extrabold">Submit the exam?</h2>
              <p className="text-muted">
                {answered < questions.length
                  ? `You have answered ${answered} of ${questions.length} questions. Unanswered questions count as wrong.`
                  : 'All questions are answered. You cannot change them after submitting.'}
              </p>
              <div className="flex gap-3">
                <Button full tone="neutral" onClick={() => setConfirming(false)}>Keep working</Button>
                <Button full onClick={submit}>Submit <Kbd>↵</Kbd></Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
