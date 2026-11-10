// Shared narrative devices: the RQ ledger, section covers, answer slides.
const { T, add, text, ledger } = require("./lib");

const QS = [
  { id: "Q1", short: "Can loops compute?", full: "Can reused layers compute what a deeper stack computes?", session: "Session A", papers: "Universal Transformers 2018 · Giannou 2023 · Saunshi 2025" },
  { id: "Q2", short: "Can loops be trained?", full: "Can we train a looped model so that extra loops help at test time?", session: "Session A", papers: "Yang 2024 · Huginn 2025" },
  { id: "Q3", short: "Does it pay at scale?", full: "Does looping pay off at scale — per parameter, and per FLOP?", session: "Session B", papers: "Saunshi 2025 · MoR 2025 · Ouro 2025" },
  { id: "Q4", short: "What do we lose?", full: "What do we lose when reasoning moves into hidden states?", session: "Session B", papers: "GPT-6 Astra · CoT monitorability 2026 · RLT 2026" },
];
const before = (id) => QS.slice(0, QS.findIndex((q) => q.id === id)).map((q) => q.id);

function cover(id, notes) {
  const q = QS.find((x) => x.id === id);
  add({
    id: `cover-${id}`, crumb: null, notes,
    draw: (s) => {
      text(s, q.id, { x: T.X, y: 1.5, w: 4, h: 1.0 }, { fontSize: 54, bold: true, color: T.gold });
      text(s, q.full, { x: T.X, y: 2.55, w: 12.2, h: 1.9 }, { fontSize: 36, bold: true });
      text(s, `${q.session} · ${q.papers}`, { x: T.X, y: 4.6, w: 12.2, h: 0.5 }, { fontSize: 18, color: T.gray });
      ledger(s, QS, { answered: before(id), current: id });
    },
  });
}

// evidence: [{t: "...", src: "Huginn Table 4", kind: "yes"|"but"}]
function answer(id, { short, evidence, notes }) {
  const q = QS.find((x) => x.id === id);
  add({
    crumb: [id, "Answer"], title: `Answer to ${id}`, notes,
    draw: (s) => {
      text(s, q.full, { x: T.X, y: 1.2, w: 12.4, h: 0.45 }, { fontSize: 18, italic: true, color: T.gray });
      text(s, short, { x: T.X, y: 1.75, w: 12.4, h: 1.1 }, { fontSize: 30, bold: true, color: T.gold, valign: "middle" });
      const runs = [];
      evidence.forEach((e) => {
        runs.push({ text: e.kind === "but" ? "But  " : "✓  ", options: { bold: true, color: e.kind === "but" ? T.gray : T.gold } });
        runs.push({ text: e.t, options: { color: T.ink } });
        runs.push({ text: `   ${e.src}`, options: { color: T.gray, fontSize: 14, breakLine: true } });
      });
      text(s, runs, { x: T.X, y: 3.05, w: 12.4, h: 3.1 }, { paraSpaceAfter: 12 });
      ledger(s, QS, { answered: [...before(id), id] });
    },
  });
}

module.exports = { QS, cover, answer };
