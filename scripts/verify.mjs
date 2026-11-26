// Independent re-computation of the answer key, plus structural checks of every lesson.
// Run with:  npm run verify   (needs Node 22.18+ / 24, which can import .ts files directly)
//
// For every question the script (1) checks the structure and (2) recomputes the
// answer with plain numerical linear algebra, then compares it with the `value`
// of the option marked correct. Every lecture is checked for unbalanced $ and
// unknown diagrams.

import { readFileSync } from 'node:fs';
import katex from 'katex';
import { ALL_QUESTIONS as QUESTIONS, LESSONS } from '../src/data/questions.ts';
import { variantOf } from '../src/lib/variants.ts';

// ---------- numeric helpers ----------
const EPS = 1e-9;
const I = (n) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
const T = (A) => A[0].map((_, j) => A.map((row) => row[j]));
const mul = (A, B) => A.map((row) => B[0].map((_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0)));
const mulVec = (A, v) => A.map((row) => row.reduce((s, a, k) => s + a * v[k], 0));
const scale = (c, A) => A.map((row) => row.map((a) => c * a));
const pow = (A, k) => (k === 0 ? I(A.length) : mul(A, pow(A, k - 1)));
const flat = (A) => A.flat();
const dot = (u, v) => u.reduce((s, x, i) => s + x * v[i], 0);
const norm = (v) => Math.sqrt(dot(v, v));
const deg = (rad) => (rad * 180) / Math.PI;
const angle = (u, v) => deg(Math.acos(dot(u, v) / (norm(u) * norm(v))));

/** Row echelon form by Gaussian elimination with partial pivoting. Returns the matrix, rank and determinant sign/product. */
function eliminate(M) {
  const A = M.map((r) => [...r]);
  const rows = A.length;
  const cols = A[0].length;
  let rank = 0;
  let detProduct = 1;
  for (let c = 0; c < cols && rank < rows; c++) {
    let p = rank;
    for (let i = rank + 1; i < rows; i++) if (Math.abs(A[i][c]) > Math.abs(A[p][c])) p = i;
    if (Math.abs(A[p][c]) < EPS) {
      detProduct = 0;
      continue;
    }
    if (p !== rank) {
      [A[p], A[rank]] = [A[rank], A[p]];
      detProduct = -detProduct;
    }
    detProduct *= A[rank][c];
    for (let i = rank + 1; i < rows; i++) {
      const f = A[i][c] / A[rank][c];
      for (let j = c; j < cols; j++) A[i][j] -= f * A[rank][j];
    }
    rank++;
  }
  return { A, rank, det: rank === rows && rows === cols ? detProduct : 0 };
}
const rank = (A) => eliminate(A).rank;
const det = (A) => eliminate(A).det;

/** Inverse by Gauss–Jordan on [A | I]. */
function inv(A) {
  const n = A.length;
  const M = A.map((row, i) => [...row, ...I(n)[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let i = c + 1; i < n; i++) if (Math.abs(M[i][c]) > Math.abs(M[p][c])) p = i;
    if (Math.abs(M[p][c]) < EPS) throw new Error('singular matrix');
    [M[p], M[c]] = [M[c], M[p]];
    const d = M[c][c];
    M[c] = M[c].map((x) => x / d);
    for (let i = 0; i < n; i++) if (i !== c) {
      const f = M[i][c];
      M[i] = M[i].map((x, j) => x - f * M[c][j]);
    }
  }
  return M.map((row) => row.slice(n));
}
const solve = (A, b) => mulVec(inv(A), b);

/**
 * Classifies Ax = b: -1 if there is no solution, otherwise the number of free
 * variables (0 = unique solution).
 */
const solutionKind = (A, b) => {
  const rA = rank(A);
  const rAb = rank(A.map((row, i) => [...row, b[i]]));
  return rA < rAb ? -1 : A[0].length - rA;
};

/** Real eigenvalues of a 2×2 matrix, ascending; [] if they are complex. */
function eig2([[a, b], [c, d]]) {
  const tr = a + d;
  const disc = tr * tr - 4 * (a * d - b * c);
  if (disc < -EPS) return [];
  const s = Math.sqrt(Math.max(0, disc));
  return [(tr - s) / 2, (tr + s) / 2];
}

/** Integer roots of f in [-lo, lo], ascending (for "for which t" questions with integer answers). */
const intRoots = (f, lo = 50) => {
  const out = [];
  for (let t = -lo; t <= lo; t++) if (Math.abs(f(t)) < 1e-7) out.push(t);
  return out;
};

/** Direction of v scaled so that its first non-zero entry is 1. */
const direction = (v) => {
  const k = v.find((x) => Math.abs(x) > EPS);
  return v.map((x) => x / k);
};


// ---------- logic, sets and complex numbers ----------
const implies = (p, q) => !p || q;
/** Every assignment of n booleans. */
const rowsOf = (n) => Array.from({ length: 2 ** n }, (_, m) => Array.from({ length: n }, (_, i) => !!((m >> i) & 1)));
const equivalent = (f, g, n) => rowsOf(n).every((row) => f(...row) === g(...row));
/** The single option whose test passes; throws if none or several do. */
const pickId = (tests) => {
  const ok = Object.keys(tests).filter((id) => tests[id]());
  if (ok.length !== 1) throw new Error(`expected exactly one passing option, got [${ok}]`);
  return { id: ok[0] };
};
/** Every predicate on a finite list of argument tuples, as a lookup function. */
const allPredicates = (tuples) =>
  Array.from({ length: 2 ** tuples.length }, (_, m) => {
    const table = new Map(tuples.map((t, i) => [t.join(','), !!((m >> i) & 1)]));
    return (...args) => table.get(args.join(','));
  });
const subsetsOf = (n) => Array.from({ length: 2 ** n }, (_, m) => m); // bitmasks over a universe of n elements
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const isPrime = (n) => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
};
/** Complex numbers as [re, im]. */
const cmul = ([a, b], [c, d]) => [a * c - b * d, a * d + b * c];
const cdiv = ([a, b], [c, d]) => {
  const den = c * c + d * d;
  return [(a * c + b * d) / den, (b * c - a * d) / den];
};
const cpow = (z, n) => (n === 0 ? [1, 0] : cmul(z, cpow(z, n - 1)));
const cabs = ([a, b]) => Math.hypot(a, b);
const round = (v) => v.map((x) => Math.round(x * 1e9) / 1e9 + 0);
/** Simple maps of the plane, from their geometric meaning (same order as PLANE_MAPS in la-03). */
const PLANE = [
  ([x, y]) => [-y, x], // rotate 90° counter-clockwise
  ([x, y]) => [y, -x], // rotate 90° clockwise
  ([x, y]) => [y, x], // reflect in y = x
  ([x, y]) => [x, -y], // reflect in the x-axis
  ([x, y]) => [-x, y], // reflect in the y-axis
  ([x, y]) => [-x, -y], // rotate 180°
];

/**
 * Compound statements as truth functions: [statement, option a, b, c, d] (same order as NEGATION_FORMS
 * in ml-01). Option a must be the only one equivalent to the negation of the statement.
 */
const NEGATION_FORMS = [
  [(P, Q, R) => implies(P, Q || R), (P, Q, R) => P && !Q && !R, (P, Q, R) => !P || (!Q && !R), (P, Q, R) => P && (!Q || !R), (P, Q, R) => implies(!P, !Q || !R)],
  [(P, Q, R) => implies(P, Q && R), (P, Q, R) => P && (!Q || !R), (P, Q, R) => !P || !Q || !R, (P, Q, R) => P && !Q && !R, (P, Q, R) => implies(!P, !Q && !R)],
  [(P, Q, R) => implies(P && Q, R), (P, Q, R) => P && Q && !R, (P, Q, R) => !P || !Q || !R, (P, Q, R) => (P || Q) && !R, (P, Q, R) => implies(!P && !Q, !R)],
  [(P, Q, R) => implies(P || Q, R), (P, Q, R) => (P || Q) && !R, (P, Q, R) => (!P && !Q) || !R, (P, Q, R) => P && Q && !R, (P, Q, R) => implies(!P || !Q, !R)],
];

