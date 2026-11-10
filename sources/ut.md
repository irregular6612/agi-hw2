# Universal Transformers (slug: `ut`)

Source PDF: `papers/ut.pdf` (arXiv v3, 5 Mar 2019; header "Published as a conference paper at ICLR 2019").

## Citation line
Dehghani, Gouws, Vinyals, Uszkoreit, Kaiser, "Universal Transformers", ICLR 2019 · arXiv:1807.03819

## Problem & gap
- **Targets:** The Transformer is a fixed stack of distinct layers, so it "foregoes RNNs' inductive bias towards learning iterative or recursive transformations". It fails on simple tasks such as copying, or on logical inference when inputs are longer than those seen in training (Abstract, Sec 1). Its number of *sequential* operations is fixed by depth, so with finite precision it cannot be computationally universal (App B).
- **Fix:** Apply one shared block (self-attention + transition) repeatedly over depth. Optionally, let each position decide when to stop with ACT.
- **Left open:** All of UT's evidence is empirical. There is no explicit construction showing *what* a looped block can compute (Giannou et al. 2023 provide one) and no study of the training recipe needed to make looping stable beyond the trained depth (Yang et al. 2024). Length generalization stays mostly unsolved: seq-acc on Addition is 0.02 (Table 4).

## Core mechanism: reveal steps on Fig 1 (PDF p. 2)
Figure file: `figures/ut-fig1.png` (1212×345). Bounding boxes are fractions of that image (x0,y0,x1,y1).

1. **Per-position states.** Each input symbol i has a vector h_i^t, and h^0 is the symbol embedding (Fig 1 caption). Highlight the left column h_1^t…h_m^t with its "Per Position States" label: `0.00,0.15,0.10,0.80`.
2. **Self-attention mixes all positions.** Every position attends to every other position's state from the previous step (Eq 2–3, 5), shown by the crossing arrows. Highlight the arrows and the first Self-Attention column: `0.09,0.20,0.29,0.78`.
3. **Shared transition function.** A position-wise FFN or separable conv is applied to each attention output, and the result becomes h^{t+1}: H^t = LayerNorm(A^t + Transition(A^t)) (Eq 4). Highlight the first Transition column plus h^{t+1}: `0.30,0.20,0.53,0.78`.
4. **Same block again (recurrence in depth).** Step t+1 → t+2 reuses the *identical* block. The "time" axis counts refinement steps, not tokens. Highlight the second step plus the Time arrow: `0.53,0.20,1.00,0.95`.
5. **Parameters tied across positions and time steps.** This is the bracket on top. With T fixed, UT equals a T-layer Transformer with tied weights. With T=1, it is a vanilla Transformer (Sec 4). Highlight the bracket: `0.14,0.00,0.92,0.22`.
6. **(Caption / Sec 2.2) Dynamic halting.** Using ACT, each position gets its own number of steps T. A halted position's state is copied forward until all positions halt or a max step count is reached (Sec 2.2, App C). This is not drawn in Fig 1, so show the whole figure plus the caption text: `0.00,0.00,1.00,1.00`.

Equation vehicle (Sec 2.1): A^t = LayerNorm((H^{t-1}+P^t) + MultiHeadSelfAttention(H^{t-1}+P^t)) (Eq 5), H^t = LayerNorm(A^t + Transition(A^t)) (Eq 4). Here P^t is a fixed sinusoidal *position + time-step* embedding (Eq 6–7), so the shared block knows which step it is on.

## Key measured results
1. **bAbI QA (Table 1, Sec 3.1)**: average error %, with failed tasks (>5% error) out of 20 in parentheses. Best of 10 runs, selected on validation.
   - Measurement: 10K train-single: Transformer 15.2 (10/20), UT 0.23 (0/20), UT+ACT 0.21 (0/20). 10K train-joint: 22.1 (12/20) / 0.47 (0/20) / 0.29 (0/20). 1K train-joint: 26.8 (14/20) / 8.50 (8/20) / 7.78 (5/20).
   - Caveat (App E): averaged over all 10 seeds (presumably the UT+ACT model, since the best-seed rows in App E match it), the errors are 0.73 ±0.89 / 1.12 ±1.62 / 6.34 ±3.32 / 11.21 ±6.65 for 10K-single / 10K-joint / 1K-single / 1K-joint. The paper labels the spread "±var".
   - Claim: UT and UT+ACT reach state of the art on all four bAbI settings. Footnote 2: the vanilla Transformer "always overfits" here.
