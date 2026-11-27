/**
 * A small, safe expression calculator for the scratch tools (no `eval`).
 *
 * Supports + − × ÷, ^ or ** (right-associative), parentheses, unary minus, postfix !,
 * implicit multiplication (2π, 3(4 + 1), 2sqrt(2)), the constants π / pi, e and ans,
 * and the functions below. Angles are in radians.
 */

export class CalcError extends Error {}

const comb = (n: number, k: number) => {
  if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0) throw new CalcError('C(n, k) needs whole numbers');
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let c = 1;
  for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i;
  return Math.round(c);
};
const perm = (n: number, k: number) => {
  if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0) throw new CalcError('P(n, k) needs whole numbers');
  if (k < 0 || k > n) return 0;
  let p = 1;
  for (let i = 0; i < k; i++) p *= n - i;
  return p;
};
const factorial = (n: number) => {
  if (!Number.isInteger(n) || n < 0) throw new CalcError('! needs a whole number ≥ 0');
  if (n > 170) return Infinity;
  let p = 1;
  for (let i = 2; i <= n; i++) p *= i;
  return p;
};

/** name -> [function, min arity, max arity] */
const FUNCS: Record<string, [(...a: number[]) => number, number, number]> = {
  sqrt: [Math.sqrt, 1, 1],
  cbrt: [Math.cbrt, 1, 1],
  ln: [Math.log, 1, 1],
  log: [(x, b) => (b === undefined ? Math.log10(x) : Math.log(x) / Math.log(b)), 1, 2],
  log2: [Math.log2, 1, 1],
  log10: [Math.log10, 1, 1],
  exp: [Math.exp, 1, 1],
  sin: [Math.sin, 1, 1],
  cos: [Math.cos, 1, 1],
  tan: [Math.tan, 1, 1],
  asin: [Math.asin, 1, 1],
  acos: [Math.acos, 1, 1],
  atan: [Math.atan, 1, 1],
  abs: [Math.abs, 1, 1],
  floor: [Math.floor, 1, 1],
  ceil: [Math.ceil, 1, 1],
  round: [Math.round, 1, 1],
  C: [comb, 2, 2],
  nCr: [comb, 2, 2],
  comb: [comb, 2, 2],
  P: [perm, 2, 2],
  nPr: [perm, 2, 2],
  min: [Math.min, 1, 99],
  max: [Math.max, 1, 99],
};

const KNOWN = (name: string) => name in FUNCS || name === 'pi' || name === 'e' || name === 'ans';

type Token ={ t: 'num'; v: number } | { t: 'id'; v: string } | { t: 'op'; v: string };

function tokenize(src: string): Token[] {
  const s = src
    .replace(/\*\*/g, '^')
    .replace(/[×·∙]/g, '*')
    .replace(/[÷:]/g, '/')
    .replace(/[−–]/g, '-')
    .replace(/π/g, ' pi ');
  const out: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const rest = s.slice(i);
    const ws = rest.match(/^\s+/);
    if (ws) {
      i += ws[0].length;
      continue;
    }
    const num = rest.match(/^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i);
    if (num) {
      out.push({ t: 'num', v: Number(num[0]) });
      i += num[0].length;
      continue;
    }
    const id = rest.match(/^[A-Za-z_][A-Za-z_0-9]*/);
    if (id) {
      // "ln2", "sqrt16", "pi2": a known name followed by digits is that name times the number.
      const split = id[0].match(/^([A-Za-z_]+)(\d+)$/);
      const name = split && !KNOWN(id[0]) && KNOWN(split[1]) ? split[1] : id[0];
      out.push({ t: 'id', v: name });
      i += name.length;
      continue;
    }
    if ('+-*/^()!,√'.includes(rest[0])) {
      out.push({ t: 'op', v: rest[0] });
      i++;
      continue;
    }
    throw new CalcError(`Unexpected “${rest[0]}”`);
  }
  return out;
}

/** Evaluates `src`; `ans` is the value of the previous result. Throws CalcError on bad input. */
export function evaluate(src: string, ans = 0): number {
  const tokens = tokenize(src);
  if (!tokens.length) throw new CalcError('Empty');
  let i = 0;
  const peek = () => tokens[i];
  const isOp = (v: string) => peek()?.t === 'op' && peek().v === v;
  const expect = (v: string) => {
    if (!isOp(v)) throw new CalcError(v === ')' ? 'Missing )' : `Expected ${v}`);
    i++;
  };

  function expr(): number {
    let v = term();
    while (isOp('+') || isOp('-')) {
      const op = tokens[i++].v;
      const w = term();
      v = op === '+' ? v + w : v - w;
    }
    return v;
  }
  function term(): number {
    let v = unary();
    for (;;) {
      if (isOp('*') || isOp('/')) {
        const op = tokens[i++].v;
        const w = unary();
        v = op === '*' ? v * w : v / w;
      } else if (peek() && (peek().t === 'id' || isOp('(') || isOp('√'))) {
        v *= power(); // implicit multiplication: 2π, 3(4 + 1), 2sqrt(2)
      } else return v;
    }
  }
  function unary(): number {
    if (isOp('-')) {
      i++;
      return -unary();
    }
    if (isOp('+')) {
      i++;
      return unary();
    }
    return power();
  }
  function power(): number {
    const base = postfix();
    if (isOp('^')) {
      i++;
      return Math.pow(base, unary());
    }
    return base;
  }
  function postfix(): number {
    let v = primary();
    while (isOp('!')) {
      i++;
      v = factorial(v);
    }
    return v;
  }
  function primary(): number {
    const tok = peek();
    if (!tok) throw new CalcError('Incomplete');
    if (tok.t === 'num') {
      i++;
      return tok.v;
    }
    if (tok.t === 'op') {
      if (tok.v === '(') {
        i++;
        const v = expr();
        expect(')');
        return v;
      }
      if (tok.v === '√') {
        i++;
        return Math.sqrt(postfix());
      }
      throw new CalcError(`Unexpected “${tok.v}”`);
    }
    i++;
    const name = tok.v;
    if (name === 'pi') return Math.PI;
    if (name === 'e') return Math.E;
    if (name === 'ans') return ans;
    const f = FUNCS[name];
    if (!f) throw new CalcError(`Unknown name “${name}”`);
    const [fn, min, max] = f;
    let args: number[];
    if (isOp('(')) {
      i++;
      args = [expr()];
      while (isOp(',')) {
        i++;
        args.push(expr());
      }
      expect(')');
    } else args = [power()]; // sqrt 2, ln 5
    if (args.length < min || args.length > max) throw new CalcError(`${name} takes ${min === max ? min : `${min}–${max}`} argument${max > 1 ? 's' : ''}`);
    return fn(...args);
  }

  const v = expr();
  if (i < tokens.length) throw new CalcError(isOp(')') ? 'Unmatched )' : `Unexpected “${tokens[i].v}”`);
  if (Number.isNaN(v)) throw new CalcError('Undefined');
  return v;
}

/** Shows a result with at most 12 significant digits, hiding float noise such as 0.30000000000000004. */
export function formatNumber(v: number): string {
  if (v === Infinity) return '∞';
  if (v === -Infinity) return '−∞';
  if (Object.is(v, -0)) v = 0;
  const a = Math.abs(v);
  if (a !== 0 && (a >= 1e15 || a < 1e-9)) return v.toExponential(8).replace(/\.?0+e/, 'e');
  return String(parseFloat(v.toPrecision(12)));
}
