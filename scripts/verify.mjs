// Independent re-computation of the answer key, plus structural checks of every lesson.
// Run with:  npm run verify   (needs Node 22.18+ / 24, which can import .ts files directly)
//
// For every question the script (1) checks the structure and (2) recomputes the
// answer with plain numerical linear algebra, then compares it with the `value`
// of the option marked correct. Every lecture is checked for unbalanced $ and
// unknown diagrams.

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import katex from 'katex';
import { ALL_QUESTIONS as QUESTIONS, LESSONS } from '../src/data/questions.ts';
import { variantOf } from '../src/lib/variants.ts';
import { PREREQS } from '../src/data/prereqs.ts';
import { RENAMED_QUESTIONS, SPLIT_LESSONS } from '../src/data/renamed.ts';

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
/** r·e^{iθ} with θ in degrees, as [re, im]. */
const polarDeg = (rr, d) => [rr * Math.cos((d * Math.PI) / 180), rr * Math.sin((d * Math.PI) / 180)];
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
  'ml-06-7': ({ n }) => round(cpow([0, 1], n)),
  // A negative discriminant: the roots are re ± im·i (option d, "no solutions", has no value).
  'ml-06-8': ({ b, c }, q) => { const z = quadRoots(1, b, c); return Array.isArray(z) ? { id: 'none' } : pickByValue(q, [z.re, z.im]); },
  // The quadratic through z and its conjugate: z² − (z + z̄)z + z·z̄, as coefficients from the constant up.
  'ml-06-9': ({ p, q }) => { const prod = cmul([p, q], [p, -q]); return [prod[0], -(p + p), 1]; },
  'ml-06-x7': ({ a, b }) => cdiv([1, 0], [a, b]),
  'ml-07-q1': () => deg(Math.atan2(3, -3)),
  'ml-07-q2': () => round([Math.cos(Math.PI), Math.sin(Math.PI)]),
  'ml-07-q3': () => { const p = cpow(polarDeg(2, 30), 3); return [Math.round(cabs(p) * 1e9) / 1e9, Math.round(deg(Math.atan2(p[1], p[0])) * 1e9) / 1e9]; },
  'ml-07-1': ({ R, t }) => round(polarDeg(R, t)),
  'ml-07-2': ({ a, b }) => cmul([0, 1], [a, b]),
  'ml-07-3': ({ re, im }) => Math.round(deg(Math.atan2(im, re)) * 1e9) / 1e9,
  'ml-07-4': ({ R, t }) => round(polarDeg(R, t)),
  'ml-07-5': ({ z, n }) => round(cpow(z, n)),
  'ml-07-6': ({ m, k }) => {
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
  // Roots of z^n = w (w ≠ 0): a degree-n polynomial, counted by the fundamental theorem of algebra.
  'ml-07-x1': ({ n }) => n,
  // Exponential form [modulus, angle]: recompute from the product of the actual numbers.
  'ml-07-x2': ({ r1, r2, t1, t2 }) => { const p = cmul(polarDeg(r1, t1), polarDeg(r2, t2)); return [Math.round(cabs(p) * 1e9) / 1e9, Math.round(deg(Math.atan2(p[1], p[0])) * 1e9) / 1e9]; },
  'ml-07-x3': ({ r1, r2, t1, t2 }) => round(cmul(polarDeg(r1, t1), polarDeg(r2, t2))),
  // The angle n·t stays below 180°, so atan2 returns it directly.
  'ml-07-x4': ({ R, n, t }) => { const p = cpow(polarDeg(R, t), n); return [Math.round(cabs(p) * 1e9) / 1e9, Math.round(deg(Math.atan2(p[1], p[0])) * 1e9) / 1e9]; },
  'ml-07-x5': ({ re, im }) => Math.round(deg(Math.atan2(im, re)) * 1e9) / 1e9,
  // Neighbouring roots of unity: the angle between e^{2πi/n} and 1.
  'ml-07-x6': ({ n }) => { const w = polarDeg(1, 360 / n); return Math.round(deg(Math.atan2(w[1], w[0])) * 1e9) / 1e9; },
});

// la-08 · norms and orthogonality
const l1norm = (v) => v.reduce((s, x) => s + Math.abs(x), 0);
const isOrthogonal = (Q) => {
  const QtQ = mul(T(Q), Q);
  return QtQ.every((row, i) => row.every((x, j) => Math.abs(x - (i === j ? 1 : 0)) < EPS));
};
const rot = (t) => [[Math.cos(t), -Math.sin(t)], [Math.sin(t), Math.cos(t)]];
const sub2 = (u, v) => u.map((x, i) => x - v[i]);
Object.assign(checks, {
  'la-08-q1': () => l1norm([2, -3, 1]),
  'la-08-q2': () => {
    const q1 = [3 / 5, 4 / 5];
    const q2 = [-4 / 5, 3 / 5];
    return [dot([0, 5], q1), dot([0, 5], q2)];
  },
  'la-08-q3': () =>
    pickId({
      a: () => isOrthogonal(scale(1 / 5, [[3, -4], [4, 3]])),
      b: () => isOrthogonal([[3, -4], [4, 3]]),
      c: () => isOrthogonal([[1, 1], [0, 1]]),
      d: () => isOrthogonal(scale(1 / 2, [[1, 1], [1, 1]])),
    }),
  'la-08-1': ({ v }) => l1norm(v),
  'la-08-2': ({ v }) => v.map((x) => x / norm(v)),
  'la-08-3': ({ q1, c, v }) => {
    const Q = T([q1.map((x) => x / c), [-q1[1] / c, q1[0] / c]]);
    if (!isOrthogonal(Q)) throw new Error('basis is not orthonormal');
    return solve(Q, v);
  },
  'la-08-4': ({ M, c }) => flat(inv(scale(1 / c, M))),
  'la-08-5': ({ v1, v2 }) => sub2(v2, v1.map((x) => (x * dot(v2, v1)) / dot(v1, v1))),
  'la-08-6': ({ p, q, s }) => {
    // Concrete vectors with these lengths and dot product, moved by an arbitrary rotation.
    const th = Math.acos(s / (p * q));
    const Q = rot(0.83);
    return norm(sub2(mulVec(Q, [p, 0]), mulVec(Q, [q * Math.cos(th), q * Math.sin(th)])));
  },
  'la-08-x1': ({ v }) => Math.max(...v.map(Math.abs)),
  'la-08-x2': ({ v }) => l1norm(v),
  'la-08-x3': ({ v, c }) => {
    const unit = (u) => () => Math.abs(norm(u) - 1) < EPS;
    return pickId({ a: unit(v.map((x) => x / c)), b: unit(v.map((x) => x / l1norm(v))), c: unit([0.5, 0.5]), d: unit(v.map((x) => x / (c * c))) });
  },
  'la-08-x4': ({ x, reflect }) => norm(mulVec(reflect ? [[Math.cos(1.1), Math.sin(1.1)], [Math.sin(1.1), -Math.cos(1.1)]] : rot(2.3), x)),
  'la-08-x5': ({ u, v }) => solve([[dot(u, u)]], [dot(v, u)])[0],
  'la-08-x6': ({ q1, c, v }) => solve(T([q1.map((x) => x / c), [-q1[1] / c, q1[0] / c]]), v)[0],
});

// la-09 · projections and least squares
/** Least squares by the normal equations. */
const lstsq = (A, b) => solve(mul(T(A), A), mulVec(T(A), b));
const projMatrix = (A) => mul(mul(A, inv(mul(T(A), A))), T(A));
const col = (v) => v.map((x) => [x]);
const trace = (A) => A.reduce((s, row, i) => s + row[i], 0);
Object.assign(checks, {
  'la-09-q1': () => mulVec(projMatrix(col([1, 1])), [4, 2]),
  'la-09-q2': () => mulVec(projMatrix(col([1, 2])), [2, -1]),
  'la-09-q3': () => lstsq(col([1, 1, 1]), [2, 3, 7])[0],
  'la-09-1': ({ a, b }) => mulVec(projMatrix(col(a)), b),
  'la-09-2': ({ a }) => {
    // P is fixed by what it does to a basis: a stays, the perpendicular w goes to 0.
    const B = T([a, [-a[1], a[0]]]);
    return flat(mul(mul(B, [[1, 0], [0, 0]]), inv(B)));
  },
  'la-09-3': ({ t, y }) => lstsq(col(t), y)[0],
  'la-09-4': ({ A }) => trace(projMatrix(A)),
  'la-09-5': ({ t, y }) => lstsq(t.map((x) => [1, x]), y),
  'la-09-6': ({ u1, u2, b }) => mulVec(projMatrix(T([u1, u2])), b),
  'la-09-x1': ({ a, b }) => lstsq(col(a), b)[0],
  'la-09-x2': ({ a, b }) => sub2(b, mulVec(projMatrix(col(a)), b)),
  'la-09-x3': ({ a, b }) => mulVec(projMatrix(col(a)), b),
  'la-09-x4': ({ A }) => flat(mul(T(A), A)),
  'la-09-x5': ({ y }) => lstsq(col(y.map(() => 1)), y)[0],
  'la-09-x6': ({ t, y }) => lstsq(col(t), y)[0],
});

// la-10 · spectral decomposition
const quad = (A, x) => dot(x, mulVec(A, x));
const isEigvec = (A, v) => {
  const Av = mulVec(A, v);
  const k = dot(Av, v) / dot(v, v);
  return Av.every((x, i) => Math.abs(x - k * v[i]) < EPS);
};
const parallel = (u, v) => Math.abs(u[0] * v[1] - u[1] * v[0]) < EPS;
/** 0 positive definite, 1 positive semidefinite only, 2 negative definite, 3 indefinite (as CLASSES in 10-spectral.practice.ts). */
const definiteness = (ls) => {
  const pos = ls.filter((l) => l > EPS).length;
  const neg = ls.filter((l) => l < -EPS).length;
  if (pos && neg) return 3;
  if (neg === ls.length) return 2;
  if (pos === ls.length) return 0;
  if (!neg && pos) return 1;
  return -1;
};
const byClass = (cls, order) => pickId(Object.fromEntries(order.map((c, i) => ['abcd'[i], () => c === cls])));
/** QΛQᵀ from unit eigenvectors (columns of Q). */
const fromEigen = (qs, ls) => {
  const Q = T(qs.map((q) => q.map((x) => x / norm(q))));
  return mul(mul(Q, ls.map((l, i) => ls.map((_, j) => (i === j ? l : 0)))), T(Q));
};
const Q3 = scale(1 / 3, [[1, 2, 2], [2, 1, -2], [2, -2, 1]]);
Object.assign(checks, {
  'la-10-q1': () => {
    const A = [[5, 2], [2, 2]];
    const other = (v) => () => isEigvec(A, v) && !parallel(v, [2, 1]);
    return pickId({ a: other([-1, 2]), b: other([1, 2]), c: other([2, -1]) });
  },
  'la-10-q2': () => flat(fromEigen([[1, 1], [1, -1]], [4, 0])),
  'la-10-q3': () => {
    const cls = definiteness(eig2([[1, 2], [2, 1]]));
    return pickId({ a: () => cls === 3, b: () => cls === 0, c: () => cls === 0 });
  },
  'la-10-1': ({ A, x }) => quad(A, x),
  'la-10-2': (p) => pickId(Object.fromEntries(['a', 'b', 'c', 'd'].map((id) => [id, () => isEigvec(p.A, p[id]) && !parallel(p[id], p.v)]))),
  'la-10-3': ({ A, order }) => byClass(definiteness(eig2(A)), order),
  'la-10-4': ({ v, w, l1, l2 }) => flat(fromEigen([v, w], [l1, l2])),
  'la-10-5': ({ A, x, m }) => mulVec(pow(A, m), x),
  'la-10-6': ({ a, b }) => range(-60, 200).find((t) => definiteness(eig2([[a, b], [b, t]])) === 0),
  'la-10-x1': (p) => pickId(Object.fromEntries(['a', 'b', 'c', 'd'].map((id) => [id, () => flat(p[id]).every((x, i) => x === flat(T(p[id]))[i])]))),
  'la-10-x2': ({ A, x }) => quad(A, x),
  'la-10-x3': (p) => pickId(Object.fromEntries(['a', 'b', 'c', 'd'].map((id) => [id, () => Math.abs(dot(p[id], p.v)) < EPS && norm(p[id]) > EPS]))),
  'la-10-x4': ({ ls, order }) => byClass(definiteness(ls), order),
  'la-10-x5': ({ l1, l2 }) => flat(fromEigen([[1, 1], [1, -1]], [l1, l2])),
  'la-10-x6': ({ ls }) => {
    const A = mul(mul(Q3, ls.map((l, i) => ls.map((_, j) => (i === j ? l : 0)))), T(Q3));
    const D = mul(mul(T(Q3), mul(A, A)), Q3);
    return D.map((row, i) => row[i]).sort((p, q) => q - p);
  },
});

