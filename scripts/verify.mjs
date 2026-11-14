// Independent re-computation of the answer key.
// Run with:  npm run verify   (needs Node 22.18+ / 24, which can import .ts files directly)
//
// For every question the script (1) checks the structure and (2) recomputes the
// answer by brute force, numerical integration or by actually running the
// pseudocode, then compares it with the `value` of the option marked correct.

import { QUESTIONS } from '../src/data/questions.ts';

// ---------- numeric helpers ----------
const simpson = (f, a, b, n = 2000) => {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
};
const deriv = (f, x, h = 1e-5) => (f(x + h) - f(x - h)) / (2 * h);
/** Area of {(x,y) in box : inside(x,y)} by midpoint sampling. */
const gridArea = (inside, x0, x1, y0, y1, n = 1500) => {
  const dx = (x1 - x0) / n;
  const dy = (y1 - y0) / n;
  let c = 0;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) if (inside(x0 + (i + 0.5) * dx, y0 + (j + 0.5) * dy)) c++;
  return c * dx * dy;
};
const dist = (x, y, a, b) => Math.hypot(x - a, y - b);
const exps = (n, primes) => {
  const e = primes.map(() => 0);
  primes.forEach((p, i) => {
    while (n % p === 0) {
      n /= p;
      e[i]++;
    }
  });
  return { e, rest: n };
};
const divisors = (n) => {
  const d = [];
  for (let i = 1; i <= n; i++) if (n % i === 0) d.push(i);
  return d;
};
const permutations = (arr) =>
  arr.length <= 1 ? [arr] : arr.flatMap((x, i) => permutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map((p) => [x, ...p]));

const S3 = Math.sqrt(3);

