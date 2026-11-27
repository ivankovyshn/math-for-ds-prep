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
const minus = (A, B) => A.map((row, i) => row.map((x, j) => x - B[i][j]));
Object.assign(checks, {
  'la-11-q1': () => svals([[2, 0], [0, -3]]),
  'la-11-q2': () => rank(diagM([7, 2, 0])),
  'la-11-q3': () => {
    const ev = symEig(mul(mul(Q3, diagM([8, 1.5, 0.5])), T(Q3)));
    return (100 * ev[0]) / ev.reduce((s, x) => s + x, 0);
  },
  'la-11-1': ({ A }) => svals(A),
  'la-11-2': ({ ls }) => {
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
  'la-11-6': ({ C }) => {
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
  'la-11-x5': (p) => {
    const top = symEig(p.C)[0];
    const isPC1 = (v) => () => isEigvec(p.C, v) && Math.abs(dot(mulVec(p.C, v), v) / dot(v, v) - top) < EPS;
    return pickId({ a: isPC1(p.a), b: isPC1(p.b), c: isPC1(p.c), d: isPC1(p.d) });
  },
  'la-11-x6': ({ s }) => {
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
/** Is f decreasing exactly on {x : dir·(x − bound) > 0}? Probed at a few points on each side. */
const decreasingOn = (f, [dir, bound]) => () =>
  [0.3, 1, 3].every((t) => D1(f, bound + dir * t) < 0 && D1(f, bound - dir * t) > 0);
Object.assign(checks, {
  'ca-02-q1': () => {
    const f = (x) => x * x;
    return (f(3) - f(1)) / (3 - 1);
  },
  'ca-02-q2': () => D1(P([7, -5, 0, 2]), 1),
  'ca-02-q3': () => D1((x) => x * Math.exp(x), 0),
  'ca-02-1': ({ cs, a }) => D1(P(cs), a),
  'ca-02-2': ({ cs, a }) => {
    const m = D1(P(cs), a);
    return [P(cs)(a) - m * a, m];
  },
  'ca-02-3': ({ p, q, k }) => D1((x) => (p * x + q) * Math.exp(k * x), 0),
  'ca-02-4': ({ p, q, n, a }) => D1((x) => (p * x + q) ** n, a),
  'ca-02-5': ({ cs }) => {
    const mins = localMinima(P(cs));
    if (mins.length !== 1) throw new Error(`expected one local minimum, got ${mins.length}`);
    return { v: mins[0], tol: 2e-3 };
  },
  'ca-02-6': ({ pn, pd }) => {
    const p = pn / pd;
    return D1(sigmoid, Math.log(p / (1 - p)));
  },
  'ca-02-x1': ({ cs, a }) => D1(P(cs), a),
  'ca-02-x2': ({ cs }) => [D1(P(cs), 0), D1(P(cs), 1) - D1(P(cs), 0)],
  'ca-02-x3': ({ cs, a, b }) => (P(cs)(b) - P(cs)(a)) / (b - a),
  'ca-02-x4': ({ p, q, a }) => D1((x) => Math.log(p * x + q), a),
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
  'ca-04-5': ({ c, m, n }) => integral((x) => 2 * x * (x * x + m) ** n, 0, c),
  'ca-04-6': ({ n }) => integral((x) => x * (n + 1) * x ** n, 0, 1),
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
Object.assign(checks, {
  'pr-03-q1': () => prob(tuples(['H', 'T'], 3), (t) => t.filter((x) => x === 'H').length >= 2),
  'pr-03-q2': () => trialsProb(4, 1, 2, 2),
  'pr-03-q3': () => pctNear(normalProb(100, 15, 85, 115)),
  'pr-03-1': ({ ps, k }) => prob(ps.flatMap((p, x) => Array(p).fill(x)), (x) => x <= k),
  'pr-03-2': ({ n, pn, pd, k }) => trialsProb(n, pn, pd, k),
  'pr-03-3': ({ lam, k }) => rel(poissonLimit(lam, k), 1e-4),
  'pr-03-4': ({ lam, t }) => integral((x) => lam * Math.exp(-lam * x), t, t + 60 / lam, 4000),
  'pr-03-5': ({ m, s, lo, hi }) => pctNear(normalProb(m, s, m + lo * s, m + hi * s)),
  'pr-03-6': ({ a, b, c, d }) => near(uniformProb(a, b, c, d), 1e-3),
  'pr-03-x1': ({ ps }) => prob(ps.flatMap((p, x) => Array(p).fill(x)), (x) => x === 3),
  'pr-03-x2': ({ n, pn, pd, k }) => trialsProb(n, pn, pd, k),
  'pr-03-x3': ({ k, n }) => prob(range(1, n), (x) => x <= k),
  'pr-03-x4': ({ lam, k }) => rel(poissonLimit(lam, k), 1e-4),
  'pr-03-x5': ({ a, b, c, d }) => near(uniformProb(a, b, c, d), 1e-3),
  'pr-03-x6': ({ m, s, lo, hi }) => pctNear(normalProb(m, s, m + lo * s, m + hi * s)),
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
