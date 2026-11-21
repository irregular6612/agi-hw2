"""Small static pictures of what each Giannou program *is* (not how the loop runs it).

python3 build/gif/make_task_icons.py  -> figures/giannou-task-{subleq,calculator,matrix,sgd}.png

Values are illustrations; the matrix and expression match the ones used in make_gifs_giannou.py.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from make_gifs import Canvas, C, ROOT  # noqa: E402

OUT = ROOT / "figures"
W, H = 1080, 200


def cell(cv, x, y, v, w=74, h=44, hl=False, size=22):
    cv.box(x, y, w, h, fill=C["pale"] if hl else C["light"], line=C["gold"] if hl else C["faint"], width=2, r=6)
    cv.text(x + w / 2, y + h / 2, v, size, C["ink"], bold=hl, anchor="mm")


def subleq():
    cv = Canvas(W, H)
    cv.box(10, 50, 250, 100, fill=C["blue"], line=C["navy"], width=2)
    cv.text(135, 100, "SUBLEQ a, b, c", 30, C["navy"], bold=True, anchor="mm")
    cv.arrow(270, 100, 320, 100, C["gray"], 3, 10)
    cv.text(335, 62, "1  mem[b] ← mem[b] − mem[a]", 26, C["ink"], anchor="lm")
    cv.text(335, 112, "2  if mem[b] ≤ 0, jump to line c", 26, C["ink"], anchor="lm")
    cv.text(335, 158, "    else go to the next line", 26, C["gray"], anchor="lm")
    cv.text(W - 10, H - 8, "one instruction is enough for a general-purpose computer", 18, C["gray"], italic=True, anchor="rd")
    return cv.frame()


def calculator():
    cv = Canvas(W, H)
    cv.text(20, 62, "√( 1 / (((a + b) − c) · d) ) / 100", 34, C["ink"], bold=True, anchor="lm")
    ops = ["+", "−", "×", "1/x", "√", "%"]
    for i, o in enumerate(ops):
        x = 20 + i * 118
        cv.box(x, 112, 100, 56, fill=C["pale"], line=C["gold"], width=2, r=8)
        cv.text(x + 50, 140, o, 28, C["ink"], bold=True, anchor="mm")
    cv.text(W - 10, H - 8, "an arithmetic expression, built from basic operations", 18, C["gray"], italic=True, anchor="rd")
    return cv.frame()


def matrix():
    cv = Canvas(W, H)

    def mat(x, label, vals, hl=False):
        cv.text(x + 78, 22, label, 22, C["gray"], anchor="mm")
        cv.line(x - 6, 40, x - 6, 150, C["ink"], 2); cv.line(x - 6, 40, x + 4, 40, C["ink"], 2); cv.line(x - 6, 150, x + 4, 150, C["ink"], 2)
        cv.line(x + 162, 40, x + 162, 150, C["ink"], 2); cv.line(x + 152, 40, x + 162, 40, C["ink"], 2); cv.line(x + 152, 150, x + 162, 150, C["ink"], 2)
        for i, v in enumerate(vals):
            cell(cv, x + (i % 2) * 80, 46 + (i // 2) * 54, v, hl=hl)

    mat(30, "A", ["2", "1", "1", "3"])
    cv.text(235, 95, "·", 40, C["ink"], bold=True, anchor="mm")
    mat(275, "A⁻¹  (to find)", ["0.6", "−0.2", "−0.2", "0.4"], hl=True)
    cv.text(480, 95, "=", 40, C["ink"], bold=True, anchor="mm")
    mat(525, "I", ["1", "0", "0", "1"])
    cv.text(W - 10, H - 8, "find the matrix that undoes A", 18, C["gray"], italic=True, anchor="rd")
    return cv.frame()


def sgd():
    cv = Canvas(W, H)
    x0, y0, w, h = 70, 20, 400, 150
    cv.line(x0, y0 + h, x0 + w, y0 + h, C["gray"], 2); cv.line(x0, y0, x0, y0 + h, C["gray"], 2)
    cv.text(x0 + w / 2, y0 + h + 4, "w", 20, C["gray"], anchor="mt")
    cv.text(x0 - 8, y0 + 10, "loss", 20, C["gray"], anchor="rm")
    pts = [(x0 + 10 + i * 3.8, y0 + 10 + (1 - ((i - 50) / 50) ** 2) * (h - 20)) for i in range(101)]
    for p, q in zip(pts, pts[1:]):
        cv.line(*p, *q, C["navy"], 3)
    steps = [8, 24, 36, 44, 48]
    for a, b in zip(steps, steps[1:]):
        cv.arrow(*pts[a], *pts[b], C["gold"], 3, 9)
    for s in steps:
        px, py = pts[s]
        cv.d.ellipse([(px - 7) * 2, (py - 7) * 2, (px + 7) * 2, (py + 7) * 2], fill=C["gold"])
    cv.text(520, 70, "w ← w − η · gradient", 32, C["ink"], bold=True, anchor="lm")
    cv.text(520, 122, "step downhill, one example at a time", 24, C["gray"], anchor="lm")
    cv.text(W - 10, H - 8, "train a model by small gradient steps", 18, C["gray"], italic=True, anchor="rd")
    return cv.frame()


if __name__ == "__main__":
    for name, fn in [("subleq", subleq), ("calculator", calculator), ("matrix", matrix), ("sgd", sgd)]:
        path = OUT / f"giannou-task-{name}.png"
        fn().save(path)
        print(path.relative_to(ROOT))
