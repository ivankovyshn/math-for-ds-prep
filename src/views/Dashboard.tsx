import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Check, Crown, Dumbbell, Flame, Lock, Moon, RotateCcw, Settings as SettingsIcon, Shuffle, Sun, Target, Zap } from 'lucide-react';
import type { Lesson, ModuleId } from '../types.ts';
import { TEST_QUESTIONS, MODULES, testKey, lessonKey, type ModuleMeta } from '../data/modules.ts';
import { LESSONS, QUESTION_BY_ID, lessonsOf } from '../data/questions.ts';
import { currentStreak, useProgress, type ProgressData } from '../store/useProgress.ts';
import { ModuleIcon, moduleColor } from '../components/ModuleIcon.tsx';
import { IconButton, ProgressBar } from '../components/ui.tsx';
import { SettingsDialog } from './SettingsDialog.tsx';

interface Props {
  onOpenLecture: (lessonId: string) => void;
  onStartPractice: (lessonId: string) => void;
  onStartExtra: (lessonId: string) => void;
  onStartTest: (moduleId: ModuleId) => void;
  onStartMistakes: () => void;
  onStartReview: () => void;
}

export function Dashboard({ onOpenLecture, onStartPractice, onStartExtra, onStartTest, onStartMistakes, onStartReview }: Props) {
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => currentStreak(s));
  const theme = useProgress((s) => s.theme);
  const toggleTheme = useProgress((s) => s.toggleTheme);
  const completed = useProgress((s) => s.completedNodes);
  const lecturesRead = useProgress((s) => s.lecturesRead);
  const extraUnlocked = useProgress((s) => s.extraUnlocked);
  const mistakes = useProgress((s) => s.mistakes);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const mistakeIds = Object.keys(mistakes).filter((id) => QUESTION_BY_ID[id]);
  const level = Math.floor(xp / 100) + 1;
  const passedLessons = LESSONS.filter((l) => completed[lessonKey(l.id)]).length;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-10 -mx-4 flex items-center gap-2 bg-bg/95 px-4 py-3 backdrop-blur">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-2xl font-black text-white">∑</div>
        <div className="mr-auto min-w-0 leading-tight">
          <div className="text-[15px] font-extrabold leading-[1.15] sm:text-lg">Math Foundations <span className="whitespace-nowrap">of Data Science</span></div>
          <div className="hidden text-[11px] font-bold uppercase tracking-wider text-muted sm:block">Lectures + practice · Level {level}</div>
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
          onClick={onStartMistakes}
          disabled={mistakeIds.length === 0}
          icon={<RotateCcw size={24} />}
          tone="danger"
          title="Mistakes"
          text={mistakeIds.length ? `${mistakeIds.length} to re-solve` : 'Queue is empty'}
          badge={mistakeIds.length || undefined}
        />
        <ActionCard
          onClick={onStartReview}
          disabled={passedLessons === 0}
          icon={<Shuffle size={24} />}
          tone="accent"
          title="Review"
          text={passedLessons ? `Mixed questions from ${passedLessons} passed lesson${passedLessons === 1 ? '' : 's'}` : 'Pass a lesson to unlock'}
        />
      </div>

      {/* Modules */}
      <div className="space-y-6">
        {MODULES.map((m, mi) => (
          <motion.section
            key={m.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: mi * 0.05 }}
            className="overflow-hidden rounded-3xl border-2 border-line bg-surface"
          >
            <ModulePath
              module={m}
              number={mi}
              lessons={lessonsOf(m.id)}
              completed={completed}
              lecturesRead={lecturesRead}
              extraUnlocked={extraUnlocked}
              pendingMistakes={mistakeIds.filter((id) => QUESTION_BY_ID[id].moduleId === m.id).length}
              onOpenLecture={onOpenLecture}
              onStartPractice={onStartPractice}
              onStartExtra={onStartExtra}
              onStartTest={onStartTest}
              onStartMistakes={onStartMistakes}
            />
          </motion.section>
        ))}
      </div>

      <footer className="mt-10 text-center text-xs text-muted">
        Progress is stored in this browser only. Use Settings to export or import it.
      </footer>

      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

