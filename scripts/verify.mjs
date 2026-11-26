// Independent re-computation of the answer key, plus structural checks of every lesson.
// Run with:  npm run verify   (needs Node 22.18+ / 24, which can import .ts files directly)
//
// For every question the script (1) checks the structure and (2) recomputes the
// answer with plain numerical linear algebra, then compares it with the `value`
// of the option marked correct. Every lecture is checked for unbalanced $ and
// unknown diagrams.

import { readFileSync } from 'node:fs';
import { LESSONS, QUESTIONS } from '../src/data/questions.ts';

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

// ---------- one independent computation per question ----------
// Each returns a number, a list of numbers, { v, tol } or { id } (the option that must be correct).
const checks = {
  // ===== Mathematical Language =====
  // Lesson 1 · Logic
  'ml-01-1': () => {
    const target = (P, Q) => implies(P, Q);
    return pickId({
      a: () => equivalent(target, (P, Q) => implies(!Q, !P), 2),
      b: () => equivalent(target, (P, Q) => implies(Q, P), 2),
      c: () => equivalent(target, (P, Q) => implies(!P, !Q), 2),
      d: () => equivalent(target, (P, Q) => P && Q, 2),
    });
  },
  'ml-01-2': () => {
    const falseRows = rowsOf(2).filter(([P, Q]) => !implies(P, Q)).map((r) => r.join());
    const is = (...rows) => () => falseRows.join(';') === rows.map((r) => r.join()).join(';');
    return pickId({ a: is([true, false]), b: is([false, true]), c: is([false, false]), d: is() });
  },
  'ml-01-3': () => {
    const D = [0, 1, 2];
    const preds = allPredicates(D.flatMap((x) => D.map((y) => [x, y])));
    const original = (R) => D.every((x) => D.some((y) => R(x, y)));
    const negates = (form) => () => preds.every((R) => form(R) === !original(R));
    return pickId({
      a: negates((R) => D.some((x) => D.every((y) => !R(x, y)))),
      b: negates((R) => D.every((x) => D.some((y) => !R(x, y)))),
      c: negates((R) => D.some((x) => D.some((y) => !R(x, y)))),
      d: negates((R) => D.every((x) => D.every((y) => !R(x, y)))),
    });
  },
  'ml-01-4': () => {
    const D = range(-5, 5); // symmetric, so it behaves like ℝ for these statements
    return pickId({
      a: () => D.every((x) => D.some((y) => x + y === 0)),
      b: () => D.some((y) => D.every((x) => x + y === 0)),
      c: () => D.every((x) => D.every((y) => x + y === 0)),
      d: () => D.some((x) => D.every((y) => x * y === 1)),
    });
  },
  'ml-01-5': () => {
    const target = (P, Q, R) => !implies(P, Q || R);
    return pickId({
      a: () => equivalent(target, (P, Q, R) => P && !Q && !R, 3),
      b: () => equivalent(target, (P, Q, R) => !P || (!Q && !R), 3),
      c: () => equivalent(target, (P, Q, R) => P && (!Q || !R), 3),
      d: () => equivalent(target, (P, Q, R) => implies(!P, !Q || !R), 3),
    });
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
  'ml-02-1': () => {
    const B = new Set([3, 4, 5]);
    return [1, 2, 3, 4].filter((x) => !B.has(x));
  },
  'ml-02-2': () => subsetsOf(3).length,
  'ml-02-3': () => {
    const maths = new Set(range(0, 59));
    const cs = new Set(range(35, 84)); // overlap 35..59 = 25 students
    if ([...maths].filter((x) => cs.has(x)).length !== 25) throw new Error('overlap should be 25');
    return range(0, 99).filter((x) => !maths.has(x) && !cs.has(x)).length;
  },
  'ml-02-4': () => {
    const U = 0b111;
    const pairs = subsetsOf(3).flatMap((A) => subsetsOf(3).map((B) => [A, B]));
    const same = (f) => () => pairs.every(([A, B]) => (U & ~(A | B)) === (f(A, B) & U));
    return pickId({ a: same((A, B) => ~A & ~B), b: same((A, B) => ~A | ~B), c: same((A, B) => A & B), d: same((A, B) => A & ~B) });
  },
  'ml-02-5': () => range(-10, 10).filter((x) => x * x <= 4).length * ['red', 'green', 'blue'].length,
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
  'ml-03-1': () => {
    const f = (x) => x * x + 1;
    const g = (x) => 2 * x;
    return g(f(3));
  },
  'ml-03-2': () => {
    // A continuous function on ℝ is injective exactly when it is strictly monotone.
    const xs = range(-400, 400).map((k) => k / 20);
    const monotone = (f) => () => {
      const d = xs.slice(1).map((x, i) => f(x) - f(xs[i]));
      return d.every((v) => v > 0) || d.every((v) => v < 0);
    };
    return pickId({ a: monotone((x) => x ** 3), b: monotone((x) => x * x), c: monotone(Math.abs), d: monotone(Math.sin) });
  },
  'ml-03-3': () => {
    const f = (x) => (2 * x + 1) / (x - 3);
    const xs = [-5, -1, 0, 1, 2, 4, 7, 10];
    const inverts = (g) => () => xs.every((x) => Math.abs(g(f(x)) - x) < 1e-9);
    return pickId({
      a: inverts((y) => (3 * y + 1) / (y - 2)),
      b: inverts((y) => (y - 3) / (2 * y + 1)),
      c: inverts((y) => (3 * y - 1) / (y + 2)),
      d: inverts((y) => (y + 3) / (2 * y - 1)),
    });
  },
  'ml-03-4': () => {
    // Enumerate every assignment of outputs to the inputs 1, 2, 3.
    let count = 0;
    for (const a of ['a', 'b']) for (const b of ['a', 'b']) for (const c of ['a', 'b']) count += a && b && c ? 1 : 0;
    return count;
  },
  'ml-03-5': () => {
    let count = 0;
    for (const a of range(1, 5)) for (const b of range(1, 5)) for (const c of range(1, 5)) if (new Set([a, b, c]).size === 3) count++;
    return count;
  },
  'ml-03-6': () => {
    const f = (n) => 2 * n;
    const dom = range(-50, 50);
    const injective = new Set(dom.map(f)).size === dom.length;
    const image = new Set(dom.map(f));
    const surjective = range(-20, 20).every((m) => image.has(m));
    return pickId({
      a: () => injective && !surjective,
      b: () => injective && surjective,
      c: () => !injective && surjective,
      d: () => !injective && !surjective,
    });
  },

  // Lesson 4 · Proof techniques
  'ml-04-2': () => {
    const rems = new Set(range(0, 200).map((k) => (3 * k + 2) ** 2 % 3));
    if (rems.size !== 1) throw new Error('remainder is not constant');
    return [...rems][0];
  },
  'ml-04-3': () => {
    const ns = range(-100, 100);
    const holds = (p) => ns.every(p);
    return pickId({
      a: () => !holds((n) => Math.abs(n * n + 1) % 2 === 1),
      b: () => !holds((n) => (n * n - n) % 2 === 0),
      c: () => !holds((n) => (n ** 3 - n) % 6 === 0),
      d: () => !holds((n) => Math.abs(2 * n + 1) % 2 === 1),
    });
  },
  'ml-04-4': () => range(1, 1000).find((n) => !isPrime(n * n + n + 41)),
  'ml-04-6': () => {
    const ms = range(1, 30);
    const fits = (q2) => () => ms.every((m) => (3 * m) ** 2 === 3 * q2(m));
    return pickId({ a: fits((m) => 3 * m * m), b: fits((m) => 9 * m * m), c: fits((m) => m * m), d: fits((m) => (3 * m) ** 2) });
  },

  // Lesson 5 · Induction
  'ml-05-1': () => range(1, 100).reduce((s, k) => s + k, 0),
  'ml-05-2': () => {
    const S = (n) => range(1, n).reduce((s, k) => s + (2 * k - 1), 0);
    const added = (t) => () => range(1, 30).every((n) => S(n + 1) - S(n) === t(n));
    return pickId({ a: added((n) => 2 * n + 1), b: added((n) => 2 * n - 1), c: added((n) => n + 1), d: added((n) => (n + 1) ** 2) });
  },
  'ml-05-3': () => range(1, 10).reduce((s, k) => s + k * k, 0),
  'ml-05-4': () => range(0, 9).reduce((s, k) => s + 2 ** k, 0),
  'ml-05-5': () => {
    const ok = (n) => 2n ** BigInt(n) > BigInt(n * n);
    return range(1, 400).find((n0) => range(n0, 400).every(ok));
  },

  // Lesson 6 · Complex numbers
  'ml-06-1': () => cmul([2, 3], [1, -1]),
  'ml-06-2': () => cabs([3, -4]),
  'ml-06-3': () => cdiv([3, 2], [1, -1]),
  'ml-06-4': () => deg(Math.atan2(Math.sqrt(3), -1)),
  'ml-06-5': () => round(cpow([1, 1], 8)),
  'ml-06-6': () => {
    const is = (z) => () => {
      const w = cpow(z, 4);
      return Math.abs(w[0] + 16) < 1e-9 && Math.abs(w[1]) < 1e-9;
    };
    return pickId({ a: is([Math.SQRT2, Math.SQRT2]), b: is([0, 2]), c: is([-2, 0]), d: is([2, 0]) });
  },

  // ===== Linear Algebra =====
  // Lesson 1 · Vectors and linear combinations
  'la-01-1': () => [0, 1, 2].map((i) => 2 * [2, -1, 3][i] - [1, 4, -2][i]),
  'la-01-2': () => angle([3, -2], [4, 6]),
  'la-01-3': () => norm([2, -3, 6]),
  'la-01-4': () => angle([1, 0, 1], [0, 1, 1]),
  'la-01-5': () => {
    // u·v is linear in k: f(k) = f(0) + k (f(1) - f(0)).
    const f = (k) => dot([k, 2, -1], [3, k, 4]);
    return -f(0) / (f(1) - f(0));
  },
  'la-01-6': () => solve([[1, 1], [2, -1]], [1, 8]),

  // Lesson 2 · Linear systems (value = -1 if inconsistent, otherwise the number of free variables)
  'la-02-1': () => solutionKind([[1, 2], [2, 4]], [3, 6]),
  'la-02-3': () => solve([[1, 1, 1], [0, 2, 5], [2, 5, -1]], [6, -4, 27]),
  'la-02-4': () => solutionKind([[1, 2, -1], [0, 1, 4], [0, 0, 0]], [3, 2, 5]),
  'la-02-5': () => {
    // Scan a fine grid of a for the values that make the system inconsistent.
    const bad = [];
    for (let k = -2000; k <= 2000; k++) {
      const a = k / 100;
      if (solutionKind([[1, 2], [3, a]], [1, 4]) === -1) bad.push(a);
    }
    if (bad.length !== 1) throw new Error(`expected one bad value, found ${bad}`);
    return bad[0];
  },
  'la-02-6': () => solutionKind([[1, 2, 1, 1], [2, 4, 3, 1], [3, 6, 4, 2]], [3, 7, 10]),

  // Lesson 3 · Matrices
  'la-03-1': () => {
    const C = mul(Array.from({ length: 2 }, () => [1, 2, 3]), Array.from({ length: 3 }, () => [1, 2, 3, 4]));
    return [C.length, C[0].length];
  },
  'la-03-2': () => mul([[1, 2], [3, 4]], [[0, 1], [5, -2]])[1][0],
  'la-03-3': () => flat(pow([[1, 1], [0, 1]], 3)),
  'la-03-4': () => flat(T(mul([[1, 2], [0, 1]], [[3, 0], [1, 1]]))),
  'la-03-5': () => {
    const t = Math.PI / 2;
    return flat([[Math.cos(t), -Math.sin(t)], [Math.sin(t), Math.cos(t)]]).map((x) => Math.round(x * 1e12) / 1e12);
  },
  'la-03-6': () => {
    // Apply the two maps to e1 and e2 directly, without matrices.
    const rot = ([x, y]) => [-y, x];
    const refl = ([x, y]) => [x, -y];
    const c1 = refl(rot([1, 0]));
    const c2 = refl(rot([0, 1]));
    return [c1[0], c2[0], c1[1], c2[1]];
  },

  // Lesson 4 · Determinants
  'la-04-1': () => det([[3, 1], [4, 2]]),
  'la-04-2': () => Math.abs(det([[3, 1], [1, 2]])),
  'la-04-3': () => det([[2, 0, 1], [1, 3, 2], [1, 1, 2]]),
  'la-04-4': () => {
    const A = [[3, 0, 0], [1, 1, 0], [2, 5, 1]];
    if (Math.abs(det(A) - 3) > 1e-9) throw new Error('test matrix should have det 3');
    return det(scale(2, A));
  },
  'la-04-5': () => {
    const A = [[2, 0, 0], [1, 1, 0], [3, 4, 1]];
    const B = [[-3, 0, 0], [2, 1, 0], [5, 6, 1]];
    if (Math.abs(det(A) - 2) > 1e-9 || Math.abs(det(B) + 3) > 1e-9) throw new Error('test matrices have the wrong determinants');
    return det(mul(mul(T(A), inv(B)), mul(A, A)));
  },
  'la-04-6': () => intRoots((t) => det([[t, 1, 1], [1, t, 1], [1, 1, t]])),

  // Lesson 5 · Inverse
  'la-05-1': () => flat(inv([[2, 1], [5, 3]])),
  'la-05-2': () => {
    const options = { a: [[2, 4], [1, 2]], b: [[2, 4], [1, 3]], c: [[0, 1], [1, 0]], d: [[1, 0], [0, 5]] };
    const singular = Object.keys(options).filter((k) => Math.abs(det(options[k])) < EPS);
    if (singular.length !== 1) throw new Error(`expected exactly one singular matrix, found ${singular}`);
    return { id: singular[0] };
  },
  'la-05-3': () => solve([[1, 2], [3, 7]], [3, 10]),
  'la-05-4': () => {
    const A = inv([[1, 2], [0, 1]]);
    const B = inv([[1, 0], [3, 1]]);
    return flat(inv(mul(A, B)));
  },
  'la-05-5': () => inv([[1, 2, 3], [0, 1, 4], [0, 0, 1]])[0][2],
  'la-05-6': () => {
    const A = [[5, 0, 0], [2, 1, 0], [1, 1, 1]];
    if (Math.abs(det(scale(2, A)) - 40) > 1e-9) throw new Error('test matrix should have det(2A) = 40');
    return det(inv(A));
  },

  // Lesson 6 · Independence, basis, rank
  'la-06-1': () => rank(T([[1, 2, 3], [2, 4, 6], [0, 1, 1]])),
  'la-06-3': () => rank([[1, 2, 0, 1], [2, 4, 1, 3], [3, 6, 1, 4]]),
  'la-06-4': () => {
    const roots = intRoots((k) => det(T([[1, 1, 0], [0, 1, 1], [1, k, 1]])));
    if (roots.length !== 1) throw new Error(`expected one root, found ${roots}`);
    return roots[0];
  },
  'la-06-5': () => {
    // A concrete 5×7 matrix of rank 4: (5×4)·(4×7) with independent factors.
    const L = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1], [1, 2, 3, 4]];
    const R = [[1, 2, 0, 1, 0, 3, 1], [0, 1, 1, 0, 2, 1, 0], [2, 0, 1, 1, 1, 0, 1], [0, 3, 0, 2, 1, 1, 1]];
    const A = mul(L, R);
    if (rank(A) !== 4) throw new Error('test matrix should have rank 4');
    return A[0].length - rank(A);
  },
  'la-06-6': () => solve(T([[1, 1], [1, 2]]), [4, 7]),

  // Lesson 7 · Eigenvalues
  'la-07-1': () => eig2([[2, 5], [0, 3]]),
  'la-07-2': () => {
    const Av = mulVec([[2, 1], [1, 2]], [1, 1]);
    if (Math.abs(Av[0] - Av[1]) > EPS) throw new Error('(1, 1) is not an eigenvector');
    return Av[0] / 1;
  },
  'la-07-3': () => eig2([[4, 1], [2, 3]]),
  'la-07-4': () => {
    // Null vector of A − 5I from its first row (a, b): v = (b, −a).
    const [[a, b]] = [[4 - 5, 1], [2, 3 - 5]];
    const v = direction([b, -a]);
    const Av = mulVec([[4, 1], [2, 3]], v);
    if (Av.some((x, i) => Math.abs(x - 5 * v[i]) > EPS)) throw new Error('not an eigenvector');
    return v;
  },
  'la-07-5': () => {
    const P = [[1, 1, 0], [0, 1, 1], [1, 0, 1]];
    const A = mul(mul(P, [[1, 0, 0], [0, 2, 0], [0, 0, 4]]), inv(P));
    return det(scale(2, inv(A)));
  },
  'la-07-6': () => pow([[2, 1], [0, 1]], 10)[0][1],
};

