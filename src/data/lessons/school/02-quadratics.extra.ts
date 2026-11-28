import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, frac, paren, poly } from '../gen.ts';
import { rootsLab } from './02-quadratics.practice.ts';

const sorted = (xs: number[]) => [...xs].sort((p, q) => p - q);
/** (x + p) as TeX. */
const bracket = (p: number) => `(x ${p < 0 ? '-' : '+'} ${Math.abs(p)})`;

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'sm-02-x1',
    difficulty: 1,
    keyConceptTag: 'The zero-product rule',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(() => ({ a: g.nonzero(-9, 9), b: g.nonzero(-9, 9) }), ({ a, b }) => allDistinct([sorted([-a, -b]), sorted([a, b]), sorted([a, -b]), sorted([-a, b])].map(String)));
      return {
        params: { a, b },
        promptText: r`Solve $${bracket(a)}${bracket(b)} = 0$.`,
        options: [
          { id: 'a', label: rootsLab(sorted([-a, -b])), value: sorted([-a, -b]) },
          { id: 'b', label: rootsLab(sorted([a, b])), value: sorted([a, b]), trapExplanation: r`$x ${a < 0 ? '-' : '+'} ${Math.abs(a)} = 0$ gives $x = ${-a}$: the root has the opposite sign.` },
          { id: 'c', label: rootsLab(sorted([a, -b])), value: sorted([a, -b]), trapExplanation: r`Treat both brackets the same way: $x = ${-a}$ from the first, $x = ${-b}$ from the second.` },
          { id: 'd', label: rootsLab(sorted([-a, b])), value: sorted([-a, b]), trapExplanation: r`The second bracket is zero at $x = ${-b}$.` },
        ],
        stepByStepSolution: [
          r`A product is zero exactly when one of its factors is zero.`,
          r`$x ${a < 0 ? '-' : '+'} ${Math.abs(a)} = 0$ gives $x = ${-a}$; $x ${b < 0 ? '-' : '+'} ${Math.abs(b)} = 0$ gives $x = ${-b}$.`,
          r`Solutions: $x = ${-a}$ and $x = ${-b}$.`,
        ],
      };
    },
  },
  {
    id: 'sm-02-x2',
    difficulty: 1,
    keyConceptTag: 'Counting real roots',
    correctOptionId: 'a',
    generate: (g) => {
      const kind = g.int(0, 2); // 0: D < 0, 1: D = 0, 2: D > 0
      const { b, c } = g.until(
        () => {
          const b = g.nonzero(-8, 8);
          const c = kind === 1 ? (b % 2 === 0 ? (b * b) / 4 : 0) : g.nonzero(-12, 16);
          return { b, c };
        },
        ({ b, c }) => (kind === 1 ? b % 2 === 0 : Math.sign(b * b - 4 * c) === (kind === 0 ? -1 : 1)),
      );
      const D = b * b - 4 * c;
      const n = D > 0 ? 2 : D === 0 ? 1 : 0;
      const names = ['None', 'Exactly one', 'Two', 'Infinitely many'];
      const others = [0, 1, 2, 3].filter((x) => x !== n);
      const why: Record<number, string> = {
        0: r`No real root needs $D < 0$; here $D = ${D}$.`,
        1: r`A single (double) root needs $D = 0$; here $D = ${D}$.`,
        2: r`Two real roots need $D > 0$; here $D = ${D}$.`,
        3: r`A quadratic equation never has infinitely many roots: at most two.`,
      };
      return {
        params: { b, c },
        promptText: r`How many real solutions does $${poly([c, b, 1])} = 0$ have?`,
        options: [
          { id: 'a', label: names[n], value: n },
          ...others.map((x, i) => ({ id: 'bcd'[i], label: names[x], value: x === 3 ? -1 : x, trapExplanation: why[x] })),
        ],
        stepByStepSolution: [
          r`$D = b^2 - 4ac = ${paren(b)}^2 - 4\cdot1\cdot${paren(c)}$.`,
          r`$D = ${D}$.`,
          D > 0 ? r`$D > 0$: two real solutions.` : D === 0 ? r`$D = 0$: exactly one (double) solution, $x = ${-b / 2}$.` : r`$D < 0$: no real solution (two complex ones).`,
        ],
      };
    },
  },
  {
    id: 'sm-02-x3',
    difficulty: 1,
    keyConceptTag: 'Solving x² = k',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.int(3, 12); // for n = 2, k/2 = n and two options coincide
      const k = n * n;
      return {
        params: { k },
        promptText: r`Solve $x^2 = ${k}$.`,
        options: [
          { id: 'a', label: rootsLab([-n, n]), value: [-n, n] },
          { id: 'b', label: r`$x = ${n}$ only`, value: [n], trapExplanation: r`$(-${n})^2 = ${k}$ as well: a square hides the sign, so there are two solutions.` },
          { id: 'c', label: rootsLab([-k / 2, k / 2], (x) => (Number.isInteger(x) ? `${x}` : frac(2 * x, 2))), value: [-k / 2, k / 2], trapExplanation: r`Undoing a square means taking a square root, not halving.` },
          { id: 'd', label: rootsLab([-k, k]), value: [-k, k], trapExplanation: r`$${k}^2 = ${k * k}$, not ${k}. Take the square root of ${k}.` },
        ],
        stepByStepSolution: [r`$x^2 = ${k}$ means $x$ is a number whose square is ${k}.`, r`$\sqrt{${k}} = ${n}$, and $(-${n})^2 = ${k}$ too.`, r`$x = ${n}$ or $x = -${n}$.`],
      };
    },
  },
  {
    id: 'sm-02-x4',
    difficulty: 2,
    keyConceptTag: 'Factoring a quadratic',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q } = g.until(
        () => ({ p: g.nonzero(-9, 9), q: g.nonzero(-9, 9) }),
        ({ p, q }) => p < q && p * q !== 1 && allDistinct([sorted([p, q]), sorted([-p, -q]), sorted([p, -q]), sorted([1, p * q])].map(String)),
      );
      const lab = ([u, v]: number[]) => `$${bracket(u)}${bracket(v)}$`;
      return {
        params: { p, q },
        promptText: r`Which product equals $${poly([p * q, p + q, 1])}$?`,
        options: [
          { id: 'a', label: lab([p, q]), value: [p, q] },
          { id: 'b', label: lab(sorted([-p, -q])), value: sorted([-p, -q]), trapExplanation: r`Expanding gives $${poly([p * q, -(p + q), 1])}$: the middle term has the wrong sign.` },
          { id: 'c', label: lab(sorted([p, -q])), value: sorted([p, -q]), trapExplanation: r`The constant term would be $${-p * q}$, not $${p * q}$.` },
          { id: 'd', label: lab(sorted([1, p * q])), value: sorted([1, p * q]), trapExplanation: r`The product is right, but the middle term would be $${1 + p * q}x$, not $${p + q}x$.` },
        ],
        stepByStepSolution: [
          r`Find two numbers with product ${p * q} and sum ${p + q}.`,
          r`$${paren(p)}\cdot${paren(q)} = ${p * q}$ and $${paren(p)} + ${paren(q)} = ${p + q}$.`,
          r`So $${poly([p * q, p + q, 1])} = ${bracket(p)}${bracket(q)}$.`,
        ],
      };
    },
  },
  {
    id: 'sm-02-x5',
    difficulty: 2,
    keyConceptTag: "Vieta's formulas",
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c } = g.until(
        () => ({ a: g.int(2, 5), b: g.nonzero(-9, 9), c: g.nonzero(-9, 9) }),
        ({ a, b, c }) => allDistinct([c / a, -c / a, -b / a, c].map((x) => Math.round(x * 1e6))),
      );
      return {
        params: { a, b, c },
        promptText: r`The equation $${poly([c, b, a])} = 0$ has two roots $x_1$, $x_2$. What is $x_1x_2$?`,
        options: [
          { id: 'a', label: `$${frac(c, a)}$`, value: c / a },
          { id: 'b', label: `$${frac(-c, a)}$`, value: -c / a, trapExplanation: r`The minus sign belongs to the <i>sum</i>, $-\frac ba$. The product is $\frac ca$.` },
          { id: 'c', label: `$${frac(-b, a)}$`, value: -b / a, trapExplanation: r`$-\frac ba$ is the sum $x_1 + x_2$, not the product.` },
          { id: 'd', label: `$${c}$`, value: c, trapExplanation: r`$c$ is the product only when $a = 1$; here divide by $a = ${a}$.` },
        ],
        stepByStepSolution: [r`Vieta: $x_1x_2 = \frac ca$.`, r`$c = ${c}$, $a = ${a}$.`, r`$x_1x_2 = ${frac(c, a)}$.`],
      };
    },
  },
  {
    id: 'sm-02-x6',
    difficulty: 2,
    keyConceptTag: 'The vertex of a parabola',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c } = g.until(
        () => ({ a: g.nonzero(-4, 4), b: g.nonzero(-12, 12), c: g.int(-9, 9) }),
        ({ a, b, c }) => allDistinct([-b / (2 * a), b / (2 * a), -b / a, c].map((x) => Math.round(x * 1e6))),
      );
      return {
        params: { a, b, c },
        promptText: r`At which $x$ is the vertex of the parabola $y = ${poly([c, b, a])}$?`,
        options: [
          { id: 'a', label: `$x = ${frac(-b, 2 * a)}$`, value: -b / (2 * a) },
          { id: 'b', label: `$x = ${frac(b, 2 * a)}$`, value: b / (2 * a), trapExplanation: r`The formula has a minus sign: $x = -\frac{b}{2a}$.` },
          { id: 'c', label: `$x = ${frac(-b, a)}$`, value: -b / a, trapExplanation: r`The denominator is $2a$; $-\frac ba$ is the sum of the roots, twice the vertex.` },
          { id: 'd', label: `$x = ${c}$`, value: c, trapExplanation: r`$c$ is the height where the parabola meets the $y$-axis, not the position of the vertex.` },
        ],
        stepByStepSolution: [r`$x_{\text{vertex}} = -\frac{b}{2a}$.`, r`$a = ${a}$, $b = ${b}$: $-\frac{${b}}{${2 * a}}$.`, r`$x = ${frac(-b, 2 * a)}$.`],
      };
    },
  },
];
