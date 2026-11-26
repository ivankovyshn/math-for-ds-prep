import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, binomial, coef, dec, factorial, frac, fracPoly, paren } from '../gen.ts';

/** "s + \tfrac{1}{10}" style: an integer plus or minus a fraction. */
export const plusFrac = (s: number, n: number, d: number) => `${s} ${n < 0 ? '-' : '+'} ${frac(Math.abs(n), d)}`;

export const practice: QuestionTemplate[] = [
  {
    id: 'ca-03-1',
    difficulty: 1,
    keyConceptTag: 'Linear approximation',
    correctOptionId: 'a',
    generate: (g) => {
      const s = g.int(3, 10);
      const d = g.pick([-3, -2, -1, 1, 2, 3]);
      return {
        params: { s, d },
        promptText: r`Use the linear approximation of $\sqrt{x}$ at $x = ${s * s}$ to estimate $\sqrt{${s * s + d}}$.`,
        options: [
          { id: 'a', label: `$${plusFrac(s, d, 2 * s)}$`, value: s + d / (2 * s) },
          { id: 'b', label: `$${plusFrac(s, d, s)}$`, value: s + d / s, trapExplanation: r`$(\sqrt x)' = \frac{1}{2\sqrt x}$: the slope at $${s * s}$ is $\frac{1}{${2 * s}}$, not $\frac{1}{${s}}$.` },
          { id: 'c', label: `$${plusFrac(s, d, 2)}$`, value: s + d / 2, trapExplanation: r`The slope is $\frac{1}{2\sqrt{${s * s}}} = \frac{1}{${2 * s}}$; the square root belongs in the denominator.` },
          { id: 'd', label: `$${s + d}$`, value: s + d, trapExplanation: r`The change $h = ${d}$ must be multiplied by the slope $f'(${s * s}) = \frac{1}{${2 * s}}$.` },
        ],
        stepByStepSolution: [
          r`$f(x) = \sqrt x$, $a = ${s * s}$, $h = ${d}$: $f(a) = ${s}$ and $f'(a) = \frac{1}{2\sqrt{a}} = \frac{1}{${2 * s}}$.`,
          r`$\sqrt{${s * s + d}} \approx ${s} + \frac{1}{${2 * s}}\cdot${paren(d)}$.`,
          r`$= ${plusFrac(s, d, 2 * s)} \approx ${dec(Math.round((s + d / (2 * s)) * 1e4) / 1e4)}$ (true value $${dec(Math.round(Math.sqrt(s * s + d) * 1e4) / 1e4)}$).`,
        ],
      };
    },
  },
  {
    id: 'ca-03-2',
    difficulty: 1,
    keyConceptTag: 'Taylor coefficients of e^(kx)',
    correctOptionId: 'a',
    generate: (g) => {
      const { k, n } = g.until(
        () => ({ k: g.pick([-3, -2, 2, 3]), n: g.int(2, 4) }),
        ({ k, n }) => allDistinct([k ** n / factorial(n), k ** n, k / factorial(n), 1 / factorial(n)]),
      );
      const nf = factorial(n);
      return {
        params: { k, n },
        promptText: r`What is the coefficient of $x^{${n}}$ in the Taylor series of $e^{${k}x}$ at 0?`,
        options: [
          { id: 'a', label: `$${frac(k ** n, nf)}$`, value: k ** n / nf },
          { id: 'b', label: `$${k ** n}$`, value: k ** n, trapExplanation: r`$${k ** n}$ is the ${n}th derivative at 0; the coefficient divides it by $${n}! = ${nf}$.` },
          { id: 'c', label: `$${frac(k, nf)}$`, value: k / nf, trapExplanation: r`Substituting $u = ${k}x$ into $\frac{u^{${n}}}{${n}!}$ raises ${k} to the power ${n} as well.` },
          { id: 'd', label: `$${frac(1, nf)}$`, value: 1 / nf, trapExplanation: r`That is the coefficient for $e^x$. With $e^{${k}x}$ every $x$ comes with a factor ${k}.` },
        ],
        stepByStepSolution: [
          r`Substitute $u = ${k}x$ into $e^u = \sum \frac{u^m}{m!}$.`,
          r`The $x^{${n}}$ term is $\frac{(${k}x)^{${n}}}{${n}!} = \frac{${k ** n}}{${nf}}x^{${n}}$.`,
          r`Coefficient: $${frac(k ** n, nf)}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-03-3',
    difficulty: 2,
    keyConceptTag: 'Geometric series by substitution',
    correctOptionId: 'a',
    generate: (g) => {
      const k = g.pick([-3, -2, 2, 3]);
      const T = (cs: number[][]) => `$${fracPoly(cs)}$`;
      return {
        params: { k },
        promptText: r`What is the Taylor polynomial of degree 2 of $f(x) = \dfrac{1}{1 ${k < 0 ? '+' : '-'} ${coef(Math.abs(k))}x}$ at 0?`,
        options: [
          { id: 'a', label: T([[1, 1], [k, 1], [k * k, 1]]), value: [1, k, k * k] },
          { id: 'b', label: T([[1, 1], [k, 1], [k * k, 2]]), value: [1, k, (k * k) / 2], trapExplanation: r`$\frac{1}{1 - u} = 1 + u + u^2 + \dots$ has all coefficients 1: there are no factorials in this series.` },
          { id: 'c', label: T([[1, 1], [-k, 1], [k * k, 1]]), value: [1, -k, k * k], trapExplanation: r`Sign slip: here $u = ${k}x$, so the linear term is $${k}x$.` },
          { id: 'd', label: T([[1, 1], [1, 1], [1, 1]]), value: [1, 1, 1], trapExplanation: r`That is the series of $\frac{1}{1 - x}$. Substitute $u = ${k}x$.` },
        ],
        stepByStepSolution: [
          r`$\frac{1}{1 - u} = 1 + u + u^2 + \dots$ with $u = ${k}x$.`,
          r`$1 + ${paren(k)}x + (${k}x)^2 + \dots$`,
          r`$T_2(x) = ${fracPoly([[1, 1], [k, 1], [k * k, 1]])}$ (valid for $|${k}x| < 1$).`,
        ],
      };
    },
  },
  {
    id: 'ca-03-4',
    difficulty: 2,
    keyConceptTag: 'Taylor series of sine',
    correctOptionId: 'a',
    generate: (g) => {
      const k = g.pick([-3, -2, 2, 3, 4]);
      return {
        params: { k },
        promptText: r`What is the coefficient of $x^3$ in the Taylor series of $\sin(${k}x)$ at 0?`,
        options: [
          { id: 'a', label: `$${frac(-(k ** 3), 6)}$`, value: -(k ** 3) / 6 },
          { id: 'b', label: `$${frac(k ** 3, 6)}$`, value: k ** 3 / 6, trapExplanation: r`$\sin u = u - \frac{u^3}{6} + \dots$: the cubic term has a minus sign.` },
          { id: 'c', label: `$${-(k ** 3)}$`, value: -(k ** 3), trapExplanation: r`Divide by $3! = 6$.` },
          { id: 'd', label: `$${frac(-k, 6)}$`, value: -k / 6, trapExplanation: r`$(${k}x)^3 = ${k ** 3}x^3$: the factor ${k} is cubed as well.` },
        ],
        stepByStepSolution: [
          r`$\sin u = u - \frac{u^3}{3!} + \dots$ with $u = ${k}x$.`,
          r`The cubic term is $-\frac{(${k}x)^3}{6} = -\frac{${k ** 3}}{6}x^3$.`,
          r`Coefficient: $${frac(-(k ** 3), 6)}$.`,
        ],
      };
    },
  },
  {
    id: 'ca-03-5',
    difficulty: 3,
    keyConceptTag: 'Second-order approximation',
    correctOptionId: 'a',
    generate: (g) => {
      const k = g.pick([-3, -2, 2, 3]);
      const h = g.pick([0.1, -0.1, 0.05, 0.2]);
      const t1 = 1 + k * h;
      const t2 = t1 + (k * k * h * h) / 2;
      return {
        params: { k, h },
        promptText: r`Use the Taylor polynomial of degree 2 of $f(x) = e^{${k}x}$ at 0 to approximate $f(${h})$.`,
        options: [
          { id: 'a', label: `$${dec(t2)}$`, value: t2 },
          { id: 'b', label: `$${dec(t1)}$`, value: t1, trapExplanation: r`That is the degree-1 approximation; add the quadratic term $\frac{(${k}h)^2}{2} = ${dec((k * k * h * h) / 2)}$.` },
          { id: 'c', label: `$${dec(t1 + k * k * h * h)}$`, value: t1 + k * k * h * h, trapExplanation: r`The quadratic term is divided by $2! = 2$.` },
          { id: 'd', label: `$${dec(t1 + (k * h * h) / 2)}$`, value: t1 + (k * h * h) / 2, trapExplanation: r`In $\frac{(${k}x)^2}{2}$ the ${k} is squared too: $\frac{${k * k}x^2}{2}$.` },
        ],
        stepByStepSolution: [
          r`$T_2(x) = 1 + u + \frac{u^2}{2}$ with $u = ${k}x$: $T_2(x) = ${fracPoly([[1, 1], [k, 1], [k * k, 2]])}$.`,
          r`At $x = ${h}$: $1 + ${k * h < 0 ? `(${dec(k * h)})` : dec(k * h)} + ${dec((k * k * h * h) / 2)}$.`,
          r`$\approx ${dec(t2)}$ (the true value is $e^{${dec(k * h)}} = ${dec(Math.round(Math.exp(k * h) * 1e4) / 1e4)}\ldots$).`,
        ],
      };
    },
  },
  {
    id: 'ca-03-6',
    difficulty: 3,
    keyConceptTag: 'Taylor expansion around a ≠ 0',
    correctOptionId: 'a',
    generate: (g) => {
      const { n, a } = g.until(
        () => ({ n: g.int(3, 5), a: g.pick([-2, -1, 2, 3]) }),
        ({ n, a }) => allDistinct([binomial(n, 2) * a ** (n - 2), n * (n - 1) * a ** (n - 2), n * a ** (n - 1), binomial(n, 2) * a ** n]),
      );
      const c2 = binomial(n, 2) * a ** (n - 2);
      return {
        params: { n, a },
        promptText: r`Expand $f(x) = x^{${n}}$ around $a = ${a}$. What is the coefficient of $(x ${a < 0 ? '+' : '-'} ${Math.abs(a)})^2$?`,
        options: [
          { id: 'a', label: `$${c2}$`, value: c2 },
          { id: 'b', label: `$${n * (n - 1) * a ** (n - 2)}$`, value: n * (n - 1) * a ** (n - 2), trapExplanation: r`That is $f''(${a})$. The coefficient divides it by $2! = 2$.` },
          { id: 'c', label: `$${n * a ** (n - 1)}$`, value: n * a ** (n - 1), trapExplanation: r`That is $f'(${a})$, the coefficient of the linear term $(x - a)$.` },
          { id: 'd', label: `$${binomial(n, 2) * a ** n}$`, value: binomial(n, 2) * a ** n, trapExplanation: r`$f''(x) = ${n * (n - 1)}x^{${n - 2}}$: the power of $a$ drops to ${n - 2}.` },
        ],
        stepByStepSolution: [
          r`The coefficient of $(x - a)^2$ is $\frac{f''(a)}{2!}$.`,
          r`$f''(x) = ${n * (n - 1)}x^{${n - 2}}$, so $f''(${a}) = ${n * (n - 1)}\cdot${paren(a)}^{${n - 2}} = ${n * (n - 1) * a ** (n - 2)}$.`,
          r`Divide by 2: $${c2}$.`,
        ],
      };
    },
  },
];
