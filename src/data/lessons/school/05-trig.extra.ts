import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, frac, gcd, PYTHAGOREAN } from '../gen.ts';
import { fnT, piFrac, piTex, quadrantOf, trig, trigTex, whose } from './05-trig.practice.ts';

const r6 = (x: number) => Math.round(x * 1e6) / 1e6;
const QUAD = ['I', 'II', 'III', 'IV'];
const SIGNS = ['(+, +)', '(−, +)', '(−, −)', '(+, −)'];

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'sm-05-x1',
    difficulty: 1,
    keyConceptTag: 'Radians to degrees',
    correctOptionId: 'a',
    generate: (g) => {
      const deg = g.until(() => g.pick([30, 45, 60, 90, 120, 135, 150, 240, 270, 300]), (d) => allDistinct([d, (180 * 180) / d, d / 180, 2 * d].map(r6)));
      const dg = gcd(deg, 180);
      const [p, q] = [deg / dg, 180 / dg];
      return {
        params: { p, q },
        promptText: r`What is $${piTex(deg)}$ radians in degrees?`,
        options: [
          { id: 'a', label: `$${deg}^\\circ$`, value: deg },
          { id: 'b', label: `$${frac(180 * q, p)}^\\circ$`, value: (180 * q) / p, trapExplanation: r`Upside down: $${piTex(deg)} = \frac{${p}}{${q}}\cdot180^\circ$.` },
          { id: 'c', label: `$${frac(p, q)}^\\circ$`, value: p / q, trapExplanation: r`The $\pi$ is not dropped: it stands for $180^\circ$.` },
          { id: 'd', label: `$${2 * deg}^\\circ$`, value: 2 * deg, trapExplanation: r`$\pi$ is a half turn, $180^\circ$; $360^\circ$ is $2\pi$.` },
        ],
        stepByStepSolution: [r`Replace $\pi$ by $180^\circ$.`, r`$\frac{${p}}{${q}}\cdot180^\circ$.`, r`$= ${deg}^\circ$.`],
      };
    },
  },
  {
    id: 'sm-05-x2',
    difficulty: 1,
    keyConceptTag: 'Points on the axes',
    correctOptionId: 'a',
    generate: (g) => {
      const fnId = g.int(0, 1);
      const deg = g.pick([0, 90, 180, 270]);
      const v = trig(fnId, deg);
      const pt = `(${trig(1, deg)}, ${trig(0, deg)})`;
      const wrong = [1, 0, -1, 0.5].filter((w) => w !== v).slice(0, 3);
      return {
        params: { fnId, deg },
        promptText: r`What is $${fnT(fnId)} ${deg}^\circ$?`,
        options: [
          { id: 'a', label: `$${v}$`, value: v },
          ...wrong.map((w, i) => ({
            id: 'bcd'[i],
            label: `$${w === 0.5 ? '\\tfrac{1}{2}' : w}$`,
            value: w,
            trapExplanation: w === 0.5 ? r`$\frac12$ is $\sin 30^\circ$. At $${deg}^\circ$ the point is on an axis.` : r`At $${deg}^\circ$ the point on the unit circle is $${pt}$, and $${fnT(fnId)}$ is its ${fnId === 0 ? 'second' : 'first'} coordinate.`,
          })),
        ],
        stepByStepSolution: [r`Walk $${deg}^\circ$ anticlockwise around the unit circle from $(1, 0)$.`, r`You arrive at $${pt}$ = $(\cos ${deg}^\circ, \sin ${deg}^\circ)$.`, r`$${fnT(fnId)} ${deg}^\circ = ${v}$.`],
      };
    },
  },
  {
    id: 'sm-05-x3',
    difficulty: 1,
    keyConceptTag: 'The tangent',
    correctOptionId: 'a',
    generate: (g) => {
      const [p, q, c] = g.pick(PYTHAGOREAN);
      const Q = g.int(1, 4);
      const sn = (Q <= 2 ? 1 : -1) * p;
      const cn = (Q === 1 || Q === 4 ? 1 : -1) * q;
      return {
        params: { sn, cn, c },
        promptText: r`$\sin\theta = ${frac(sn, c)}$ and $\cos\theta = ${frac(cn, c)}$. What is $\tan\theta$?`,
        options: [
          { id: 'a', label: `$${frac(sn, cn)}$`, value: sn / cn },
          { id: 'b', label: `$${frac(cn, sn)}$`, value: cn / sn, trapExplanation: r`Upside down: $\tan\theta = \frac{\sin\theta}{\cos\theta}$.` },
          { id: 'c', label: `$${frac(sn * cn, c * c)}$`, value: (sn * cn) / (c * c), trapExplanation: r`That is the product $\sin\theta\cos\theta$; the tangent is the quotient.` },
          { id: 'd', label: `$${frac(-sn, cn)}$`, value: -sn / cn, trapExplanation: r`Keep the signs of both: $\frac{${frac(sn, c)}}{${frac(cn, c)}}$.` },
        ],
        stepByStepSolution: [r`$\tan\theta = \frac{\sin\theta}{\cos\theta}$.`, r`The denominators ${c} cancel: $\frac{${sn}}{${cn}}$.`, r`$\tan\theta = ${frac(sn, cn)}$.`],
      };
    },
  },
  {
    id: 'sm-05-x4',
    difficulty: 2,
    keyConceptTag: 'Signs in the quadrants',
    correctOptionId: 'a',
    generate: (g) => {
      const Q = g.int(1, 4);
      const ss = Q <= 2 ? 1 : -1;
      const cs = Q === 1 || Q === 4 ? 1 : -1;
      const others = [1, 2, 3, 4].filter((k) => k !== Q);
      return {
        params: { ss, cs },
        promptText: r`An angle $\theta$ has $\sin\theta ${ss > 0 ? '>' : '<'} 0$ and $\cos\theta ${cs > 0 ? '>' : '<'} 0$. In which quadrant is it?`,
        options: [
          { id: 'a', label: `Quadrant ${QUAD[Q - 1]}`, value: Q },
          ...others.map((k, i) => ({ id: 'bcd'[i], label: `Quadrant ${QUAD[k - 1]}`, value: k, trapExplanation: r`In quadrant ${QUAD[k - 1]} the signs of $(\cos\theta, \sin\theta)$ are $${SIGNS[k - 1]}$.` })),
        ],
        stepByStepSolution: [
          r`$\cos\theta$ is the $x$-coordinate: ${cs > 0 ? 'positive means the right half' : 'negative means the left half'} of the circle.`,
          r`$\sin\theta$ is the $y$-coordinate: ${ss > 0 ? 'positive means the upper half' : 'negative means the lower half'}.`,
          r`Both together: quadrant ${QUAD[Q - 1]}, signs $${SIGNS[Q - 1]}$.`,
        ],
      };
    },
  },
  {
    id: 'sm-05-x5',
    difficulty: 2,
    keyConceptTag: 'Periodicity',
    correctOptionId: 'a',
    generate: (g) => {
      const fnId = g.int(0, 1);
      const base = g.pick([30, 60]);
      const k = g.pick([1, 2, -1]);
      const theta = base + 360 * k;
      const v = trig(fnId, base);
      const pool = [trig(1 - fnId, base), -v, Math.SQRT2 / 2, 1].map(r6);
      const wrong = [...new Set(pool)].filter((w) => Math.abs(w - v) > 1e-6).slice(0, 3);
      return {
        params: { fnId, theta },
        promptText: r`What is $${fnT(fnId)}(${theta}^\circ)$?`,
        options: [
          { id: 'a', label: `$${trigTex(v)}$`, value: v },
          ...wrong.map((w, i) => ({
            id: 'bcd'[i],
            label: `$${trigTex(w)}$`,
            value: w,
            trapExplanation: w < 0 ? r`$${theta}^\circ$ lands on the same point as $${base}^\circ$, in quadrant I, where both sine and cosine are positive.` : r`$${trigTex(w)}$ is $${whose(w, fnId, base)}$. Removing full turns leaves $${base}^\circ$.`,
          })),
        ],
        stepByStepSolution: [
          r`$${theta}^\circ = ${base}^\circ ${k < 0 ? '-' : '+'} ${Math.abs(k) === 1 ? '' : Math.abs(k) + '\\cdot'}360^\circ$: ${Math.abs(k) === 1 ? 'one full turn' : `${Math.abs(k)} full turns`} away.`,
          r`Full turns change nothing: $${fnT(fnId)}(${theta}^\circ) = ${fnT(fnId)} ${base}^\circ$.`,
          r`$= ${trigTex(v)}$.`,
        ],
      };
    },
  },
  {
    id: 'sm-05-x6',
    difficulty: 2,
    keyConceptTag: 'Arc length',
    correctOptionId: 'a',
    generate: (g) => {
      const { rad, deg } = g.until(
        () => ({ rad: g.int(2, 9), deg: g.pick([30, 45, 60, 90, 120, 180]) }),
        ({ rad, deg }) => allDistinct([(rad * deg * Math.PI) / 180, rad * deg, (deg * Math.PI) / (180 * rad), 2 * rad * Math.PI].map(r6)),
      );
      return {
        params: { rad, deg },
        promptText: r`A circle has radius ${rad}. How long is the arc cut out by an angle of $${deg}^\circ$?`,
        options: [
          { id: 'a', label: `$${piFrac(rad * deg, 180)}$`, value: (rad * deg * Math.PI) / 180 },
          { id: 'b', label: `$${rad * deg}$`, value: rad * deg, trapExplanation: r`The formula $s = r\theta$ needs $\theta$ in radians: $${deg}^\circ = ${piTex(deg)}$.` },
          { id: 'c', label: `$${piFrac(deg, 180 * rad)}$`, value: (deg * Math.PI) / (180 * rad), trapExplanation: r`Multiply by the radius: a bigger circle has a longer arc.` },
          { id: 'd', label: `$${piFrac(2 * rad, 1)}$`, value: 2 * rad * Math.PI, trapExplanation: r`$2\pi r$ is the whole circumference; the arc is only $\frac{${deg}}{360}$ of it.` },
        ],
        stepByStepSolution: [r`Convert: $${deg}^\circ = ${piTex(deg)}$.`, r`$s = r\theta = ${rad}\cdot${piTex(deg)}$.`, r`$s = ${piFrac(rad * deg, 180)}$.`],
      };
    },
  },
];
