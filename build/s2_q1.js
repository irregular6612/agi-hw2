// §2 Q1 — Can reused layers compute what a deeper stack computes?  (Session A)
const { T, add, figSeq, image, spotlight, text, table, bars, remark } = require("./lib");
const { cover, answer } = require("./common");

const UT = 'Dehghani, Gouws, Vinyals, Uszkoreit, Kaiser, "Universal Transformers", ICLR 2019';
const GIA = 'Giannou, Rajput, Sohn, Lee, Lee, Papailiopoulos, "Looped Transformers as Programmable Computers", ICML 2023';
const SAU = 'Saunshi, Dikkala, Li, Kumar, Reddi, "Reasoning with Latent Thoughts: On the Power of Looped Transformers", ICLR 2025';

module.exports = function () {
  cover("Q1", "Before asking whether loops help in practice, we ask whether they can compute anything a deeper model can.");

  figSeq({
    crumb: ["Q1", "UT"], cite: `${UT}, Fig. 1 and Sec. 2`,
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
    crumb: ["Q1", "UT"], cite: `${UT}, Fig. 3, Sec. 3.1 and App. E (bar heights read from the plot)`,
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
    crumb: ["Q1", "Giannou"], cite: `${GIA}, Fig. 1, Sec. 3–5 and Alg. 1`,
    title: "A fixed Transformer becomes a computer once you loop it",
    fig: "giannou-fig1.png",
    items: [
      { label: "The prompt is a punchcard.", body: "Scratchpad, memory and instructions sit side by side in the input.", box: [0.06, 0.65, 0.71, 0.8] },
      { label: "Pointers are binary position codes.", body: "A sharp softmax over them reads one addressed column, like RAM.", box: [0.06, 0.8, 0.71, 0.86] },
      { label: "The weights are written by hand.", body: "Nothing is trained; every matrix is given explicitly.", box: [0.02, 0.08, 0.75, 0.64] },
      { label: "The output becomes the next input.", body: "for i = 1…T: X ← TF(W; X), like CPU clock cycles.", box: [0.72, 0.18, 0.93, 0.84] },
    ],
    remark: "Program length becomes loop count, not depth.",
  });

  figSeq({
    crumb: ["Q1", "Giannou"], cite: `${GIA}, Fig. 5 and Sec. 5.1`,
    title: "One pass through the network runs one instruction",
    fig: "giannou-fig5.png", layout: "top",
    items: [
      { label: "Read the command, then the data it points to.", box: [0.03, 0.2, 0.38, 0.85] },
      { label: "Subtract, and write the result back to memory.", box: [0.41, 0.2, 0.77, 0.85] },
      { label: "Jump if the result is ≤ 0; otherwise go to the next line.", box: [0.8, 0.2, 0.96, 0.85] },
    ],
    remark: "This one instruction, SUBLEQ, is enough for a general-purpose computer. Nine layers and two heads run it.",
  });

  add({
    crumb: ["Q1", "Giannou"], cite: `${GIA}, Table 1, Lemmas 4, 12, 13, 15 and Thm. 4`,
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
        { text: "But nothing here is trained, and nothing is measured. Can gradient descent find such weights? That is Q2." },
      ], { x: 8.9, y: 1.6, w: 4.0, h: 3.0 }, { fontSize: 19, paraSpaceAfter: 10 });
    },
  });

  figSeq({
    crumb: ["Q1", "Saunshi"], cite: `${SAU}, Fig. 1 and Sec. 2`,
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
      crumb: ["Q1", "Saunshi"], cite: `${SAU}, Table 1 (best of 3 seeds)`,
      title: "One layer looped 12× adds as well as 12 distinct layers",
      draw: (s) => {
        text(s, "Accuracy (%), adding 32 numbers of 3 digits", { x: T.X, y: 1.35, w: 7, h: 0.4 }, { fontSize: 16, color: T.gray });
        bars(s, { x: T.X, y: 1.8, w: 7.0, h: 5.0 }, { bars: addBars, max: 110, reveal: k + 1, current: k, labelSize: 15 });
        text(s, addText.slice(0, k + 1).map((t, i) => ({ text: t, options: { color: i === k ? T.ink : T.past, bold: i === k, breakLine: true } })), { x: 8.1, y: 2.0, w: 4.8, h: 3.5 }, { fontSize: 19, paraSpaceAfter: 14 });
        if (k === 2) remark(s, "The same holds for p-hop and i-GSM: depth, not parameters, is what these tasks need.", { x: 8.1, y: 4.6, w: 4.8, h: 1.6 });
      },
    });
  }

  // callback to #3–4
  add({
    crumb: ["Q1", "Saunshi"], cite: `${SAU}, Fig. 4 and Thm. 5.4`,
    title: "In theory, m loops can simulate m steps of chain of thought",
    notes: "Callback: this is the figure from the start of the talk. Theorem 5.4: for any L-layer Transformer, a looped one with L + O(1) layers, run m loops on the input plus m blank slots, gives the same output as m CoT steps. Proof idea: a loop counter updates only one slot per loop.",
    draw: (s) => {
      const r = image(s, "saunshi-fig4.png", { x: T.X, y: 1.3, w: 12.45, h: 3.4 });
      spotlight(s, r, [[0.03, 0, 0.37, 1], [0.64, 0, 0.99, 1]], { veil: false });
      text(s, "⇔", { x: r.x + r.w * 0.45, y: r.y + r.h * 0.4, w: 1.0, h: 0.8 }, { fontSize: 44, color: T.gold, bold: true, align: "center" });
      text(s, [
        { text: "Theorem 5.4. ", options: { bold: true } },
        { text: "Any L-layer Transformer running m CoT steps can be matched by a looped one with L + O(1) layers, run for m loops on m blank slots.", options: { breakLine: true } },
        { text: "An existence result: such weights exist. It does not say training finds them.", options: { color: T.gray } },
      ], { x: T.X, y: 5.0, w: 12.4, h: 1.8 }, { fontSize: 19, paraSpaceAfter: 8 });
    },
  });

  answer("Q1", {
    short: "Yes, in principle. Many reasoning tasks need depth, not parameters, and loops supply depth.",
    evidence: [
      { t: "A looped network of ≤ 13 layers can run any SUBLEQ program.", src: "Giannou Table 1" },
      { t: "One layer looped 12 times adds 32 numbers at 99.6%.", src: "Saunshi Table 1" },
      { t: "m loops can simulate m chain-of-thought steps.", src: "Saunshi Thm. 5.4" },
      { t: "Proofs and small synthetic tasks; nothing yet says training finds these weights.", src: "→ Q2", kind: "but" },
    ],
  });
};
