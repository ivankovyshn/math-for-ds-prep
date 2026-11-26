import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, coef, frac, paren, poly } from '../gen.ts';

/** "kx + d" with tidy signs, for a piece of a piecewise function. */
export const kxPlus = (k: string, d: number) => (d === 0 ? `${k}x` : `${k}x ${d < 0 ? '-' : '+'} ${Math.abs(d)}`);

export const practice: QuestionTemplate[] = [
  {
    id: 'ca-01-1',
    difficulty: 1,
    keyConceptTag: 'Limits of polynomials by substitution',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q, c, a } = g.until(
        () => ({ p: g.nonzero(-3, 3), q: g.nonzero(-5, 5), c: g.int(-6, 6), a: g.nonzero(-3, 3) }),
        ({ p, q, c, a }) => c !== 0 && allDistinct([p * a * a + q * a + c, 2 * p * a + q, p * a * a + q + c, p * a * a + q * a]),
      );
      const val = p * a * a + q * a + c;
      return {
        params: { cs: [c, q, p], a },
        promptText: r`Find $\displaystyle\lim_{x\to${a}} \big(${poly([c, q, p])}\big)$.`,
        options: [
          { id: 'a', label: `$${val}$`, value: val },
          { id: 'b', label: `$${2 * p * a + q}$`, value: 2 * p * a + q, trapExplanation: r`That is the derivative $${2 * p}x ${q < 0 ? '-' : '+'} ${Math.abs(q)}$ at $x = ${a}$, the slope. The limit of a polynomial is its value.` },
          { id: 'c', label: `$${p * a * a + q + c}$`, value: p * a * a + q + c, trapExplanation: r`The middle term is $${q}x$, so it contributes $${q}\cdot${paren(a)} = ${q * a}$, not $${q}$.` },
          { id: 'd', label: `$${p * a * a + q * a}$`, value: p * a * a + q * a, trapExplanation: r`The constant term $${c}$ is part of the polynomial too.` },
        ],
        stepByStepSolution: [
          r`Polynomials are continuous, so the limit is the value at $x = ${a}$.`,
          r`$${p}\cdot${paren(a)}^2 + ${paren(q)}\cdot${paren(a)} + ${paren(c)} = ${p * a * a} + ${paren(q * a)} + ${paren(c)}$.`,
          r`$= ${val}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-01-2',
    difficulty: 1,
    keyConceptTag: 'Cancelling a common factor',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(() => ({ a: g.nonzero(-5, 5), b: g.int(-5, 5) }), ({ a, b }) => allDistinct([a - b, 0, a + b, b - a]));
      const num = [a * b, -(a + b), 1];
      return {
        params: { num, den: [-a, 1], a },
        promptText: r`Find $\displaystyle\lim_{x\to${a}} \frac{${poly(num)}}{${poly([-a, 1])}}$.`,
        options: [
          { id: 'a', label: `$${a - b}$`, value: a - b },
          { id: 'b', label: '$0$', value: 0, trapExplanation: r`Substituting gives $\frac00$, which has no value at all — it is not 0. Factor the numerator and cancel $x ${a < 0 ? '+' : '-'} ${Math.abs(a)}$.` },
          { id: 'c', label: `$${a + b}$`, value: a + b, trapExplanation: r`The remaining factor is $${poly([-b, 1])}$; at $x = ${a}$ it equals $${a} - ${paren(b)} = ${a - b}$.` },
          { id: 'd', label: `$${b - a}$`, value: b - a, trapExplanation: r`Sign slip: the remaining factor is $x - ${paren(b)}$, evaluated at $x = ${a}$.` },
        ],
        stepByStepSolution: [
          r`At $x = ${a}$ both numerator and denominator are 0: the form $\frac00$.`,
          r`Factor: $${poly(num)} = (${poly([-a, 1])})(${poly([-b, 1])})$, so the fraction equals $${poly([-b, 1])}$ for $x \ne ${a}$.`,
          r`$\lim_{x\to${a}} (${poly([-b, 1])}) = ${a - b}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-01-3',
    difficulty: 2,
    keyConceptTag: 'Limits at infinity',
    correctOptionId: 'a',
    generate: (g) => {
      const { n, p, u, c, q, d } = g.until(
        () => ({ n: g.int(2, 3), p: g.nonzero(-6, 6), u: g.int(-5, 5), c: g.nonzero(-9, 9), q: g.nonzero(-6, 6), d: g.nonzero(-9, 9) }),
        ({ p, c, q, d }) => Math.abs(p) !== Math.abs(q) && allDistinct([p / q, c / d, 0, q / p]),
      );
      const num = Array(n + 1).fill(0);
      num[n] = p;
      num[1] = u;
      num[0] = c;
      const den = Array(n + 1).fill(0);
      den[n] = q;
      den[0] = d;
      return {
        params: { num, den },
        promptText: r`Find $\displaystyle\lim_{x\to\infty} \frac{${poly(num)}}{${poly(den)}}$.`,
        options: [
          { id: 'a', label: `$${frac(p, q)}$`, value: p / q },
          { id: 'b', label: `$${frac(c, d)}$`, value: c / d, trapExplanation: r`The constant terms decide the value at $x = 0$. As $x \to \infty$ the terms with $x^{${n}}$ dominate.` },
          { id: 'c', label: '$0$', value: 0, trapExplanation: r`The limit is 0 when the denominator has the higher degree. Here both have degree ${n}, so the leading coefficients decide.` },
          { id: 'd', label: `$${frac(q, p)}$`, value: q / p, trapExplanation: r`Upside down: it is numerator over denominator, $\frac{${p}}{${q}}$.` },
        ],
        stepByStepSolution: [
          r`Divide the numerator and the denominator by $x^{${n}}$.`,
          r`Every term except the leading ones becomes a constant over a power of $x$, which tends to 0.`,
          r`What remains is $\frac{${p}}{${q}} = ${frac(p, q)}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-01-4',
    difficulty: 2,
    keyConceptTag: 'The limit sin x / x',
    correctOptionId: 'a',
    generate: (g) => {
      const { k, m } = g.until(() => ({ k: g.nonzero(-5, 6), m: g.nonzero(-5, 6) }), ({ k, m }) => Math.abs(k) !== Math.abs(m) && Math.abs(k) !== 1);
      return {
        params: { k, m },
        promptText: r`Find $\displaystyle\lim_{x\to0} \frac{\sin(${k}x)}{${m === 1 ? '' : m === -1 ? '-' : m}x}$.`,
        options: [
          { id: 'a', label: `$${frac(k, m)}$`, value: k / m },
          { id: 'b', label: '$1$', value: 1, trapExplanation: r`$\frac{\sin u}{u} \to 1$ needs the <i>same</i> $u$ on top and bottom. Here the angle is $${k}x$ but the denominator is $${m}x$.` },
          { id: 'c', label: `$${frac(m, k)}$`, value: m / k, trapExplanation: r`Upside down. Write it as $\frac{${k}}{${m}}\cdot\frac{\sin(${k}x)}{${k}x}$.` },
          { id: 'd', label: '$0$', value: 0, trapExplanation: r`Both the top and the bottom tend to 0; the form $\frac00$ needs work, and here the answer is not 0.` },
        ],
        stepByStepSolution: [
          r`Make the denominator match the angle: $\dfrac{\sin(${k}x)}{${m}x} = \dfrac{${k}}{${m}}\cdot\dfrac{\sin(${k}x)}{${k}x}$.`,
          r`With $u = ${k}x \to 0$: $\frac{\sin u}{u} \to 1$.`,
          r`The limit is $${frac(k, m)}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-01-5',
    difficulty: 3,
    keyConceptTag: 'Continuity of a piecewise function',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, k, d } = g.until(
        () => ({ a: g.pick([1, 2, 3, -1, -2]), k: g.nonzero(-4, 5), d: g.nonzero(-5, 5) }),
        ({ a, k, d }) => {
          const c = k * a + d - a * a;
          return allDistinct([k, (a * a + c) / a, 2 * a, (a * a + c + d) / a]) && Math.abs(c) <= 15;
        },
      );
      const c = k * a + d - a * a;
      const left = a * a + c;
      return {
        params: { a, c, d },
        promptText: r`$f(x) = ${poly([c, 0, 1])}$ for $x < ${a}$ and $f(x) = ${kxPlus('k', d)}$ for $x \ge ${a}$. For which $k$ is $f$ continuous at $x = ${a}$?`,
        options: [
          { id: 'a', label: `$k = ${k}$`, value: k },
          { id: 'b', label: `$k = ${frac(left, a)}$`, value: left / a, trapExplanation: r`That solves $${coef(a)}k = ${left}$ and forgets the constant: the right piece at $x = ${a}$ is $${coef(a)}k ${d < 0 ? '-' : '+'} ${Math.abs(d)}$.` },
          { id: 'c', label: `$k = ${2 * a}$`, value: 2 * a, trapExplanation: r`That matches the <i>slopes</i> ($2x = ${2 * a}$ at $x = ${a}$), which is about differentiability. Continuity only needs the values to meet.` },
          { id: 'd', label: `$k = ${frac(left + d, a)}$`, value: (left + d) / a, trapExplanation: r`Sign slip when moving $${d}$ to the other side: $${coef(a)}k = ${left} - ${paren(d)}$.` },
        ],
        stepByStepSolution: [
          r`Left limit at $${a}$: $${paren(a)}^2 ${c < 0 ? '-' : '+'} ${Math.abs(c)} = ${left}$. Value: $f(${a}) = ${coef(a)}k ${d < 0 ? '-' : '+'} ${Math.abs(d)}$.`,
          r`Continuity: $${coef(a)}k ${d < 0 ? '-' : '+'} ${Math.abs(d)} = ${left}$, so $${coef(a)}k = ${left - d}$.`,
          r`$k = ${k}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-01-6',
    difficulty: 3,
    keyConceptTag: 'Limits with square roots',
    correctOptionId: 'a',
    generate: (g) => {
      const a = g.int(2, 6);
      const k = g.int(2, 5);
      return {
        params: { a, k },
        promptText: r`Find $\displaystyle\lim_{x\to0} \frac{\sqrt{${k}x + ${a * a}} - ${a}}{x}$.`,
        options: [
          { id: 'a', label: `$${frac(k, 2 * a)}$`, value: k / (2 * a) },
          { id: 'b', label: '$0$', value: 0, trapExplanation: r`Substitution gives $\frac00$, which is not 0. Multiply by the conjugate first.` },
          { id: 'c', label: `$${frac(k, a)}$`, value: k / a, trapExplanation: r`After the conjugate the denominator is $\sqrt{${k}x + ${a * a}} + ${a} \to ${2 * a}$, not ${a}.` },
          { id: 'd', label: `$${frac(1, 2 * a)}$`, value: 1 / (2 * a), trapExplanation: r`The numerator becomes $(${k}x + ${a * a}) - ${a * a} = ${k}x$: the factor ${k} stays.` },
        ],
        stepByStepSolution: [
          r`Multiply top and bottom by $\sqrt{${k}x + ${a * a}} + ${a}$: the numerator becomes $${k}x + ${a * a} - ${a * a} = ${k}x$.`,
          r`So the fraction equals $\dfrac{${k}}{\sqrt{${k}x + ${a * a}} + ${a}}$ for $x \ne 0$.`,
          r`At $x = 0$: $\frac{${k}}{${a} + ${a}} = ${frac(k, 2 * a)}$.`,
        ],
      };
    },
  },
];
