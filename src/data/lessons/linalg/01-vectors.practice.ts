import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { add, allDistinct, chain, dot, frac, ints, lin, paren, shuffle, signed, sub, times, vec } from '../gen.ts';

/** Pythagorean quadruples (a, b, c, d) with a² + b² + c² = d². */
const QUADRUPLES = [[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [4, 4, 7, 9], [2, 6, 9, 11], [6, 6, 7, 11], [3, 4, 12, 13], [2, 10, 11, 15]];


export const practice: QuestionTemplate[] = [
  {
    id: 'la-01-1',
    difficulty: 1,
    keyConceptTag: 'Vector operations are componentwise',
    correctOptionId: 'a',
    generate: (g) => {
      const { u, v, k } = g.until(
        () => ({ u: ints(g, 3), v: ints(g, 3), k: g.int(2, 3) }),
        ({ u, v, k }) => v.every((x) => x !== 0) && allDistinct([sub(times(k, u), v), add(times(k, u), v), times(k, sub(u, v)), sub(v, times(k, u))]),
      );
      const ku = times(k, u);
      const ans = sub(ku, v);
      return {
        params: { u, v, k },
        promptText: r`Let $\mathbf{u} = ${vec(u)}$ and $\mathbf{v} = ${vec(v)}$. Compute $${k}\mathbf{u} - \mathbf{v}$.`,
        options: [
          { id: 'a', label: r`$${vec(ans)}$`, value: ans },
          { id: 'b', label: r`$${vec(add(ku, v))}$`, value: add(ku, v), trapExplanation: r`This is $${k}\mathbf{u} + \mathbf{v}$: the minus sign in front of $\mathbf{v}$ applies to every component.` },
          { id: 'c', label: r`$${vec(times(k, sub(u, v)))}$`, value: times(k, sub(u, v)), trapExplanation: r`This is $${k}(\mathbf{u} - \mathbf{v})$: the factor ${k} was applied to $\mathbf{v}$ as well. Only $\mathbf{u}$ is scaled.` },
          { id: 'd', label: r`$${vec(sub(v, ku))}$`, value: sub(v, ku), trapExplanation: r`This is $\mathbf{v} - ${k}\mathbf{u}$, the subtraction in the wrong order: the right answer with every sign flipped.` },
        ],
        stepByStepSolution: [
          r`Scale first: $${k}\mathbf{u} = ${vec(ku)}$.`,
          r`Subtract component by component: $(${ku.map((x, i) => r`${x} - ${paren(v[i])}`).join(r`,\ `)})$.`,
          r`Result: $${vec(ans)}$. Subtracting a negative component adds its absolute value.`,
        ],
      };
    },
  },
  {
    id: 'la-01-2',
    difficulty: 1,
    keyConceptTag: 'Zero dot product means perpendicular',
    correctOptionId: 'a',
    generate: (g) => {
      const [a, b] = [g.nonzero(-6, 6), g.nonzero(-6, 6)];
      const t = g.pick([-2, -1, 1, 2]);
      const u = [a, b];
      const v = [-t * b, t * a];
      return {
        params: { u, v },
        promptText: r`What is the angle between $\mathbf{u} = ${vec(u)}$ and $\mathbf{v} = ${vec(v)}$?`,
        options: [
          { id: 'a', label: r`$90^\circ$`, value: 90 },
          { id: 'b', label: r`$0^\circ$`, value: 0, trapExplanation: r`An angle of $0^\circ$ would mean the vectors point the same way, i.e. one is a positive multiple of the other. They are not multiples of each other.` },
          { id: 'c', label: r`$45^\circ$`, value: 45, trapExplanation: r`$45^\circ$ needs $\cos\theta = \tfrac{1}{\sqrt2}$. Compute the dot product first — here it is exactly zero.` },
          { id: 'd', label: r`$180^\circ$`, value: 180, trapExplanation: r`$180^\circ$ means opposite directions, which needs a negative dot product. The dot product here is 0.` },
        ],
        stepByStepSolution: [
          r`Dot product: $${paren(u[0])}\cdot ${paren(v[0])} + ${paren(u[1])}\cdot ${paren(v[1])} = ${chain([u[0] * v[0], u[1] * v[1]])} = 0$.`,
          r`$\cos\theta = 0 / (\|\mathbf{u}\|\|\mathbf{v}\|) = 0$.`,
          r`$\cos\theta = 0$ gives $\theta = 90^\circ$: the vectors are orthogonal. No lengths were needed.`,
        ],
      };
    },
  },
  {
    id: 'la-01-3',
    difficulty: 2,
    keyConceptTag: 'Length is the root of the sum of squares',
    correctOptionId: 'a',
    generate: (g) => {
      const { v, len } = g.until(
        () => {
          const q = g.pick(QUADRUPLES);
          const v = shuffle(g, q.slice(0, 3)).map((x) => x * g.pick([-1, 1]));
          return { v, len: q[3] };
        },
        ({ v, len }) => v.some((x) => x < 0) && allDistinct([len, v[0] + v[1] + v[2], Math.abs(v[0]) + Math.abs(v[1]) + Math.abs(v[2]), len * len]),
      );
      const sum = v[0] + v[1] + v[2];
      const abs = v.reduce((s, x) => s + Math.abs(x), 0);
      return {
        params: { v },
        promptText: r`What is the length of $\mathbf{v} = ${vec(v)}$?`,
        options: [
          { id: 'a', label: r`$${len}$`, value: len },
          { id: 'b', label: r`$${sum}$`, value: sum, trapExplanation: r`$${chain(v)} = ${sum}$ adds the components. Length squares them first, so signs never cancel.` },
          { id: 'c', label: r`$${abs}$`, value: abs, trapExplanation: r`${abs} adds absolute values. That is a different "length" (the taxicab norm); the usual length is $\sqrt{v_1^2 + v_2^2 + v_3^2}$.` },
          { id: 'd', label: r`$${len * len}$`, value: len * len, trapExplanation: r`$${len * len} = \mathbf{v}\cdot\mathbf{v}$ is the length <i>squared</i>. The square root is missing.` },
        ],
        stepByStepSolution: [
          r`$\|\mathbf{v}\|^2 = ${v.map((x) => r`${paren(x)}^2`).join(' + ')} = ${v.map((x) => x * x).join(' + ')} = ${len * len}$.`,
          r`$\|\mathbf{v}\| = \sqrt{${len * len}} = ${len}$.`,
          r`Squaring makes every term non-negative, so a minus sign in a component never reduces the length.`,
        ],
      };
    },
  },
  {
    id: 'la-01-4',
    difficulty: 2,
    keyConceptTag: 'Angle from the dot product',
    correctOptionId: 'a',
    generate: (g) => {
      // u = p(e_i + e_j), v = q(e_j + e_k): cos θ = pq / (2pq) = 1/2.
      const [i, j, k] = shuffle(g, [0, 1, 2]);
      const [p, q] = [g.int(1, 3), g.int(1, 3)];
      const u = [0, 0, 0];
      const v = [0, 0, 0];
      u[i] = p; u[j] = p; v[j] = q; v[k] = q;
      const d = dot(u, v);
      return {
        params: { u, v },
        promptText: r`What is the angle between $\mathbf{u} = ${vec(u)}$ and $\mathbf{v} = ${vec(v)}$?`,
        options: [
          { id: 'a', label: r`$60^\circ$`, value: 60 },
          { id: 'b', label: r`$45^\circ$`, value: 45, trapExplanation: r`$45^\circ$ would need $\cos\theta = \tfrac{1}{\sqrt2}$. You probably divided by only one of the lengths instead of their product.` },
          { id: 'c', label: r`$30^\circ$`, value: 30, trapExplanation: r`$\cos 30^\circ = \tfrac{\sqrt3}{2}$, but here $\cos\theta = \tfrac12$. The values for $30^\circ$ and $60^\circ$ are easy to swap.` },
          { id: 'd', label: r`$90^\circ$`, value: 90, trapExplanation: r`The vectors share a non-zero component, so the dot product is $${d}$, not $0$. They are not perpendicular.` },
        ],
        stepByStepSolution: [
          r`$\mathbf{u}\cdot\mathbf{v} = ${u.map((x, n) => r`${x}\cdot ${v[n]}`).join(' + ')} = ${d}$.`,
          r`$\|\mathbf{u}\| = ${p === 1 ? '' : p}\sqrt{2}$ and $\|\mathbf{v}\| = ${q === 1 ? '' : q}\sqrt{2}$, so $\cos\theta = \dfrac{${d}}{${2 * p * q}} = \dfrac12$.`,
          r`$\cos\theta = \tfrac12$ gives $\theta = 60^\circ$.`,
        ],
      };
    },
  },
  {
    id: 'la-01-5',
    difficulty: 3,
    keyConceptTag: 'Orthogonality condition',
    correctOptionId: 'a',
    generate: (g) => {
      // u = (k, a, b), v = (c, k, d): u·v = (a + c)k + bd = 0.
      const { a, b, c, d } = g.until(
        () => ({ a: g.nonzero(-4, 4), b: g.nonzero(-4, 4), c: g.nonzero(-4, 4), d: g.nonzero(-4, 4) }),
        ({ a, b, c, d }) => a + c !== 0 && allDistinct([-b * d / (a + c), b * d / (a + c), -b * d / c, -b * d / a]),
      );
      const kAns = -b * d / (a + c);
      return {
        params: { a, b, c, d },
        promptText: r`For which value of $k$ are $\mathbf{u} = (k, ${a}, ${b})$ and $\mathbf{v} = (${c}, k, ${d})$ orthogonal?`,
        options: [
          { id: 'a', label: r`$k = ${frac(-b * d, a + c)}$`, value: kAns },
          { id: 'b', label: r`$k = ${frac(b * d, a + c)}$`, value: (b * d) / (a + c), trapExplanation: r`The constant term is $${paren(b)}\cdot ${paren(d)} = ${b * d}$. Moving it to the other side changes its sign; this answer forgot that.` },
          { id: 'c', label: r`$k = ${frac(-b * d, c)}$`, value: (-b * d) / c, trapExplanation: r`This drops the middle product $${a}\cdot k$. The unknown appears in <i>both</i> vectors, so it shows up twice in the dot product.` },
          { id: 'd', label: r`$k = ${frac(-b * d, a)}$`, value: (-b * d) / a, trapExplanation: r`This drops the first product $k\cdot ${paren(c)}$. Every pair of matching components contributes.` },
        ],
        stepByStepSolution: [
          r`Orthogonal means $\mathbf{u}\cdot\mathbf{v} = 0$.`,
          r`$\mathbf{u}\cdot\mathbf{v} = ${lin([c, a], ['k', 'k'])} ${signed(b * d)} = ${lin([a + c], ['k'])} ${signed(b * d)}$.`,
          r`$${lin([a + c], ['k'])} ${signed(b * d)} = 0$ gives $k = ${frac(-b * d, a + c)}$.`,
        ],
      };
    },
  },
  {
    id: 'la-01-6',
    difficulty: 3,
    keyConceptTag: 'Coefficients of a linear combination',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q, a, b } = g.until(
        () => ({ p: ints(g, 2, -3, 3), q: ints(g, 2, -3, 3), a: g.nonzero(-4, 4), b: g.nonzero(-4, 4) }),
        ({ p, q, a, b }) => p[0] * q[1] - p[1] * q[0] !== 0 && a !== b && a !== -b && p.every((x) => x !== 0) && q.every((x) => x !== 0),
      );
      const t = add(times(a, p), times(b, q));
      return {
        params: { p, q, t },
        promptText: r`Find $a$ and $b$ such that $a${vec(p)} + b${vec(q)} = ${vec(t)}$.`,
        options: [
          { id: 'a', label: r`$a = ${a},\ b = ${b}$`, value: [a, b] },
          { id: 'b', label: r`$a = ${b},\ b = ${a}$`, value: [b, a], trapExplanation: r`The values are swapped: $${b}${vec(p)} + ${paren(a)}${vec(q)} = ${vec(add(times(b, p), times(a, q)))}$. Always substitute back.` },
          { id: 'c', label: r`$a = ${a},\ b = ${-b}$`, value: [a, -b], trapExplanation: r`$${a}${vec(p)} + ${paren(-b)}${vec(q)} = ${vec(add(times(a, p), times(-b, q)))}$: the sign of $b$ was lost.` },
          { id: 'd', label: 'No such $a$, $b$ exist', value: [], trapExplanation: r`$${vec(p)}$ and $${vec(q)}$ are not parallel, so together they span the whole plane: <i>every</i> vector in $\mathbb{R}^2$ is a combination of them.` },
        ],
        stepByStepSolution: [
          r`Componentwise: $${lin([p[0], q[0]], ['a', 'b'])} = ${t[0]}$ and $${lin([p[1], q[1]], ['a', 'b'])} = ${t[1]}$.`,
          r`Eliminate one unknown (multiply and subtract the equations), then substitute back: $a = ${a}$, $b = ${b}$.`,
          r`Check: $${a}${vec(p)} + ${paren(b)}${vec(q)} = ${vec(t)}$. ✓`,
        ],
      };
    },
  },
];
