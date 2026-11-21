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

  // The idea behind UT: plant the RNN's inductive bias (repeat one rule) inside the Transformer
  for (let k = 0; k < 2; k++) {
    add({
      crumb: ["Q2", "UT"], title: "Plant the RNN's inductive bias inside the Transformer",
      cite: `Vaswani et al., "Attention Is All You Need", NeurIPS 2017, Fig. 1; Graves, arXiv:1603.08983, 2016, Fig. 1 (RNN); ${UT}, Sec. 1`,
      draw: (s) => {
        text(s, "Transformer", { x: T.X, y: 1.25, w: 4.4, h: 0.4 }, { fontSize: 20, bold: true, align: "center" });
        const tf = image(s, "vaswani-fig1.png", { x: T.X, y: 1.7, w: 4.4, h: 3.55 });
        spotlight(s, tf, [0.48, 0.17, 0.75, 0.72], { veil: k === 1 });
        text(s, "N different layers, each used once. No bias toward repeating a rule.", { x: T.X, y: 5.3, w: 4.4, h: 0.8 }, { fontSize: 16, color: T.gray, align: "center" });
        text(s, "RNN", { x: 7.6, y: 1.25, w: 5.25, h: 0.4 }, { fontSize: 20, bold: true, align: "center" });
        const rnn = image(s, "act-graves-fig1.png", { x: 7.6, y: 1.9, w: 5.25, h: 3.1 });
        spotlight(s, rnn, [0.04, 0.42, 0.96, 0.6], { veil: k === 1 });
        text(s, "Bias toward iteration: the same rule S, applied step after step.", { x: 7.6, y: 5.3, w: 5.25, h: 0.8 }, { fontSize: 16, color: T.gray, align: "center" });
        if (k === 0) {
          text(s, "+", { x: 5.4, y: 2.9, w: 1.6, h: 1.0 }, { fontSize: 54, bold: true, color: T.gold, align: "center" });
          return;
        }
        s.addShape("rightArrow", { x: 5.25, y: 3.0, w: 1.9, h: 0.75, fill: { color: T.gold }, line: { type: "none" }, flipH: true });
        s.addShape("rect", { x: T.X, y: 6.05, w: 12.4, h: 0.75, fill: { color: T.paleGold }, line: { type: "none" } });
        text(s, [
          { text: "Universal Transformers: ", options: { bold: true, color: T.gold } },
          { text: "keep attention across positions, and repeat one block along depth, the way an RNN repeats S." },
        ], { x: T.X + 0.2, y: 6.05, w: 12.0, h: 0.75 }, { fontSize: 18, valign: "middle" });
      },
    });
  }

  const UT_ITEMS = [
      { label: "Each position keeps a state, and attention mixes them.", body: "The states h₁, h₂, … start as the token embeddings.", box: [0, 0.15, 0.29, 0.8] },
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
    { label: "Each step outputs a halting score h, and the steps are averaged by these scores.", body: "Stop once the scores add up to 1 − ε (ε = 0.01). A ponder cost keeps the model from thinking forever.", box: [[0.72, 0.17, 0.81, 0.72], [0.68, 0.70, 0.80, 0.86], [0.53, 0.0, 0.77, 0.19]] },
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

  // What a looped network can run: one table, each row with a picture of what the program is (build/gif/make_task_icons.py)
  const PROGS = [
    ["SUBLEQ", "one-instruction computer", "9", "2", "giannou-task-subleq.png"],
    ["Calculator", "add, multiply, inverse, sqrt", "12", "m", "giannou-task-calculator.png"],
    ["Matrix inversion", "", "13", "1", "giannou-task-matrix.png"],
    ["SGD", "on a neural network", "13", "1", "giannou-task-sgd.png"],
  ];
  add({
    crumb: ["Q2", "Giannou"], cite: `${GIA}, Table 1, Lemmas 4, 12, 13, 15 and Thm. 4; pictures ours, values illustrative`,
    title: "Looping lets one small fixed network run real programs",
    notes: "The paper abstract says 13 layers, Theorem 1 says fewer than 13; we write ≤ 13. These sizes are constructions on paper, not trained models.",
    draw: (s) => {
      const X = [T.X, 3.6, 9.75, 11.3], Wd = [3.15, 6.15, 1.55, 1.55], y0 = 1.35, hh = 0.42, rh = 1.1;
      s.addShape("rect", { x: T.X, y: y0, w: 12.4, h: hh, fill: { color: "F2F2F2" }, line: { type: "none" } });
      ["Program", "What it is", "Layers", "Heads"].forEach((h, i) =>
        text(s, h, { x: X[i] + 0.1, y: y0, w: Wd[i] - 0.1, h: hh }, { fontSize: 16, bold: true, valign: "middle" }));
      PROGS.forEach(([name, sub, l, h, pic], r) => {
        const y = y0 + hh + r * rh;
        s.addShape("line", { x: T.X, y: y + rh, w: 12.4, h: 0, line: { color: T.faint, width: 1 } });
        text(s, sub ? [{ text: name, options: { bold: true, breakLine: true } }, { text: sub, options: { color: T.gray, fontSize: 15 } }] : name,
          { x: X[0] + 0.1, y, w: Wd[0] - 0.1, h: rh }, { fontSize: 18, bold: !sub, valign: "middle" });
        image(s, pic, { x: X[1], y: y + 0.04, w: Wd[1], h: rh - 0.08 });
        text(s, l, { x: X[2] + 0.1, y, w: Wd[2], h: rh }, { fontSize: 20, valign: "middle" });
        text(s, h, { x: X[3] + 0.1, y, w: Wd[3], h: rh }, { fontSize: 20, valign: "middle" });
      });
      text(s, "The depth stays fixed. A longer program just means more loops.", { x: T.X, y: y0 + hh + 4 * rh + 0.1, w: 12.4, h: 0.45 }, { fontSize: 19, bold: true, color: T.gold });
    },
  });

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
