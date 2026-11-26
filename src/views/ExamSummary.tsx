import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronDown, Clock, MinusCircle, RotateCcw, Target, XCircle } from 'lucide-react';
import type { ExamResult, ModuleId } from '../types.ts';
import { MODULES } from '../data/modules.ts';
import { QUESTION_BY_ID } from '../data/questions.ts';
import { variantOf } from '../lib/variants.ts';
import { formatClock } from '../lib/session.ts';
import { ModuleIcon } from '../components/ModuleIcon.tsx';
import { QuestionBody } from '../components/QuestionCard.tsx';
import { Inline } from '../components/RichText.tsx';
import { Button, ProgressBar } from '../components/ui.tsx';

interface Props {
  result: ExamResult;
  onExit: () => void;
  onReview: () => void;
  onRetake: () => void;
}

function verdict(pct: number) {
  if (pct >= 0.9) return 'Exam-ready. Keep the rhythm with regular speed drills.';
  if (pct >= 0.7) return 'Solid. Close the gaps below and you are there.';
  if (pct >= 0.5) return 'Halfway. Focus on the weakest topics first.';
  return 'A starting point. Work through the skill path topic by topic.';
}

/** Diagnostic report after an exam: overall score, per-topic breakdown, full review. */
export function ExamSummary({ result, onExit, onReview, onRetake }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  // Show each parametric question with the numbers that were on the paper.
  const questions = result.questionIds.filter((id) => QUESTION_BY_ID[id]).map((id) => {
    const seed = result.seeds?.[id];
    return seed === undefined ? QUESTION_BY_ID[id] : variantOf(QUESTION_BY_ID[id], seed);
  });
  const isCorrect = (id: string) => result.answers[id] === QUESTION_BY_ID[id].correctOptionId;
  const correct = questions.filter((q) => isCorrect(q.id)).length;
  const unanswered = questions.filter((q) => !result.answers[q.id]).length;
  const wrong = questions.length - correct - unanswered;
  const pct = questions.length ? correct / questions.length : 0;

  const byModule = MODULES.map((m) => {
    const qs = questions.filter((q) => q.moduleId === m.id);
    return { module: m, total: qs.length, correct: qs.filter((q) => isCorrect(q.id)).length };
  }).filter((r) => r.total > 0);
  const weakest = [...byModule].sort((a, b) => a.correct / a.total - b.correct / b.total)[0];

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6">
      <header className="text-center">
        <div className="text-xs font-extrabold uppercase tracking-wider text-muted">Exam diagnostic</div>
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 16 }} className="mt-2 text-6xl font-extrabold tabular-nums">
          {correct}<span className="text-3xl text-muted"> / {questions.length}</span>
        </motion.div>
        <p className="mt-2 text-muted">{verdict(pct)}</p>
      </header>

      <div className="grid grid-cols-4 gap-2.5 text-center">
        <Tile icon={<CheckCircle2 size={18} />} value={correct} label="Correct" tone="text-primary" />
        <Tile icon={<XCircle size={18} />} value={wrong} label="Wrong" tone="text-danger" />
        <Tile icon={<MinusCircle size={18} />} value={unanswered} label="Blank" tone="text-muted" />
        <Tile icon={<Clock size={18} />} value={formatClock(result.durationSec)} label={`of ${formatClock(result.timeLimitSec)}`} tone="text-accent" />
      </div>

      <section className="rounded-3xl border-2 border-line bg-surface p-4">
        <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-muted">Performance by topic</h2>
        <div className="space-y-3.5">
          {byModule.map(({ module, total, correct: c }) => {
            const share = c / total;
            return (
              <div key={module.id} className="flex items-center gap-3">
                <ModuleIcon id={module.id as ModuleId} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex justify-between gap-2 text-sm font-bold">
                    <span className="truncate">{module.title}</span>
                    <span className="tabular-nums text-muted">{c} / {total}</span>
                  </div>
                  <ProgressBar value={share} tone={share >= 0.99 ? 'primary' : share >= 0.5 ? 'warn' : 'danger'} className="h-3" />
                </div>
              </div>
            );
          })}
        </div>
        {weakest && weakest.correct < weakest.total && (
          <p className="mt-4 flex items-start gap-2 rounded-2xl bg-accent-soft px-3 py-2.5 text-sm">
            <Target size={18} className="mt-0.5 shrink-0 text-accent" />
            <span>Priority: <b>{weakest.module.title}</b>. The questions you missed have been added to your review queue.</span>
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-muted">Question review</h2>
        <div className="space-y-2.5">
          {questions.map((q, i) => {
            const picked = q.options.find((o) => o.id === result.answers[q.id]);
            const right = q.options.find((o) => o.id === q.correctOptionId)!;
            const ok = isCorrect(q.id);
            const expanded = open === q.id;
            return (
              <div key={q.id} className="overflow-hidden rounded-2xl border-2 border-line bg-surface">
                <button type="button" onClick={() => setOpen(expanded ? null : q.id)} aria-expanded={expanded} className="flex w-full items-center gap-3 px-3.5 py-3 text-left">
                  <span className={ok ? 'text-primary' : picked ? 'text-danger' : 'text-muted'}>
                    {ok ? <CheckCircle2 size={22} /> : picked ? <XCircle size={22} /> : <MinusCircle size={22} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold">Problem {i + 1}</span>
                    <span className="block truncate text-xs text-muted">{q.keyConceptTag}</span>
                  </span>
                  <ChevronDown size={20} className={`text-muted transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
                {expanded && (
                  <div className="space-y-4 border-t-2 border-line px-3.5 py-4">
                    <QuestionBody question={q} />
                    <div className="grid gap-2 text-[15px]">
                      <div className="rounded-xl bg-primary-soft px-3 py-2">
                        <span className="mr-2 text-xs font-extrabold uppercase text-primary">Correct</span>
                        <Inline text={right.label} />
                      </div>
                      {!ok && (
                        <div className="rounded-xl bg-danger-soft px-3 py-2">
                          <span className="mr-2 text-xs font-extrabold uppercase text-danger">Your answer</span>
                          {picked ? <Inline text={picked.label} /> : <span className="text-muted">left blank</span>}
                          {picked?.trapExplanation && <p className="mt-1.5 text-sm leading-relaxed"><Inline text={picked.trapExplanation} /></p>}
                        </div>
                      )}
                    </div>
                    <ol className="space-y-2">
                      {q.stepByStepSolution.map((s, k) => (
                        <li key={k} className="flex gap-3 text-[15px] leading-relaxed">
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-extrabold text-accent">{k + 1}</span>
                          <span className="min-w-0"><Inline text={s} /></span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex flex-col gap-3 pb-6 sm:flex-row">
        {correct < questions.length && <Button full tone="accent" onClick={onReview}>Review mistakes</Button>}
        <Button full tone="neutral" onClick={onRetake}><RotateCcw size={18} /> New exam</Button>
        <Button full onClick={onExit}>Back to path</Button>
      </div>
    </div>
  );
}

function Tile({ icon, value, label, tone }: { icon: ReactNode; value: number | string; label: string; tone: string }) {
  return (
    <div className="rounded-2xl border-2 border-line bg-surface px-1 py-3">
      <div className={`flex items-center justify-center gap-1 text-xl font-extrabold tabular-nums ${tone}`}>{icon}{value}</div>
      <div className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-muted">{label}</div>
    </div>
  );
}
