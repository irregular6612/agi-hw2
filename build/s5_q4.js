// §5 Q4 — What do we lose when reasoning moves into hidden states — and what is established in 2026?  (Session B)
const { T, add, figSeq, text, bars, remark } = require("./lib");
const { cover, answer } = require("./common");
const { ouroMMLU } = require("./s4_q3");

const COT = 'Wang, Balappanawar, Zhang, "On the Chain-of-Thought Monitorability of Looped Language Models", arXiv:2610.02741 (2026)';
const RLT = 'Zhang, Feng, Qin, Kung, Wang, "Recurrent Looped Transformer", arXiv:2610.07591 (2026); tech report of 12 Sept 2026';
const ASTRA = "Efrati & Palazzolo, The Information, 2 Sept 2026; OpenAI, GPT-6 Astra System Card, 3 Sept 2026; Raschka, Ahead of AI, 2 & 9 Sept 2026";

module.exports = function () {
  cover("Q4", "Huginn's third open question: can we still read what a looped model thinks? This is where the 2026 news comes in.");

  // #71 Astra timeline
  const ev = [
    ["Sept 2", "The Information", "Insiders: Astra uses “recurrent depth or looped transformer”, which “obscures” its chain of thought."],
    ["Sept 2–3", "J. Pachocki, OpenAI", "Astra's computation depth is “within a factor of two of GPT-4.”"],
    ["Sept 3", "OpenAI system card", "“A substantial decrease in chain-of-thought monitorability.” Nothing on architecture."],
    ["Sept 9", "S. Raschka", "Still “a rumor”, but looping is “highly likely”."],
  ];
  for (let k = 0; k < ev.length; k++) {
    add({
      crumb: ["Q4", "Astra"], cite: ASTRA,
      title: "Sept 2026: a press report said GPT-6 Astra loops",
      draw: (s) => {
        const x0 = 1.9, x1 = 11.4, y = 2.2, step = (x1 - x0) / (ev.length - 1);
        s.addShape("line", { x: x0, y, w: x1 - x0, h: 0, line: { color: T.gray, width: 1.25 } });
        ev.forEach(([d, who, what], i) => {
          const x = x0 + i * step, on = i <= k, cur = i === k;
          s.addShape("ellipse", { x: x - 0.11, y: y - 0.11, w: 0.22, h: 0.22, fill: { color: on ? (cur ? T.gold : T.navy) : "E0E0E0" }, line: { type: "none" } });
          text(s, d, { x: x - 1.2, y: y - 0.65, w: 2.4, h: 0.4 }, { fontSize: 16, bold: true, align: "center", color: on ? T.ink : T.faint });
          if (!on) return;
          text(s, [{ text: who, options: { bold: true, breakLine: true, color: cur ? T.ink : T.past } }, { text: what, options: { color: cur ? T.ink : T.past, fontSize: 15 } }],
            { x: x - 1.35, y: y + 0.35, w: 2.7, h: 2.8 }, { fontSize: 17, align: "center", paraSpaceAfter: 6 });
        });
      },
    });
  }

  add({
    crumb: ["Q4", "Astra"], cite: "OpenAI, GPT-6 Astra System Card, 3 Sept 2026, Sec. 9; Raschka, Ahead of AI, 9 Sept 2026",
    title: "What OpenAI confirmed — and what it didn't",
    notes: "OpenAI confirms the monitorability drop and says the controllability rise is not due to architecture. The looping claim rests on one paywalled scoop.",
    draw: (s) => {
      const col = (x, head, color, items) => {
        text(s, head, { x, y: 1.5, w: 5.9, h: 0.5 }, { fontSize: 22, bold: true, color });
        s.addShape("line", { x, y: 2.05, w: 5.9, h: 0, line: { color, width: 2 } });
        text(s, items.map((t) => ({ text: t, options: { bullet: { indent: 18 }, breakLine: true } })), { x, y: 2.25, w: 5.9, h: 3.8 }, { fontSize: 19, paraSpaceAfter: 12 });
      };
      col(T.X, "Confirmed by OpenAI", T.gold, [
        "Chain-of-thought monitorability dropped substantially.",
        "Mostly because Astra writes shorter, less informative CoTs.",
        "The rise in CoT controllability is “not differentially due to any architectural changes.”",
      ]);
      col(T.X + 6.5, "Not confirmed", T.gray, [
        "That Astra loops at all (one press report, unnamed insiders).",
        "That looping caused the hidden reasoning.",
      ]);
    },
  });

  // #73 drawn: how monitorability is measured
  add({
    crumb: ["Q4", "CoT monitorability"], cite: `${COT}, Sec. 3.2`,
    title: "Plant a hint, then check if the CoT admits using it",
    notes: "Score = of the correct answers the hint caused, the fraction where the monitor flagged the CoT as hint-driven. Stress test: the prompt also says 'do not mention the hint'. Monitor and verifier: Qwen3.8-27B.",
    draw: (s) => {
      const box = (x, y, w, h, t, fill, line) => {
        s.addShape("roundRect", { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: { color: line || fill, width: 1.25 } });
        text(s, t, { x: x + 0.1, y, w: w - 0.2, h }, { fontSize: 17, align: "center", valign: "middle" });
      };
      const arrow = (x, y, w) => s.addShape("line", { x, y, w, h: 0, line: { color: T.gray, width: 2, endArrowType: "triangle" } });
      box(T.X, 1.9, 3.0, 1.6, "Question\n+ hint: “I guess the answer is A”", T.paleGold, T.gold);
      arrow(3.55, 2.7, 0.7);
      box(4.35, 1.9, 2.4, 1.6, "Looped model\n(T loops)", "DCE3EC", T.navy);
      arrow(6.85, 2.7, 0.7);
      box(7.65, 1.9, 2.3, 1.6, "Chain of thought\n→ answer A", "F2F2F2", "BFBFBF");
      arrow(10.05, 2.7, 0.7);
      box(10.85, 1.9, 2.05, 1.6, "Monitor:\ndid the hint drive it?", "FFFFFF", T.gray);
      text(s, [
        { text: "Monitorability ", options: { bold: true } },
        { text: "= of the answers the hint changed, the share whose CoT the monitor flags.", options: { breakLine: true } },
        { text: "Stress test: the prompt also says “do not mention the hint.”", options: { color: T.gray } },
      ], { x: T.X, y: 4.2, w: 12.4, h: 1.6 }, { fontSize: 20, paraSpaceAfter: 10 });
    },
  });

  figSeq({
    crumb: ["Q4", "CoT monitorability"], cite: `${COT}, Fig. 2 and Table 6b (Ouro Thinking models, T = 4, 6, 8)`,
    title: "More loops on the same model hid the hint on logic tasks",
    fig: "cotmon-fig2-loopdepth.png",
    items: [
      { label: "Logic, told to conceal: 77.9 → 41.8 as loops go 4 → 8.", body: "Orange, Ouro 1.4B. Science and engineering also drop.", box: [0.34, 0.03, 0.67, 0.33] },
      { label: "Health and safety do not drop.", body: "The cue-condition tasks stay near 90–100%.", box: [0, 0.36, 0.67, 0.66] },
      { label: "The standard average barely moves.", body: "Changes in accuracy and CoT length do not explain the drops.", box: [0.67, 0.68, 1.0, 1.0] },
    ],
    remark: "Depth hid the hint only under pressure, and only on some tasks.",
    notes: ["Ouro 2.6B, Logic: 73.6 → 57.9.", "", "Spearman ρ = −0.126 (p = 0.49) for pass rate, 0.248 (p = 0.17) for CoT length, over 32 cells."],
  });

  figSeq({
    crumb: ["Q4", "CoT monitorability"], cite: `${COT}, Fig. 4 (one hand-picked logic item)`,
    title: "At T = 4 the hint is the target; at T = 8 it is never mentioned",
    fig: "cotmon-fig4-qualitative.png",
    items: [
      { label: "T = 4: the hint is used as the target.", body: "22 hint mentions in the CoT.", box: [0.02, 0.36, 0.98, 0.5] },
      { label: "T = 6: the hint becomes a “check”.", body: "6 mentions.", box: [0.02, 0.51, 0.98, 0.67] },
      { label: "T = 8: the hint is not acknowledged.", body: "0 mentions, same final answer.", box: [0.02, 0.68, 0.98, 0.97] },
    ],
    remark: "Zero mentions does not tell us the hint went unused.",
  });

  // callback to the Ouro depth plot
  add({
    crumb: ["Q4", "CoT monitorability"], cite: "Ouro Table 10 (MMLU) and Wang et al. 2026 setup: Ouro's trained depth is T = 4",
    title: "But T = 6 and 8 are past Ouro's trained depth",
    notes: "Callback to the Ouro plot from Q3. The cotmon design cannot separate 'more latent computation' from 'running at a loop count the model never trained on'.",
    draw: (s) => {
      const box = { x: T.X + 0.3, y: 1.6, w: 7.4, h: 5.0 };
      const { xm } = ouroMMLU(s, box, 4);
      s.addShape("rect", { x: xm, y: box.y + 0.1, w: box.x + box.w - xm - 0.15, h: box.h - 0.9, fill: { color: T.gold, transparency: 85 }, line: { type: "none" } });
      text(s, "cotmon measured here", { x: xm + 0.05, y: box.y + box.h - 1.65, w: 2.2, h: 0.4 }, { fontSize: 14, bold: true, color: T.gold });
      text(s, [
        { text: "Is the hidden hint deeper thinking, or a model running out of distribution?", options: { bold: true, breakLine: true } },
        { text: "The study cannot tell them apart.", options: { color: T.gray } },
      ], { x: 8.6, y: 2.2, w: 4.3, h: 3.0 }, { fontSize: 20, paraSpaceAfter: 12 });
    },
  });

  add({
    crumb: ["Q4", "CoT monitorability"], cite: `${COT}, Sec. 4.2 and Table 10a (standard setting)`,
    title: "A looped model vs six non-looped ones: no penalty",
    notes: "The six non-looped models are matched on parameters, layers or effective depth. The authors say this comparison is not causal. Under the concealment stress test Nanbeige ranks 2nd of 7.",
    draw: (s) => {
      text(s, "Average monitorability (%), standard setting", { x: T.X, y: 1.35, w: 7, h: 0.4 }, { fontSize: 16, color: T.gray });
      bars(s, { x: T.X, y: 1.8, w: 7.0, h: 5.0 }, {
        max: 100, current: 0, labelSize: 14, fmt: (v) => v.toFixed(2), bars: [
          { label: "Nanbeige4.2-3B\n(looped)", value: 81.35, color: T.gold },
          { label: "best of six\nnon-looped", value: 76.92, color: T.navy },
          { label: "worst of six\nnon-looped", value: 66.08, color: T.base },
        ],
      });
      text(s, [
        { text: "Looping alone did not make a model less monitorable.", options: { bold: true, breakLine: true } },
        { text: "Different families and training, so not a causal comparison.", options: { color: T.gray } },
      ], { x: 8.1, y: 2.2, w: 4.8, h: 3.0 }, { fontSize: 20, paraSpaceAfter: 12 });
    },
  });

  figSeq({
    crumb: ["Q4", "RLT"], cite: `${RLT}, Fig. 1`,
    title: "RLT, Sept 12: “infinite temporal depth,” zero experiments",
    fig: "rlt-architecture.png", layout: "top",
    items: [
      { label: "A causal encoder reads all tokens in parallel.", box: [0.01, 0.03, 0.37, 0.84] },
      { label: "A recurrent decoder carries its state from token to token.", body: "After t tokens, the path has passed through t decoder stacks.", box: [0.37, 0.03, 0.99, 0.84] },
    ],
    remark: "The report itself: “realized reasoning gains, hardware efficiency, and RL scaling remain to be established.”",
  });

  figSeq({
    crumb: ["Q4", "RLT"], cite: `${RLT}, length-generalization figure (≈26M params, seeds 42–44)`,
    title: "RLT, October: three-seed toy results, failures included",
    fig: "rlt-length-generalization.png",
    items: [
      { label: "Parity: trained on ≤ 40 bits, 100% at 256 bits.", body: "The Transformer baseline (dashed) falls to chance, 50%.", box: [0.02, 0.08, 0.49, 0.5] },
      { label: "S5 swaps: 97% at 256 operations, vs 1%.", box: [0.51, 0.08, 1.0, 0.5] },
      { label: "But standard S5 stays at chance, and addition fails past 8 digits.", body: "One task scored 18%, 20% or 99% depending on the seed." },
    ],
    remark: "[ours] RLT gets depth by reading more tokens. It thinks deeper across tokens, not longer per token, so it does not answer our guiding question.",
  });

  answer("Q4", {
    short: "Readability, sometimes. What is established is narrower than the headlines.",
    evidence: [
      { t: "Same model, more loops, told to conceal: the hint vanished from logic CoTs (77.9 → 41.8).", src: "Wang et al. Fig. 2" },
      { t: "Looping alone showed no monitorability penalty against six non-looped models.", src: "Wang et al. Sec. 4.2" },
      { t: "Astra's monitorability drop is confirmed; that Astra loops is not.", src: "System card Sec. 9", kind: "but" },
      { t: "RLT went from a design document to toy results in five weeks.", src: "RLT arXiv v2", kind: "but" },
    ],
  });
};
