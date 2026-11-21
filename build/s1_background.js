// Part 0 "What we talk about today" + Part 1 "Making a model think deeply: today's ways and the loop" (Session A) — Q1
const { T, add, figSeq, text, table, image, spotlight, steps, bars } = require("./lib");
const { QS, roadmap, answer } = require("./common");

const SAUNSHI = 'Saunshi, Dikkala, Li, Kumar, Reddi, "Reasoning with Latent Thoughts: On the Power of Looped Transformers", ICLR 2025';
const UT = 'Dehghani, Gouws, Vinyals, Uszkoreit, Kaiser, "Universal Transformers", ICLR 2019';
const INTRO = ["Today"];
const CRUMB = ["Q1", "Background"];

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

  // #2 hook: the rumor itself (sources/astra-rumor.md) — one scoop, then two days of amplification
  const card = (s, { x, y, w, h }, src, date, head, quote, on, big = false) => {
    s.addShape("roundRect", { x, y, w, h, rectRadius: 0.06, fill: { color: on ? "FFFFFF" : "F7F7F7" }, line: { color: on ? T.gold : T.faint, width: on ? 2 : 1 } });
    text(s, [
      { text: `${src}  `, options: { bold: true, color: on ? T.gold : T.gray } },
      { text: date, options: { color: T.gray, fontSize: big ? 15 : 13, breakLine: true } },
      { text: head, options: { bold: true, color: on ? T.ink : T.past, breakLine: !!quote } },
      ...(quote ? [{ text: quote, options: { italic: true, color: on ? T.gray : T.faint, fontSize: big ? 19 : 13 } }] : []),
    ], { x: x + 0.15, y: y + 0.08, w: w - 0.3, h: h - 0.16 }, { fontSize: big ? 24 : 16, valign: big ? "middle" : "top", paraSpaceAfter: big ? 14 : 3 });
  };
  for (let k = 0; k < 3; k++) {
    add({
      crumb: INTRO, title: "Sept 2026: one scoop said GPT-6 Astra loops, and it spread in two days",
      cite: "The Information, 1 Sept 2026 (paywalled; body text as reproduced in Raschka, Ahead of AI, 2 Sept, Fig. 1); TechCrunch, 2 Sept; A. Volkov on X, 2 Sept; Fortune, 3 Sept",
      draw: (s) => {
        card(s, { x: T.X, y: 1.45, w: 5.7, h: 4.4 }, "The Information", "Tue 1 Sept · paywalled · unnamed insiders",
          "“OpenAI Technique in ‘Astra’ Model Sparks Security Concerns”",
          "The technique, “known as recurrent depth or looped transformer,” obscures some or all of the chain of thought.", k !== 1, true);
        if (k >= 1) {
          const R = { x: 6.45, w: 6.4, h: 1.4 };
          card(s, { ...R, y: 1.45 }, "TechCrunch", "Wed 2 Sept", "“OpenAI’s new reasoning technique alarms AI safety experts”",
            "Redwood CEO: “extremely concerned by the reporting”", k === 1);
          card(s, { ...R, y: 2.95 }, "X · @altryne", "Wed 2 Sept", "“loop transformers”, “recurrent depth” and “Neuralese” all over the timeline", null, k === 1);
          card(s, { ...R, y: 4.45 }, "Fortune", "Thu 3 Sept", "States it as fact: OpenAI “has employed” recurrent depth in part of Astra",
            "Ex-OpenAI safety researcher: “violating one of the few redlines”", k === 1);
        }
        if (k === 2) {
          text(s, [
            { text: "All of it traces back to one paywalled scoop. ", options: { bold: true } },
            { text: "OpenAI never confirmed the architecture. We return to this claim at the end.", options: { color: T.gray } },
          ], { x: T.X, y: 5.98, w: 12.4, h: 0.8 }, { fontSize: 19 });
        }
      },
    });
  }

  // ICLR submissions mentioning "looped" (sources/iclr-counts.md)
  const ic = [["ICLR 2024", 3], ["ICLR 2025", 4], ["ICLR 2026", 11], ["ICLR 2027", 189]];
  for (let k = 0; k < 2; k++) {
    add({
      crumb: INTRO, title: "Research followed: “looped” papers at ICLR jumped to 189",
      cite: "OpenReview search API, term “looped” in title, abstract or keywords, all submissions incl. withdrawn and desk-rejected; retrieved 21 Nov 2026",
      draw: (s) => {
        text(s, "ICLR submissions mentioning “looped”", { x: T.X, y: 1.35, w: 7.5, h: 0.4 }, { fontSize: 16, color: T.gray });
        bars(s, { x: T.X, y: 1.8, w: 7.5, h: 5.0 }, {
          max: 200, reveal: k === 0 ? 3 : 4, current: k === 0 ? 2 : 3, fmt: (v) => String(v), labelSize: 15,
          bars: ic.map(([l, v], i) => ({ label: l, value: v, color: i === 3 ? T.gold : T.navy })),
        });
        text(s, [
          { text: k === 0 ? "A handful a year, 2024–2026." : "189 for ICLR 2027, of which 175 use it for a model.", options: { bold: true, breakLine: true } },
          { text: "Search-index counts, not a full scan. A submission is attention, not a result.", options: { color: T.gray } },
        ], { x: 8.4, y: 2.2, w: 4.5, h: 3.0 }, { fontSize: 20, paraSpaceAfter: 12 });
      },
    });
  }

  // #3 guiding question + today's three questions
  add({
    id: "guiding-question", crumb: INTRO, cite: "AGI26F HW2 course page, Looped Transformer topic",
    notes: "This is the question the course asked. Today: what it is, what it can do, and whether it is worth adopting.",
    draw: (s) => {
      text(s, "Guiding question", { x: 1.0, y: 1.6, w: 11.3, h: 0.5 }, { fontSize: 20, color: T.gold, bold: true });
      text(s, "Can a model think longer by reusing its layers instead of writing more tokens?", { x: 1.0, y: 2.2, w: 11.3, h: 1.9 }, { fontSize: 38, bold: true });
      text(s, "Today: what is it · what can it do · is it worth adopting?", { x: 1.0, y: 4.35, w: 11.3, h: 0.6 }, { fontSize: 24, color: T.navy });
      text(s, "“Recursion” here means repetition inside the network. Topic 9's recursion is system-level self-improvement.", { x: 1.0, y: 5.6, w: 11.3, h: 0.5 }, { fontSize: 16, color: T.gray });
    },
  });

  // #4 four questions
  add({
    crumb: INTRO, title: "Four questions for today",
    notes: "Each part answers one question and ends with an 'Answer to Q' slide. Session A takes Q1, Q2 and starts Q3 with Huginn; Session B finishes Q3 and takes Q4.",
    draw: (s) => {
      QS.forEach((q, i) => {
        const y = 1.6 + i * 1.15;
        text(s, q.id, { x: T.X, y, w: 0.9, h: 0.6 }, { fontSize: 30, bold: true, color: T.gold });
        text(s, q.full, { x: 1.5, y: y + 0.05, w: 9.4, h: 0.9 }, { fontSize: 22, bold: true });
        text(s, q.session, { x: 11.0, y: y + 0.1, w: 1.9, h: 0.5 }, { fontSize: 16, color: T.gray, align: "right" });
      });
    },
  });

  // #5 what we want
  add({
    crumb: CRUMB, title: "What we want: AI that thinks deeply enough to solve hard problems",
    draw: (s) => {
      text(s, [
        { text: "Deep thinking = many steps of computation before the answer.", options: { bold: true, breakLine: true } },
        { text: "Two ways the field has tried so far:", options: { color: T.gray, breakLine: true } },
        { text: "1  Stack more layers.", options: { breakLine: true } },
        { text: "2  Let the model write a longer chain of thought.", options: {} },
      ], { x: T.X, y: 1.7, w: 12.4, h: 3.6 }, { fontSize: 26, paraSpaceAfter: 14 });
      text(s, "[ours] Our framing of the goal, not a claim from a paper.", { x: T.X, y: 5.8, w: 12.4, h: 0.5 }, { fontSize: 16, color: T.gray });
    },
  });

  // #6 way 1: stack layers, measured by scaling laws → bottleneck
  const w1 = [
    [{ text: "The bet", options: { bold: true, color: T.gold, breakLine: true } },
      { text: "A deeper network can think deeper. Progress was measured by scaling laws: test loss follows a power law in parameters, data and compute.", options: {} }],
    [{ text: "But the proxy says “bigger,” not “deeper”", options: { bold: true, color: T.gold, breakLine: true } },
      { text: "Performance depends strongly on scale, weakly on model shape such as depth vs. width (on test loss).", options: {} }],
    [{ text: "Reasoning needs depth", options: { bold: true, color: T.gold, breakLine: true } },
      { text: "Many reasoning problems need large depth but not many parameters. In a standard stack, more depth means more parameters.", options: {} }],
  ];
  for (let k = 0; k < w1.length; k++) {
    add({
      crumb: CRUMB, title: "Way 1: stack more layers, measured by scaling laws",
      cite: `Kaplan et al., Scaling Laws for Neural Language Models, 2020, Sec. 1.1; ${SAUNSHI}, Abstract`,
      draw: (s) => w1.forEach((runs, i) => {
        if (i > k) return;
        const r = i < k ? runs.map((x) => ({ text: x.text, options: { ...x.options, color: T.past } })) : runs;
        text(s, r, { x: T.X, y: 1.5 + i * 1.75, w: 12.4, h: 1.6 }, { fontSize: 21, paraSpaceAfter: 6 });
      }),
    });
  }

  // #7 drawn: fixed depth
  add({
    crumb: CRUMB, cite: `${UT}, Sec. 1 and App. B`,
    title: "The price: depth caps a Transformer's steps per token",
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
      ], { x: 8.6, y: 2.2, w: 4.3, h: 2.2 }, { fontSize: 19, paraSpaceAfter: 10 });
      text(s, "UT (2018): the Transformer “foregoes RNNs' inductive bias towards learning iterative or recursive transformations.”",
        { x: 8.6, y: 4.6, w: 4.3, h: 1.5 }, { fontSize: 15, italic: true, color: T.gray });
    },
  });

  // #8 way 2: chain of thought (Saunshi Fig 4, left)
  const cot = { label: "Way 2, chain of thought: each pass writes one token, which is fed back in.", body: "More steps cost more tokens. Huginn: verbalizing every step “appears wasteful”; Ouro: CoT is added in post-training and bloats the context.", box: [0.03, 0, 0.37, 1] };
  const loop = { label: "Looped model: each pass updates every position in place; the thoughts (red) cost no tokens.", body: "An RNN's recurrence, moved from time to depth: Universal Transformers, 2018. Both are test-time scaling; CoT thinks outside the model, the loop inside it.", box: [0.64, 0, 0.99, 1] };
  figSeq({
    crumb: CRUMB, cite: `${SAUNSHI}, Fig. 4; Geiping et al. 2025, Sec. 1; Zhu et al. 2025, Sec. 1`,
    titles: ["Today's models get around the cap by writing tokens"],
    fig: "saunshi-fig4.png", layout: "top", items: [cot],
    notes: ["Blue bar = the whole model. Red outline = the newest thought."],
  });

  // #9–11 RNN vs Transformer, row by row
  const rows = [
    ["Strength",
      "Same weights at every step; constant cost per step. Iterative computation comes naturally.",
      "Trains on the whole sequence in parallel. Any token reaches any other in one step."],
    ["Weakness",
      "One step at a time: O(n) sequential operations, so no parallel training within a sequence. Distant information fades (vanishing gradients).",
      "Fixed depth caps the steps per token. Attention costs O(n²·d). Weak on inputs longer than in training."],
    ["Inductive bias",
      "Sequentiality: the same rule, applied step after step.",
      "[ours] Almost none about order or distance: every token interacts with every other; order comes only from position encodings."],
  ];
  for (let k = 0; k < rows.length; k++) {
    add({
      crumb: CRUMB, title: "RNNs read step by step; Transformers read all at once",
      cite: "Hochreiter & Schmidhuber 1997 (abstract); Vaswani et al. 2017, Sec. 1, 3.5, Table 1; Battaglia et al. 2018, Table 1; UT Sec. 1",
      draw: (s) => table(s, { x: T.X, y: 1.5, w: 12.4 }, ["", "RNN (LSTM)", "Transformer"], rows, { reveal: k + 1, current: k, colW: [2.0, 5.2, 5.2], size: 19 }),
    });
  }

  // #12–14 Bitter Lesson: claim → measurement → our link
  const bl = [
    [{ text: "Sutton, “The Bitter Lesson” (2019)", options: { bold: true, color: T.gold, breakLine: true } },
      { text: "“General methods that leverage computation are ultimately the most effective, and by a large margin.”", options: { breakLine: true } },
      { text: "The two that keep scaling: search and learning.", options: { color: T.gray } }],
    [{ text: "Measured (Kaplan et al. 2020)", options: { bold: true, color: T.gold, breakLine: true } },
      { text: "At equal parameters, Transformers pull ahead of LSTMs as models grow.", options: { breakLine: true } },
      { text: "LSTMs keep up on early context tokens, then plateau after fewer than 100 tokens.", options: { color: T.gray } }],
    [{ text: "[ours] The link", options: { bold: true, color: T.gold, breakLine: true } },
      { text: "Parallel training let Transformers absorb more compute, and they used long context better.", options: { breakLine: true } },
      { text: "Sutton never mentions Transformers; connecting the two is our reading.", options: { color: T.gray } }],
  ];
  for (let k = 0; k < bl.length; k++) {
    add({
      crumb: CRUMB, title: "Transformers won because they scale: the Bitter Lesson",
      cite: "Sutton, “The Bitter Lesson”, 13 Mar 2019; Kaplan et al., Scaling Laws for Neural Language Models, 2020, Sec. 3.2.1, Fig. 7; Vaswani et al. 2017, Sec. 1",
      draw: (s) => bl.forEach((runs, i) => {
        if (i > k) return;
        const dimmed = i < k ? runs.map((r) => ({ text: r.text, options: { ...r.options, color: T.past } })) : runs;
        text(s, dimmed, { x: T.X, y: 1.5 + i * 1.75, w: 12.4, h: 1.6 }, { fontSize: 21, paraSpaceAfter: 6 });
      }),
    });
  }

  // #15 what a loop tries to fix (same figure, right half)
  add({
    crumb: CRUMB, cite: `${SAUNSHI}, Fig. 4; ${UT}`,
    title: "A looped model reuses the same layers instead",
    notes: "Tan boxes at the bottom right are blank slots that stand in for future CoT tokens.",
    draw: (s) => {
      const r = image(s, "saunshi-fig4.png", { x: T.X, y: 1.3, w: 12.45, h: 3.75 }, "center");
      spotlight(s, r, loop.box);
      steps(s, [cot, loop], 1, { x: T.X, y: Math.min(r.y + r.h + 0.35, 5.3), w: 12.45, h: 1.6 }, { onlyCurrent: true });
    },
  });

  answer("Q1", {
    short: "Layers cost parameters; chain of thought costs tokens. Depth per token stays fixed.",
    evidence: [
      { t: "Test loss tracks scale, and barely depth vs. width.", src: "Kaplan Sec. 1.1" },
      { t: "Reasoning needs depth more than parameters.", src: "Saunshi Abstract" },
      { t: "One pass gives at most L sequential steps per token.", src: "UT App. B" },
      { t: "Chain of thought buys depth with tokens that must be written out.", src: "Huginn Sec. 1; Ouro Sec. 1", kind: "but" },
    ],
  });

  // roadmap, era by era: bridge into Q2
  const caps = [
    [["Two ways to model sequences. ", true], ["RNNs repeat one rule step by step; Transformers drop recurrence to train in parallel, but fix the depth. ACT learns when to stop.", false]],
    [["Q: fixed depth caps the steps per token. ", true], ["Universal Transformers reuse one block across depth and halt per token.", false]],
    [["Q: what can a looped block compute in principle? ", true], ["Giannou: a programmable computer (proof). Meanwhile, chain of thought adds steps by writing tokens.", false]],
    [["Q: can we train it at LM scale? ", true], ["Huginn. Does every token need the same depth? MoR. Does it hold in pretraining? Ouro.", false]],
    [["Q: can depth continue across tokens? ", true], ["RLT brings back recurrence over time. And a headline: does GPT-6 Astra loop?", false]],
  ];
  for (let k = 0; k < caps.length; k++) {
    add({
      crumb: ["Roadmap"], title: "Roadmap: each answer raised the next question",
      cite: "Arrows show the question each step left open, not citations. Gold boxes: the six papers this talk covers.",
      draw: (s) => {
        roadmap(s, k);
        s.addShape("rect", { x: T.X, y: 5.55, w: 12.4, h: 1.3, fill: { color: "F7F7F7" }, line: { type: "none" } });
        text(s, caps[k].map(([t, b]) => ({ text: t, options: { bold: b, color: b ? T.gold : T.ink } })), { x: T.X + 0.25, y: 5.6, w: 11.9, h: 1.2 }, { fontSize: 19, valign: "middle" });
      },
    });
  }
};
