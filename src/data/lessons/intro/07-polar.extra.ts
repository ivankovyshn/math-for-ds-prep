import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct } from '../gen.ts';
import { cx } from './06-complex.practice.ts';
import { cosd, sind } from './07-polar.practice.ts';

const QUADRANT_WORDS: Record<number, string> = {
  45: 'right and up (1st quadrant)',
  135: 'left and up (2nd quadrant)',
  [-135]: 'left and down (3rd quadrant)',
  [-45]: 'right and down (4th quadrant)',
};

export const extra: QuestionTemplate[] = [
  {
    id: 'ml-07-x1',
    difficulty: 1,
    keyConceptTag: 'How many n-th roots',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.int(3, 8);
      const w = g.pick(['1', '-1', '2', '-8', '16', 'i', '-i', '3i', '1 + i']);
      const wp = /^-|\+/.test(w) ? `(${w})` : w;
      return {
        params: { n },
        promptText: r`How many complex numbers $z$ solve $z^{${n}} = ${w}$?`,
        options: [
          { id: 'a', label: `$${n}$`, value: n },
          { id: 'b', label: '$1$', value: 1, trapExplanation: r`One root is only the start: adding $\frac{360^\circ}{${n}}$ to its angle gives another, until the circle is full.` },
          { id: 'c', label: '$2$', value: 2, trapExplanation: r`"$\pm$" belongs to square roots. An equation $z^n = w$ with $w \ne 0$ has $n$ solutions.` },
          { id: 'd', label: `$${n + 1}$`, value: n + 1, trapExplanation: r`$z^{${n}} - ${wp}$ is a polynomial of degree ${n}, and a degree-$${n}$ polynomial has exactly ${n} roots.` },
        ],
        stepByStepSolution: [
          r`$z^{${n}} - ${wp} = 0$ is a polynomial equation of degree ${n}.`,
          r`By the fundamental theorem of algebra it has ${n} complex roots, and since the right side is not 0 they are all different.`,
          r`They lie on one circle, $\frac{360^\circ}{${n}}$ apart.`,
        ],
      };
    },
  },
  {
    id: 'ml-07-x2',
    difficulty: 1,
    keyConceptTag: 'Multiplying in exponential form',
    correctOptionId: 'a',
    generate: (g) => {
      const { r1, r2, t1, t2 } = g.until(
        () => ({ r1: g.int(2, 5), r2: g.int(2, 5), t1: 10 * g.int(1, 8), t2: 10 * g.int(1, 8) }),
        ({ r1, r2, t1, t2 }) => t1 !== t2 && allDistinct([r1 * r2, r1 + r2]) && allDistinct([t1 + t2, t1 * t2, Math.abs(t1 - t2)]),
      );
      const e = (m: number, t: number) => r`${m}e^{i\cdot ${t}^\circ}`;
      return {
        params: { r1, r2, t1, t2 },
        promptText: r`Let $z = ${e(r1, t1)}$ and $w = ${e(r2, t2)}$. What is $zw$?`,
        options: [
          { id: 'a', label: `$${e(r1 * r2, t1 + t2)}$`, value: [r1 * r2, t1 + t2] },
          { id: 'b', label: `$${e(r1 + r2, t1 + t2)}$`, value: [r1 + r2, t1 + t2], trapExplanation: r`The angles add, but the moduli multiply: $${r1}\cdot${r2} = ${r1 * r2}$.` },
          { id: 'c', label: `$${e(r1 * r2, t1 * t2)}$`, value: [r1 * r2, t1 * t2], trapExplanation: r`$e^{i\alpha}e^{i\beta} = e^{i(\alpha + \beta)}$: exponents add when powers are multiplied.` },
          { id: 'd', label: `$${e(r1 * r2, Math.abs(t1 - t2))}$`, value: [r1 * r2, Math.abs(t1 - t2)], trapExplanation: r`Angles are subtracted in a <i>division</i>. In a product they add.` },
        ],
        stepByStepSolution: [
          r`$zw = ${r1}\cdot${r2}\cdot e^{i\cdot ${t1}^\circ}e^{i\cdot ${t2}^\circ}$.`,
          r`Moduli multiply: $${r1 * r2}$. Angles add: $${t1}^\circ + ${t2}^\circ = ${t1 + t2}^\circ$.`,
          r`$zw = ${e(r1 * r2, t1 + t2)}$.`,
        ],
      };
    },
  },
  {
    id: 'ml-07-x3',
    difficulty: 2,
    keyConceptTag: 'Multiplying in polar form',
    correctOptionId: 'a',
    generate: (g) => {
      // The angles add up to 90° or 270°, so the product lies on the imaginary axis.
      const { r1, r2, t1, t2 } = g.until(
        () => {
          const total = g.pick([90, 270]);
          const t1 = total === 90 ? 10 * g.int(1, 8) : 10 * g.int(10, 17);
          return { r1: g.int(2, 4), r2: g.int(2, 4), t1, t2: total - t1 };
        },
        ({ r1, r2, t1, t2 }) => t1 !== t2 && t2 > 0 && t2 < 180 && r1 + r2 !== r1 * r2,
      );
      const s = (t1 + t2) % 360;
      const ans = [r1 * r2 * cosd(s), r1 * r2 * sind(s)];
      const conj = [ans[0], -ans[1]];
      const polar = (rr: number, t: number) => r`${rr}(\cos ${t}^\circ + i \sin ${t}^\circ)`;
      return {
        params: { r1, r2, t1, t2 },
        promptText: r`Let $z = ${polar(r1, t1)}$ and $w = ${polar(r2, t2)}$. What is $zw$?`,
        options: [
          { id: 'a', label: `$${cx(ans[0], ans[1])}$`, value: ans },
          { id: 'b', label: `$${r1 * r2}$`, value: [r1 * r2, 0], trapExplanation: r`The moduli multiply to ${r1 * r2}, but the angles add to $${t1 + t2}^\circ$, which is not on the positive real axis.` },
          { id: 'c', label: `$${cx((r1 + r2) * cosd(s), (r1 + r2) * sind(s))}$`, value: [(r1 + r2) * cosd(s), (r1 + r2) * sind(s)], trapExplanation: r`Moduli multiply, they do not add: $${r1} \cdot ${r2} = ${r1 * r2}$.` },
          { id: 'd', label: `$${cx(conj[0], conj[1])}$`, value: conj, trapExplanation: r`That is the point at angle $-${s}^\circ$. Both angles are positive, so their sum $${s}^\circ$ is too.` },
        ],
        stepByStepSolution: [
          r`In polar form: multiply the moduli and add the angles.`,
          r`$|zw| = ${r1} \cdot ${r2} = ${r1 * r2}$, $\arg(zw) = ${t1}^\circ + ${t2}^\circ = ${t1 + t2}^\circ$.`,
          r`$${polar(r1 * r2, t1 + t2)} = ${cx(ans[0], ans[1])}$.`,
        ],
      };
    },
  },
  {
    id: 'ml-07-x4',
    difficulty: 2,
    keyConceptTag: 'Powers in exponential form',
    correctOptionId: 'a',
    generate: (g) => {
      const { R, n, t } = g.until(
        () => ({ R: g.int(2, 3), n: g.int(2, 4), t: 5 * g.int(2, 8) }),
        ({ R, n }) => R ** n !== n * R,
      );
      const e = (m: number, a: number) => r`${m}e^{i\cdot ${a}^\circ}`;
      return {
        params: { R, n, t },
        promptText: r`Let $z = ${e(R, t)}$. What is $z^{${n}}$?`,
        options: [
          { id: 'a', label: `$${e(R ** n, n * t)}$`, value: [R ** n, n * t] },
          { id: 'b', label: `$${e(n * R, n * t)}$`, value: [n * R, n * t], trapExplanation: r`The modulus is raised to the power: $${R}^{${n}} = ${R ** n}$, not $${n}\cdot${R}$.` },
          { id: 'c', label: `$${e(R ** n, t)}$`, value: [R ** n, t], trapExplanation: r`The angle changes too: each of the ${n} factors turns by another $${t}^\circ$.` },
          { id: 'd', label: `$${e(R ** n, t + n)}$`, value: [R ** n, t + n], trapExplanation: r`De Moivre multiplies the angle by $n$: $${n}\cdot${t}^\circ$, not $${t}^\circ + ${n}^\circ$.` },
        ],
        stepByStepSolution: [
          r`De Moivre: $\big(re^{i\varphi}\big)^n = r^n e^{in\varphi}$.`,
          r`Modulus $${R}^{${n}} = ${R ** n}$; angle $${n}\cdot${t}^\circ = ${n * t}^\circ$.`,
          r`$z^{${n}} = ${e(R ** n, n * t)}$.`,
        ],
      };
    },
  },
  {
    id: 'ml-07-x5',
    difficulty: 2,
    keyConceptTag: 'Argument and quadrants',
    correctOptionId: 'a',
    generate: (g) => {
      const k = g.int(1, 6);
      const [sx, sy] = g.pick([[1, 1], [-1, 1], [-1, -1], [1, -1]]);
      const theta = Math.round((Math.atan2(sy, sx) * 180) / Math.PI);
      const others = [45, 135, -135, -45].filter((a) => a !== theta);
      const kk = k === 1 ? '' : `${k}`;
      return {
        params: { re: sx * k, im: sy * k },
        promptText: r`What is the argument of $z = ${cx(sx * k, sy * k)}$ (in degrees, between $-180^\circ$ and $180^\circ$)?`,
        options: [
          { id: 'a', label: r`$${theta}^\circ$`, value: theta },
          ...others.map((a, i) => ({
            id: 'bcd'[i],
            label: r`$${a}^\circ$`,
            value: a,
            trapExplanation:
              a === -theta
                ? r`That is the argument of the conjugate: the sign of the imaginary part decides the sign of the angle.`
                : a === (sx * sy > 0 ? 45 : -45) && Math.abs(theta) === 135
                  ? r`$\arctan\frac{b}{a} = \arctan(${sx * sy}) = ${a}^\circ$ ignores that the real part is negative. $${a}^\circ$ points ${QUADRANT_WORDS[a]}.`
                  : r`$${a}^\circ$ points ${QUADRANT_WORDS[a]}. Here the real part is $${sx * k}$ and the imaginary part $${sy * k}$.`,
          })),
        ],
        stepByStepSolution: [
          r`$z$ is the point $(${sx * k}, ${sy * k})$: ${QUADRANT_WORDS[theta]}.`,
          r`Equal parts in size mean the point is on a diagonal, $45^\circ$ from the real axis${kk ? ` (the factor ${kk} only changes the modulus)` : ''}.`,
          r`$\arg z = ${theta}^\circ$.`,
        ],
      };
    },
  },
  {
    id: 'ml-07-x6',
    difficulty: 2,
    keyConceptTag: 'Roots of unity',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.pick([3, 4, 5, 6, 8, 9, 10, 12]);
      return {
        params: { n },
        promptText: r`The ${n} solutions of $z^{${n}} = 1$ lie evenly spaced on the unit circle. What angle separates two neighbouring solutions?`,
        options: [
          { id: 'a', label: r`$${360 / n}^\circ$`, value: 360 / n },
          { id: 'b', label: r`$${180 / n}^\circ$`, value: 180 / n, trapExplanation: r`The ${n} roots share the full turn of $360^\circ$, not half of it.` },
          { id: 'c', label: r`$${n}^\circ$`, value: n, trapExplanation: r`${n} is the number of roots, not the angle between them: divide the full turn by it.` },
          { id: 'd', label: r`$${360 * n}^\circ$`, value: 360 * n, trapExplanation: r`That is more than a full turn. ${n} equal gaps make up $360^\circ$, so each is $\frac{360^\circ}{${n}}$.` },
        ],
        stepByStepSolution: [
          r`$1 = e^{i\cdot 0^\circ} = e^{i\cdot 360^\circ k}$, so the roots are $e^{i\cdot 360^\circ k/${n}}$ for $k = 0, \dots, ${n - 1}$.`,
          r`Neighbouring values of $k$ differ by $\frac{360^\circ}{${n}}$.`,
          r`The gap is $${360 / n}^\circ$.`,
        ],
      };
    },
  },
];