// la-11 · SVD and PCA
/** Eigenvalues of a symmetric matrix by the cyclic Jacobi method, in decreasing order. */
function symEig(S) {
  const n = S.length;
  const A = S.map((row) => [...row]);
  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += A[i][j] ** 2;
    if (off < 1e-24) break;
    for (let p = 0; p < n; p++)
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(A[p][q]) < 1e-300) continue;
        const theta = (A[q][q] - A[p][p]) / (2 * A[p][q]);
        const t = (theta >= 0 ? 1 : -1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1);
        const s = t * c;
        for (let k = 0; k < n; k++) {
          const [akp, akq] = [A[k][p], A[k][q]];
          A[k][p] = c * akp - s * akq;
          A[k][q] = s * akp + c * akq;
        }
        for (let k = 0; k < n; k++) {
          const [apk, aqk] = [A[p][k], A[q][k]];
          A[p][k] = c * apk - s * aqk;
          A[q][k] = s * apk + c * aqk;
        }
      }
  }
  return A.map((row, i) => row[i]).sort((x, y) => y - x);
}
/** Singular values: square roots of the eigenvalues of AᵀA, decreasing. */
const svals = (A) => symEig(mul(T(A), A)).map((l) => Math.sqrt(Math.max(0, l)));
const diagM = (d, rows = d.length, cols = d.length) => Array.from({ length: rows }, (_, i) => Array.from({ length: cols }, (_, j) => (i === j ? d[i] ?? 0 : 0)));
const frob = (A) => Math.sqrt(flat(A).reduce((s, x) => s + x * x, 0));
/** Sample covariance of two lists (each centred on its own mean here, so it also works on raw data). */
const sampleCov = (x, y) => {
  const mx = x.reduce((s, v) => s + v, 0) / x.length;
  const my = y.reduce((s, v) => s + v, 0) / y.length;
  return x.reduce((s, v, i) => s + (v - mx) * (y[i] - my), 0) / (x.length - 1);
};
const minus = (A, B) => A.map((row, i) => row.map((x, j) => x - B[i][j]));
Object.assign(checks, {
  'la-11-q1': () => svals([[2, 0], [0, -3]]),
  'la-11-q2': () => rank(diagM([7, 2, 0])),
  'la-11-q3': () => svals(minus(diagM([5, 3, 1]), diagM([5, 0, 0])))[0],
  'la-12-q1': () => sampleCov([3, -1, -2], [3, -1, -2]),
  'la-12-q2': () => {
    const ev = symEig(mul(mul(Q3, diagM([8, 1.5, 0.5])), T(Q3)));
    return (100 * ev[0]) / ev.reduce((s, x) => s + x, 0);
  },
  // PC1 of diag(100, 0.0001): which axis is the top eigenvector?
  'la-12-q3': () => {
    const C = diagM([100, 1e-4]);
    const top = symEig(C)[0];
    const pc1 = (v) => () => isEigvec(C, v) && Math.abs(dot(mulVec(C, v), v) / dot(v, v) - top) < EPS;
    return pickId({ a: pc1([1, 0]), b: pc1([0, 1]), c: pc1([1, 1]) });
  },
  'la-11-1': ({ A }) => svals(A),
  'la-12-2': ({ ls }) => {
    const ev = symEig(diagM(ls));
    return (100 * (ev[0] + ev[1])) / ev.reduce((s, x) => s + x, 0);
  },
  'la-11-3': ({ A }) => svals(A),
  'la-11-4': ({ s }) => {
    // A symmetric matrix with these eigenvalues; its best rank-1 approximation keeps the top eigen-direction.
    const A = mul(mul(Q3, diagM(s)), T(Q3));
    const q = T(Q3)[0];
    return frob(minus(A, scale(s[0], q.map((x) => q.map((y) => x * y)))));
  },
  'la-11-5': ({ A }) => svals(A),
  'la-12-6': ({ C }) => {
    const ev = symEig(C);
    return ev[0] / (ev[0] + ev[1]);
  },
  'la-11-x1': ({ A }) => svals(A),
  'la-11-x2': ({ m, n, s }) => rank(diagM(s, m, n)),
  'la-11-x3': ({ s }) => {
    const A = mul(mul(rot(0.4), diagM(s)), T(rot(1.3)));
    let best = 0;
    for (let i = 0; i < 20000; i++) best = Math.max(best, norm(mulVec(A, [Math.cos((i * Math.PI) / 10000), Math.sin((i * Math.PI) / 10000)])));
    return { v: best, tol: 1e-4 };
  },
  'la-11-x4': ({ M }) => symEig(M).map(Math.sqrt),
  'la-11-7': ({ s }) => frob(mul(mul(rot(0.7), diagM(s)), T(rot(0.2)))),
  'la-11-8': ({ A }) => svals(A),
  'la-11-x7': ({ s, k }) => svals(minus(diagM(s), diagM(s.map((x, i) => (i < k ? x : 0)))))[0],
  'la-11-x8': ({ A }) => svals(A).reduce((t, x) => t + x * x, 0),
  'la-12-1': ({ C }) => symEig(C).reduce((t, x) => t + x, 0),
  'la-12-3': ({ x, y }) => sampleCov(x, y),
  // The coordinate of x along the unit vector in the direction u.
  'la-12-4': ({ u, xs }) => dot(xs, u) / norm(u),
  'la-12-5': ({ ls }) => {
    const ev = symEig(diagM(ls));
    const tot = ev.reduce((t, x) => t + x, 0);
    let cum = 0;
    for (let k = 0; k < ev.length; k++) if ((cum += ev[k]) >= 0.9 * tot) return k + 1;
    return ev.length;
  },
  'la-12-x1': ({ ls }) => Math.sqrt(symEig(diagM(ls))[0]),
  'la-12-x4': ({ vs }) => { const m = vs.reduce((t, x) => t + x, 0) / vs.length; return vs.map((v) => v - m); },
  'la-12-x5': ({ x }) => sampleCov(x, x),
  // The eigenvalue of C other than l1.
  'la-12-x6': ({ A, l1 }) => { const ev = symEig(A); return Math.abs(ev[0] - l1) < 1e-9 ? ev[1] : ev[0]; },
  'la-12-x2': (p) => {
    const top = symEig(p.C)[0];
    const isPC1 = (v) => () => isEigvec(p.C, v) && Math.abs(dot(mulVec(p.C, v), v) / dot(v, v) - top) < EPS;
    return pickId({ a: isPC1(p.a), b: isPC1(p.b), c: isPC1(p.c), d: isPC1(p.d) });
  },
  'la-12-x3': ({ s }) => {
    // Centred data with orthogonal columns of these lengths, then its covariance matrix.
    const c1 = [1, -1, 0].map((x) => x / Math.sqrt(2));
    const c2 = [1, 1, -2].map((x) => x / Math.sqrt(6));
    const X = T([c1.map((x) => s[0] * x), c2.map((x) => s[1] * x)]);
    const ev = symEig(scale(1 / 2, mul(T(X), X)));
    return ev[0] / (ev[0] + ev[1]);
  },
});

// ---------- calculus: everything numerically, from the function itself ----------
/** Polynomial from ascending coefficients. */
const P = (cs) => (x) => cs.reduce((s, c, i) => s + c * x ** i, 0);
/** Two-sided limit: the average of f just left and right of a (both sides must agree). */
const limitAt = (f, a, h = 1e-6) => {
  const [l, r] = [f(a - h), f(a + h)];
  if (Math.abs(l - r) > 1e-3) throw new Error(`one-sided limits differ: ${l} vs ${r}`);
  return { v: (l + r) / 2, tol: 1e-4 };
};
const atInfinity = (f) => ({ v: f(1e7), tol: 1e-4 });
/** Derivative by a central difference with Richardson extrapolation. */
const D1 = (f, x) => {
  const d = (h) => (f(x + h) - f(x - h)) / (2 * h);
  return (4 * d(5e-4) - d(1e-3)) / 3;
};
/** n-th derivative by repeated central differences (Richardson-extrapolated); fine for n ≤ 4. */
const binom = (n, k) => (k < 0 || k > n ? 0 : k === 0 ? 1 : (binom(n - 1, k - 1) * n) / k);
const Dn = (f, x, n) => {
  if (n === 0) return f(x);
  const d = (h) => range(0, n).reduce((s, k) => s + (-1) ** k * binom(n, k) * f(x + (n / 2 - k) * h), 0) / h ** n;
  return (4 * d(0.01) - d(0.02)) / 3;
};
/** Simpson's rule. */
const integral = (f, a, b, n = 2000) => {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
  return (s * h) / 3;
};
const near = (v, tol = 1e-5) => ({ v, tol });
/** The option whose value is within tol of v (for questions where one option, such as "It diverges", has no value). */
const pickNear = (q, v, tol = 1e-6) => ({ id: q.options.find((o) => typeof o.value === 'number' && Math.abs(o.value - v) < tol)?.id ?? 'none' });

// ca-01 · limits and continuity
Object.assign(checks, {
  'ca-01-q1': () => limitAt((x) => (x * x - 4) / (x - 2), 2),
  'ca-01-q2': () => atInfinity((x) => (5 * x ** 3 - x) / (2 * x ** 3 + 7)),
  'ca-01-q3': () => {
    // The k for which the right piece at x = 2 equals the left limit.
    const left = limitAt((x) => x * x + 1, 2).v;
    return near((left + 1) / 2);
  },
  'ca-01-1': ({ cs, a }) => limitAt(P(cs), a),
  'ca-01-2': ({ num, den, a }) => limitAt((x) => P(num)(x) / P(den)(x), a),
  'ca-01-3': ({ num, den }) => atInfinity((x) => P(num)(x) / P(den)(x)),
  'ca-01-4': ({ k, m }) => limitAt((x) => Math.sin(k * x) / (m * x), 0),
  'ca-01-5': ({ a, c, d }) => near((a * (a - 1e-9) + c - d) / a, 1e-6),
  'ca-01-6': ({ a, k }) => limitAt((x) => (Math.sqrt(k * x + a * a) - a) / x, 0, 1e-5),
  'ca-01-x1': ({ cs, a }) => limitAt(P(cs), a),
  'ca-01-x2': ({ num, den }) => atInfinity((x) => P(num)(x) / P(den)(x)),
  'ca-01-x3': ({ num, den, a }) => limitAt((x) => P(num)(x) / P(den)(x), a),
  'ca-01-x4': ({ num, den, a }) => limitAt((x) => P(num)(x) / P(den)(x), a),
  'ca-01-x5': ({ k, m }) => limitAt((x) => Math.sin(k * x) / (m * x), 0),
  'ca-01-x6': ({ cs, a }) => limitAt(P(cs), a),
});

// ca-02 · the derivative
const sigmoid = (x) => 1 / (1 + Math.exp(-x));
/** Points where f' changes sign from − to + (local minima), scanning [lo, hi]. */
const localMinima = (f, lo = -10, hi = 10, step = 1e-3) => {
  const out = [];
  let prev = D1(f, lo);
  for (let x = lo + step; x <= hi; x += step) {
    const d = D1(f, x);
    if (prev < 0 && d >= 0) out.push(x);
    prev = d;
  }
  return out;
};
/** Coefficients (constant first) of the derivative of a polynomial. */
const polyD = (cs) => cs.slice(1).map((c, i) => c * (i + 1));
/** A zero of fn on [lo, hi], whichever way fn crosses it. */
const root = (fn, lo, hi) => (fn(lo) < 0 ? bisect(fn, lo, hi) : bisect((x) => -fn(x), lo, hi));
/** Does f' have the given sign exactly where pred holds? Scanned on [-8, 8], skipping points where f' ≈ 0. */
const slopeSignOn = (f, pred, sign) => () => {
  for (let x = -8; x <= 8; x += 0.01) {
    const d = D1(f, x);
    if (Math.abs(d) < 1e-3) continue;
    if ((Math.sign(d) === sign) !== pred(x)) return false;
  }
  return true;
};
/** Is f decreasing exactly on {x : dir·(x − bound) > 0}? Probed at a few points on each side. */
const decreasingOn = (f, [dir, bound]) => () =>
  [0.3, 1, 3].every((t) => D1(f, bound + dir * t) < 0 && D1(f, bound - dir * t) > 0);
Object.assign(checks, {
  'ca-02-q1': () => {
    const f = (x) => x * x;
    return (f(3) - f(1)) / (3 - 1);
  },
  'ca-02-q2': () => D1(P([7, -5, 0, 2]), 1),
  // f' = 2x − 6, so f = x² − 6x (+ any constant).
  'ca-02-q3': () => {
    const f = (x) => x * x - 6 * x;
    return pickId({ a: slopeSignOn(f, (x) => x > 3, 1), b: slopeSignOn(f, (x) => x < 3, 1), c: slopeSignOn(f, (x) => x > 6, 1) });
  },
  'ca-02-1': ({ cs, a }) => D1(P(cs), a),
  'ca-02-2': ({ cs, a }) => {
    const m = D1(P(cs), a);
    return [P(cs)(a) - m * a, m];
  },
  'ca-02-7': ({ a, b }) => D1((x) => a * Math.exp(x) + b * Math.log(x), 1),
  'ca-02-8': ({ p, q, t0 }) => D1((t) => p * t * t + q * t, t0),
  // The point of the curve where the slope equals the line's slope k.
  'ca-02-9': ({ b, c, k }) => {
    const f = P([c, b, 1]);
    const x = root((t) => D1(f, t) - k, -60, 60);
    return { v: [x, f(x)], tol: 1e-6 };
  },
  'ca-02-10': ({ cs, a }) => {
    const f = P(cs);
    return pickId({
      a: slopeSignOn(f, (x) => -a < x && x < a, -1),
      b: slopeSignOn(f, (x) => x < -a || x > a, -1),
      c: slopeSignOn(f, (x) => x < a, -1),
      d: slopeSignOn(f, (x) => 0 < x && x < a, -1),
    });
  },
  'ca-02b-q1': () => D1((x) => (2 * x + 1) ** 3, 0),
  'ca-02b-q2': () => D1((x) => x * Math.exp(x), 0),
  'ca-02b-q3': () => P(polyD(polyD([0, 0, 0, 0, 1])))(1),
  'ca-02b-1': ({ cs, x0 }) => P(polyD(polyD(cs)))(x0),
  'ca-02b-2': ({ c, k }) => D1((x) => c * Math.exp(k * x), 0),
  'ca-02b-3': ({ p, q, k }) => D1((x) => (p * x + q) * Math.exp(k * x), 0),
  'ca-02b-4': ({ p, q, n, a }) => D1((x) => (p * x + q) ** n, a),
  'ca-02b-5': ({ cs }) => {
    const mins = localMinima(P(cs));
    if (mins.length !== 1) throw new Error(`expected one local minimum, got ${mins.length}`);
    return { v: mins[0], tol: 2e-3 };
  },
  'ca-02b-6': ({ pn, pd }) => {
    const p = pn / pd;
    return D1(sigmoid, Math.log(p / (1 - p)));
  },
  'ca-02-x1': ({ cs, a }) => D1(P(cs), a),
  'ca-02-x2': ({ cs }) => [D1(P(cs), 0), D1(P(cs), 1) - D1(P(cs), 0)],
  'ca-02-x3': ({ cs, a, b }) => (P(cs)(b) - P(cs)(a)) / (b - a),
  'ca-02-x7': ({ a, b }) => D1((x) => a * Math.sin(x) + b * Math.cos(x), 0),
  // g is any function with g(1) = p and g'(1) = q; a line through (1, p) with slope q will do.
  'ca-02b-x1': ({ p, q }) => D1((x) => x ** 3 * (p + q * (x - 1)), 1),
  'ca-02b-x2': ({ p, q, a }) => D1((x) => Math.log(p * x + q), a),
  // [coefficient, exponent] of the second derivative of c·x^n.
  'ca-02b-x3': ({ c, n }) => {
    const cs = Array(n + 1).fill(0);
    cs[n] = c;
    const d = polyD(polyD(cs));
    const e = d.findIndex((v) => v !== 0);
    return [d[e], e];
  },
  // [+1 for a minimum / −1 for a maximum, where].
  'ca-02b-x4': ({ cs }) => {
    const f = P(cs);
    const x = root((t) => D1(f, t), -60, 60);
    return { v: [Math.sign(Dn(f, x, 2)), x], tol: 1e-6 };
  },
  'ca-02b-x5': ({ a, b }) => D1((x) => (x + a) / (x + b), 0),
  'ca-02b-x6': ({ n, a }) => D1((x) => (x * x + a) ** n, 1),
  'ca-02-x5': ({ cs, a }) => D1(P(cs), a),
  'ca-02-x6': (p) => pickId(Object.fromEntries(['a', 'b', 'c', 'd'].map((id) => [id, decreasingOn(P(p.cs), p[id])]))),
});

// ca-03 · Taylor's formula
/** Taylor coefficient f^(n)(a) / n!, from numerical derivatives (relative tolerance for higher orders). */
const taylorCoef = (f, a, n) => Dn(f, a, n) / factorial(n);
const rel = (v, r = 1e-3) => ({ v, tol: r * Math.max(1, Math.abs(v)) });
/** Value of the degree-n Taylor polynomial of f at 0, evaluated at h. */
const taylorAt = (f, n, h) => range(0, n).reduce((s, j) => s + taylorCoef(f, 0, j) * h ** j, 0);
Object.assign(checks, {
  'ca-03-q1': () => Math.exp(0) + D1(Math.exp, 0) * 0.1,
  'ca-03-q2': () => rel(taylorCoef(Math.exp, 0, 3)),
  'ca-03-q3': () => rel(taylorCoef((x) => Math.exp(3 * x), 0, 2)),
  'ca-03-1': ({ s, d }) => s + D1(Math.sqrt, s * s) * d,
  'ca-03-2': ({ k, n }) => rel(taylorCoef((x) => Math.exp(k * x), 0, n)),
  'ca-03-3': ({ k }) => ({ v: [0, 1, 2].map((j) => taylorCoef((x) => 1 / (1 - k * x), 0, j)), tol: 1e-3 }),
  'ca-03-4': ({ k }) => rel(taylorCoef((x) => Math.sin(k * x), 0, 3)),
  'ca-03-5': ({ k, h }) => near(taylorAt((x) => Math.exp(k * x), 2, h), 1e-6),
  'ca-03-6': ({ n, a }) => rel(taylorCoef((x) => x ** n, a, 2)),
  'ca-03-x1': ({ a, y0, m, h }) => y0 + D1((x) => y0 + m * (x - a) + 2 * (x - a) ** 2, a) * h,
  'ca-03-x2': ({ n }) => rel(taylorCoef(Math.exp, 0, n)),
  'ca-03-x3': ({ k }) => [Math.exp(0), D1((x) => Math.exp(k * x), 0)],
  'ca-03-x4': ({ k }) => rel(taylorCoef((x) => Math.cos(k * x), 0, 2)),
  'ca-03-x5': ({ n, a }) => D1((x) => x ** n, a),
  'ca-03-x6': ({ h }) => near(taylorAt((x) => Math.log(1 + x), 2, h), 1e-6),
});

