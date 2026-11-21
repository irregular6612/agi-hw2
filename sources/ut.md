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

## ACT in UT and bAbI setup (checked 2026-11-21)

Sources re-downloaded from arXiv: UT = arXiv:1807.03819 (v3, 23 pp.), ACT = Graves 2016, arXiv:1603.08983 (19 pp.). Page numbers are PDF pages.

### How UT uses ACT
- **Sec 2.2 "Dynamic Halting" (pp. 4–5), the core passage:** "we also add a dynamic ACT halting mechanism to each position (i.e. to each per-symbol self-attentive RNN; see Appendix C for more details). Once the per-symbol recurrent block halts, its state is simply copied to the next step until all blocks halt, or we reach a maximum number of steps. The final output of the encoder is then the final layer of representations produced in this way."
- Fig 2 caption (p. 4): "The Universal Transformer with dynamic halting determines the number of steps T for each position individually using ACT (Graves, 2016)."
- **App C (p. 14), Listings 1–2 (TensorFlow):** the halting probability is `p = dense(state, 1, activation=sigmoid, use_bias=True)`, computed per position from that position's state. Halting probabilities, remainders, n_updates and the previous state all start at zero. The threshold is "a scalar threshold between 0 and 1 (a hyper-parameter)". The while-loop runs while *any* position has `halting_probability < threshold` and `n_updates < max_steps` (`tf.reduce_any`). When a position halts, its remainder is `1 − halting_probability`. The update weight is `p` while the position is still running, the remainder on the step it halts, and 0 afterwards. Then `new_state = transformed_state * w + previous_state * (1 − w)`.