2. **Ponder time tracks reasoning hops (Sec 3.1, Fig 3, PDF p. 6)**. Figure file: `figures/ut-fig3.png`.
   - Measurement: mean ponder steps on test data are 3.8±2.2 for tasks needing 3 supporting facts, 3.1±1.1 for 2 facts, and 2.3±0.8 for 1 fact. In the Fig 3 example ("Where was the apple before the bathroom?"), most facts halt at step 1. The high bars are "John grabbed the apple" (4), "John journeyed to the bathroom" (5), "John discarded the apple there" (4), and the question itself (3). These bar values are my reading of the plot.
   - Claim: the model adjusts its step count to the number of supporting facts needed and learns to ignore irrelevant facts.
3. **LAMBADA (Table 3, Sec 3.3)**: LM perplexity, with accuracy in parentheses.
   - Measurement: test perplexity is 7321 (0.0) for the Transformer, 5174 (0.0) for the LSTM, 319 (0.17) for UT with 6 fixed steps, and 142 (0.19) for UT+ACT. UT+ACT averaged 8.2±2.1 steps. Fixed UTs with 8 and 9 steps reach test 202 and 239, which beats 6 steps but not ACT. Reading-comprehension test accuracy: UT+ACT 0.5625 vs the previous best 0.5569.
   - Claim: state of the art. The ACT gain is not explained by step count alone, and the authors "believe" halting acts as a regularizer. This is their hypothesis, not a tested result.
4. **Algorithmic length generalization (Table 4, Sec 3.4)**: train on length 40, test on length 400, no curriculum. Results are char-acc / seq-acc.
   - Measurement: Copy: Transformer 0.53/0.03, UT 0.91/0.35. Reverse: 0.13/0.06 vs 0.96/0.46. Addition: 0.07/0.0 vs 0.34/0.02. Neural GPU (trained with a special curriculum) gets 1.0 on all.
   - Claim: "UT outperforms both LSTM and vanilla Transformer by a wide margin". Note, though, that seq-acc stays far from solved.
   - Also (Table 7, Sec 3.6): WMT14 En-De BLEU is 28.9 for UT base vs 28.0 for Transformer base at the same parameter count. This UT run used no ACT. Compute/FLOPs are not reported.

## Limitations the authors state
- The paper has no dedicated limitations section. The admissions below are scattered through it.
- ACT "marginally degraded results on MT" (Sec 1). No number is given.
- Neural GPU's perfect algorithmic results relied on curriculum training that UT did not use (Sec 3.4, Table 4 note).
- Turing-completeness holds only "under certain assumptions": sufficient memory and a step count that grows with input length (Abstract, Sec 4, App B). The argument is a reduction sketch (UT → Neural GPU), not a formal proof.

## Open questions (for the talk)
- Can looping deliver real length generalization? Addition seq-acc is 0.02 at 10× length.
- What is the compute cost? Parameters are matched, but the extra FLOPs from repeated steps are never reported.
- Is halting a regularizer, or just extra depth? Only one comparison (fixed 8/9 steps) supports the regularizer reading.
- Seed sensitivity: the headline bAbI numbers are best-of-10 runs (App E).

## Takeaway (slide "Remark")
Tying one Transformer block's weights and applying it T times turns depth into a loop count. That brings back RNN-style iterative bias without adding parameters, and with ACT each token can "think" for a different number of steps.

## Verification notes
- Every number above was checked against the arXiv v3 PDF. The Fig 3 bar heights are read off the plot.
- Paper erratum: Sec 3.5 says "Tables 5 and 6 present … program evaluation and memorization tasks, respectively", but Table 5 is memorization and Table 6 is program evaluation. On Table 6 Addition, UT and Transformer tie at 1.0/1.0, so "outperforms … in all program evaluation tasks" does not hold for that row.
- Vault note vs paper: they agree. The vault says the per-fact Fig 3 labels are hard to read. At 3× render they are legible, and the long-ponder facts are the apple-related ones.
