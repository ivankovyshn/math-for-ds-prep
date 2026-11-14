import type { Question } from '../../types.ts';

const r = String.raw;

export const combinatorics: Question[] = [
  {
    id: 'com-01',
    moduleId: 'combinatorics',
    difficulty: 1,
    promptText: r`The prime factorization of $72$ is $72 = 2^3\cdot 3^2$.

How many positive divisors does $72$ have?`,
    options: [
      { id: 'a', label: r`$5$`, value: 5, trapExplanation: r`$3 + 2 = 5$ adds the exponents. Independent choices are <i>multiplied</i>, and each exponent may also be $0$.` },
      { id: 'b', label: r`$6$`, value: 6, trapExplanation: r`$3\cdot 2 = 6$ forgets that each prime may also be left out (exponent $0$). There are $4$ and $3$ choices, not $3$ and $2$.` },
      { id: 'c', label: r`$8$`, value: 8, trapExplanation: r`$8 = 2^3$ is a divisor of $72$, not the number of divisors.` },
      { id: 'd', label: r`$12$`, value: 12 },
      { id: 'e', label: r`$24$`, value: 24, trapExplanation: r`Negative divisors are not counted — the question asks for positive divisors only, so there is no extra factor $2$.` },
    ],
    correctOptionId: 'd',
    stepByStepSolution: [
      r`Every divisor of $72$ has the form $2^a\cdot 3^b$ and cannot use more of a prime than $72$ itself has.`,
      r`So $a \in \{0,1,2,3\}$ — 4 choices — and $b \in \{0,1,2\}$ — 3 choices.`,
      r`The choices are independent: $4\cdot 3 = 12$ divisors.`,
      r`General rule: $p^{a} q^{b}$ has $(a+1)(b+1)$ divisors.`,
    ],
    keyConceptTag: 'Divisor counting · (a+1)(b+1)',
  },
  {
    id: 'com-02',
    moduleId: 'combinatorics',
    difficulty: 1,
    promptText: r`A student has 4 shirts, 3 pairs of trousers and 2 pairs of shoes.

How many different outfits (one shirt, one pair of trousers, one pair of shoes) are possible?`,
    options: [
      { id: 'a', label: r`$9$`, value: 9, trapExplanation: r`$4+3+2$ would count the items in the wardrobe. An outfit combines one of each, so the numbers are multiplied.` },
      { id: 'b', label: r`$12$`, value: 12, trapExplanation: r`$4\cdot 3 = 12$ covers shirts and trousers only. Each of these 12 can still be worn with 2 different pairs of shoes.` },
      { id: 'c', label: r`$24$`, value: 24 },
      { id: 'd', label: r`$48$`, value: 48, trapExplanation: r`An extra factor of $2$ sneaked in. The order in which you put the clothes on does not create a new outfit.` },
      { id: 'e', label: r`$64$`, value: 64, trapExplanation: r`$4^3$ would mean 4 options for each of the three items. There are 4, 3 and 2 options.` },
    ],
    correctOptionId: 'c',
    stepByStepSolution: [
      r`Build the outfit in three independent steps: shirt, trousers, shoes.`,
      r`Fundamental counting principle: if step 1 can be done in $m$ ways and step 2 in $n$ ways, both together can be done in $m\cdot n$ ways.`,
      r`$4\cdot 3\cdot 2 = 24$.`,
    ],
    keyConceptTag: 'Fundamental counting principle',
  },
  {
    id: 'com-03',
    moduleId: 'combinatorics',
    difficulty: 1,
    promptText: r`We study positive integers whose prime factorization has these two properties:

• The only primes that appear are $2$ and $5$.

• Each of these primes appears at least once but at most four times.

The smallest such number is $10 = 2\cdot 5$, the largest is $10\,000 = 2^4\cdot 5^4$. How many such integers are there in total?`,
    options: [
      { id: 'a', label: r`$8$`, value: 8, trapExplanation: r`$4+4$ adds the options. Every exponent of 2 can be paired with every exponent of 5, so multiply.` },
      { id: 'b', label: r`$9$`, value: 9, trapExplanation: r`$3\cdot 3$ counts the <i>gaps</i> between 1 and 4. The exponents $1,2,3,4$ are four values.` },
      { id: 'c', label: r`$16$`, value: 16 },
      { id: 'd', label: r`$25$`, value: 25, trapExplanation: r`$5\cdot 5$ includes exponent $0$. But each prime must appear at least once.` },
      { id: 'e', label: r`$256$`, value: 256, trapExplanation: r`$4^4$ mixes up base and exponent: there are two primes with 4 options each, $4^2$.` },
    ],
    correctOptionId: 'c',
    stepByStepSolution: [
      r`Each number is $2^a\cdot 5^b$, and by unique factorization different pairs $(a,b)$ give different numbers.`,
      r`"At least once, at most four times" means $a \in \{1,2,3,4\}$: 4 choices. The same holds for $b$.`,
      r`Independent choices multiply: $4\cdot 4 = 16$.`,
    ],
    keyConceptTag: 'Exponent bounds · counting',
  },
  {
    id: 'com-04',
    moduleId: 'combinatorics',
    difficulty: 1,
    promptText: r`A lock code consists of 3 digits chosen from $1, 2, 3, 4, 5$. No digit may be used twice.

How many different codes are possible?`,
    options: [
      { id: 'a', label: r`$10$`, value: 10, trapExplanation: r`$\binom{5}{3} = 10$ counts <i>sets</i> of digits. In a code the order matters: 123 and 321 are different.` },
      { id: 'b', label: r`$60$`, value: 60 },
      { id: 'c', label: r`$120$`, value: 120, trapExplanation: r`$5! = 120$ arranges all five digits. The code has only three positions.` },
      { id: 'd', label: r`$125$`, value: 125, trapExplanation: r`$5^3$ allows repeated digits such as 115. Repetition is forbidden here.` },
      { id: 'e', label: r`$243$`, value: 243, trapExplanation: r`$3^5$ swaps the roles: there are 3 positions with (at most) 5 options each, not 5 positions with 3 options.` },
    ],
    correctOptionId: 'b',
    stepByStepSolution: [
      r`Fill the three positions one after another.`,
      r`First digit: 5 choices. Second: 4 remaining choices. Third: 3 remaining.`,
      r`$5\cdot 4\cdot 3 = 60$.`,
    ],
    keyConceptTag: 'Ordered selection without repetition',
  },
  {
    id: 'com-05',
    moduleId: 'combinatorics',
    difficulty: 2,
    promptText: r`We study positive integers whose prime factorization has these two properties:

• The only primes that appear are $2$, $3$, $5$ and $7$.

• Each of these primes appears at least once but at most three times.

How many such positive integers are there?`,
    options: [
      { id: 'a', label: r`$12$`, value: 12, trapExplanation: r`$3\cdot 4$ multiplies "options" by "primes". Each prime independently has 3 options: $3\cdot3\cdot3\cdot3$.` },
      { id: 'b', label: r`$24$`, value: 24, trapExplanation: r`$4! = 24$ counts orderings of the four primes. The order of factors does not change a number.` },
      { id: 'c', label: r`$64$`, value: 64, trapExplanation: r`$4^3$ swaps base and exponent. It is (options per prime)$^{\text{number of primes}} = 3^4$.` },
      { id: 'd', label: r`$81$`, value: 81 },
      { id: 'e', label: r`$256$`, value: 256, trapExplanation: r`$4^4$ allows exponent $0$ as a fourth option. But every prime must appear at least once.` },
    ],
    correctOptionId: 'd',
    stepByStepSolution: [
      r`Each number is $2^a 3^b 5^c 7^d$ with every exponent in $\{1, 2, 3\}$.`,
      r`That is 3 choices for each of 4 independent exponents.`,
      r`$3^4 = 81$. Unique factorization guarantees that no number is counted twice.`,
    ],
    keyConceptTag: 'Exponent bounds · counting',
  },
  {
    id: 'com-06',
    moduleId: 'combinatorics',
    difficulty: 2,
    promptText: r`The prime factorization of $360$ is $360 = 2^3\cdot 3^2\cdot 5$.

How many positive divisors of $360$ are odd?`,
    options: [
      { id: 'a', label: r`$3$`, value: 3, trapExplanation: r`This counts only $1, 3, 9$ and forgets that the prime $5$ may be included as well.` },
      { id: 'b', label: r`$6$`, value: 6 },
      { id: 'c', label: r`$12$`, value: 12, trapExplanation: r`"Half of all 24 divisors" — but even and odd divisors are not equally many. Only 1 of the 4 options for the exponent of 2 gives an odd number.` },
      { id: 'd', label: r`$18$`, value: 18, trapExplanation: r`$18$ is the number of <i>even</i> divisors ($24 - 6$).` },
      { id: 'e', label: r`$24$`, value: 24, trapExplanation: r`$4\cdot 3\cdot 2 = 24$ is the number of all divisors, even ones included.` },
    ],
    correctOptionId: 'b',
    stepByStepSolution: [
      r`A divisor is odd exactly when it contains no factor $2$, i.e. the exponent of 2 is $0$.`,
      r`So the odd divisors are $3^b\cdot 5^c$ with $b\in\{0,1,2\}$ and $c\in\{0,1\}$.`,
      r`$3\cdot 2 = 6$ odd divisors: $1, 3, 5, 9, 15, 45$.`,
    ],
    keyConceptTag: 'Divisors with a constraint',
  },
  {
    id: 'com-07',
    moduleId: 'combinatorics',
    difficulty: 2,
    promptText: r`The number $25! = 1\cdot 2\cdot 3\cdots 25$ is written out in full.

With how many zeros does it end?`,
    options: [
      { id: 'a', label: r`$2$`, value: 2, trapExplanation: r`This counts only the factors $10$ and $20$. A zero also appears whenever a $5$ meets any even number, e.g. $5\cdot 2$ or $15\cdot 4$.` },
      { id: 'b', label: r`$5$`, value: 5, trapExplanation: r`You counted the multiples of 5 ($5,10,15,20,25$) once each. But $25 = 5\cdot 5$ contributes two factors of 5.` },
      { id: 'c', label: r`$6$`, value: 6 },
      { id: 'd', label: r`$7$`, value: 7, trapExplanation: r`$25 = 5^2$ contributes two fives, not three.` },
      { id: 'e', label: r`$22$`, value: 22, trapExplanation: r`$22$ is the number of factors $2$ in $25!$. A trailing zero needs a pair $2\cdot5$, and fives are the scarce ones.` },
    ],
    correctOptionId: 'c',
    stepByStepSolution: [
      r`Each trailing zero is a factor $10 = 2\cdot 5$.`,
      r`Factors of 2 are plentiful, so the number of zeros equals the number of factors $5$ in $25!$.`,
      r`Multiples of 5 up to 25: $5, 10, 15, 20, 25$ — five numbers, one factor each.`,
      r`$25 = 5^2$ contributes one extra. Total: $5 + 1 = 6$ zeros.`,
    ],
    keyConceptTag: 'Prime factors of a factorial',
  },
  {
    id: 'com-08',
    moduleId: 'combinatorics',
    difficulty: 2,
    promptText: r`How many different five-letter strings can be formed by rearranging the letters of the word LEVEL?`,
    options: [
      { id: 'a', label: r`$10$`, value: 10, trapExplanation: r`$\binom{5}{2} = 10$ only places the two L's. The two E's still have to be placed among the remaining three positions.` },
      { id: 'b', label: r`$20$`, value: 20, trapExplanation: r`$\tfrac{5!}{3!}$ would be right if three letters were identical. Here there are two separate pairs: divide by $2!\cdot 2!$.` },
      { id: 'c', label: r`$30$`, value: 30 },
      { id: 'd', label: r`$60$`, value: 60, trapExplanation: r`You corrected for one repeated letter only. Both L and E appear twice.` },
      { id: 'e', label: r`$120$`, value: 120, trapExplanation: r`$5! = 120$ treats all five letters as different. Swapping the two L's (or the two E's) gives the same string.` },
    ],
    correctOptionId: 'c',
    stepByStepSolution: [
      r`If all five letters were different there would be $5! = 120$ arrangements.`,
      r`Swapping the two L's changes nothing, so every string was counted $2!$ times. The same holds for the two E's.`,
      r`$\dfrac{5!}{2!\cdot 2!} = \dfrac{120}{4} = 30$.`,
    ],
    keyConceptTag: 'Permutations with repetition',
  },
  {
    id: 'com-09',
    moduleId: 'combinatorics',
    difficulty: 3,
    promptText: r`How many of the integers $1, 2, \dots, 100$ are divisible by at least one of the numbers $2$, $3$ or $5$?`,
    options: [
      { id: 'a', label: r`$26$`, value: 26, trapExplanation: r`$26$ is the complement: the numbers divisible by <i>none</i> of 2, 3, 5.` },
      { id: 'b', label: r`$71$`, value: 71, trapExplanation: r`You subtracted the pairwise overlaps but did not add back the multiples of 30, which were removed once too often.` },
      { id: 'c', label: r`$74$`, value: 74 },
      { id: 'd', label: r`$77$`, value: 77, trapExplanation: r`The multiples of 30 were added back twice. They are added back exactly once.` },
      { id: 'e', label: r`$103$`, value: 103, trapExplanation: r`$50+33+20$ counts numbers like 6 or 30 several times. More than 100 numbers out of 100 is impossible.` },
    ],
    correctOptionId: 'c',
    stepByStepSolution: [
      r`Count the multiples: of 2: $50$, of 3: $33$, of 5: $20$. Sum: $103$ — with double counting.`,
      r`Subtract the pairwise overlaps: multiples of 6: $16$, of 10: $10$, of 15: $6$. That gives $103 - 32 = 71$.`,
      r`Multiples of 30 ($30, 60, 90$) were added 3 times and removed 3 times, so add them back once: $71 + 3 = 74$.`,
    ],
    keyConceptTag: 'Inclusion–exclusion',
  },
  {
    id: 'com-10',
    moduleId: 'combinatorics',
    difficulty: 3,
    promptText: r`Let $N = 2^4\cdot 3^3\cdot 5^2$.

How many positive divisors of $N$ are perfect squares?`,
    options: [
      { id: 'a', label: r`$2$`, value: 2, trapExplanation: r`Exponent $0$ is even too: $1 = 2^0 3^0 5^0$ is a perfect square, and so is $4 = 2^2\cdot 3^0\cdot 5^0$.` },
      { id: 'b', label: r`$12$`, value: 12 },
      { id: 'c', label: r`$18$`, value: 18, trapExplanation: r`For the prime 3 the even exponents not exceeding 3 are only $0$ and $2$ — two options, not three.` },
      { id: 'd', label: r`$30$`, value: 30, trapExplanation: r`"Half of all 60 divisors" is a guess. Count the allowed exponents for each prime instead.` },
      { id: 'e', label: r`$60$`, value: 60, trapExplanation: r`$5\cdot4\cdot3 = 60$ is the number of all divisors of $N$.` },
    ],
    correctOptionId: 'b',
    stepByStepSolution: [
      r`A number is a perfect square exactly when every exponent in its prime factorization is even.`,
      r`Exponent of 2: even values in $0..4$ are $0, 2, 4$ — 3 options.`,
      r`Exponent of 3: even values in $0..3$ are $0, 2$ — 2 options. Exponent of 5: $0, 2$ — 2 options.`,
      r`$3\cdot 2\cdot 2 = 12$.`,
    ],
    keyConceptTag: 'Square divisors · even exponents',
  },
  {
    id: 'com-11',
    moduleId: 'combinatorics',
    difficulty: 3,
    promptText: r`On the grid shown, you walk from $A$ to $B$ along the grid lines, moving only right or up. The grid is 4 squares wide and 3 squares high.

How many different shortest paths are there?`,
    svgDiagramType: 'gridPaths',
    options: [
      { id: 'a', label: r`$7$`, value: 7, trapExplanation: r`$7 = 4+3$ is the number of <i>steps</i> in each path, not the number of paths.` },
      { id: 'b', label: r`$12$`, value: 12, trapExplanation: r`$4\cdot 3 = 12$ is the number of squares in the grid.` },
      { id: 'c', label: r`$35$`, value: 35 },
      { id: 'd', label: r`$128$`, value: 128, trapExplanation: r`$2^7$ allows any right/up sequence of 7 steps. Only those with exactly 4 rights and 3 ups arrive at $B$.` },
      { id: 'e', label: r`$210$`, value: 210, trapExplanation: r`$7\cdot6\cdot5 = 210$ treats the three "up" steps as distinguishable. Divide by $3! = 6$.` },
    ],
    correctOptionId: 'c',
    stepByStepSolution: [
      r`Every shortest path consists of exactly 7 steps: 4 to the right (R) and 3 up (U).`,
      r`A path is fully described by a word such as RRURUUR. So count the words with 4 R's and 3 U's.`,
      r`Choose which 3 of the 7 positions are U: $\binom{7}{3} = \dfrac{7\cdot6\cdot5}{3\cdot2\cdot1} = 35$.`,
    ],
    keyConceptTag: 'Lattice paths · binomial coefficient',
  },
  {
    id: 'com-12',
    moduleId: 'combinatorics',
    difficulty: 3,
    promptText: r`What is the last digit of $7^{2026}$?`,
    options: [
      { id: 'a', label: r`$1$`, value: 1, trapExplanation: r`The last digit is $1$ when the exponent is a multiple of 4 (e.g. $7^{2024}$). But $2026$ leaves remainder $2$.` },
      { id: 'b', label: r`$3$`, value: 3, trapExplanation: r`$3$ belongs to exponents with remainder $3$ modulo 4. $2026 = 4\cdot 506 + 2$.` },
      { id: 'c', label: r`$7$`, value: 7, trapExplanation: r`$7$ belongs to exponents with remainder $1$ modulo 4, such as $7^1$ or $7^{2025}$.` },
      { id: 'd', label: r`$9$`, value: 9 },
    ],
    correctOptionId: 'd',
    stepByStepSolution: [
      r`Only the last digit matters when multiplying, so follow the last digits of the powers of 7.`,
      r`$7^1 \to 7$, $7^2 \to 9$, $7^3 \to 3$, $7^4 \to 1$, and then the pattern $7, 9, 3, 1$ repeats with period 4.`,
      r`$2026 = 4\cdot 506 + 2$, so $7^{2026}$ ends like $7^2$.`,
      r`The last digit is $9$.`,
    ],
    keyConceptTag: 'Cyclic patterns · modular arithmetic',
  },
];
