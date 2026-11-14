import { MODULES } from '../data/modules.ts';
import { QUESTIONS } from '../data/questions.ts';
import { QuestionBody } from '../components/QuestionCard.tsx';
import { Inline } from '../components/RichText.tsx';

/**
 * Author's view: every question with its key, traps and solution on one page.
 * Open it by adding #all to the address. Useful for proofreading new questions.
 */
export function QuestionBrowser() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-10 px-4 py-6">
      <header>
        <h1 className="text-2xl font-extrabold">Question bank · {QUESTIONS.length} questions</h1>
        <a href="#" className="text-sm font-bold text-accent">← Back to the app</a>
      </header>
      {MODULES.map((m) => (
        <section key={m.id} className="space-y-5">
          <h2 className="text-xl font-extrabold">{m.title}</h2>
          {QUESTIONS.filter((q) => q.moduleId === m.id).map((q) => (
            <article key={q.id} className="space-y-4 rounded-3xl border-2 border-line bg-surface p-4">
              <div className="text-xs font-extrabold uppercase tracking-wider text-muted">
                {q.id} · level {q.difficulty} · {q.keyConceptTag}
              </div>
              <QuestionBody question={q} />
              <ul className="space-y-2">
                {q.options.map((o) => {
                  const ok = o.id === q.correctOptionId;
                  return (
                    <li key={o.id} className={`rounded-xl px-3 py-2 ${ok ? 'bg-primary-soft' : 'bg-bg'}`}>
                      <div className="font-bold"><span className={ok ? 'text-primary' : 'text-muted'}>{o.id})</span> <Inline text={o.label} /></div>
                      {o.trapExplanation && <p className="mt-1 text-sm text-muted"><Inline text={o.trapExplanation} /></p>}
                    </li>
                  );
                })}
              </ul>
              <ol className="list-decimal space-y-1.5 pl-5 text-[15px] leading-relaxed">
                {q.stepByStepSolution.map((s, i) => (
                  <li key={i}><Inline text={s} /></li>
                ))}
              </ol>
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}
