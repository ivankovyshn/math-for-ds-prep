import { Fragment, memo, useMemo } from 'react';
import katex from 'katex';

const render = (tex: string, displayMode: boolean) =>
  katex.renderToString(tex, { displayMode, throwOnError: false, strict: false });

/** A KaTeX formula. `block` renders it centred on its own line. */
export const Tex = memo(function Tex({ tex, block = false }: { tex: string; block?: boolean }) {
  const html = useMemo(() => render(tex, block), [tex, block]);
  return block ? (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  );
});

/** Text in which $...$ is rendered as maths. */
function Maths({ text }: { text: string }) {
  const parts = text.split('$');
  return <>{parts.map((p, i) => (i % 2 ? <Tex key={i} tex={p} /> : <Fragment key={i}>{p}</Fragment>))}</>;
}

/** One line of text with $...$ maths and <i>emphasis</i>; emphasis may contain maths. */
export const Inline = memo(function Inline({ text }: { text: string }) {
  const parts = text.split(/<i>(.*?)<\/i>/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <em key={i} className="font-semibold not-italic underline decoration-dotted underline-offset-4">
            <Maths text={p} />
          </em>
        ) : (
          <Maths key={i} text={p} />
        ),
      )}
    </>
  );
});

/** Multi-paragraph text: blank lines separate paragraphs, "• " starts a bullet. */
export function RichText({ text, className = '' }: { text: string; className?: string }) {
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className={`space-y-3 ${className}`}>
      {blocks.map((b, i) =>
        b.startsWith('• ') ? (
          <div key={i} className="flex gap-3">
            <span className="mt-[0.55em] h-2.5 w-2.5 shrink-0 rounded-sm bg-accent" />
            <p><Inline text={b.slice(2)} /></p>
          </div>
        ) : (
          <p key={i}><Inline text={b} /></p>
        ),
      )}
    </div>
  );
}
