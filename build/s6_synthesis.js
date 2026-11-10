// §6 Synthesis & conclusion, §7 Discussion, references  (Session B + both)
const { T, add, text, table } = require("./lib");
const { QS } = require("./common");

const ANS = [
  ["Yes, in principle: many tasks need depth, not parameters.", "Proofs and synthetic tasks"],
  ["Yes, within the depth it was trained for.", "Huginn: GSM8K 0 → 42 from r = 1 to 32"],
  ["Per parameter, yes (math). Per FLOP at matched data, not shown.", "Saunshi, MoR, Ouro"],
  ["Readability, sometimes. Less is established than the headlines say.", "Logic 78 → 42 under pressure"],
];

module.exports = function () {
  add({
    crumb: ["Synthesis"], title: "Four questions, four answers",
    notes: "Read down the answer column: each one carries a limit. The common limit is the trained depth.",
    draw: (s) => {
      table(s, { x: T.X, y: 1.5, w: 12.4 }, ["", "Question", "Answer", "Key evidence"],
        QS.map((q, i) => [q.id, q.full, ANS[i][0], ANS[i][1]]), { colW: [0.7, 4.6, 4.4, 2.7], size: 16 });
    },
  });

  add({
    crumb: ["Synthesis"], title: "Where claims ran ahead of measurements",
    notes: "Not a criticism of any one paper; it is what to check when you read the next one.",
    draw: (s) => {
      const cards = [
        ["UT", "State of the art on bAbI", "Best of 10 seeds; the 10-seed mean is worse"],
        ["Giannou", "Looped Transformers are computers", "Proofs; nothing trained or measured"],
        ["MoR", "Wins at equal FLOPs", "Saw 35% more tokens (27B vs 20B)"],
        ["Ouro", "2–3× parameter efficiency", "External baselines; own control favors no looping"],
        ["Astra", "GPT-6 loops", "One press report, unconfirmed"],
        ["RLT", "Infinite temporal depth", "Design doc, then 26M-param toy tasks"],
      ];
      cards.forEach(([who, claim, meas], i) => {
        const x = T.X + (i % 3) * 4.2, y = 1.5 + Math.floor(i / 3) * 2.65, w = 3.95, h = 2.4;
        s.addShape("rect", { x, y, w, h, fill: { color: "FFFFFF" }, line: { color: "D9D9D9", width: 1 } });
        text(s, who, { x: x + 0.2, y: y + 0.15, w: w - 0.4, h: 0.35 }, { fontSize: 14, bold: true, color: T.gold });
        text(s, `“${claim}”`, { x: x + 0.2, y: y + 0.5, w: w - 0.4, h: 0.8 }, { fontSize: 19, bold: true });
        text(s, meas, { x: x + 0.2, y: y + 1.35, w: w - 0.4, h: 0.9 }, { fontSize: 16, color: T.gray });
      });
    },
  });

  for (let k = 0; k < 2; k++) {
    add({
      id: "conclusion", crumb: ["Conclusion"],
      notes: k === 0 ? "Say the answer once, slowly. Then the three things that would change it." : "These are what we would want to see before calling looping 'thinking longer'.",
      draw: (s) => {
        text(s, "Can a model think longer by reusing its layers instead of writing more tokens?", { x: 1.0, y: 1.2, w: 11.3, h: 0.9 }, { fontSize: 22, italic: true, color: T.gray });
        text(s, "Yes — up to the depth it was trained for.", { x: 1.0, y: 2.1, w: 11.3, h: 0.9 }, { fontSize: 36, bold: true, color: T.gold });
        text(s, "Beyond that, not yet; and what it adds is harder to read.", { x: 1.0, y: 3.0, w: 11.3, h: 0.8 }, { fontSize: 28, bold: true });
        if (k === 1) {
          text(s, "What would settle it", { x: 1.0, y: 4.25, w: 11.3, h: 0.45 }, { fontSize: 18, bold: true, color: T.gray });
          text(s, [
            "A same-data, same-FLOP comparison with a dense model at scale.",
            "Training that lets accuracy keep rising past the trained depth.",
            "A way to read the loop itself, not only the tokens it writes.",
          ].map((t, i) => ({ text: `${i + 1}  ${t}`, options: { breakLine: true } })), { x: 1.0, y: 4.75, w: 11.3, h: 1.8 }, { fontSize: 20, paraSpaceAfter: 8 });
        }
      },
    });
  }

  const D = [
    ["Universal Transformers looped in 2018. What, if anything, is new in 2025–26?",
      "Not the idea. The recipe (input injection, random depth, truncated backprop, stable norms) and the scale (800B to 7.7T tokens).", "novelty"],
    ["If reasoning moves into loops, what should we monitor instead of the chain of thought?",
      "Candidates: how many loops each token used, probes on the latent path, keeping loop counts inside the trained range. None is validated yet.", "safety"],
    ["Loops extrapolate on parity, but not on addition and not past the trained depth. Is that generalization, and would it help on ARC-AGI?",
      "A loop repeats one learned step. ARC asks for new combinations of steps; we have seen no evidence that more repetitions supply that.", "generalization · ARC-AGI"],
  ];
  D.forEach(([q, take, link], i) => {
    add({
      crumb: ["Discussion", link], session: "Discussion",
      notes: "Ask the question, wait, then offer our starting point only if the room is quiet.",
      draw: (s) => {
        text(s, `Discussion ${i + 1}`, { x: 1.0, y: 1.4, w: 11.3, h: 0.5 }, { fontSize: 20, bold: true, color: T.gold });
        text(s, q, { x: 1.0, y: 2.0, w: 11.3, h: 2.2 }, { fontSize: 32, bold: true });
        s.addShape("rect", { x: 1.0, y: 4.6, w: 11.3, h: 1.4, fill: { color: "F2F2F2" }, line: { type: "none" } });
        text(s, [{ text: "Our starting point  ", options: { bold: true, color: T.gray } }, { text: take }], { x: 1.25, y: 4.75, w: 10.8, h: 1.15 }, { fontSize: 18 });
      },
    });
  });

  add({
    crumb: ["References"], title: "Thank you",
    draw: (s) => {
      const refs = [
        "Dehghani et al., Universal Transformers, ICLR 2019, arXiv:1807.03819",
        "Giannou et al., Looped Transformers as Programmable Computers, ICML 2023, arXiv:2301.13196",
        "Yang et al., Looped Transformers are Better at Learning Learning Algorithms, ICLR 2024, arXiv:2311.12424",
        "Saunshi et al., Reasoning with Latent Thoughts: On the Power of Looped Transformers, ICLR 2025, arXiv:2502.17416",
        "Geiping et al., Scaling up Test-Time Compute with Latent Reasoning: A Recurrent Depth Approach, arXiv:2502.05171",
        "Bae et al., Mixture-of-Recursions, arXiv:2507.10524",
        "Zhu et al., Scaling Latent Reasoning via Looped Language Models (Ouro), arXiv:2510.25741",
        "OpenAI, GPT-6 Astra System Card, 3 Sept 2026; S. Raschka, Ahead of AI, 2 and 9 Sept 2026",
        "Wang, Balappanawar, Zhang, On the Chain-of-Thought Monitorability of Looped Language Models, arXiv:2610.02741",
        "Zhang et al., Recurrent Looped Transformer, arXiv:2610.07591",
      ];
      text(s, refs.map((r) => ({ text: r, options: { breakLine: true } })), { x: T.X, y: 1.45, w: 12.4, h: 5.3 }, { fontSize: 15, paraSpaceAfter: 6, color: T.gray });
    },
  });
};
