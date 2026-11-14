import type { ReactNode } from 'react';

const TOKEN =
  /(END WHILE|END IF|INPUT:|OUTPUT:|WHILE|IF|ELSE|\bis even\b|\bis odd\b|\bmod\b|\bfloor\b|\d+|<=|>=|≠|[=+\-*/<>()])/g;
const KEYWORD = /^(END WHILE|END IF|INPUT:|OUTPUT:|WHILE|IF|ELSE)$/;
const WORD_OP = /^(is even|is odd|mod|floor)$/;

function highlight(line: string): ReactNode[] {
  return line.split(TOKEN).map((tok, i) => {
    if (!tok) return null;
    if (KEYWORD.test(tok)) return <span key={i} className="code-kw">{tok}</span>;
    if (/^\d+$/.test(tok)) return <span key={i} className="code-num">{tok}</span>;
    if (WORD_OP.test(tok) || /^(<=|>=|≠|[=+\-*/<>])$/.test(tok)) return <span key={i} className="code-op">{tok}</span>;
    return <span key={i}>{tok}</span>;
  });
}

/** Monospace pseudocode block with line numbers and keyword highlighting. */
export function Pseudocode({ code }: { code: string }) {
  const lines = code.replace(/\s+$/, '').split('\n');
  return (
    <pre className="overflow-x-auto rounded-2xl border-2 border-line bg-bg px-3 py-3 font-mono text-[13.5px] leading-6 sm:text-[15px] sm:leading-7">
      {lines.map((line, i) => (
        <div key={i} className="flex">
          <span className="mr-3 w-5 shrink-0 select-none text-right text-muted/60">{i + 1}</span>
          <code className="whitespace-pre">{highlight(line)}</code>
        </div>
      ))}
    </pre>
  );
}
