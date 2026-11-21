"""Add the sources of the Astra rumor slide (Session A, slide 4) to the Thank-you reference list.

The reference slide belongs to Session B (Youngho's slides), which merge_session_b.py keeps from
the final deck, so this edits build/out/looped-transformers.pptx in place. Safe to re-run.
"""
import copy
from pathlib import Path

from pptx import Presentation

DECK = Path(__file__).resolve().parents[1] / "build" / "out" / "looped-transformers.pptx"
REFS = [
    "Efrati, Palazzolo & Drew, “OpenAI Technique in ‘Astra’ Model Sparks Security Concerns”, The Information, 1 Sept 2026",
    "Brandom, “OpenAI’s new reasoning technique alarms AI safety experts”, TechCrunch, 2 Sept 2026 · A. Volkov (@altryne), post on X, 2 Sept 2026",
    "Kahn, “Safety experts warn novel design of OpenAI’s Astra model could make future AI agents harder to monitor”, Fortune, 3 Sept 2026",
]

prs = Presentation(DECK)
slide = next(s for s in prs.slides if any(sh.has_text_frame and sh.text_frame.text == "Thank you" for sh in s.shapes))
box = max((sh for sh in slide.shapes if sh.has_text_frame), key=lambda sh: len(sh.text_frame.paragraphs))
tf = box.text_frame
have = {p.text for p in tf.paragraphs}
added = 0
for ref in REFS:
    if ref in have:
        continue
    last = tf.paragraphs[-1]._p
    new = copy.deepcopy(last)
    last.addnext(new)
    runs = new.findall("{http://schemas.openxmlformats.org/drawingml/2006/main}r")
    for r in runs[1:]:
        new.remove(r)
    runs[0].find("{http://schemas.openxmlformats.org/drawingml/2006/main}t").text = ref
    added += 1
prs.save(DECK)
print(f"added {added} reference line(s); list now has {len(tf.paragraphs)} lines")