/**
 * Function pools of ml-03 (same order as INJECTIVE, NOT_INJECTIVE, SURJECTIVE, NOT_SURJECTIVE there).
 * Injective ones are checked as strictly monotonic; non-injective ones carry a witness pair; surjective
 * ones are continuous and unbounded in both directions; non-surjective ones carry a value they miss.
 */
const INJ = [(x) => x ** 3, (x) => 2 * x + 1, Math.exp, (x) => x ** 3 + x, (x) => -3 * x + 2, (x) => x ** 5];
const NONINJ = [[(x) => x * x, -2, 2], [Math.abs, -1, 1], [Math.sin, 0, Math.PI], [Math.cos, 0, 2 * Math.PI], [(x) => x * x + 1, -1, 1], [(x) => x ** 3 - x, -1, 1]];
const SURJ = [(x) => x ** 3, (x) => 2 * x - 1, (x) => x ** 3 - x, (x) => -x + 4, (x) => x ** 5];
const NONSURJ = [[(x) => x * x, -1], [Math.exp, 0], [Math.sin, 2], [Math.abs, -1], [(x) => x * x + 1, 0.5], [Math.atan, 2]];
const grid = range(-2000, 2000).map((i) => i / 100);
const isInjective = (f) => {
  const ys = grid.map(f);
  return ys.every((y, i) => i === 0 || y > ys[i - 1]) || ys.every((y, i) => i === 0 || y < ys[i - 1]);
};
const hasCollision = ([f, x1, x2]) => x1 !== x2 && Math.abs(f(x1) - f(x2)) < 1e-9;
const isOnto = (f) => {
  const [lo, hi] = [f(-1000), f(1000)];
  return Math.min(lo, hi) < -100 && Math.max(lo, hi) > 100; // continuous and unbounded both ways
};
const misses = ([f, y]) => grid.every((x) => f(x) > y) || grid.every((x) => f(x) < y);
/**
 * "Which function has property P?": a is the good one, b–d the bad ones given by index.
 * `goodHas` / `badHas` decide whether that function has the property; exactly one must.
 */
const propertyCheck = (good, bad, goodHas, badHas) =>
  pickId({ a: () => goodHas(good), b: () => badHas(bad[0]), c: () => badHas(bad[1]), d: () => badHas(bad[2]) });

/** Maps ℤ → ℤ of ml-03 (same order as Z_MAPS): injective / surjective on a window of integers. */
const Z_MAPS = [(n, k) => n + k, (n, k) => k * n, (n) => n * n, (n, k) => Math.floor(n / k)];
function classifyCheck(kind, k, aCat) {
  const f = (n) => Z_MAPS[kind](n, k);
  const N = range(-60, 60);
  const injective = new Set(N.map(f)).size === N.length;
  const surjective = range(-10, 10).every((m) => N.some((n) => f(n) === m));
  const cat = injective && surjective ? 0 : injective ? 1 : surjective ? 2 : 3;
  const others = [0, 1, 2, 3].filter((c) => c !== aCat);
  return pickId({ a: () => cat === aCat, b: () => cat === others[0], c: () => cat === others[1], d: () => cat === others[2] });
}

/** ml-04 claim pools as predicates (same order as TRUE_CLAIMS / FALSE_CLAIMS / AB_TRUE / AB_FALSE / PRIME_CLAIMS). */
const mod = (a, m) => ((a % m) + m) % m;
const INT_TRUE = [(n) => mod(n * n - n, 2) === 0, (n) => mod(n ** 3 - n, 6) === 0, (n) => mod(2 * n + 1, 2) === 1, (n) => mod((n + 1) ** 2 - n * n, 2) === 1, (n) => mod(n * (n + 1) * (n + 2), 3) === 0, (n) => mod(n * n + n, 2) === 0];
const INT_FALSE = [(n) => mod(n * n + 1, 2) === 1, (n) => mod(n * n + n + 1, 2) === 0, (n) => mod(n * n - 1, 4) === 0, (n) => mod(3 * n + 1, 2) === 0, (n) => mod(n ** 3 + n, 3) === 0];
const even = (x) => mod(x, 2) === 0;
const AB_TRUE = [(a, b) => implies(even(a) && even(b), mod(a * b, 4) === 0), (a, b) => implies(!even(a) && !even(b), even(a + b)), (a, b) => implies(even(a), even(a * b)), (a, b) => implies(!even(a) && !even(b), !even(a * b))];
const AB_FALSE = [(a, b) => implies(even(a * b), even(a) && even(b)), (a, b) => implies(even(a + b), even(a) && even(b)), (a, b) => implies(mod(a * b, 4) === 0, mod(a, 4) === 0 || mod(b, 4) === 0), (a, b) => implies(!even(a + b), !even(a)), (a, b) => implies(!even(a * b), !even(a + b))];
const PRIME_HYP = [(n) => n > 1 && n % 2 === 1, (n) => n % 10 === 3, (n) => n % 6 === 1];

/**
 * ml-05 sums (same order as STEP_SUMS): the term function and the four options as functions of n
 * (a next term, b last term, c slip, d new total). S(n + 1) − S(n) must match option a only.
 */
const STEP_SUMS = [
  [(k) => 2 * k - 1, [(n) => 2 * n + 1, (n) => 2 * n - 1, (n) => n + 1, (n) => (n + 1) ** 2]],
  [(k) => k, [(n) => n + 1, (n) => n, (n) => 2 * n + 1, (n) => ((n + 1) * (n + 2)) / 2]],
  [(k) => k * k, [(n) => (n + 1) ** 2, (n) => n * n, (n) => n * n + 1, (n) => ((n + 1) * (n + 2) * (2 * n + 3)) / 6]],
  [(k) => 2 ** (k - 1), [(n) => 2 ** n, (n) => 2 ** (n - 1), (n) => 2 ** (n + 1), (n) => 2 ** (n + 1) - 1]],
  [(k) => k * (k + 1), [(n) => (n + 1) * (n + 2), (n) => n * (n + 1), (n) => n * (n + 2), (n) => ((n + 1) * (n + 2) * (n + 3)) / 3]],
];
function stepCheck(kind) {
  const [term, opts] = STEP_SUMS[kind];
  const S = (n) => range(1, n).reduce((s, k) => s + term(k), 0);
  const fits = (f) => () => range(1, 25).every((n) => S(n + 1) - S(n) === f(n));
  return pickId({ a: fits(opts[0]), b: fits(opts[1]), c: fits(opts[2]), d: fits(opts[3]) });
}
/** ml-05 inequalities (same order as INEQUALITIES): smallest n₀ from which left > right for good. */
const factorial = (n) => (n <= 1 ? 1 : n * factorial(n - 1));
const INEQ = [
  [(n) => 2 ** n, (n) => n * n], [(n) => 2 ** n, (n) => n ** 3], [(n) => 3 ** n, (n) => n ** 3], [factorial, (n) => 2 ** n],
  [factorial, (n) => 3 ** n], [(n) => 2 ** n, (n) => 3 * n], [(n) => 2 ** n, (n) => 5 * n], [(n) => 3 ** n, (n) => 5 * n],
];
const smallestN0 = (i) => range(1, 40).find((n0) => range(n0, 60).every((n) => INEQ[i][0](n) > INEQ[i][1](n)));

/** De Morgan for sets (form 0: (A ∪ B)ᶜ, form 1: (A ∩ B)ᶜ), checked on all subsets of a 3-element universe. */
function deMorganCheck(form) {
  const U = 0b111;
  const pairs = subsetsOf(3).flatMap((A) => subsetsOf(3).map((B) => [A, B]));
  const target = form === 0 ? (A, B) => U & ~(A | B) : (A, B) => U & ~(A & B);
  const same = (f) => () => pairs.every(([A, B]) => target(A, B) === (f(A, B) & U));
  const opts = form === 0
    ? { a: (A, B) => ~A & ~B, b: (A, B) => ~A | ~B, c: (A, B) => A & B, d: (A, B) => A & ~B }
    : { a: (A, B) => ~A | ~B, b: (A, B) => ~A & ~B, c: (A, B) => A | B, d: (A, B) => ~A & B };
  return pickId(Object.fromEntries(Object.entries(opts).map(([id, f]) => [id, same(f)])));
}