// ---------- one independent computation per question ----------
// Each returns a number, or { v, tol } for grid-based areas.
const checks = {
  // Geometry
  'geo-01': () => (Math.PI * 31 ** 2 * 102) / 1000,
  'geo-02': () => (50 * 40 * 30) / 1000,
  'geo-03': () => ({ v: gridArea((x, y) => dist(x, y, 1, 1) > 1, 0, 2, 0, 2) / 4, tol: 2e-3 }),
  'geo-04': () => ((4 / 3) * Math.PI * 2 ** 3) / ((4 / 3) * Math.PI * 1 ** 3),
  'geo-05': () => ({
    v: gridArea(
      (x, y) =>
        y > 0 && y < S3 * x && y < S3 * (2 - x) && // inside the triangle (0,0),(2,0),(1,√3)
        dist(x, y, 0, 0) > 1 && dist(x, y, 2, 0) > 1 && dist(x, y, 1, S3) > 1,
      0, 2, 0, S3,
    ),
    tol: 3e-3,
  }),
  'geo-06': () => ((4 / 3) * Math.PI) / (Math.PI * 1 * 2),
  'geo-07': () => ((4 / 3) * Math.PI * 30 ** 3) / 1000,
  'geo-08': () => {
    const pts = [0, 1, 2, 3, 4, 5].map((k) => [Math.cos((k * Math.PI) / 3), Math.sin((k * Math.PI) / 3)]);
    let a = 0;
    pts.forEach(([x, y], i) => {
      const [x2, y2] = pts[(i + 1) % 6];
      a += x * y2 - x2 * y;
    });
    return a / 2 / Math.PI;
  },
  'geo-09': () => ({ v: gridArea((x, y) => dist(x, y, 0, 0) < 2 && dist(x, y, 2, 2) < 2, 0, 2, 0, 2) / 4, tol: 2e-3 }),
  'geo-10': () => ({
    v: gridArea((x, y) => dist(x, y, 0, 0) < 6 && y > 6 * Math.cos(Math.PI / 6), -3, 3, 5, 6, 2000),
    tol: 5e-3,
  }),
  'geo-11': () => simpson((z) => z * z, 0, 0.5) / simpson((z) => z * z, 0, 1),
  'geo-12': () => (Math.PI * 10 ** 2 * 1600) / 1000,

  // Calculus
  'cal-01': () => deriv((x) => x ** 3 - 2 * x, 2),
  'cal-02': () => deriv((x) => Math.exp(2 * x), 0),
  'cal-03': () => simpson((x) => 3 * x * x, 0, 2),
  'cal-05': () => deriv((x) => Math.exp(2 * x), 1) / deriv((x) => x ** 3, 1),
  'cal-06': () => -deriv((x) => x * x, 3),
  'cal-07': () => simpson(Math.sin, 0, Math.PI),
  'cal-08': () => {
    let m = 0;
    for (let x = 0; x <= 20; x += 1e-4) m = Math.max(m, x * Math.exp(-x));
    return m;
  },
  'cal-09': () => {
    // Explicit solution of f'' + f = 3 sin x with f'(0) = 1, f'(π/2) = 3.
    const A = (3 * Math.PI) / 4 - 3;
    const B = 5 / 2;
    const f = (x) => A * Math.cos(x) + B * Math.sin(x) - 1.5 * x * Math.cos(x);
    const d1 = (x) => deriv(f, x);
    const ok =
      Math.abs(d1(0) - 1) < 1e-6 &&
      Math.abs(d1(Math.PI / 2) - 3) < 1e-6 &&
      [0.3, 1, 2.2].every((x) => Math.abs((f(x + 1e-3) - 2 * f(x) + f(x - 1e-3)) / 1e-6 + f(x) - 3 * Math.sin(x)) < 1e-4);
    if (!ok) throw new Error('cal-09: example function does not satisfy the conditions');
    return simpson(f, 0, Math.PI / 2);
  },
  'cal-10': () => simpson((x) => x ** 3 * Math.cos(x) + 3 * x * x, -2, 2),
  'cal-11': () => deriv((x) => simpson((t) => Math.exp(-t * t), 0, x * x), 1, 1e-4),
  'cal-12': () => {
    // Largest c for which y = 4x + c still meets y = x²: c = min(x² − 4x).
    let m = Infinity;
    for (let x = -10; x <= 10; x += 1e-4) m = Math.min(m, x * x - 4 * x);
    return m;
  },

  // Number theory & combinatorics
  'com-01': () => divisors(72).length,
  'com-02': () => {
    let c = 0;
    for (let s = 0; s < 4; s++) for (let t = 0; t < 3; t++) for (let h = 0; h < 2; h++) c++;
    return c;
  },
  'com-03': () => {
    let c = 0;
    for (let n = 1; n <= 10000; n++) {
      const { e, rest } = exps(n, [2, 5]);
      if (rest === 1 && e.every((k) => k >= 1 && k <= 4)) c++;
    }
    return c;
  },
  'com-04': () => {
    let c = 0;
    for (let a = 1; a <= 5; a++) for (let b = 1; b <= 5; b++) for (let d = 1; d <= 5; d++) if (a !== b && a !== d && b !== d) c++;
    return c;
  },
  'com-05': () => {
    let c = 0;
    for (let n = 1; n <= 210 ** 3; n++) {
      if (n % 210 !== 0) continue;
      const { e, rest } = exps(n, [2, 3, 5, 7]);
      if (rest === 1 && e.every((k) => k >= 1 && k <= 3)) c++;
    }
    return c;
  },
  'com-06': () => divisors(360).filter((d) => d % 2 === 1).length,
  'com-07': () => {
    let f = 1n;
    for (let i = 2n; i <= 25n; i++) f *= i;
    return /0*$/.exec(f.toString())[0].length;
  },
  'com-08': () => new Set(permutations([...'LEVEL']).map((p) => p.join(''))).size,
  'com-09': () => {
    let c = 0;
    for (let n = 1; n <= 100; n++) if (n % 2 === 0 || n % 3 === 0 || n % 5 === 0) c++;
    return c;
  },
  'com-10': () => divisors(2 ** 4 * 3 ** 3 * 5 ** 2).filter((d) => Number.isInteger(Math.sqrt(d))).length,
  'com-11': () => {
    const g = Array.from({ length: 4 }, () => Array(5).fill(1));
    for (let y = 1; y <= 3; y++) for (let x = 1; x <= 4; x++) g[y][x] = g[y - 1][x] + g[y][x - 1];
    return g[3][4];
  },
  'com-12': () => {
    let x = 1n;
    for (let i = 0; i < 2026; i++) x = (x * 7n) % 10n;
    return Number(x);
  },

  // Probability (exact enumeration)
  'pro-01': () => {
    let c = 0;
    for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a === 6 && b === 6) c++;
    return c / 36;
  },
  'pro-02': () => {
    let c = 0;
    for (let m = 0; m < 8; m++) if (m !== 0) c++;
    return c / 8;
  },
  'pro-03': () => 3 / (3 + 5),
  'pro-04': () => {
    // 10 × 10 grid of equally likely cells; A = first 5 rows, B = first 4 columns.
    let c = 0;
    for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) if (i < 5 && j < 4) c++;
    return c / 100;
  },
  'pro-05': () => {
    let c = 0;
    for (let m = 0; m < 6 ** 4; m++) {
      let x = m;
      let six = false;
      for (let k = 0; k < 4; k++) {
        if (x % 6 === 5) six = true;
        x = Math.floor(x / 6);
      }
      if (six) c++;
    }
    return c / 6 ** 4;
  },
  'pro-06': () => 1 - (49 / 50) ** 50,
  'pro-07': () => {
    let c = 0;
    for (let m = 0; m < 16; m++) if ([0, 1, 2, 3].filter((k) => (m >> k) & 1).length === 2) c++;
    return c / 16;
  },
  'pro-08': () => {
    const cards = [...'RRRRBBBBBB'];
    let c = 0;
    let n = 0;
    for (let i = 0; i < 10; i++)
      for (let j = 0; j < 10; j++) {
        if (i === j) continue;
        n++;
        if (cards[i] === 'R' && cards[j] === 'R') c++;
      }
    return c / n;
  },
  'pro-09': () => {
    const sickPos = 10000 * 0.01 * 0.9;
    const healthyPos = 10000 * 0.99 * 0.09;
    return sickPos / (sickPos + healthyPos);
  },
  'pro-10': () => {
    let c = 0;
    for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) for (let d = 0; d < 10; d++) if (a === b || a === d || b === d) c++;
    return c / 1000;
  },
  'pro-11': () => {
    let n = 1;
    while (1 - 0.5 ** n <= 0.99) n++;
    return n;
  },
  'pro-12': () => {
    // dp[k] = probability of k hits so far
    let dp = [1, 0, 0];
    for (let round = 0; round < 20; round++) {
      const next = [0, 0, 0];
      for (let k = 0; k < 3; k++) {
        next[k] += dp[k] * (19 / 20);
        next[Math.min(k + 1, 2)] += dp[k] * (1 / 20);
      }
      dp = next;
    }
    return dp[1];
  },

  // Algorithms: literal translations of the pseudocode
  'alg-01': () => {
    let N = 5, S = 0, n = 1;
    while (n <= N) { S = S + n; n = n + 1; }
    return S;
  },
  'alg-02': () => {
    let N = 40, c = 0;
    while (N > 1) { N = Math.floor(N / 2); c = c + 1; }
    return c;
  },
  'alg-03': () => {
    const a = 7, b = 12;
    let m;
    if (a > b) m = a; else m = b;
    if (m % 2 === 0) m = m / 2;
    return m;
  },
  'alg-04': () => {
    const N = 5;
    let p = 1, k = 0;
    while (k < N) { p = 2 * p; k = k + 1; }
    return p;
  },
  'alg-05': () => {
    const N = 6;
    let S = 0, n = 1;
    while (n <= N) { if (n % 2 === 1) S = S + n; n = n + 1; }
    return S;
  },
  'alg-06': () => {
    const N = 6;
    let a = 0, b = 1, k = 0;
    while (k < N) { const t = a + b; a = b; b = t; k = k + 1; }
    return a;
  },
  'alg-07': () => {
    let a = 84, b = 36;
    while (b !== 0) { const r = a % b; a = b; b = r; }
    return a;
  },
  'alg-08': () => {
    let N = 2026, S = 0;
    while (N > 0) { S = S + (N % 10); N = Math.floor(N / 10); }
    return S;
  },
  'alg-09': () => {
    const N = 5;
    let c = 0, i = 1;
    while (i <= N) { let j = i; while (j <= N) { c = c + 1; j = j + 1; } i = i + 1; }
    return c;
  },
  'alg-10': () => {
    let N = 6, c = 0;
    while (N !== 1) { if (N % 2 === 0) N = N / 2; else N = 3 * N + 1; c = c + 1; }
    return c;
  },
  'alg-11': () => {
    const N = 36;
    let c = 0, d = 1;
    while (d * d <= N) { if (N % d === 0) { if (d * d === N) c = c + 1; else c = c + 2; } d = d + 1; }
    return c;
  },
  'alg-12': () => {
    const N = 4;
    let S = 0, n = 1;
    while (n <= N) { S = S + (2 * n - 1); n = n + 1; }
    return S;
  },
};

