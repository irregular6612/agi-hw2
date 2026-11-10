# Looped Transformers are Better at Learning Learning Algorithms (slug: `yang`)

Source PDF: `papers/yang.pdf` (arXiv v3, 16 Mar 2024; header "Published as a conference paper at ICLR 2024"). Code: github.com/Leiay/looped_transformer.

## Citation line
Yang, Lee, Nowak, Papailiopoulos, "Looped Transformers are Better at Learning Learning Algorithms", ICLR 2024 · arXiv:2311.12424

## Problem & gap
- **Targets:** Garg et al. (2022) trained a 12-layer GPT-2 to do in-context regression. However, "the absence of an inherent iterative structure in the transformer architecture presents a challenge in emulating the iterative algorithms" such as gradient descent (Abstract). Giannou et al. (2023) showed looped Transformers *can* run such algorithms with hand-set weights. It remained open whether a looped decoder can be *trained from scratch* to do so, and how (Sec 1).
- **Fix:** Loop a 1-layer GPT-2 block, re-inject the prompt at every iteration, and train with a loss truncated over the last T of b iterations.
- **Left open:** The learned solver has an error floor and only works in-distribution (Sec 6). Loop count b is a hand-tuned hyperparameter, while adaptive or token-level looping is only suggested (Sec 6, citing Dehghani et al.). Compute (FLOPs) is not compared. The expressiveness of a looped *decoder* is left as future work (Sec 6).

## Core mechanism: reveal steps on Fig 1 (PDF p. 2) plus Eq 1 (PDF p. 4)
Figure file: `figures/yang-fig1.png` (1089×339).

1. **Task: in-context regression.** The prompt P = (x_1, y_1, …, x_k, y_k, x_test) goes in, ŷ_test comes out, and the model never sees w (Sec 3). Highlight the "Problem Setup" box: `0.00,0.00,1.00,0.40`. Zoom on the prompt/output solver: `0.63,0.02,0.97,0.39`.
2. **Baseline: deep Transformer ≈ closed form.** A 12-layer Transformer (9.48M params) learns roughly the least-squares solution ŵ = (XᵀX)⁻¹Xᵀy in one forward pass. Matrix inverse is hard to learn (Sec 1). Highlight the left column (Transformer plus closed-form): `0.00,0.41,0.48,0.99`.
3. **This work: one block, looped, with input injection.** Y_{t+1} = M(Y_t + P) (Sec 4.1). The ⊕ re-adds the prompt at every iteration. A 1-layer block (D=256, h=8) has 0.79M params (Sec 4). Highlight the "Looped Transformer" panel: `0.50,0.41,0.99,0.73`, then the ⊕ node: `0.68,0.52,0.74,0.63`.
4. **Analogy: loop iteration ≈ GD step.** w_{t+1} ← w_t − η(XᵀXw_t − Xᵀy) needs only matrix multiplication, applied repeatedly. Highlight the right-bottom box: `0.50,0.75,0.99,0.99`.
5. **Training recipe (Eq 1, not in the figure).** Y_t(P^i|θ) = M_θ(M_θ(⋯M_θ(Y_0^i + P^i) + P^i)⋯ + P^i), with Y_0 = 0. The objective is min_θ E_P [ 1/(b−b_0) Σ_{t=b_0}^{b} 1/(k+1) Σ_{i=0}^{k} ℓ(Y_t(P^i|θ), f(x_{i+1})) ], with b_0 = max(b−T, 0). Only the last T iterations are supervised, in the spirit of truncated BPTT. Linear regression uses b=20, T=15 (Sec 4.2). Note that the printed Eq 1 omits the loss symbol ℓ; the squared error ℓ is defined in Sec 3.

## Key measured results
All results are in-context regression with d=20 and k=40 unless noted. Errors are normalized squared error, measured on 1280 prompts with 90% CIs over 1000 bootstraps (Sec 5.1).

1. **1/12 of the parameters, same accuracy (Fig 2, PDF p. 3; Sec 4, 5.2)**. Figure file: `figures/yang-fig2.png`. Panels: left `0.00,0.00,0.36,1.00`, right `0.38,0.00,0.71,1.00`, legend `0.72,0.25,0.99,0.62`.
   - Measurement: looped L=1 (0.79M params) vs standard L=12 (9.48M params), both with D=256 and h=8. In Fig 2-right, the looped, Transformer and least-squares curves overlap across 0–40 in-context examples. Fig 2-left: error drops to ~10⁻³ by ~20–30 loops and stays flat to 100 loops (my reading of the plot).
   - Claim: the looped model "matches the performance of a standard 12-layer transformer … while using only 1/12 of the transformer's parameters", and it reaches a stable fixed point beyond the trained loops.
