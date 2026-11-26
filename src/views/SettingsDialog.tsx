import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, Trash2, Upload, X } from 'lucide-react';
import { QUESTION_BY_ID } from '../data/questions.ts';
import { exportProgress, isProgressData, useProgress } from '../store/useProgress.ts';
import { Button, IconButton } from '../components/ui.tsx';

/** Data management: move progress between devices, reset, exam history. */
export function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const exams = useProgress((s) => s.examResults);

  const download = () => {
    const blob = new Blob([JSON.stringify(exportProgress(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mathds-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Progress file downloaded.');
  };

  const upload = async (file: File | undefined) => {
    if (!file) return;
    try {
      const data: unknown = JSON.parse(await file.text());
      if (!isProgressData(data)) throw new Error('wrong format');
      if (!window.confirm('Replace the progress in this browser with the imported file?')) return;
      useProgress.getState().importData(data);
      setMessage('Progress imported.');
    } catch {
      setMessage('This file is not a valid Advanced Math Trainer progress export.');
    } finally {
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const reset = () => {
    if (window.confirm('Delete all progress (XP, streak, completed nodes, mistakes, exams)? This cannot be undone.')) {
      useProgress.getState().reset();
      setMessage('Progress reset.');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 sm:items-center sm:p-5" onClick={onClose}>
          <motion.div
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            exit={{ y: 40 }}
            role="dialog"
            aria-modal="true"
            aria-label="Settings and data"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88dvh] w-full max-w-md space-y-5 overflow-y-auto rounded-t-3xl border-2 border-line bg-surface p-5 sm:rounded-3xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold">Settings & data</h2>
              <IconButton label="Close" onClick={onClose}><X size={20} /></IconButton>
            </div>

            <section className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted">Move progress to another device</h3>
              <p className="text-sm text-muted">Progress lives in this browser. Export it to a file and import that file on your phone or another computer.</p>
              <div className="flex gap-3">
                <Button full tone="accent" onClick={download}><Download size={18} /> Export</Button>
                <Button full tone="neutral" onClick={() => fileInput.current?.click()}><Upload size={18} /> Import</Button>
                <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
              </div>
              {message && <p className="rounded-xl bg-accent-soft px-3 py-2 text-sm font-bold" role="status">{message}</p>}
            </section>

            <section className="space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted">Exam history</h3>
              {exams.length === 0 ? (
                <p className="text-sm text-muted">No exams taken yet.</p>
              ) : (
                <ul className="divide-y-2 divide-line rounded-2xl border-2 border-line">
                  {exams.slice(0, 8).map((e) => {
                    const correct = e.questionIds.filter((id) => e.answers[id] === QUESTION_BY_ID[id]?.correctOptionId).length;
                    return (
                      <li key={e.id} className="flex justify-between px-3 py-2 text-sm">
                        <span className="text-muted">{new Date(e.finishedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span className="font-extrabold tabular-nums">{correct} / {e.questionIds.length}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted">Danger zone</h3>
              <Button full tone="danger" onClick={reset}><Trash2 size={18} /> Reset all progress</Button>
            </section>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
