// Part 4 end (synthesis, Bitter Lesson callback, conclusion) + Part 5 "discussion topics" + Discussion, references  (Session B + both)
const { T, add, text, table } = require("./lib");
const { QS } = require("./common");

const ANS = [
  ["Layers cost parameters; CoT costs tokens. Depth per token stays fixed.", "Kaplan Sec. 1.1, Saunshi, UT App. B"],
  ["In principle, any program. Training found loops only on small tasks.", "Giannou (proof), Yang"],
  ["Per parameter, yes (math). Per FLOP at matched data, not shown.", "Huginn, MoR, Ouro"],
  ["Worth it up to the trained depth; readability can suffer under pressure.", "Ouro Table 10, Wang et al."],
]

module.exports = function () {
  add({
    crumb: ["Synthesis"], title: "Four questions, four answers",
    notes: "Read down the answer column: each one carries a limit. The common limit is the trained depth.",
    draw: (s) => {
      table(s, { x: T.X, y: 1.5, w: 12.4 }, ["", "Question", "Answer", "Key evidence"],
        QS.map((q, i) => [q.id, q.full, ANS[i][0], ANS[i][1]]), { colW: [0.7, 4.6, 4.4, 2.7], size: 16 });
      text(s, "Headlines: Astra's looping unconfirmed; RLT went from design document to toy results.", { x: T.X, y: 6.2, w: 12.4, h: 0.5 }, { fontSize: 17, color: T.gray });
    },
  });

  // Bitter Lesson callback: do loops scale? If not, where is the bottleneck?
  const neck = [
    ["Compute", "Loops save parameters, not FLOPs. Kaplan et al. (2020): Universal Transformers do slightly better per parameter, at extra compute per parameter. No same-data, same-FLOP win yet."],
    ["Latency", "[ours] Each loop waits for the one before. Depth becomes sequential again."],
    ["Memory", "Tied weights still keep a KV cache per loop, unless shared (MoR)."],
    ["Training", "Huginn backpropagates through only the last 8 loops; two runs failed."],
    ["Ceiling", "Past the trained depth, accuracy falls. Stored knowledge stays ≈2 bits per parameter (toy models)."],
  ];
  for (let k = 0; k < 2; k++) {
    add({
      crumb: ["Synthesis", "Bitter Lesson"], title: "Back to the Bitter Lesson: do loops scale?",
      cite: "Sutton 2019; Kaplan et al. 2020, Sec. 3.2.1; MoR Sec. 2.1; Huginn Sec. 3.3, 4.3; Ouro Table 10, Fig. 6, App. D.1",
      draw: (s) => {
        text(s, [
          { text: "Along parameters, yes. ", options: { bold: true, color: T.gold } },
          { text: "A looped model matches a larger one on math and reasoning (Saunshi, Ouro).", options: { color: k === 0 ? T.ink : T.past } },
        ], { x: T.X, y: 1.45, w: 12.4, h: 0.8 }, { fontSize: 21 });
        if (k === 0) {
          text(s, "Along compute, latency, and training depth: where is the bottleneck?", { x: T.X, y: 2.6, w: 12.4, h: 1.2 }, { fontSize: 30, bold: true });
          return;
        }
        neck.forEach(([h, b], i) => {
          const y = 2.35 + i * 0.72;
          text(s, h, { x: T.X, y, w: 1.9, h: 0.62 }, { fontSize: 18, bold: true, color: T.gold });
          text(s, b, { x: 2.4, y, w: 10.45, h: 0.66 }, { fontSize: 16 });
        });
        text(s, "[ours] Transformers won by removing sequential steps in time. Loops bring them back in depth.", { x: T.X, y: 6.0, w: 12.4, h: 0.6 }, { fontSize: 19, bold: true, color: T.navy });
      },
    });
  }

  for (let k = 0; k < 2; k++) {
    add({
      id: "conclusion", crumb: ["Conclusion"],
      notes: k === 0 ? "Say the answer once, slowly. Then the three things that would change it." : "These are what we would want to see before calling looping 'thinking longer'.",
      draw: (s) => {
        text(s, "Can a model think longer by reusing its layers instead of writing more tokens?", { x: 1.0, y: 1.2, w: 11.3, h: 0.9 }, { fontSize: 22, italic: true, color: T.gray });
        text(s, "Yes — up to the depth it was trained for.", { x: 1.0, y: 2.1, w: 11.3, h: 0.9 }, { fontSize: 36, bold: true, color: T.gold });
        text(s, "Beyond that, not yet; and what it adds is harder to read.", { x: 1.0, y: 3.0, w: 11.3, h: 0.8 }, { fontSize: 28, bold: true });
        if (k === 1) {
          text(s, "What would settle it", { x: 1.0, y: 4.1, w: 5.5, h: 0.45 }, { fontSize: 18, bold: true, color: T.gray });
          text(s, [
            "A same-data, same-FLOP comparison with a dense model at scale.",
            "Training that lets accuracy keep rising past the trained depth.",
            "A way to read the loop itself, not only the tokens it writes.",
          ].map((t, i) => ({ text: `${i + 1}  ${t}`, options: { breakLine: true } })), { x: 1.0, y: 4.6, w: 7.2, h: 2.0 }, { fontSize: 18, paraSpaceAfter: 8 });
          text(s, "Reading the next headline", { x: 8.6, y: 4.1, w: 4.2, h: 0.45 }, { fontSize: 18, bold: true, color: T.gray });
          text(s, ["Who claims it?", "What was measured?", "Against what baseline?"].map((t) => ({ text: t, options: { breakLine: true } })),
            { x: 8.6, y: 4.6, w: 4.2, h: 2.0 }, { fontSize: 18, paraSpaceAfter: 8 });
        }
      },
    });
  }

  const D = [
    ["Could we add loops to our Othello arena agent? If so, where and how?",
      "[ours] Candidates: loop a small block to update the board each move; let hard positions get more loops (MoR/Ouro-style exit); keep loop counts inside the trained depth.", "Othello arena"],
    ["If reasoning moves into loops, what should we monitor instead of the chain of thought?",
      "Candidates: how many loops each token used, probes on the latent path, keeping loop counts inside the trained range. None is validated yet.", "safety"],
    ["Loops extrapolate on parity, but not on addition and not past the trained depth. Is that generalization, and would it help on ARC-AGI?",
      "A loop repeats one learned step. ARC asks for new combinations of steps; we have seen no evidence that more repetitions supply that.", "generalization · ARC-AGI"],
  ];

  // Part 5 + Discussion on one page: three questions with our starting points
  add({
    id: "discussion", crumb: ["Discussion"], session: "Discussion", title: "Discussion: three questions",
    notes: "Introduce all three, then open the floor. Offer a starting point only if the room is quiet.",
    draw: (s) => {
      D.forEach(([q, take, link], i) => {
        const y = 1.45 + i * 1.8;
        text(s, String(i + 1), { x: T.X, y, w: 0.5, h: 0.6 }, { fontSize: 28, bold: true, color: T.gold });
        text(s, [
          { text: q, options: { bold: true, breakLine: true } },
          { text: `${link} · `, options: { color: T.gold, fontSize: 14, bold: true } },
          { text: take, options: { color: T.gray, fontSize: 14 } },
        ], { x: 1.1, y, w: 11.75, h: 1.7 }, { fontSize: 20, paraSpaceAfter: 4 });
      });
    },
  });

  add({
    crumb: ["References"], title: "Thank you",
    draw: (s) => {
      const refs = [
        "Hochreiter & Schmidhuber, Long Short-Term Memory, Neural Computation 1997 · Vaswani et al., Attention Is All You Need, NeurIPS 2017",
        "Battaglia et al., Relational inductive biases, deep learning, and graph networks, arXiv:1806.01261 · Sutton, The Bitter Lesson, 2019",
        "Kaplan et al., Scaling Laws for Neural Language Models, arXiv:2001.08361",
        "Dehghani et al., Universal Transformers, ICLR 2019, arXiv:1807.03819",
        "Giannou et al., Looped Transformers as Programmable Computers, ICML 2023, arXiv:2301.13196",
        "Yang et al., Looped Transformers are Better at Learning Learning Algorithms, ICLR 2024, arXiv:2311.12424",
        "Saunshi et al., Reasoning with Latent Thoughts: On the Power of Looped Transformers, ICLR 2025, arXiv:2502.17416",
        "Geiping et al., Scaling up Test-Time Compute with Latent Reasoning: A Recurrent Depth Approach, arXiv:2502.05171",
        "Bae et al., Mixture-of-Recursions, arXiv:2507.10524 · Zhu et al., Scaling Latent Reasoning via Looped Language Models (Ouro), arXiv:2510.25741",
        "OpenAI, GPT-6 Astra System Card, 3 Sept 2026; S. Raschka, Ahead of AI, 2 and 9 Sept 2026",
        "Wang, Balappanawar, Zhang, On the Chain-of-Thought Monitorability of Looped Language Models, arXiv:2610.02741",
        "Zhang et al., Recurrent Looped Transformer, arXiv:2610.07591",
      ];
      text(s, refs.map((r) => ({ text: r, options: { breakLine: true } })), { x: T.X, y: 1.4, w: 12.4, h: 5.5 }, { fontSize: 13, paraSpaceAfter: 5, color: T.gray });
    },
  });
};
