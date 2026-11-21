// Shared narrative devices: the RQ ledger, section covers, answer slides, the roadmap.
const { T, add, text, ledger } = require("./lib");

const QS = [
  { id: "Q1", short: "Where does depth stall?", full: "Where do today's two ways to think deeper, more layers and longer CoT, get stuck?", session: "Session A", papers: "Kaplan 2020 · Saunshi 2025 · RNN vs Transformer", strip: [] },
  { id: "Q2", short: "What can a loop do?", full: "What can a looped Transformer compute in principle, and can training find it?", session: "Session A", papers: "Universal Transformers 2018 · Giannou 2023 · Saunshi 2025", strip: ["UT", "GI"] },
  { id: "Q3", short: "How to build, scale it?", full: "How do we build a looped language model, and does it pay off at scale?", session: "Sessions A–B", papers: "Huginn 2025 · MoR 2025 · Ouro 2025 · RLT 2026", strip: ["HU", "MOR", "OU", "RLT"] },
  { id: "Q4", short: "Worth adopting?", full: "Is it worth adopting, and what do we lose?", session: "Session B", papers: "GPT-6 Astra system card · CoT monitorability of looped LMs 2026", strip: [] },
];
const before = (id) => QS.slice(0, QS.findIndex((q) => q.id === id)).map((q) => q.id);

// ---------- roadmap (storyline "전체 로드맵"): editable shapes, revealed era by era ----------
const RM_COLS = [1.25, 3.35, 5.45, 7.55, 9.65, 11.75];
const RM_ERAS = ["before 2018", "2018", "2022–23", "Feb 2025", "Jul–Oct 2025", "Sept–Oct 2026"];
const RM_NODES = {
  RNN: { c: 0, y: 2.1, t: "RNN / LSTM", sub: "one rule, step by step", kind: "root", era: 0 },
  ACT: { c: 0, y: 3.3, t: "ACT, 2016", sub: "learn when to stop", kind: "root", era: 0 },
  TF: { c: 0, y: 4.5, t: "Transformer, 2017", sub: "parallel, fixed depth", kind: "root", era: 0 },
  UT: { c: 1, y: 3.3, t: "Universal Transformers", kind: "core", era: 1 },
  GI: { c: 2, y: 3.3, t: "Giannou: a loop is a computer", kind: "core", era: 2 },
  COT: { c: 2, y: 4.75, t: "Chain of thought", sub: "think in tokens", kind: "alt", era: 2 },
  HU: { c: 3, y: 3.3, t: "Huginn 3.5B", kind: "core", era: 3 },
  MOR: { c: 4, y: 2.5, t: "Mixture-of-Recursions", kind: "core", era: 3 },
  OU: { c: 4, y: 4.1, t: "Ouro, 7.7T tokens", kind: "core", era: 3 },
  RLT: { c: 5, y: 2.5, t: "Recurrent Looped Transformer", kind: "core", era: 4 },
  AS: { c: 5, y: 4.1, t: "GPT-6 Astra report", sub: "unconfirmed", kind: "rumor", era: 4 },
};
const RM_EDGES = [["RNN", "UT"], ["ACT", "UT"], ["TF", "UT"], ["TF", "COT", 1], ["UT", "GI"], ["GI", "HU"], ["COT", "HU", 1], ["HU", "MOR"], ["HU", "OU"], ["OU", "RLT"], ["OU", "AS", 1]];
const NW = 1.6, NH = 0.78;

function seg(s, x0, y0, x1, y1, { color = T.gray, dash = false, head = true, width = 1.25 } = {}) {
  s.addShape("line", {
    x: Math.min(x0, x1), y: Math.min(y0, y1), w: Math.abs(x1 - x0) || 0.001, h: Math.abs(y1 - y0) || 0.001,
    flipH: x1 < x0, flipV: y1 < y0,   // default line runs top-left → bottom-right
    line: { color, width, dashType: dash ? "dash" : "solid", endArrowType: head ? "triangle" : undefined },
  });
}

