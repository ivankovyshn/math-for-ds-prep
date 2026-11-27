import type { ReactNode } from 'react';

// ---------- pseudocode (upper-case keywords) ----------
const P_TOKEN =
  /(END WHILE|END IF|INPUT:|OUTPUT:|WHILE|IF|ELSE|\bis even\b|\bis odd\b|\bmod\b|\bfloor\b|\d+|<=|>=|≠|[=+\-*/<>()])/g;
const P_KEYWORD = /^(END WHILE|END IF|INPUT:|OUTPUT:|WHILE|IF|ELSE)$/;
const P_WORD_OP = /^(is even|is odd|mod|floor)$/;

function highlightPseudo(line: string): ReactNode[] {
  return line.split(P_TOKEN).map((tok, i) => {
    if (!tok) return null;
    if (P_KEYWORD.test(tok)) return <span key={i} className="code-kw">{tok}</span>;
    if (/^\d+$/.test(tok)) return <span key={i} className="code-num">{tok}</span>;
    if (P_WORD_OP.test(tok) || /^(<=|>=|≠|[=+\-*/<>])$/.test(tok)) return <span key={i} className="code-op">{tok}</span>;
    return <span key={i}>{tok}</span>;
  });
}

// ---------- Python ----------
const PY_KEYWORDS = 'def|return|for|in|if|elif|else|while|import|from|as|and|or|not|True|False|None|lambda|break|continue|pass|try|except|raise|with|class|is';
const PY_BUILTINS = 'print|len|range|sum|min|max|sorted|list|dict|set|tuple|int|float|str|bool|abs|round|enumerate|zip|type|isinstance';
const PY_TOKEN = new RegExp(
  `(#.*$|'(?:[^'\\\\]|\\\\.)*'|"(?:[^"\\\\]|\\\\.)*"|\\b(?:${PY_KEYWORDS})\\b|\\b(?:${PY_BUILTINS})\\b(?=\\()|\\b\\d+(?:\\.\\d+)?\\b|==|!=|<=|>=|\\*\\*|//|[=+\\-*/%<>@])`,
  'g',
);
const PY_KW = new RegExp(`^(?:${PY_KEYWORDS})$`);
const PY_FN = new RegExp(`^(?:${PY_BUILTINS})$`);

function highlightPython(line: string): ReactNode[] {
  return line.split(PY_TOKEN).map((tok, i) => {
    if (!tok) return null;
    if (tok.startsWith('#')) return <span key={i} className="code-com">{tok}</span>;
    if (tok.startsWith("'") || tok.startsWith('"')) return <span key={i} className="code-str">{tok}</span>;
    if (PY_KW.test(tok)) return <span key={i} className="code-kw">{tok}</span>;
    if (PY_FN.test(tok)) return <span key={i} className="code-fn">{tok}</span>;
    if (/^\d/.test(tok)) return <span key={i} className="code-num">{tok}</span>;
    if (/^(==|!=|<=|>=|\*\*|\/\/|[=+\-*/%<>@])$/.test(tok)) return <span key={i} className="code-op">{tok}</span>;
    return <span key={i}>{tok}</span>;
  });
}

/** Upper-case pseudocode keywords mean pseudocode; anything else is treated as Python. */
const isPseudo = (code: string) => /\b(WHILE|END IF|INPUT:|OUTPUT:)\b/.test(code);

/** Monospace code block with line numbers and syntax highlighting (Python or pseudocode). */
export function Pseudocode({ code }: { code: string }) {
  const lines = code.replace(/\s+$/, '').split('\n');
  const highlight = isPseudo(code) ? highlightPseudo : highlightPython;
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

/** Code with the text it prints underneath. */
export function CodeWithOutput({ code, output }: { code: string; output?: string }) {
  return (
    <div className="space-y-1.5">
      <Pseudocode code={code} />
      {output !== undefined && (
        <pre className="overflow-x-auto rounded-xl bg-surface px-3 py-2 font-mono text-[13.5px] leading-6 text-muted sm:text-[15px]">
          <span className="mr-2 select-none text-xs font-extrabold uppercase tracking-wider text-accent">Output</span>
          {output}
        </pre>
      )}
    </div>
  );
}
