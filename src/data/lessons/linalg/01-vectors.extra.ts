import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { add, allDistinct, chain, dot, ints, paren, shuffle, sub, vec } from '../gen.ts';

/** Pythagorean triples (a, b, c) with a² + b² = c². */
const TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25]];

/** Extra practice (Practice 2): gentler questions on the same ideas, with fresh numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'la-01-x1',
    difficulty: 1,
    keyConceptTag: 'Vector operations are componentwise',
    correctOptionId: 'a',
    generate: (g) => {
      const { u, v } = g.until(
        () => ({ u: ints(g, 3), v: ints(g, 3) }),
        ({ u, v }) => {
          const signLost = [u[0] + v[0], u[1] + v[1], u[2] - v[2]];
          return v[2] !== 0 && allDistinct([add(u, v), sub(u, v), u.map((x, i) => x * v[i]), signLost]);
        },
      );
      const ans = add(u, v);
      const signLost = [u[0] + v[0], u[1] + v[1], u[2] - v[2]];
      const prod = u.map((x, i) => x * v[i]);
      return {
        params: { u, v },
        promptText: r`Let $\mathbf{u} = ${vec(u)}$ and $\mathbf{v} = ${vec(v)}$. Compute $\mathbf{u} + \mathbf{v}$.`,
        options: [
          { id: 'a', label: r`$${vec(ans)}$`, value: ans },
          { id: 'b', label: r`$${vec(sub(u, v))}$`, value: sub(u, v), trapExplanation: r`That is $\mathbf{u} - \mathbf{v}$. For the sum, add matching components.` },
          { id: 'c', label: r`$${vec(prod)}$`, value: prod, trapExplanation: r`Multiplying components is not vector addition (and not the dot product either).` },
          { id: 'd', label: r`$${vec(signLost)}$`, value: signLost, trapExplanation: r`The third component is $${u[2]} + ${paren(v[2])} = ${u[2] + v[2]}$; the sign of $${v[2]}$ was lost.` },
        ],
        stepByStepSolution: [
          r`Vectors are added component by component.`,
          r`$(${u.map((x, i) => r`${x} + ${paren(v[i])}`).join(r`,\ `)})$.`,
          r`$= ${vec(ans)}$.`,
        ],
      };
    },
  },
  {
    id: 'la-01-x2',
    difficulty: 1,
    keyConceptTag: 'Scalar multiplication',
    correctOptionId: 'a',
    generate: (g) => {
      const { c, x, y } = g.until(
        () => ({ c: g.int(2, 5), x: g.nonzero(-6, 6), y: g.nonzero(-6, 6) }),
        ({ c, x, y }) => allDistinct([[c * x, c * y], [c * x, y], [x + c, y + c], [c * x, -c * y]]),
      );
      return {
        params: { c, v: [x, y] },
        promptText: r`Compute $${c} \cdot (${x}, ${y})$.`,
        options: [
          { id: 'a', label: r`$(${c * x}, ${c * y})$`, value: [c * x, c * y] },
          { id: 'b', label: r`$(${c * x}, ${y})$`, value: [c * x, y], trapExplanation: r`A scalar multiplies <i>every</i> component, not just the first.` },
          { id: 'c', label: r`$(${x + c}, ${y + c})$`, value: [x + c, y + c], trapExplanation: r`Scaling multiplies; adding ${c} to each component is a different operation (and not a linear one).` },
          { id: 'd', label: r`$(${c * x}, ${-c * y})$`, value: [c * x, -c * y], trapExplanation: r`$${c} \cdot ${paren(y)} = ${c * y}$: multiplying by a positive number keeps the sign.` },
        ],
        stepByStepSolution: [
          r`$c\,(x, y) = (cx, cy)$.`,
          r`$${c} \cdot ${paren(x)} = ${c * x}$ and $${c} \cdot ${paren(y)} = ${c * y}$.`,
          r`$(${c * x}, ${c * y})$: the same direction as $(${x}, ${y})$, ${c} times as long.`,
        ],
      };
    },
  },
  {
    id: 'la-01-x3',
    difficulty: 1,
    keyConceptTag: 'Length is the root of the sum of squares',
    correctOptionId: 'a',
    generate: (g) => {
      const [a, b, c] = g.pick(TRIPLES);
      const v = shuffle(g, [a, b]).map((x) => x * g.pick([-1, 1]));
      const s = a + b;
      return {
        params: { v },
        promptText: r`What is the length of $\mathbf{v} = ${vec(v)}$?`,
        options: [
          { id: 'a', label: r`$${c}$`, value: c },
          { id: 'b', label: r`$${s}$`, value: s, trapExplanation: r`Length is not the sum of the (absolute) components; use Pythagoras.` },
          { id: 'c', label: r`$${c * c}$`, value: c * c, trapExplanation: r`$${a * a} + ${b * b} = ${c * c}$ is the <i>squared</i> length; take the square root.` },
          { id: 'd', label: r`$\sqrt{${s}}$`, value: Math.sqrt(s), trapExplanation: r`Square the components before adding: $${a * a} + ${b * b}$, not $${a} + ${b}$.` },
        ],
        stepByStepSolution: [
          r`$\|\mathbf{v}\| = \sqrt{v_1^2 + v_2^2}$.`,
          r`$\sqrt{${paren(v[0])}^2 + ${paren(v[1])}^2} = \sqrt{${c * c}}$.`,
          r`$= ${c}$.`,
        ],
      };
    },
  },
  {
    id: 'la-01-x4',
    difficulty: 2,
    keyConceptTag: 'Dot product',
    correctOptionId: 'a',
    generate: (g) => {
      const { u, v } = g.until(
        () => ({ u: ints(g, 3), v: ints(g, 3) }),
        ({ u, v }) => {
          const prods = u.map((x, i) => x * v[i]);
          return prods.some((p) => p < 0) && allDistinct([dot(u, v), prods.reduce((s, p) => s + Math.abs(p), 0), prods, (u[0] + u[1] + u[2]) * (v[0] + v[1] + v[2])]);
        },
      );
      const prods = u.map((x, i) => x * v[i]);
      const absSum = prods.reduce((s, p) => s + Math.abs(p), 0);
      const sums = (u[0] + u[1] + u[2]) * (v[0] + v[1] + v[2]);
      return {
        params: { u, v },
        promptText: r`Compute the dot product $${vec(u)} \cdot ${vec(v)}$.`,
        options: [
          { id: 'a', label: r`$${dot(u, v)}$`, value: dot(u, v) },
          { id: 'b', label: r`$${absSum}$`, value: absSum, trapExplanation: r`The negative products were counted as positive. Keep the signs.` },
          { id: 'c', label: r`$${vec(prods)}$`, value: prods, trapExplanation: r`The dot product is a <i>number</i>: multiply matching components, then add them up.` },
          { id: 'd', label: r`$${sums}$`, value: sums, trapExplanation: r`Multiplying the two component sums mixes every component with every other; only matching components are multiplied.` },
        ],
        stepByStepSolution: [
          r`$\mathbf{u} \cdot \mathbf{v} = u_1 v_1 + u_2 v_2 + u_3 v_3$.`,
          r`$${u.map((x, i) => r`${paren(x)} \cdot ${paren(v[i])}`).join(' + ')} = ${chain(prods)}$.`,
          r`$= ${dot(u, v)}$.`,
        ],
      };
    },
  },
  {
    id: 'la-01-x5',
    difficulty: 2,
    keyConceptTag: 'Zero dot product means perpendicular',
    correctOptionId: 'a',
    generate: (g) => {
      const [a, b] = [g.int(1, 6), g.nonzero(-6, 6)];
      const u = [a, b];
      const v = [-b, a];
      return {
        params: { u, v },
        promptText: r`What is the angle between $\mathbf{u} = ${vec(u)}$ and $\mathbf{v} = ${vec(v)}$?`,
        options: [
          { id: 'a', label: r`$90^\circ$`, value: 90 },
          { id: 'b', label: r`$0^\circ$`, value: 0, trapExplanation: r`$0^\circ$ would mean the same direction. These vectors are not multiples of each other.` },
          { id: 'c', label: r`$180^\circ$`, value: 180, trapExplanation: r`$180^\circ$ would need $\mathbf{v} = c\,\mathbf{u}$ with $c < 0$, which is not the case.` },
          { id: 'd', label: r`$45^\circ$`, value: 45, trapExplanation: r`Compute $\mathbf{u} \cdot \mathbf{v}$ first: it is 0, which gives $\cos\theta = 0$.` },
        ],
        stepByStepSolution: [
          r`$\mathbf{u} \cdot \mathbf{v} = ${a} \cdot ${paren(-b)} + ${paren(b)} \cdot ${a} = 0$.`,
          r`$\cos\theta = \dfrac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\|\,\|\mathbf{v}\|} = 0$.`,
          r`So $\theta = 90^\circ$: turning $(a, b)$ into $(-b, a)$ always gives a perpendicular vector.`,
        ],
      };
    },
  },
  {
    id: 'la-01-x6',
    difficulty: 2,
    keyConceptTag: 'Coefficients of a linear combination',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(
        () => ({ a: g.int(-5, 5), b: g.nonzero(-5, 5) }),
        ({ a, b }) => allDistinct([[a, b], [b, a], [a + b, a - b], [a, -b]]),
      );
      const t = [a + b, a - b];
      return {
        params: { t },
        promptText: r`Find $a$ and $b$ such that $a(1, 1) + b(1, -1) = ${vec(t)}$.`,
        options: [
          { id: 'a', label: r`$a = ${a},\ b = ${b}$`, value: [a, b] },
          { id: 'b', label: r`$a = ${b},\ b = ${a}$`, value: [b, a], trapExplanation: r`Check the second component: $a - b = ${b} - ${paren(a)} = ${b - a}$, not ${t[1]}.` },
          { id: 'c', label: r`$a = ${t[0]},\ b = ${t[1]}$`, value: t, trapExplanation: r`The coefficients are not the target's components: $${t[0]}(1, 1) + ${paren(t[1])}(1, -1) = (${t[0] + t[1]}, ${t[0] - t[1]})$.` },
          { id: 'd', label: r`$a = ${a},\ b = ${-b}$`, value: [a, -b], trapExplanation: r`$${a}(1, 1) + ${paren(-b)}(1, -1) = (${a - b}, ${a + b})$ — the components came out swapped.` },
        ],
        stepByStepSolution: [
          r`Componentwise: $a + b = ${t[0]}$ and $a - b = ${t[1]}$.`,
          r`Adding the equations: $2a = ${2 * a}$, so $a = ${a}$; then $b = ${b}$.`,
          r`Check: $${a}(1, 1) + ${paren(b)}(1, -1) = ${vec(t)}$.`,
        ],
      };
    },
  },
];
