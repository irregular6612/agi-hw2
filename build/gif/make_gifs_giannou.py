"""Program animations for the Giannou et al. 2023 slide ("Looped Transformers as Programmable Computers").

python3 build/gif/make_gifs_giannou.py   -> figures/gif/giannou_{subleq,calculator,matrix_inverse,sgd}.gif

Shared picture: left = the prompt X the loop reads (scratchpad S, memory M, commands C; sources/giannou.md, Eq 2),
middle = one fixed, hand-set Transformer block with a loop counter, right = what this loop changed.
Structural facts (layers/heads, the Read -> Read data -> Subtract -> Write -> If-goto cycle, FLEQ function blocks,
EOF halting, calculator ops and Algorithm 3) come from sources/giannou.md. Every concrete number is illustration.
"""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from make_gifs import Canvas, C, mix, save_gif, S  # noqa: E402

W, H = 1250, 520
LX, LW = 20, 420          # left panel: prompt X
MX, MW = 490, 280         # middle: the looped block
RX, RW = 820, 410         # right panel: what changed
BT, BB = 82, 420          # block top / bottom
PB = 432                  # panel bottom
RET = 452                 # y of the feedback path
AY = 250                  # y of the read / write arrows


def num(v, nd=4):
    s = f"{v:.{nd}f}".rstrip("0").rstrip(".") if isinstance(v, float) else str(v)
    return s.replace("-", "−")


def note(cv, t):
    """Caption at 18 px (make_gifs.caption is 13 px, below this slide's 18 px floor)."""
    cv.text(W - 12, H - 6, t, 18, C["gray"], italic=True, anchor="rd")


def scaffold(cv, counter, sub, facts, steps, cur, back_hot=False, steps_y=BT + 104, read_hot=False, write_hot=False,
             right_title="What changed this loop"):
    cx = MX + MW / 2
    cv.text(LX, 12, "Prompt X: what each loop reads", 22, bold=True)
    cv.text(RX, 12, right_title, 22, bold=True)
    cv.text(cx, 4, counter, 30, C["gold"], bold=True, anchor="ma")
    cv.text(cx, 46, sub, 18, C["gray"], anchor="ma")
    cv.box(MX, BT, MW, BB - BT, fill=C["blue"], line=C["navy"])
    cv.text(cx, BT + 12, "Looped Transformer", 22, C["navy"], bold=True, anchor="ma")
    cv.text(cx, BT + 42, "fixed, hand-set weights", 18, C["gray"], anchor="ma")
    cv.text(cx, BT + 66, facts, 18, C["navy"], bold=True, anchor="ma")
    for i, name in enumerate(steps):
        y = steps_y + i * 40
        on, done = cur is not None and i == cur, cur is not None and i < cur
        cv.box(MX + 16, y, MW - 32, 34, fill=C["pale"] if on else (mix(C["white"], C["gold"], 0.12) if done else C["white"]),
               line=C["gold"] if on else C["faint"], width=3 if on else 1, r=6)
        cv.text(cx, y + 17, name, 19, C["ink"] if (on or done) else C["gray"], bold=on, anchor="mm")
    cv.arrow(LX + LW + 8, AY, MX - 6, AY, C["navy"] if read_hot else C["faint"], 3 if read_hot else 2, 10)
    cv.arrow(MX + MW + 6, AY, RX - 8, AY, C["gold"] if write_hot else C["faint"], 3 if write_hot else 2, 10)
    col, wd = (C["gold"], 3) if back_hot else (C["faint"], 2)
    x0, x1 = LX + LW / 2, RX + RW / 2
    cv.line(x1, PB + 2, x1, RET, col, wd)
    cv.line(x1, RET, x0, RET, col, wd)
    cv.arrow(x0, RET, x0, PB + 4, col, wd, 10)
    cv.text(cx, RET + 8, "next loop: the written-back X is the new input", 18, C["gold"] if back_hot else C["gray"],
            bold=back_hot, anchor="ma")


def section(cv, y, label):
    cv.text(LX, y, label, 18, C["gray"], bold=True)


def scratch(cv, y, txt):
    cv.box(LX, y, LW, 36, fill=C["white"], line=C["faint"], width=1, dash=not txt)
    cv.text(LX + 14, y + 18, txt or "(working area, empty)", 19, C["ink"] if txt else C["faint"], anchor="lm")