/**
 * Negation of a two-quantifier statement Qa x Qb y: R(x, y) (0 = ∀, 1 = ∃), checked over every relation on
 * a 3-element domain. Options: a flips both quantifiers, b neither, c only the first, d only the second;
 * all of them negate R.
 */
function negationOfTwo(a, b) {
  const D = [0, 1, 2];
  const quant = (q, f) => (q === 0 ? D.every(f) : D.some(f));
  const form = (qa, qb, R) => quant(qa, (x) => quant(qb, (y) => R(x, y)));
  const preds = allPredicates(D.flatMap((x) => D.map((y) => [x, y])));
  const negates = (qa, qb) => () => preds.every((R) => form(qa, qb, (x, y) => !R(x, y)) === !form(a, b, R));
  return pickId({ a: negates(1 - a, 1 - b), b: negates(a, b), c: negates(1 - a, b), d: negates(a, 1 - b) });
}

// ---------- one independent computation per question ----------
// Each returns a number, a list of numbers, { v, tol } or { id } (the option that must be correct).
const checks = {
  // ===== Mathematical Language =====
  // Lesson 1 · Logic
  'ml-01-2': () => {
    const falseRows = rowsOf(2).filter(([P, Q]) => !implies(P, Q)).map((r) => r.join());
    const is = (...rows) => () => falseRows.join(';') === rows.map((r) => r.join()).join(';');
    return pickId({ a: is([true, false]), b: is([false, true]), c: is([false, false]), d: is() });
  },
  'ml-01-6': () => {
    // R(ε, n) stands for |a_n − L| < ε on small finite domains.
    const E = [-1, 0, 1, 2];
    const N = [0, 1, 2];
    const preds = allPredicates(E.flatMap((e) => N.map((n) => [e, n])));
    const pos = E.filter((e) => e > 0);
    const nonpos = E.filter((e) => e <= 0);
    const after = (k) => N.filter((n) => n >= k);
    const original = (R) => pos.every((e) => N.some((k) => after(k).every((n) => R(e, n))));
    const negates = (form) => () => preds.every((R) => form(R) === !original(R));
    return pickId({
      a: negates((R) => pos.some((e) => N.every((k) => after(k).some((n) => !R(e, n))))),
      b: negates((R) => pos.some((e) => N.every((k) => after(k).every((n) => !R(e, n))))),
      c: negates((R) => pos.every((e) => N.some((k) => after(k).every((n) => !R(e, n))))),
      d: negates((R) => nonpos.some((e) => N.every((k) => after(k).some((n) => !R(e, n))))),
    });
  },

  // Lesson 2 · Sets
  'ml-02-6': () => {
    const S = subsetsOf(3);
    const triples = S.flatMap((A) => S.flatMap((B) => S.map((C) => [A, B, C])));
    const diff = (X, Y) => X & ~Y;
    const always = (lhs, rhs) => () => triples.every(([A, B, C]) => lhs(A, B, C) === rhs(A, B, C));
    return pickId({
      a: always((A, B, C) => diff(A, B | C), (A, B, C) => diff(A, B) & diff(A, C)),
      b: always((A, B, C) => diff(A, B & C), (A, B, C) => diff(A, B) & diff(A, C)),
      c: always((A, B, C) => A | (B & C), (A, B, C) => (A | B) & C),
      d: always((A, B, C) => diff(A, diff(B, C)), (A, B, C) => diff(diff(A, B), C)),
    });
  },

  // Lesson 3 · Functions

  // Lesson 4 · Proof techniques

  // Lesson 5 · Induction

  // Lesson 6 · Complex numbers

  // ===== Linear Algebra =====
  // Lesson 1 · Vectors and linear combinations

  // Lesson 2 · Linear systems (value = -1 if inconsistent, otherwise the number of free variables)

  // Lesson 3 · Matrices

  // Lesson 4 · Determinants

  // Lesson 5 · Inverse

  // Lesson 6 · Independence, basis, rank

  // Lesson 7 · Eigenvalues
};

// ml-01 · quick checks and Extra practice
Object.assign(checks, {
  'ml-01-q1': () => {
    const target = (C, B) => !(C && B);
    return pickId({
      a: () => equivalent(target, (C, B) => !C || !B, 2),
      b: () => equivalent(target, (C, B) => !C && !B, 2),
      c: () => equivalent(target, (C, B) => C || B, 2),
    });
  },
  'ml-01-q2': () => {
    const S = [1, 2, 3];
    return pickId({
      a: () => S.every((x) => S.some((y) => x + y === 4)),
      b: () => S.some((y) => S.every((x) => x + y === 4)),
      c: () => S.every((x) => S.every((y) => x + y === 4)),
    });
  },
  'ml-01-q3': () => {
    const D = [0, 1, 2];
    const preds = allPredicates(D.map((x) => [x]));
    const negates = (form) => () => preds.every((P) => form(P) === !D.every((x) => P(x)));
    return pickId({
      a: negates((P) => D.some((x) => !P(x))),
      b: negates((P) => D.every((x) => !P(x))),
      c: negates((P) => D.some((x) => P(x))),
    });
  },
});

// ml-02 · quick checks and Extra practice
Object.assign(checks, {
  'ml-02-q1': () => new Set(['1', '2', '{1,2}', '{}']).size,
  'ml-02-q2': () => {
    const B = new Set([2, 4, 6]);
    return [1, 2, 3, 4].filter((x) => B.has(x));
  },
  'ml-02-q3': () => {
    const english = new Set(range(0, 17));
    const german = new Set(range(13, 24)); // overlap 13..17 = 5 people
    if ([...english].filter((x) => german.has(x)).length !== 5) throw new Error('overlap should be 5');
    return range(0, 29).filter((x) => !english.has(x) && !german.has(x)).length;
  },
});

// ml-03 · quick checks and Extra practice
Object.assign(checks, {
  'ml-03-q1': () => {
    const collides = (f) => () => {
      const xs = range(-20, 20).map((x) => x / 2);
      return new Set(xs.map(f)).size < xs.length;
    };
    return pickId({ a: collides((x) => x * x), b: collides((x) => 2 * x + 1), c: collides((x) => x ** 3) });
  },
  'ml-03-q2': () => {
    const f = (x) => x + 1;
    const g = (x) => x * x;
    return f(g(2));
  },
  'ml-03-q3': () => {
    const n = 4;
    let count = 0;
    for (let m = 0; m < n ** n; m++) {
      const images = Array.from({ length: n }, (_, i) => Math.floor(m / n ** i) % n);
      if (new Set(images).size === n) count++;
    }
    return count;
  },
});

// ml-04 · quick checks and Extra practice
Object.assign(checks, {
  'ml-04-q1': () => {
    const odds = range(-15, 15).filter((n) => Math.abs(n % 2) === 1);
    const sums = odds.flatMap((a) => odds.map((b) => a + b));
    return pickId({ a: () => sums.every((s) => s % 2 === 0), b: () => sums.every((s) => Math.abs(s % 2) === 1), c: () => sums.some((s) => s % 2 === 0) && sums.some((s) => s % 2 !== 0) });
  },
  'ml-04-q2': () => {
    // P = "n^2 is even", Q = "n is even"; the contrapositive is ¬Q ⇒ ¬P.
    const target = (P, Q) => implies(!Q, !P);
    return pickId({
      a: () => equivalent(target, (P, Q) => implies(!Q, !P), 2),
      b: () => equivalent(target, (P, Q) => implies(!P, !Q), 2),
      c: () => equivalent(target, (P, Q) => implies(Q, P), 2),
    });
  },
});