// ca-04 · the integral
/** Is F an antiderivative of f? Compared at a few points. */
const isAntiderivative = (F, f) => () => [-1.3, -0.4, 0.7, 1.6].every((x) => Math.abs(D1(F, x) - f(x)) < 1e-6 * Math.max(1, Math.abs(f(x))));
Object.assign(checks, {
  'ca-04-q1': () => range(0, 3).reduce((s, i) => s + i * 1, 0),
  'ca-04-q2': () => {
    const f = (x) => 6 * x * x;
    return pickId({ a: isAntiderivative((x) => 2 * x ** 3, f), b: isAntiderivative((x) => 12 * x, f), c: isAntiderivative((x) => 6 * x ** 3, f) });
  },
  'ca-04-q3': () => integral(Math.sin, 0, Math.PI),
  'ca-04-1': ({ cs, a, b }) => integral(P(cs), a, b),
  'ca-04-2': (p) => {
    const f = (x) => p.k * x ** p.n;
    return pickId(Object.fromEntries(['a', 'b', 'c', 'd'].map((id) => [id, isAntiderivative(P(p[id]), f)])));
  },
  'ca-04-3': ({ cs, a, b }) => integral(P(cs), a, b),
  'ca-04-4': ({ cs, a, b }) => integral(P(cs), a, b),
  'ca-04-7': ({ a, b }) => near(integral((x) => Math.abs(x - a), 0, b, 20000), 1e-4),
  'ca-04-8': ({ p, q, t1, t2 }) => integral(P([q, p]), t1, t2),
  'ca-04b-q1': () => {
    const f = (x) => Math.cos(3 * x);
    return pickId({ a: isAntiderivative((x) => Math.sin(3 * x) / 3, f), b: isAntiderivative((x) => 3 * Math.sin(3 * x), f), c: isAntiderivative((x) => -Math.sin(3 * x) / 3, f) });
  },
  'ca-04b-q2': () => {
    const f = (x) => x * Math.cos(x);
    return pickId({
      a: isAntiderivative((x) => x * Math.sin(x) + Math.cos(x), f),
      b: isAntiderivative((x) => x * Math.sin(x) - Math.cos(x), f),
      c: isAntiderivative((x) => ((x * x) / 2) * Math.sin(x), f),
    });
  },
  // ∫_1^∞ x^(-3) dx = ∫_0^1 t dt after x = 1/t.
  'ca-04b-q3': (_, q) => pickNear(q, integral((t) => t, 0, 1)),
  'ca-04b-1': ({ k, fnId }) => {
    const [f, F] = fnId === 0 ? [Math.cos, Math.sin] : [Math.sin, (u) => -Math.cos(u)];
    const g = (x) => f(k * x);
    // Labels: a = F/k, b = k·F, c = −F/k, d = F (each evaluated at kx).
    return pickId({
      a: isAntiderivative((x) => F(k * x) / k, g),
      b: isAntiderivative((x) => k * F(k * x), g),
      c: isAntiderivative((x) => -F(k * x) / k, g),
      d: isAntiderivative((x) => F(k * x), g),
    });
  },
  'ca-04b-2': ({ k }, q) => pickNear(q, integral((x) => Math.exp(-k * x), 0, 40 / k)),
  'ca-04b-3': ({ k }) => {
    const f = (x) => x * Math.exp(k * x);
    const E = (x) => Math.exp(k * x);
    return pickId({
      a: isAntiderivative((x) => (x / k) * E(x) - E(x) / (k * k), f),
      b: isAntiderivative((x) => (x / k) * E(x), f),
      c: isAntiderivative((x) => ((x * x) / (2 * k)) * E(x), f),
      d: isAntiderivative((x) => (x / k) * E(x) + E(x) / (k * k), f),
    });
  },
  'ca-04b-4': ({ n, d }) => integral((x) => (n + 1) * x ** n, 0, 1 / d),
  'ca-04b-5': ({ c, m, n }) => integral((x) => 2 * x * (x * x + m) ** n, 0, c),
  'ca-04b-6': ({ n }) => integral((x) => x * (n + 1) * x ** n, 0, 1),
  'ca-04b-x1': ({ c, n }) => {
    const f = (x) => 2 * x * (x * x + c) ** n;
    const U = (x) => x * x + c;
    return pickId({
      a: isAntiderivative((x) => U(x) ** (n + 1) / (n + 1), f),
      b: isAntiderivative((x) => U(x) ** (n + 1), f),
      c: isAntiderivative((x) => (x * x * U(x) ** (n + 1)) / (n + 1), f),
      d: isAntiderivative((x) => 2 * n * x * U(x) ** (n - 1), f),
    });
  },
  // ∫_1^∞ x^(-p) dx = ∫_0^1 t^(p-2) dt after x = 1/t.
  'ca-04b-x2': ({ p }, q) => pickNear(q, integral((t) => t ** (p - 2), 0, 1)),
  'ca-04b-x3': ({ c }) => integral((x) => x * Math.exp(x), 0, c),
  'ca-04b-x4': ({ n }) => 1 / integral((x) => x ** n, 0, 1),
  'ca-04b-x5': ({ l, a }) => near(integral((x) => 2 * x * Math.exp(x * x), l, a, 20000), 1e-3),
  'ca-04b-x6': ({ lam, t }) => 1 - integral((x) => lam * Math.exp(-lam * x), 0, t),
  'ca-04-x1': ({ cs, a, b }) => integral(P(cs), a, b),
  'ca-04-x2': ({ k }) => {
    const f = (x) => Math.exp(k * x);
    return pickId({
      a: isAntiderivative((x) => Math.exp(k * x) / k, f),
      b: isAntiderivative((x) => k * Math.exp(k * x), f),
      c: isAntiderivative((x) => Math.exp(k * x), f),
      d: isAntiderivative((x) => Math.exp((k + 1) * x) / (k + 1), f),
    });
  },
  'ca-04-x3': ({ n }) => range(0, n - 1).reduce((s, i) => s + i * i * 1, 0),
  'ca-04-x4': ({ cs, a, b }) => integral(P(cs), a, b),
  'ca-04-x5': ({ c, a }) => D1((x) => integral((t) => t * t + c, 0, x), a),
  'ca-04-x6': ({ p, b }) => integral((x) => p * x, 0, b) / b,
});

// ca-05 · partial derivatives and the gradient
/** Numerical gradient of f(x₁, …, xₙ) at the point P. */
const grad = (f, P) => P.map((_, i) => D1((t) => f(...P.map((x, j) => (j === i ? t : x))), P[i]));
/** Numerical Hessian: differentiate the numerical gradient once more. */
const hessian = (f, P) => P.map((_, i) => grad((...Q) => grad(f, Q)[i], P));
const quad2 = ([a, b, c]) => (x, y) => a * x * x + b * x * y + c * y * y;
Object.assign(checks, {
  'ca-05-q1': () => grad((x, y) => 3 * x * x + x * y, [1, 2])[0],
  'ca-05-q2': () => norm(grad((x, y) => x * x + y * y, [3, 4])),
  'ca-05-q3': () => sub2([4, -2], grad((x, y) => x * x + y * y, [4, -2]).map((d) => 0.25 * d)),
  'ca-05-1': ({ k, P }) => grad(quad2(k), P)[0],
  'ca-05-2': ({ k: [a, b, c], P }) => grad((x, y) => a * x + b * y + c * x * y, P),
  'ca-05-3': ({ k: [a, c], P }) => norm(grad((x, y) => a * x * x + c * y * y, P)),
  'ca-05-4': ({ P, u }) => dot(grad((x, y) => x * x * y, P), u),
  'ca-05-5': ({ k: [a, b], P, eta }) => sub2(P, grad((x, y) => a * x * x + b * y * y, P).map((d) => eta * d)),
  'ca-05-6': ({ k: [a, b, c, d, e] }) => {
    // A quadratic is its own second-order Taylor polynomial: solve H x = -∇f(0).
    const f = (x, y) => a * x * x + b * x * y + c * y * y + d * x + e * y;
    return near(solve(hessian(f, [0, 0]), grad(f, [0, 0]).map((v) => -v)), 1e-4);
  },
  'ca-05-x1': ({ k: [a, b, c] }) => grad((x, y) => a * x + b * y + c, [0.3, -1.2]),
  'ca-05-x2': ({ P }) => grad((x, y) => x * x * y ** 3, P)[1],
  'ca-05-x3': ({ grad: gr }) => norm(gr),
  'ca-05-x4': ({ w, t, eta }) => w - eta * D1((v) => (v - t) ** 2, w),
  'ca-05-x5': ({ grad: gr }) => gr.map((x) => -x / norm(gr)),
  'ca-05-x6': ({ a, b }) => grad((x, y) => Math.exp(a * x + b * y), [0, 0])[0],
});

// ca-06 · the multivariable chain rule: differentiate the whole composition numerically
const logit = (p) => Math.log(p / (1 - p));
Object.assign(checks, {
  'ca-06-q1': () => D1((t) => t * t * (3 * t), 1),
  'ca-06-q2': () => D1((b) => (2 * 3 + b) ** 2, 1),
  'ca-06-q3': () => D1((w) => 0.5 * (w * 3 - 4) ** 2, 2),
  'ca-06-1': ({ a, b, c, t }) => D1((s) => a * s * (b * s + c), t),
  'ca-06-2': ({ x0, g0, g1, A, B }) => {
    // Concrete f and g with exactly these values: g linear, f quadratic with f'(g0) = A and f'(x0) = B.
    const g = (x) => g0 + g1 * (x - x0);
    const al = (A - B) / (2 * (g0 - x0));
    const be = A - 2 * al * g0;
    return D1((x) => al * g(x) ** 2 + be * g(x), x0);
  },
  'ca-06-3': ({ w, x, b }) => D1((v) => (v * x + b) ** 2, w),
  'ca-06-4': ({ s, t }) => D1((v) => (s + v) ** 2 * (s - v), t),
  'ca-06-5': ({ w1, w2, x, y }) => D1((v) => 0.5 * (w2 * Math.max(0, v * x) - y) ** 2, w1),
  'ca-06-6': ({ pn, pd, y, x }) => {
    const w = logit(pn / pd) / x;
    const L = (v) => {
      const p = sigmoid(v * x);
      return -(y * Math.log(p) + (1 - y) * Math.log(1 - p));
    };
    return D1(L, w);
  },
  'ca-06-x1': ({ A, B, a }) => D1((x) => A * (2 + B * (x - a)), a),
  'ca-06-x2': ({ a, b, t }) => D1((s) => a * s + (b * s) ** 2, t),
  'ca-06-x3': ({ p, y }) => D1((v) => (v - y) ** 2, p),
  'ca-06-x4': ({ a, b, x }) => D1((v) => (a * v + b) ** 2, x),
  'ca-06-x5': ({ k, c }) => D1((t) => Math.exp(t) * (c + k * t), 0),
  'ca-06-x6': ({ w, x, y }) => D1((v) => 0.5 * (v * x - y) ** 2, w),
});

// ca-07 · Jacobians and Hessians
/** Numerical Jacobian of F: ℝⁿ → ℝᵐ (F returns an array) at P. */
const jac = (F, P) => {
  const m = F(...P).length;
  return range(0, m - 1).map((i) => grad((...Q) => F(...Q)[i], P));
};
/** Second-derivative test from a numerical Hessian: 0 min, 1 max, 2 saddle, 3 inconclusive. */
const criticalKind = (f, P) => {
  const H = hessian(f, P);
  const d = H[0][0] * H[1][1] - H[0][1] * H[1][0];
  if (Math.abs(d) < 1e-5) return 3;
  return d < 0 ? 2 : H[0][0] > 0 ? 0 : 1;
};
const quadForm = (A) => (...x) => 0.5 * dot(x, mulVec(A, x));
Object.assign(checks, {
  'ca-07-q1': () => flat(jac((x, y) => [x + y, x * y], [2, 3])),
  'ca-07-q2': () => flat(hessian((x, y) => x * x + 3 * x * y + 2 * y * y, [0.4, -0.7])),
  'ca-07-q3': () => {
    const k = criticalKind((x, y) => x * x - 4 * x * y + y * y, [0, 0]);
    return pickId({ a: () => k === 2, b: () => k === 0, c: () => k === 1 });
  },
  'ca-07-1': ({ M }) => flat(jac((x, y) => mulVec(M, [x, y]), [0.3, 0.8])),
  'ca-07-2': ({ k }) => flat(hessian(quad2(k), [0.5, -0.3])),
  'ca-07-3': ({ P }) => flat(jac((x, y) => [x * x * y, x + y ** 3], P)),
  'ca-07-4': ({ k, order }) => byClass(criticalKind(quad2(k), [0, 0]), order),
  'ca-07-5': ({ A, b, x0 }) => {
    const f = (...x) => quadForm(A)(...x) - dot(b, x);
    const step = solve(hessian(f, x0), grad(f, x0));
    return near(sub2(x0, step), 1e-4);
  },
  'ca-07-6': ({ P }) => hessian((x, y) => x ** 3 * y * y, P)[0][1],
  'ca-07-x1': ({ a, b, c }) => flat(jac((x, y) => [a * x + b, c * y], [0.7, -0.2])),
  'ca-07-x2': ({ k }) => flat(hessian(quad2(k), [0.5, -0.3])),
  'ca-07-x3': ({ n, m }) => {
    const M = range(1, m).map((i) => range(1, n).map((j) => i + 2 * j));
    const J = jac((...x) => mulVec(M, x), Array(n).fill(0.5));
    return [J.length, J[0].length];
  },
  'ca-07-x4': ({ H, order }) => byClass(criticalKind(quadForm(H), [0, 0]), order),
  'ca-07-x5': ({ a, b, P }) => hessian((x, y) => a * x * x * y + b * x * y ** 3, P)[0][1],
  'ca-07-x6': ({ M }) => Math.abs(det(jac((x, y) => mulVec(M, [x, y]), [0.1, 0.2]))),
});

// ---------- probability: by enumerating sample spaces, or by integrating densities ----------
/** All tuples of length n over the given values (cartesian power). */
const tuples = (values, n) => (n === 0 ? [[]] : tuples(values, n - 1).flatMap((t) => values.map((v) => [...t, v])));
const DIE = [1, 2, 3, 4, 5, 6];
/** Probability of an event over equally likely outcomes. */
const prob = (outcomes, event) => outcomes.filter(event).length / outcomes.length;
const popcount = (m) => m.toString(2).split('1').length - 1;
const permutationsCount = (n) => {
  let count = 0;
  const go = (used, depth) => {
    if (depth === n) return void count++;
    for (let i = 0; i < n; i++) if (!(used & (1 << i))) go(used | (1 << i), depth + 1);
  };
  go(0, 0);
  return count;
};
const FACE_SETS = [[6], [1, 2], [1, 3, 5], [3, 4, 5, 6]];

// pr-01 · probability spaces
Object.assign(checks, {
  'pr-01-q1': () => prob(tuples(DIE, 2), ([a, b]) => a + b === 8),
  'pr-01-q2': () => {
    // 10 equally likely outcomes: A = {0..4}, B = {3..6}, so P(A) = 0.5, P(B) = 0.4, P(A ∩ B) = 0.2.
    const out = range(0, 9);
    return prob(out, (o) => o <= 4 || (o >= 3 && o <= 6));
  },
  'pr-01-q3': () => range(0, 31).filter((m) => popcount(m) === 2).length,
  'pr-01-1': ({ s }) => prob(tuples(DIE, 2), ([a, b]) => a + b === s),
  'pr-01-2': ({ a, b, c }) => prob(range(0, 19), (o) => o < a || (o >= a - c && o < a - c + b)),
  'pr-01-3': ({ n, k }) => prob(range(0, 2 ** n - 1), (m) => popcount(m) === k),
  'pr-01-4': ({ j, n }) => prob(tuples(DIE, n), (t) => t.some((x) => FACE_SETS[j].includes(x))),
  'pr-01-5': ({ rd, bl }) => {
    const balls = range(0, rd + bl - 1);
    const pairs = balls.flatMap((x) => balls.filter((y) => y !== x).map((y) => [x, y]));
    return prob(pairs, ([x, y]) => x < rd && y < rd);
  },
  'pr-01-6': ({ d, n }) => prob(tuples(range(1, d), n), (t) => new Set(t).size < n),
  'pr-01-x1': ({ k }) => prob(DIE, (x) => x >= k),
  'pr-01-x2': ({ rd, bl }) => prob(range(0, rd + bl - 1), (x) => x >= rd),
  'pr-01-x3': ({ n }) => permutationsCount(n),
  'pr-01-x4': ({ n, k }) => range(0, 2 ** n - 1).filter((m) => popcount(m) === k).length,
  'pr-01-x5': ({ q }) => prob(tuples(DIE, 2), (t) => t.some((x) => x <= q)),
  'pr-01-x6': ({ N, m }) => prob(range(1, N), (x) => x % m === 0),
});