/** Purely conceptual questions without a numeric answer (reviewed by hand). */
const CONCEPTUAL = new Set(['la-02-2', 'la-06-2', 'ml-04-1', 'ml-04-5', 'ml-05-6']);

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
for (const l of LESSONS) {
  if (lessonIds.has(l.id)) fail(l.id, 'duplicate lesson id');
  lessonIds.add(l.id);
  if (l.lecture.length < 3) fail(l.id, 'a lecture needs at least 3 sections');
  if (l.minutes < 5 || l.minutes > 8) fail(l.id, 'lectures are planned for 5–8 minutes');
  if (l.questions.length < 5) fail(l.id, 'needs at least 5 practice questions');
  for (const d of [1, 2, 3]) if (!l.questions.some((q) => q.difficulty === d)) fail(l.id, `has no level-${d} question`);
  for (const s of l.lecture) {
    if (!s.blocks.length) fail(l.id, `section "${s.title}" is empty`);
    for (const b of s.blocks) {
      const texts = { text: [b.text], formula: [b.caption ?? ''], box: [b.title, b.text], example: [b.prompt, ...(b.steps ?? [])], diagram: [b.caption ?? ''], check: [b.prompt, b.answer] }[b.kind];
      if (!texts) { fail(l.id, `unknown block kind "${b.kind}"`); continue; }
      for (const t of texts) dollars(`${l.id} / ${s.title}`, t);
      if (b.kind === 'diagram' && !DIAGRAMS.has(b.type)) fail(l.id, `unknown diagram "${b.type}"`);
    }
  }
}

