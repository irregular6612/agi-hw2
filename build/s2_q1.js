// Part 2 "Idea: put a loop into the Transformer" — Q2: what can a looped Transformer compute, and can training find it?  (Session A)
const { T, add, figSeq, image, text, table, bars, remark } = require("./lib");
const { cover, answer } = require("./common");

const UT = 'Dehghani, Gouws, Vinyals, Uszkoreit, Kaiser, "Universal Transformers", ICLR 2019';
const GIA = 'Giannou, Rajput, Sohn, Lee, Lee, Papailiopoulos, "Looped Transformers as Programmable Computers", ICML 2023';
const SAU = 'Saunshi, Dikkala, Li, Kumar, Reddi, "Reasoning with Latent Thoughts: On the Power of Looped Transformers", ICLR 2025';

const OPTIONAL = false;   // optional slides cut for time

module.exports = function () {
  cover("Q2", "The idea: bring the RNN's recurrence into the Transformer, along depth. Then: how far can that go in principle, and can training find it?");

  figSeq({
    crumb: ["Q2", "UT"], cite: `${UT}, Fig. 1 and Sec. 2`,
    title: "Universal Transformers reuse one block again and again",
    fig: "ut-fig1.png", layout: "top",
    items: [
      { label: "Each position keeps a state, and attention mixes them.", body: "h₁…hₘ start as the token embeddings.", box: [0, 0.15, 0.29, 0.8] },
      { label: "A transition function updates every position.", body: "Hᵗ = LayerNorm(Aᵗ + Transition(Aᵗ)).", box: [0.3, 0.2, 0.53, 0.78] },
      { label: "Then the same block runs again.", body: "The time axis counts refinement steps, not tokens.", box: [0.53, 0.2, 1.0, 0.95] },
      { label: "Weights are tied across positions and steps.", body: "With T fixed, this is a T-layer Transformer whose layers share weights.", box: [0.14, 0, 0.92, 0.22] },
      { label: "With ACT, each position decides when to stop.", body: "A halted position is copied forward until every position halts." },
    ],
    remark: "Depth becomes a loop count, without adding parameters.",
    notes: ["", "A time-step embedding is added at every step, so the shared block knows which step it is on.", "", "", "ACT = Adaptive Computation Time (Graves 2016)."],
  });

  figSeq({
    crumb: ["Q2", "UT"], cite: `${UT}, Fig. 3, Sec. 3.1 and App. E (bar heights read from the plot)`,
    title: "UT spent more steps on the facts that answer the question",
    fig: "ut-fig3.png", layout: "top",
    items: [
      { label: "Ponder steps per sentence, for one bAbI question.", body: "“Where was the apple before the bathroom?” Most facts stop after one step." },
      { label: "The apple facts get 3–5 steps.", box: [[0.522, 0, 0.545, 0.98], [0.622, 0, 0.645, 0.98], [0.92, 0, 0.985, 0.98]] },
      { label: "Across the test set: 3.8 steps for 3-fact tasks, 3.1 for 2-fact, 2.3 for 1-fact." },
    ],
    remark: "Steps track how many facts a question needs. Caveat: the headline bAbI errors are the best of 10 seeds.",
  });

  figSeq({
    crumb: ["Q2", "Giannou"], cite: `${GIA}, Fig. 1, Sec. 3–5 and Alg. 1`,
    title: "A fixed Transformer becomes a computer once you loop it",
    fig: "giannou-fig1.png",
    items: [
      { label: "Hand-set weights, a fixed ≤ 13-layer network.", body: "The prompt holds scratchpad, memory and the program, like a punchcard.", box: [0.02, 0.08, 0.75, 0.86] },
      { label: "One pass runs one instruction; the output becomes the next input.", body: "for i = 1…T: X ← TF(W; X), like CPU clock cycles.", box: [0.72, 0.18, 0.93, 0.84] },
    ],
    remark: "Program length becomes loop count, not depth.",
  });

  if (OPTIONAL) {   // cut for time (storyline v6); set OPTIONAL = true to restore
  figSeq({
      crumb: ["Q2", "Giannou"], cite: `${GIA}, Fig. 5 and Sec. 5.1`,
      title: "One pass through the network runs one instruction",
      fig: "giannou-fig5.png", layout: "top",
      items: [
        { label: "Read the command, then the data it points to.", box: [0.03, 0.2, 0.38, 0.85] },
        { label: "Subtract, and write the result back to memory.", box: [0.41, 0.2, 0.77, 0.85] },
        { label: "Jump if the result is ≤ 0; otherwise go to the next line.", box: [0.8, 0.2, 0.96, 0.85] },
      ],
      remark: "This one instruction, SUBLEQ, is enough for a general-purpose computer. Nine layers and two heads run it.",
    });
  
  }

  add({
    crumb: ["Q2", "Giannou"], cite: `${GIA}, Table 1, Lemmas 4, 12, 13, 15 and Thm. 4`,
    title: "Every result here is a proof, not a measurement",
    notes: "The paper abstract says 13 layers, Theorem 1 says fewer than 13; we write ≤ 13. There are no experiments: these are sizes proved on paper.",
    draw: (s) => {
      table(s, { x: T.X, y: 1.55, w: 8.0 }, ["Program the looped network runs", "Layers", "Heads"], [
        ["SUBLEQ (one-instruction computer)", "9", "2"],
        ["Calculator: add, multiply, inverse, sqrt", "12", "m"],
        ["Matrix inversion", "13", "1"],
        ["SGD on a neural network", "13", "1"],
      ], { colW: [5.6, 1.2, 1.2], size: 18 });
      text(s, [
        { text: "Constant depth, any program.", options: { bold: true, breakLine: true } },
        { text: "But nothing here is trained or measured. Can gradient descent find such weights?", options: { breakLine: true } },
        { text: "Yang et al. 2024: yes for in-context regression, a small task, with one looped layer.", options: { color: T.gray } },
      ], { x: 8.9, y: 1.6, w: 4.0, h: 3.0 }, { fontSize: 19, paraSpaceAfter: 10 });
    },
  });

  if (OPTIONAL) {   // cut for time (storyline v6); set OPTIONAL = true to restore
  figSeq({
      crumb: ["Q2", "Saunshi"], cite: `${SAU}, Fig. 1 and Sec. 2`,
      title: "Compare loops at equal parameters and at equal FLOPs",
      fig: "saunshi-fig1.png", layout: "top",
      items: [
        { label: "Iso-param baseline (k ⊗ 1): k layers, run once.", box: [0.01, 0.03, 0.245, 0.97] },
        { label: "Looped (k ⊗ L): the same k layers, run L times.", body: "Same parameters as the left, same depth as the right.", box: [0.25, 0.03, 0.47, 0.97] },
        { label: "Iso-FLOP baseline (kL ⊗ 1): kL distinct layers.", body: "L times the parameters.", box: [0.47, 0.03, 0.725, 0.97] },
        { label: "If looped ≈ iso-FLOP ≫ iso-param, the task needs depth, not parameters.", box: [0.01, 0.03, 0.725, 0.97] },
      ],
    });
  
    const addBars = [
      { label: "1 layer, once\n(1 ⊗ 1)", value: 0.0, color: T.base },
      { label: "12 layers, once\n(12 ⊗ 1)", value: 100.0, color: T.navy },
      { label: "1 layer, 12 loops\n(1 ⊗ 12)", value: 99.6, color: T.gold },
    ];
    const addText = [
      "One layer alone cannot add 32 three-digit numbers.",
      "Twelve distinct layers solve it.",
      "One layer looped 12 times solves it too, with 1/12 of the parameters.",
    ];
    for (let k = 0; k < 3; k++) {
      add({
        crumb: ["Q2", "Saunshi"], cite: `${SAU}, Table 1 (best of 3 seeds)`,
        title: "One layer looped 12× adds as well as 12 distinct layers",
        draw: (s) => {
          text(s, "Accuracy (%), adding 32 numbers of 3 digits", { x: T.X, y: 1.35, w: 7, h: 0.4 }, { fontSize: 16, color: T.gray });
          bars(s, { x: T.X, y: 1.8, w: 7.0, h: 5.0 }, { bars: addBars, max: 110, reveal: k + 1, current: k, labelSize: 15 });
          text(s, addText.slice(0, k + 1).map((t, i) => ({ text: t, options: { color: i === k ? T.ink : T.past, bold: i === k, breakLine: true } })), { x: 8.1, y: 2.0, w: 4.8, h: 3.5 }, { fontSize: 19, paraSpaceAfter: 14 });
          if (k === 2) remark(s, "The same holds for p-hop and i-GSM: depth, not parameters, is what these tasks need.", { x: 8.1, y: 4.6, w: 4.8, h: 1.6 });
        },
      });
    }
  
  }

  // callback to #3–4
  add({
    crumb: ["Q2", "Saunshi"], cite: `${SAU}, Fig. 4 and Thm. 5.4`,
    title: "In theory, m loops can simulate m steps of chain of thought",
    notes: "Callback: the figure from the start of the talk, now animated. Theorem 5.4: for any L-layer Transformer, a looped one with L + O(1) layers, run m loops on the input plus m blank slots, gives the same output as m CoT steps. Proof idea: a loop counter updates only one slot per loop.",
    draw: (s) => {
      image(s, "gif/cot_vs_loop_slots.gif", { x: T.X, y: 1.25, w: 12.45, h: 3.65 });
      text(s, [
        { text: "Theorem 5.4. ", options: { bold: true } },
        { text: "Any L-layer Transformer running m CoT steps can be matched by a looped one with L + O(1) layers, run for m loops on m blank slots.", options: { breakLine: true } },
        { text: "An existence result: such weights exist. It does not say training finds them.", options: { color: T.gray } },
      ], { x: T.X, y: 5.0, w: 12.4, h: 1.8 }, { fontSize: 19, paraSpaceAfter: 8 });
    },
  });

  answer("Q2", {
    short: "In principle, a small loop can run any program. Training has found such loops only on small tasks.",
    evidence: [
      { t: "UT reuses one block along depth and lets each token decide when to stop.", src: "UT Fig. 1, Sec. 2" },
      { t: "A looped network of ≤ 13 layers can run any SUBLEQ program.", src: "Giannou Table 1" },
      { t: "m loops can simulate m chain-of-thought steps.", src: "Saunshi Thm. 5.4" },
      { t: "Giannou trains nothing; Yang trains a loop only on in-context regression.", src: "→ Huginn", kind: "but" },
    ],
  });
};
