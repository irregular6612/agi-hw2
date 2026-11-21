// Part 2 "Idea: put a loop into the Transformer" — Q2: what can a looped Transformer compute, and can training find it?  (Session A)
const { T, add, figSeq, image, text, table, bars, remark, spotlight, steps } = require("./lib");
const { cover, answer, question } = require("./common");

const UT = 'Dehghani, Gouws, Vinyals, Uszkoreit, Kaiser, "Universal Transformers", ICLR 2019';
const GIA = 'Giannou, Rajput, Sohn, Lee, Lee, Papailiopoulos, "Looped Transformers as Programmable Computers", ICML 2023';
const SAU = 'Saunshi, Dikkala, Li, Kumar, Reddi, "Reasoning with Latent Thoughts: On the Power of Looped Transformers", ICLR 2025';

const OPTIONAL = false;   // optional slides cut for time

module.exports = function () {
  cover("Q2", "The idea: bring the RNN's recurrence into the Transformer, along depth. Then: how far can that go in principle, and can training find it?");

  // before UT: one token's path through a stacked decoder vs a looped block (figures/gif/decoder_vs_looped.gif)
  add({
    crumb: ["Q2", "Idea"], title: "One token's path: up four layers, or four times round one block",
    cite: "Animation ours: decoder-only sketch after Vaswani et al. 2017, Fig. 1 and Sec. 3.1; loop as in Dehghani et al. 2019 (UT)",
    draw: (s) => {
      image(s, "gif/decoder_vs_looped.gif", { x: T.X, y: 1.25, w: 12.45, h: 5.55 });
    },
  });

  question("q-ut", "Can one block, used again and again, think in more steps, and know when to stop?", ["Q2", "UT"]);

  const UT_ITEMS = [
      { label: "Each position keeps a state, and attention mixes them.", body: "h₁…hₘ start as the token embeddings.", box: [0, 0.15, 0.29, 0.8] },
      { label: "A transition function updates every position.", body: "Hᵗ = LayerNorm(Aᵗ + Transition(Aᵗ)).", box: [0.3, 0.2, 0.53, 0.78] },
      { label: "Then the same block runs again.", body: "The time axis counts refinement steps, not tokens.", box: [0.53, 0.2, 1.0, 0.95] },
      { label: "Weights are tied across positions and steps.", body: "With T fixed, this is a T-layer Transformer whose layers share weights.", box: [0.14, 0, 0.92, 0.22] },
  ];
  figSeq({
    crumb: ["Q2", "UT"], cite: `${UT}, Fig. 1 and Sec. 2`,
    title: "Universal Transformers reuse one block again and again",
    fig: "ut-fig1.png", layout: "top",
    items: UT_ITEMS,
    notes: ["", "A time-step embedding is added at every step, so the shared block knows which step it is on.", "", ""],
  });

  // ACT inside the UT sequence (steps 5–8): zoom from one position of UT Fig. 1 into Graves 2016 Fig. 2
  const ACT_ITEMS = [
    { label: "Inside one position, the same transition runs again and again.", body: "Adaptive Computation Time (ACT, Graves 2016) lets that position take several steps before it is done.", box: [0.61, 0.17, 0.69, 0.72] },
    { label: "Each step outputs a halting score h.", body: "Stop once the scores add up to 1 − ε (ε = 0.01). The last step takes the remainder R.", box: [0.72, 0.17, 0.81, 0.72] },
    { label: "The result is the weighted average of the steps.", body: "Training adds a ponder cost, so the model does not think forever.", box: [[0.68, 0.70, 0.80, 0.86], [0.53, 0.0, 0.77, 0.19]] },
    { label: "UT applies this halting rule to every position, along depth.", body: "A halted position is copied forward until every position halts, or a step cap is reached." },
  ];
  const ALL_UT = [...UT_ITEMS, ...ACT_ITEMS];
  ACT_ITEMS.forEach((it, j) => {
    add({
      crumb: ["Q2", "UT"], cite: `${UT}, Fig. 1, Sec. 2.2 and App. C; zoomed view: Graves, "Adaptive Computation Time for Recurrent Neural Networks", arXiv:1603.08983, 2016, Fig. 2`,
      title: "Universal Transformers reuse one block again and again",
      draw: (s) => {
        const ut = image(s, "ut-fig1.png", { x: T.X, y: 1.35, w: 6.2, h: 2.0 }, "left");
        const zb = { x: ut.x + 0.30 * ut.w, y: ut.y + 0.20 * ut.h, w: 0.23 * ut.w, h: 0.58 * ut.h };   // one position's transition
        s.addShape("rect", { ...zb, fill: { type: "none" }, line: { color: T.gold, width: 2 } });
        const P = { x: 7.0, y: 1.35, w: 5.9, h: 4.6 };
        const g = image(s, "act-graves-fig2.png", P);
        s.addShape("rect", { x: g.x - 0.05, y: g.y - 0.05, w: g.w + 0.1, h: g.h + 0.1, fill: { type: "none" }, line: { color: T.gold, width: 2 } });
        s.addShape("line", { x: zb.x + zb.w, y: zb.y, w: g.x - 0.05 - (zb.x + zb.w), h: 0, line: { color: T.gold, width: 1, dashType: "dash" } });
        s.addShape("line", { x: zb.x + zb.w, y: zb.y + zb.h, w: g.x - 0.05 - (zb.x + zb.w), h: 0.6, line: { color: T.gold, width: 1, dashType: "dash" } });
        text(s, "Zoom: one position, with ACT", { x: P.x, y: g.y + g.h + 0.08, w: P.w, h: 0.3 }, { fontSize: 13, color: T.gray, align: "right" });
        spotlight(s, g, it.box);
        steps(s, ALL_UT, UT_ITEMS.length + j, { x: T.X, y: ut.y + ut.h + 0.9, w: 6.2, h: 2.8 }, { onlyCurrent: true });
      },
    });
  });

  // bAbI setup before the ponder-time result
  add({
    crumb: ["Q2", "UT"], cite: `${UT}, Sec. 3.1 and App. D.1`,
    title: "The test: bAbI, questions about short stories",
    draw: (s) => {
      text(s, [
        "20 synthetic tasks. Each is a short story of simple sentences, then a question.",
        "Some questions need 1 supporting fact, some 2, some 3.",
        "UT reads each sentence as one position; the question is one more position.",
        "Ponder time = how many loop steps a position takes before ACT halts it.",
      ].map((t, i) => ({ text: `${i + 1}  ${t}`, options: { breakLine: true } })), { x: T.X, y: 1.6, w: 12.4, h: 3.2 }, { fontSize: 22, paraSpaceAfter: 14 });
      s.addShape("rect", { x: T.X, y: 5.0, w: 12.4, h: 1.2, fill: { color: "F7F7F7" }, line: { type: "none" } });
      text(s, [
        { text: "Example question  ", options: { bold: true, color: T.gold } },
        { text: "“Where was the apple before the bathroom?” The story is long; only a few of its sentences are about the apple." },
      ], { x: T.X + 0.25, y: 5.05, w: 11.9, h: 1.1 }, { fontSize: 19, valign: "middle" });
    },
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

  question("q-giannou", "If we keep looping one fixed Transformer, what can it compute?", ["Q2", "Giannou"]);

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

  // What a looped network can run: overview, then one GIF per program (build/gif/make_gifs_giannou.py)
  const PROGS = [
    ["SUBLEQ (one-instruction computer)", "9", "2", "giannou_subleq.gif"],
    ["Calculator: add, multiply, inverse, sqrt", "12", "m", "giannou_calculator.gif"],
    ["Matrix inversion", "13", "1", "giannou_matrix_inverse.gif"],
    ["SGD on a neural network", "13", "1", "giannou_sgd.gif"],
  ];
  for (let k = -1; k < PROGS.length; k++) {
    add({
      crumb: ["Q2", "Giannou"], cite: `${GIA}, Table 1, Lemmas 4, 12, 13, 15 and Thm. 4${k >= 0 ? "; animation ours, values illustrative" : ""}`,
      title: "Looping lets one small fixed network run real programs",
      notes: k < 0 ? "The paper abstract says 13 layers, Theorem 1 says fewer than 13; we write ≤ 13. These sizes are constructions on paper, not trained models." : undefined,
      draw: (s) => {
        const rows = PROGS.map(([p, l, h]) => [p, l, h]);
        if (k < 0) {
          table(s, { x: T.X, y: 1.55, w: 8.0 }, ["Program the looped network runs", "Layers", "Heads"], rows, { colW: [5.6, 1.2, 1.2], size: 18 });
          text(s, "The depth stays fixed. A longer program just means more loops.", { x: 8.9, y: 1.6, w: 4.0, h: 2.0 }, { fontSize: 20, bold: true });
          return;
        }
        const [p, l, h] = PROGS[k];
        text(s, [
          { text: `${k + 1} / ${PROGS.length}  `, options: { color: T.gray } },
          { text: p, options: { bold: true, color: T.gold } },
          { text: `   ${l} layers · ${h} head${h === "1" ? "" : "s"}`, options: { color: T.gray } },
        ], { x: T.X, y: 1.25, w: 12.4, h: 0.5 }, { fontSize: 20 });
        image(s, `gif/${PROGS[k][3]}`, { x: T.X, y: 1.85, w: 12.45, h: 5.1 });
      },
    });
  }


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
    short: "In principle, a small looped Transformer can run any program.",
    evidence: [
      { t: "UT reuses one block along depth and lets each token decide when to stop.", src: "UT Fig. 1, Sec. 2" },
      { t: "A looped network of ≤ 13 layers can run any SUBLEQ program.", src: "Giannou Table 1" },
      { t: "m loops can simulate m chain-of-thought steps.", src: "Saunshi Thm. 5.4" },
      { t: "These weights are set by hand. Whether training finds such loops in a language model is Q3.", src: "→ Huginn", kind: "but" },
    ],
  });
};
