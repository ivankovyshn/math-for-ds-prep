import { MODULES } from '../data/modules.ts';
import { LESSONS, QUESTIONS, lessonsOf } from '../data/questions.ts';
import { QuestionBody } from '../components/QuestionCard.tsx';
import { Inline } from '../components/RichText.tsx';
import { LectureBlockView } from './Lecture.tsx';

/**
 * Author's view: every lecture and question with its key, traps and solution on one page.
 * Open it by adding #all to the address. Useful for proofreading new lessons.
 */
export function QuestionBrowser() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-10 px-4 py-6">
      <header>
        <h1 className="text-2xl font-extrabold">Content · {LESSONS.length} lessons · {QUESTIONS.length} questions</h1>
        <a href="#" className="text-sm font-bold text-accent">← Back to the app</a>
      </header>
      {MODULES.filter((m) => lessonsOf(m.id).length).map((m) => (
        <section key={m.id} className="space-y-8">
          <h2 className="text-2xl font-extrabold">{m.title}</h2>
          {lessonsOf(m.id).map((l) => (
            <section key={l.id} className="space-y-5">
              <h3 className="text-xl font-extrabold">{l.id} · {l.title} · {l.minutes} min</h3>
              <details className="rounded-3xl border-2 border-line bg-surface p-4">
                <summary className="cursor-pointer font-extrabold text-accent">Lecture · {l.lecture.length} sections</summary>
                <div className="mt-4 space-y-5">
                  {l.lecture.map((sec) => (
                    <div key={sec.title} className="space-y-4">
                      <h4 className="text-lg font-extrabold">{sec.title}</h4>
                      {sec.blocks.map((b, i) => <LectureBlockView key={i} block={b} />)}
                    </div>
                  ))}
                </div>
              </details>
              {l.questions.map((q) => (
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
        </section>
      ))}
    </div>
  );
}