// pr-02 · conditional probability and Bayes
/** P(A | B) over equally likely outcomes. */
const cond = (outcomes, A, B) => prob(outcomes.filter(B), A);
/** A population of individuals from a 2×2 table of counts [both, A only, B only, neither]: each is [inA, inB]. */
const people = ([n11, n10, n01, n00]) => [
  ...Array(n11).fill([1, 1]), ...Array(n10).fill([1, 0]), ...Array(n01).fill([0, 1]), ...Array(n00).fill([0, 0]),
];
/** Weighted outcomes [weight, ...data]: total probability of those satisfying the predicate. */
const wprob = (outcomes, pred) => outcomes.filter((o) => pred(o)).reduce((s, o) => s + o[0], 0) / outcomes.reduce((s, o) => s + o[0], 0);
/** Urn experiment: urn i chosen with probability prior[i], then a uniformly random ball; outcomes [w, urn, isRed]. */
const urnBalls = (rs, ns, prior) => rs.flatMap((r, i) => range(0, ns[i] - 1).map((b) => [prior[i] / ns[i], i, b < r]));
Object.assign(checks, {
  'pr-02-q1': () => cond(tuples(['H', 'T'], 2), (t) => t[0] === 'H' && t[1] === 'H', (t) => t.includes('H')),
  'pr-02-q2': () => {
    const items = [...range(1, 6000).map((i) => [1, i <= 120]), ...range(1, 4000).map((i) => [2, i <= 200])];
    return 100 * prob(items, (x) => x[1]);
  },
  'pr-02-q3': () => {
    const pop = [...range(1, 10).map((i) => ['D', i <= 9]), ...range(1, 990).map((i) => ['H', i <= 50])];
    return cond(pop, (x) => x[1], (x) => x[0] === 'D');
  },
  'pr-02-1': ({ n }) => cond(people(n), ([, passed]) => passed, ([studied]) => studied),
  'pr-02-2': ({ p, q }) => prob(range(1, 100), (i) => i <= 10 * p && i <= p * q),
  'pr-02-3': ({ w, d1, d2 }) => {
    const items = [...range(1, 100 * w).map((i) => i <= w * d1), ...range(1, 100 * (100 - w)).map((i) => i <= (100 - w) * d2)];
    return 100 * prob(items, (x) => x);
  },
  'pr-02-4': ({ p, s, f }) => {
    const pop = [...range(1, 100 * p).map((i) => [true, i <= p * s]), ...range(1, 10000 - 100 * p).map((i) => [false, i <= (100 - p) * f])];
    return cond(pop, ([sick]) => sick, ([, pos]) => pos);
  },
  'pr-02-5': ({ rs, ns }) => {
    const balls = urnBalls(rs, ns, [1 / 3, 1 / 3, 1 / 3]);
    return wprob(balls, (o) => o[1] === 0 && o[2]) / wprob(balls, (o) => o[2]);
  },
  'pr-02-6': ({ n, order }) => {
    const pop = people(n);
    const indep = Math.abs(prob(pop, ([a, b]) => a && b) - prob(pop, ([a]) => a) * prob(pop, ([, b]) => b)) < 1e-12;
    // Statements 0 and 1 are the two correct conclusions; 2 and 3 give wrong reasons and are never right.
    const truth = [indep, !indep, false, false];
    return pickId(Object.fromEntries(order.map((k, i) => ['abcd'[i], () => truth[k]])));
  },
  'pr-02-x1': ({ k }) => cond(DIE, (x) => x >= k, (x) => x % 2 === 0),
  'pr-02-x2': ({ p, q }) => {
    const N = 400;
    const isNew = (i) => i <= (N * p * 10) / 100;
    const buys = (i) => i <= (N * p * 10 * q * 10) / 10000;
    return 100 * prob(range(1, N), (i) => isNew(i) && buys(i));
  },
  'pr-02-x3': ({ q, c }) => cond(range(1, 100), (i) => i > c * q, (i) => i <= 10 * c),
  'pr-02-x4': ({ rs, ns }) => wprob(urnBalls(rs, ns, [0.5, 0.5]), (o) => o[2]),
  'pr-02-x5': ({ a, b }) => prob(tuples(range(0, 9), 2), ([x, y]) => x < a && y < b),
  'pr-02-x6': ({ m, n }) => {
    // Outcomes [weight, coin, side]: coins 0..m-1 are two-headed.
    const out = range(0, n - 1).flatMap((c) => [[1, c, c < m ? 'H' : 'H'], [1, c, c < m ? 'H' : 'T']]);
    return wprob(out, (o) => o[1] < m && o[2] === 'H') / wprob(out, (o) => o[2] === 'H');
  },
});

// pr-03 · random variables and distributions
const normalPdf = (m, s) => (x) => Math.exp(-((x - m) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI));
/** P(lo < X < hi) for X ~ N(m, s²), by Simpson's rule over the (clipped) interval. */
const normalProb = (m, s, lo, hi) => integral(normalPdf(m, s), Math.max(lo, m - 12 * s), Math.min(hi, m + 12 * s), 4000);
/** Poisson(λ) as the limit of Binomial(n, λ/n) with a large n. */
const poissonLimit = (lam, k, n = 1e6) => {
  let v = (1 - lam / n) ** (n - k);
  for (let i = 0; i < k; i++) v *= ((n - i) * (lam / n)) / (i + 1);
  return v;
};
/** Number of successes in n independent trials with success probability pn/pd, by enumeration. */
const trialsProb = (n, pn, pd, k) => prob(tuples(range(0, pd - 1), n), (t) => t.filter((x) => x < pn).length === k);
/** Uniform(a, b) by a fine grid of equally likely points. */
const uniformProb = (a, b, c, d) => prob(range(0, 99999).map((i) => a + ((i + 0.5) * (b - a)) / 1e5), (x) => x >= c && x <= d);
const pctNear = (v) => ({ v: 100 * v, tol: 1.2 });
/** P(sum of t independent Poisson(λ) counts = k), by adding over every split of k into t parts. */
const poissonSum = (lam, t, k) => {
  if (t === 1) return poissonLimit(lam, k);
  let s = 0;
  for (let j = 0; j <= k; j++) s += poissonLimit(lam, j) * poissonSum(lam, t - 1, k - j);
  return s;
};
Object.assign(checks, {
  'pr-03-q1': () => prob(tuples(['H', 'T'], 3), (t) => t.filter((x) => x === 'H').length >= 2),
  'pr-03-q2': () => trialsProb(4, 1, 2, 2),
  'pr-03-q3': () => rel(poissonLimit(3, 0), 1e-4),
  'pr-03b-q1': () => 1 / integral(() => 1, 0, 0.5),
  'pr-03b-q2': () => near(integral((x) => Math.exp(-x), 2, 60), 1e-6),
  'pr-03b-q3': () => pctNear(normalProb(100, 15, 85, 115)),
  'pr-03-1': ({ ps, k }) => prob(ps.flatMap((p, x) => Array(p).fill(x)), (x) => x <= k),
  'pr-03-2': ({ n, pn, pd, k }) => trialsProb(n, pn, pd, k),
  'pr-03-3': ({ lam, k }) => rel(poissonLimit(lam, k), 1e-4),
  // At least one correct among n guesses with d options each, by listing every answer sheet (option 0 is right).
  'pr-03-7': ({ n, d }) => prob(tuples(range(0, d - 1), n), (t) => t.some((x) => x === 0)),
  // The count over t minutes is a sum of t independent one-minute Poisson counts.
  'pr-03-8': ({ lam, t, k }) => rel(poissonSum(lam, t, k), 1e-4),
  'pr-03-9': ({ n }) => prob(tuples(['H', 'T'], n), (s) => s.filter((x) => x === 'H').length >= 2),
  'pr-03b-1': ({ a, b }) => 1 / integral(() => 1, a, b),
  // The density is F' = 2x; integrate it over the interval.
  'pr-03b-2': ({ a, b }) => near(integral((x) => D1((t) => t * t, x), a, b), 1e-6),
  'pr-03b-3': ({ m, t }) => near(integral((x) => Math.exp(-x / m) / m, 0, t), 1e-6),
  'pr-03b-4': ({ lam, t }) => integral((x) => lam * Math.exp(-lam * x), t, t + 60 / lam, 4000),
  'pr-03b-5': ({ m, s, lo, hi }) => pctNear(normalProb(m, s, m + lo * s, m + hi * s)),
  'pr-03b-6': ({ a, b, c, d }) => near(uniformProb(a, b, c, d), 1e-3),
  'pr-03-x1': ({ ps }) => prob(ps.flatMap((p, x) => Array(p).fill(x)), (x) => x === 3),
  'pr-03-x2': ({ n, pn, pd, k }) => trialsProb(n, pn, pd, k),
  'pr-03-x3': ({ k, n }) => prob(range(1, n), (x) => x <= k),
  'pr-03-x4': ({ lam, k }) => rel(poissonLimit(lam, k), 1e-4),
  'pr-03-x7': ({ n }) => prob(tuples(['H', 'T'], n), (s) => s.includes('H')),
  'pr-03-x8': ({ lam }) => rel(poissonLimit(lam, 0) + poissonLimit(lam, 1), 1e-4),
  'pr-03b-x1': ({ a, b, c }) => integral(() => 1 / (b - a), c, c),
  'pr-03b-x2': ({ mu, s, x }) => (x - mu) / s,
  'pr-03b-x3': ({ a, b, c, d }) => near(uniformProb(a, b, c, d), 1e-3),
  'pr-03b-x4': ({ m, s, lo, hi }) => pctNear(normalProb(m, s, m + lo * s, m + hi * s)),
  'pr-03b-x5': ({ m, s, lo, hi }) => pctNear(normalProb(m, s, m + lo * s, m + hi * s)),
  // Mean of the exponential density, in minutes.
  'pr-03b-x6': ({ lam }) => near(60 * integral((x) => x * lam * Math.exp(-lam * x), 0, 60 / lam, 4000), 1e-6),
});

// pr-04 · expectation and variance, from explicit distributions [value, probability]
const E = (dist, g = (x) => x) => dist.reduce((s, [x, p]) => s + g(x) * p, 0);
const Var = (dist) => E(dist, (x) => x * x) - E(dist) ** 2;
const mapDist = (dist, g) => dist.map(([x, p]) => [g(x), p]);
const pmfDist = (xs, ps) => xs.map((x, i) => [x, ps[i] / 10]);
const twoPoint = (m, d) => [[m - d, 0.5], [m + d, 0.5]];
/** Binomial(n, p) as [k, P(X = k)], computed in log space so that large n neither overflows nor underflows. */
const binomDist = (n, p) => {
  const logs = [0];
  for (let k = 1; k <= n; k++) logs.push(logs[k - 1] + Math.log((n - k + 1) / k) + Math.log(p / (1 - p)));
  const top = Math.max(...logs);
  const w = logs.map((l) => Math.exp(l - top));
  const total = w.reduce((s, x) => s + x, 0);
  return w.map((x, k) => [k, x / total]);
};
Object.assign(checks, {
  'pr-04-q1': () => E([[0, 0.5], [1, 0.3], [2, 0.2]]),
  'pr-04-q2': () => E(mapDist(twoPoint(4, 1), (x) => 3 * x - 2)),
  'pr-04-q3': () => Var(mapDist(twoPoint(0, 2), (x) => 3 * x + 2)),
  'pr-04-1': ({ xs, ps }) => E(pmfDist(xs, ps)),
  'pr-04-2': ({ m, a, b }) => E(mapDist(twoPoint(m, 1), (x) => a * x + b)),
  'pr-04-3': ({ xs, ps }) => Var(pmfDist(xs, ps)),
  'pr-04-4': ({ v, a, b }) => Var(mapDist(twoPoint(0, Math.sqrt(v)), (x) => a * x + b)),
  'pr-04-5': ({ n, p }) => Var(binomDist(n, p)),
  'pr-04-6': ({ a, b, sx, sy }) => {
    const joint = tuples([-1, 1], 2).map(([u, w]) => [a * u * sx - b * w * sy, 0.25]);
    return Var(joint);
  },
  'pr-04-x1': ({ n }) => E(range(1, n).map((x) => [x, 1 / n])),
  'pr-04-x2': ({ mx, my }) => E([[mx - 1 + my - 1, 0.5], [mx + 1 + my + 1, 0.5]]),
  'pr-04-x3': ({ p }) => Var([[0, 1 - p / 10], [1, p / 10]]),
  'pr-04-x4': ({ n, p }) => E(binomDist(n, p / 100)),
  'pr-04-x5': ({ m, s }) => Var(twoPoint(m, Math.sqrt(s - m * m))),
  'pr-04-x6': ({ a }) => E(twoPoint(0, a), (x) => x * x),
});

// pr-05 · joint distributions: explicit joint outcomes [x, y, probability]
const jointOf = (P, xs = [0, 1], ys = range(0, P[0].length - 1)) => P.flatMap((row, i) => row.map((p, j) => [xs[i], ys[j], p]));
const EJ = (J, g) => J.reduce((s, [x, y, p]) => s + g(x, y) * p, 0);
const CovJ = (J) => EJ(J, (x, y) => x * y) - EJ(J, (x) => x) * EJ(J, (_, y) => y);
const VarJ = (J, g) => EJ(J, (x, y) => g(x, y) ** 2) - EJ(J, g) ** 2;
const corrJ = (J) => CovJ(J) / Math.sqrt(VarJ(J, (x) => x) * VarJ(J, (_, y) => y));
/** A concrete pair with SDs sx, sy and correlation rho: X = sx·u, Y = sy(rho·u + √(1−rho²)·w), u, w = ±1 independent. */
const corrPair = (sx, sy, rho) =>
  tuples([-1, 1], 2).map(([u, w]) => [sx * u, sy * (rho * u + Math.sqrt(1 - rho * rho) * w), 0.25]);
/** Independent pair with given marginal distributions [value, probability]. */
const indepPair = (dx, dy) => dx.flatMap(([x, p]) => dy.map(([y, q]) => [x, y, p * q]));
Object.assign(checks, {
  'pr-05-q1': () => EJ(jointOf([[0.3, 0.2], [0.1, 0.4]]), (_, y) => (y === 1 ? 1 : 0)),
  'pr-05-q2': () => CovJ(jointOf([[0.3, 0.2], [0.1, 0.4]])),
  'pr-05-q3': () => VarJ(corrPair(2, 3, -3 / 6), (x, y) => x + y),
  'pr-05-1': ({ P, y }) => EJ(jointOf(P), (_, v) => (v === y ? 1 : 0)),
  'pr-05-2': ({ P }) => {
    const J = jointOf(P);
    return EJ(J, (x, y) => (x === 1 && y === 1 ? 1 : 0)) / EJ(J, (x) => (x === 1 ? 1 : 0));
  },
  'pr-05-3': ({ P }) => CovJ(jointOf(P)),
  'pr-05-4': ({ vx, vy, c }) => VarJ(corrPair(Math.sqrt(vx), Math.sqrt(vy), c / Math.sqrt(vx * vy)), (x, y) => x + y),
  'pr-05-5': ({ sx, sy, rho }) => corrJ(corrPair(sx, sy, rho)),
  'pr-05-6': ({ S, a }) => {
    const J = corrPair(Math.sqrt(S[0][0]), Math.sqrt(S[1][1]), S[0][1] / Math.sqrt(S[0][0] * S[1][1]));
    return VarJ(J, (x, y) => a[0] * x + a[1] * y);
  },
  'pr-05-x1': ({ P }) => EJ(jointOf(P), (x) => (x === 0 ? 1 : 0)),
  'pr-05-x2': ({ a, b }) => EJ(indepPair([[0, 1 - a / 10], [1, a / 10]], [[0, 1 - b / 10], [1, b / 10]]), (x, y) => x * y),
  'pr-05-x3': ({ a, b, c }) => CovJ(corrPair(2, 3, c / 6).map(([x, y, p]) => [a * x, b * y, p])),
  'pr-05-x4': ({ mx, my }) => EJ(indepPair(twoPoint(mx, 1), twoPoint(my, 2)), (x, y) => x * y),
  'pr-05-x5': ({ vx, vy }) => VarJ(indepPair(twoPoint(0, Math.sqrt(vx)), twoPoint(0, Math.sqrt(vy))), (x, y) => x - y),
  'pr-05-x6': ({ sx, sy, rho }) => corrJ(corrPair(sx, sy, rho)),
});

