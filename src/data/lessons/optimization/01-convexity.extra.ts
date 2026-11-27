import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, coef, frac, paren, poly, shuffle } from '../gen.ts';

/** Shape verdicts: 0 convex, 1 concave, 2 neither. */
const SHAPES = ['Convex', 'Concave', 'Neither convex nor concave', 'Both convex and concave (linear)'];
/** Sets for "which set is convex?", encoded as [type, p, q]; types 0–3 are convex, 4–7 are not. */
const SET_TEX = (t: number, p: number, q: number) =>
  [
    `$\\{x \\in \\mathbb{R} : ${p} \\le x \\le ${q}\\}$`,
    `$\\{x \\in \\mathbb{R} : |x ${p < 0 ? '+' : '-'} ${Math.abs(p)}| \\le ${q}\\}$`,
    `$\\{(x, y) : x ${p < 0 ? '-' : '+'} ${Math.abs(p) === 1 ? '' : Math.abs(p)}y \\le ${q}\\}$`,
    `$\\{(x, y) : x^2 + y^2 \\le ${p * p}\\}$`,
    `$\\{x \\in \\mathbb{R} : |x ${p < 0 ? '+' : '-'} ${Math.abs(p)}| \\ge ${q}\\}$`,
    `$\\{(x, y) : ${p * p} \\le x^2 + y^2 \\le ${q * q}\\}$`,
    `$[${p}, ${p + 1}] \\cup [${p + 3}, ${p + 4}]$`,
    `$\\{(x, y) : |x| + |y| \\ge ${p}\\}$`,
  ][t];