// ml-05 · quick checks and Extra practice
Object.assign(checks, {
  'ml-05-q2': () => {
    const sum = (n) => range(1, n).reduce((s, k) => s + k, 0);
    const matches = (f) => () => range(1, 30).every((n) => Math.abs(sum(n + 1) - f(n)) < 1e-9);
    return pickId({ a: matches((n) => ((n + 1) * (n + 2)) / 2), b: matches((n) => (n + 1) ** 2 / 2), c: matches((n) => (n * (n + 1)) / 2 + n) });
  },
  'ml-05-q3': () => [1, 3, 9, 27, 81].reduce((s, x) => s + x, 0),
});

// ml-06 · quick checks and Extra practice
Object.assign(checks, {
  'ml-06-q1': () => round(cpow([0, 1], 3)),
  'ml-06-q2': () => {
    const [a, b] = [-2, 1];
    return pickId({ a: () => a < 0 && b > 0, b: () => a > 0 && b > 0, c: () => a < 0 && b < 0 });
  },
  'ml-06-q3': () => {
    const p = (z) => {
      const v = [cmul(z, z)[0] + 2 * z[0] + 5, cmul(z, z)[1] + 2 * z[1]];
      return cabs(v) < 1e-9;
    };
    const both = (re, im) => () => p([re, im]) && p([re, -im]);
    return pickId({ a: both(-1, 2), b: both(1, 2), c: both(-1, 4) });
  },
});

// la-01 · quick checks and Extra practice
Object.assign(checks, {
  'la-01-q1': () => [0, 1].map((i) => [1, -2][i] - 2 * [3, 4][i]),
  'la-01-q2': () => dot([1, 2], [3, -1]),
  'la-01-q3': () => {
    const reachable = rank([[2, -1], [4, -2]]) === rank([[2, -1, 1], [4, -2, 0]]);
    return pickId({ a: () => !reachable, b: () => reachable, c: () => reachable });
  },
});

// la-02 · quick checks and Extra practice
Object.assign(checks, {
  'la-02-q1': () => {
    const [x, y] = [1, 2];
    const e1 = x + y === 3;
    const e2 = 2 * x - y === 0;
    return pickId({ a: () => e1 && e2, b: () => e1 && !e2, c: () => !e1 && e2 });
  },
  'la-02-q2': () => [0, 1, 2].map((i) => [3, 1, 5][i] - 3 * [1, 2, 5][i]),
  'la-02-q3': () => solutionKind([[1, 3, 0, 2], [0, 0, 1, -1], [0, 0, 0, 0]], [1, 4, 0]),
});

// la-03 · quick checks and Extra practice
Object.assign(checks, {
  'la-03-q1': () => mulVec([[1, 2], [3, 4]], [1, 1]),
  'la-03-q2': () => flat(mul([[1, 1], [0, 1]], [[1, 0], [1, 1]])),
  'la-03-q3': () => {
    const reflect = ([x, y]) => [-x, y];
    return flat(T([reflect([1, 0]), reflect([0, 1])]));
  },
});

// la-04 · quick checks and Extra practice
Object.assign(checks, {
  'la-04-q1': () => det([[2, 1], [1, 3]]),
  'la-04-q2': () => det([[2, 5, 1], [0, 3, 7], [0, 0, 4]]),
  'la-04-q3': () => det(scale(3, [[2, 1], [0, 2]])),
});

// la-05 · quick checks and Extra practice
Object.assign(checks, {
  'la-05-q1': () => flat(inv([[2, 0], [0, 2]])),
  'la-05-q2': () => flat(inv([[1, 1], [0, 1]])),
  'la-05-q3': () => flat(inv([[2, 0, 0], [0, 5, 0], [0, 0, -1]])),
});

// la-06 · quick checks and Extra practice
Object.assign(checks, {
  'la-06-q1': () => {
    const independent = rank([[1, 2], [2, 4]]) === 2;
    return pickId({ a: () => !independent, b: () => independent, c: () => independent });
  },
  'la-06-q2': () => {
    const basis = rank([[1, 0], [1, 1]]) === 2;
    return pickId({ a: () => basis, b: () => !basis, c: () => !basis });
  },
  'la-06-q3': () => rank([[1, 2, 3], [2, 4, 6], [3, 6, 9]]),
});

// la-07 · quick checks and Extra practice
Object.assign(checks, {
  'la-07-q1': () => {
    const Av = mulVec([[3, 1], [0, 2]], [1, 0]);
    if (Math.abs(Av[1]) > EPS) return -99;
    return Av[0];
  },
  'la-07-q2': () => eig2([[1, 2], [2, 1]]),
  'la-07-q3': () => {
    const A = [[4, 1], [2, 3]];
    const isEig = (v) => () => {
      const Av = mulVec(A, v);
      return Av.every((x, i) => Math.abs(x - 2 * v[i]) < EPS);
    };
    return pickId({ a: isEig([1, -2]), b: isEig([1, 1]), c: isEig([2, 1]) });
  },
});

// la-01 · parametric questions: each check receives the variant's params
Object.assign(checks, {
  'la-01-1': ({ u, v, k }) => [0, 1, 2].map((i) => k * u[i] - v[i]),
  'la-01-2': ({ u, v }) => angle(u, v),
  'la-01-3': ({ v }) => norm(v),
  'la-01-4': ({ u, v }) => angle(u, v),
  'la-01-5': ({ a, b, c, d }) => {
    // u·v is linear in k: f(k) = f(0) + k (f(1) - f(0)).
    const f = (k) => dot([k, a, b], [c, k, d]);
    return -f(0) / (f(1) - f(0));
  },
  'la-01-6': ({ p, q, t }) => solve(T([p, q]), t),
  'la-01-x1': ({ u, v }) => u.map((x, i) => x + v[i]),
  'la-01-x2': ({ c, v }) => v.map((x) => c * x),
  'la-01-x3': ({ v }) => norm(v),
  'la-01-x4': ({ u, v }) => dot(u, v),
  'la-01-x5': ({ u, v }) => angle(u, v),
  'la-01-x6': ({ t }) => solve([[1, 1], [1, -1]], t),
});

// la-02 · parametric questions: each check receives the variant's params
Object.assign(checks, {
  'la-02-1': ({ A, b }) => solutionKind(A, b),
  'la-02-3': ({ A, b }) => solve(A, b),
  'la-02-4': ({ A, b }) => solutionKind(A, b),
  'la-02-5': ({ p, q, s, t }) => {
    // det is linear in a; its root is the only candidate, and there the system must be inconsistent.
    const f = (a) => det([[1, p], [q, a]]);
    const a0 = -f(0) / (f(1) - f(0));
    if (solutionKind([[1, p], [q, a0]], [s, t]) !== -1) throw new Error('system should be inconsistent at the root');
    return a0;
  },
  'la-02-6': ({ A, b }) => solutionKind(A, b),
  'la-02-x1': ({ s, d }) => solve([[1, 1], [1, -1]], [s, d]),
  'la-02-x2': ({ A, b }) => solutionKind(A, b),
  'la-02-x3': ({ A, b }) => solutionKind(A, b),
  'la-02-x4': ({ A, b }) => solve(A, b),
  'la-02-x5': ({ p, q, s }) => {
    const good = range(-80, 80).filter((k) => solutionKind([[1, p], [q, q * p]], [s, k]) > 0);
    if (good.length !== 1) throw new Error(`expected one value of k, got [${good}]`);
    return good[0];
  },
  'la-02-x6': ({ A, b }) => solutionKind(A, b),
});