// pr-06 · LLN and CLT: exact distributions of sums of n i.i.d. two-point variables X = μ ± σ
/** Sum of n i.i.d. copies of μ ± σ: μn + σ(2K − n) with K ~ Binomial(n, ½). */
const sumIid = (mu, s, n) => mapDist(binomDist(n, 0.5), (k) => mu * n + s * (2 * k - n));
const meanIid = (mu, s, n) => mapDist(sumIid(mu, s, n), (x) => x / n);
const SD = (dist) => Math.sqrt(Var(dist));
Object.assign(checks, {
  'pr-06-q1': () => SD(meanIid(0, 10, 25)),
  'pr-06-q2': () => {
    const d = sumIid(2, 3, 100);
    return [E(d), SD(d)];
  },
  'pr-06-q3': () => {
    // σ from the first experiment, then the smallest n reaching the target error.
    const s = 0.4 * Math.sqrt(1000);
    let n = 1000;
    while (SD(meanIid(0, s, n)) > 0.2 + 1e-12) n += 1000;
    return n;
  },
  'pr-06-1': ({ s, n }) => SD(meanIid(0, s, n)),
  'pr-06-2': ({ s, n }) => SD(sumIid(0, s, n)),
  'pr-06-3': ({ s, e }) => {
    let n = 1;
    while (SD(meanIid(0, s, n)) > e + 1e-12) n++;
    return n;
  },
  'pr-06-4': ({ p, n }) => SD(mapDist(binomDist(n, p), (k) => k / n)),
  'pr-06-5': ({ m, s, n, lo, hi }) => {
    const se = SD(meanIid(0, s, n));
    return pctNear(normalProb(m, se, m + lo * se, m + hi * se));
  },
  'pr-06-6': ({ xb, s, n }) => {
    const se = SD(meanIid(0, s, n));
    return [xb - 2 * se, xb + 2 * se];
  },
  'pr-06-x1': ({ m, n }) => E(meanIid(m, 1, n)),
  'pr-06-x2': ({ s, n }) => Var(meanIid(0, s, n)),
  'pr-06-x3': ({ n }) => E(binomDist(n, 1 / 6)),
  'pr-06-x4': ({ k, se }) => SD(meanIid(0, 2 * se, 4 * k)),
  'pr-06-x5': ({ m, s, n, lo, hi }) => {
    const se = SD(meanIid(0, s, n));
    return pctNear(normalProb(m, se, m + lo * se, m + hi * se));
  },
  'pr-06-x6': ({ s, n }) => SD(sumIid(0, s, n)),
});

// st-01 · estimators: expectations over explicit sampling distributions
/** The empirical distribution of a data set: each value with probability 1/n. */
const empirical = (xs) => xs.map((x) => [x, 1 / xs.length]);
/** Sample variance s² as the variance of the empirical distribution, rescaled by n/(n−1). */
const sampleVar = (xs) => (Var(empirical(xs)) * xs.length) / (xs.length - 1);
/** E[(θ̂ − θ)²] over the distribution of θ̂. */
const mseOf = (dist, t) => E(dist, (x) => (x - t) ** 2);
Object.assign(checks, {
  'st-01-q1': () => E(empirical([2, 4, 9])),
  'st-01-q2': () => sampleVar([1, 3, 5]),
  'st-01-q3': () => mseOf(twoPoint(2, Math.sqrt(5)), 0),
  'st-01-1': ({ xs }) => E(empirical(xs)),
  'st-01-2': ({ xs }) => sampleVar(xs),
  'st-01-3': ({ m, n }) => E(mapDist(sumIid(m, 1, n), (s) => s / (n + 1))) - m,
  'st-01-4': ({ t, b, v }) => mseOf(twoPoint(t + b, Math.sqrt(v)), t),
  'st-01-5': ({ n, v }) => {
    // Every sample of n values ±√v (equally likely): the average of the divide-by-n variance.
    const samples = tuples([-Math.sqrt(v), Math.sqrt(v)], n);
    return samples.reduce((s, xs) => s + Var(empirical(xs)), 0) / samples.length;
  },
  'st-01-6': ({ c, m, s, n }) => mseOf(mapDist(meanIid(m, s, n), (x) => c * x), m),
  'st-01-x1': ({ xs }) => E(empirical(xs)),
  'st-01-x2': ({ k, m }) => EJ(indepPair(twoPoint(m, 1), twoPoint(m, 1)), (x, y) => (2 * x + y) / k) - m,
  'st-01-x3': ({ xs }) => sampleVar(xs),
  'st-01-x4': ({ b, v }) => mseOf(twoPoint(b, Math.sqrt(v)), 0),
  'st-01-x5': ({ n }) => Var(twoPoint(0, 1)) / Var(meanIid(0, 1, n)),
  'st-01-x6': ({ bA, vA, vB, aIsA }) => {
    const mA = mseOf(twoPoint(bA, Math.sqrt(vA)), 0);
    const mB = mseOf(twoPoint(0, Math.sqrt(vB)), 0);
    if (!!aIsA !== mA < mB) throw new Error('option a names the estimator with the larger MSE');
    return Math.min(mA, mB);
  },
});

// st-02 · maximum likelihood: the log-likelihood is maximised numerically (golden-section search)
const argmax = (f, lo, hi, iters = 200) => {
  const phi = (Math.sqrt(5) - 1) / 2;
  let [a, b] = [lo, hi];
  for (let i = 0; i < iters; i++) {
    const c = b - phi * (b - a);
    const d = a + phi * (b - a);
    if (f(c) > f(d)) b = d;
    else a = c;
  }
  return (a + b) / 2;
};
const mle = (logf, lo, hi) => {
  const v = argmax(logf, lo, hi);
  return near(v, 1e-5 * Math.max(1, Math.abs(v)));
};
const bernLL = (k, n) => (p) => k * Math.log(p) + (n - k) * Math.log(1 - p);
const poisLL = (xs) => (lam) => xs.reduce((s, x) => s + x * Math.log(lam) - lam, 0);
const expLL = (xs) => (lam) => xs.reduce((s, x) => s + Math.log(lam) - lam * x, 0);
const normLL = (xs, mu) => (v) => xs.reduce((s, x) => s - 0.5 * Math.log(v) - (x - mu) ** 2 / (2 * v), 0);
const sum = (xs) => xs.reduce((s, x) => s + x, 0);
Object.assign(checks, {
  'st-02-q1': () => [0.6, 0.4, 0.6].reduce((s, p) => s * p, 1),
  'st-02-q2': () => mle(bernLL(12, 40), 1e-9, 1 - 1e-9),
  'st-02-q3': () => mle(expLL([4]), 1e-9, 50),
  'st-02-1': ({ k, n }) => mle(bernLL(k, n), 1e-9, 1 - 1e-9),
  'st-02-2': ({ xs }) => mle(poisLL(xs), 1e-9, 50),
  'st-02-3': ({ xs }) => mle(expLL(xs), 1e-9, 50),
  'st-02-4': ({ xs }) => {
    const mu = argmax((m) => -sum(xs.map((x) => (x - m) ** 2)), -100, 100);
    return mle(normLL(xs, mu), 1e-6, 500);
  },
  'st-02-5': ({ xs }) => {
    // L(θ) = θ^(−n) when every x ≤ θ, else 0: scan a fine grid of θ.
    let best = [0, -Infinity];
    for (let t = 0.001; t <= 60; t += 0.001) {
      const L = xs.every((x) => x <= t + 1e-9) ? -xs.length * Math.log(t) : -Infinity;
      if (L > best[1]) best = [t, L];
    }
    return near(best[0], 2e-3);
  },
  'st-02-6': ({ ks, ns }) => mle((p) => ks.reduce((s, k, i) => s + bernLL(k, ns[i])(p), 0), 1e-9, 1 - 1e-9),
  'st-02-x1': ({ seq }) => mle((p) => seq.reduce((s, x) => s + Math.log(x ? p : 1 - p), 0), 1e-9, 1 - 1e-9),
  'st-02-x2': ({ xs }) => mle(poisLL(xs), 1e-9, 50),
  'st-02-x3': ({ xs }) => mle((mu) => -sum(xs.map((x) => (x - mu) ** 2)) / 8, -100, 100),
  'st-02-x4': ({ seq, p }) => seq.reduce((s, x) => s * (x ? p : 1 - p), 1),
  'st-02-x5': ({ m, n }) => mle(expLL(Array(n).fill(m)), 1e-9, 50),
  'st-02-x6': ({ n, k, cands }) => cands.reduce((best, p) => (bernLL(k, n)(p) > bernLL(k, n)(best) ? p : best), cands[1]),
});

// st-03 · confidence intervals: z from the normal CDF (Simpson integration and bisection)
/** The z with P(−z < Z < z) = level for Z ~ N(0, 1). */
const zFor = (level) => {
  let [lo, hi] = [0, 6];
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (normalProb(0, 1, -mid, mid) < level) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
};
const Z95 = zFor(0.95);
const ciOf = (c, se, level = 0.95) => near([c - zFor(level) * se, c + zFor(level) * se], 1e-3);
const propSE = (p, n) => SD(mapDist(binomDist(n, p), (k) => k / n));
Object.assign(checks, {
  'st-03-q1': () => ciOf(50, SD(meanIid(0, 20, 100))),
  'st-03-q2': () => E(binomDist(200, 0.05)),
  'st-03-q3': () => {
    const zs = 6 * Math.sqrt(50); // z·σ from the first study
    let n = 1;
    while (zs / Math.sqrt(n) > 3 + 1e-9) n++;
    return n;
  },
  'st-03-1': ({ xb, s, n }) => ciOf(xb, SD(meanIid(0, s, n))),
  'st-03-2': ({ L, se }) => near(zFor(L / 100) * se, 0.003 * se),
  'st-03-3': ({ s, e }) => {
    let n = 1;
    while ((1.96 * s) / Math.sqrt(n) > e + 1e-9) n++;
    return n;
  },
  'st-03-4': ({ k, n }) => ciOf(k / n, propSE(k / n, n)),
  'st-03-5': ({ w, k, L }) => near((w * zFor(L / 100)) / Z95 / Math.sqrt(k), 0.01),
  'st-03-6': ({ c, N }) => near(1 - binomDist(N, c)[N][1], 1e-3),
  'st-03-x1': ({ s, n }) => near(Z95 * SD(meanIid(0, s, n)), 1e-3),
  'st-03-x2': ({ a, b }) => [(a + b) / 2, (b - a) / 2],
  'st-03-x3': ({ L, N }) => E(binomDist(N, 1 - L / 100)),
  'st-03-x4': ({ w, k, n }) => near((w * SD(meanIid(0, 1, k * n))) / SD(meanIid(0, 1, n)), 1e-4),
  'st-03-x5': ({ p, n }) => near(Z95 * propSE(p, n), 1e-3),
  'st-03-x6': ({ L }) => near(zFor(L / 100), 0.002),
});

// st-04 · hypothesis tests: tail areas by integrating the normal density
const upperTail = (z) => normalProb(0, 1, z, Infinity);
const twoSided = (z) => 2 * upperTail(Math.abs(z));
/** "≈" answers read off the 68–95 rule: within 0.012 of the exact tail area. */
const ruleNear = (v) => ({ v, tol: 0.012 });
const anyRejection = (m, a) => 1 - binomDist(m, a)[0][1];
Object.assign(checks, {
  'st-04-q1': () => (106 - 100) / SD(meanIid(0, 15, 25)),
  'st-04-q2': () => ruleNear(twoSided(2)),
  'st-04-q3': () => E(binomDist(100, 0.05)),
  'st-04-1': ({ xb, m0, s, n }) => (xb - m0) / SD(meanIid(0, s, n)),
  'st-04-2': ({ p, alpha, rejectIsA }) => ({ id: (p <= alpha) === !!rejectIsA ? 'a' : 'b' }),
  'st-04-3': ({ z, two }) => ruleNear(two ? twoSided(z) : upperTail(z)),
  'st-04-4': ({ m, a }) => near(anyRejection(m, a), 1e-3),
  'st-04-5': ({ kA, kB, n }) => {
    const p = (kA + kB) / (2 * n);
    return near((kB / n - kA / n) / (propSE(p, n) * Math.SQRT2), 1e-6);
  },
  'st-04-6': ({ m0, s, n, mu }) => {
    const se = SD(meanIid(0, s, n));
    return pctNear(normalProb(mu, se, m0 + 2 * se, Infinity));
  },
  'st-04-x1': ({ xb, m0, s, n }) => (xb - m0) / SD(meanIid(0, s, n)),
  'st-04-x2': ({ m, a }) => E(binomDist(m, a)),
  'st-04-x3': ({ m, a }) => {
    // The largest per-test threshold t with m·t ≤ a (the union bound), found by bisection.
    let [lo, hi] = [0, 1];
    for (let i = 0; i < 80; i++) {
      const t = (lo + hi) / 2;
      if (m * t <= a) lo = t;
      else hi = t;
    }
    return lo;
  },
  'st-04-x4': ({ h0True, rejected, order }) => {
    const kind = h0True ? (rejected ? 0 : 3) : rejected ? 2 : 1;
    return { id: 'abcd'[order.indexOf(kind)] };
  },
  'st-04-x5': ({ q }) => {
    // Recover |z| from the two-sided p-value, then take one tail.
    const z = zFor(1 - q);
    return near(upperTail(z), 1e-6);
  },
  'st-04-x6': ({ ps }) => ps.filter((p) => p <= 0.05 / ps.length).length,
});

// st-05 · linear regression: least squares by the normal equations of the design matrix
const fitLine = (xs, ys) => lstsq(xs.map((x) => [1, x]), ys);
const r2Of = (xs, ys) => {
  const [b0, b1] = fitLine(xs, ys);
  const m = sum(ys) / ys.length;
  return 1 - sum(xs.map((x, i) => (ys[i] - b0 - b1 * x) ** 2)) / sum(ys.map((y) => (y - m) ** 2));
};
/** R² of the least-squares line for a joint distribution: 1 − Var(residual)/Var(y). */
const r2J = (J) => {
  const slope = CovJ(J) / VarJ(J, (x) => x);
  return 1 - VarJ(J, (x, y) => y - slope * x) / VarJ(J, (_, y) => y);
};
const slopeJ = (J) => CovJ(J) / VarJ(J, (x) => x);
Object.assign(checks, {
  'st-05-q1': () => 9 - mulVec([[1, 3]], [1, 2])[0],
  'st-05-q2': () => fitLine([0, 1, 2, 3], [1, 3, 2, 6])[1],
  'st-05-q3': () => r2J(corrPair(1, 1, 0.8)),
  'st-05-1': ({ b0, b1, x }) => dot([1, x], [b0, b1]),
  'st-05-2': ({ b0, b1, x, y }) => y - dot([1, x], [b0, b1]),
  'st-05-3': ({ xs, ys }) => fitLine(xs, ys)[1],
  'st-05-4': ({ rho, sx, sy }) => near(slopeJ(corrPair(sx, sy, rho)), 1e-4),
  'st-05-5': ({ xs, ys }) => r2Of(xs, ys),
  'st-05-6': ({ A, t }) => solve(A, t),
  'st-05-x1': ({ b0, b1, x }) => dot([1, x], [b0, b1]),
  'st-05-x2': ({ b0, b1, x, y }) => y - dot([1, x], [b0, b1]),
  'st-05-x3': ({ rho }) => r2J(corrPair(1, 1, rho)),
  'st-05-x4': ({ mx, my, b1 }) => fitLine([mx - 1, mx + 1], [my - b1, my + b1])[0],
  'st-05-x5': ({ c, vx, vy }) => slopeJ(corrPair(Math.sqrt(vx), Math.sqrt(vy), c / Math.sqrt(vx * vy))),
  'st-05-x6': ({ tot, res }) => 1 - res / tot,
});

