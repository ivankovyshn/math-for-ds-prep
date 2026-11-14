import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Check, Cog, Crown, Flame, GraduationCap, Lightbulb, Lock, Moon, RotateCcw, Settings as SettingsIcon, Sun, Timer, Zap } from 'lucide-react';
import type { ModuleId, NodeId } from '../types.ts';
import { EXAM_QUESTIONS, EXAM_SECONDS, MODULES, NODES, nodeKey } from '../data/modules.ts';
import { QUESTION_BY_ID } from '../data/questions.ts';
import { currentStreak, useProgress } from '../store/useProgress.ts';
import { ModuleIcon, moduleColor } from '../components/ModuleIcon.tsx';
import { IconButton, ProgressBar } from '../components/ui.tsx';
import { SettingsDialog } from './SettingsDialog.tsx';

const nodeIcons: Record<NodeId, typeof Lightbulb> = { intuition: Lightbulb, core: Cog, speed: Timer, boss: Crown };

interface Props {
  onStartNode: (moduleId: ModuleId, nodeId: NodeId) => void;
  onStartReview: () => void;
  onStartExam: () => void;
}

export function Dashboard({ onStartNode, onStartReview, onStartExam }: Props) {
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => currentStreak(s));
  const theme = useProgress((s) => s.theme);
  const toggleTheme = useProgress((s) => s.toggleTheme);
  const completed = useProgress((s) => s.completedNodes);
  const mistakes = useProgress((s) => s.mistakes);
  const lastExam = useProgress((s) => s.examResults[0]);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const mistakeIds = Object.keys(mistakes).filter((id) => QUESTION_BY_ID[id]);
  const level = Math.floor(xp / 100) + 1;
  const lastExamScore = lastExam
    ? `${lastExam.questionIds.filter((id) => lastExam.answers[id] === QUESTION_BY_ID[id]?.correctOptionId).length}/${lastExam.questionIds.length}`
    : null;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-10 -mx-4 flex items-center gap-2 bg-bg/95 px-4 py-3 backdrop-blur">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-2xl font-black text-white">∑</div>
        <div className="mr-auto min-w-0 leading-tight">
          <div className="text-[15px] font-extrabold leading-[1.15] sm:text-lg">Math for <span className="whitespace-nowrap">DS prep</span></div>
          <div className="hidden text-[11px] font-bold uppercase tracking-wider text-muted sm:block">Level {level}</div>
        </div>
        <span className={`flex items-center gap-1 rounded-xl px-2.5 py-2 font-extrabold tabular-nums ${streak > 0 ? 'text-warn' : 'text-muted'}`} title="Daily streak">
          <Flame size={20} fill={streak > 0 ? 'currentColor' : 'none'} /> {streak}
        </span>
        <span className="flex items-center gap-1 rounded-xl px-2.5 py-2 font-extrabold tabular-nums text-accent" title="Experience points">
          <Zap size={20} fill="currentColor" /> {xp}
        </span>
        <IconButton label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </IconButton>
        <IconButton label="Settings and data" onClick={() => setSettingsOpen(true)}>
          <SettingsIcon size={20} />
        </IconButton>
      </header>

      {/* Level progress */}
      <div className="mb-5 mt-1">
        <div className="mb-1 flex justify-between text-xs font-bold text-muted">
          <span>Level {level}</span>
          <span>{xp % 100} / 100 XP</span>
        </div>
        <ProgressBar value={(xp % 100) / 100} tone="accent" className="h-3" />
      </div>

      {/* Quick actions */}
      <div className="mb-8 grid grid-cols-2 gap-3">
        <ActionCard
          onClick={onStartReview}
          disabled={mistakeIds.length === 0}
          icon={<RotateCcw size={24} />}
          tone="danger"
          title="Review Mistakes"
          text={mistakeIds.length ? `${mistakeIds.length} to re-solve` : 'Queue is empty'}
          badge={mistakeIds.length || undefined}
        />
        <ActionCard
          onClick={onStartExam}
          icon={<GraduationCap size={24} />}
          tone="accent"
          title="Exam Simulator"
          text={lastExamScore ? `Last result ${lastExamScore}` : `${EXAM_QUESTIONS} questions · ${EXAM_SECONDS / 60} min`}
        />
      </div>

      {/* Skill path */}
      <div className="space-y-6">
        {MODULES.map((m, mi) => {
          const done = NODES.filter((n) => completed[nodeKey(m.id, n.id)]).length;
          const pending = mistakeIds.filter((id) => QUESTION_BY_ID[id].moduleId === m.id).length;
          // 100 % is reserved for a finished path with no open mistakes.
          const mastery = done === NODES.length && pending > 0 ? 90 : Math.round((done / NODES.length) * 100);
          const color = moduleColor(m.id);
          return (
            <motion.section
              key={m.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mi * 0.05 }}
              className="overflow-hidden rounded-3xl border-2 border-line bg-surface"
            >
              <div className="flex items-center gap-3 px-4 py-4">
                <ModuleIcon id={m.id} />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-muted">Module {mi + 1}</div>
                  <h2 className="text-lg font-extrabold leading-tight">{m.title}</h2>
                  <p className="text-sm leading-snug text-muted">{m.blurb}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-extrabold tabular-nums" style={{ color: mastery === 100 ? 'var(--c-primary)' : undefined }}>{mastery}%</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted">mastered</div>
                </div>
              </div>
              {done === NODES.length && pending > 0 && (
                <button type="button" onClick={onStartReview} className="mx-4 mb-3 block w-[calc(100%-2rem)] rounded-xl bg-danger-soft px-3 py-2 text-left text-sm font-bold text-danger">
                  Re-solve {pending} missed question{pending === 1 ? '' : 's'} to reach 100 %
                </button>
              )}

              <ol className="relative px-4 pb-4">
                {NODES.map((n, ni) => {
                  const key = nodeKey(m.id, n.id);
                  const isDone = !!completed[key];
                  const unlocked = ni === 0 || !!completed[nodeKey(m.id, NODES[ni - 1].id)];
                  const isNext = unlocked && !isDone;
                  const Icon = isDone ? Check : unlocked ? nodeIcons[n.id] : Lock;
                  const best = completed[key];
                  return (
                    <li key={n.id} className="relative flex items-center gap-4 py-2">
                      {/* connector to the next node */}
                      {ni < NODES.length - 1 && (
                        <span className="absolute left-[27px] top-[calc(50%+26px)] h-[calc(100%-44px)] w-1.5 rounded-full" style={{ background: isDone ? color : 'var(--c-line)' }} />
                      )}
                      <motion.button
                        type="button"
                        disabled={!unlocked}
                        onClick={() => onStartNode(m.id, n.id)}
                        whileTap={unlocked ? { y: 4 } : undefined}
                        animate={isNext ? { scale: [1, 1.07, 1] } : { scale: 1 }}
                        transition={isNext ? { repeat: Infinity, duration: 1.8 } : undefined}
                        aria-label={`${n.title}${isDone ? ', completed' : unlocked ? '' : ', locked'}`}
                        className="relative z-[1] flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full border-b-[6px] text-white disabled:border-line disabled:bg-surface2 disabled:text-muted"
                        style={unlocked ? { background: color, borderColor: 'rgba(0,0,0,0.28)' } : undefined}
                      >
                        <Icon size={26} strokeWidth={isDone ? 3.5 : 2.4} />
                      </motion.button>
                      <button type="button" disabled={!unlocked} onClick={() => onStartNode(m.id, n.id)} className="min-w-0 flex-1 text-left disabled:opacity-50">
                        <div className="font-extrabold">{n.title}</div>
                        <div className="text-sm text-muted">
                          {isDone && best ? `Best ${best.bestCorrect}/${best.total} · tap to practise again` : unlocked ? n.blurb : `Finish “${NODES[ni - 1].title}” to unlock`}
                        </div>
                      </button>
                      {isNext && <span className="rounded-lg px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white" style={{ background: color }}>Start</span>}
                    </li>
                  );
                })}
              </ol>
            </motion.section>
          );
        })}
      </div>

      <footer className="mt-10 text-center text-xs text-muted">
        Progress is stored in this browser only. Use Settings to export or import it.
      </footer>

      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function ActionCard(p: { onClick: () => void; disabled?: boolean; icon: ReactNode; tone: 'danger' | 'accent'; title: string; text: string; badge?: number }) {
  const tone = p.tone === 'danger' ? 'text-danger bg-danger-soft' : 'text-accent bg-accent-soft';
  return (
    <button
      type="button"
      onClick={p.onClick}
      disabled={p.disabled}
      className="relative flex flex-col items-start gap-2 rounded-2xl border-2 border-b-4 border-line bg-surface p-3.5 text-left transition-transform enabled:hover:bg-surface2 enabled:active:translate-y-[2px] enabled:active:border-b-2 disabled:opacity-60"
    >
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>{p.icon}</span>
      <span>
        <span className="block font-extrabold leading-tight">{p.title}</span>
        <span className="block text-sm text-muted">{p.text}</span>
      </span>
      {p.badge !== undefined && (
        <span className="absolute right-3 top-3 flex h-7 min-w-7 items-center justify-center rounded-full bg-danger px-1.5 text-sm font-extrabold text-white">{p.badge}</span>
      )}
    </button>
  );
}
