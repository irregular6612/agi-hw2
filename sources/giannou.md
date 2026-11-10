# Looped Transformers as Programmable Computers (slug: `giannou`)

Source PDF: `papers/giannou.pdf` (arXiv v1, 30 Jan 2023, 64 pp.). The arXiv PDF does not print a venue. "ICML 2023" comes from the brief and the vault note. [unverified against the PMLR camera-ready, which may differ from v1]

## Citation line
Giannou, Rajput, Sohn, Lee, Lee, Papailiopoulos, "Looped Transformers as Programmable Computers", ICML 2023 · arXiv:2301.13196

## Problem & gap
- **Targets:** Prior Turing-completeness constructions for Transformers are generic. They "do not provide insight into how to create Transformers that can carry out particular algorithmic tasks" and typically need high or infinite precision (Sec 1–2). RASP/Tracr-compiled networks "scale in size with the size of the program". ICL-as-GD constructions (Akyürek; von Oswald) need "a number of layers proportional to the number of iterations" (Sec 1).
- **Fix:** Hard-code the weights of a *constant-depth* Transformer that executes **one instruction per forward pass**, then wrap it in an external loop. Depth then depends on the instruction, not on the program.
- **Left open:** This is pure existence/construction. Nothing is trained, and there are no experiments. The authors list as open problems whether such programs can be *learned* from input–output pairs, how to tokenize the commands as natural language, and how to fuse these modules with pretrained LMs (Sec 10). Yang et al. 2024 take up the "learn it by training" half.

## Core mechanism: reveal steps on Fig 1 (PDF p. 3)
Figure file: `figures/giannou-fig1.png` (753×453). Companion figure for step 4: `figures/giannou-fig5.png` (Fig 5, PDF p. 15, 888×210).

1. **Prompt = punchcard.** The input X has three parts: a scratchpad S (working area, "cache"), memory M (data that can be read and written), and commands C (the program) (Eq 2, Sec 3). Highlight the three colored blocks: scratchpad `0.06,0.65,0.28,0.80`, memory `0.28,0.65,0.49,0.80`, instructions `0.49,0.65,0.71,0.80`.
2. **Pointers = binary positional encodings.** Each column has an appended ±1 vector p_i of dimension log n. The program counter and the data pointers use the same codes. With a high softmax temperature, attention with Q=K on p acts as an addressed lookup (Sec 4.1, Lemma 2), and a ReLU FFN increments the counter (Lemma 1). Highlight the black "pointers" bar: `0.06,0.80,0.71,0.86`.
3. **A fixed, hand-set Transformer.** These are standard layers, f(X) = Attn(X) + W2 ReLU(W1 Attn(X) + b1) + b2 (Eq 1a–1b), with every weight matrix given explicitly. SUBLEQ needs 9 layers and 2 heads (Lemma 4). Highlight the Transformer box and the up-arrow: `0.02,0.08,0.75,0.64`.
4. **One pass = one instruction.** The cycle is Read Command → Read Data → Subtract (or general f_m) → Write → If-Goto (Sec 5.1 Steps 1–5, plus Step 6 error-correction). Switch to Fig 5 and reveal its boxes left to right: `0.03,0.20,0.19,0.85` | `0.22,…,0.38` | `0.41,…,0.57` | `0.61,…,0.77` | `0.80,…,0.96` (same y-range).
5. **Close the loop.** The output becomes the next input. Algorithm 1 is `for i = 1:T do X ← TF(W; X)`, analogous to CPU clock cycles. Highlight the black return arrow on Fig 1: `0.72,0.18,0.93,0.84`.
6. **Depth is constant, and program length becomes loop count.** "the depth of the looped transformer itself does not scale with the size of the program" (Sec 5.1), while total run time scales with the program's lines/steps. Halting works through an EOF instruction whose jump target is itself, so the state freezes (Step 7). Show the whole of Fig 1: `0.00,0.00,1.00,1.00`.

