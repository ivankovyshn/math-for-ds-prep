import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, dec, frac } from '../gen.ts';

const r2 = (x: number) => Math.round(x * 100) / 100;
const r6 = (x: number) => Math.round(x * 1e6) / 1e6;
/** "≈ 3.32" */
export const approx2 = (x: number) => `$\\approx ${dec(r2(x))}$`;

export const practice: QuestionTemplate[] = [
  {
    id: 'sm-04-1',
    difficulty: 1,
    keyConceptTag: 'What a logarithm is',
    correctOptionId: 'a',
    generate: (g) => {
      const { b, k } = g.until(() => ({ b: g.pick([2, 3, 5, 10]), k: g.int(2, 6) }), ({ b, k }) => b ** k <= 100000 && allDistinct([k, b ** k / b, k + 1, 1 / k]));
      const N = b ** k;
      return {
        params: { b, N },
        promptText: r`Compute $\log_{${b}} ${N}$.`,
        options: [
          { id: 'a', label: `$${k}$`, value: k },
          { id: 'b', label: `$${N / b}$`, value: N / b, trapExplanation: r`A logarithm is not a division: $\log_{${b}} ${N}$ asks for the power of ${b} that gives ${N}.` },
          { id: 'c', label: `$${k + 1}$`, value: k + 1, trapExplanation: r`Check: $${b}^{${k + 1}} = ${b ** (k + 1)}$, too large.` },
          { id: 'd', label: `$${frac(1, k)}$`, value: 1 / k, trapExplanation: r`That answers "${N} to which power gives ${b}". The base is ${b}.` },
        ],
        stepByStepSolution: [r`$\log_{${b}} ${N} = x$ means $${b}^x = ${N}$.`, r`$${b}^{${k}} = ${N}$.`, r`So $\log_{${b}} ${N} = ${k}$.`],
      };
    },
  },
  {
    id: 'sm-04-2',
    difficulty: 1,
    keyConceptTag: 'Logarithms of small numbers',
    correctOptionId: 'a',
    generate: (g) => {
      const k = g.int(1, 5);
      const x = 10 ** -k;
      const shown = x.toFixed(k);
      return {
        params: { k },
        promptText: r`Compute $\log_{10} ${shown}$.`,
        options: [
          { id: 'a', label: `$${-k}$`, value: -k },
          { id: 'b', label: `$${k}$`, value: k, trapExplanation: r`$10^{${k}} = ${10 ** k}$. Numbers between 0 and 1 have negative logarithms.` },
          { id: 'c', label: `$${-(k - 1)}$`, value: -(k - 1), trapExplanation: r`Count the decimal places, not the zeros: $${shown} = 10^{-${k}}$.` },
          { id: 'd', label: 'Not defined', trapExplanation: r`Every positive number has a logarithm; only numbers $\le 0$ have none. ${shown} is positive.` },
        ],
        stepByStepSolution: [r`Write the number as a power of 10: $${shown} = \frac{1}{${10 ** k}} = 10^{-${k}}$.`, r`$\log_{10} 10^{-${k}} = -${k}$.`, r`So the answer is $${-k}$.`],
      };
    },
  },
  {
    id: 'sm-04-3',
    difficulty: 2,
    keyConceptTag: 'Combining logarithms',
    correctOptionId: 'a',
    generate: (g) => {
      const { b, k, x, y, z } = g.until(
        () => {
          const b = g.pick([2, 3]);
          const k = g.int(2, 4);
          const z = g.pick([2, 3, 5, 6, 7, 9, 10, 12]);
          const N = z * b ** k;
          const divs = Array.from({ length: N }, (_, i) => i + 1).filter((d) => N % d === 0 && d >= 2 && N / d >= 2);
          const x = g.pick(divs);
          return { b, k, x, y: N / x, z };
        },
        ({ b, k, x, y, z }) => x < y && x !== z && y !== z && x + y > z && allDistinct([k, Math.log(x + y - z) / Math.log(b), b ** k, Math.log(x * y * z) / Math.log(b)].map(r6)),
      );
      const lb = (v: number) => Math.log(v) / Math.log(b);
      return {
        params: { b, x, y, z },
        promptText: r`Compute $\log_{${b}} ${x} + \log_{${b}} ${y} - \log_{${b}} ${z}$.`,
        options: [
          { id: 'a', label: `$${k}$`, value: k },
          { id: 'b', label: r`$\log_{${b}} ${x + y - z}$`, value: lb(x + y - z), trapExplanation: r`Adding logarithms multiplies their arguments; it does not add them.` },
          { id: 'c', label: `$${b ** k}$`, value: b ** k, trapExplanation: r`${b ** k} is the argument $\frac{${x}\cdot${y}}{${z}}$; its logarithm is still to be taken.` },
          { id: 'd', label: r`$\log_{${b}} ${x * y * z}$`, value: lb(x * y * z), trapExplanation: r`A subtracted logarithm divides: $-\log_{${b}} ${z}$ puts ${z} in the denominator.` },
        ],
        stepByStepSolution: [
          r`Sums of logs are logs of products, differences are logs of quotients: $\log_{${b}}\frac{${x}\cdot${y}}{${z}}$.`,
          r`$\frac{${x * y}}{${z}} = ${b ** k}$.`,
          r`$\log_{${b}} ${b ** k} = ${k}$, since $${b}^{${k}} = ${b ** k}$.`,
        ],
      };
    },
  },
  {
    id: 'sm-04-4',
    difficulty: 2,
    keyConceptTag: 'The power rule',
    correctOptionId: 'a',
    generate: (g) => {
      const { m, s } = g.until(() => ({ m: g.int(3, 6), s: g.pick([1, -1]) }), ({ m, s }) => allDistinct([m + s / 2, m / 2, m, m + 2 * s]));
      const coef = (c: number) => `${frac(Math.round(c * 2), 2)}t`;
      const correct = m + s / 2;
      return {
        params: { m, s },
        promptText: r`Let $\ln a = t$. Which expression equals $\ln\Big(${s > 0 ? r`a^{${m}}\sqrt a` : r`\dfrac{a^{${m}}}{\sqrt a}`}\Big)$?`,
        options: [
          { id: 'a', label: `$${coef(correct)}$`, value: correct },
          { id: 'b', label: `$${coef(m / 2)}$`, value: m / 2, trapExplanation: r`The logarithm of a ${s > 0 ? 'product is a sum' : 'quotient is a difference'}: $${m}t ${s > 0 ? '+' : '-'} \frac12 t$, not a product.` },
          { id: 'c', label: `$${coef(m)}$`, value: m, trapExplanation: r`$\sqrt a = a^{1/2}$ contributes too: $\ln\sqrt a = \frac12 t$.` },
          { id: 'd', label: `$${coef(m + 2 * s)}$`, value: m + 2 * s, trapExplanation: r`$\sqrt a = a^{1/2}$, not $a^2$.` },
        ],
        stepByStepSolution: [
          r`$\ln(a^{${m}}) = ${m}\ln a = ${m}t$ and $\ln\sqrt a = \ln a^{1/2} = \frac12 t$.`,
          s > 0 ? r`A product becomes a sum: $${m}t + \frac12 t$.` : r`A quotient becomes a difference: $${m}t - \frac12 t$.`,
          r`$= ${coef(correct)}$.`,
        ],
      };
    },
  },
  {
    id: 'sm-04-5',
    difficulty: 3,
    keyConceptTag: 'Solving an exponential equation',
    correctOptionId: 'a',
    generate: (g) => {
      const { b, c } = g.until(
        () => ({ b: g.pick([2, 3, 5]), c: g.int(7, 60) }),
        ({ b, c }) => !Number.isInteger(r6(Math.log(c) / Math.log(b))) && allDistinct([Math.log(c) / Math.log(b), c / b, Math.log(c) - Math.log(b), Math.log(b) / Math.log(c)].map(r2)),
      );
      const x = Math.log(c) / Math.log(b);
      return {
        params: { b, c },
        promptText: r`Solve $${b}^x = ${c}$ (to two decimal places).`,
        options: [
          { id: 'a', label: approx2(x), value: r2(x) },
          { id: 'b', label: approx2(c / b), value: r2(c / b), trapExplanation: r`An exponent is not undone by dividing. Take logarithms: $x\ln ${b} = \ln ${c}$.` },
          { id: 'c', label: approx2(Math.log(c) - Math.log(b)), value: r2(Math.log(c) - Math.log(b)), trapExplanation: r`$\ln ${c} - \ln ${b} = \ln\frac{${c}}{${b}}$. The equation $x\ln ${b} = \ln ${c}$ needs a division.` },
          { id: 'd', label: approx2(Math.log(b) / Math.log(c)), value: r2(Math.log(b) / Math.log(c)), trapExplanation: r`Upside down: $x = \frac{\ln ${c}}{\ln ${b}}$. Check: $${b}^{1}$ is already ${b}, so $x$ must be larger than 1.` },
        ],
        stepByStepSolution: [
          r`Take $\ln$ of both sides: $\ln(${b}^x) = x\ln ${b} = \ln ${c}$.`,
          r`$x = \frac{\ln ${c}}{\ln ${b}} \approx \frac{${dec(Math.round(Math.log(c) * 1000) / 1000)}}{${dec(Math.round(Math.log(b) * 1000) / 1000)}}$.`,
          r`$x \approx ${dec(r2(x))}$. Check: $${b}^{${dec(r2(x))}} \approx ${c}$.`,
        ],
      };
    },
  },
  {
    id: 'sm-04-6',
    difficulty: 3,
    keyConceptTag: 'Exponential decay',
    correctOptionId: 'a',
    generate: (g) => {
      const { k, f } = g.until(
        () => ({ k: g.pick([0.05, 0.1, 0.2, 0.25, 0.5]), f: g.pick([2, 4, 5, 10]) }),
        ({ k, f }) => allDistinct([Math.log(f) / k, k * Math.log(f), f / k, -Math.log(f) / k].map(r2)),
      );
      const t = Math.log(f) / k;
      return {
        params: { k, f },
        promptText: r`A quantity decays as $N(t) = N_0e^{-${k}t}$. After how long is only $\frac{1}{${f}}$ of it left?`,
        options: [
          { id: 'a', label: approx2(t), value: r2(t) },
          { id: 'b', label: approx2(k * Math.log(f)), value: r2(k * Math.log(f)), trapExplanation: r`From $${k}t = \ln ${f}$, divide by ${k}; do not multiply.` },
          { id: 'c', label: approx2(f / k), value: r2(f / k), trapExplanation: r`The ${f} has to go through a logarithm first: $e^{-${k}t} = \frac{1}{${f}}$ gives $${k}t = \ln ${f}$.` },
          { id: 'd', label: approx2(-t), value: r2(-t), trapExplanation: r`A time cannot be negative: $\ln\frac{1}{${f}} = -\ln ${f}$, and that minus cancels the one in the exponent.` },
        ],
        stepByStepSolution: [
          r`$N_0e^{-${k}t} = \frac{N_0}{${f}}$, so $e^{-${k}t} = \frac{1}{${f}}$.`,
          r`Take $\ln$: $-${k}t = -\ln ${f}$, i.e. $t = \frac{\ln ${f}}{${k}}$.`,
          r`$t \approx \frac{${dec(Math.round(Math.log(f) * 1000) / 1000)}}{${k}} \approx ${dec(r2(t))}$.`,
        ],
      };
    },
  },
];
