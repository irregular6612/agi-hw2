"""Huginn's three block types as one GIF each, for a three-column slide.

python3 build/gif/make_gifs_huginn.py
  -> figures/gif/huginn_{prelude,recurrent,coda,three_blocks}.gif

Facts come only from sources/huginn.md (Sec 3.1 equations, Sec 3.2 adapter, Sec 4.1 shape):
  e = P(x);  s0 ~ N(0, σ² I_{n·h});  s_i = R(e, s_{i-1}), i ∈ {1..r};  p = C(s_r)
  (l_P, l_R, l_C) = (2, 4, 2), h = 5280, adapter A: R^{2h} -> R^h on the concatenation [s_i, e].
The words ("Hello", "World", ...), probabilities and cell values are illustration.

All three panels share one 100 ms timeline, so the combined GIF and the separate GIFs stay in step.
"""
import math
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from make_gifs import Canvas, C, mix, save_gif, caption, S, font  # noqa: E402,F401  (caption is 13 px; we need >= 16 px)

PW, PH = 420, 360            # one panel = one slide column
TICK = 100                   # ms per frame
R_MAX = 32                   # r used in the counter (Huginn's r̄ = 32, Sec 3.3)
N = 8                        # latent drawn as an 8×2 grid of cells (16 of h = 5280 dims)
CELL, PITCH = 17, 19
GW, GH = N * PITCH - 2, 2 * PITCH - 2

# Same noise / target as huginn_loop() in make_gifs.py, so the settled pattern matches that GIF.
_rng = random.Random(7)
NOISE = [_rng.random() for _ in range(2 * N)]
TARGET = [0.5 + 0.45 * math.sin(i * 0.9) for i in range(2 * N)]
_rng_e = random.Random(11)
E_VALS = [0.15 + 0.8 * _rng_e.random() for _ in range(2 * N)]

E_LO, E_HI = mix(C["prelude"], C["white"], 0.75), mix(C["prelude"], C["navy"], 0.6)   # e: prelude blue
S_LO, S_HI = "#E8F5EC", C["core"]                                                    # s: core green
HOT = C["gold"]


# ---------------------------------------------------------------- small drawing helpers
def tw(t, size, bold=False, italic=False):
    return font(size, bold, italic).getlength(t) / S


def sym(cv, x, y, base, sub="", size=20, color=C["ink"], bold=False, anchor="m"):
    """Italic math symbol with a lowered subscript, e.g. sym(.., 's', 'i−1'). y is the vertical middle."""
    ss = round(size * 0.72)
    w = tw(base, size, bold, True) + (tw(sub, ss, bold, True) + 1 if sub else 0)
    x0 = {"m": x - w / 2, "r": x - w, "l": x}[anchor]
    cv.text(x0, y, base, size, color, bold, True, anchor="lm")
    if sub:
        cv.text(x0 + tw(base, size, bold, True) + 1, y + size * 0.28, sub, ss, color, bold, True, anchor="lm")


def note(cv, x, y, t, size=16, color=C["gray"], anchor="mm", bold=False, italic=False):
    cv.text(x, y, t, size, color, bold, italic, anchor)