Equation vehicle: FLEQ (Eq 8, Theorem 2): `mem[c] = f_m(mem[a], mem[b]); if mem[flag] ≤ 0 goto instruction p`. Given M function blocks T_1..T_M, a looped Transformer with **9 + max_i l_i layers**, Σ_i h_i heads and width O(Md + log n) runs T FLEQ instructions in T loops (Theorem 2).

## Key measured results
There are no empirical measurements. Every "result" is a constructive theorem: a size bound proved on paper.

1. **Construction sizes (Table 1, Sec 1)**
   - Measurement (proved sizes): SUBLEQ 9 layers / 2 heads (Lemma 4). Matrix inversion 13 / 1 (Lemma 12). Power iteration 13 / 1 (Lemma 13). SGD 13 / 1 (Lemma 15). Width ranges from O(log(input length) + embedding dim) up to poly(1/error) for arbitrary losses (Table 1 caption).
   - Claim: "There exists a looped transformer with less than 13 layers that can emulate a general purpose computer … calculator … linear algebra … SGD on neural networks" (Theorem 1, informal).
2. **OISC universality (Lemma 4, Sec 5.1; App C)**
   - Measurement: 9 layers, 2 heads, width O(log n + N) for N-bit integers in [−2^{N−1}+1, 2^{N−1}−1].
   - Claim: the network executes any SUBLEQ program. Their restricted SUBLEQ (memory kept separate from instructions) is still Turing complete given infinite memory (footnote 2, App C).
3. **Calculator (Theorem 4, Sec 7)**
   - Measurement: 12 layers, m heads, width O(log n) for add, sub, mul, inverse, sqrt and percentage. The inverse is accurate to O(1/√m) and sqrt to O(1/m), on bounded operand ranges.
   - Claim: one network runs arbitrary calculator programs such as Algorithm 3, √(1/(((a+b)−c)·d))/100.
4. **Size vs a trained model (Sec 8, 30×30 matrix transpose)**
   - Measurement: their construction uses 1 layer, 1 head, width 168. Charton (2021)'s trained Transformer uses 1 layer, 8 heads, width 256.
   - Claim: their hand-built networks are "comparable" in size to trained ones.

## Limitations the authors state
- The constructions share "no similarities with how real-world language models are trained", so any link to GPT-3's internal subroutines "should be taken with caution" (Sec 1).
- Softmax read/write introduces error that must be controlled by temperature λ, and a dedicated ReLU layer cleans it up (Sec 4.2, Sec 5.1 Step 6). The errors as a function of constants and temperature are left "in future work" (Sec 8).
- Width grows as log n because of the binary positional codes (Sec 5.1, "Can we avoid the logarithmic width scaling?").
- Arbitrary losses or activations need poly(TD) heads (Remarks 4 and 6). Backprop on deeper networks needs proportionally more loop cycles (Sec 9).
- The design gives each function its own block, which "may not be the most efficient" (Sec 5.2).

## Open questions (authors, Sec 10, and for the talk)
- Can gradient descent *find* these looped programs, using input–output pairs or internal-representation supervision?
- Can these modules be fused with pretrained LMs, driven by natural-language commands, or distilled into larger nets?
- Robustness at finite precision is not quantified.

## Takeaway (slide "Remark")
One small fixed-weight Transformer becomes a general-purpose computer when it runs one instruction per pass and its output is fed back as input. Loop iterations, not layers, pay for program length.

## Verification notes
- Internal inconsistency on depth: the Abstract says "a looped, 13-layer transformer", Theorem 1 says "less than 13 layers", Sec 1 says "smaller or equal to thirteen", and Table 1 lists 13. Use "≤ 13 layers" on slides.
- Vault note vs paper: the numbers match. The vault's framing ("before this, every Turing-complete construction needed depth ∝ program length") overstates the paper. The paper criticizes RASP/Tracr and the ICL-as-GD constructions for scaling with program length or iteration count. For the Turing-machine constructions (Pérez et al.; Wei et al.), it criticizes high/infinite precision and the lack of task-specific programmability, and notes that they already use "recursion around attention layers" (Sec 1–2).