**Same as Graves:** sigmoid halting unit, a cumulative probability compared against a threshold, a remainder on the final step, a hard cap on steps (Graves's M, Eq 13), and a probability-weighted state rather than a sampled one.

**Differences UT states:**
1. **Axis.** ACT runs per *position* over *depth* (refinement steps), with every position updated in parallel. Graves runs per *input time step* of an RNN (Sec 2.2, Fig 2 caption).
2. **Copying.** A halted position's state is "simply copied to the next step until all blocks halt" (Sec 2.2). The loop stops only when every position has halted or max_steps is reached (Listing 1).
3. **Threshold.** UT calls it a generic hyper-parameter in (0,1) (App C). Graves sets it to 1 − ε with ε = 0.01. UT does not report its value or max_steps for any task.

**Differences visible only in the code or by omission (my reading, not stated by UT):**
4. **No ponder cost in the paper.** UT never mentions Graves's ponder cost P(x) or the time penalty τ (Eq 10–12). The only hint is Sec 3.3 (LAMBADA, p. 7): halting "may act as a useful regularizer … via incentivizing a smaller numbers of steps for some of the input symbols". Whether the tensor2tensor code adds a ponder loss is [unverified].
5. **How states are combined.** Listing 2 combines states by recursive interpolation, `new = w·transformed + (1−w)·prev`. Graves uses the plain weighted sum s_t = Σ p_n s_t^n (Eq 9). After two steps, UT gives w2·s2 + (1−w2)·w1·s1, which is not w1·s1 + w2·s2. [my derivation from Listing 2; the paper does not comment]
6. **What "copied" means.** In Listing 2, the `state` passed to the next iteration is `transformed_state` for *all* positions. Only the accumulated output (`new_state`) stays frozen for halted positions, because w = 0. So "copied" holds for the output accumulator. Halted positions' working states still pass through the shared block. [my reading of Listing 2]
7. **No "first step" flag.** Graves feeds a binary flag x_t + δ_{n,1} so the RNN can tell a new input from repeated computation. UT has no such flag and instead adds a time-step coordinate embedding P^t at every step (Eq 6–7). UT does not present this as a replacement for the flag.

### ACT mechanism (Graves 2016, Sec 2, pp. 3–5)
- Intermediate states (Eq 3): s_t^1 = S(s_{t−1}, x_t^1), and s_t^n = S(s_t^{n−1}, x_t^n) after that. Here x_t^n = x_t + δ_{n,1}, a flag marking the first update. Outputs: y_t^n = W_y s_t^n + b_y (Eq 4). The same S, W_y, b_y are used at every step.
- Halting unit (Eq 5): h_t^n = σ(W_h s_t^n + b_h).
- Number of updates (Eq 7): N(t) = min{n′ : Σ_{n=1}^{n′} h_t^n ≥ 1 − ε}, with ε = 0.01 "for the experiments in this paper". ε exists so that computation can halt after a single update. Without it, at least two updates would be required.
- Remainder (Eq 8): R(t) = 1 − Σ_{n=1}^{N(t)−1} h_t^n.
- Halting probabilities (Eq 6): p_t^n = R(t) if n = N(t), else h_t^n. These sum to 1, so they form a valid distribution.
- Mean-field outputs (Eq 9): s_t = Σ_n p_t^n s_t^n and y_t = Σ_n p_t^n y_t^n. Graves uses this weighted mean instead of sampling.
- Ponder cost (Sec 2.1, p. 5): ρ_t = N(t) + R(t) (Eq 10), P(x) = Σ_t ρ_t (Eq 11), and L̂ = L + τ·P(x) (Eq 12). Here τ is the "time penalty", and the network's behaviour is "quite sensitive" to it. N(t) is non-differentiable, so the gradient flows through R(t).
- Training tricks (Sec 2.1): initialise b_h to a positive value, and cap the steps at M: N(t) = min{M, …} (Eq 13).
- **Figure numbering:** Graves **Fig 1** (p. 4) is the *plain* RNN graph with no halting units. **Fig 2** (p. 4) is the ACT graph with h units.

### Figures cropped
- `figures/act-graves-fig2.png` (1967×1135): Graves Fig 2, "RNN Computation Graph with Adaptive Computation Time". It shows two input steps (t−1, t). Each step has a column of intermediate states s^1…s^N joined by S, a column of outputs y^n via W_y, and a column of halting units h^n via W_h. The y-box and the h-box feed the summed output y_t and the summed state s_t (arrows leaving a box mean sums). s_t passes on to the next input step. Caption from p. 4.
  - Approximate highlight boxes (fractions x0,y0,x1,y1), focusing on step t: intermediate states `0.61,0.17,0.69,0.72`; halting units `0.72,0.17,0.81,0.72`; weighted-sum state s_t `0.68,0.70,0.80,0.86`; output y_t `0.53,0.00,0.77,0.19`; whole step t `0.48,0.00,0.83,1.00`.
- `figures/act-graves-fig1.png` (1128×664): Graves Fig 1, a plain RNN unrolled over two steps. It can serve as the "before" build.
- UT has **no** ACT diagram. App C holds only code (Listings 1–2), so there is no `ut-act-*.png`.

### bAbI setup in UT
- **Dataset (Sec 3.1, p. 5; App D.1, p. 15):** 20 synthetic tasks. Each task asks "to answer a question given a number of English sentences that encode potentially multiple supporting facts". The tasks test reasoning from supporting facts, true/false questions, counting, negation and indefinite knowledge, coreference, time reasoning, positional and size reasoning, path-finding, and motivations (App D.1).
- **1k vs 10k (App D.1):** "two versions of the dataset, one with 1k training examples and the other with 10k examples". The 1k version tests data efficiency.
- **Single vs joint (Sec 3.1; App D.1):** each task trained separately ("train single") or "jointly on all tasks" ("train joint"). App D.1: "the original idea is that a single model should be evaluated across all the tasks (not tuning per task), which is the train joint setup".
- **Input encoding (Sec 3.1):** "we first encode each fact in the story by applying a learned multiplicative positional mask to each word's embedding, and summing up all embeddings. We embed the question in the same way, and then feed the (Universal) Transformer with these embeddings of the facts and questions." So **one position = one sentence (fact)**, and the question is one more position. The sentence vector is a position-masked bag of words, following Henaff et al. 2016.
- **Answer output:** not described in the paper. Whether it is a single answer word predicted by a softmax over the vocabulary, or the decoder is used, is [unverified].
- **Protocol (Sec 3.1):** 10 runs with different initialisations, best chosen on validation. A task "fails" at >5% error (footnote 3). The vanilla Transformer "always overfits" (footnote 2).
- **Fig 3 (p. 6), "Ponder time of UT with dynamic halting for encoding facts in a story and question in a bAbI task requiring three supporting facts".** The x-axis, "Facts and Question", has 38 story sentences plus the question "Where was the apple before the bathroom?" as the last bar. The y-axis, "Ponder time", runs 0–5 and gives the steps per position. Most facts sit at 1. Taller bars: John grabbed the apple (4), John went to the office (3), John journeyed to the bathroom (5), John travelled to the office (3), John discarded the apple there (4), and the question (3). A few distractors reach 2. Bar values and the count of 38 are my reading of the plot. The paper does not say which task id this is; "three supporting facts" matches bAbI task 3 [inferred].
- **Ponder statistics (Sec 3.1, p. 6):** average ponder time over all test positions is 3.8±2.2 for 3-fact tasks, 3.1±1.1 for 2-fact tasks, and 2.3±0.8 for 1-fact tasks. In 3-fact tasks, "many positions halt at step 1 or 2 already and only a few get transformed for more steps".
- **Pointer mismatch:** Sec 3.1 says to see App F "for details" on ponder times, but App F (p. 18 onward) contains only attention visualisations (Figs 5–7). There is no ponder-time detail there. App F also numbers two different figures "Figure 7". [paper erratum]
