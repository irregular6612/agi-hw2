"""Concept animations (GIF) for the looped-transformer talk.

python3 build/gif/make_gifs.py   -> figures/gif/{cot_vs_loop,huginn_loop,mor_routing,ouro_exit}.gif

Each GIF redraws a paper figure as motion. No new measurements: structural facts come from
sources/*.md, and example values (routing choices, exit probabilities) are labelled as illustration.
"""
import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "figures" / "gif"
OUT.mkdir(parents=True, exist_ok=True)

S = 2  # supersampling factor; frames are drawn at S× and downsampled
FONT_DIR = Path.home() / "Library" / "Fonts"
C = dict(ink="#000000", gray="#595959", faint="#BFBFBF", light="#F2F2F2", navy="#2F4A6D", blue="#DCE3EC",
         gold="#A87712", pale="#F6EBD3", white="#FFFFFF", prelude="#8ECAE6", core="#2E9E4F", coda="#CC6677")


def font(size, bold=False, italic=False):
    name = "Lato-" + ("Bold" if bold else "Regular") + ("Italic" if italic else "")
    name = name.replace("RegularItalic", "Italic")
    return ImageFont.truetype(str(FONT_DIR / f"{name}.ttf"), size * S)


def mix(a, b, t):
    a, b = [int(a[i:i + 2], 16) for i in (1, 3, 5)], [int(b[i:i + 2], 16) for i in (1, 3, 5)]
    return "#" + "".join(f"{round(x + (y - x) * t):02X}" for x, y in zip(a, b))


class Canvas:
    """Draw in 1× coordinates; everything is scaled by S internally."""

    def __init__(self, w, h):
        self.w, self.h = w, h
        self.im = Image.new("RGB", (w * S, h * S), C["white"])
        self.d = ImageDraw.Draw(self.im)

    def box(self, x, y, w, h, fill=None, line=None, width=2, r=8, dash=False):
        xy = [x * S, y * S, (x + w) * S, (y + h) * S]
        if dash:
            self.d.rounded_rectangle(xy, r * S, fill=fill)
            self.dashed_rect(x, y, w, h, line or C["gray"], width)
        else:
            self.d.rounded_rectangle(xy, r * S, fill=fill, outline=line, width=width * S if line else 0)

    def dashed_rect(self, x, y, w, h, color, width=2, dash=6):
        for (x0, y0, x1, y1) in [(x, y, x + w, y), (x + w, y, x + w, y + h), (x + w, y + h, x, y + h), (x, y + h, x, y)]:
            self.dashed_line(x0, y0, x1, y1, color, width, dash)

    def dashed_line(self, x0, y0, x1, y1, color, width=2, dash=6):
        n = max(1, int(math.hypot(x1 - x0, y1 - y0) / dash))
        for i in range(0, n, 2):
            a, b = i / n, min(1, (i + 1) / n)
            self.line(x0 + (x1 - x0) * a, y0 + (y1 - y0) * a, x0 + (x1 - x0) * b, y0 + (y1 - y0) * b, color, width)

    def line(self, x0, y0, x1, y1, color, width=2):
        self.d.line([x0 * S, y0 * S, x1 * S, y1 * S], fill=color, width=width * S)

    def arrow(self, x0, y0, x1, y1, color=C["gray"], width=2, head=9, dash=False):
        (self.dashed_line if dash else self.line)(x0, y0, x1, y1, color, width)
        a = math.atan2(y1 - y0, x1 - x0)
        pts = [(x1, y1), (x1 - head * math.cos(a - 0.4), y1 - head * math.sin(a - 0.4)),
               (x1 - head * math.cos(a + 0.4), y1 - head * math.sin(a + 0.4))]
        self.d.polygon([(px * S, py * S) for px, py in pts], fill=color)

    def arc_arrow(self, cx, cy, rx, ry, a0, a1, color, width=2, head=9):
        """Elliptic arc from angle a0 to a1 (degrees, PIL convention), arrowhead at a1."""
        steps = 40
        pts = [(cx + rx * math.cos(math.radians(a0 + (a1 - a0) * i / steps)),
                cy + ry * math.sin(math.radians(a0 + (a1 - a0) * i / steps))) for i in range(steps + 1)]
        for p, q in zip(pts, pts[1:]):
            self.line(*p, *q, color, width)
        self.arrow(*pts[-3], *pts[-1], color, width, head)

    def text(self, x, y, t, size=18, color=C["ink"], bold=False, italic=False, anchor="la"):
        align = {"m": "center", "r": "right"}.get(anchor[0], "left")
        self.d.text((x * S, y * S), t, font=font(size, bold, italic), fill=color, anchor=anchor, align=align)

    def frame(self):
        return self.im.resize((self.w, self.h), Image.LANCZOS)


