"""Final deck = Session A from the code build + Session B slides kept as edited pptx.

    node build/build.js                      # -> build/out/generated.pptx (whole deck from code)
    python3 build/merge_session_b.py         # -> build/out/looped-transformers.pptx
    python3 build/merge_session_b.py --b X.pptx   # take Session B from another deck (first import)

Session A = generated slides up to and including the handoff slide
("Huginn leaves three questions for Session B"). Session B = every slide after the
handoff in the --b deck (default: the current final deck, so re-running keeps Youngho's
edited slides). Shapes, images and notes are copied as they are; only the slide-number
field's cached text is refreshed. Needs python-pptx.
"""
import argparse
import copy
import io
from pathlib import Path

from pptx import Presentation
from pptx.opc.constants import RELATIONSHIP_TYPE as RT

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "build" / "out"
HANDOFF = "Huginn leaves three questions for Session B"
R_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"


def handoff_index(prs):
    for i, s in enumerate(prs.slides):
        if any(sh.has_text_frame and sh.text_frame.text == HANDOFF for sh in s.shapes):
            return i
    raise SystemExit(f"handoff slide not found: {HANDOFF!r}")


def drop_slides_after(prs, k):
    ids = prs.slides._sldIdLst
    for sid in list(ids)[k + 1:]:
        prs.part.drop_rel(sid.rId)
        ids.remove(sid)


def renumber(slide, new):
    """The page number is a slidenum field; PowerPoint recomputes it, but refresh the cached text."""
    A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
    for fld in slide._element.iter(f"{A}fld"):
        if fld.get("type") == "slidenum":
            fld.find(f"{A}t").text = str(new)


def copy_slide(src, dst_prs):
    layout = next(l for l in dst_prs.slide_layouts if l.name == src.slide_layout.name)
    new = dst_prs.slides.add_slide(layout)
    for sh in list(new.shapes):  # drop the layout's placeholders
        sh._element.getparent().remove(sh._element)
    rid_map = {}
    for rid, rel in src.part.rels.items():
        if rel.reltype == RT.IMAGE:
            _, new_rid = new.part.get_or_add_image_part(io.BytesIO(rel.target_part.blob))
            rid_map[rid] = new_rid
        elif rel.reltype == RT.HYPERLINK and rel.is_external:
            rid_map[rid] = new.part.relate_to(rel.target_ref, RT.HYPERLINK, is_external=True)
        elif rel.reltype not in (RT.SLIDE_LAYOUT, RT.NOTES_SLIDE):
            raise SystemExit(f"unsupported relationship on slide: {rel.reltype}")
    src_cSld = src._element.cSld
    new_cSld = new._element.cSld
    new._element.replace(new_cSld, copy.deepcopy(src_cSld))
    for tag in ("transition", "timing"):
        el = src._element.find(f"{{http://schemas.openxmlformats.org/presentationml/2006/main}}{tag}")
        if el is not None:
            new._element.append(copy.deepcopy(el))
    for el in new._element.iter():
        for attr in ("embed", "link", "id"):
            key = f"{{{R_NS}}}{attr}"
            if el.get(key) in rid_map:
                el.set(key, rid_map[el.get(key)])
    if src.has_notes_slide:
        new.notes_slide.notes_text_frame.text = src.notes_slide.notes_text_frame.text
    return new


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--a", default=OUT / "generated.pptx")
    ap.add_argument("--b", default=OUT / "looped-transformers.pptx")
    ap.add_argument("--out", default=OUT / "looped-transformers.pptx")
    args = ap.parse_args()
    b = Presentation(args.b)  # read fully before the output (maybe the same file) is overwritten
    kb = handoff_index(b)
    dst = Presentation(args.a)
    ka = handoff_index(dst)
    drop_slides_after(dst, ka)
    for j, s in enumerate(list(b.slides)[kb + 1:]):
        new = copy_slide(s, dst)
        renumber(new, ka + 2 + j)
    dst.save(args.out)
    print(f"Session A: {ka + 1} slides from {Path(args.a).name}; Session B: {len(b.slides) - kb - 1} slides from {Path(args.b).name} -> {Path(args.out).name} ({len(dst.slides)} slides)")


if __name__ == "__main__":
    main()
