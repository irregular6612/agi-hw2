"""Write the Session B speaker notes (build/script/session_b.ko.md) into the final deck.

    python3 build/apply_session_b_notes.py

Session B slides are kept as edited pptx (merge_session_b.py), so their notes are not built from
code. The script has one block per slide, `## B<number>`; blocks are applied in order to the
slides after the handoff slide, so Session A can change length without renumbering.
Each note gets the same timing tag as Session A notes: [⏱ seconds · cumulative / 25:00].
Run it after merge_session_b.py. Safe to re-run. Needs python-pptx.
"""
import re
from pathlib import Path

from pptx import Presentation

ROOT = Path(__file__).resolve().parents[1]
DECK = ROOT / "build" / "out" / "looped-transformers.pptx"
SCRIPT = ROOT / "build" / "script" / "session_b.ko.md"
RATE, CLICK, BUDGET = 280, 1.5, 25 * 60   # same units as lib.js speechUnits (ko)


def units(t):
    return len(re.findall(r"[가-힣]", t)) + 1.5 * len(re.findall(r"[A-Za-z]+", t)) + 2 * len(re.findall(r"\d+(?:[.,]\d+)*", t))


def mmss(s):
    return f"{int(s // 60)}:{round(s % 60):02d}"


blocks = {}
for blk in re.split(r"(?m)^(?=## )", SCRIPT.read_text()):
    if blk.startswith("## B"):
        head, _, body = blk.partition("\n")
        blocks[int(head[4:].strip())] = body.strip()

prs = Presentation(DECK)
n = len(prs.slides)
HANDOFF = ("Huginn leaves three open questions", "Huginn leaves three questions for Session B")
hand = next(i for i, s in enumerate(prs.slides, 1) if any(sh.has_text_frame and sh.text_frame.text in HANDOFF for sh in s.shapes))
first = hand + 1
# blocks are numbered as in the deck they were written for; map them in order onto the slides after the handoff
order = sorted(blocks)
assert len(order) == n - hand, f"{len(order)} script blocks for {n - hand} Session B slides"
by_slide = {first + j: blocks[b] for j, b in enumerate(order)}
cum = 0
for i in range(first, n + 1):
    body = by_slide.get(i, "")
    sec = round(units(body) / RATE * 60 + CLICK) if body else round(CLICK)
    cum += sec
    tf = prs.slides[i - 1].notes_slide.notes_text_frame
    tf.text = f"{body}\n\n[⏱ {sec}초 · 누적 {mmss(cum)} / {mmss(BUDGET)}]" if body else ""
prs.save(DECK)
missing = [i for i in range(first, n + 1) if not by_slide.get(i)]
print(f"Session B notes: slides {first}–{n}, total {mmss(cum)} / {mmss(BUDGET)}" + (f", missing {missing}" if missing else ""))