def grid(cv, x, y, vals, lo, hi, filled=16, outline=None):
    """A latent vector: 16 coloured cells. Cells past `filled` are drawn empty."""
    for i in range(2 * N):
        cx, cy = x + (i % N) * PITCH, y + (i // N) * PITCH
        if i < filled:
            # 7 shade levels per colour keeps the shared 128-colour GIF palette exact in the 3-panel GIF
            cv.box(cx, cy, CELL, CELL, fill=mix(lo, hi, round(vals[i] * 6) / 6), r=3)
        else:
            cv.box(cx, cy, CELL, CELL, fill=C["light"], line=C["faint"], width=1, r=3)
    if outline:
        cv.box(x - 4, y - 4, GW + 8, GH + 8, line=outline, width=2, r=5)


def word(cv, cx, cy, t, w=96, h=34, hot=False, chosen=False, size=19):
    """A token, drawn as a word box (same look for input and output tokens)."""
    fill = mix(HOT, C["white"], 0.6) if chosen else C["white"]
    line = HOT if (hot or chosen) else C["gray"]
    cv.box(cx - w / 2, cy - h / 2, w, h, fill=fill, line=line, width=3 if (hot or chosen) else 2, r=6)
    cv.text(cx, cy, t, size, C["ink"], bold=chosen, anchor="mm")


def block(cv, x, y, w, h, color, letter, layers, lit, text_color, top_note=None):
    fill = color if lit else mix(color, C["white"], 0.45)
    cv.box(x, y, w, h, fill=fill, line=HOT if lit else None, width=4)
    cy = y + h / 2 + (8 if top_note else 0)
    if top_note:
        note(cv, x + w / 2, y + 18, top_note, 16, text_color)
    cv.text(x + w / 2, cy - 12, letter, 34, text_color, bold=True, italic=True, anchor="mm")
    note(cv, x + w / 2, cy + 22, f"{layers} layers", 17, text_color)


def dot(cv, x0, y0, x1, y1, u, color=HOT, r=6):
    x, y = x0 + (x1 - x0) * u, y0 + (y1 - y0) * u
    cv.d.ellipse([(x - r) * S, (y - r) * S, (x + r) * S, (y + r) * S], fill=color)


def header(cv, ox, chip, types, name):
    cv.box(ox + 14, 9, 16, 16, fill=chip, r=3)
    cv.text(ox + 38, 17, types, 20, C["ink"], bold=True, anchor="lm")
    cv.text(ox + PW - 12, 17, name, 16, C["gray"], anchor="rm")


def ramp(t, a, b):
    return min(1.0, max(0.0, (t - a) / (b - a)))


def settle(i):
    """How far s_i has moved from noise toward the settled pattern (illustrative)."""
    return 1 - math.exp(-i / 5) if i else 0.0


def s_vals(i):
    a = settle(i)
    return [n * (1 - a) + g * a for n, g in zip(NOISE, TARGET)]


# ---------------------------------------------------------------- the shared timeline
def r_schedule():
    """List of R states, one per 100 ms tick: (phase, i, u)."""
    ticks = [("init", 1, 0.0)] * 8
    for i in [1, 2, 3]:
        ticks += [("in", i, u) for u in (0.17, 0.5, 0.83)] + [("out", i, 0)] * 2 + [("back", i, 0)] * 2
    for i in [4, 6, 8, 12, 16, 24, 32]:
        ticks += [("in", i, 0.5), ("out", i, 0), ("back", i, 0)]
    ticks[-1] = ("out", R_MAX, 0)  # no feedback after the last pass
    ticks += [("done", R_MAX, 0)] * 12
    return ticks


SCHED = r_schedule()
T = len(SCHED)


# ---------------------------------------------------------------- panel 1: prelude (token -> latent)
def prelude(cv, ox, k, cap=True):
    t = k / T
    header(cv, ox, C["prelude"], "token → latent", "prelude P")
    cx = ox + PW / 2
    flow_in, fill = ramp(t, 0.08, 0.24), ramp(t, 0.34, 0.52)
    lit = 0.20 <= t < 0.40
    note(cv, cx, 42, "input token  x")
    word(cv, cx, 70, "Hello", hot=0.08 <= t < 0.26)
    cv.arrow(cx, 89, cx, 116, C["ink"] if lit or flow_in > 0 else C["gray"])
    block(cv, cx - 100, 120, 200, 84, C["prelude"], "P", 2, lit, C["ink"])
    cv.arrow(cx, 206, cx, 232, C["ink"] if fill > 0 else C["gray"])
    if 0 < flow_in < 1:
        dot(cv, cx, 89, cx, 118, flow_in)
    if 0.32 <= t < 0.48:
        dot(cv, cx, 206, cx, 232, ramp(t, 0.32, 0.42))
    gx = cx - GW / 2
    grid(cv, gx, 240, E_VALS, E_LO, E_HI, filled=round(16 * fill), outline=HOT if 0.40 <= t < 0.56 else None)
    sym(cv, gx - 16, 258, "e", size=26, anchor="r")
    note(cv, gx + GW + 14, 258, "latent", 16, anchor="lm")
    if t >= 0.55:
        note(cv, cx, 300, "computed once, re-injected into every R pass", 16, HOT, italic=True)
    if cap:
        note(cv, cx, 348, "illustrative token & values · 16 of h = 5280 dims", 16, italic=True)


# ---------------------------------------------------------------- panel 2: recurrent (latent -> latent)
def recurrent(cv, ox, k, cap=True):
    phase, i, u = SCHED[k]
    header(cv, ox, C["core"], "latent → latent", "recurrent R, × r")
    lx, rx = ox + 30, ox + 240          # input grids: s_{i-1} (left), e (right)
    gy = 64
    hot_in = phase == "in"
    # input state
    if i == 1 and phase in ("init", "in"):
        note(cv, lx + GW / 2, 44, "s₀ ~ N(0, σ²I)", 18, C["ink"])
    else:
        sym(cv, lx + GW / 2, 44, "s", "i−1", 22)
    prev = i - 1 if phase in ("init", "in", "out") else i
    if phase == "done":
        prev = R_MAX - 1
    grid(cv, lx, gy, s_vals(prev), S_LO, S_HI, outline=HOT if phase == "back" else None)
    # injected input e (the same every pass)
    sym(cv, rx + 50, 44, "e", size=22)
    note(cv, rx + 64, 44, "(every pass)", 16, anchor="lm")
    grid(cv, rx, gy, E_VALS, E_LO, E_HI)
    # into R: s solid, e dashed
    cv.arrow(lx + GW / 2, gy + GH + 6, ox + 165, 128, HOT if hot_in else C["gray"], 3 if hot_in else 2, 10)
    cv.arrow(rx + GW / 2, gy + GH + 6, ox + 255, 128, HOT if hot_in else C["gray"], 3 if hot_in else 2, 10, dash=True)
    if hot_in:
        dot(cv, lx + GW / 2, gy + GH + 6, ox + 165, 128, u)
        dot(cv, rx + GW / 2, gy + GH + 6, ox + 255, 128, u)
    block(cv, ox + 90, 132, 240, 92, C["core"], "R", 4, hot_in, C["white"], top_note="concat [s, e] → adapter A")
    # output state s_i
    ox2 = ox + PW / 2 - GW / 2
    show_out = phase in ("out", "back", "done")
    cv.arrow(ox + PW / 2, 226, ox + PW / 2, 248, C["ink"] if show_out else C["gray"])
    if show_out:
        grid(cv, ox2, 254, s_vals(i), S_LO, S_HI, outline=HOT if phase in ("out", "done") else None)
    else:
        grid(cv, ox2, 254, s_vals(i), S_LO, S_HI, filled=0)
    if phase == "done":
        sym(cv, ox2 - 12, 272, "s", "r", 22, anchor="r")
    else:
        sym(cv, ox2 - 12, 272, "s", "i", 22, anchor="r")
    # feedback: s_i becomes the next s_{i-1}
    fb = HOT if phase == "back" else C["faint"]
    w = 3 if phase == "back" else 2
    yb = 254 + GH + 14
    cv.line(ox + PW / 2, 254 + GH + 4, ox + PW / 2, yb, fb, w)
    cv.line(ox + PW / 2, yb, ox + 14, yb, fb, w)
    cv.line(ox + 14, yb, ox + 14, gy + GH / 2, fb, w)
    cv.arrow(ox + 14, gy + GH / 2, lx - 5, gy + GH / 2, fb, w, 9)
    # pass counter
    cv.text(ox + 352, 256, f"pass {i}", 22, HOT if phase != "init" else C["gray"], bold=True, anchor="mm")
    note(cv, ox + 352, 284, f"of r = {R_MAX}", 18, C["ink"])
    if phase == "done":
        sym(cv, ox + PW / 2 - 68, 320, "s", "r", 22, HOT)
        note(cv, ox + PW / 2 - 52, 320, "is passed to the coda C", 16, HOT, anchor="lm", italic=True)
    if cap:
        note(cv, ox + PW / 2, 348, "illustrative values · 16 of h = 5280 dims", 16, italic=True)


# ---------------------------------------------------------------- panel 3: coda (latent -> token)
PROBS = [("World", 0.62), ("there", 0.21), ("!", 0.09)]


def coda(cv, ox, k, cap=True):
    t = k / T
    header(cv, ox, C["coda"], "latent → token", "coda C")
    cx = ox + PW / 2
    flow, bars = ramp(t, 0.30, 0.46), ramp(t, 0.60, 0.78)
    lit = 0.42 <= t < 0.62
    gx = cx - GW / 2
    sym(cv, cx - 30, 42, "s", "r", 22)
    note(cv, cx - 14, 42, f"(after r = {R_MAX} passes)", 16, anchor="lm")
    grid(cv, gx, 60, s_vals(R_MAX), S_LO, S_HI, outline=HOT if 0.26 <= t < 0.46 else None)
    note(cv, gx + GW + 14, 78, "latent", 16, anchor="lm")
    cv.arrow(cx, 100, cx, 124, C["ink"] if flow > 0 else C["gray"])
    if 0 < flow < 1:
        dot(cv, cx, 100, cx, 124, flow)
    block(cv, cx - 100, 128, 200, 78, C["coda"], "C", 2, lit, C["white"])
    cv.arrow(cx, 208, cx, 226, C["ink"] if bars > 0 else C["gray"])
    sym(cv, ox + 24, 240, "p", size=20, anchor="l")
    note(cv, ox + 38, 240, "= next-token probabilities", 16, anchor="lm")
    chosen = t >= 0.80
    for j, (wd, p) in enumerate(PROBS):
        y = 266 + j * 27
        word(cv, ox + 68, y, wd, w=86, h=24, chosen=chosen and j == 0, size=17)
        L = 190 * p * bars
        if L > 0:
            cv.box(ox + 120, y - 8, L, 16, fill=C["coda"] if j == 0 else mix(C["coda"], C["white"], 0.5), r=3)
        if bars == 1:
            note(cv, ox + 126 + L, y, f"{p:.2f}", 16, C["ink"], anchor="lm")
    if chosen:
        note(cv, ox + 292, 266, "← output", 16, HOT, bold=True, anchor="lm")
    if cap:
        note(cv, cx, 348, "illustrative words, probabilities & values", 16, italic=True)


# ---------------------------------------------------------------- render
def single(name, fn):
    frames = []
    for k in range(T):
        cv = Canvas(PW, PH)
        fn(cv, 0, k)
        frames.append(cv.frame())
    save_gif(name, frames, [TICK] * T)


def combined():
    W, H = 3 * PW, PH + 40
    frames = []
    for k in range(T):
        cv = Canvas(W, H)
        for j, fn in enumerate([prelude, recurrent, coda]):
            fn(cv, j * PW, k, cap=False)
        for j in (1, 2):
            cv.line(j * PW, 12, j * PW, PH - 10, C["faint"], 1)
        note(cv, W / 2, PH + 18, "Redrawn from Geiping et al. 2025 (Sec 3.1–3.2, 4.1). Words, probabilities and cell values are "
             "illustrative; 16 of h = 5280 latent dims shown.", 16, italic=True)
        frames.append(cv.frame())
    save_gif("huginn_three_blocks", frames, [TICK] * T)


if __name__ == "__main__":
    single("huginn_prelude", prelude)
    single("huginn_recurrent", recurrent)
    single("huginn_coda", coda)
    combined()