// op-01 · convexity: the midpoint inequality tested on a grid of point pairs
const gridOf = (lo, hi, step) => Array.from({ length: Math.round((hi - lo) / step) + 1 }, (_, i) => lo + i * step);
const GRID1 = gridOf(-4, 4, 0.25);
/** Midpoint convexity of a function of one variable on [lo, hi]. */
const isConvex1 = (f, xs = GRID1) => xs.every((x) => xs.every((y) => f((x + y) / 2) <= (f(x) + f(y)) / 2 + 1e-9 * (1 + Math.abs(f(x)) + Math.abs(f(y)))));
/** Midpoint convexity of a function of two variables on a coarse grid. */
const GRID2 = gridOf(-3, 3, 1).flatMap((x) => gridOf(-3, 3, 1).map((y) => [x, y]));
const isConvex2 = (f) => GRID2.every(([a, b]) => GRID2.every(([c, d]) => f((a + c) / 2, (b + d) / 2) <= (f(a, b) + f(c, d)) / 2 + 1e-9));
/** A set is convex on the sample grid if the midpoint of any two members is a member. */
const isConvexSet = (member, pts) => {
  const inside = pts.filter((p) => member(...p));
  return inside.every((p) => inside.every((q) => member(...p.map((x, i) => (x + q[i]) / 2))));
};
const FN = [
  (p, q) => (x) => Math.exp(p * x) + q * x * x,
  (p, q) => (x) => p * x * x + q * x,
  (p, q) => (x) => Math.abs(x - p) + q * x * x,
  (p) => (x) => Math.sqrt(x * x + p),
  (p, q) => (x) => Math.max(p * x, q * x),
  (p, q) => (x) => -p * x * x + q * x,
  (p) => (x) => x ** 3 + p * x,
  (p) => (x) => x ** 4 - p * x * x,
  (p) => (x) => Math.sin(x) + p * x,
  (p) => (x) => p * x * x - Math.abs(x),
];
const SETS = [
  (p, q) => (x) => x >= p && x <= q,
  (p, q) => (x) => Math.abs(x - p) <= q,
  (p, q) => (x, y) => x + p * y <= q,
  (p) => (x, y) => x * x + y * y <= p * p,
  (p, q) => (x) => Math.abs(x - p) >= q,
  (p, q) => (x, y) => x * x + y * y >= p * p && x * x + y * y <= q * q,
  (p) => (x) => (x >= p && x <= p + 1) || (x >= p + 3 && x <= p + 4),
  (p) => (x, y) => Math.abs(x) + Math.abs(y) >= p,
];
const PTS1 = gridOf(-8, 8, 0.25).map((x) => [x, 0]);
const PTS2 = gridOf(-6, 6, 1).flatMap((x) => gridOf(-6, 6, 1).map((y) => [x, y]));
const pickBy = (n, test) => pickId(Object.fromEntries(Array.from({ length: n }, (_, i) => ['abcd'[i], () => test(i)])));
/** Shape code of a function: 0 convex, 1 concave, 2 neither, 3 both. */
const shapeOf = (isC, f, neg) => {
  const cv = isC(f);
  const cc = isC(neg);
  return cv && cc ? 3 : cv ? 0 : cc ? 1 : 2;
};
Object.assign(checks, {
  'op-01-q1': () => pickBy(3, (i) => isConvexSet([(x) => Math.abs(x - 1) <= 3, (x) => Math.abs(x) >= 2, (x) => (x >= 0 && x <= 1) || (x >= 2 && x <= 3)][i], PTS1)),
  'op-01-q2': () => pickBy(3, (i) => isConvex1((x) => x ** 3, gridOf(...[[0, 6], [-6, 0], [-6, 6]][i], 0.25))),
  'op-01-q3': () => {
    const f = (x) => x * x;
    return (f(0) + f(4)) / 2 - f(2);
  },
  'op-01-1': ({ a, c, u, v }) => {
    const f = (x) => a * x * x + c;
    return (f(u) + f(v)) / 2 - f((u + v) / 2);
  },
  'op-01-2': ({ p, b }) => {
    const ks = gridOf(-20, 20, 0.5).filter((k) => isConvex1((x) => (k - p) * x * x + b * x));
    return Math.max(...ks) >= 20 ? [1, Math.min(...ks)] : [-1, Math.max(...ks)];
  },
  'op-01-3': ({ fns }) => pickBy(4, (i) => isConvex1(FN[fns[i][0]](fns[i][1], fns[i][2]))),
  'op-01-4': ({ a, c }) => {
    const bs = gridOf(-200, 200, 0.5).filter((b) => eig2([[2 * a, b], [b, 2 * c]])[0] >= -1e-9);
    return [Math.min(...bs), Math.max(...bs)];
  },
  'op-01-5': ({ x1, x0, x2, A, B }) => {
    // The line through both points is itself convex and meets the data, so the chord value is attained.
    const [c0, c1] = solve([[1, x1], [1, x2]], [A, B]);
    return c0 + c1 * x0;
  },
  'op-01-6': ({ a1, b1, a2, b2 }) => {
    const f = (x) => Math.max(a1 * x + b1, a2 * x + b2);
    return near(f(argmax((x) => -f(x), -100, 100)), 1e-6);
  },
  'op-01-x1': ({ a, b, c, order }) => {
    const f = (x) => a * x * x + b * x + c;
    return { id: 'abcd'[order.indexOf(shapeOf(isConvex1, f, (x) => -f(x)))] };
  },
  'op-01-x2': ({ u, v }) => (u * u + v * v) / 2,
  'op-01-x3': ({ sets }) => pickBy(4, (i) => {
    const [t, p, q] = sets[i];
    return isConvexSet(SETS[t](p, q), [2, 3, 5, 7].includes(t) ? PTS2 : PTS1);
  }),
  'op-01-x4': ({ x0, A, s, y }) => Math.min(...gridOf(0, 5, 0.5).map((k) => A + s * (y - x0) + k * (y - x0) ** 2)),
  'op-01-x5': ({ a, c, order }) => {
    const f = (x, y) => a * x * x + c * y * y;
    return { id: 'abcd'[order.indexOf(shapeOf(isConvex2, f, (x, y) => -f(x, y)))] };
  },
  'op-01-x6': ({ al, be, order }) => {
    const pairs = [[(x) => x, (x) => x * x], [(x) => x * x, (x) => (x - 2) ** 2], [Math.exp, (x) => Math.exp(-x)], [Math.abs, (x) => x * x]];
    const combos = [
      (f, g) => (x) => al * f(x) + be * g(x),
      (f, g) => (x) => Math.max(f(x), g(x)),
      (f, g) => (x) => al * f(x) - be * g(x),
      (f, g) => (x) => Math.min(f(x), g(x)),
      (f, g) => (x) => f(x) * g(x),
      (f) => (x) => -al * f(x),
    ];
    return pickBy(4, (i) => pairs.every(([f, g]) => isConvex1(combos[order[i]](f, g))));
  },
});

// op-02 · gradient descent: simulate the iteration with numerical gradients
/** Runs k gradient steps on f from x0 (a vector) with step eta. */
const gd = (f, x0, eta, k) => {
  let x = [...x0];
  for (let i = 0; i < k; i++) {
    const gr = grad(f, x);
    x = x.map((xi, j) => xi - eta * gr[j]);
  }
  return x;
};
/** Largest step for which gradient descent on f (from a fixed start) still shrinks towards the minimum, by bisection. */
// From every coordinate direction separately, so that a slowly diverging direction cannot hide behind a fast-converging one.
const starts = (x0) => (x0.length === 1 ? [x0] : x0.map((_, i) => x0.map((x, j) => (i === j ? x : 0))));
const maxStableEta = (f, x0, xstar) => {
  const dist = (x) => Math.hypot(...x.map((xi, i) => xi - xstar[i]));
  let [lo, hi] = [0, 10];
  for (let i = 0; i < 50; i++) {
    const eta = (lo + hi) / 2;
    if (starts(x0).every((s) => dist(gd(f, s, eta, 60)) < dist(s))) lo = eta;
    else hi = eta;
  }
  return lo;
};
const near6 = (v) => near(v, 1e-5);
Object.assign(checks, {
  'op-02-q1': () => near6(gd((x) => x * x, [3], 0.1, 1)[0]),
  "op-02-q2": () => near(maxStableEta((x) => 5 * x * x, [1], [0]), 1e-6),
  'op-02-q3': () => near(maxStableEta((x, y) => 0.5 * (x * x + 50 * y * y), [1, 1], [0, 0]), 1e-6),
  'op-02-1': ({ a, b, x0, eta }) => near6(gd((x) => a * x * x + b * x, [x0], eta, 1)[0]),
  'op-02-2': ({ a, b, p, q, eta }) => near6(gd((x, y) => a * x * x + b * y * y, [p, q], eta, 1)),
  'op-02-3': ({ c, b }) => near(maxStableEta((x) => c * x * x + b * x, [1 - b / (2 * c)], [-b / (2 * c)]), 1e-6),
  'op-02-4': ({ c, eta, x0 }) => near6(gd((x) => c * x * x, [x0], eta, 3)[0]),
  'op-02-5': ({ l1, l2 }) => {
    const f = (x, y) => 0.5 * (l1 * x * x + l2 * y * y);
    const eta = 2 / (l1 + l2);
    return near6(Math.max(Math.abs(gd(f, [1, 0], eta, 1)[0]), Math.abs(gd(f, [0, 1], eta, 1)[1])));
  },
  'op-02-6': ({ xs, ys, w0, eta }) => near6(gd((w) => sum(xs.map((x, i) => (w * x - ys[i]) ** 2)), [w0], eta, 1)[0]),
  'op-02-x1': ({ x0, eta }) => near6(gd((x) => x * x, [x0], eta, 1)[0]),
  'op-02-x2': ({ a, b, p, q }) => near6(grad((x, y) => a * x * x + b * y * y, [p, q])),
  'op-02-x3': ({ c, eta, order }) => {
    const xs = [1];
    for (let i = 0; i < 10; i++) xs.push(gd((x) => c * x * x, [xs[i]], eta, 1)[0]);
    const flips = xs.slice(1).some((x, i) => Math.sign(x) !== Math.sign(xs[i]));
    const kind = Math.abs(xs[10]) > 1 ? 2 : Math.abs(xs[10] - 1) < 1e-9 ? 3 : flips ? 1 : 0;
    return { id: 'abcd'[order.indexOf(kind)] };
  },
  'op-02-x4': ({ l1, l2 }) => near(maxStableEta((x, y) => 0.5 * (l1 * x * x + l2 * y * y), [1, 1], [0, 0]), 1e-6),
  'op-02-x5': ({ a, b }) => {
    const ls = symEig(hessian((x, y) => a * x * x + b * y * y, [0.3, -0.2])).map(Math.abs);
    return near(Math.max(...ls) / Math.min(...ls), 1e-4);
  },
  'op-02-x6': ({ c, eta, x0 }) => {
    let x = [x0];
    let n = 0;
    while (Math.abs(x[0]) >= 1 - 1e-12) {
      x = gd((t) => c * t * t, x, eta, 1);
      n++;
    }
    return n;
  },
});

// op-03 · SGD and momentum: count batches, simulate the heavy-ball iteration and moving averages
const batchesPerEpoch = (n, B) => {
  let steps = 0;
  for (let i = 0; i < n; i += B) steps++;
  return steps;
};
/** k steps of v ← βv + ∇f(x), x ← x − ηv. */
const heavyBall = (f, x0, eta, beta, k, v0 = x0.map(() => 0)) => {
  let [x, v] = [[...x0], [...v0]];
  for (let i = 0; i < k; i++) {
    const gr = grad(f, x);
    v = v.map((vi, j) => beta * vi + gr[j]);
    x = x.map((xi, j) => xi - eta * v[j]);
  }
  return x;
};
/** Length of the step after a long run on a slope with constant gradient gr. */
const terminalStep = (gr, eta, beta) => {
  const a = heavyBall((x) => gr * x, [0], eta, beta, 3000)[0];
  const b = heavyBall((x) => gr * x, [0], eta, beta, 3001)[0];
  return Math.abs(b - a);
};
const ema = (gs, beta) => gs.reduce((m, g) => beta * m + (1 - beta) * g, 0);
Object.assign(checks, {
  'op-03-q1': () => batchesPerEpoch(50000, 100),
  'op-03-q2': () => SD(meanIid(0, 1, 100)) / SD(meanIid(0, 1, 25)),
  'op-03-q3': () => near6(terminalStep(1, 1, 0.9)),
  'op-03-1': ({ n, B }) => batchesPerEpoch(n, B),
  'op-03-2': ({ gs }) => E(empirical(gs)),
  'op-03-3': ({ c, eta, beta, x0 }) => near6(heavyBall((x) => c * x * x, [x0], eta, beta, 2)[0]),
  'op-03-4': ({ gr, eta, beta }) => near6(terminalStep(gr, eta, beta)),
  'op-03-5': ({ sigma, s }) => {
    let B = 1;
    while (SD(meanIid(0, sigma, B)) > s + 1e-12) B++;
    return B;
  },
  'op-03-6': ({ beta, g1, g2 }) => near6(ema([g1, g2], beta) / ema([1, 1], beta)),
  'op-03-x1': ({ n, B }) => batchesPerEpoch(n, B),
  'op-03-x2': ({ w0, gs, eta }) => near6(w0 - eta * E(empirical(gs))),
  'op-03-x3': ({ beta }) => near6(terminalStep(1, 1, beta)),
  'op-03-x4': ({ x0, v0, gr, eta, beta }) => near6(heavyBall((x) => gr * x, [x0], eta, beta, 1, [v0])[0]),
  'op-03-x5': ({ s, B }) => SD(meanIid(0, s, B)),
  'op-03-x6': ({ beta, g1 }) => near6(ema([g1], beta)),
});

// op-04 · Lagrange multipliers: optimise numerically along the constraint
/** Minimiser of f on the line p·x + q·y = c, by golden-section search along the line. */
const minOnLine = (f, p, q, c) => {
  const base = Math.abs(p) >= Math.abs(q) ? [c / p, 0] : [0, c / q];
  const pt = (s) => [base[0] - q * s, base[1] + p * s];
  return pt(argmax((s) => -f(...pt(s)), -200, 200));
};
/** Maximum of f on the circle of radius R, by a fine scan of angles refined with golden-section search. */
const maxOnCircle = (f, R = 1) => {
  const h = (t) => f(R * Math.cos(t), R * Math.sin(t));
  let best = 0;
  for (let i = 0; i < 3600; i++) if (h((i * Math.PI) / 1800) > h(best)) best = (i * Math.PI) / 1800;
  const t = argmax(h, best - 0.01, best + 0.01);
  return { value: h(t), at: [R * Math.cos(t), R * Math.sin(t)] };
};
const fStar = (c) => {
  const [x, y] = minOnLine((x, y) => x * x + y * y, 1, 1, c);
  return x * x + y * y;
};
/** dF/dc by a central difference of the numerically computed optimum. */
const shadowPrice = (F, c, h = 1e-3) => (F(c + h) - F(c - h)) / (2 * h);
const argmaxValue = (f, lo, hi) => f(argmax(f, lo, hi));
const unitSign = (v) => (v.find((x) => Math.abs(x) > 1e-6) < 0 ? v.map((x) => -x) : v);
Object.assign(checks, {
  'op-04-q1': () => near(minOnLine((x, y) => x * x + y * y, 1, 1, 2), 1e-5),
  'op-04-q2': () => near(argmaxValue((x) => x * (8 - x), -100, 100), 1e-6),
  'op-04-q3': () => near(shadowPrice(fStar, 3) * 0.2, 1e-4),
  'op-04-1': ({ p, q, c }) => near(minOnLine((x, y) => x * x + y * y, p, q, c), 1e-5),
  'op-04-2': ({ s }) => near(argmaxValue((x) => x * (s - x), -100, 100), 1e-6),
  'op-04-3': ({ p, q, c }) => {
    const F = (cc) => {
      const [x, y] = minOnLine((x, y) => x * x + y * y, p, q, cc);
      return x * x + y * y;
    };
    return near(shadowPrice(F, c), 1e-4);
  },
  'op-04-4': ({ a, b, c }) => near(minOnLine((x, y) => a * x * x + b * y * y, 1, 1, c), 1e-5),
  'op-04-5': ({ c0, d }) => near(fStar(c0) + shadowPrice(fStar, c0) * d, 1e-4),
  'op-04-6': ({ A }) => near(maxOnCircle((x, y) => dot([x, y], mulVec(A, [x, y]))).value, 1e-6),
  'op-04-x1': ({ c }) => near(minOnLine((x, y) => x * x + y * y, 1, 1, c), 1e-5),
  'op-04-x2': ({ a, b, l }) => dot([l * a, l * b], [a, b]) / dot([a, b], [a, b]),
  'op-04-x3': ({ a, b, s }) => near(argmaxValue((x) => (x * (s - a * x)) / b, 0, s / a), 1e-6),
  'op-04-x4': ({ n, m }) => [...range(1, n), ...range(1, m)].length,
  'op-04-x5': ({ a, b, R }) => near(maxOnCircle((x, y) => a * x + b * y, R).value, 1e-6),
  'op-04-x6': ({ d1, d2 }) => near(unitSign(maxOnCircle((x, y) => d1 * x * x + d2 * y * y).at), 1e-4),
});