def save_gif(name, frames, durations):
    """One shared palette for every frame, so colors do not flicker between frames."""
    w, h = frames[0].size
    sheet = Image.new("RGB", (w, h * min(len(frames), 8)))
    picks = [frames[round(i * (len(frames) - 1) / 7)] for i in range(min(len(frames), 8))]
    for i, f in enumerate(picks):
        sheet.paste(f, (0, i * h))
    pal = sheet.quantize(colors=128, method=Image.Quantize.MEDIANCUT)
    lut = pal.getpalette()[:128 * 3]
    near = min(range(128), key=lambda i: sum(255 - v for v in lut[3 * i:3 * i + 3]))
    lut[3 * near:3 * near + 3] = [255, 255, 255]  # slide background is pure white
    pal = Image.new("P", (1, 1))  # a fresh image: quantize() ignores putpalette() on a quantized one
    pal.putpalette(lut)
    q = [f.quantize(palette=pal, dither=Image.Dither.NONE) for f in frames]
    # Pillow's palette lookup is approximate and sends pure white to a near-white entry; force it back.
    for f, p in zip(frames, q):
        mask = Image.eval(f.convert("L"), lambda v: 255 if v == 255 else 0)
        p.paste(near, mask=mask)
    path = OUT / f"{name}.gif"
    q[0].save(path, save_all=True, append_images=q[1:], duration=durations, loop=0, optimize=True, disposal=1)
    print(f"{path.relative_to(ROOT)}: {len(frames)} frames, {sum(durations) / 1000:.1f}s, {path.stat().st_size / 1024:.0f} KB")


def caption(cv, t):
    cv.text(cv.w - 10, cv.h - 8, t, 13, C["gray"], italic=True, anchor="rd")


# Canvases are ~1250 px wide so that, placed 11–12.5 in wide on a slide, 1 px ≈ 0.65–0.72 pt
# and body text (20–24 px) lands at about 13–17 pt. The slide title already names each figure,
# so the remark GIFs carry no headline of their own.

# ---------------------------------------------------------------- 1. CoT vs loop (guiding question)
def cot_vs_loop():
    W, H = 1250, 390
    STEPS = 4
    TOK, GAP = 54, 10
    frames, dur = [], []

    def panel(cv, x0, mode, k, phase, pulse):
        """mode 'cot' | 'loop'; k = completed steps; phase: 'idle'|'pass'|'out'; pulse in [0,1]."""
        head = "Chain of thought: writes a token per step" if mode == "cot" else "Looped model: re-runs the same layers"
        cv.text(x0, 8, head, 26, bold=True)
        n_in = 3
        xs = lambda i: x0 + 16 + i * (TOK + GAP)
        bar = (x0 + 6, 150, (7 if mode == "cot" else n_in) * (TOK + GAP) + 10, 60)
        row = n_in + (k if mode == "cot" else 0)
        for i in range(row):  # input row (bottom)
            new = mode == "cot" and i >= n_in
            cv.box(xs(i), 250, TOK, 46, fill=C["pale"] if new else C["light"], line=C["gold"] if new else C["faint"])
            cv.text(xs(i) + TOK / 2, 273, f"t{i - n_in + 1}" if new else f"x{i + 1}", 22, anchor="mm")
            cv.arrow(xs(i) + TOK / 2, 248, xs(i) + TOK / 2, bar[1] + bar[3] + 3, C["faint"], 2, 7)
        cv.box(*bar, fill=C["blue"], line=C["navy"])
        if phase == "pass":  # a gold band sweeps up through the layers
            by = bar[1] + bar[3] - 14 - pulse * (bar[3] - 14)
            cv.box(bar[0] + 4, by, bar[2] - 8, 14, fill=C["gold"], r=4)
        cv.text(bar[0] + bar[2] / 2, bar[1] + bar[3] / 2, "Transformer" if mode == "loop" else "Transformer (L layers)", 22, C["navy"], bold=True, anchor="mm")
        if mode == "cot":
            if phase == "out":  # new token above the bar, fed back to the end of the row
                i = row
                cv.box(xs(i), 70, TOK, 46, fill=C["pale"], line=C["gold"], width=3)
                cv.text(xs(i) + TOK / 2, 93, f"t{k + 1}", 22, bold=True, anchor="mm")
                cv.arrow(xs(i) + TOK / 2, bar[1] - 2, xs(i) + TOK / 2, 118, C["gold"], 2, 8)
                cv.arc_arrow(xs(i) + TOK + 26, 183, 22, 85, -90, 70, C["gold"], 3)
            cv.text(x0 + 6, 325, f"step {k}", 24, bold=True)
            cv.text(x0 + 116, 325, f"tokens written: {k}", 24, C["gold"] if k else C["gray"], bold=bool(k))
        else:
            shade = k / STEPS
            for i in range(n_in):  # hidden states above the bar, refined in place
                cv.box(xs(i), 70, TOK, 46, fill=mix(C["white"], C["coda"], 0.15 + 0.75 * shade), line=C["coda"], width=3 if phase == "out" else 2)
                cv.text(xs(i) + TOK / 2, 93, f"h{i + 1}", 22, C["white"] if shade > 0.5 else C["ink"], bold=True, anchor="mm")
                cv.arrow(xs(i) + TOK / 2, bar[1] - 2, xs(i) + TOK / 2, 118, C["faint"], 2, 7)
            ax = bar[0] + bar[2] + 24
            cv.arc_arrow(ax, 183, 24, 85, -90, 90, C["gold"] if phase == "out" else C["faint"], 3)
            cv.text(ax + 40, 183, "states go back in;\nsame layers, again", 21, C["gray"], anchor="lm")
            cv.text(x0 + 6, 325, f"loop {k}", 24, bold=True)
            cv.text(x0 + 116, 325, "tokens written: 0", 24, C["gray"])

    def draw(k, phase, pulse=0.0):
        cv = Canvas(W, H)
        panel(cv, 8, "cot", k, phase, pulse)
        cv.line(W / 2 + 2, 10, W / 2 + 2, H - 40, C["faint"], 1)
        panel(cv, W / 2 + 22, "loop", k, phase, pulse)
        caption(cv, "Illustration redrawn from Saunshi et al. 2025, Fig. 4")
        return cv.frame()

    frames.append(draw(0, "idle")); dur.append(900)
    for k in range(STEPS):
        for p in (0.0, 0.33, 0.66, 1.0):
            frames.append(draw(k, "pass", p)); dur.append(110)
        frames.append(draw(k, "out")); dur.append(700)
        frames.append(draw(k + 1, "idle")); dur.append(500)
    frames.append(draw(STEPS, "idle")); dur.append(2200)
    save_gif("cot_vs_loop", frames, dur)


