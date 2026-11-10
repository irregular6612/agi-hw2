// node build/build.js [--lang ko|en] [section ...]   e.g. node build/build.js s3_q2
// Also writes out/manifest.json (every build: key, visible text, notes) and out/timing.md.
const fs = require("fs");
const path = require("path");
const PptxGenJS = require("pptxgenjs");
const { render, section, specs, splitNoteParagraphs, loadScript, timing } = require("./lib");

const TALK = {
  sessions: { A: 30, B: 30 },               // minutes; Discussion (20 min) is not scripted time
  // target minutes per section, set with the storyline; spoken script + clicks must fit them
  sections: {
    s1_background: { session: "A", min: 5 }, s2_q1: { session: "A", min: 10.5 }, s3_q2: { session: "A", min: 11.5 },
    s4_q3: { session: "B", min: 11.5 }, s5_q4: { session: "B", min: 10 }, s6_synthesis: { session: "B", min: 4.5 },
  },
};
module.exports = TALK;
if (require.main !== module) return;

const args = process.argv.slice(2);
const li = args.indexOf("--lang");
const lang = li >= 0 ? args.splice(li, 2)[1] : "ko";
const only = args;
const sections = only.length ? only : Object.keys(TALK.sections);
sections.forEach((s) => { section(s, TALK.sections[s].session); require(`./${s}`)(); });

const script = loadScript(path.join(__dirname, "script", lang));
const clock = timing(script, lang, TALK);

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";
pptx.title = "Thinking Longer Without Writing More: Looped Transformers";
pptx.author = "Team 5 (AGI26F)";
render(pptx, { script, timing: clock });

const OUT = path.join(__dirname, "out");
const known = new Set(specs.map((s) => s.key));
const stale = Object.keys(script).filter((k) => !known.has(k));
fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(specs.map((s, i) => ({
  n: i + 1, key: s.key, session: s.session, section: s.section, title: s.title || null,
  crumb: s.crumb || null, cite: s.cite || null, onSlide: s.onSlide, notes: s.notes || null, script: script[s.key] || null,
})), null, 1));
fs.writeFileSync(path.join(OUT, "timing.md"), `# Timing (${lang})\n\n${clock.report}\n`);
console.log(clock.report.split("\n").filter((l) => l.startsWith("- ")).join("\n"));
if (stale.length) console.warn(`script keys with no slide (${stale.length}):`, stale.join(", "));

const out = path.join(OUT, only.length ? `draft-${only.join("+")}.pptx` : "looped-transformers.pptx");
pptx.write({ outputType: "nodebuffer" }).then(splitNoteParagraphs).then((b) => { fs.writeFileSync(out, b); console.log("wrote", out); });