// la-03 · parametric questions: each check receives the variant's params
Object.assign(checks, {
  'la-03-1': ({ m, n, p }) => {
    const C = mul(Array.from({ length: m }, () => Array(n).fill(1)), Array.from({ length: n }, () => Array(p).fill(1)));
    return [C.length, C[0].length];
  },
  'la-03-2': ({ A, B, i, j }) => mul(A, B)[i - 1][j - 1],
  'la-03-3': ({ A, n }) => flat(pow(A, n)),
  'la-03-4': ({ A, B }) => flat(T(mul(A, B))),
  // Each map rebuilt from its geometric meaning (same order as PLANE_MAPS in 03-matrices.practice.ts).
  'la-03-5': ({ map }) => flat(T([PLANE[map]([1, 0]), PLANE[map]([0, 1])])),
  'la-03-6': ({ first, second }) => {
    const both = (v) => PLANE[second](PLANE[first](v));
    return flat(T([both([1, 0]), both([0, 1])]));
  },
  'la-03-x1': ({ m, n, p }) => {
    const C = mul(Array.from({ length: m }, () => Array(n).fill(1)), Array.from({ length: n }, () => Array(p).fill(1)));
    return [C.length, C[0].length];
  },
  'la-03-x2': ({ A, v }) => mulVec(A, v),
  'la-03-x3': ({ M }) => flat(T(M)),
  'la-03-x4': ({ A, B }) => mul(A, B)[0][1],
  'la-03-x5': ({ A }) => flat(pow(A, 2)),
  'la-03-x6': ({ a, b }) => {
    const stretch = ([x, y]) => [a * x, b * y];
    return flat(T([stretch([1, 0]), stretch([0, 1])]));
  },
});

// la-04 · parametric questions: each check receives the variant's params
Object.assign(checks, {
  'la-04-1': ({ A }) => det(A),
  'la-04-2': ({ u, v }) => Math.abs(det(T([u, v]))),
  'la-04-3': ({ A }) => det(A),
  'la-04-4': ({ n, k, d }) => {
    const A = I(n);
    A[0][0] = d; // any matrix with det A = d
    return det(scale(k, A));
  },
  'la-04-5': ({ dA, dB }) => {
    const A = [[dA, 1, 0], [0, 1, 2], [0, 0, 1]];
    const B = [[1, 0, 0], [3, dB, 0], [1, 1, 1]];
    return det(mul(mul(T(A), inv(B)), pow(A, 2)));
  },
  'la-04-6': ({ s }) => intRoots((t) => det([[t, s, s], [s, t, s], [s, s, t]])),
  'la-04-x1': ({ A }) => det(A),
  'la-04-x2': ({ A }) => det(A),
  'la-04-x3': ({ u, v }) => Math.abs(det(T([u, v]))),
  'la-04-x4': ({ A }) => det(A),
  'la-04-x5': ({ d }) => det(inv([[d, 2], [0, 1]])),
  'la-04-x6': ({ A, i, j }) => {
    const B = A.map((row) => [...row]);
    [B[i], B[j]] = [B[j], B[i]];
    return det(B);
  },
});

// la-05 · parametric questions: each check receives the variant's params
Object.assign(checks, {
  'la-05-1': ({ A }) => flat(inv(A)),
  'la-05-2': (p) => pickId(Object.fromEntries(['a', 'b', 'c', 'd'].map((id) => [id, () => Math.abs(det(p[id])) < EPS]))),
  'la-05-3': ({ A, b }) => solve(A, b),
  'la-05-4': ({ Ai, Bi }) => flat(inv(mul(inv(Ai), inv(Bi)))),
  'la-05-5': ({ A }) => inv(A)[0][2],
  'la-05-6': ({ n, k, D }) => {
    // Any n×n matrix with det(kA) = D: A = diag(D / k^n, 1, …).
    const A = I(n);
    A[0][0] = D / k ** n;
    if (Math.abs(det(scale(k, A)) - D) > 1e-9) throw new Error('setup');
    return det(inv(A));
  },
  'la-05-x1': ({ a, b }) => flat(inv([[a, 0], [0, b]])),
  'la-05-x2': (p) => pickId(Object.fromEntries(['a', 'b', 'c', 'd'].map((id) => [id, () => Math.abs(det(p[id])) > EPS]))),
  'la-05-x3': ({ A, B }) => flat(mul(A, B)),
  'la-05-x4': ({ A }) => flat(inv(A)),
  'la-05-x5': ({ Ai, b }) => solve(inv(Ai), b),
  'la-05-x6': ({ Ai }) => flat(inv(Ai)),
});

// la-06 · parametric questions: each check receives the variant's params
Object.assign(checks, {
  'la-06-1': ({ vs }) => rank(vs),
  'la-06-3': ({ A }) => rank(A),
  'la-06-4': ({ a, b, c }) => {
    // det of the columns is linear in k; its root is the answer.
    const f = (k) => det(T([[1, a, 0], [0, 1, b], [1, k, c]]));
    return -f(0) / (f(1) - f(0));
  },
  'la-06-5': ({ m, n, rk }) => {
    // Build an m×n matrix of rank rk and count free variables.
    const A = Array.from({ length: m }, (_, i) => Array.from({ length: n }, (_, j) => (i < rk && i === j ? 1 : 0)));
    if (rank(A) !== rk) throw new Error('setup');
    return n - rank(A);
  },
  'la-06-6': ({ b1, b2, v }) => solve(T([b1, b2]), v),
  'la-06-x1': (p) => pickId(Object.fromEntries(['a', 'b', 'c', 'd'].map((id) => [id, () => rank(p[id]) < 2]))),
  'la-06-x2': ({ vs }) => rank(vs),
  'la-06-x3': ({ n }) => rank(I(n)),
  'la-06-x4': ({ A }) => rank(A),
  'la-06-x5': ({ m, n, rk }) => {
    const A = Array.from({ length: m }, (_, i) => Array.from({ length: n }, (_, j) => (i < rk && i === j ? 1 : 0)));
    return n - rank(A);
  },
  'la-06-x6': ({ b1, b2, v }) => solve(T([b1, b2]), v),
});

// la-07 · parametric questions: each check receives the variant's params
Object.assign(checks, {
  'la-07-1': ({ A }) => eig2(A),
  'la-07-2': ({ A, v }) => {
    const Av = mulVec(A, v);
    if (Math.abs(Av[0] * v[1] - Av[1] * v[0]) > EPS) throw new Error('v is not an eigenvector');
    return Av[0] / v[0];
  },
  'la-07-3': ({ A }) => eig2(A),
  'la-07-4': (p) => {
    const isEig = (v) => () => mulVec(p.A, v).every((x, i) => Math.abs(x - p.lambda * v[i]) < EPS);
    return pickId(Object.fromEntries(['a', 'b', 'c', 'd'].map((id) => [id, isEig(p[id])])));
  },
  'la-07-5': ({ e, k }) => {
    const A = [[e[0], 1, 0], [0, e[1], 1], [0, 0, e[2]]]; // triangular: these eigenvalues
    return det(scale(k, inv(A)));
  },
  'la-07-6': ({ A, n }) => pow(A, n)[0][1],
  'la-07-x1': ({ A }) => eig2(A),
  'la-07-x2': ({ A, v }) => {
    const Av = mulVec(A, v);
    if (Math.abs(Av[1]) > EPS) return -99;
    return Av[0];
  },
  'la-07-x3': ({ v, lam, c }) => {
    const A = [[lam, 0], [0, lam]];
    if (!mulVec(A, v).every((x, i) => x === lam * v[i])) throw new Error('setup');
    return mulVec(A, v.map((x) => c * x));
  },
  'la-07-x4': ({ A }) => eig2(A),
  'la-07-x5': ({ t, d }) => eig2([[t, -d], [1, 0]]),
  'la-07-x6': ({ lam, k }) => {
    const A = [[lam, 1], [0, lam + 1]];
    const Akv = mulVec(pow(A, k), [1, 0]);
    if (Math.abs(Akv[1]) > EPS) throw new Error('v must stay an eigenvector');
    return Akv[0];
  },
});