# ---------------------------------------------------------------- 2. Huginn recurrence (Fig. 2)
def huginn_loop():
    W, H = 1250, 380
    rng = random.Random(7)
    N = 8  # state drawn as an 8×2 grid of cells
    noise = [rng.random() for _ in range(2 * N)]
    target = [0.5 + 0.45 * math.sin(i * 0.9) for i in range(2 * N)]
    seq = list(range(1, 9)) + [12, 16, 20, 24, 28, 32]
    frames, dur = [], []

    def state(cv, x, y, r):
        a = 1 - math.exp(-r / 5) if r else 0
        for i in range(2 * N):
            v = noise[i] * (1 - a) + target[i] * a
            cv.box(x + (i % N) * 21, y + (i // N) * 21, 19, 19, fill=mix("#E8F5EC", C["core"], v), r=3)

    def draw(r, phase):
        """phase: 'start' | 'pass' (e enters R) | 'done' (coda decodes)."""
        cv = Canvas(W, H)
        hot = phase == "pass"
        done = phase == "done"
        # prelude
        cv.text(48, 75, "“Hello”", 24, anchor="mm")
        cv.arrow(92, 75, 132, 75)
        cv.box(135, 35, 100, 80, fill=C["prelude"])
        cv.text(185, 66, "P", 34, bold=True, italic=True, anchor="mm")
        cv.text(185, 100, "prelude", 17, C["gray"], anchor="mm")
        # input injection e
        g = C["gold"] if hot else C["gray"]
        cv.text(268, 60, "e", 28, g, italic=True, anchor="mm")
        cv.arrow(237, 80, 556, 186, g, 3 if hot else 2, 11, dash=True)
        cv.text(375, 198, "input re-injected every pass", 19, g, italic=True, anchor="mm")
        # initial state from noise
        cv.text(130, 240, "s₀ ~ N(0, σ²I)", 22, anchor="mm")
        cv.arrow(215, 240, 556, 240)
        # shared core with its loop arrow
        cv.box(560, 172, 200, 110, fill=C["core"] if hot else mix(C["core"], C["white"], 0.25), line=C["gold"] if hot else None, width=4)
        cv.text(660, 212, "R", 40, C["white"], bold=True, italic=True, anchor="mm")
        cv.text(660, 256, "4 shared layers", 19, C["white"], anchor="mm")
        cv.arc_arrow(660, 282, 125, 50, 20, 160, g, 3, 12)
        cv.text(660, 352, f"r = {r}", 30, C["gold"] if hot else C["ink"], bold=True, anchor="mm")
        # state after r passes
        cv.text(800, 168, "state after r passes", 18, C["gray"])
        state(cv, 800, 195, r)
        # coda
        cv.arrow(975, 205, 1005, 120, C["ink"] if done else C["faint"])
        cv.box(1008, 35, 100, 80, fill=C["coda"] if done else mix(C["coda"], C["white"], 0.6))
        cv.text(1058, 66, "C", 34, C["white"], bold=True, italic=True, anchor="mm")
        cv.text(1058, 100, "coda", 17, C["white"], anchor="mm")
        cv.arrow(1108, 75, 1140, 75, C["ink"] if done else C["faint"])
        if done:
            cv.text(1192, 75, "“World”", 24, bold=True, anchor="mm")
        if r:
            cv.text(860, 262, "effective depth", 20, C["gray"])
            cv.text(860, 290, f"2 + 4·{r} + 2 = {2 + 4 * r + 2} layers", 26, bold=True)
            cv.text(860, 326, "parameters: unchanged", 20, C["gray"])
        caption(cv, "Animated redraw of Geiping et al. 2025, Fig. 2; state cells are illustrative")
        return cv.frame()

    frames.append(draw(0, "start")); dur.append(1000)
    for r in seq:
        t = 330 if r <= 3 else 170
        frames.append(draw(r, "pass")); dur.append(t)
        frames.append(draw(r, "start")); dur.append(t if r <= 3 else 90)
    frames.append(draw(32, "done")); dur.append(2600)
    save_gif("huginn_loop", frames, dur)


# ---------------------------------------------------------------- 3. MoR expert-choice routing (Fig. 2a)
def mor_routing():
    W, H = 1250, 396
    words = ["The", "proof", "of", "this", "lemma", "needs", "one", "more", "step"]
    # illustrative router choices; capacities follow the paper for N_r = 3: 9 -> 6 -> 3 tokens
    keep2 = {1, 3, 4, 5, 7, 8}
    keep3 = {1, 4, 8}
    depth = [1 + (i in keep2) + (i in keep3) for i in range(9)]
    TW, G, X0 = 105, 10, 205
    xs = lambda i: X0 + i * (TW + G)
    ROWS = [248, 172, 96]  # y of loop 1, 2, 3
    frames, dur = [], []

    def draw(stage):
        """stage 0: tokens; 1–3: loop n running; 4: depth per token."""
        cv = Canvas(W, H)
        cv.text(10, 8, "Loops 1–3 reuse one shared block (same weights)", 21, C["gray"])
        for i, w in enumerate(words):
            cv.box(xs(i), 318, TW, 42, fill=C["light"], line=C["faint"])
            cv.text(xs(i) + TW / 2, 339, w, 21, anchor="mm")
        active = [set(range(9)), keep2, keep3]
        subs = ["all 9 tokens", "router: top 6 of 9", "router: top 3 of 9"]
        for n in range(3):
            y = ROWS[n]
            shown, cur = stage >= n + 1, stage == n + 1
            cv.text(10, y + 12, f"Loop {n + 1}", 24, C["navy"] if shown else C["faint"], bold=True, anchor="lm")
            cv.text(10, y + 38, subs[n], 17, (C["gold"] if cur and n else C["gray"]) if shown else C["faint"], anchor="lm")
            for i in range(9):
                if shown and i in active[n]:
                    cv.box(xs(i) + 20, y, TW - 40, 42, fill=C["navy"], line=C["gold"] if cur else None, width=3)
                else:
                    cv.box(xs(i) + 20, y, TW - 40, 42, line=C["faint"], width=1, dash=True)
            if shown:
                below = 318 if n == 0 else ROWS[n - 1]
                for i in active[n]:
                    cv.arrow(xs(i) + TW / 2, below - 2, xs(i) + TW / 2, y + 44, C["gold"] if cur else C["faint"], 2, 8)
        if 1 <= stage <= 3:
            cv.text(W - 10, 6, f"tokens in this loop: {[9, 6, 3][stage - 1]} of 9", 22, bold=True, anchor="ra")
            cv.text(W - 10, 38, "keys/values stored only for these tokens", 17, C["gray"], anchor="ra")
        if stage == 4:
            cv.text(W - 10, 6, "Depth per token", 22, C["gold"], bold=True, anchor="ra")
            for i in range(9):
                cv.text(xs(i) + TW / 2, 66, f"{depth[i]} loop" + ("s" if depth[i] > 1 else ""), 20, C["gold"], bold=True, anchor="mm")
        caption(cv, "Animated redraw of Bae et al. 2025, Fig. 2a (expert choice, N_r = 3); which tokens are kept is illustrative")
        return cv.frame()

    for st, t in [(0, 900), (1, 1100), (2, 1300), (3, 1300), (4, 2800)]:
        frames.append(draw(st)); dur.append(t)
    save_gif("mor_routing", frames, dur)


# ---------------------------------------------------------------- 4. Ouro early exit (Fig. 3, inference)
def ouro_exit():
    W, H = 1250, 380
    Q = 0.5
    cases = [("Easier input", [0.15, 0.55, 0.20, 0.10]), ("Harder input", [0.05, 0.10, 0.15, 0.70])]
    CW, CG, X0 = 235, 10, 245
    xs = lambda t: X0 + t * (CW + CG)
    frames, dur = [], []

    def stop_at(p):
        cdf = [sum(p[:i + 1]) for i in range(4)]
        return cdf, next(i for i, c in enumerate(cdf) if c >= Q or i == 3)

    def draw(case, upto, exited):
        name, p = cases[case]
        cdf, stop = stop_at(p)
        cv = Canvas(W, H)
        cv.text(10, 40, name, 26, C["gold"], bold=True)
        cv.text(10, 80, f"threshold q = {Q}", 21)
        cv.text(10, 118, "Loop while the summed\nexit probability < q.\nq is one knob: compute\nvs accuracy.", 17, C["gray"])
        for t in range(4):
            x = xs(t)
            ran = t <= upto
            skipped = exited and t > stop
            live = ran and not skipped
            cv.text(x + CW / 2, 20, f"loop t = {t + 1}", 22, C["ink"] if live else C["faint"], bold=live, anchor="mm")
            cv.box(x + 20, 40, CW - 40, 95, fill=C["navy"] if live else mix(C["navy"], C["white"], 0.85),
                   line=C["gold"] if ran and t == upto and not exited else None, width=4)
            cv.text(x + CW / 2, 87, "24 layers\n(same weights)", 19, C["white"] if live else C["faint"], bold=True, anchor="mm")
            if t > 0 and ran and not skipped:
                cv.arrow(xs(t - 1) + CW - 20, 87, x + 20, 87, C["gray"], 2, 9)
            if skipped:
                cv.text(x + CW / 2, 165, "never run", 22, C["gray"], italic=True, anchor="mm")
            if not live:
                continue
            cv.text(x + CW / 2, 165, f"exit gate p{t + 1} = {p[t]:.2f}", 20, anchor="mm")
            bx, by, bw, bh = x + 20, 188, CW - 40, 30
            hit = cdf[t] >= Q or t == 3
            cv.box(bx, by, bw, bh, fill=C["light"], line=C["faint"], r=4)
            cv.box(bx, by, bw * min(cdf[t], 1), bh, fill=C["gold"] if hit else C["prelude"], r=4)
            cv.line(bx + bw * Q, by - 7, bx + bw * Q, by + bh + 7, C["ink"], 2)
            cv.text(x + CW / 2, 240, f"sum = {cdf[t]:.2f}", 20, C["gold"] if hit else C["ink"], bold=hit, anchor="mm")
        if exited:
            msg = f"sum ≥ q at t = {stop + 1}: exit and decode" if stop < 3 else "t = 4 is the trained maximum: decode here"
            cv.text(X0 + 20, 290, msg, 24, C["gold"], bold=True)
            cv.text(X0 + 20, 324, f"{stop + 1} of 4 loops run" + (f"; {3 - stop} skipped" if stop < 3 else ""), 21)
        caption(cv, "Animated redraw of Zhu et al. 2025, Fig. 3 (inference, T_max = 4); exit probabilities are illustrative")
        return cv.frame()

    for case in range(2):
        _, stop = stop_at(cases[case][1])
        for t in range(stop + 1):
            frames.append(draw(case, t, False)); dur.append(1000)
        frames.append(draw(case, stop, True)); dur.append(2600)
    save_gif("ouro_exit", frames, dur)


# ---------------------------------------------------------------- 5. RNN vs Transformer (sequential vs parallel)
def rnn_vs_transformer():
    """Same 6-token input, same clock. Structure from sources/vaswani.md (Sec. 1, Table 1)."""
    W, H = 1250, 470
    WORDS = ["the", "cat", "sat", "on", "the", "mat"]
    N, TOK, GAP = len(WORDS), 74, 24
    CY, CH, TY, TH = 125, 50, 265, 46  # state cells, input tokens (y, height)
    frames, dur = [], []

    def cells(cv, x0, state):
        """state[i]: 'wait' | 'active' | 'done'."""
        xs = lambda i: x0 + 14 + i * (TOK + GAP)
        for i, w in enumerate(WORDS):
            on = state[i] == "active"
            cv.box(xs(i), TY, TOK, TH, fill=C["pale"] if on else C["light"], line=C["gold"] if on else C["faint"], width=3 if on else 2)
            cv.text(xs(i) + TOK / 2, TY + TH / 2, w, 22, C["ink"], bold=on, anchor="mm")
            st = state[i]
            fill = {"wait": C["white"], "active": C["gold"], "done": C["blue"]}[st]
            cv.box(xs(i), CY, TOK, CH, fill=fill, line=C["navy"] if st != "wait" else C["faint"], width=2, dash=st == "wait")
            cv.text(xs(i) + TOK / 2, CY + CH / 2, f"h{i + 1}", 22, C["white"] if st == "active" else (C["navy"] if st == "done" else C["faint"]), bold=st != "wait", anchor="mm")
        return xs

    def rnn(cv, x0, t, pulse):
        """t = current step (1..N), or N + 1 when finished."""
        cv.text(x0 + 6, 8, "RNN: one position per step", 26, bold=True)
        cv.text(x0 + 6, 46, "h(t) needs h(t−1), so step t waits for step t−1", 20, C["gray"])
        state = ["done" if i + 1 < t else "active" if i + 1 == t else "wait" for i in range(N)]
        xs = cells(cv, x0, state)
        for i in range(N):
            act = i + 1 == t
            cv.arrow(xs(i) + TOK / 2, TY - 3, xs(i) + TOK / 2, CY + CH + 4, C["gold"] if act else C["faint"], 3 if act else 2, 8)
            if i:
                cv.arrow(xs(i - 1) + TOK + 2, CY + CH / 2, xs(i) - 3, CY + CH / 2, C["gold"] if act else (C["navy"] if i + 1 < t else C["faint"]), 3 if act else 2, 8)
        if 1 <= t <= N and pulse:  # the cell being computed blinks
            cv.box(xs(t - 1) - 5, CY - 5, TOK + 10, CH + 10, line=C["gold"], width=2, r=10)
        k = min(t, N)
        cv.text(x0 + 6, 340, f"step {k} of {N}", 26, C["gold"] if t <= N else C["navy"], bold=True)
        cv.text(x0 + 180, 342, "done" if t > N else f"{N - k} positions still waiting", 22, C["navy"] if t > N else C["gray"], bold=t > N)

    def transformer(cv, x0, t, pulse):
        cv.text(x0 + 6, 8, "Transformer: every position in one step", 26, bold=True)
        cv.text(x0 + 6, 46, "each h(i) attends to all tokens up to i, all at once", 20, C["gray"])
        state = ["wait" if t == 0 else "active" if t == 1 else "done"] * N
        xs = cells(cv, x0, state)
        for i in range(N):  # causal attention: token i feeds cells i..N, all in the same step
            for j in range(i, N):
                if t == 0:
                    continue
                col = C["gold"] if t == 1 else C["faint"]
                cv.line(xs(i) + TOK / 2, TY - 3, xs(j) + TOK / 2, CY + CH + 3, mix(C["white"], col, 0.85 if t == 1 else 0.6), 2 if t == 1 else 1)
        if t == 1 and pulse:
            cv.box(xs(0) - 5, CY - 5, xs(N - 1) + TOK + 5 - (xs(0) - 5), CH + 10, line=C["gold"], width=2, r=10)
        cv.text(x0 + 6, 340, f"step {min(t, 1)} of 1", 26, C["navy"] if t > 1 else C["gold"], bold=True)
        cv.text(x0 + 180, 342, "all 6 positions at once" if t <= 1 else "done", 22, C["gray"] if t <= 1 else C["navy"], bold=t > 1)

    def draw(t, pulse=False, end=False):
        cv = Canvas(W, H)
        rnn(cv, 8, t, pulse)
        cv.line(W / 2 + 2, 10, W / 2 + 2, 380, C["faint"], 1)
        transformer(cv, W / 2 + 22, t, pulse)
        if end:
            cv.text(W / 2, 412, "Sequential steps per layer:  RNN O(n),  Transformer O(1)", 22, C["navy"], bold=True, anchor="mm")
        caption(cv, "Reading a 6-token input (training, or the prompt). Structure per Vaswani et al. 2017, Sec. 1, Table 1")
        return cv.frame()

    frames.append(draw(0)); dur.append(1000)
    for t in range(1, N + 1):
        for p in (True, False, True):
            frames.append(draw(t, p)); dur.append(160)
        frames.append(draw(t)); dur.append(450)
    frames.append(draw(N + 1, end=True)); dur.append(3200)
    save_gif("rnn_vs_transformer", frames, dur)


# ---------------------------------------------------------------- 6. Thm 5.4: m CoT steps ⇔ m loops on m blank slots
def cot_vs_loop_slots():
    """Saunshi Thm 5.4 proof idea (sources/saunshi.md): in loop t only position n+t is updated."""
    W, H = 1250, 435
    M, NIN, TOK, GAP = 4, 3, 54, 10
    frames, dur = [], []

    def panel(cv, x0, mode, k, phase, pulse):
        loop = mode == "loop"
        cv.text(x0, 8, "Looped model: m loops on m blank slots" if loop else "Chain of thought: writes a token per step", 26, bold=True)
        cv.text(x0, 44, "loop t updates only slot t; no token is written" if loop else "each step runs all L layers, then writes one token", 20, C["gray"])
        xs = lambda i: x0 + 16 + i * (TOK + GAP)
        bar = (x0 + 6, 165, (NIN + M) * (TOK + GAP) + 10, 60)
        row = NIN + (M if loop else k)
        for i in range(row):  # input row (bottom)
            extra = i >= NIN
            cv.box(xs(i), 265, TOK, 46, fill=C["pale"] if extra else C["light"], line=C["gold"] if extra else C["faint"])
            lab = (f"s{i - NIN + 1}" if loop else f"t{i - NIN + 1}") if extra else f"x{i + 1}"
            cv.text(xs(i) + TOK / 2, 288, lab, 22, C["gray"] if loop and extra else C["ink"], anchor="mm")
            cv.arrow(xs(i) + TOK / 2, 263, xs(i) + TOK / 2, bar[1] + bar[3] + 3, C["faint"], 2, 7)
        cv.box(*bar, fill=C["blue"], line=C["navy"])
        if phase == "pass":  # a gold band sweeps up through the layers
            by = bar[1] + bar[3] - 14 - pulse * (bar[3] - 14)
            cv.box(bar[0] + 4, by, bar[2] - 8, 14, fill=C["gold"], r=4)
        cv.text(bar[0] + bar[2] / 2, bar[1] + bar[3] / 2, "Transformer (L + O(1) layers)" if loop else "Transformer (L layers)", 22, C["navy"], bold=True, anchor="mm")
        if loop:
            for j in range(M):  # slot states above the bar: filled one per loop
                i, done = NIN + j, j < k or (j == k and phase == "out")
                cur = j == k and phase == "out"
                if done:
                    cv.box(xs(i), 85, TOK, 46, fill=C["coda"] if cur else mix(C["white"], C["coda"], 0.45), line=C["coda"], width=3 if cur else 2)
                    cv.text(xs(i) + TOK / 2, 108, f"s{j + 1}", 22, C["white"] if cur else C["ink"], bold=True, anchor="mm")
                else:
                    cv.box(xs(i), 85, TOK, 46, line=C["faint"], dash=True)
                cv.arrow(xs(i) + TOK / 2, bar[1] - 2, xs(i) + TOK / 2, 133, C["coda"] if cur else C["faint"], 2, 7)
            ax = bar[0] + bar[2] + 20
            cv.arc_arrow(ax, 198, 22, 95, -90, 90, C["gold"] if phase == "out" else C["faint"], 3)
            cv.text(x0 + 6, 340, f"loop {k}", 24, bold=True)
            cv.text(x0 + 116, 340, "tokens written: 0", 24, C["gray"])
        else:
            if phase == "out":  # new token above the bar, fed back to the end of the row
                i = row
                cv.box(xs(i), 85, TOK, 46, fill=C["pale"], line=C["gold"], width=3)
                cv.text(xs(i) + TOK / 2, 108, f"t{k + 1}", 22, bold=True, anchor="mm")
                cv.arrow(xs(i) + TOK / 2, bar[1] - 2, xs(i) + TOK / 2, 133, C["gold"], 2, 8)
            cv.text(x0 + 6, 340, f"step {k}", 24, bold=True)
            cv.text(x0 + 116, 340, f"tokens written: {k}", 24, C["gold"] if k else C["gray"], bold=bool(k))

    def draw(k, phase, pulse=0.0, end=False):
        cv = Canvas(W, H)
        panel(cv, 8, "cot", k, phase, pulse)
        cv.line(W / 2 + 2, 10, W / 2 + 2, 365, C["faint"], 1)
        panel(cv, W / 2 + 22, "loop", k, phase, pulse)
        if end:
            cv.text(W / 2, 384, "Same output: slot t on the right plays the role of token t on the left", 22, C["navy"], bold=True, anchor="mm")
        caption(cv, "Redrawn from Saunshi et al. 2025, Fig. 4; slot-per-loop is the proof idea of Thm. 5.4")
        return cv.frame()

    frames.append(draw(0, "idle")); dur.append(900)
    for k in range(M):
        for p in (0.0, 0.33, 0.66, 1.0):
            frames.append(draw(k, "pass", p)); dur.append(110)
        frames.append(draw(k, "out")); dur.append(800)
        frames.append(draw(k + 1, "idle")); dur.append(400)
    frames.append(draw(M, "idle", end=True)); dur.append(3000)
    save_gif("cot_vs_loop_slots", frames, dur)


# ---------------------------------------------------------------- 7. One token's path: stacked decoder vs looped block
def decoder_vs_looped():
    """Decoder-only sketch after Vaswani et al. 2017, Fig. 1 (Sec. 3.1); loop as in Universal Transformers.
    Both sides apply a block 4 times to the newest position; left has 4 sets of weights, right has 1."""
    W, H = 1250, 600
    NL, BH, BG, BW = 4, 70, 10, 380
    BOT = 475                         # bottom of the left stack
    SM = (120, 152)                   # Linear + Softmax box (y0, y1)
    OUT = (68, 104)                   # predicted token box
    EMB = (487, 513)
    TOK = (526, 558)
    WORDS = ["the", "cat", "sat"]
    LCOL = [C["prelude"], C["core"], C["coda"], "#9C7BB5"]
    RB = (300, 300 + BH)              # the right block (top, bottom)
    frames, dur = [], []

    def ltop(k):  # top y of left layer k (1 = bottom)
        return BOT - k * BH - (k - 1) * BG

    def block(cv, cx, top, color, label, glow_y=None):
        x = cx - BW / 2
        cv.box(x, top, BW, BH, fill=mix(C["white"], color, 0.28), line=mix(C["white"], color, 0.9), width=2)
        strips = [(top + 5, "Feed-forward"), (top + 37, "Masked self-attention")]
        for sy, name in strips:
            on = glow_y is not None and sy - 2 <= glow_y <= sy + 30
            cv.box(x + 12, sy, BW - 24, 28, fill=C["pale"] if on else C["white"], line=C["gold"] if on else C["faint"], width=2 if on else 1, r=5)
            cv.text(cx, sy + 14, name, 17, C["ink"], bold=on, anchor="mm")
        cv.text(x + BW + 10, top + BH / 2, label, 17, C["gray"], anchor="lm") if label else None

    def io(cv, cx, out_word, appended):
        cv.box(cx - 150, SM[0], 300, SM[1] - SM[0], fill=C["light"], line=C["gray"], width=1)
        cv.text(cx, (SM[0] + SM[1]) / 2, "Linear + Softmax", 18, C["ink"], anchor="mm")
        cv.box(cx - 150, EMB[0], 300, EMB[1] - EMB[0], fill=C["light"], line=C["gray"], width=1)
        cv.text(cx, (EMB[0] + EMB[1]) / 2, "Embedding + position", 17, C["ink"], anchor="mm")
        words = WORDS + (["on"] if appended else [])
        x0 = cx - (len(WORDS) + 1) * 70 / 2
        for i, w in enumerate(words):
            cur = (w == "sat" and not appended) or (w == "on" and appended)
            cv.box(x0 + i * 70, TOK[0], 62, TOK[1] - TOK[0], fill=C["pale"] if cur else C["light"], line=C["gold"] if cur else C["faint"], width=2)
            cv.text(x0 + i * 70 + 31, (TOK[0] + TOK[1]) / 2, w, 19, C["ink"], bold=cur, anchor="mm")
        if out_word:
            cv.box(cx - 40, OUT[0], 80, OUT[1] - OUT[0], fill=C["pale"], line=C["gold"], width=3)
            cv.text(cx, (OUT[0] + OUT[1]) / 2, out_word, 20, C["ink"], bold=True, anchor="mm")
        return x0 + 2 * 70 + 31  # x of "sat"

    def along(pts, t):
        """Point at fraction t of the polyline pts."""
        seg = [math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(pts, pts[1:])]
        d = t * sum(seg)
        for (a, b), L in zip(zip(pts, pts[1:]), seg):
            if d <= L or L == seg[-1]:
                f = 0 if L == 0 else min(1, d / L)
                return a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f
            d -= L
        return pts[-1]

    def dot(cv, p):
        if p:
            cv.d.ellipse([(p[0] - 9) * S, (p[1] - 9) * S, (p[0] + 9) * S, (p[1] + 9) * S], fill=C["gold"], outline=C["white"], width=2 * S)

    def left(cv, x0, phase, k, t):
        cx = x0 + 330
        cv.text(x0, 8, "Transformer: 4 distinct layers", 26, bold=True)
        cv.text(x0, 44, "4 sets of weights; the token climbs the stack once", 20, C["gray"])
        sat = io(cv, cx, "on" if phase in ("out", "append", "hold") else None, phase in ("append", "hold"))
        for i in range(1, NL + 1):  # arrows between parts, then the layers
            cv.arrow(cx, ltop(i) + BH + BG - 1 if i > 1 else EMB[0] - 1, cx, ltop(i) + BH + 2, C["faint"], 2, 7)
        cv.arrow(cx, ltop(NL) - 1, cx, SM[1] + 2, C["faint"], 2, 7)
        cv.arrow(cx, SM[0] - 1, cx, OUT[1] + 2, C["faint"], 2, 7)
        p = None
        if phase == "embed":
            p = along([(sat, TOK[0]), (cx, EMB[1]), (cx, BOT)], t)
        elif phase == "pass":
            p = (cx, ltop(k) + BH - t * BH)
        elif phase == "gap":
            p = (cx, ltop(k) - t * BG)
        elif phase == "head":
            p = along([(cx, ltop(NL)), (cx, OUT[1])], t)
        for i in range(1, NL + 1):
            block(cv, cx, ltop(i), LCOL[i - 1], f"Layer {i}", p[1] if p and phase == "pass" and i == k else None)
        lay = k if phase in ("pass", "gap") else (NL if phase in ("head", "out", "append", "hold") else 0)
        cv.text(x0 + 6, (ltop(NL) + BOT) / 2 - 12, f"layer {lay} of {NL}", 22, C["gold"] if phase in ("pass", "gap") else C["navy"], bold=True, anchor="lm")
        cv.text(x0 + 6, (ltop(NL) + BOT) / 2 + 16, "own weights each", 16, C["gray"], anchor="lm")
        dot(cv, p)

    def right(cv, x0, phase, k, t):
        cx = x0 + 315
        top, bot = RB
        cv.text(x0, 8, "Looped: 1 block, run 4 times", 26, bold=True)
        cv.text(x0, 44, "1 set of weights; the token goes round the same block", 20, C["gray"])
        sat = io(cv, cx, "on" if phase in ("out", "append", "hold") else None, phase in ("append", "hold"))
        loop = [(cx, top), (cx, top - 14), (cx + BW / 2 + 28, top - 14), (cx + BW / 2 + 28, bot + 14), (cx, bot + 14), (cx, bot)]
        hot = phase == "back"
        for a, b in zip(loop[1:-2], loop[2:-1]):
            cv.line(*a, *b, C["gold"] if hot else C["faint"], 3 if hot else 2)
        cv.arrow(*loop[-2], *loop[-1], C["gold"] if hot else C["faint"], 3 if hot else 2, 8)
        cv.arrow(cx, EMB[0] - 1, cx, bot + 2, C["faint"], 2, 7)
        cv.arrow(cx, top - 1, cx, SM[1] + 2, C["gold"] if phase == "head" else C["faint"], 2, 7)
        cv.arrow(cx, SM[0] - 1, cx, OUT[1] + 2, C["faint"], 2, 7)
        cv.text(cx + BW / 2 + 38, (top + bot) / 2, "× 4", 26, C["gold"], bold=True, anchor="lm")
        p = None
        if phase == "embed":
            p = along([(sat, TOK[0]), (cx, EMB[1]), (cx, bot)], t)
        elif phase == "pass":
            p = (cx, bot - t * BH)
        elif phase == "back":
            p = along(loop, t)
        elif phase == "head":
            p = along([(cx, top), (cx, OUT[1])], t)
        block(cv, cx, top, C["core"], None, p[1] if p and phase == "pass" else None)
        done = {"idle": 0, "embed": 0, "pass": k - 1, "back": k, "head": NL}.get(phase, NL)
        cur = k if phase in ("pass", "back") else done
        cv.text(x0 + 6, (top + bot) / 2 - 12, f"pass {cur} of {NL}", 20, C["gold"] if phase in ("pass", "back") else C["navy"], bold=True, anchor="lm")
        cv.text(x0 + 6, (top + bot) / 2 + 16, "same weights", 16, C["gray"], anchor="lm")
        dot(cv, p)

    def draw(lphase, rphase, k, t):
        cv = Canvas(W, H)
        left(cv, 8, lphase, k, t)
        cv.line(W / 2 + 2, 10, W / 2 + 2, H - 30, C["faint"], 1)
        right(cv, W / 2 + 22, rphase, k, t)
        caption(cv, "Decoder-only sketch after Vaswani et al. 2017, Fig. 1 (encoder-decoder attention, Add & Norm omitted). Gold dot = the newest token's path")
        return cv.frame()

    seq = [("idle", "idle", 0, 0, 900)]
    seq += [("embed", "embed", 0, i / 4, 80) for i in range(5)]
    for k in range(1, NL + 1):
        seq += [("pass", "pass", k, i / 5, 90) for i in range(6)]
        if k < NL:  # left crosses the gap into the next layer; right goes round the loop
            seq += [("gap", "back", k, i / 4, 80) for i in range(1, 5)]
    seq += [("head", "head", NL, i / 3, 90) for i in range(4)]
    seq += [("out", "out", NL, 0, 900), ("append", "append", NL, 0, 600), ("hold", "hold", NL, 0, 1800)]
    for lp, rp, k, t, ms in seq:
        frames.append(draw(lp, rp, k, t))
        dur.append(ms)
    save_gif("decoder_vs_looped", frames, dur)


if __name__ == "__main__":
    import sys
    todo = sys.argv[1:] or ["cot_vs_loop", "huginn_loop", "mor_routing", "ouro_exit", "rnn_vs_transformer", "cot_vs_loop_slots"]
    for name in todo:
        globals()[name]()