2. **Input injection is what makes looping stable (Fig 3, PDF p. 5; Sec 4.1)**. Figure file: `figures/yang-fig3.png` (420×324). The dashed line (x≈0.35) marks the trained loop count, apparently b=20, though the caption does not say so [unverified]. The blue weight-tying curve sits at `0.20,0.15,1.00,0.80`.
   - Measurement: without injection (Y_{t+1} = M(Y_t), "weight-tying"), error bottoms out near 10⁻³ at the trained loop count, then climbs toward ~10⁰ by 100 loops. With injection it stays at ~10⁻³. These values are my reading of the plot.
   - Claim: "the weight-tying transformer will quickly diverge after the trained loop iterations."
3. **Sparse linear regression beats the 12-layer model (Fig 10a, PDF p. 10; Sec 5.4; b=20, T=10, s=3)**. Figure file: `figures/yang-fig10.png`, panel (a) `0.00,0.00,0.33,1.00`.
   - Measurement: at 40 in-context samples, the errors are Lasso 1.32e-04, Least Squares 8.21e-14, looped 6.12e-04, Transformer 0.0017. With <10 samples, looped is below Lasso. On decision trees (b=70, T=15) and 2-layer ReLU NNs (b=12, T=5), looped ≈ Transformer (Fig 10b `0.34,0,0.66,1`, Fig 10c `0.67,0,1,1`).
   - Claim: looped "matches or even surpasses" the Transformer at 1/12 the parameters. Here "outperform" refers to the trend versus number of samples, not final precision (Sec 5.4). The gain is conjectured to come from a bias toward simpler/sparser solutions.
4. **Effective depth > layer count (Fig 7-left, Sec 5.3; b=30, T=15)**.
   - Measurement: a 1-layer looped model needs "roughly 20 iterations" to match an 8-layer Transformer. A looped b=12 (same effective depth as 12 layers) "fails to replicate" the 12-layer model (Sec 4.2).
   - Claim: looped and standard Transformers learn different per-layer representations. Probing (Fig 8) shows the looped model steadily refining its decoding of Xᵀy and w_OLS, whereas the standard model peaks around layer 10.

## Limitations the authors state
- There is an error floor, and out-of-distribution performance is limited. The model "fails to identify an actual algorithm that generalizes to any input distribution" (Sec 6).
- OOD scale shift: with x = 3z, the looped model underperforms the unlooped one (Fig 6c, Sec 5.2).
- b and T need hyperparameter tuning. Small b diverges after the trained iterations, and large T makes training unstable (Sec 4.2, 6). Training cost grows with b (forward unrolls) and T (memory) (Sec 6).
- Regularization (weight decay, gradient clipping, mixed precision) was deliberately omitted for a fair comparison with Garg et al. (Sec 6).

## Open questions (for the talk)
- Compute is not free. Only parameters are compared; b=20 loops of 1 layer are 20 layer-passes vs 12, and FLOPs are never reported.
- Can the loop count be chosen per input or per token, instead of tuning b per task? The authors suggest this (Sec 6).
- Does the "simplicity bias" help or hurt beyond toy function classes? (OpenML results are in App G and were not checked here.)

## Takeaway (slide "Remark")
A single Transformer layer, looped with the prompt re-injected each step and trained on its last T iterations, learns in-context regression as well as a 12-layer model with 1/12 the parameters. It converges to a fixed point rather than drifting when looped beyond training.

## Verification notes
- Inconsistencies inside the paper:
  - The Fig 2 caption says "trained for 30 loop iterations", but Sec 5.2 says Fig 2-right uses b=20, T=15.
  - The Abstract says "less than 10% of the parameter count", while the figures say 1/12. Both fit 0.79M/9.48M ≈ 8.3%.
  - Sec 5.4 gives sparse-linear k=100, but App B gives k=40, and the Fig 10a x-axis ends at 40.
  - Sec 5.2 lists OOD case (c) as "different orthants", but Fig 6(c) is the x=3z scale shift. The orthant case is in the appendix.
  - The Fig 5 caption says k=21, the text says k=20.
- Vault note vs paper: the numbers match, and the vault already flags the inconsistencies above. No disagreements found.