// ml-01 · parametric questions: each check receives the variant's params
Object.assign(checks, {
  'ml-01-1': () => {
    const target = (P, Q) => implies(P, Q);
    return pickId({
      a: () => equivalent(target, (P, Q) => implies(!Q, !P), 2),
      b: () => equivalent(target, (P, Q) => implies(Q, P), 2),
      c: () => equivalent(target, (P, Q) => implies(!P, !Q), 2),
      d: () => equivalent(target, (P, Q) => P && Q, 2),
    });
  },
  'ml-01-3': ({ a, b }) => negationOfTwo(a, b),
  'ml-01-4': ({ c, minus, d }) => {
    const X = range(-5, 5);
    const Y = range(-20, 20);
    const rel = (x, y) => (minus ? x - y === c : x + y === c);
    return pickId({
      a: () => X.every((x) => Y.some((y) => rel(x, y))),
      b: () => Y.some((y) => X.every((x) => rel(x, y))),
      c: () => X.every((x) => Y.every((y) => rel(x, y))),
      d: () => X.some((x) => Y.every((y) => x * y === d)),
    });
  },
  'ml-01-5': ({ form }) => {
    const [target, ...opts] = NEGATION_FORMS[form];
    const neg = (P, Q, R) => !target(P, Q, R);
    return pickId(Object.fromEntries(['a', 'b', 'c', 'd'].map((id, i) => [id, () => equivalent(neg, opts[i], 3)])));
  },
  'ml-01-x1': () => {
    const target = (P, Q) => implies(P, Q);
    return pickId({
      a: () => equivalent(target, (P, Q) => implies(!Q, !P), 2),
      b: () => equivalent(target, (P, Q) => implies(Q, P), 2),
      c: () => equivalent(target, (P, Q) => implies(!P, !Q), 2),
      d: () => equivalent(target, (P, Q) => P && !Q, 2),
    });
  },
  'ml-01-x2': () =>
    pickId({
      a: () => [true, false].every((Q) => implies(false, Q) === true),
      b: () => [true, false].every((Q) => implies(false, Q) === false),
      c: () => false, // an implication of two statements is a statement
      d: () => implies(false, true) !== implies(false, false),
    }),
  'ml-01-x3': () => {
    const D = [0, 1, 2];
    const preds = allPredicates(D.map((x) => [x]));
    const negates = (form) => () => preds.every((Y) => form(Y) === !D.some((x) => Y(x)));
    return pickId({
      a: negates((Y) => D.every((x) => !Y(x))),
      b: negates((Y) => D.some((x) => !Y(x))),
      c: negates((Y) => D.every((x) => Y(x))),
      d: negates((Y) => D.some((x) => Y(x))),
    });
  },
  'ml-01-x4': ({ S }) =>
    pickId({
      a: () => !S.some((y) => S.every((x) => x <= y)),
      b: () => !S.every((x) => S.some((y) => x <= y)),
      c: () => !S.every((x) => S.some((y) => y < x)),
      d: () => !S.some((x) => S.every((y) => x <= y)),
    }),
  'ml-01-x5': () => {
    const target = (P, Q) => !implies(P, Q);
    return pickId({
      a: () => equivalent(target, (P, Q) => P && !Q, 2),
      b: () => equivalent(target, (P, Q) => implies(P, !Q), 2),
      c: () => equivalent(target, (P, Q) => implies(!P, !Q), 2),
      d: () => equivalent(target, (P, Q) => !P && Q, 2),
    });
  },
  'ml-01-x6': ({ a, b }) => negationOfTwo(a, b),
});

// ml-02 · parametric questions: each check receives the variant's params
Object.assign(checks, {
  'ml-02-1': ({ A, B }) => A.filter((x) => !new Set(B).has(x)).sort((p, q) => p - q),
  'ml-02-2': ({ n }) => subsetsOf(n).length,
  'ml-02-3': ({ N, a, b, k }) => {
    const first = new Set(range(0, a - 1));
    const second = new Set(range(a - k, a - k + b - 1)); // overlaps the first in exactly k people
    if ([...first].filter((x) => second.has(x)).length !== k) throw new Error('overlap');
    return range(0, N - 1).filter((x) => !first.has(x) && !second.has(x)).length;
  },
  'ml-02-4': ({ form }) => deMorganCheck(form),
  'ml-02-5': ({ m, nB }) => range(-20, 20).filter((x) => x * x <= m).length * nB,
  'ml-02-x1': ({ A, B }) => [...new Set([...A, ...B])].sort((p, q) => p - q),
  'ml-02-x2': ({ n }) => subsetsOf(n).length,
  'ml-02-x3': ({ m, n }) => range(1, m).flatMap((x) => range(1, n).map((y) => [x, y])).length,
  'ml-02-x4': ({ N, a, b }) => {
    const tea = new Set(range(0, a - 1));
    const coffee = new Set(range(N - b, N - 1));
    if (new Set([...tea, ...coffee]).size !== N) throw new Error('everyone drinks one of the two');
    return [...tea].filter((x) => coffee.has(x)).length;
  },
  'ml-02-x5': ({ form }) => deMorganCheck(form),
  'ml-02-x6': () => {
    const U = 0b111;
    const pairs = subsetsOf(3).flatMap((A) => subsetsOf(3).map((B) => [A, B]));
    const same = (f) => () => pairs.every(([A, B]) => (A & ~B & U) === (f(A, B) & U));
    return pickId({ a: same((A, B) => A & ~B), b: same((A, B) => B & ~A), c: same((A, B) => ~A & B), d: same((A, B) => (A | B) & ~A) });
  },
});

// ml-03 · parametric questions: each check receives the variant's params
Object.assign(checks, {
  'ml-03-1': ({ a, b, x }) => {
    const f = (t) => t * t + a;
    const g = (t) => b * t;
    return g(f(x));
  },
  'ml-03-2': ({ good, bad }) => propertyCheck(INJ[good], bad.map((i) => NONINJ[i]), isInjective, (w) => !hasCollision(w)),
  'ml-03-3': ({ a, b, c }) => {
    const f = (x) => (a * x + b) / (x - c);
    const undoes = (h) => () => [-7, -2, 0.5, 4, 9, 11].filter((x) => x !== c).every((x) => Math.abs(h(f(x)) - x) < 1e-9);
    return pickId({
      a: undoes((y) => (c * y + b) / (y - a)),
      b: undoes((y) => (y - c) / (a * y + b)),
      c: undoes((y) => (c * y - b) / (y + a)),
      d: undoes((y) => (y + c) / (a * y - b)),
    });
  },
  'ml-03-4': ({ n, m }) => {
    // Enumerate every function {1..n} → {1..m} as a tuple of images.
    let count = 0;
    for (let code = 0; code < m ** n; code++) count++;
    return count;
  },
  'ml-03-5': ({ k, n }) => {
    let count = 0;
    for (let code = 0; code < n ** k; code++) {
      const images = Array.from({ length: k }, (_, i) => Math.floor(code / n ** i) % n);
      if (new Set(images).size === k) count++;
    }
    return count;
  },
  'ml-03-6': ({ kind, k, aCat }) => classifyCheck(kind, k, aCat),
  'ml-03-x1': ({ a, b, x }) => {
    const f = (t) => a * t + b;
    const g = (t) => t * t;
    return f(g(x));
  },
  'ml-03-x2': ({ good, bad }) => propertyCheck(SURJ[good], bad.map((i) => NONSURJ[i]), isOnto, (w) => !misses(w)),
  'ml-03-x3': ({ a, b }) => {
    const f = (x) => a * x + b;
    const undoes = (h) => () => range(-5, 5).every((x) => Math.abs(h(f(x)) - x) < 1e-12);
    return pickId({ a: undoes((x) => (x - b) / a), b: undoes((x) => (x + b) / a), c: undoes((x) => 1 / (a * x + b)), d: undoes((x) => a * x - b) });
  },
  'ml-03-x4': ({ n, m }) => {
    let count = 0;
    for (let code = 0; code < m ** n; code++) count++;
    return count;
  },
  'ml-03-x5': ({ f, t }) => Number(Object.keys(f).find((i) => f[i] === t)) + 1,
  'ml-03-x6': ({ kind, k, aCat }) => classifyCheck(kind, k, aCat),
});