// reveal: last era drawn (0–4); current era is outlined in gold.
function roadmap(s, reveal) {
  const X = (n) => RM_COLS[n.c];
  RM_ERAS.forEach((e, i) => {
    const era = [0, 1, 2, 3, 3, 4][i];
    text(s, e, { x: RM_COLS[i] - 1.0, y: 1.25, w: 2.0, h: 0.3 }, { fontSize: 13, bold: era === reveal, color: era <= reveal ? (era === reveal ? T.gold : T.gray) : T.faint, align: "center" });
  });
  RM_EDGES.forEach(([a, b, dash]) => {
    const A = RM_NODES[a], B = RM_NODES[b];
    if (A.era > reveal || B.era > reveal) return;
    seg(s, X(A) + NW / 2, A.y, X(B) - NW / 2, B.y, { dash: !!dash, color: B.era === reveal ? T.gold : T.gray });
  });
  if (reveal >= 4) {   // RLT brings recurrence over time back: dashed arc from RNN over the top
    const xa = X(RM_NODES.RNN), xb = X(RM_NODES.RLT), top = 1.68;
    seg(s, xa, RM_NODES.RNN.y - NH / 2, xa, top, { dash: true, head: false, color: T.gold });
    seg(s, xa, top, xb, top, { dash: true, head: false, color: T.gold });
    seg(s, xb, top, xb, RM_NODES.RLT.y - NH / 2, { dash: true, color: T.gold });
  }
  Object.values(RM_NODES).forEach((n) => {
    if (n.era > reveal) return;
    const cur = n.era === reveal;
    const fill = n.kind === "core" ? T.paleGold : n.kind === "root" ? "F2F2F2" : "FFFFFF";
    const dash = n.kind === "alt" || n.kind === "rumor";
    s.addShape("roundRect", { x: X(n) - NW / 2, y: n.y - NH / 2, w: NW, h: NH, rectRadius: 0.06, fill: { color: fill },
      line: { color: cur ? T.gold : n.kind === "core" ? T.gold : T.gray, width: cur ? 2.25 : 1, dashType: dash ? "dash" : "solid" } });
    const runs = [{ text: n.t, options: { bold: true, breakLine: !!n.sub } }];
    if (n.sub) runs.push({ text: n.sub, options: { fontSize: 11, color: T.gray } });
    text(s, runs, { x: X(n) - NW / 2 + 0.05, y: n.y - NH / 2, w: NW - 0.1, h: NH }, { fontSize: 13, align: "center", valign: "middle", color: cur ? T.ink : T.past });
  });
}

// One-row "you are here" strip of the six core papers, for section covers.
const STRIP = [["UT", "Universal Transformers"], ["GI", "Giannou"], ["HU", "Huginn"], ["MOR", "MoR"], ["OU", "Ouro"], ["RLT", "RLT"]];
function strip(s, hi = [], y = 5.35) {
  const w = 1.75, gap = 0.33, x0 = (T.W - (w * STRIP.length + gap * (STRIP.length - 1))) / 2;
  STRIP.forEach(([id, lab], i) => {
    const x = x0 + i * (w + gap), on = hi.includes(id);
    s.addShape("roundRect", { x, y, w, h: 0.42, rectRadius: 0.06, fill: { color: on ? T.gold : "FFFFFF" }, line: { color: on ? T.gold : T.faint, width: 1 } });
    text(s, lab, { x, y, w, h: 0.42 }, { fontSize: 12, bold: on, color: on ? "FFFFFF" : T.gray, align: "center", valign: "middle" });
    if (i < STRIP.length - 1) seg(s, x + w + 0.04, y + 0.21, x + w + gap - 0.04, y + 0.21, { color: T.faint, width: 1 });
  });
}

function cover(id, notes) {
  const q = QS.find((x) => x.id === id);
  add({
    id: `cover-${id}`, crumb: null, notes,
    draw: (s) => {
      text(s, q.id, { x: T.X, y: 1.5, w: 4, h: 1.0 }, { fontSize: 54, bold: true, color: T.gold });
      text(s, q.full, { x: T.X, y: 2.55, w: 12.2, h: 1.9 }, { fontSize: 36, bold: true });
      text(s, q.papers, { x: T.X, y: 4.6, w: 12.2, h: 0.5 }, { fontSize: 18, color: T.gray });
      strip(s, q.strip);
      ledger(s, QS, { answered: before(id), current: id });
    },
  });
}

// One-sentence question slide placed before a paper: what the next slides will show.
function question(id, q, crumb = null) {
  add({
    id, crumb,
    draw: (s) => text(s, q, { x: 1.0, y: 2.3, w: 11.3, h: 2.6 }, { fontSize: 40, bold: true, align: "center", valign: "middle" }),
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

module.exports = { QS, cover, answer, roadmap, strip, seg, question };
