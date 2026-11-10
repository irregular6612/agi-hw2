// §4 Q3 — Does looping pay off at scale — per parameter, and per FLOP?  (Session B)
const { T, add, figSeq, text, table, bars, linePlot, remark } = require("./lib");
const { cover, answer } = require("./common");

const SAU = 'Saunshi, Dikkala, Li, Kumar, Reddi, "Reasoning with Latent Thoughts: On the Power of Looped Transformers", ICLR 2025';
const MOR = 'Bae, Kim, Bayat, et al., "Mixture-of-Recursions: Learning Dynamic Recursive Depths for Adaptive Token-Level Computation", arXiv:2507.10524 (2025)';
const OURO = 'Zhu, Wang, Hua, et al., "Scaling Latent Reasoning via Looped Language Models", arXiv:2510.25741 (2025)';

// Ouro-1.4B base, MMLU by loop count (Table 10). Reused in §5 as a callback.
const OURO_MMLU = { xs: ["T = 1", "T = 2", "T = 4", "T = 8"], ys: [41.21, 60.43, 67.45, 64.49], yMin: 30, yMax: 70 };
function ouroMMLU(s, box, reveal) {
  const { X, Y } = linePlot(s, box, { ...OURO_MMLU, reveal, highlight: 2, xLabel: "loops at test time", yLabel: "MMLU (%)" });
  const xm = (X(2) + X(3)) / 2;
  s.addShape("line", { x: xm, y: box.y + 0.1, w: 0, h: box.h - 0.9, line: { color: T.gold, width: 1.25, dashType: "dash" } });
  text(s, "trained depth\nT = 4", { x: xm - 1.6, y: box.y + box.h - 1.65, w: 1.5, h: 0.6 }, { fontSize: 13, color: T.gold, align: "right" });
  return { X, Y, xm };
}

