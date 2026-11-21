"""Two ways to get more computation before the answer, side by side, in one GIF.

python3 build/gif/make_gifs_ways.py  -> figures/gif/two_ways_stack_vs_cot.gif

Left: a deeper stack (4 -> 8 -> 12 layers), one pass per token, parameters grow with depth.
Right: the same 4-layer stack writes tokens; each token is fed back and costs one more pass.
In stage s both sides spend 4·s steps on the answer "a". Generic illustration, no paper numbers.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from make_gifs import Canvas, C, mix, save_gif, S, font  # noqa: E402,F401

W, H = 1250, 460
BASE, LMAX = 4, 12            # right stack depth; deepest left stack
LH, LG = 15, 4                # layer height, gap
BOT = 352                     # bottom of both stacks
SW = 316                      # stack width (covers 6 token slots)
TOK, PITCH = 46, 52           # token box width, slot pitch
ROW = (372, 408)              # input row (y0, y1)
COL = 395                     # counter column, offset from panel x0


def ltop(i):  # top y of layer i (1 = bottom)
    return BOT - i * LH - (i - 1) * LG


def slot_x(x0, i):
    return x0 + 30 + i * PITCH


def stack(cv, x0, n, hi=None, new=None, ghosts=0):
    sx = x0 + 20
    for i in range(1, n + ghosts + 1):
        y = ltop(i)
        if i > n:
            cv.box(sx, y, SW, LH, line=C["faint"], width=1, r=4, dash=True)
        elif i == hi:
            cv.box(sx, y, SW, LH, fill=C["gold"], line=C["gold"], width=2, r=4)
        elif i == new:
            cv.box(sx, y, SW, LH, fill=C["pale"], line=C["gold"], width=2, r=4)
        else:
            cv.box(sx, y, SW, LH, fill=C["blue"], line=C["navy"], width=1, r=4)


def token(cv, x, y, label, kind="in", bold=False):
    fill, line = (C["light"], C["faint"]) if kind == "in" else (C["pale"], C["gold"])
    cv.box(x, y, TOK, ROW[1] - ROW[0], fill=fill, line=line, width=3 if bold else 2)
    cv.text(x + TOK / 2, y + (ROW[1] - ROW[0]) / 2, label, 20, bold=bold, anchor="mm")


def row(cv, x0, labels):
    for i, lab in enumerate(labels):
        x = slot_x(x0, i)
        token(cv, x, ROW[0], lab, "in" if lab.startswith("x") else "out")
        cv.arrow(x + TOK / 2, ROW[0] - 2, x + TOK / 2, BOT + 3, C["faint"], 2, 7)


def out_box(cv, x0, i, top, label):
    """Token just produced, above the stack in slot i's column. Returns its box (x, y)."""
    x, y = slot_x(x0, i), top - 46
    cv.arrow(x + TOK / 2, top - 2, x + TOK / 2, y + 36 + 3, C["gold"], 2, 8)
    token(cv, x, y, label, "out", bold=True)
    return x, y


def counter(cv, x, y, label, value, hot):
    cv.text(x, y, label, 18, C["gray"])
    cv.text(x, y + 22, value, 30, C["gold"] if hot else C["ink"], bold=True)


def meter(cv, x, y, n, note):
    cv.text(x, y, "parameters", 18, C["gray"])
    seg = 15
    for i in range(LMAX):
        cv.box(x + i * seg, y + 26, seg - 2, 26, fill=C["navy"] if i < n else C["light"],
               line=None if i < n else C["faint"], width=1, r=2)
    cv.text(x, y + 62, note, 18, C["gray"])


def left(cv, x0, L, hi, new, ans):
    cv.text(x0, 8, "Way 1: stack more layers", 26, bold=True)
    cv.text(x0, 42, "a deeper model; one pass through every layer", 18, C["gray"])
    row(cv, x0, ["x1", "x2", "x3"])
    stack(cv, x0, L, hi, new, ghosts=LMAX - L)
    if ans:
        out_box(cv, x0, 3, ltop(L), "a")
    cx = x0 + COL
    counter(cv, cx, 84, "layers", f"{L}", new is not None)
    counter(cv, cx, 152, "steps per token", f"{L}", new is not None)
    meter(cv, cx, 226, L, "grows with each layer")


def right(cv, x0, thoughts, hi, out, k, khot):
    cv.text(x0, 8, "Way 2: longer chain of thought", 26, bold=True)
    cv.text(x0, 42, "same 4 layers; each written token is one more pass", 18, C["gray"])
    row(cv, x0, ["x1", "x2", "x3"] + [f"t{j + 1}" for j in range(thoughts)])
    stack(cv, x0, BASE, hi)
    if out:
        i = 3 + thoughts
        bx, by = out_box(cv, x0, i, ltop(BASE), out)
        if out != "a":  # fed back: append to the end of the input row
            xfb, ym = x0 + 20 + SW + 22, (ROW[0] + ROW[1]) / 2
            cv.line(bx + TOK + 2, by + 18, xfb, by + 18, C["gold"], 3)
            cv.line(xfb, by + 18, xfb, ym, C["gold"], 3)
            sx = slot_x(x0, i)
            cv.arrow(xfb, ym, sx + TOK + 5, ym, C["gold"], 3, 10)
            cv.box(sx, ROW[0], TOK, ROW[1] - ROW[0], line=C["gold"], width=2, dash=True)
    cx = x0 + COL
    counter(cv, cx, 84, "tokens written", f"{k}", khot)
    counter(cv, cx, 152, "steps so far", f"4 × {k} = {4 * k}", khot)
    meter(cv, cx, 226, BASE, "fixed: same 4 layers")


def draw(L, lhi=None, lnew=None, lans=False, thoughts=0, rhi=None, rout=None, k=0, khot=False, end=False):
    cv = Canvas(W, H)
    left(cv, 8, L, lhi, lnew, lans)
    cv.line(W / 2 + 2, 10, W / 2 + 2, ROW[1], C["faint"], 1)
    right(cv, W / 2 + 22, thoughts, rhi, rout, k, khot)
    if end:
        cv.text(W / 2, H - 22, "More layers cost parameters; more thoughts cost tokens.", 24, C["navy"], bold=True, anchor="mm")
    return cv.frame()


def two_ways():
    frames, dur = [], []

    def add(ms, **kw):
        frames.append(draw(**kw))
        dur.append(ms)

    add(1000, L=BASE)
    for s in (1, 2, 3):
        L = BASE * s
        for j in range(1, BASE + 1) if s > 1 else ():  # left grows; right starts a fresh answer
            add(120, L=L - BASE + j, lnew=L - BASE + j)
        thoughts = k = 0
        for t in range(1, L + 1):
            add(120, L=L, lhi=t, thoughts=thoughts, rhi=(t - 1) % BASE + 1, k=k)
            if t % BASE:
                continue
            k += 1
            if t < L:
                add(450, L=L, lhi=t, thoughts=thoughts, rout=f"t{thoughts + 1}", k=k, khot=True)
                thoughts += 1
            else:
                add(900 if s < 3 else 700, L=L, lans=True, thoughts=thoughts, rout="a", k=k, khot=True)
    add(2400, L=LMAX, lans=True, thoughts=thoughts, rout="a", k=k, end=True)
    save_gif("two_ways_stack_vs_cot", frames, dur)
    return frames, dur


if __name__ == "__main__":
    two_ways()
