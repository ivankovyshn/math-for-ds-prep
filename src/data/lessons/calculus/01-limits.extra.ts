import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, frac, paren, poly } from '../gen.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'ca-01-x1',
    difficulty: 1,
    keyConceptTag: 'Limits of polynomials by substitution',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q, a } = g.until(
        () => ({ p: g.nonzero(-6, 6), q: g.nonzero(-9, 9), a: g.nonzero(-4, 5) }),
        ({ p, q, a }) => allDistinct([p * a + q, p + q, p * a, q]),
      );
      return {
        params: { cs: [q, p], a },
        promptText: r`Find $\displaystyle\lim_{x\to${a}} (${poly([q, p])})$.`,
        options: [
          { id: 'a', label: `$${p * a + q}$`, value: p * a + q },
          { id: 'b', label: `$${p + q}$`, value: p + q, trapExplanation: r`That substitutes $x = 1$. The limit is taken at $x = ${a}$.` },
          { id: 'c', label: `$${p * a}$`, value: p * a, trapExplanation: r`The constant $${q}$ does not disappear in a limit.` },
          { id: 'd', label: `$${q}$`, value: q, trapExplanation: r`That is the value at $x = 0$.` },
        ],
        stepByStepSolution: [
          r`A polynomial is continuous: substitute $x = ${a}$.`,
          r`$${p}\cdot${paren(a)} + ${paren(q)}$.`,
          r`$= ${p * a + q}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-01-x2',
    difficulty: 1,
    keyConceptTag: 'Limits at infinity',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, c, q, d } = g.until(
        () => ({ p: g.nonzero(-7, 7), c: g.nonzero(-9, 9), q: g.nonzero(-7, 7), d: g.nonzero(-9, 9) }),
        ({ p, c, q, d }) => Math.abs(p) !== Math.abs(q) && allDistinct([p / q, c / d, 0, q / p]),
      );
      return {
        params: { num: [c, p], den: [d, q] },
        promptText: r`Find $\displaystyle\lim_{x\to\infty} \frac{${poly([c, p])}}{${poly([d, q])}}$.`,
        options: [
          { id: 'a', label: `$${frac(p, q)}$`, value: p / q },
          { id: 'b', label: `$${frac(c, d)}$`, value: c / d, trapExplanation: r`That is the value at $x = 0$. For huge $x$ the terms with $x$ dominate.` },
          { id: 'c', label: '$0$', value: 0, trapExplanation: r`Both top and bottom grow like $x$, so the ratio settles at a non-zero number.` },
          { id: 'd', label: `$${frac(q, p)}$`, value: q / p, trapExplanation: r`Upside down: numerator's coefficient over denominator's.` },
        ],
        stepByStepSolution: [
          r`Divide top and bottom by $x$: $\dfrac{${p} + ${paren(c)}/x}{${q} + ${paren(d)}/x}$.`,
          r`As $x \to \infty$, $\frac{${c}}{x} \to 0$ and $\frac{${d}}{x} \to 0$.`,
          r`The limit is $${frac(p, q)}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-01-x3',
    difficulty: 1,
    keyConceptTag: 'Limits of quotients',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q, a } = g.until(
        () => ({ p: g.nonzero(-6, 6), q: g.nonzero(-6, 6), a: g.nonzero(-4, 4) }),
        ({ p, q, a }) => a + q !== 0 && a + p !== 0 && allDistinct([(a + p) / (a + q), p / q, 1, (a + q) / (a + p)]),
      );
      return {
        params: { num: [p, 1], den: [q, 1], a },
        promptText: r`Find $\displaystyle\lim_{x\to${a}} \frac{${poly([p, 1])}}{${poly([q, 1])}}$.`,
        options: [
          { id: 'a', label: `$${frac(a + p, a + q)}$`, value: (a + p) / (a + q) },
          { id: 'b', label: `$${frac(p, q)}$`, value: p / q, trapExplanation: r`That is the value at $x = 0$, not at $x = ${a}$.` },
          { id: 'c', label: '$1$', value: 1, trapExplanation: r`The $x$'s cannot be cancelled: they are parts of sums, not factors.` },
          { id: 'd', label: `$${frac(a + q, a + p)}$`, value: (a + q) / (a + p), trapExplanation: r`Upside down: numerator over denominator.` },
        ],
        stepByStepSolution: [
          r`The denominator at $x = ${a}$ is $${a + q} \ne 0$, so substitution is allowed.`,
          r`$\dfrac{${a} + ${paren(p)}}{${a} + ${paren(q)}} = \dfrac{${a + p}}{${a + q}}$.`,
          r`$= ${frac(a + p, a + q)}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-01-x4',
    difficulty: 2,
    keyConceptTag: 'Cancelling a common factor',
    correctOptionId: 'a',
    generate: (g) => {
      const a = g.pick([-7, -6, -5, -4, -3, -2, 3, 4, 5, 6, 7]);
      return {
        params: { num: [-a * a, 0, 1], den: [-a, 1], a },
        promptText: r`Find $\displaystyle\lim_{x\to${a}} \frac{x^2 - ${a * a}}{${poly([-a, 1])}}$.`,
        options: [
          { id: 'a', label: `$${2 * a}$`, value: 2 * a },
          { id: 'b', label: '$0$', value: 0, trapExplanation: r`$\frac00$ is not 0. Factor $x^2 - ${a * a} = (${poly([-a, 1])})(${poly([a, 1])})$.` },
          { id: 'c', label: `$${a}$`, value: a, trapExplanation: r`After cancelling, $x ${a < 0 ? '-' : '+'} ${Math.abs(a)}$ remains; at $x = ${a}$ it is $${2 * a}$.` },
          { id: 'd', label: `$${a * a}$`, value: a * a, trapExplanation: r`Difference of squares: $x^2 - ${a * a} = (${poly([-a, 1])})(${poly([a, 1])})$, and the limit is the second factor at $x = ${a}$.` },
        ],
        stepByStepSolution: [
          r`$x^2 - ${a * a} = (${poly([-a, 1])})(${poly([a, 1])})$.`,
          r`For $x \ne ${a}$ the fraction equals $${poly([a, 1])}$.`,
          r`Limit: $${a} + ${paren(a)} = ${2 * a}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-01-x5',
    difficulty: 2,
    keyConceptTag: 'The limit sin x / x',
    correctOptionId: 'a',
    generate: (g) => {
      const k = g.pick([-6, -5, -4, -3, -2, 2, 3, 4, 5, 6]);
      return {
        params: { k, m: 1 },
        promptText: r`Find $\displaystyle\lim_{x\to0} \frac{\sin(${k}x)}{x}$.`,
        options: [
          { id: 'a', label: `$${k}$`, value: k },
          { id: 'b', label: '$1$', value: 1, trapExplanation: r`$\frac{\sin u}{u} \to 1$ needs the same $u$ in the denominator: here the angle is $${k}x$.` },
          { id: 'c', label: `$${frac(1, k)}$`, value: 1 / k, trapExplanation: r`Upside down: $\frac{\sin(${k}x)}{x} = ${k}\cdot\frac{\sin(${k}x)}{${k}x}$.` },
          { id: 'd', label: '$0$', value: 0, trapExplanation: r`$\sin(${k}x) \to 0$ but so does $x$: the form $\frac00$ is not 0.` },
        ],
        stepByStepSolution: [
          r`$\dfrac{\sin(${k}x)}{x} = ${k}\cdot\dfrac{\sin(${k}x)}{${k}x}$.`,
          r`With $u = ${k}x \to 0$, $\frac{\sin u}{u} \to 1$.`,
          r`The limit is $${k}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-01-x6',
    difficulty: 2,
    keyConceptTag: 'Continuity of a piecewise function',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q, a } = g.until(
        () => ({ p: g.nonzero(-5, 5), q: g.nonzero(-6, 6), a: g.pick([-3, -2, 2, 3, 4]) }),
        ({ p, q, a }) => allDistinct([p * a + q, q, p * a, p + q]),
      );
      return {
        params: { cs: [q, p], a },
        promptText: r`$f(x) = ${poly([q, p])}$ for $x < ${a}$ and $f(x) = c$ for $x \ge ${a}$. Which $c$ makes $f$ continuous?`,
        options: [
          { id: 'a', label: `$c = ${p * a + q}$`, value: p * a + q },
          { id: 'b', label: `$c = ${q}$`, value: q, trapExplanation: r`That is the left piece at $x = 0$. The pieces must meet at $x = ${a}$.` },
          { id: 'c', label: `$c = ${p * a}$`, value: p * a, trapExplanation: r`The constant $${q}$ of the left piece was dropped.` },
          { id: 'd', label: `$c = ${p + q}$`, value: p + q, trapExplanation: r`That evaluates the left piece at $x = 1$ instead of $x = ${a}$.` },
        ],
        stepByStepSolution: [
          r`Continuity at $${a}$: the left limit must equal $f(${a}) = c$.`,
          r`Left limit: $${p}\cdot${paren(a)} + ${paren(q)} = ${p * a + q}$.`,
          r`So $c = ${p * a + q}$.`,
        ],
      };
    },
  },
];
