import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, frac, poly } from '../gen.ts';

const r6 = (x: number) => Math.round(x * 1e6) / 1e6;

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'sm-01-x1',
    difficulty: 1,
    keyConceptTag: 'Multiplying fractions',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c, d } = g.until(
        () => ({ a: g.int(1, 9), b: g.int(2, 9), c: g.int(1, 9), d: g.int(2, 9) }),
        ({ a, b, c, d }) => allDistinct([(a * c) / (b * d), (a + c) / (b + d), (a * d) / (b * c), (a * c) / (b + d)].map(r6)),
      );
      return {
        params: { a, b, c, d },
        promptText: r`Compute $\frac{${a}}{${b}} \cdot \frac{${c}}{${d}}$.`,
        options: [
          { id: 'a', label: `$${frac(a * c, b * d)}$`, value: (a * c) / (b * d) },
          { id: 'b', label: `$${frac(a + c, b + d)}$`, value: (a + c) / (b + d), trapExplanation: r`Multiplying fractions multiplies tops and bottoms; nothing is added.` },
          { id: 'c', label: `$${frac(a * d, b * c)}$`, value: (a * d) / (b * c), trapExplanation: r`That divides by $\frac{${c}}{${d}}$. Multiplication needs no flipping.` },
          { id: 'd', label: `$${frac(a * c, b + d)}$`, value: (a * c) / (b + d), trapExplanation: r`The bottoms multiply as well: $${b}\cdot${d} = ${b * d}$.` },
        ],
        stepByStepSolution: [
          r`Tops: $${a}\cdot${c} = ${a * c}$.`,
          r`Bottoms: $${b}\cdot${d} = ${b * d}$.`,
          r`$\frac{${a * c}}{${b * d}} = ${frac(a * c, b * d)}$.`,
        ],
      };
    },
  },
  {
    id: 'sm-01-x2',
    difficulty: 1,
    keyConceptTag: 'Negative exponents',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, n } = g.until(() => ({ a: g.int(2, 5), n: g.int(2, 3) }), ({ a, n }) => allDistinct([1 / a ** n, -(a ** n), -a * n, 1 / (a * n)].map(r6)));
      return {
        params: { a, n },
        promptText: r`What is $${a}^{-${n}}$?`,
        options: [
          { id: 'a', label: `$${frac(1, a ** n)}$`, value: 1 / a ** n },
          { id: 'b', label: `$${-(a ** n)}$`, value: -(a ** n), trapExplanation: r`A negative exponent does not make the number negative; it means "one over".` },
          { id: 'c', label: `$${-a * n}$`, value: -a * n, trapExplanation: r`A power is not a product of base and exponent.` },
          { id: 'd', label: `$${frac(1, a * n)}$`, value: 1 / (a * n), trapExplanation: r`"One over" is right, but below goes $${a}^{${n}} = ${a ** n}$, not $${a}\cdot${n}$.` },
        ],
        stepByStepSolution: [r`$a^{-n} = \frac{1}{a^n}$.`, r`$${a}^{${n}} = ${a ** n}$.`, r`So $${a}^{-${n}} = ${frac(1, a ** n)}$.`],
      };
    },
  },
  {
    id: 'sm-01-x3',
    difficulty: 1,
    keyConceptTag: 'A power of a power',
    correctOptionId: 'a',
    generate: (g) => {
      const { m, n } = g.until(() => ({ m: g.int(2, 5), n: g.int(2, 4) }), ({ m, n }) => m !== n && allDistinct([m * n, m + n, m - n, m ** n]));
      return {
        params: { m, n },
        promptText: r`Simplify $(x^{${m}})^{${n}}$.`,
        options: [
          { id: 'a', label: `$x^{${m * n}}$`, value: m * n },
          { id: 'b', label: `$x^{${m + n}}$`, value: m + n, trapExplanation: r`Adding exponents is the rule for $x^{${m}}\cdot x^{${n}}$. Here $x^{${m}}$ is multiplied by itself ${n} times.` },
          { id: 'c', label: `$x^{${m - n}}$`, value: m - n, trapExplanation: r`Subtracting exponents is the rule for division.` },
          { id: 'd', label: `$x^{${m ** n}}$`, value: m ** n, trapExplanation: r`The exponents multiply; they are not raised to each other: ${n} copies of $x^{${m}}$ give $${n}\cdot${m}$ factors of $x$.` },
        ],
        stepByStepSolution: [
          r`$(x^{${m}})^{${n}}$ is ${n} factors of $x^{${m}}$.`,
          r`Each has ${m} factors of $x$: $${n}\cdot${m} = ${m * n}$ in total.`,
          r`$(x^{${m}})^{${n}} = x^{${m * n}}$.`,
        ],
      };
    },
  },
  {
    id: 'sm-01-x4',
    difficulty: 2,
    keyConceptTag: 'Simplifying square roots',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, k } = g.until(() => ({ a: g.int(2, 6), k: g.pick([2, 3, 5, 6, 7]) }), ({ a, k }) => allDistinct([a * Math.sqrt(k), a * a * Math.sqrt(k), Math.sqrt(a * k), k * Math.sqrt(a)].map(r6)));
      return {
        params: { a, k },
        promptText: r`Simplify $\sqrt{${a * a * k}}$.`,
        options: [
          { id: 'a', label: r`$${a}\sqrt{${k}}$`, value: a * Math.sqrt(k) },
          { id: 'b', label: r`$${a * a}\sqrt{${k}}$`, value: a * a * Math.sqrt(k), trapExplanation: r`The root of $${a * a}$ comes out as ${a}, not as ${a * a}.` },
          { id: 'c', label: r`$\sqrt{${a * k}}$`, value: Math.sqrt(a * k), trapExplanation: r`$${a * a * k} = ${a * a}\cdot${k}$, not $${a}\cdot${k}$. Find the square factor ${a * a}.` },
          { id: 'd', label: r`$${k}\sqrt{${a}}$`, value: k * Math.sqrt(a), trapExplanation: r`Only the square factor ${a * a} leaves the root; ${k} stays inside.` },
        ],
        stepByStepSolution: [r`Find the largest square factor: $${a * a * k} = ${a * a}\cdot${k}$.`, r`$\sqrt{${a * a}\cdot${k}} = \sqrt{${a * a}}\,\sqrt{${k}}$.`, r`$= ${a}\sqrt{${k}}$.`],
      };
    },
  },
  {
    id: 'sm-01-x5',
    difficulty: 2,
    keyConceptTag: 'Squaring a bracket',
    correctOptionId: 'a',
    generate: (g) => {
      const a = g.until(() => g.nonzero(-9, 9), (a) => a !== 2); // for a = 2, a² = 2a and two options coincide
      const s = a < 0 ? '-' : '+';
      return {
        params: { a },
        promptText: r`Expand $(x ${s} ${Math.abs(a)})^2$.`,
        options: [
          { id: 'a', label: `$${poly([a * a, 2 * a, 1])}$`, value: [a * a, 2 * a, 1] },
          { id: 'b', label: `$${poly([a * a, 0, 1])}$`, value: [a * a, 0, 1], trapExplanation: r`$(a + b)^2 \ne a^2 + b^2$: the two cross terms $${a}x$ are missing.` },
          { id: 'c', label: `$${poly([a * a, a, 1])}$`, value: [a * a, a, 1], trapExplanation: r`The cross term appears twice: $(x ${s} ${Math.abs(a)})(x ${s} ${Math.abs(a)})$ gives $${a}x$ from each side.` },
          { id: 'd', label: `$${poly([2 * a, 2 * a, 1])}$`, value: [2 * a, 2 * a, 1], trapExplanation: r`The constant is $(${a})^2 = ${a * a}$, not $2\cdot${a < 0 ? `(${a})` : a}$.` },
        ],
        stepByStepSolution: [
          r`$(x ${s} ${Math.abs(a)})^2 = (x ${s} ${Math.abs(a)})(x ${s} ${Math.abs(a)})$: every term times every term.`,
          r`$x\cdot x = x^2$, two cross terms $${a < 0 ? `(${a})` : a}x$ each, and $${a < 0 ? `(${a})` : a}^2 = ${a * a}$.`,
          r`$${poly([a * a, 2 * a, 1])}$.`,
        ],
      };
    },
  },
  {
    id: 'sm-01-x6',
    difficulty: 2,
    keyConceptTag: 'Difference of squares',
    correctOptionId: 'a',
    generate: (g) => {
      const { m, n } = g.until(
        () => {
          const c = g.pick([20, 30, 40, 50, 60, 70, 80, 100]);
          const h = g.int(1, 3);
          return { m: c + h, n: c - h };
        },
        ({ m, n }) => allDistinct([m * m - n * n, (m - n) ** 2, m + n, (m - n) * m]),
      );
      return {
        params: { m, n },
        promptText: r`Compute $${m}^2 - ${n}^2$ without a calculator.`,
        options: [
          { id: 'a', label: `$${m * m - n * n}$`, value: m * m - n * n },
          { id: 'b', label: `$${(m - n) ** 2}$`, value: (m - n) ** 2, trapExplanation: r`$a^2 - b^2 \ne (a - b)^2$. Use $a^2 - b^2 = (a - b)(a + b)$.` },
          { id: 'c', label: `$${m + n}$`, value: m + n, trapExplanation: r`That is only the factor $a + b$; it still has to be multiplied by $a - b = ${m - n}$.` },
          { id: 'd', label: `$${(m - n) * m}$`, value: (m - n) * m, trapExplanation: r`The second factor is the sum $${m} + ${n} = ${m + n}$, not ${m} alone.` },
        ],
        stepByStepSolution: [r`$a^2 - b^2 = (a - b)(a + b)$.`, r`$(${m} - ${n})(${m} + ${n}) = ${m - n}\cdot${m + n}$.`, r`$= ${m * m - n * n}$.`],
      };
    },
  },
];
