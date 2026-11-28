import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, frac, paren, poly } from '../gen.ts';

const sorted = (xs: number[]) => [...xs].sort((p, q) => p - q);
/** "x = 2 or x = 5" for a sorted pair. */
export const rootsLab = ([u, v]: number[], show: (x: number) => string = (x) => `${x}`) => (u === v ? r`$x = ${show(u)}$ only` : r`$x = ${show(u)}$ or $x = ${show(v)}$`);
/** h ± ki as TeX. */
export const cpx = (h: number, k: number) => `${h === 0 ? '' : h} \\pm ${k === 1 ? '' : k}i`;

export const practice: QuestionTemplate[] = [
  {
    id: 'sm-02-1',
    difficulty: 1,
    keyConceptTag: 'Solving by factoring',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q } = g.until(
        () => ({ p: g.nonzero(-9, 9), q: g.nonzero(-9, 9) }),
        ({ p, q }) => p < q && allDistinct([sorted([p, q]), sorted([-p, -q]), sorted([p, -q]), sorted([1, p * q])].map(String)),
      );
      const b = -(p + q);
      const c = p * q;
      return {
        params: { b, c },
        promptText: r`Solve $${poly([c, b, 1])} = 0$.`,
        options: [
          { id: 'a', label: rootsLab([p, q]), value: [p, q] },
          { id: 'b', label: rootsLab(sorted([-p, -q])), value: sorted([-p, -q]), trapExplanation: r`These are the numbers inside the brackets. $(x ${p < 0 ? '+' : '-'} ${Math.abs(p)})(x ${q < 0 ? '+' : '-'} ${Math.abs(q)}) = 0$ gives $x = ${p}$ and $x = ${q}$.` },
          { id: 'c', label: rootsLab(sorted([p, -q])), value: sorted([p, -q]), trapExplanation: r`Check by substituting: the roots must multiply to $c = ${c}$ and add up to $-b = ${p + q}$.` },
          { id: 'd', label: rootsLab(sorted([1, c])), value: sorted([1, c]), trapExplanation: r`$1\cdot${paren(c)} = ${c}$ has the right product, but the sum must be ${p + q}.` },
        ],
        stepByStepSolution: [
          r`Find two numbers with product $${c}$ and sum $${b}$: $${-p}$ and $${-q}$ (check: $${paren(-p)}\cdot${paren(-q)} = ${c}$ and $${paren(-p)} + ${paren(-q)} = ${b}$).`,
          r`So $${poly([c, b, 1])} = (x ${-p < 0 ? '-' : '+'} ${Math.abs(p)})(x ${-q < 0 ? '-' : '+'} ${Math.abs(q)})$.`,
          r`Each bracket is zero once: $x = ${p}$ or $x = ${q}$.`,
        ],
      };
    },
  },
  {
    id: 'sm-02-2',
    difficulty: 1,
    keyConceptTag: 'The discriminant',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c } = g.until(
        () => ({ a: g.int(1, 3), b: g.nonzero(-9, 9), c: g.nonzero(-9, 9) }),
        ({ a, b, c }) => allDistinct([b * b - 4 * a * c, b * b + 4 * a * c, b * b - 2 * a * c, 4 * a * c - b * b]),
      );
      const D = b * b - 4 * a * c;
      return {
        params: { a, b, c },
        promptText: r`What is the discriminant $D = b^2 - 4ac$ of $${poly([c, b, a])} = 0$?`,
        options: [
          { id: 'a', label: `$${D}$`, value: D },
          { id: 'b', label: `$${b * b + 4 * a * c}$`, value: b * b + 4 * a * c, trapExplanation: r`Sign slip: $-4ac = -4\cdot${a}\cdot${paren(c)} = ${-4 * a * c}$.` },
          { id: 'c', label: `$${b * b - 2 * a * c}$`, value: b * b - 2 * a * c, trapExplanation: r`The factor is 4, not 2: $D = b^2 - 4ac$. (The 2 belongs to the denominator $2a$.)` },
          { id: 'd', label: `$${4 * a * c - b * b}$`, value: 4 * a * c - b * b, trapExplanation: r`The order is $b^2 - 4ac$; this is its negative.` },
        ],
        stepByStepSolution: [
          r`$a = ${a}$, $b = ${b}$, $c = ${c}$.`,
          r`$b^2 = ${b * b}$ and $4ac = 4\cdot${a}\cdot${paren(c)} = ${4 * a * c}$.`,
          r`$D = ${b * b} - ${paren(4 * a * c)} = ${D}$${D > 0 ? ': two real roots' : D < 0 ? ': no real roots' : ''}.`,
        ],
      };
    },
  },
  {
    id: 'sm-02-3',
    difficulty: 2,
    keyConceptTag: 'The quadratic formula',
    correctOptionId: 'a',
    generate: (g) => {
      const { q, p, s } = g.until(
        () => ({ q: g.pick([2, 3]), p: g.nonzero(-7, 7), s: g.int(-6, 6) }),
        ({ q, p, s }) => p % q !== 0 && p / q !== s && allDistinct([sorted([p / q, s]), sorted([(2 * p) / q, 2 * s]), sorted([-p / q, -s]), sorted([p, q * s])].map(String)),
      );
      // (qx − p)(x − s) = qx² − (qs + p)x + ps
      const a = q;
      const b = -(q * s + p);
      const c = p * s;
      const D = b * b - 4 * a * c;
      const sq = Math.round(Math.sqrt(D));
      const show = (x: number) => (Number.isInteger(x) ? `${x}` : frac(Math.round(x * q), q));
      const rts = sorted([p / q, s]);
      return {
        params: { a, b, c },
        promptText: r`Solve $${poly([c, b, a])} = 0$.`,
        options: [
          { id: 'a', label: rootsLab(rts, show), value: rts },
          { id: 'b', label: rootsLab(sorted([(2 * p) / q, 2 * s]), (x) => (Number.isInteger(x) ? `${x}` : frac(Math.round(x * q), q))), value: sorted([(2 * p) / q, 2 * s]), trapExplanation: r`The denominator is $2a = ${2 * a}$, not $a$.` },
          { id: 'c', label: rootsLab(sorted([-p / q, -s]), show), value: sorted([-p / q, -s]), trapExplanation: r`The formula starts with $-b = ${-b}$; both roots changed sign.` },
          { id: 'd', label: rootsLab(sorted([p, q * s])), value: sorted([p, q * s]), trapExplanation: r`That divides by 2 instead of $2a = ${2 * a}$.` },
        ],
        stepByStepSolution: [
          r`$D = ${paren(b)}^2 - 4\cdot${a}\cdot${paren(c)} = ${D}$, so $\sqrt D = ${sq}$.`,
          r`$x = \frac{${-b} \pm ${sq}}{2\cdot${a}} = \frac{${-b} \pm ${sq}}{${2 * a}}$.`,
          r`$x = \frac{${-b + sq}}{${2 * a}} = ${show((-b + sq) / (2 * a))}$ or $x = \frac{${-b - sq}}{${2 * a}} = ${show((-b - sq) / (2 * a))}$.`,
        ],
      };
    },
  },
  {
    id: 'sm-02-4',
    difficulty: 2,
    keyConceptTag: 'The vertex of a parabola',
    correctOptionId: 'a',
    generate: (g) => {
      const { h, c } = g.until(() => ({ h: g.nonzero(-6, 6), c: g.int(-9, 9) }), ({ h, c }) => allDistinct([c - h * h, c, h, c + h * h]));
      const b = -2 * h;
      const m = c - h * h;
      return {
        params: { b, c },
        promptText: r`What is the smallest value of $f(x) = ${poly([c, b, 1])}$?`,
        options: [
          { id: 'a', label: `$${m}$`, value: m },
          { id: 'b', label: `$${h}$`, value: h, trapExplanation: r`${h} is the position of the vertex, $x = -\frac{b}{2a}$. The smallest <i>value</i> is $f(${h})$.` },
          { id: 'c', label: `$${c}$`, value: c, trapExplanation: r`$f(0) = ${c}$, but the minimum is at the vertex $x = ${h}$, not at 0.` },
          { id: 'd', label: `$${c + h * h}$`, value: c + h * h, trapExplanation: r`Check the sign: $f(${h}) = ${h * h} ${b * h < 0 ? '-' : '+'} ${Math.abs(b * h)} ${c < 0 ? '-' : '+'} ${Math.abs(c)}$.` },
        ],
        stepByStepSolution: [
          r`The parabola opens upwards ($a = 1 > 0$), so the minimum is at the vertex.`,
          r`$x = -\frac{b}{2a} = -\frac{${b}}{2} = ${h}$.`,
          r`$f(${h}) = ${h * h} ${b * h < 0 ? '-' : '+'} ${Math.abs(b * h)} ${c < 0 ? '-' : '+'} ${Math.abs(c)} = ${m}$.`,
        ],
      };
    },
  },
  {
    id: 'sm-02-5',
    difficulty: 3,
    keyConceptTag: 'Complex roots',
    correctOptionId: 'a',
    generate: (g) => {
      const { h, k } = g.until(() => ({ h: g.int(-5, 5), k: g.int(1, 5) }), ({ h }) => h !== 0);
      const b = -2 * h;
      const c = h * h + k * k;
      return {
        params: { b, c },
        promptText: r`Solve $${poly([c, b, 1])} = 0$, allowing complex numbers ($i^2 = -1$).`,
        options: [
          { id: 'a', label: `$x = ${cpx(h, k)}$`, value: [h, k] },
          { id: 'b', label: `$x = ${cpx(-h, k)}$`, value: [-h, k], trapExplanation: r`The real part is $-\frac{b}{2a} = -\frac{${b}}{2} = ${h}$.` },
          { id: 'c', label: `$x = ${cpx(2 * h, 2 * k)}$`, value: [2 * h, 2 * k], trapExplanation: r`Both parts are divided by $2a = 2$.` },
          { id: 'd', label: 'There is no solution', trapExplanation: r`$D < 0$ means no <i>real</i> solution. With $i = \sqrt{-1}$ there are two complex ones.` },
        ],
        stepByStepSolution: [
          r`$D = ${paren(b)}^2 - 4\cdot${c} = ${b * b - 4 * c} < 0$, and $\sqrt{-D} = ${2 * k}$.`,
          r`$x = \frac{${-b} \pm ${2 * k}i}{2}$.`,
          r`$x = ${cpx(h, k)}$.`,
        ],
      };
    },
  },
  {
    id: 'sm-02-6',
    difficulty: 3,
    keyConceptTag: "Vieta's formulas",
    correctOptionId: 'a',
    generate: (g) => {
      const { s, p } = g.until(() => ({ s: g.nonzero(-9, 9), p: g.nonzero(-20, 20) }), ({ s, p }) => allDistinct([s * s - 2 * p, s * s, s * s + 2 * p, s * s - p]));
      return {
        params: { s, p },
        promptText: r`$x_1$ and $x_2$ are the roots of $${poly([p, -s, 1])} = 0$. What is $x_1^2 + x_2^2$? (You do not need the roots themselves.)`,
        options: [
          { id: 'a', label: `$${s * s - 2 * p}$`, value: s * s - 2 * p },
          { id: 'b', label: `$${s * s}$`, value: s * s, trapExplanation: r`$(x_1 + x_2)^2 \ne x_1^2 + x_2^2$: it also contains $2x_1x_2$.` },
          { id: 'c', label: `$${s * s + 2 * p}$`, value: s * s + 2 * p, trapExplanation: r`$2x_1x_2$ has to be <i>subtracted</i> from $(x_1 + x_2)^2$.` },
          { id: 'd', label: `$${s * s - p}$`, value: s * s - p, trapExplanation: r`The cross term in $(x_1 + x_2)^2$ is $2x_1x_2 = ${2 * p}$, twice the product.` },
        ],
        stepByStepSolution: [
          r`Vieta: $x_1 + x_2 = -\frac ba = ${s}$ and $x_1x_2 = \frac ca = ${p}$.`,
          r`$(x_1 + x_2)^2 = x_1^2 + 2x_1x_2 + x_2^2$, so $x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1x_2$.`,
          r`$= ${s * s} - ${paren(2 * p)} = ${s * s - 2 * p}$.`,
        ],
      };
    },
  },
];