// ml-04 · parametric questions: each check receives the variant's params
Object.assign(checks, {
  'ml-04-2': ({ m, s }) => {
    const rems = new Set(range(-20, 20).map((k) => (((m * k + s) ** 2 % m) + m) % m));
    if (rems.size !== 1) throw new Error('remainder should not depend on k');
    return [...rems][0];
  },
  'ml-04-3': ({ f, t }) => {
    const holds = (pred) => range(-60, 60).every(pred);
    return pickId({ a: () => !holds(INT_FALSE[f]), b: () => !holds(INT_TRUE[t[0]]), c: () => !holds(INT_TRUE[t[1]]), d: () => !holds(INT_TRUE[t[2]]) });
  },
  'ml-04-4': ({ p }) => range(1, 200).find((n) => !isPrime(n * n + n + p)),
  'ml-04-6': ({ p }) => {
    // From (p·m)² = p·b² solve for b² and compare with each option as a function of m.
    const b2 = (m) => (p * m) ** 2 / p;
    const same = (h) => () => range(1, 6).every((m) => Math.abs(h(m) - b2(m)) < 1e-9);
    return pickId({ a: same((m) => p * m * m), b: same((m) => p * p * m * m), c: same((m) => m * m), d: same((m) => (p * m) ** 2) });
  },
  'ml-04-x1': ({ claim, ns }) => pickId(Object.fromEntries(['a', 'b', 'c', 'd'].map((id, i) => [id, () => PRIME_HYP[claim](ns[i]) && !isPrime(ns[i])]))),
  'ml-04-x2': () => {
    const squares = range(-20, 20).map((k) => (2 * k + 1) ** 2);
    return pickId({ a: () => squares.every((s) => s % 2 === 1), b: () => squares.every((s) => s % 2 === 0), c: () => squares.every((s) => s % 4 === 3), d: () => squares.every((s) => s % 4 === 0) });
  },
  'ml-04-x4': ({ m, s }) => {
    const rems = new Set(range(-20, 20).map((k) => (((m * k + s) ** 2 % m) + m) % m));
    if (rems.size !== 1) throw new Error('remainder should not depend on k');
    return [...rems][0];
  },
  'ml-04-x5': ({ t, f }) => {
    const Z = range(-12, 12);
    const all = (p) => Z.every((a) => Z.every((b) => p(a, b)));
    return pickId({ a: () => all(AB_TRUE[t]), b: () => all(AB_FALSE[f[0]]), c: () => all(AB_FALSE[f[1]]), d: () => all(AB_FALSE[f[2]]) });
  },
  'ml-04-x6': ({ d, ns }) => pickId(Object.fromEntries(['a', 'b', 'c', 'd'].map((id, i) => [id, () => (ns[i] * ns[i]) % d === 0 && ns[i] % d !== 0]))),
});

// ml-05 · parametric questions: each check receives the variant's params
Object.assign(checks, {
  'ml-05-1': ({ n }) => range(1, n).reduce((s, k) => s + k, 0),
  'ml-05-2': ({ kind }) => stepCheck(kind),
  'ml-05-3': ({ n }) => range(1, n).reduce((s, k) => s + k * k, 0),
  'ml-05-4': ({ q, m }) => range(0, m).reduce((s, k) => s + q ** k, 0),
  'ml-05-5': ({ i }) => smallestN0(i),
  'ml-05-x1': ({ n }) => range(1, n).reduce((s, k) => s + k, 0),
  'ml-05-x2': ({ n }) => range(1, n).reduce((s, k) => s + 2 * k - 1, 0),
  'ml-05-x3': ({ q, m }) => range(0, m).reduce((s, k) => s + q ** k, 0),
  'ml-05-x4': ({ kind }) => stepCheck(kind),
  'ml-05-x5': ({ S }) => range(1, 200).find((n) => range(1, n).reduce((s, k) => s + k, 0) === S),
  'ml-05-x6': ({ i }) => smallestN0(i),
});

// ml-06 · parametric questions: each check receives the variant's params
Object.assign(checks, {
  'ml-06-1': ({ z, w }) => cmul(z, w),
  'ml-06-2': ({ z }) => cabs(z),
  'ml-06-3': ({ z, w }) => cdiv(z, w),
  'ml-06-4': ({ re, im }) => Math.round(deg(Math.atan2(im, re)) * 1e9) / 1e9,
  'ml-06-5': ({ z, n }) => round(cpow(z, n)),
  'ml-06-6': ({ m, k }) => {
    const isRoot = (z) => () => {
      const w = cpow(z, 4);
      return Math.abs(w[0] + m ** 4) < 1e-9 && Math.abs(w[1]) < 1e-9;
    };
    const t = ((45 + 90 * k) * Math.PI) / 180;
    // b–d are the three non-roots m·i, −m and m (in some order).
    return pickId({ a: isRoot([m * Math.cos(t), m * Math.sin(t)]), b: isRoot([0, m]), c: isRoot([-m, 0]), d: isRoot([m, 0]) });
  },
  'ml-06-x1': ({ z, w }) => [z[0] + w[0], z[1] + w[1]],
  'ml-06-x2': ({ z }) => round(cpow(z, 2)),
  'ml-06-x3': ({ z }) => [z[0], -z[1]],
  'ml-06-x4': ({ z }) => cabs(z),
  'ml-06-x5': ({ z }) => {
    const p = cmul(z, [z[0], -z[1]]);
    if (Math.abs(p[1]) > 1e-12) throw new Error('z times its conjugate must be real');
    return p[0];
  },
  'ml-06-x6': ({ r1, r2, t1, t2 }) => {
    const polar = (rr, d) => [rr * Math.cos((d * Math.PI) / 180), rr * Math.sin((d * Math.PI) / 180)];
    return round(cmul(polar(r1, t1), polar(r2, t2)));
  },
});

// @@new-checks (quick checks <lesson>-q<n> and Extra practice <lesson>-x<n> are added above this line)

/** Purely conceptual questions without a numeric answer (reviewed by hand). */
const CONCEPTUAL = new Set(['ml-05-q1', 'ml-04-x3', 'ml-04-q3', 'la-02-2', 'la-06-2', 'ml-04-1', 'ml-04-5', 'ml-05-6']);

// ---------- comparison ----------
const closeNum = (a, b, tol) => a === b || Math.abs(a - b) <= tol;
const same = (a, b, tol) => {
  if (typeof a === 'number' && typeof b === 'number') return closeNum(a, b, tol);
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => closeNum(x, b[i], tol));
  return false;
};
const show = (x) => (Array.isArray(x) ? `[${x.map((n) => +n.toFixed(6)).join(', ')}]` : String(+x.toFixed?.(6) ?? x));

// ---------- run ----------
const errors = [];
const fail = (id, msg) => errors.push(`${id}: ${msg}`);
// The renderer splits on <i>…</i> first and then on $, so every piece must have balanced $.
const dollars = (id, text) => {
  for (const piece of text.split(/<i>(.*?)<\/i>/g))
    if ((piece.match(/\$/g) ?? []).length % 2) fail(id, `unbalanced $ in: ${text.slice(0, 60)}…`);
};

