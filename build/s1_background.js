// Part 0 "What we talk about today" + Part 1 "Making a model think deeply: today's ways and the loop" (Session A) — Q1
const { T, add, figSeq, text, table, image, spotlight, steps, bars } = require("./lib");
const { QS, roadmap, answer } = require("./common");

const SAUNSHI = 'Saunshi, Dikkala, Li, Kumar, Reddi, "Reasoning with Latent Thoughts: On the Power of Looped Transformers", ICLR 2025';
const UT = 'Dehghani, Gouws, Vinyals, Uszkoreit, Kaiser, "Universal Transformers", ICLR 2019';
const INTRO = ["Today"];
const CRUMB = ["Q1", "Background"];
const OPTIONAL = false;   // optional slides cut for time / flow

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

  // Astra itself: Altman's words and the jump on ARC-AGI-3 (sources/astra-launch.md)
  for (let k = 0; k < 2; k++) {
    add({
      crumb: INTRO, title: "Sept 2026: OpenAI ships GPT-6 Astra",
      cite: "Sources podcast (A. Heath), 1 Sept 2026, 46:20; ARC Prize, “OpenAI's GPT-6 Astra on ARC-AGI-3”, 3 Sept 2026 (Standard harness); photo: Steve Jurvetson, “Sam Altman speaking at TED” (cropped), CC BY 2.0, via Wikimedia Commons",
      draw: (s) => {
        const ph = image(s, "altman-photo.png", { x: T.X, y: 1.35, w: 3.0, h: 2.8 }, "left");
        text(s, [
          { text: "“Astra feels like it kind of reached human parity on using computers … one of those steps along the path to AGI.”", options: { italic: true, breakLine: true } },
          { text: "Sam Altman, 1 Sept 2026", options: { color: T.gray, fontSize: 16 } },
        ], { x: T.X, y: ph.y + ph.h + 0.15, w: 5.6, h: 2.3 }, { fontSize: 20, paraSpaceAfter: 6 });
        if (k === 1) {
          text(s, "ARC-AGI-3 score (%), same test setup, checked by ARC Prize", { x: 6.6, y: 1.35, w: 6.3, h: 0.4 }, { fontSize: 16, color: T.gray });
          bars(s, { x: 6.6, y: 1.8, w: 6.3, h: 4.7 }, {
            max: 70, fmt: (v) => `${v.toFixed(1)}%`, labelSize: 15, current: 2,
            bars: [
              { label: "GPT-5.6 Sol", value: 7.8, color: T.base },
              { label: "Claude Opus 5\n(previous best)", value: 30.2, color: T.navy },
              { label: "GPT-6 Astra", value: 62.7, color: T.gold },
            ],
          });
        }
      },
    });
  }

  // #2 hook: the rumor as it spread, from sources anyone can read in full (sources/astra-rumor.md)
  const card = (s, { x, y, w, h }, src, date, head, quote, on) => {
    s.addShape("roundRect", { x, y, w, h, rectRadius: 0.06, fill: { color: on ? "FFFFFF" : "F7F7F7" }, line: { color: on ? T.gold : T.faint, width: on ? 2 : 1 } });
    text(s, [
      { text: `${src}  `, options: { bold: true, color: on ? T.gold : T.gray } },
      { text: date, options: { color: T.gray, fontSize: 14, breakLine: true } },
      { text: head, options: { bold: true, color: on ? T.ink : T.past, breakLine: !!quote } },
      ...(quote ? [{ text: quote, options: { italic: true, color: on ? T.gray : T.faint, fontSize: 16 } }] : []),
    ], { x: x + 0.18, y: y + 0.12, w: w - 0.36, h: h - 0.24 }, { fontSize: 20, valign: "top", paraSpaceAfter: 8 });
  };
  const CARDS = [
    ["X · @altryne", "Wed 2 Sept", "“loop transformers”, “recurrent depth” and “Neuralese” all over the timeline", "A thread explaining why everyone was suddenly talking about it"],
    ["LessWrong · R. Arike", "Wed 2 Sept", "“How concerned should we be about Astra’s recurrent architecture?”", "Says the report likens Astra’s approach to Geiping et al.’s recurrent depth"],
    ["TechCrunch", "Wed 2 Sept", "“OpenAI’s new reasoning technique alarms AI safety experts”", "Redwood CEO: “extremely concerned by the reporting”"],
    ["Astral Codex Ten · S. Alexander", "Fri 25 Sept", "“At Long Last, We Have Created Neuralese Recurrence”", "The thought itself goes back into the loop, instead of a text scratchpad"],
  ];
  for (let k = 0; k < 2; k++) {
    add({
      crumb: INTRO, title: "Sept 2026: “GPT-6 Astra loops” spread across X and blogs",
      cite: "A. Volkov on X, 2 Sept 2026; R. Arike, LessWrong, 2 Sept 2026; R. Brandom, TechCrunch, 2 Sept 2026; S. Alexander, Astral Codex Ten, 25 Sept 2026",
      draw: (s) => {
        CARDS.forEach(([src, date, head, quote], i) => {
          const row = Math.floor(i / 2);
          if (row > k) return;
          card(s, { x: i % 2 ? 6.75 : T.X, y: 1.45 + row * 2.6, w: 6.1, h: 2.35 }, src, date, head, quote, row === k);
        });
      },
    });
  }

  // ICLR submissions mentioning "looped" (sources/iclr-counts.md)
  const ic = [["ICLR 2024", 3], ["ICLR 2025", 4], ["ICLR 2026", 11], ["ICLR 2027", 189]];
  for (let k = 0; k < 2; k++) {
    add({
      crumb: INTRO, title: "Research followed: “looped” papers at ICLR jumped to 189",
      cite: "OpenReview search API, term “looped” in title, abstract or keywords; retrieved 21 Nov 2026",
      draw: (s) => {
        text(s, "ICLR submissions mentioning “looped”", { x: T.X, y: 1.35, w: 7.5, h: 0.4 }, { fontSize: 16, color: T.gray });
        bars(s, { x: T.X, y: 1.8, w: 7.5, h: 5.0 }, {
          max: 200, reveal: k === 0 ? 3 : 4, current: k === 0 ? 2 : 3, fmt: (v) => String(v), labelSize: 15,
          bars: ic.map(([l, v], i) => ({ label: l, value: v, color: i === 3 ? T.gold : T.navy })),
        });
        if (k === 1) {
          text(s, "189 for ICLR 2027, of which 175 use it for a model.", { x: 8.4, y: 2.2, w: 4.5, h: 1.5 }, { fontSize: 20, bold: true });
          s.addShape("irregularSeal1", { x: 8.7, y: 3.7, w: 3.6, h: 2.5, fill: { color: T.gold }, line: { color: "FFFFFF", width: 2 } });
          text(s, "Impact!", { x: 8.7, y: 3.7, w: 3.6, h: 2.5 }, { fontSize: 30, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
        }
      },
    });
  }

  // #3 guiding question + today's three questions
  add({
    id: "guiding-question", crumb: INTRO,
    notes: "This is the question the course asked. Today: what it is, what it can do, and whether it is worth adopting.",
    draw: (s) => {
      text(s, "Guiding question", { x: 1.0, y: 1.6, w: 11.3, h: 0.5 }, { fontSize: 20, color: T.gold, bold: true });
      text(s, "Can a model think longer by reusing its layers instead of writing more tokens?", { x: 1.0, y: 2.2, w: 11.3, h: 1.9 }, { fontSize: 38, bold: true });
      text(s, "Today: what is it · what can it do · is it worth adopting?", { x: 1.0, y: 4.35, w: 11.3, h: 0.6 }, { fontSize: 24, color: T.navy });
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
        text(s, q.full, { x: 1.5, y: y + 0.05, w: 11.3, h: 0.9 }, { fontSize: 22, bold: true });
      });
    },
  });

  // #5 what we want
  add({
    crumb: CRUMB, title: "What we want: AI that thinks deeply enough to solve hard problems", cite: "Animation ours: the two ways side by side",
    draw: (s) => {
      text(s, [
        { text: "Deep thinking = many steps of computation before the answer.", options: { bold: true, breakLine: true } },
        { text: "Two ways the field has tried so far: 1  stack more layers,  2  write a longer chain of thought.", options: { color: T.gray } },
      ], { x: T.X, y: 1.3, w: 12.4, h: 1.0 }, { fontSize: 21, paraSpaceAfter: 6 });
      image(s, "gif/two_ways_stack_vs_cot.gif", { x: T.X, y: 2.45, w: 12.45, h: 4.4 });
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
    crumb: CRUMB,
    title: "The price: depth caps a Transformer's steps per token",
    notes: "Each layer is one sequential step. A forward pass has L of them, no matter how hard the token is.",
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
    },
  });

  // RNN vs Transformer in motion: the same 6 tokens, read sequentially vs in parallel (figures/gif, build/gif/make_gifs.py)
  add({
    crumb: CRUMB, title: "Same sentence, two ways to read it: step by step, or all at once",
    cite: "Animation ours, structure per Vaswani et al. 2017, Sec. 1 and Table 1 (sequential operations per layer)",
    draw: (s) => {
      image(s, "gif/rnn_vs_transformer.gif", { x: T.X, y: 1.3, w: 12.45, h: 4.75 });
      text(s, "When generating text, both still write one token at a time. The gap is in training and in reading the prompt.", { x: T.X, y: 6.15, w: 12.4, h: 0.5 }, { fontSize: 17, color: T.gray });
    },
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

  // #8 way 2: chain of thought (Saunshi Fig 4, left)
  const cot = { label: "Way 2, chain of thought: each pass writes one token, which is fed back in.", body: "More steps cost more tokens: every intermediate step has to be written out and read back.", box: [0.03, 0, 0.37, 1] };
  const loop = { label: "Looped model: each pass updates every position in place; the thoughts (red) cost no tokens.", body: "An RNN's repetition, moved from time to depth: tokens are still processed in parallel. Universal Transformers, 2018. CoT thinks outside the model, the loop inside it.", box: [0.64, 0, 0.99, 1] };
  figSeq({
    crumb: CRUMB, cite: `${SAUNSHI}, Fig. 4`,
    titles: ["Today's models get around the cap by writing tokens"],
    fig: "saunshi-fig4.png", layout: "top", items: [cot],
    notes: ["Blue bar = the whole model. Red outline = the newest thought."],
  });

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
  // Cut 21 Nov (v7.5): Session B (Youngho) has no Bitter Lesson callback, so the setup is dropped. Set OPTIONAL = true to restore.
  for (let k = 0; OPTIONAL && k < bl.length; k++) {
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
  const caps = [   // rewritten by GPT-6 Astra (21 Nov): a plain question, then the work that answers it
    [["How did models process text before looped Transformers? ", true], ["RNNs repeat a step, Transformers enable parallel training with fixed depth, and ACT learns when to stop.", false]],
    [["Can a Transformer take more steps without adding layers? ", true], ["Universal Transformers reuse the same block of layers and use ACT to decide per token when to stop.", false]],
    [["What could a Transformer compute if we kept looping it? ", true], ["Giannou proves a looped Transformer can run programs, while chain of thought adds steps by writing intermediate text.", false]],
    [["Can we train language models to use these loops? ", true], ["Huginn trains a looped language model, MoR chooses loops per token, and Ouro tests larger scale pretraining with learned stopping.", false]],
    [["Can computation carry over from one token to the next? ", true], ["RLT carries internal information from one token to the next, while GPT-6 Astra's reported use of loops remains unconfirmed.", false]],
  ];
  for (let k = 0; k < caps.length; k++) {
    add({
      crumb: ["Roadmap"], title: "Roadmap: each answer raised the next question",
      draw: (s) => {
        roadmap(s, k);
        s.addShape("rect", { x: T.X, y: 5.55, w: 12.4, h: 1.3, fill: { color: "F7F7F7" }, line: { type: "none" } });
        text(s, caps[k].map(([t, b]) => ({ text: t, options: { bold: b, color: b ? T.gold : T.ink } })), { x: T.X + 0.25, y: 5.6, w: 11.9, h: 1.2 }, { fontSize: 19, valign: "middle" });
      },
    });
  }
};