const SET_WHY = [
  '',
  '',
  '',
  '',
  'It is the line minus an open interval around the centre: two points on opposite sides have their midpoint in the gap.',
  'A ring has a hole: the segment between opposite points passes through it.',
  'The segment from the right end of the first piece to the left end of the second leaves the set.',
  'The outside of a diamond: the midpoint of two opposite corners is the origin, which is missing.',
];

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'op-01-x1',
    difficulty: 1,
    keyConceptTag: 'Convex or concave',
    correctOptionId: 'a',
    generate: (g) => {
      const a = g.nonzero(-5, 5);
      const b = g.int(-6, 6);
      const c = g.int(-6, 6);
      const k = a > 0 ? 0 : 1;
      const order = [k, ...shuffle(g, [0, 1, 2, 3].filter((x) => x !== k)).slice(0, 3)];
      return {
        params: { a, b, c, order },
        promptText: r`Is $f(x) = ${poly([c, b, a])}$ convex, concave or neither?`,
        options: order.map((s, i) => ({
          id: 'abcd'[i],
          label: SHAPES[s],
          ...(i === 0 ? {} : { trapExplanation: r`$f''(x) = ${2 * a}$ is ${a > 0 ? 'positive' : 'negative'} everywhere, so $f$ is ${a > 0 ? 'convex' : 'concave'}; the linear terms do not change the curvature.` }),
        })),
        stepByStepSolution: [
          r`$f'(x) = ${poly([b, 2 * a])}$.`,
          r`$f''(x) = ${2 * a}$, ${a > 0 ? 'positive' : 'negative'} for every $x$.`,
          r`So $f$ is ${a > 0 ? 'convex' : 'concave'}.`,
        ],
      };
    },
  },
  {
    id: 'op-01-x2',
    difficulty: 1,
    keyConceptTag: 'Chords above the graph',
    correctOptionId: 'a',
    generate: (g) => {
      const { u, v } = g.until(() => ({ u: g.int(-6, 2), v: g.int(1, 8) }), ({ u, v }) => v - u >= 2 && allDistinct([(u * u + v * v) / 2, ((u + v) / 2) ** 2, u * u + v * v, ((v - u) / 2) ** 2]));
      const f = (x: number) => x * x;
      return {
        params: { u, v },
        promptText: r`For $f(x) = x^2$, what is the height of the chord between $x = ${u}$ and $x = ${v}$ at its midpoint?`,
        options: [
          { id: 'a', label: `$${frac(f(u) + f(v), 2)}$`, value: (f(u) + f(v)) / 2 },
          { id: 'b', label: `$${frac((u + v) ** 2, 4)}$`, value: ((u + v) / 2) ** 2, trapExplanation: r`That is the graph $f\big(${frac(u + v, 2)}\big)$; the chord averages the end values instead.` },
          { id: 'c', label: `$${f(u) + f(v)}$`, value: f(u) + f(v), trapExplanation: r`Average the two end values: divide by 2.` },
          { id: 'd', label: `$${frac((v - u) ** 2, 4)}$`, value: ((v - u) / 2) ** 2, trapExplanation: r`That is the gap between chord and graph, not the chord's height.` },
        ],
        stepByStepSolution: [
          r`End values: $f(${u}) = ${f(u)}$ and $f(${v}) = ${f(v)}$.`,
          r`At the midpoint the chord is their average.`,
          r`$\frac{${f(u)} + ${f(v)}}{2} = ${frac(f(u) + f(v), 2)}$, above the graph's $${frac((u + v) ** 2, 4)}$.`,
        ],
      };
    },
  },
  {
    id: 'op-01-x3',
    difficulty: 2,
    keyConceptTag: 'Convex sets',
    correctOptionId: 'a',
    generate: (g) => {
      const draw = (t: number): number[] => {
        if (t === 0) { const p = g.int(-5, 2); return [0, p, p + g.int(1, 5)]; }
        if (t === 1) return [1, g.nonzero(-4, 4), g.int(1, 5)];
        if (t === 2) return [2, g.nonzero(-3, 3), g.int(-4, 6)];
        if (t === 3) return [3, g.int(1, 5), 0];
        if (t === 4) return [4, g.nonzero(-3, 3), g.int(1, 4)];
        if (t === 5) { const p = g.int(1, 3); return [5, p, p + g.int(1, 3)]; }
        if (t === 6) return [6, g.int(-4, 2), 0];
        return [7, g.int(1, 4), 0];
      };
      const sets = [draw(g.int(0, 3)), ...shuffle(g, [4, 5, 6, 7]).slice(0, 3).map(draw)];
      return {
        params: { sets },
        promptText: r`Which of these sets is convex?`,
        options: sets.map(([t, p, q], i) => ({ id: 'abcd'[i], label: SET_TEX(t, p, q), ...(i === 0 ? {} : { trapExplanation: SET_WHY[t] }) })),
        stepByStepSolution: [
          r`A set is convex if the segment between any two of its points stays in the set.`,
          r`${['An interval', 'An interval (all points within a fixed distance of the centre)', 'A half-plane', 'A disk'][sets[0][0]]} has this property.`,
          r`Each of the other sets has two points whose connecting segment leaves it.`,
        ],
      };
    },
  },
  {
    id: 'op-01-x4',
    difficulty: 2,
    keyConceptTag: 'Tangent lines lie below',
    correctOptionId: 'a',
    generate: (g) => {
      const { x0, A, s, y } = g.until(
        () => ({ x0: g.int(-3, 3), A: g.int(-5, 10), s: g.nonzero(-4, 4), y: g.int(-4, 6) }),
        ({ x0, A, s, y }) => y !== x0 && y - x0 !== 1 && allDistinct([A + s * (y - x0), A - s * (y - x0), A + s, A]),
      );
      return {
        params: { x0, A, s, y },
        promptText: r`A convex differentiable $f$ has $f(${x0}) = ${A}$ and $f'(${x0}) = ${s}$. What is the best lower bound on $f(${y})$ that convexity guarantees?`,
        options: [
          { id: 'a', label: `$${A + s * (y - x0)}$`, value: A + s * (y - x0) },
          { id: 'b', label: `$${A - s * (y - x0)}$`, value: A - s * (y - x0), trapExplanation: r`The tangent is $f(${x0}) + f'(${x0})(y - ${paren(x0)})$, with a plus sign.` },
          { id: 'c', label: `$${A + s}$`, value: A + s, trapExplanation: r`The slope is multiplied by the distance $${y} - ${paren(x0)} = ${y - x0}$.` },
          { id: 'd', label: `$${A}$`, value: A, trapExplanation: r`A convex function can fall below $f(${x0})$ in the downhill direction; the tangent gives the bound.` },
        ],
        stepByStepSolution: [
          r`Convex functions lie above their tangents: $f(y) \ge f(x_0) + f'(x_0)(y - x_0)$.`,
          r`$f(${y}) \ge ${A} + ${paren(s)}\cdot${paren(y - x0)}$.`,
          r`$= ${A + s * (y - x0)}$; the tangent line itself (a convex function) reaches it.`,
        ],
      };
    },
  },
  {
    id: 'op-01-x5',
    difficulty: 1,
    keyConceptTag: 'Convexity in two variables',
    correctOptionId: 'a',
    generate: (g) => {
      const a = g.nonzero(-4, 4);
      const c = g.nonzero(-4, 4);
      const k = a > 0 && c > 0 ? 0 : a < 0 && c < 0 ? 1 : 2;
      const order = [k, ...shuffle(g, [0, 1, 2, 3].filter((x) => x !== k)).slice(0, 3)];
      return {
        params: { a, c, order },
        promptText: r`Is $f(x, y) = ${coef(a)}x^2 ${c < 0 ? '-' : '+'} ${coef(Math.abs(c))}y^2$ convex, concave or neither?`,
        options: order.map((s, i) => ({
          id: 'abcd'[i],
          label: SHAPES[s],
          ...(i === 0 ? {} : { trapExplanation: r`The Hessian is $\operatorname{diag}(${2 * a}, ${2 * c})$; ${k === 2 ? 'one entry is positive and one negative, so it is indefinite' : k === 0 ? 'both entries are positive' : 'both entries are negative'}.` }),
        })),
        stepByStepSolution: [
          r`$H = \begin{pmatrix} ${2 * a} & 0 \\ 0 & ${2 * c} \end{pmatrix}$.`,
          r`Its eigenvalues are $${2 * a}$ and $${2 * c}$.`,
          r`${k === 0 ? 'Both positive: convex' : k === 1 ? 'Both negative: concave' : 'Opposite signs: a saddle shape, neither convex nor concave'}.`,
        ],
      };
    },
  },
  {
    id: 'op-01-x6',
    difficulty: 2,
    keyConceptTag: 'Operations that keep convexity',
    correctOptionId: 'a',
    generate: (g) => {
      const al = g.int(2, 5);
      const be = g.int(2, 5);
      const T = [
        `$${al}f + ${be}g$`,
        `$\\max(f, g)$`,
        `$${al}f - ${be}g$`,
        `$\\min(f, g)$`,
        `$f\\cdot g$`,
        `$-${al}f$`,
      ];
      const WHY = [
        '',
        '',
        'A difference can fail: $f = x$, $g = x^2$ give $x - x^2$, which is concave.',
        'A minimum can fail: $\\min(x^2, (x - 2)^2)$ has two valleys.',
        'A product can fail: $f = x$, $g = x^2$ give $x^3$.',
        'A negative multiple of a convex function is concave.',
      ];
      const order = [g.pick([0, 1]), ...shuffle(g, [2, 3, 4, 5]).slice(0, 3)];
      return {
        params: { al, be, order },
        promptText: r`$f$ and $g$ are convex functions on $\mathbb{R}$. Which of these is guaranteed to be convex?`,
        options: order.map((k, i) => ({ id: 'abcd'[i], label: T[k], ...(i === 0 ? {} : { trapExplanation: WHY[k] }) })),
        stepByStepSolution: [
          r`Non-negative weighted sums and pointwise maxima of convex functions are convex.`,
          r`Differences, minima, products and negative multiples are not in general: each has a counterexample.`,
          r`So the answer is ${T[order[0]]}.`,
        ],
      };
    },
  },
];