/** "Roughly how much" questions: the correct option is the closest one on a log scale. */
const ESTIMATES = new Set(['geo-01', 'geo-07', 'geo-12', 'pro-06', 'pro-09']);
/** Purely conceptual questions without a numeric answer (reviewed by hand). */
const CONCEPTUAL = new Set(['cal-04']);

// ---------- run ----------
const errors = [];
const fail = (id, msg) => errors.push(`${id}: ${msg}`);
const seen = new Set();
const tally = {};

for (const q of QUESTIONS) {
  if (seen.has(q.id)) fail(q.id, 'duplicate id');
  seen.add(q.id);
  tally[q.moduleId] ??= { 1: 0, 2: 0, 3: 0 };
  tally[q.moduleId][q.difficulty]++;

  const correct = q.options.find((o) => o.id === q.correctOptionId);
  if (!correct) { fail(q.id, 'correctOptionId does not match any option'); continue; }
  if (new Set(q.options.map((o) => o.id)).size !== q.options.length) fail(q.id, 'duplicate option ids');
  if (q.options.length < 4 || q.options.length > 5) fail(q.id, 'needs 4–5 options');
  for (const o of q.options) {
    if (o.id !== q.correctOptionId && !o.trapExplanation) fail(q.id, `option ${o.id} has no trapExplanation`);
    if (o.id === q.correctOptionId && o.trapExplanation) fail(q.id, 'correct option must not have a trapExplanation');
  }
  if (q.stepByStepSolution.length < 3) fail(q.id, 'needs at least 3 solution steps');
  for (const text of [q.promptText, ...q.options.flatMap((o) => [o.label, o.trapExplanation ?? '']), ...q.stepByStepSolution]) {
    if ((text.match(/\$/g) ?? []).length % 2) fail(q.id, `unbalanced $ in: ${text.slice(0, 50)}…`);
  }

  if (CONCEPTUAL.has(q.id)) continue;
  const check = checks[q.id];
  if (!check) { fail(q.id, 'no independent check defined'); continue; }
  if (q.options.some((o) => typeof o.value !== 'number')) { fail(q.id, 'every option needs a numeric value'); continue; }

  const res = check();
  const v = typeof res === 'number' ? res : res.v;
  const tol = typeof res === 'number' ? 1e-6 * Math.max(1, Math.abs(v)) : res.tol;

  if (ESTIMATES.has(q.id)) {
    const nearest = [...q.options].sort((a, b) => Math.abs(Math.log(a.value / v)) - Math.abs(Math.log(b.value / v)))[0];
    if (nearest.id !== q.correctOptionId) fail(q.id, `computed ≈ ${v}, nearest option is ${nearest.id}, key says ${q.correctOptionId}`);
  } else {
    if (Math.abs(correct.value - v) > tol) fail(q.id, `computed ${v}, key option ${correct.id} = ${correct.value}`);
    for (const o of q.options)
      if (o.id !== correct.id && Math.abs(o.value - v) <= tol * 10) fail(q.id, `distractor ${o.id} equals the computed answer`);
  }
}

console.log(`Questions: ${QUESTIONS.length}`);
for (const [m, t] of Object.entries(tally)) console.log(`  ${m.padEnd(14)} level 1: ${t[1]}  level 2: ${t[2]}  level 3: ${t[3]}`);
if (errors.length) {
  console.error(`\n${errors.length} problem(s):`);
  for (const e of errors) console.error('  ✗ ' + e);
  process.exit(1);
}
console.log(`\nAll ${QUESTIONS.length} answer keys confirmed (${QUESTIONS.length - CONCEPTUAL.size} recomputed, ${CONCEPTUAL.size} conceptual).`);