const diagramSource = readFileSync(new URL('../src/components/Diagram.tsx', import.meta.url), 'utf8');
const DIAGRAMS = new Set([...diagramSource.matchAll(/^  (\w+): \{$/gm)].map((m) => m[1]));

// Lessons and lectures
const lessonIds = new Set();
const quickChecks = [];
for (const l of LESSONS) {
  if (lessonIds.has(l.id)) fail(l.id, 'duplicate lesson id');
  lessonIds.add(l.id);
  if (l.lecture.length < 3) fail(l.id, 'a lecture needs at least 3 sections');
  if (l.minutes < 5 || l.minutes > 8) fail(l.id, 'lectures are planned for 5–8 minutes');
  if (l.questions.length < 5) fail(l.id, 'needs at least 5 practice questions');
  for (const d of [1, 2, 3]) if (!l.questions.some((q) => q.difficulty === d)) fail(l.id, `has no level-${d} question`);
  if (l.extra.length < 5) fail(l.id, 'needs at least 5 Extra practice questions');
  if (l.extra.some((q) => q.difficulty > 2)) fail(l.id, 'Extra practice is gentler: difficulty 1–2 only');
  const quizzes = l.lecture.flatMap((s) => s.blocks.filter((b) => b.kind === 'quiz'));
  if (quizzes.length < 2) fail(l.id, 'a lecture needs at least 2 quick checks');
  for (const s of l.lecture) {
    if (!s.blocks.length) fail(l.id, `section "${s.title}" is empty`);
    for (const b of s.blocks) {
      const texts = { text: [b.text], formula: [b.caption ?? ''], box: [b.title, b.text], example: [b.prompt, ...(b.steps ?? [])], diagram: [b.caption ?? ''], quiz: [b.prompt, b.explanation, ...(b.options ?? []).flatMap((o) => [o.label, o.trapExplanation ?? ''])] }[b.kind];
      if (!texts) { fail(l.id, `unknown block kind "${b.kind}"`); continue; }
      for (const t of texts) dollars(`${l.id} / ${s.title}`, t);
      if (b.kind === 'diagram' && !DIAGRAMS.has(b.type)) fail(l.id, `unknown diagram "${b.type}"`);
      if (b.kind === 'quiz') {
        if (!b.id.startsWith(`${l.id}-q`)) fail(b.id, `quick-check id should start with ${l.id}-q`);
        if (b.options.length < 3 || b.options.length > 4) fail(b.id, 'a quick check needs 3–4 options');
        quickChecks.push(b);
      }
    }
  }
}

// Questions
const seen = new Set();
let recomputed = 0;
let variantsChecked = 0;
/** Parametric questions are generated with this many seeds and every variant is checked. */
const SEEDS = 300;
// Artefacts of string building: "NaN", "undefined", doubled signs such as "- -3" or "+ -2", and TeX
// commands that lost their backslash in a plain (non-raw) template string, such as "3cdot 4".
const BROKEN = /NaN|undefined|Infinity|\[object|[+-]\s*[+-]\s*\d|(?<![\\a-zA-Z{])(cdot|tfrac|dfrac|mathbf|sqrt|mathbb|begin\{)/;

function checkStructure(q, tag = q.id) {
  if (q.svgDiagramType && !DIAGRAMS.has(q.svgDiagramType)) fail(tag, `unknown diagram "${q.svgDiagramType}"`);
  const correct = q.options.find((o) => o.id === q.correctOptionId);
  if (!correct) { fail(tag, 'correctOptionId does not match any option'); return false; }
  if (new Set(q.options.map((o) => o.id)).size !== q.options.length) fail(tag, 'duplicate option ids');
  if (new Set(q.options.map((o) => o.label)).size !== q.options.length) fail(tag, 'two options have the same label');
  if (q.options.length < 4 || q.options.length > 5) fail(tag, 'needs 4–5 options');
  for (const o of q.options) {
    if (o.id !== q.correctOptionId && !o.trapExplanation) fail(tag, `option ${o.id} has no trapExplanation`);
    if (o.id === q.correctOptionId && o.trapExplanation) fail(tag, 'correct option must not have a trapExplanation');
  }
  if (q.stepByStepSolution.length < 3) fail(tag, 'needs at least 3 solution steps');
  const texts = [q.promptText, q.mathFormula ?? '', ...q.options.flatMap((o) => [o.label, o.trapExplanation ?? '']), ...q.stepByStepSolution];
  for (const text of texts) {
    dollars(tag, text);
    if (BROKEN.test(text)) fail(tag, `broken text: ${text.match(BROKEN)[0]} in "${text.slice(0, 70)}…"`);
  }
  // Every formula must render: inline $…$ pieces and the display formula.
  const formulas = [q.mathFormula ?? '', ...texts.flatMap((t) => t.split(/<i>(.*?)<\/i>/g).flatMap((piece) => piece.split('$').filter((_, i) => i % 2 === 1)))];
  for (const tex of formulas.filter(Boolean)) {
    try {
      katex.renderToString(tex, { throwOnError: true });
    } catch (e) {
      fail(tag, `KaTeX cannot render "${tex.slice(0, 60)}": ${e.message.split('\n')[0]}`);
    }
  }
  return true;
}

for (const q of QUESTIONS) {
  if (seen.has(q.id)) fail(q.id, 'duplicate id');
  seen.add(q.id);
  if (!q.id.startsWith(q.lessonId)) fail(q.id, `id should start with its lesson id ${q.lessonId}`);
  if (!q.generate) {
    if (checkStructure(q)) verifyKey(q);
    continue;
  }
  // Parametric: every variant must be well formed and have a correct key.
  const errorsBefore = errors.length;
  for (let seed = 1; seed <= SEEDS && errors.length === errorsBefore; seed++) {
    let v;
    try {
      v = variantOf(q, seed);
    } catch (e) {
      fail(q.id, `seed ${seed}: generate threw: ${e.message}`);
      break;
    }
    if (!v.params) { fail(q.id, 'a parametric question must return params for the checker'); break; }
    if (!checkStructure(v, `${q.id} (seed ${seed})`)) break;
    const values = v.options.map((o) => JSON.stringify(o.value)).filter((x) => x !== undefined);
    if (new Set(values).size !== values.length) fail(`${q.id} (seed ${seed})`, 'two options have the same value');
    verifyKey(v, `${q.id} (seed ${seed})`);
    variantsChecked++;
  }
}

for (const b of quickChecks) {
  if (seen.has(b.id)) fail(b.id, 'duplicate id');
  seen.add(b.id);
  const correct = b.options.find((o) => o.id === b.correctOptionId);
  if (!correct) { fail(b.id, 'correctOptionId does not match any option'); continue; }
  if (new Set(b.options.map((o) => o.id)).size !== b.options.length) fail(b.id, 'duplicate option ids');
  if (correct.trapExplanation) fail(b.id, 'correct option must not have a trapExplanation');
  verifyKey(b);
}

/** Recomputes the answer of a question or quick check and compares it with the key. */
function verifyKey(q, tag = q.id) {
  if (CONCEPTUAL.has(q.id)) return;
  const correct = q.options.find((o) => o.id === q.correctOptionId);
  const check = checks[q.id];
  if (!check) return fail(tag, 'no independent check defined');

  let res;
  try {
    res = check(q.params);
  } catch (e) {
    return fail(tag, `check threw: ${e.message}`);
  }
  recomputed++;
  if (res && typeof res === 'object' && 'id' in res) {
    if (res.id !== q.correctOptionId) fail(tag, `computation picks option ${res.id}, key says ${q.correctOptionId}`);
    return;
  }
  if (q.options.some((o) => o.value === undefined)) return fail(tag, 'every option needs a value');
  const v = res && typeof res === 'object' && 'v' in res ? res.v : res;
  const tol = res && typeof res === 'object' && 'tol' in res ? res.tol : 1e-6;
  if (!same(correct.value, v, tol)) fail(tag, `computed ${show(v)}, key option ${correct.id} = ${show(correct.value)}`);
  for (const o of q.options) if (o.id !== correct.id && same(o.value, v, tol)) fail(tag, `distractor ${o.id} equals the computed answer`);
}

console.log(`Lessons: ${LESSONS.length}   Questions: ${QUESTIONS.length}`);
for (const l of LESSONS) {
  const t = [1, 2, 3].map((d) => l.questions.filter((q) => q.difficulty === d).length);
  const nq = l.lecture.flatMap((s) => s.blocks).filter((b) => b.kind === 'quiz').length;
  const np = [...l.questions, ...l.extra].filter((q) => q.generate).length;
  console.log(`  ${l.id.padEnd(7)} ${l.title.padEnd(42)} ${l.lecture.length} sections · ${nq} checks · practice ${t.join('/')} · extra ${l.extra.length} · parametric ${np}`);
}
if (errors.length) {
  console.error(`\n${errors.length} problem(s):`);
  for (const e of errors) console.error('  ✗ ' + e);
  process.exit(1);
}
console.log(`\nAll ${QUESTIONS.length + quickChecks.length} answer keys confirmed (${QUESTIONS.length} questions + ${quickChecks.length} quick checks; ${recomputed} recomputed, ${CONCEPTUAL.size} conceptual).`);
const parametric = QUESTIONS.filter((q) => q.generate).length;
if (parametric) console.log(`${parametric} parametric questions: ${variantsChecked} generated variants checked (${SEEDS} seeds each).`);
