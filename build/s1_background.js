// §1 Background → Gap → Questions  (Session A)
const { T, add, figSeq, text, table } = require("./lib");
const { QS } = require("./common");

const SAUNSHI = 'Saunshi, Dikkala, Li, Kumar, Reddi, "Reasoning with Latent Thoughts: On the Power of Looped Transformers", ICLR 2025';
const UT = 'Dehghani, Gouws, Vinyals, Uszkoreit, Kaiser, "Universal Transformers", ICLR 2019';
const CRUMB = ["Background"];

module.exports = function () {
  // #1 title
  add({
    id: "title", number: false,
    notes: "Session A presenter opens. One sentence: today we ask whether a model can think longer by running its layers again, instead of writing more tokens.",
    draw: (s) => {
      text(s, "Thinking Longer Without Writing More", { x: T.X, y: 2.2, w: 12.4, h: 1.0 }, { fontSize: 44, bold: true });
      text(s, "Looped Transformers and latent reasoning", { x: T.X, y: 3.2, w: 12.4, h: 0.6 }, { fontSize: 26, color: T.gray });
      s.addShape("line", { x: T.X, y: 4.1, w: 2.0, h: 0, line: { color: T.gold, width: 3 } });
      text(s, "Team 5 · Juhyeon Park, Youngho Kim\nAGI26F · 23 November 2026", { x: T.X, y: 4.35, w: 12.4, h: 1.0 }, { fontSize: 18, color: T.gray });
    },
  });

  // #2 drawn: fixed depth
  add({
    crumb: CRUMB, cite: `${UT}, App. B`,
    title: "A Transformer's depth caps its steps per token",
    notes: "Each layer is one sequential step. A forward pass has L of them, no matter how hard the token is. With finite precision, a fixed-depth model cannot be computationally universal (UT, App. B).",
    draw: (s) => {
      const x = 2.2, w = 3.0, h = 0.48, gap = 0.12, y0 = 5.55;
      text(s, "token in", { x, y: y0 + 0.62, w, h: 0.4 }, { fontSize: 16, color: T.gray, align: "center" });
      const labels = ["Layer 1", "Layer 2", "Layer 3", "⋮", "Layer L"];
      labels.forEach((l, i) => {
        const y = y0 - i * (h + gap);
        if (l === "⋮") { text(s, l, { x, y, w, h }, { fontSize: 20, align: "center", color: T.gray }); return; }
        s.addShape("roundRect", { x, y, w, h, rectRadius: 0.06, fill: { color: "DCE3EC" }, line: { color: T.navy, width: 1 } });
        text(s, l, { x, y, w, h }, { fontSize: 16, align: "center", valign: "middle" });
      });
      const top = y0 - 4 * (h + gap);
      text(s, "token out", { x, y: top - 0.5, w, h: 0.4 }, { fontSize: 16, color: T.gray, align: "center" });
      s.addShape("rightBracket", { x: x + w + 0.15, y: top, w: 0.25, h: y0 + h - top, line: { color: T.gold, width: 2 } });
      text(s, "L sequential steps,\nthen it must answer", { x: x + w + 0.55, y: top + 1.1, w: 3.0, h: 1.0 }, { fontSize: 20, bold: true, color: T.gold });
      text(s, [
        { text: "One pass = at most L steps in a row.", options: { bold: true, breakLine: true } },
        { text: "A problem that needs more steps must spread its work over more tokens, or more passes." },
      ], { x: 8.6, y: 2.6, w: 4.3, h: 2.2 }, { fontSize: 19, paraSpaceAfter: 10 });
    },
  });

  // #3–4 CoT vs loop (Saunshi Fig 4); reappears in §2 as the Thm 5.4 callback
  figSeq({
    crumb: CRUMB, cite: `${SAUNSHI}, Fig. 4`,
    titles: ["Today's models get around the cap by writing tokens", "A looped model reuses the same layers instead"],
    fig: "saunshi-fig4.png", layout: "top",
    items: [
      { label: "Chain of thought: each pass writes one token, which is fed back in.", body: "More steps cost more tokens (t1, t2, t3).", box: [0.03, 0, 0.37, 1] },
      { label: "Looped model: each pass updates every position in place.", body: "The intermediate “thoughts” (red) stay hidden and cost no tokens.", box: [0.64, 0, 0.99, 1] },
    ],
    notes: ["Blue bar = the whole model. Red outline = the newest thought.", "Tan boxes at the bottom right are blank slots that stand in for future CoT tokens."],
  });

  // #5 guiding question
  add({
    id: "guiding-question", crumb: CRUMB, cite: "AGI26F HW2 course page, Looped Transformer topic",
    notes: "This is the question the course asked. We split it into four.",
    draw: (s) => {
      text(s, "Guiding question", { x: 1.0, y: 2.0, w: 11.3, h: 0.5 }, { fontSize: 20, color: T.gold, bold: true });
      text(s, "Can a model think longer by reusing its layers instead of writing more tokens?", { x: 1.0, y: 2.6, w: 11.3, h: 2.0 }, { fontSize: 38, bold: true });
    },
  });

  // #6 timeline, four threads, revealed thread by thread
  const lanes = [
    { name: "Can loops compute?", pts: [[2018.55, "Universal Transformers"], [2023.08, "Giannou: programmable computer"], [2025.15, "Saunshi: latent thoughts"]] },
    { name: "Can loops be trained?", pts: [[2023.88, "Yang: looped ICL"], [2025.1, "Huginn 3.5B"]] },
    { name: "Does it pay at scale?", pts: [[2025.15, "Saunshi 1B", "left"], [2025.53, "MoR", "up"], [2025.82, "Ouro 7.7T", "down"]] },
    { name: "What do we lose?", pts: [[2026.7, "Astra report · RLT · CoT monitorability"]] },
  ];
  const X0 = 3.3, X1 = 12.6, Y0 = 2.0, LH = 1.15;
  const xOf = (yr) => X0 + ((yr - 2018) / (2027 - 2018)) * (X1 - X0);
  for (let k = 0; k < lanes.length; k++) {
    add({
      crumb: CRUMB, title: "Eight years, four threads of work",
      cite: "Dates: first arXiv version of each paper; 2026 items from Sept–Oct 2026",
      draw: (s) => {
        [2018, 2020, 2022, 2024, 2026].forEach((yr) => {
          text(s, String(yr), { x: xOf(yr) - 0.4, y: 6.45, w: 0.8, h: 0.3 }, { fontSize: 13, color: T.gray, align: "center" });
          s.addShape("line", { x: xOf(yr), y: 1.7, w: 0, h: 4.7, line: { color: "E7E6E6", width: 0.75 } });
        });
        lanes.forEach((ln, i) => {
          const y = Y0 + i * LH, on = i <= k, cur = i === k;
          text(s, ln.name, { x: T.X, y: y - 0.2, w: 2.7, h: 0.4 }, { fontSize: 16, bold: cur, color: on ? T.ink : T.faint });
          s.addShape("line", { x: X0, y, w: X1 - X0, h: 0, line: { color: on ? T.gray : "EDEDED", width: 1 } });
          if (!on) return;
          ln.pts.forEach(([yr, lab, side], j) => {
            s.addShape("ellipse", { x: xOf(yr) - 0.09, y: y - 0.09, w: 0.18, h: 0.18, fill: { color: cur ? T.gold : T.navy }, line: { type: "none" } });
            const w = lab.length > 22 ? 3.6 : 2.4, color = cur ? T.ink : T.past;
            if (side === "left") { text(s, lab, { x: xOf(yr) - w - 0.15, y: y - 0.16, w, h: 0.32 }, { fontSize: 13, align: "right", color }); return; }
            const up = side ? side === "up" : j % 2 === 0;
            text(s, lab, { x: Math.min(xOf(yr) - w / 2, X1 + 0.3 - w), y: up ? y - 0.48 : y + 0.12, w, h: 0.32 }, { fontSize: 13, align: "center", color });
          });
        });
      },
    });
  }

  // #7 gap table, row by row
  const gaps = [
    ["Can loops compute more than one pass?", "UT, Giannou, Saunshi", "Existence proofs and small synthetic tasks"],
    ["Can a looped model be trained so extra loops help?", "Yang, Huginn", "Toy tasks, or one large run"],
    ["Does it pay off at scale?", "Saunshi 1B, MoR, Ouro", "Baselines differ in data or FLOPs"],
    ["What do we lose?", "2026 reports only", "Barely measured"],
  ];
  for (let k = 0; k < gaps.length; k++) {
    add({
      crumb: CRUMB, title: "Each thread leaves one gap open", cite: "Summary of the papers in this talk",
      draw: (s) => table(s, { x: T.X, y: 1.55, w: 12.4 }, ["What we want to know", "Who tried", "What is missing"], gaps, { reveal: k + 1, current: k, colW: [5.0, 3.2, 4.2], size: 18 }),
    });
  }

  // #8 four questions
  add({
    crumb: CRUMB, title: "Four questions for today",
    notes: "Each section answers one question, and each ends with an 'Answer to Q' slide. Session A takes Q1–Q2, Session B takes Q3–Q4.",
    draw: (s) => {
      QS.forEach((q, i) => {
        const y = 1.6 + i * 1.15;
        text(s, q.id, { x: T.X, y, w: 0.9, h: 0.6 }, { fontSize: 30, bold: true, color: T.gold });
        text(s, q.full, { x: 1.5, y: y + 0.05, w: 9.4, h: 0.6 }, { fontSize: 22, bold: true });
        text(s, q.session, { x: 11.0, y: y + 0.1, w: 1.9, h: 0.5 }, { fontSize: 16, color: T.gray, align: "right" });
      });
    },
  });
};