// Questions
const seen = new Set();
let recomputed = 0;
for (const q of QUESTIONS) {
  if (seen.has(q.id)) fail(q.id, 'duplicate id');
  seen.add(q.id);
  if (!q.id.startsWith(q.lessonId)) fail(q.id, `id should start with its lesson id ${q.lessonId}`);
  if (q.svgDiagramType && !DIAGRAMS.has(q.svgDiagramType)) fail(q.id, `unknown diagram "${q.svgDiagramType}"`);

  const correct = q.options.find((o) => o.id === q.correctOptionId);
  if (!correct) { fail(q.id, 'correctOptionId does not match any option'); continue; }
  if (new Set(q.options.map((o) => o.id)).size !== q.options.length) fail(q.id, 'duplicate option ids');
  if (q.options.length < 4 || q.options.length > 5) fail(q.id, 'needs 4–5 options');
  for (const o of q.options) {
    if (o.id !== q.correctOptionId && !o.trapExplanation) fail(q.id, `option ${o.id} has no trapExplanation`);
    if (o.id === q.correctOptionId && o.trapExplanation) fail(q.id, 'correct option must not have a trapExplanation');
  }
  if (q.stepByStepSolution.length < 3) fail(q.id, 'needs at least 3 solution steps');
  for (const text of [q.promptText, ...q.options.flatMap((o) => [o.label, o.trapExplanation ?? '']), ...q.stepByStepSolution]) dollars(q.id, text);

  if (CONCEPTUAL.has(q.id)) continue;
  const check = checks[q.id];
  if (!check) { fail(q.id, 'no independent check defined'); continue; }

  let res;
  try {
    res = check();
  } catch (e) {
    fail(q.id, `check threw: ${e.message}`);
    continue;
  }
  recomputed++;
  if (res && typeof res === 'object' && 'id' in res) {
    if (res.id !== q.correctOptionId) fail(q.id, `computation picks option ${res.id}, key says ${q.correctOptionId}`);
    continue;
  }
  if (q.options.some((o) => o.value === undefined)) { fail(q.id, 'every option needs a value'); continue; }
  const v = res && typeof res === 'object' && 'v' in res ? res.v : res;
  const tol = res && typeof res === 'object' && 'tol' in res ? res.tol : 1e-6;
  if (!same(correct.value, v, tol)) fail(q.id, `computed ${show(v)}, key option ${correct.id} = ${show(correct.value)}`);
  for (const o of q.options) if (o.id !== correct.id && same(o.value, v, tol)) fail(q.id, `distractor ${o.id} equals the computed answer`);
}

console.log(`Lessons: ${LESSONS.length}   Questions: ${QUESTIONS.length}`);
for (const l of LESSONS) {
  const t = [1, 2, 3].map((d) => l.questions.filter((q) => q.difficulty === d).length);
  console.log(`  ${l.id.padEnd(7)} ${l.title.padEnd(42)} ${l.lecture.length} sections · questions ${t.join('/')}`);
}
if (errors.length) {
  console.error(`\n${errors.length} problem(s):`);
  for (const e of errors) console.error('  ✗ ' + e);
  process.exit(1);
}
console.log(`\nAll ${QUESTIONS.length} answer keys confirmed (${recomputed} recomputed, ${CONCEPTUAL.size} conceptual).`);
