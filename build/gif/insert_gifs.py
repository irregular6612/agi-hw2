"""Put the concept GIFs into the updated deck, without touching the source deck.

python3 build/gif/make_gifs.py && python3 build/gif/insert_gifs.py   (needs python-pptx)

- Guiding-question slide: the question moves up and cot_vs_loop.gif is added under it.
- Remark slides of Huginn / MoR / Ouro: the paper figure is swapped for its animated redraw
  (the builds before each Remark still walk through the original figure).
Slides are found by their visible text, so slide numbers may shift. Notes are not changed.
"""
from pathlib import Path

from PIL import Image
from pptx import Presentation
from pptx.util import Inches

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "build/out/looped-transformers-updated-20261108.pptx"
DEST = ROOT / "build/out/looped-transformers-gif-20261111.pptx"
GIF = ROOT / "figures/gif"
FIG_BOX = (0.45, 1.3, 12.45, 3.75)  # lib.js figSeq "top" layout figure box (inches)

REMARK = [  # (title on the slide, gif)
    ("Huginn: embed once, loop a core r times, decode once", "huginn_loop.gif"),
    ("MoR gives each token its own number of loops", "mor_routing.gif"),
    ("Ouro trains an exit gate for every loop", "ouro_exit.gif"),
]


def texts(slide):
    return [sh.text_frame.text for sh in slide.shapes if sh.has_text_frame]


def fit(gif, box):
    x, y, w, h = box
    gw, gh = Image.open(gif).size
    s = min(w / gw, h / gh)
    return x + (w - gw * s) / 2, y, gw * s, gh * s


def add_gif(slide, gif, box, at=None):
    x, y, w, h = fit(gif, box)
    pic = slide.shapes.add_picture(str(gif), Inches(x), Inches(y), Inches(w), Inches(h))
    if at is not None:  # keep the z-order of the picture it replaces
        tree = slide.shapes._spTree
        tree.remove(pic._element)
        tree.insert(at, pic._element)
    return pic


prs = Presentation(SRC)
done = []
for i, slide in enumerate(prs.slides, 1):
    t = texts(slide)
    if "Guiding question" in t and any(x.startswith("Can a model think longer") for x in t):
        # lift the question to make room: label 2.0 -> 1.25 in, question 2.6 -> 1.75 in
        for sh in slide.shapes:
            if sh.has_text_frame and sh.text_frame.text == "Guiding question":
                sh.top = Inches(1.25)
            elif sh.has_text_frame and sh.text_frame.text.startswith("Can a model think longer"):
                sh.top, sh.height = Inches(1.75), Inches(1.45)
        add_gif(slide, GIF / "cot_vs_loop.gif", (1.0, 3.35, 11.3, 3.5))
        done.append((i, "cot_vs_loop.gif"))
        continue
    for title, gif in REMARK:
        if title in t and any(x.startswith("Remark:") for x in t):
            pics = [sh for sh in slide.shapes if sh.shape_type == 13]  # PICTURE
            assert len(pics) == 1, (i, title, len(pics))
            old = pics[0]._element
            at = list(slide.shapes._spTree).index(old)
            rid = old.blipFill.blip.rEmbed
            slide.shapes._spTree.remove(old)
            slide.part.drop_rel(rid)
            pic = add_gif(slide, GIF / gif, FIG_BOX, at)
            gap = pic.top + pic.height + Inches(0.35)
            for sh in slide.shapes:  # keep the Remark clear of the GIF's caption line
                if sh.has_text_frame and sh.text_frame.text.startswith("Remark:") and sh.top < gap:
                    sh.top = gap
            done.append((i, gif))

assert len(done) == 4, done
prs.save(DEST)
for i, g in done:
    print(f"slide {i}: {g}")
print("wrote", DEST.relative_to(ROOT))