def cell(cv, x, y, w, h, val, name, state=None, size=22):
    fill, line, wd = {None: (C["light"], C["faint"], 1), "read": (C["white"], C["navy"], 3),
                      "write": (C["pale"], C["gold"], 3)}[state]
    cv.box(x, y, w, h, fill=fill, line=line, width=wd, r=6)
    cv.text(x + w / 2, y + h / 2, val, size, C["ink"], bold=True, anchor="mm")
    if name:
        cv.text(x + w / 2, y + h + 6, name, 18, C["gray"], anchor="ma")


def command(cv, y, h, txt, pc=False, size=20):
    cv.box(LX + 46, y, LW - 46, h, fill=C["pale"] if pc else C["white"], line=C["gold"] if pc else C["faint"], width=2 if pc else 1, r=5)
    cv.text(LX + 58, y + h / 2, txt, size, C["ink"], bold=pc, anchor="lm")
    if pc:
        cv.text(LX, y + h / 2, "pc", 18, C["gold"], bold=True, anchor="lm")
        cv.arrow(LX + 22, y + h / 2, LX + 42, y + h / 2, C["gold"], 3, 8)


def kv(cv, y, key, val, color=C["ink"], bold=False, x2=RX + 110):
    cv.text(RX + 14, y, key, 20, C["gray"], anchor="lm")
    cv.text(x2, y, val, 20, color, bold=bold, anchor="lm")


# ---------------------------------------------------------------- 1. SUBLEQ: one instruction per loop
def giannou_subleq():
    mem0 = [1, 2, 0, -2, 0]
    names = ["[0] one", "[1] x", "[2] acc", "[3] k", "[4] z"]
    prog = [(3, 2, 1), (0, 1, 3), (4, 4, 0), (4, 4, 3)]
    EOF = 3
    steps = ["Read command", "Read data", "Subtract", "Write", "If-goto"]

    trace, m, pc = [], mem0[:], 0
    while True:  # run the program once to get every loop's values
        a, b, c = prog[pc]
        va, vb = m[a], m[b]
        before = m[:]
        m[b] = vb - va
        nxt = c if m[b] <= 0 else pc + 1
        trace.append(dict(pc=pc, a=a, b=b, c=c, va=va, vb=vb, new=m[b], nxt=nxt, before=before, after=m[:]))
        if pc == EOF:
            break
        pc = nxt

    def par(v):
        return f"({num(v)})" if v < 0 else num(v)

    def draw(k, s, halted=False):
        cv = Canvas(W, H)
        t = trace[k] if k is not None else None
        counter = "loop 0" if t is None else f"loop {k + 1}"
        scaffold(cv, counter, "halted: state frozen" if halted else "one instruction per loop", "9 layers · 2 heads",
                 steps, None if halted else s, back_hot=(s == 4 and not halted), read_hot=s in (0, 1) and not halted, write_hot=s in (3, 4) and not halted)
        # left: S, M, C
        section(cv, 50, "Scratchpad S")
        sc = None
        if t is not None and not halted:
            sc = [f"fetched I{t['pc']}: SUBLEQ {t['a']}, {t['b']}, {t['c']}",
                  f"mem[{t['a']}] = {num(t['va'])},  mem[{t['b']}] = {num(t['vb'])}",
                  f"{num(t['vb'])} − {par(t['va'])} = {num(t['new'])}"][min(s, 2)]
        scratch(cv, 74, sc)
        section(cv, 122, "Memory M")
        vals = mem0 if t is None else (t["before"] if s < 3 else t["after"])
        for i, v in enumerate(vals):
            st = None
            if t is not None and not halted:
                if s in (1, 2) and i in (t["a"], t["b"]):
                    st = "read"
                elif s >= 3 and i == t["b"]:
                    st = "write"
            cell(cv, LX + i * 86, 146, 76, 46, num(v), names[i], st)
        section(cv, 230, "Commands C")
        pc_now = 0 if t is None else (t["nxt"] if s == 4 or halted else t["pc"])
        for i, (a, b, c) in enumerate(prog):
            command(cv, 256 + i * 40, 34, f"I{i}   SUBLEQ {a}, {b}, {c}" + ("     (EOF)" if i == EOF else ""), pc=i == pc_now)
        # right: this loop's change
        cv.box(RX, 52, RW, 216, fill=C["white"], line=C["faint"], width=1)
        if t is not None:
            cv.text(RX + 14, 72, f"I{t['pc']}:  SUBLEQ {t['a']}, {t['b']}, {t['c']}" + ("   (EOF)" if t["pc"] == EOF else ""),
                    22, C["navy"], bold=True, anchor="lm")
            rows = [("read", f"mem[{t['a']}] = {num(t['va'])},  mem[{t['b']}] = {num(t['vb'])}"),
                    ("subtract", f"{num(t['vb'])} − {par(t['va'])} = {num(t['new'])}"),
                    ("write", f"mem[{t['b']}] ← {num(t['new'])}"),
                    ("jump", (f"{num(t['new'])} ≤ 0  →  goto I{t['c']}" + ("  (itself)" if t["c"] == t["pc"] else ""))
                     if t["new"] <= 0 else f"{num(t['new'])} > 0  →  next, I{t['pc'] + 1}")]
            for j, (key, val) in enumerate(rows):
                if s >= j + 1 or halted:
                    kv(cv, 114 + j * 38, key, val, C["gold"] if j == s - 1 else C["ink"], bold=j == s - 1)
        if halted:
            cv.box(RX, 280, RW, 46, fill=C["pale"], line=C["gold"], width=2)
            cv.text(RX + RW / 2, 303, "EOF jumps to itself: X stops changing", 19, C["ink"], bold=True, anchor="mm")
        cv.box(RX, 338, RW, 94, fill=C["light"], line=C["faint"], width=1)
        cv.text(RX + 14, 350, "SUBLEQ a, b, c", 19, C["navy"], bold=True)
        cv.text(RX + 14, 376, "mem[b] ← mem[b] − mem[a]", 19)
        cv.text(RX + 14, 402, "if mem[b] ≤ 0 goto c, else next line", 19)
        note(cv, "Program, memory values and trace: illustration. Cycle and 9 layers / 2 heads: Giannou et al. 2023, Sec 5.1, Lemma 4")
        return cv.frame()

    frames, dur = [draw(None, None)], [800]
    for k in range(len(trace)):
        for s, ms in enumerate([260, 260, 280, 320, 380]):
            frames.append(draw(k, s))
            dur.append(ms)
    frames.append(draw(len(trace) - 1, 4, halted=True))
    dur.append(2000)
    save_gif("giannou_subleq", frames, dur)