interface PathProps {
  module: ModuleMeta;
  number: number;
  lessons: Lesson[];
  completed: ProgressData['completedNodes'];
  lecturesRead: ProgressData['lecturesRead'];
  extraUnlocked: ProgressData['extraUnlocked'];
  pendingMistakes: number;
  onOpenLecture: (lessonId: string) => void;
  onStartPractice: (lessonId: string) => void;
  onStartExtra: (lessonId: string) => void;
  onStartTest: (moduleId: ModuleId) => void;
  onStartMistakes: () => void;
}

function ModulePath({ module: m, number, lessons, completed, lecturesRead, extraUnlocked, pendingMistakes, onOpenLecture, onStartPractice, onStartExtra, onStartTest, onStartMistakes }: PathProps) {
  const color = moduleColor(m.id);
  const hasContent = lessons.length > 0;
  const steps = lessons.length + 1; // every lesson + the module test
  const done = lessons.filter((l) => completed[lessonKey(l.id)]).length + (completed[testKey(m.id)] ? 1 : 0);
  const allDone = hasContent && done === steps;
  // 100 % is reserved for a finished path with no open mistakes.
  const mastery = !hasContent ? 0 : allDone && pendingMistakes > 0 ? 90 : Math.round((done / steps) * 100);

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-4">
        <ModuleIcon id={m.id} />
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-muted">Module {number}</div>
          <h2 className="text-lg font-extrabold leading-tight">{m.title}</h2>
          <p className="text-sm leading-snug text-muted">{m.blurb}</p>
        </div>
        {hasContent ? (
          <div className="text-right">
            <div className="text-xl font-extrabold tabular-nums" style={{ color: mastery === 100 ? 'var(--c-primary)' : undefined }}>{mastery}%</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted">mastered</div>
          </div>
        ) : (
          <span className="rounded-lg bg-surface2 px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-muted">Coming soon</span>
        )}
      </div>

      {!hasContent && m.planned && (
        <ul className="flex flex-wrap gap-2 px-4 pb-4">
          {m.planned.map((t) => (
            <li key={t} className="rounded-lg border border-line px-2.5 py-1 text-sm text-muted">{t}</li>
          ))}
        </ul>
      )}

      {allDone && pendingMistakes > 0 && (
        <button type="button" onClick={onStartMistakes} className="mx-4 mb-3 block w-[calc(100%-2rem)] rounded-xl bg-danger-soft px-3 py-2 text-left text-sm font-bold text-danger">
          Re-solve {pendingMistakes} missed question{pendingMistakes === 1 ? '' : 's'} to reach 100 %
        </button>
      )}

      {hasContent && (
        <ol className="relative px-4 pb-4">
          {lessons.map((l, li) => {
            const passed = completed[lessonKey(l.id)];
            const unlocked = li === 0 || !!m.freeOrder || !!completed[lessonKey(lessons[li - 1].id)];
            const read = !!lecturesRead[l.id];
            const extra = !!extraUnlocked[l.id] && l.extra.length > 0;
            const isNext = unlocked && !passed;
            const primary = () => (!read ? onOpenLecture(l.id) : extra && !passed ? onStartExtra(l.id) : onStartPractice(l.id));
            const status = !unlocked
              ? `Pass lesson ${li} to unlock`
              : passed
                ? `Best ${passed.bestCorrect}/${passed.total} · practise again any time`
                : extra
                  ? `Extra practice: ${l.extra.length} questions to pass this lesson`
                  : read
                    ? `Lecture read · practice: ${l.questions.length} questions, at most 1 mistake`
                    : `${l.minutes}-minute lecture, then ${l.questions.length} questions`;
            return (
              <PathRow key={l.id} color={color} done={!!passed} connector>
                <NodeButton
                  color={color}
                  unlocked={unlocked}
                  pulse={isNext}
                  done={!!passed}
                  label={`Lesson ${li + 1}: ${l.title}${passed ? ', completed' : unlocked ? '' : ', locked'}`}
                  onClick={primary}
                >
                  {li + 1}
                </NodeButton>
                <button type="button" disabled={!unlocked} onClick={primary} className="min-w-0 flex-1 text-left disabled:opacity-50">
                  <div className="font-extrabold leading-snug">{l.title}</div>
                  <div className="text-sm text-muted">{status}</div>
                </button>
                {unlocked && (
                  <div className="flex shrink-0 gap-1.5">
                    <StepChip label="Lecture" active={!read} done={read} color={color} onClick={() => onOpenLecture(l.id)}>
                      <BookOpen size={17} />
                    </StepChip>
                    <StepChip label="Practice" active={read && !passed && !extra} done={!!passed} disabled={!read} color={color} onClick={() => onStartPractice(l.id)}>
                      <Target size={17} />
                    </StepChip>
                    {extra && (
                      <StepChip label="Extra practice" active={!passed} done={false} color={color} onClick={() => onStartExtra(l.id)}>
                        <Dumbbell size={17} />
                      </StepChip>
                    )}
                  </div>
                )}
              </PathRow>
            );
          })}

          {(() => {
            const unlocked = lessons.every((l) => completed[lessonKey(l.id)]);
            const best = completed[testKey(m.id)];
            return (
              <PathRow color={color} done={!!best}>
                <NodeButton color={color} unlocked={unlocked} pulse={unlocked && !best} done={!!best} label={`Module Test${best ? ', completed' : unlocked ? '' : ', locked'}`} onClick={() => onStartTest(m.id)}>
                  <Crown size={26} strokeWidth={2.4} />
                </NodeButton>
                <button type="button" disabled={!unlocked} onClick={() => onStartTest(m.id)} className="min-w-0 flex-1 text-left disabled:opacity-50">
                  <div className="font-extrabold">Module Test</div>
                  <div className="text-sm text-muted">
                    {best ? `Best ${best.bestCorrect}/${best.total} · tap to try again` : unlocked ? `${TEST_QUESTIONS} mixed questions from the whole module` : 'Pass every lesson to unlock'}
                  </div>
                </button>
              </PathRow>
            );
          })()}
        </ol>
      )}

      {hasContent && m.planned && (
        <div className="px-4 pb-4">
          <div className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-muted">Coming next</div>
          <ul className="flex flex-wrap gap-2">
            {m.planned.map((t) => (
              <li key={t} className="rounded-lg border border-dashed border-line px-2.5 py-1 text-sm text-muted">{t}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function PathRow({ color, done, connector, children }: { color: string; done: boolean; connector?: boolean; children: ReactNode }) {
  return (
    <li className="relative flex items-center gap-3 py-2 sm:gap-4">
      {connector && <span className="absolute left-[27px] top-[calc(50%+26px)] h-[calc(100%-44px)] w-1.5 rounded-full" style={{ background: done ? color : 'var(--c-line)' }} />}
      {children}
    </li>
  );
}

function NodeButton(p: { color: string; unlocked: boolean; pulse: boolean; done: boolean; label: string; onClick: () => void; children: ReactNode }) {
  return (
    <motion.button
      type="button"
      disabled={!p.unlocked}
      onClick={p.onClick}
      whileTap={p.unlocked ? { y: 4 } : undefined}
      animate={p.pulse ? { scale: [1, 1.07, 1] } : { scale: 1 }}
      transition={p.pulse ? { repeat: Infinity, duration: 1.8 } : undefined}
      aria-label={p.label}
      className="relative z-[1] flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full border-b-[6px] text-xl font-extrabold text-white disabled:border-line disabled:bg-surface2 disabled:text-muted"
      style={p.unlocked ? { background: p.color, borderColor: 'rgba(0,0,0,0.28)' } : undefined}
    >
      {p.done ? <Check size={28} strokeWidth={3.5} /> : p.unlocked ? p.children : <Lock size={24} />}
    </motion.button>
  );
}

function StepChip(p: { label: string; active: boolean; done: boolean; disabled?: boolean; color: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={p.onClick}
      disabled={p.disabled}
      aria-label={p.label}
      title={p.disabled ? `${p.label} (read the lecture first)` : p.label}
      className="relative flex h-10 w-10 items-center justify-center rounded-xl border-2 border-b-4 transition-colors disabled:opacity-40"
      style={
        p.active
          ? { background: p.color, borderColor: 'rgba(0,0,0,0.28)', color: 'white' }
          : { borderColor: 'var(--c-line)', color: p.done ? p.color : 'var(--c-muted)' }
      }
    >
      {p.children}
      {p.done && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
          <Check size={11} strokeWidth={4} />
        </span>
      )}
    </button>
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