// op-05 · optimality conditions: numerical minimisation, Hessian tests and projected gradient descent
/** Minimiser of f over an interval, by golden-section search. */
const argminOn = (f, lo, hi) => argmax((x) => -f(x), lo, hi);
/** Projected gradient descent onto the box x ≥ 0 (componentwise). */
const projectedGD = (f, x0, eta, k) => {
  let x = [...x0];
  for (let i = 0; i < k; i++) x = gd(f, x, eta, 1).map((t) => Math.max(0, t));
  return x;
};
/** Optimal value of min (x − a)² over x ≤ b (up) or x ≥ b, numerically. */
const clampOpt = (a, b, up) => {
  const f = (x) => (x - a) ** 2;
  const x = up ? argminOn(f, b - 100, b) : argminOn(f, b, b + 100);
  return { x, f: f(x) };
};
Object.assign(checks, {
  'op-05-q1': () => near(argminOn((x) => x ** 3 - 3 * x, 0, 3), 1e-6),
  'op-05-q2': () => near(gd((x, y) => 0.5 * (2 * x * x + 4 * y * y) - 4 * x - 8 * y, [0, 0], 0.2, 400), 1e-6),
  'op-05-q3': () => near(clampOpt(2, 5, true).x, 1e-6),
  'op-05-1': ({ a, b, c }) => near(argminOn((x) => a * x * x + b * x + c, -100, 100), 1e-6),
  'op-05-2': ({ a, b, c, order }) => ({ id: 'abcd'[order.indexOf(criticalKind((x, y) => a * x * x + b * x * y + c * y * y, [0, 0]))] }),
  'op-05-3': ({ A, b }) => {
    const f = (x, y) => 0.5 * dot([x, y], mulVec(A, [x, y])) - dot(b, [x, y]);
    return near(gd(f, [0, 0], 1 / (A[0][0] + A[1][1]), 4000), 1e-5);
  },
  'op-05-4': ({ a, b, up }) => near(clampOpt(a, b, !!up).x, 1e-6),
  'op-05-5': ({ a, b }) => near(-shadowPrice((bb) => clampOpt(a, bb, true).f, b), 1e-4),
  'op-05-6': ({ a, b }) => near(projectedGD((x, y) => (x - a) ** 2 + (y - b) ** 2, [1, 1], 0.25, 200), 1e-6),
  'op-05-x1': ({ a, p }) => near(argminOn((x) => a * x * x - 2 * a * p * x, -100, 100), 1e-6),
  'op-05-x2': ({ k }) => intRoots((x) => D1((t) => t ** 3 - 3 * k * k * t, x)),
  'op-05-x3': ({ x0, v, order }) => {
    // f(x) = v/2·(x − x0)²: compare f at x0 with its neighbours.
    const f = (x) => (v / 2) * (x - x0) ** 2;
    const [l, m, rr] = [f(x0 - 0.01), f(x0), f(x0 + 0.01)];
    const kind = l > m && rr > m ? 0 : l < m && rr < m ? 1 : 2;
    return { id: 'abcd'[order.indexOf(kind)] };
  },
  'op-05-x4': ({ a, b, p, q }) => near(gd((x, y) => a * x * x + b * y * y - p * x - q * y, [0, 0], 1 / (2 * Math.max(a, b)), 400), 1e-6),
  'op-05-x5': ({ a, b, order }) => {
    const { x } = clampOpt(a, b, false);
    const active = Math.abs(x - b) < 1e-6 && Math.abs(x - a) > 1e-6;
    const mu = shadowPrice((bb) => clampOpt(a, bb, false).f, b);
    const kind = active ? (mu > 1e-6 ? 0 : 2) : mu > 1e-6 ? 3 : 1;
    return { id: 'abcd'[order.indexOf(kind)] };
  },
  'op-05-x6': ({ a, b }) => near(-shadowPrice((bb) => clampOpt(a, bb, true).f, b) + 0, 1e-4),
});

// pg · programming: Python questions are checked by running their code with python3 (see the end of this file)
/** Runs the question's own code snippet. */
const runSnippet = (_, q) => ({ py: q.codeSnippet });
const py = (code) => () => ({ py: code });
const PY_IDS = (lesson) => [1, 2, 3, 4, 5, 6].flatMap((i) => [`${lesson}-${i}`, `${lesson}-x${i}`]);
Object.assign(checks, {
  'pg-01-q1': py('print(type(6 / 3))'),
  'pg-01-q2': py('print(17 // 5, 17 % 5)'),
  'pg-01-q3': py('s = "python"\nprint(s[1:4])'),
  ...Object.fromEntries(PY_IDS('pg-01').map((id) => [id, runSnippet])),
  'pg-02-q1': py('def f(x):\n    x * 2\n\nprint(f(3))'),
  'pg-02-q2': py('total = 0\nfor i in range(1, 5):\n    total += i\nprint(total)'),
  'pg-02-q3': py('n = 20\nk = 0\nwhile n > 1:\n    n = n // 2\n    k += 1\nprint(k)'),
  ...Object.fromEntries(PY_IDS('pg-02').map((id) => [id, runSnippet])),
  'pg-03-q1': py('xs = [4, 7, 1]\nxs.append(6)\nprint(xs[-1] + len(xs))'),
  'pg-03-q2': py('a = [1, 2]\nb = a\nb.append(3)\nprint(a)'),
  'pg-03-q3': py('print(len(set("banana")))'),
  ...Object.fromEntries(PY_IDS('pg-03').map((id) => [id, runSnippet])),
});

// pg-04 · NumPy: numpy is not available to the checker, so its semantics are re-implemented here
// (element-wise arithmetic, reductions along an axis, broadcasting) together with its print format.
/** How NumPy prints a 1-D integer array: entries right-aligned to a common width. */
const npFmt = (xs) => {
  const s = xs.map(String);
  const w = Math.max(...s.map((t) => t.length));
  return `[${s.map((t) => t.padStart(w)).join(' ')}]`;
};
/** How NumPy prints a 1-D float array of whole numbers: "1." entries, right-aligned. */
const npFmtWhole = (xs) => npFmt(xs.map((x) => `${Math.round(x)}.`));
const tup = (sh) => (sh.length === 1 ? `(${sh[0]},)` : `(${sh.join(', ')})`);
const pyFloatStr = (x) => (Number.isInteger(x) ? x.toFixed(1) : String(x));
const reshapeShape = (n, dims) => {
  const known = dims.filter((d) => d !== -1).reduce((a, b) => a * b, 1);
  return dims.map((d) => (d === -1 ? n / known : d));
};
const sumAxis = (A, axis) => (axis === 0 ? A[0].map((_, j) => sum(A.map((row) => row[j]))) : A.map(sum));
const argmax1 = (xs) => xs.reduce((b, x, i) => (x > xs[b] ? i : b), 0);
/** NumPy broadcasting: pad with leading 1s, then each pair of sizes must agree or contain a 1. */
const bcast = (s, t) => {
  const n = Math.max(s.length, t.length);
  const a = Array(n - s.length).fill(1).concat(s);
  const b = Array(n - t.length).fill(1).concat(t);
  if (a.some((x, i) => x !== b[i] && x !== 1 && b[i] !== 1)) return null;
  return a.map((x, i) => Math.max(x, b[i]));
};
const arangeJs = (a, b, s = 1) => range(0, Math.ceil((b - a) / s) - 1).map((i) => a + i * s);
const o = (v) => ({ out: String(v) });
Object.assign(checks, {
  'pg-04-q1': () => o(npFmt([1, 2, 3].map((x) => 2 * x))),
  'pg-04-q2': () => o(tup(reshapeShape(12, [3, -1]))),
  'pg-04-q3': () => o(tup([4, 5].filter((_, i) => i !== 0))),
  'pg-04-1': ({ xs, k, c }) => o(npFmt(xs.map((x) => x * k + c))),
  'pg-04-2': ({ rr, c }) => o(tup(reshapeShape(rr * c, [rr, -1]))),
  'pg-04-3': ({ A }) => o(npFmt(sumAxis(A, 0))),
  'pg-04-4': ({ s, t }) => {
    const b = bcast(s, t);
    return o(b ? tup(b) : 'ValueError');
  },
  'pg-04-5': ({ xs, t }) => o(npFmt(xs.filter((x) => x > t))),
  'pg-04-6': ({ A }) => o(npFmt(A.map(argmax1))),
  'pg-04-x1': ({ a, b }) => o(`${tup([a, b])} ${a * b}`),
  'pg-04-x2': ({ xs }) => o(pyFloatStr(sum(xs) / xs.length)),
  'pg-04-x3': ({ a, b, s }) => o(npFmt(arangeJs(a, b, s))),
  'pg-04-x4': ({ dims, k }) => o(tup(dims.filter((_, i) => i !== k))),
  'pg-04-x5': ({ xs, t }) => o(xs.filter((x) => x > t).length),
  'pg-04-x6': runSnippet,
});

// pg-05 · linear algebra in NumPy: shapes of @ products and the same numbers computed with plain arrays
/** Shape of s @ t following NumPy's rules for 1-D and 2-D operands, or null on a mismatch. */
const matmulShape = (s, t) => {
  const inner = [s[s.length - 1], t[0]];
  if (inner[0] !== inner[1]) return null;
  return [...s.slice(0, -1), ...t.slice(1)];
};
Object.assign(checks, {
  'pg-05-q1': () => o(npFmt(mulVec([[1, 2], [3, 4]], [2, 1]))),
  'pg-05-q2': () => o(tup(matmulShape([3, 2], [2, 5]))),
  'pg-05-q3': () => o(pyFloatStr(norm([6, 8]))),
  'pg-05-1': ({ A, v }) => o(npFmt(mulVec(A, v))),
  'pg-05-2': ({ m, n, p }) => o(tup(matmulShape([m, n], [n, p]))),
  'pg-05-3': ({ A, B, i, j }) => o(`${mul(A, B)[i][j]} ${A[i][j] * B[i][j]}`),
  'pg-05-4': ({ v }) => o(pyFloatStr(norm(v))),
  'pg-05-5': ({ A, b }) => o(npFmtWhole(solve(A, b))),
  'pg-05-6': ({ m, n }) => {
    const X = [m, n];
    const y = [m];
    const shapes = [matmulShape([n, m], y), matmulShape(X, y), matmulShape([n, m], X), matmulShape(y, [n, m])];
    return pickBy(4, (i) => shapes[i] !== null && shapes[i].length === 1 && shapes[i][0] === n);
  },
  'pg-05-x1': ({ A }) => o(`${tup([A[0].length, A.length])} ${npFmt(T(A)[0])}`),
  'pg-05-x2': ({ u, v }) => o(`${dot(u, v)} ${npFmt(u.map((x, i) => x * v[i]))}`),
  'pg-05-x3': ({ A }) => o(trace(A)),
  'pg-05-x4': ({ m, n }) => o(tup(matmulShape([n, m], [m, n]))),
  'pg-05-x5': ({ A }) => o(Math.round(det(A))),
  'pg-05-x6': ({ X }) => o(npFmtWhole(T(X).map((col) => sum(col) / col.length))),
});

// pg-06 · simulation: the exact probabilities and expectations the simulations estimate
// (rng.integers(a, b) draws a..b-1; random.randint is checked by running Python)
const randintCount = (a, b) => ({ py: `import random\nrandom.seed(3)\nprint(len({random.randint(${a}, ${b}) for _ in range(20000)}))` });
Object.assign(checks, {
  'pg-06-q1': () => randintCount(1, 6),
  'pg-06-q2': () => prob(arangeJs(1, 7), (x) => x >= 5),
  'pg-06-q3': () => SD(mapDist(binomDist(10000, 0.5), (k) => k / 10000)),
  'pg-06-1': ({ k, m }) => prob(arangeJs(1, k + 1), (x) => x <= m),
  'pg-06-2': ({ a, b }) => randintCount(a, b),
  'pg-06-3': ({ p, n }) => near(SD(mapDist(binomDist(n, p), (k) => k / n)), 1e-4),
  'pg-06-4': ({ s }) => prob(tuples(arangeJs(1, 7), 2), (t) => t[0] + t[1] === s),
  'pg-06-5': ({ e }) => Math.ceil(Var(twoPoint(0, 0.5)) / (e * e) - 1e-9),
  'pg-06-6': ({ n }) => SD(sumIid(0, 1, n)),
  'pg-06-x1': ({ a, b }) => arangeJs(a, b).length,
  'pg-06-x2': ({ t }) => near(uniformProb(0, 1, 0, t), 1e-3),
  'pg-06-x3': runSnippet,
  'pg-06-x4': ({ n, k }) => {
    // Standard error of a mean of N draws: √(Var / N), with the variance of one 0/1 draw at p = 0.3.
    const se = (N) => Math.sqrt(Var([[0, 0.7], [1, 0.3]]) / N);
    let N = n;
    while (se(N) > se(n) / k + 1e-15) N += n;
    return N;
  },
  'pg-06-x5': ({ n }) => prob(tuples(arangeJs(0, n), n), (t) => !t.includes(0)),
  'pg-06-x6': ({ k }) => E(arangeJs(1, k + 1).map((x) => [x, 1 / k])),
});

// ---------- School Maths Toolkit: plain arithmetic, evaluated numerically ----------
/** Coefficients [c0, c1, …] of a polynomial of degree ≤ deg, recovered from its values at x0, x0 + 1, … (exact interpolation). */
function coeffsFrom(f, deg, x0 = 0) {
  const xs = Array.from({ length: deg + 1 }, (_, i) => x0 + i);
  const V = xs.map((x) => xs.map((_, j) => x ** j));
  return solve(V, xs.map(f)).map((c) => Math.round(c * 1e9) / 1e9);
}
Object.assign(checks, {
  'sm-01-q1': () => 1 / 2 + 1 / 3,
  'sm-01-q2': () => 2 ** 3 * 2 ** 4,
  'sm-01-q3': () => 8 ** (2 / 3),
  'sm-01-1': ({ a, b, c, d }) => a / b + c / d,
  'sm-01-2': ({ m, n, k }) => Math.log2((2 ** m * 2 ** n) / 2 ** k),
  'sm-01-3': ({ a, b, c, d }) => a / b / (c / d),
  'sm-01-4': ({ b, p, q, s }) => b ** ((s * p) / q),
  'sm-01-5': ({ m, n }) => Math.sqrt(m) + Math.sqrt(n),
  // (kx² − ka²)/(x − a) is a polynomial of degree 1: sample it away from x = a.
  'sm-01-6': ({ k, a }) => coeffsFrom((x) => (k * x * x - k * a * a) / (x - a), 1, a + 1),
  'sm-01-x1': ({ a, b, c, d }) => (a / b) * (c / d),
  'sm-01-x2': ({ a, n }) => a ** -n,
  'sm-01-x3': ({ m, n }) => Math.log2((2 ** m) ** n),
  'sm-01-x4': ({ a, k }) => Math.sqrt(a * a * k),
  'sm-01-x5': ({ a }) => coeffsFrom((x) => (x + a) ** 2, 2),
  'sm-01-x6': ({ m, n }) => m * m - n * n,
});