# ---------------------------------------------------------------- 2. Calculator: one primitive per loop
def giannou_calculator():
    mem0 = {"a": 5, "b": 3, "c": 4, "d": 4, "t": 0}
    ops = {"add": (lambda x, y: x + y, "{x} + {y}"), "sub": (lambda x, y: x - y, "{x} − {y}"),
           "mul": (lambda x, y: x * y, "{x} · {y}"), "inv": (lambda x, y: 1 / x, "1 / {x}"),
           "sqrt": (lambda x, y: x ** 0.5, "√{x}"), "pct": (lambda x, y: x / 100, "{x} / 100")}
    prog = [("add", "a", "b"), ("sub", "t", "c"), ("mul", "t", "d"), ("inv", "t", None), ("sqrt", "t", None), ("pct", "t", None)]
    expr = ["a + b", "(a + b) − c", "((a + b) − c) · d", "1 / (((a + b) − c) · d)", "√(1 / (((a + b) − c) · d))",
            "√(1 / (((a + b) − c) · d)) / 100"]
    steps = ["Read command + data", "Apply that op's block", "Write, go to next"]
    chips = ["add", "sub", "mul", "inv", "sqrt", "pct"]

    trace, m = [], dict(mem0)
    for op, x, y in prog:
        vx, vy = m[x], (m[y] if y else None)
        before = dict(m)
        m["t"] = ops[op][0](vx, vy)
        trace.append(dict(op=op, x=x, y=y, vx=vx, vy=vy, new=m["t"], before=before, after=dict(m)))

    def cmd_txt(op, x, y):
        return f"t ← {op}({x}, {y})" if y else f"t ← {op}({x})"

    def calc_txt(t):
        lhs = ops[t["op"]][1].format(x=num(t["vx"]), y=num(t["vy"]) if t["vy"] is not None else "")
        rel = "≈" if t["op"] in ("inv", "sqrt") else "="
        return f"{lhs} {rel} {num(t['new'])}"

    def draw(k, s, end=False):
        cv = Canvas(W, H)
        t = trace[k] if k is not None else None
        scaffold(cv, "loop 0" if t is None else f"loop {k + 1}", "done: program finished" if end else "one operation per loop",
                 "12 layers · m heads", steps, None if end else s, back_hot=(s == 2 and not end),
                 steps_y=BT + 188, read_hot=s == 0 and not end, write_hot=s == 2 and not end)
        cv.text(MX + MW / 2, BT + 94, "one function block per op", 18, C["gray"], anchor="ma")
        for i, ch in enumerate(chips):  # FLEQ function blocks; the one this loop uses lights up
            x, y = MX + 22 + (i % 3) * 82, BT + 118 + (i // 3) * 32
            on = t is not None and not end and ch == t["op"] and s >= 1
            cv.box(x, y, 72, 26, fill=C["gold"] if on else C["white"], line=C["gold"] if on else C["faint"], width=1, r=5)
            cv.text(x + 36, y + 13, ch, 18, C["white"] if on else C["gray"], bold=on, anchor="mm")
        section(cv, 50, "Scratchpad S")
        sc = None
        if t is not None and not end:
            rd = f"{t['x']} = {num(t['vx'])}" + (f",  {t['y']} = {num(t['vy'])}" if t["y"] else "")
            sc = rd if s == 0 else f"{t['op']}: {calc_txt(t)}"
        scratch(cv, 74, sc)
        section(cv, 122, "Memory M")
        vals = mem0 if t is None else (t["before"] if s < 2 else t["after"])
        x = LX
        for key in "abcdt":
            w = 118 if key == "t" else 66
            st = None
            if t is not None and not end:
                if s <= 1 and key in (t["x"], t["y"]):
                    st = "read"
                elif s == 2 and key == "t":
                    st = "write"
            cell(cv, x, 146, w, 46, num(vals[key]), key, st)
            x += w + 12
        section(cv, 230, "Commands C")
        pc = None if end else (0 if t is None else k)
        for i, (op, a, b) in enumerate(prog):
            command(cv, 256 + i * 28, 25, f"{i + 1}   {cmd_txt(op, a, b)}", pc=i == pc, size=19)
        # right
        cv.box(RX, 52, RW, 160, fill=C["white"], line=C["faint"], width=1)
        if t is not None:
            cv.text(RX + 14, 72, f"line {k + 1}:  {cmd_txt(t['op'], t['x'], t['y'])}", 22, C["navy"], bold=True, anchor="lm")
            rd = f"{t['x']} = {num(t['vx'])}" + (f",  {t['y']} = {num(t['vy'])}" if t["y"] else "")
            rows = [("read", rd), (t["op"], calc_txt(t)), ("write", f"t ← {num(t['new'])}")]
            for j, (key, val) in enumerate(rows):
                if s >= j or end:
                    kv(cv, 112 + j * 34, key, val, C["gold"] if j == s and not end else C["ink"], bold=j == s and not end)
        cv.box(RX, 224, RW, 96, fill=C["pale"] if end else C["white"], line=C["gold"] if end else C["faint"], width=2 if end else 1)
        cv.text(RX + 14, 236, "t now holds", 18, C["gray"])
        if t is not None:
            done = s == 2 or end
            e = expr[k] if done else (expr[k - 1] if k else "0")
            v = t["after"]["t"] if done else t["before"]["t"]
            cv.text(RX + 14, 264, e, 22, C["ink"], bold=True)
            cv.text(RX + 14, 292, f"= {num(v)}", 20, C["gold"] if done else C["ink"], bold=done)
        cv.box(RX, 332, RW, 100, fill=C["light"], line=C["faint"], width=1)
        cv.text(RX + 14, 342, "√(1 / (((a + b) − c) · d)) / 100", 19, C["navy"], bold=True)
        cv.text(RX + 14, 370, "example program (paper's Algorithm 3)", 18, C["gray"])
        cv.text(RX + 14, 398, "inv, sqrt are approximate: O(1/√m), O(1/m)", 18, C["gray"])
        note(cv, "Inputs a–d and the 6-line split: illustration. 12 layers / m heads, ops, Alg. 3 and error orders: Giannou et al. 2023, Sec 7, Thm 4")
        return cv.frame()

    frames, dur = [draw(None, None)], [800]
    for k in range(len(trace)):
        for s, ms in enumerate([340, 400, 460]):
            frames.append(draw(k, s))
            dur.append(ms)
    frames.append(draw(len(trace) - 1, 2, end=True))
    dur.append(2200)
    save_gif("giannou_calculator", frames, dur)


# ---------------------------------------------------------------- 3. Matrix inversion: the iterate refines toward A^-1
def giannou_matrix_inverse():
    A = np.array([[2.0, 1.0], [1.0, 3.0]])
    Ainv = np.linalg.inv(A)
    I2 = np.eye(2)
    # The digest does not name the paper's iteration; values below come from a Newton-type update chosen for illustration.
    Xs = [0.4 * I2]
    for _ in range(4):
        X = Xs[-1]
        Xs.append(X @ (2 * I2 - A @ X))
    err = [np.linalg.norm(I2 - A @ X, 2) for X in Xs]
    steps = ["Read A and X", "One refinement step", "Write X"]
    NL = len(Xs) - 1

    def mat(cv, x, y, M, cw, ch, state=None, size=20, color=None, changed=None):
        for i in range(2):
            for j in range(2):
                st = state
                if changed is not None and not changed:
                    st = None
                cell(cv, x + j * (cw + 8), y + i * (ch + 8), cw, ch, f"{M[i, j]:.3f}".replace("-", "−"), None, st, size)
        # brackets
        x1, y1 = x + 2 * cw + 8, y + 2 * ch + 8
        for bx, d in ((x - 8, 1), (x1 + 8, -1)):
            cv.line(bx, y - 4, bx, y1 + 4, C["ink"], 2)
            cv.line(bx, y - 4, bx + 6 * d, y - 4, C["ink"], 2)
            cv.line(bx, y1 + 4, bx + 6 * d, y1 + 4, C["ink"], 2)

    def fmt_err(e):
        return f"{e:.2f}" if e >= 0.01 else (f"{e:.4f}" if e >= 1e-4 else f"{e:.0e}".replace("e-0", "e−"))

    def draw(k, s, end=False):
        """k = loops finished before this one (0..NL-1); s = step within loop k+1."""
        cv = Canvas(W, H)
        active = k is not None and not end
        shown = 0 if k is None else (NL if end else (k + 1 if s == 2 else k))  # index of X held in memory
        scaffold(cv, "loop 0" if k is None else f"loop {k + 1}", "X ≈ A⁻¹ to 3 decimals" if end else "one refinement per loop",
                 "13 layers · 1 head", steps, None if end else s, back_hot=active and s == 2,
                 read_hot=active and s == 0, write_hot=active and s == 2)
        section(cv, 50, "Scratchpad S")
        sc = None
        if active:
            sc = ["copy of A and X" + (f"₀" if k == 0 else ""), "compute the refined X", "refined X ready"][s]
        scratch(cv, 74, sc)
        section(cv, 122, "Memory M")
        mat(cv, LX + 14, 148, A, 76, 36, "read" if active and s == 0 else None, 20)
        cv.text(LX + 14 + 80, 240, "A (given)", 18, C["gray"], anchor="ma")
        mat(cv, LX + 214, 148, Xs[shown], 88, 36, ("read" if s == 0 else ("write" if s == 2 else None)) if active else None, 20)
        cv.text(LX + 214 + 92, 240, "X (current estimate)", 18, C["gray"], anchor="ma")
        section(cv, 276, "Commands C")
        command(cv, 302, 36, "X ← refine(A, X)", pc=not end)
        cv.text(LX + 46, 352, "the external loop runs it T times", 18, C["gray"])
        cv.text(LX + 46, 376, "(Alg. 1: for i = 1:T, X ← TF(W; X))", 18, C["gray"])
        # right: new X, target, error per loop
        cv.text(RX, 56, f"X after loop {shown}", 20, C["ink"], bold=True)
        mat(cv, RX + 10, 88, Xs[shown], 82, 34, "write" if active and s == 2 else None, 19)
        cv.text(RX + 230, 56, "target A⁻¹", 20, C["gray"], bold=True)
        mat(cv, RX + 236, 88, Ainv, 76, 34, None, 19)
        # error bars on a log scale, 1 down to 1e-6
        cv.text(RX, 186, "error ‖I − AX‖ after each loop (log scale)", 18, C["gray"])
        gx, gy0, gy1 = RX + 30, 240, 396
        cv.line(gx - 6, gy1, RX + RW - 6, gy1, C["faint"], 1)
        for p, lab in ((0, "1"), (-3, "10⁻³"), (-6, "10⁻⁶")):
            yy = gy0 + (-p / 6) * (gy1 - gy0)
            cv.line(gx - 6, yy, RX + RW - 6, yy, C["light"], 1)
            cv.text(gx - 10, yy, lab, 18, C["gray"], anchor="rm")
        bw = 62
        for i in range(shown + 1):
            e = max(err[i], 1e-6)
            hgt = (-np.log10(e) / 6)
            top = gy0 + hgt * (gy1 - gy0)
            x = gx + 8 + i * (bw + 10)
            cur = i == shown and active and s == 2
            cv.box(x, top, bw, gy1 - top, fill=C["gold"] if cur else mix(C["white"], C["navy"], 0.55), r=3)
            cv.text(x + bw / 2, top - 4, fmt_err(err[i]), 18, C["ink"], bold=cur, anchor="md")
            cv.text(x + bw / 2, gy1 + 4, f"loop {i}" if i else "start", 18, C["gray"], anchor="ma")
        note(cv, "Illustration: A, X₀ and all values are made up; the refinement step is our choice, not the paper's. 13 layers / 1 head: Lemma 12")
        return cv.frame()

    frames, dur = [draw(None, None)], [900]
    for k in range(NL):
        for s, ms in enumerate([380, 440, 620]):
            frames.append(draw(k, s))
            dur.append(ms)
    frames.append(draw(NL - 1, 2, end=True))
    dur.append(2400)
    save_gif("giannou_matrix_inverse", frames, dur)


# ---------------------------------------------------------------- 4. SGD: w steps down the loss
def giannou_sgd():
    data = [(1.0, 2.0), (2.0, 4.0), (3.0, 6.0)]
    eta, w0, NS = 0.04, 0.0, 6

    def loss(w):
        return sum((w * x - y) ** 2 for x, y in data) / len(data)

    trace, w = [], w0
    for k in range(NS):
        x, y = data[k % 3]
        yh = w * x
        g = 2 * x * (yh - y)
        trace.append(dict(i=k % 3, x=x, y=y, w=w, yh=yh, g=g, new=w - eta * g))
        w = w - eta * g
    ws = [w0] + [t["new"] for t in trace]
    Ls = [loss(v) for v in ws]
    steps = ["Forward  ŷ = w · x", "Backward  g = ∂L/∂w", "Update  w ← w − η g"]
    cmds = ["ŷ ← w · x", "g ← 2x (ŷ − y)", "w ← w − η · g"]

    def f2(v):
        return num(round(v, 2), 2) if abs(v) >= 0.1 else num(round(v, 3), 3)

    def draw(k, s, end=False):
        cv = Canvas(W, H)
        t = trace[k] if k is not None else None
        active = t is not None and not end
        nw = 0 if t is None else (NS if end else (k + 1 if s == 2 else k))  # index of w held in memory
        scaffold(cv, "step 0" if t is None else f"SGD step {k + 1}", "deeper nets need more loops per step",
                 "13 layers · 1 head", steps, None if end else s, back_hot=active and s == 2,
                 read_hot=active and s == 0, write_hot=active and s == 2, right_title="What changed this step")
        section(cv, 50, "Scratchpad S")
        sc = None
        if active:
            sc = [f"ŷ = {f2(t['w'])} · {num(t['x'])} = {f2(t['yh'])}",
                  f"ŷ = {f2(t['yh'])},  g = {f2(t['g'])}",
                  f"g = {f2(t['g'])}"][s]
        scratch(cv, 74, sc)
        section(cv, 122, "Memory M")
        x = LX
        for i, (dx, dy) in enumerate(data):
            st = "read" if active and i == t["i"] and s <= 1 else None
            cell(cv, x, 146, 74, 46, f"{num(dx)}, {num(dy)}", f"sample {i + 1}", st, 20)
            x += 84
        st = ("read" if s <= 1 else "write") if active else None
        cell(cv, x, 146, 92, 46, f2(ws[nw]), "w", st)
        cell(cv, x + 102, 146, 66, 46, num(eta), "η", "read" if active and s == 2 else None, 20)
        section(cv, 230, "Commands C")
        for i, c in enumerate(cmds):
            command(cv, 256 + i * 40, 34, f"{i + 1}   {c}", pc=active and i == s)
        cv.text(LX + 46, 382, "on the next sample (x, y) each step", 18, C["gray"])
        # right: this step + fit + loss
        cv.box(RX, 52, RW, 124, fill=C["white"], line=C["faint"], width=1)
        if t is not None:
            rows = [("forward", f"ŷ = {f2(t['w'])} · {num(t['x'])} = {f2(t['yh'])}"),
                    ("backward", f"g = 2·{num(t['x'])}·({f2(t['yh'])} − {num(t['y'])}) = {f2(t['g'])}"),
                    ("update", f"w ← {f2(t['w'])} − {num(eta)}·({f2(t['g'])}) = {f2(t['new'])}")]
            for j, (key, val) in enumerate(rows):
                if s >= j or end:
                    on = j == s and not end
                    kv(cv, 74 + j * 36, key, val, C["gold"] if on else C["ink"], bold=on, x2=RX + 112)
        # fit plot: data points and the line y = w x
        px, py, pw, ph = RX + 34, 214, 170, 180
        cv.text(RX, 186, "fit  y = w x", 18, C["gray"])
        cv.line(px, py + ph, px + pw, py + ph, C["faint"], 1)
        cv.line(px, py, px, py + ph, C["faint"], 1)
        X = lambda v: px + v / 3.5 * pw
        Y = lambda v: py + ph - v / 7 * ph
        for j in range(nw):
            cv.line(X(0), Y(0), X(3.5), Y(min(7, ws[j] * 3.5)), mix(C["white"], C["navy"], 0.25), 1)
        cv.line(X(0), Y(0), X(3.5), Y(min(7, ws[nw] * 3.5)), C["gold"], 3)
        for i, (dx, dy) in enumerate(data):
            r = 7 if active and i == t["i"] else 5
            cv.d.ellipse([(X(dx) - r) * S, (Y(dy) - r) * S, (X(dx) + r) * S, (Y(dy) + r) * S],
                         fill=C["navy"] if r == 7 else C["gray"])
        cv.text(px + pw / 2, py + ph + 6, f"w = {f2(ws[nw])}", 18, C["ink"], bold=True, anchor="ma")
        # loss bars
        lx, lw = RX + 236, 174
        cv.text(lx, 186, "loss L(w)", 18, C["gray"])
        cv.line(lx, py + ph, lx + lw, py + ph, C["faint"], 1)
        bw = 20
        for j in range(nw + 1):
            hgt = Ls[j] / Ls[0] * ph
            cur = j == nw
            cv.box(lx + 4 + j * (bw + 4), py + ph - hgt, bw, hgt, fill=C["gold"] if cur else mix(C["white"], C["navy"], 0.55), r=2)
        cv.text(lx + lw / 2, py + ph + 6, f"L = {f2(Ls[nw])}", 18, C["ink"], bold=True, anchor="ma")
        note(cv, "Illustration: 1-D linear model, squared loss; data, w, η and losses are made up. 13 layers / 1 head: Lemma 15; loops per step: Sec 9")
        return cv.frame()

    frames, dur = [draw(None, None)], [800]
    for k in range(NS):
        for s, ms in enumerate([340, 380, 520]):
            frames.append(draw(k, s))
            dur.append(ms)
    frames.append(draw(NS - 1, 2, end=True))
    dur.append(2200)
    save_gif("giannou_sgd", frames, dur)


if __name__ == "__main__":
    todo = sys.argv[1:] or ["giannou_subleq", "giannou_calculator", "giannou_matrix_inverse", "giannou_sgd"]
    for name in todo:
        globals()[name]()