module.exports = function () {
  cover("Q3", "Session B starts here. Pick up Huginn's first two open questions: is it worth the compute, and can each token choose its depth?");

  // #52 Saunshi Table 3, three panels revealed one by one
  const cols = (a, b, c) => [
    { label: "12 layers\n(12⊗1)", value: a, color: T.base },
    { label: "24 layers\n(24⊗1)", value: b, color: T.navy },
    { label: "12 looped ×2\n(12⊗2)", value: c, color: T.gold },
  ];
  const panels = [
    { title: "Math word problems ↑", bars: cols(26.7, 29.3, 34.3), max: 40, line: "Math: the looped model beats the 24-layer one, with half the parameters." },
    { title: "Reasoning primitives ↑", bars: cols(35.7, 47.5, 51.2), max: 60, line: "Reasoning primitives: same pattern." },
    { title: "Perplexity ↓", bars: cols(8.16, 7.4, 7.9), max: 10, fmt: (v) => v.toFixed(2), line: "Perplexity: the looped model closes only part of the gap." },
  ];
  for (let k = 0; k < 3; k++) {
    add({
      crumb: ["Q3", "Saunshi"], cite: `${SAU}, Table 3 (1B-scale, 250B tokens of Pile)`,
      title: "At 1B scale, looping lifts reasoning more than perplexity",
      draw: (s) => {
        panels.forEach((p, i) => bars(s, { x: T.X + i * 4.2, y: 1.35, w: 3.9, h: 4.2 }, { bars: p.bars, max: p.max, title: p.title, reveal: i <= k ? 3 : 0, fmt: p.fmt, current: 2, labelSize: 13 }));
        text(s, panels.slice(0, k + 1).map((p, i) => ({ text: p.line, options: { bold: i === k, color: i === k ? T.ink : T.past, breakLine: true } })), { x: T.X, y: 5.75, w: 12.4, h: 1.2 }, { fontSize: 18, paraSpaceAfter: 4 });
      },
    });
  }

  figSeq({
    crumb: ["Q3", "MoR"], cite: `${MOR}, Fig. 2 and Sec. 2`,
    title: "MoR gives each token its own number of loops",
    fig: "mor-fig2.png", layout: "top",
    items: [
      { label: "Every token takes the first pass through one shared block.", body: "First and last layers stay unique; the middle block is reused.", box: [0.01, 0.62, 0.24, 0.87] },
      { label: "Expert choice: a router keeps only the top-k tokens for each deeper pass.", body: "Dashed squares are tokens that stopped.", box: [0.01, 0.07, 0.24, 0.62] },
      { label: "Token choice: one router decides each token's depth up front.", box: [0.3, 0.17, 0.74, 0.88] },
      { label: "Only tokens still running store keys and values at that depth.", body: "Less KV memory, and attention only among active tokens.", box: [0.81, 0.04, 0.98, 0.47] },
      { label: "Variant: reuse the first pass's keys and values at every depth.", box: [0.81, 0.5, 0.98, 0.88] },
    ],
    remark: "This answers Huginn's second open question: depth is learned per token, during pretraining.",
  });

  // #58 MoR Table 3 rows
  const morRows = [
    ["Vanilla Transformer", "315M", "20B", "2.7824", "42.3"],
    ["MoR, 2 recursions", "167M", "27B", "2.7511", "43.1"],
    ["Fixed-depth recursion, 2", "167M", "20B", "2.8079", "42.6"],
  ];
  const morText = [
    "Baseline at 16.5 × 10¹⁸ training FLOPs.",
    "MoR wins at the same FLOPs with half the parameters, but it also saw 35% more tokens.",
    "A plain looped model with no router also beats vanilla on few-shot accuracy.",
  ];
  for (let k = 0; k < 3; k++) {
    add({
      crumb: ["Q3", "MoR"], cite: `${MOR}, Table 3 (360M-base, FineWeb-Edu, equal training FLOPs)`,
      title: "MoR's equal-FLOP win comes partly from more tokens",
      draw: (s) => {
        table(s, { x: T.X, y: 1.55, w: 12.4 }, ["Model", "Params", "Tokens seen", "NLL ↓", "Few-shot avg ↑"], morRows, { reveal: k + 1, current: k, colW: [4.4, 1.8, 2.2, 1.8, 2.2], size: 18 });
        text(s, morText[k], { x: T.X, y: 3.9, w: 12.4, h: 0.9 }, { fontSize: 20, bold: true });
        if (k === 2) remark(s, "Few-shot averages move by tenths, with no seeds reported.", { x: T.X, y: 4.8, w: 12.4, h: 0.6 });
      },
    });
  }

  figSeq({
    crumb: ["Q3", "MoR"], cite: `${MOR}, Fig. 4a and App. E`,
    title: "Up to 2.06× throughput, at one size",
    fig: "mor-fig4.png", layout: "top",
    items: [{ label: "At the largest batch that fits, MoR-4 decodes 2.06× faster than vanilla.", body: "Smaller KV caches allow bigger batches.", box: [0, 0, 0.3, 0.88] }],
    remark: "One model size (360M); KV-update time is excluded; MoR-3 and MoR-4 lose a little log-likelihood.",
  });

  figSeq({
    crumb: ["Q3", "Ouro"], cite: `${OURO}, Fig. 3 and Sec. 3`,
    title: "Ouro trains an exit gate for every loop",
    fig: "ouro-fig3.png", layout: "top",
    items: [
      { label: "The whole stack is looped, up to 4 times.", body: "Ouro-1.4B is 24 layers × 4 loops, trained on 7.7T tokens.", box: [0.02, 0.06, 0.4, 0.66] },
      { label: "Every loop has an LM head and an exit gate.", body: "The gate gives the probability of stopping at that step.", box: [0.02, 0.7, 0.41, 0.85] },
      { label: "Loss = expected loss over exit steps − β · entropy.", body: "Without the entropy term, the gate learns to always run all loops.", box: [0.09, 0.86, 0.33, 0.96] },
      { label: "At inference, sum exit probabilities until they pass a threshold.", body: "One knob trades compute for accuracy.", box: [0.47, 0.7, 0.72, 0.89] },
      { label: "Then exit early; the remaining loops never run.", box: [0.73, 0.15, 0.98, 0.9] },
    ],
    remark: "Huginn's KL heuristic becomes a learned gate, at trillion-token scale.",
  });

  const ouroBars = [
    ["MATH500", 82.4, 59.6], ["GSM8K", 78.92, 72.86], ["MMLU", 67.35, 73.19], ["HumanEval", 74.4, 77.4],
  ];
  for (let k = 0; k < 2; k++) {
    add({
      crumb: ["Q3", "Ouro"], cite: `${OURO}, Table 7`,
      title: "A 1.4B looped model beats a 4B dense one on math only",
      draw: (s) => {
        ouroBars.forEach(([name, o, q], i) => bars(s, { x: T.X + i * 3.1, y: 1.35, w: 2.9, h: 4.3 }, {
          title: name, max: 100, fmt: (v) => v.toFixed(1), reveal: (k === 0 ? i < 2 : true) ? 2 : 0, current: 0, labelSize: 13,
          bars: [{ label: "Ouro 1.4B\n(looped)", value: o, color: T.gold }, { label: "Qwen3 4B\n(dense)", value: q, color: T.navy }],
        }));
        text(s, k === 0 ? "Math: the looped model wins by 6 to 23 points." : "Knowledge and code: the larger dense model still wins.", { x: T.X, y: 5.9, w: 12.4, h: 0.6 }, { fontSize: 20, bold: true });
      },
    });
  }

  for (let k = 0; k < 2; k++) {
    add({
      crumb: ["Q3", "Ouro"], cite: `${OURO}, Table 1 and App. D.1 (Table 18)`,
      title: "Different data, and Ouro's own control favors no looping",
      notes: k ? "The 4× per-token compute is our own estimate: 24 layers run 4 times is about 96 layer applications per token. The paper reports parameter efficiency, not compute efficiency." : "",
      draw: (s) => {
        const card = (x, big, small, on) => {
          s.addShape("rect", { x, y: 1.6, w: 5.9, h: 2.8, fill: { color: on ? "FFFFFF" : "FAFAFA" }, line: { color: on ? T.gold : "E0E0E0", width: on ? 2 : 1 } });
          text(s, big, { x: x + 0.3, y: 1.85, w: 5.3, h: 1.0 }, { fontSize: 36, bold: true, color: on ? T.gold : T.faint });
          text(s, small, { x: x + 0.3, y: 2.95, w: 5.3, h: 1.3 }, { fontSize: 18, color: on ? T.ink : T.faint });
        };
        card(T.X, "7.7T vs 36T", "Training tokens: Ouro vs Qwen3. Different data, different recipe.", k === 0);
        card(T.X + 6.5, "Standard > Looped", "In the authors' own control at equal depth (170M–1.3B, 20B tokens), the non-looped model scored higher in every setting.", k === 1);
        if (k === 1) {
          s.addShape("rect", { x: T.X, y: 4.8, w: 12.4, h: 1.1, fill: { color: "F2F2F2" }, line: { type: "none" } });
          text(s, [{ text: "[ours]  ", options: { bold: true, color: T.gray } }, { text: "Four loops of 24 layers cost about as much per token as a dense model four times deeper. “2–3× parameter efficiency” is not compute efficiency." }], { x: T.X + 0.25, y: 4.95, w: 11.9, h: 0.9 }, { fontSize: 18 });
        }
      },
    });
  }

  // #67 Ouro Table 10, point by point; reused in §5
  const lines = ["One loop: 41.2.", "Two loops: 60.4.", "Four loops, the trained depth: 67.5.", "Eight loops: down to 64.5."];
  for (let k = 0; k < 4; k++) {
    add({
      crumb: ["Q3", "Ouro"], cite: `${OURO}, Table 10 (Ouro-1.4B base, MMLU)`,
      title: "Looping past the trained depth hurts",
      draw: (s) => {
        ouroMMLU(s, { x: T.X + 0.3, y: 1.6, w: 7.4, h: 5.0 }, k + 1);
        text(s, lines.slice(0, k + 1).map((t, i) => ({ text: t, options: { bold: i === k, color: i === k ? T.ink : T.past, breakLine: true } })), { x: 8.6, y: 2.0, w: 4.3, h: 2.8 }, { fontSize: 20, paraSpaceAfter: 10 });
        if (k === 3) remark(s, "Extra loops help up to the depth seen in training, not beyond. The 2.6B Thinking model peaks even earlier on AIME24 (T = 3).", { x: 8.6, y: 4.3, w: 4.3, h: 2.2 });
      },
    });
  }

  figSeq({
    crumb: ["Q3", "Ouro"], cite: `${OURO}, Fig. 6, Sec. 6 and App. B.2 (≤ 40M params, best of 3 seeds)`,
    title: "Loops don't store more knowledge; they use it better",
    fig: "ouro-fig6.png", layout: "top",
    items: [
      { label: "Storage: looped and non-looped both hold about 2 bits per parameter.", box: [0, 0, 0.52, 1] },
      { label: "Manipulation: on depth-24 arithmetic trees, Loop (3⊗4) scores 92.2 vs 34.8 for 12 distinct layers.", box: [[0.6, 0.17, 1.0, 0.25], [0.6, 0.592, 1.0, 0.655]] },
    ],
    remark: "Toy models only. Linking this to Ouro's benchmark wins is an extrapolation.",
  });

  answer("Q3", {
    short: "Per parameter, yes, mostly on math and reasoning. Per FLOP at matched data, not shown.",
    evidence: [
      { t: "Looped 1B-scale beats a 24-layer model on math with half the parameters.", src: "Saunshi Table 3" },
      { t: "Ouro 1.4B beats Qwen3 4B on MATH500 and GSM8K; loses on MMLU and code.", src: "Ouro Table 7" },
      { t: "MoR's equal-FLOP win used 35% more tokens; Ouro's own equal-depth control favors no looping.", src: "MoR Table 3, Ouro App. D.1", kind: "but" },
      { t: "Going past the trained depth lowers accuracy.", src: "Ouro Table 10", kind: "but" },
    ],
  });
};

module.exports.ouroMMLU = ouroMMLU;