/** Roots of ax² + bx + c: real ones sorted, or the complex pair as { re, im } with im > 0. */
function quadRoots(a, b, c) {
  const D = b * b - 4 * a * c;
  if (D < 0) return { re: -b / (2 * a), im: Math.sqrt(-D) / (2 * Math.abs(a)) };
  const s = Math.sqrt(D);
  return [(-b - s) / (2 * a), (-b + s) / (2 * a)].sort((p, q) => p - q);
}
/** Where a·f is smallest on a fine grid (step 1/840 hits every fraction with denominator ≤ 8). */
function argBest(f, sign = 1, lo = -30, hi = 30) {
  let best = lo;
  for (let i = 0; i <= (hi - lo) * 840; i++) {
    const x = lo + i / 840;
    if (sign * f(x) < sign * f(best) - 1e-12) best = x;
  }
  return best;
}
const pickByValue = (q, v) => ({ id: q.options.find((o) => o.value !== undefined && same(o.value, v, 1e-9))?.id ?? 'none' });
Object.assign(checks, {
  'sm-02-q1': () => quadRoots(1, -7, 12),
  'sm-02-q2': () => new Set(quadRoots(1, 4, 4)).size,
  'sm-02-q3': () => { const f = (x) => x * x - 6 * x + 1; return f(argBest(f)); },
  'sm-02-1': ({ b, c }) => quadRoots(1, b, c),
  'sm-02-2': ({ a, b, c }) => b * b - 4 * a * c,
  'sm-02-3': ({ a, b, c }) => quadRoots(a, b, c),
  'sm-02-4': ({ b, c }) => { const f = (x) => x * x + b * x + c; return f(argBest(f)); },
  'sm-02-5': ({ b, c }, q) => { const z = quadRoots(1, b, c); return Array.isArray(z) ? { id: 'none' } : pickByValue(q, [z.re, z.im]); },
  'sm-02-6': ({ s, p }) => { const z = quadRoots(1, -s, p); return Array.isArray(z) ? z[0] ** 2 + z[1] ** 2 : 2 * (z.re ** 2 - z.im ** 2); },
  'sm-02-x1': ({ a, b }) => quadRoots(1, a + b, a * b),
  'sm-02-x2': ({ b, c }) => { const z = quadRoots(1, b, c); return Array.isArray(z) ? new Set(z).size : 0; },
  'sm-02-x3': ({ k }) => quadRoots(1, 0, -k),
  // The bracket numbers are the roots with the opposite sign.
  'sm-02-x4': ({ p, q }) => quadRoots(1, p + q, p * q).map((x) => -x).sort((u, v) => u - v),
  'sm-02-x5': ({ a, b, c }) => { const z = quadRoots(a, b, c); return Array.isArray(z) ? z[0] * z[1] : z.re ** 2 + z.im ** 2; },
  'sm-02-x6': ({ a, b, c }) => argBest((x) => a * x * x + b * x + c, Math.sign(a)),
});

/** Solutions of ax + by = e, cx + dy = f: 1 (unique), 0 (none) or -1 (infinitely many), by elimination. */
function systemCount(a, b, c, d, e, f) {
  if (Math.abs(rank([[a, b], [c, d]])) === 2) return 1;
  return rank([[a, b, e], [c, d, f]]) > rank([[a, b], [c, d]]) ? 0 : -1;
}
/** Solves kx + m > n by testing points: [direction, bound] with direction −1 for "x < bound". */
function solveIneq(k, m, n) {
  const t = (n - m) / k;
  return [k * (t - 1) + m > n ? -1 : 1, t];
}
Object.assign(checks, {
  'sm-03-q1': () => solve([[5]], [18 - 3])[0],
  'sm-03-q2': () => (9 - 1) / (4 - 2),
  'sm-03-q3': () => systemCount(1, 2, 2, 4, 3, 7),
  'sm-03-1': ({ a, b, c, d }) => solve([[a - c]], [d - b])[0],
  'sm-03-2': ({ x1, y1, x2, y2 }) => (y2 - y1) / (x2 - x1),
  'sm-03-3': ({ x1, y1, x2, y2 }) => solve([[x1, 1], [x2, 1]], [y1, y2]),
  'sm-03-4': ({ A, e, f }) => solve(A, [e, f]),
  'sm-03-5': ({ k, m, n }) => solveIneq(k, m, n),
  'sm-03-6': ({ A, C, n, T }) => solve([[1, 1], [A, C]], [n, T])[0],
  'sm-03-x1': ({ a, b, c }) => solve([[a]], [c - b])[0],
  'sm-03-x2': ({ m, c }) => solve([[m]], [-c])[0],
  // Two points of ax + by = c, then the slope between them.
  'sm-03-x3': ({ a, b, c }) => { const y = (x) => (c - a * x) / b; return (y(1) - y(0)) / 1; },
  'sm-03-x4': ({ s, d }) => solve([[1, 1], [1, -1]], [s, d]),
  'sm-03-x5': ({ p, q }) => -1 / (p / q),
  'sm-03-x6': ({ k, m, n }) => solveIneq(k, m, n),
});

/** Solves g(x) = 0 for increasing g by bisection on [lo, hi]. */
function bisect(fn, lo, hi) {
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (fn(mid) < 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
Object.assign(checks, {
  'sm-04-q1': () => Math.exp(0),
  'sm-04-q2': () => bisect((x) => 2 ** x - 32, 0, 20),
  'sm-04-q3': () => bisect((x) => Math.exp(2 * x) - Math.exp(6), -10, 10),
  'sm-04-1': ({ b, N }) => bisect((x) => b ** x - N, 0, 30),
  'sm-04-2': ({ k }, q) => pickByValue(q, Math.round(bisect((x) => 10 ** x - 10 ** -k, -20, 20) * 1e9) / 1e9),
  'sm-04-3': ({ b, x, y, z }) => bisect((t) => b ** t - (x * y) / z, -10, 20),
  // ln(a^m · a^(±1/2)) / ln a for a concrete a: the coefficient of t = ln a.
  'sm-04-4': ({ m, s }) => { const a = 3; return Math.log(a ** m * a ** (s / 2)) / Math.log(a); },
  'sm-04-5': ({ b, c }) => ({ v: bisect((x) => b ** x - c, 0, 10), tol: 0.006 }),
  'sm-04-6': ({ k, f }) => ({ v: bisect((t) => 1 / f - Math.exp(-k * t), 0, 200), tol: 0.006 }),
  'sm-04-x1': ({ N }) => bisect((x) => 2 ** x - N, 0, 20),
  'sm-04-x2': ({ a, k }) => Math.exp(Math.log(a)) + Math.log(Math.exp(k)),
  'sm-04-x3': ({ a, b }) => bisect((x) => 10 ** x - a * b, -5, 10),
  'sm-04-x4': ({ B, N }) => bisect((x) => B ** x - N, -10, 10),
  'sm-04-x5': ({ a, b }) => bisect((x) => Math.exp(a * x) - Math.exp(b), -20, 20),
  'sm-04-x6': ({ P, rate, n }) => { let v = P; for (let i = 0; i < n; i++) v += v * rate; return v; },
});

const DEG = Math.PI / 180;
const trigOf = (fnId, deg) => (fnId === 0 ? Math.sin(deg * DEG) : Math.cos(deg * DEG));
Object.assign(checks, {
  'sm-05-q1': () => 90 * DEG,
  'sm-05-q2': () => Math.sin(30 * DEG),
  'sm-05-q3': () => Math.sign(Math.cos(120 * DEG)),
  'sm-05-1': ({ deg }) => deg * DEG,
  'sm-05-2': ({ fnId, deg }) => trigOf(fnId, deg),
  'sm-05-3': ({ fnId, deg }) => trigOf(fnId, deg),
  // Walk the circle in small steps and take the angle in the given quadrant whose sine matches.
  'sm-05-4': ({ sn, c, Q }) => {
    // Sine is monotone inside each quadrant: bisect for the angle there, then take its cosine.
    const lo = (Q - 1) * 90;
    const hi = Q * 90;
    const up = Math.sin(hi * DEG) > Math.sin(lo * DEG) ? 1 : -1;
    const t = bisect((d) => up * (Math.sin(d * DEG) - sn / c), lo, hi);
    return Math.cos(t * DEG);
  },
  'sm-05-5': ({ x, y }) => Math.round(((Math.atan2(y, x) / DEG) + 360) % 360),
  // v is stored to 6 decimals, so match with that precision.
  'sm-05-6': ({ fnId, v }) => range(0, 359).filter((d) => Math.abs(trigOf(fnId, d) - v) < 2e-6).map((d) => d * DEG),
  'sm-05-x1': ({ p, q }) => ((p / q) * Math.PI) / DEG,
  'sm-05-x2': ({ fnId, deg }) => Math.round(trigOf(fnId, deg) * 1e9) / 1e9,
  'sm-05-x3': ({ sn, cn, c }) => sn / c / (cn / c),
  'sm-05-x4': ({ ss, cs }) => [1, 2, 3, 4].find((k) => Math.sign(Math.sin((45 + 90 * (k - 1)) * DEG)) === ss && Math.sign(Math.cos((45 + 90 * (k - 1)) * DEG)) === cs),
  'sm-05-x5': ({ fnId, theta }) => trigOf(fnId, theta),
  'sm-05-x6': ({ rad, deg }) => rad * deg * DEG,
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

/** Python programs collected from the checks, run together at the end. */
const pyJobs = [];
/** Option labels hold printed output as <c>…</c>; compare the text itself. */
const plain = (label) => label.replace(/<\/?c>/g, '').replace(/\$/g, '').trim();
function compareOutput(tag, q, out) {
  const printed = out.trim();
  const correct = q.options.find((o) => o.id === q.correctOptionId);
  if (plain(correct.label) !== printed) fail(tag, `the code prints "${printed}", key option ${correct.id} is "${plain(correct.label)}"`);
  for (const o of q.options) if (o.id !== correct.id && plain(o.label) === printed) fail(tag, `distractor ${o.id} is what the code prints`);
}

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
  for (const d of l.deeper ?? []) {
    if (!/^https:\/\/[^\s]+$/.test(d.url)) fail(l.id, `"Go deeper" link is not an https URL: ${d.url}`);
    if (!d.title.trim() || !d.source.trim()) fail(l.id, '"Go deeper" link needs a title and a source');
  }
  const quizzes = l.lecture.flatMap((s) => s.blocks.filter((b) => b.kind === 'quiz'));
  if (quizzes.length < 2) fail(l.id, 'a lecture needs at least 2 quick checks');
  for (const s of l.lecture) {
    if (!s.blocks.length) fail(l.id, `section "${s.title}" is empty`);
    for (const b of s.blocks) {
      const texts = { text: [b.text], formula: [b.caption ?? ''], box: [b.title, b.text], example: [b.prompt, ...(b.steps ?? [])], diagram: [b.caption ?? ''], code: [b.caption ?? ''], quiz: [b.prompt, b.explanation, ...(b.options ?? []).flatMap((o) => [o.label, o.trapExplanation ?? ''])] }[b.kind];
      if (!texts) { fail(l.id, `unknown block kind "${b.kind}"`); continue; }
      for (const t of texts) dollars(`${l.id} / ${s.title}`, t);
      if (b.kind === 'diagram' && !DIAGRAMS.has(b.type)) fail(l.id, `unknown diagram "${b.type}"`);
      // Lecture code with a stated output is run too (NumPy code cannot run here and is skipped).
      if (b.kind === "code" && b.output !== undefined && !/import numpy|\bnp\./.test(b.code))
        pyJobs.push({ tag: `${l.id} / ${s.title} (code block)`, q: { options: [{ id: 'a', label: b.output }], correctOptionId: 'a' }, code: b.code });
      if (b.kind === 'quiz') {
        if (!b.id.startsWith(`${l.id}-q`)) fail(b.id, `quick-check id should start with ${l.id}-q`);
        if (b.options.length < 3 || b.options.length > 4) fail(b.id, 'a quick check needs 3–4 options');
        quickChecks.push(b);
      }
    }
  }
}

for (const [id, reqs] of Object.entries(PREREQS)) {
  if (!lessonIds.has(id)) fail(`prereqs ${id}`, 'no such lesson');
  for (const r of reqs) if (!lessonIds.has(r)) fail(`prereqs ${id}`, `unknown prerequisite ${r}`);
}

for (const [from, to] of Object.entries(SPLIT_LESSONS)) {
  if (!lessonIds.has(from) || !lessonIds.has(to)) fail(`split ${from} -> ${to}`, 'both halves must be lessons');
}
{
  const ids = new Set(QUESTIONS.map((q) => q.id));
  for (const [from, to] of Object.entries(RENAMED_QUESTIONS)) {
    if (ids.has(from)) fail(`renamed ${from}`, 'the old id is still in use: a saved mistake would jump to another question');
    if (!ids.has(to)) fail(`renamed ${from}`, `no question ${to}`);
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
const BROKEN = /NaN|undefined|Infinity|\[object|[+-]\s*[+-]\s*\d|(?<![\\a-zA-Z{.])(cdot|tfrac|dfrac|mathbf|sqrt|mathbb|begin\{)/;

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
  const texts = [q.promptText, q.mathFormula ?? '', ...q.options.flatMap((o) => [o.label, o.trapExplanation ?? '']), ...q.stepByStepSolution, q.hint ?? ''];
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

// The Hint shows the first solution step unless the question has its own hint, so that step must not give the
// answer away: it must not contain the key's label while naming no other option.
const squash = (s) => s.replace(/\$/g, '').replace(/<\/?[ic]>/g, '').replace(/\\[,;! ]/g, '').replace(/\s+/g, '');
function hintLeaks(q) {
  if (q.hint) return false;
  const key = squash(q.options.find((o) => o.id === q.correctOptionId)?.label ?? '');
  const first = squash(q.stepByStepSolution[0] ?? '');
  if (key.length < 2 || !first.includes(key)) return false;
  return !q.options.some((o) => o.id !== q.correctOptionId && first.includes(squash(o.label)));
}

for (const q of QUESTIONS) {
  if (seen.has(q.id)) fail(q.id, 'duplicate id');
  seen.add(q.id);
  if (!q.id.startsWith(q.lessonId)) fail(q.id, `id should start with its lesson id ${q.lessonId}`);
  if (!q.generate) {
    if (hintLeaks(q)) fail(q.id, 'the first solution step gives the answer away: add a `hint`');
    if (checkStructure(q)) verifyKey(q);
    continue;
  }
  let leaks = 0;
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
    if (hintLeaks(v)) leaks++;
    variantsChecked++;
  }
  // A number can match by chance in a few variants; a step that names the answer does so in most of them.
  if (leaks > SEEDS * 0.3) fail(q.id, `the first solution step gives the answer away in ${leaks} of ${SEEDS} variants: add a \`hint\``);
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
    res = check(q.params, q);
  } catch (e) {
    return fail(tag, `check threw: ${e.message}`);
  }
  recomputed++;
  // Programming questions: the answer is printed text, compared with the option labels.
  if (res && typeof res === 'object' && 'py' in res) {
    pyJobs.push({ tag, q, code: res.py });
    return;
  }
  if (res && typeof res === 'object' && 'out' in res) return compareOutput(tag, q, res.out);
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

// Run every collected Python program in one interpreter and compare what it prints with the key.
if (pyJobs.length) {
  const RUNNER = [
    'import sys, json, io, contextlib',
    'out = []',
    'for code in json.load(sys.stdin):',
    '    buf = io.StringIO()',
    '    try:',
    '        with contextlib.redirect_stdout(buf):',
    "            exec(code, {'__name__': '__main__'})",
    '        out.append(buf.getvalue())',
    '    except Exception as e:',
    "        out.append('!EXC ' + type(e).__name__ + ': ' + str(e))",
    'print(json.dumps(out))',
  ].join('\n');
  let outs;
  try {
    outs = JSON.parse(execFileSync('python3', ['-c', RUNNER], { input: JSON.stringify(pyJobs.map((j) => j.code)), maxBuffer: 1 << 28 }).toString());
  } catch (e) {
    fail('python', `could not run python3 to check the programming answers: ${e.message.split('\n')[0]}`);
    outs = [];
  }
  pyJobs.forEach((j, i) => outs[i] !== undefined && compareOutput(j.tag, j.q, outs[i]));
  console.log(`Python: ${pyJobs.length} programs executed.`);
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
