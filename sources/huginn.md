# Huginn: Recurrent-depth latent reasoning (Geiping et al., 2025)

**Citation line (slide footer):** Geiping, McLeish, Jain, Kirchenbauer, Singh, Bartoldson, Kailkhura, Bhatele, Goldstein, "Scaling up Test-Time Compute with Latent Reasoning: A Recurrent Depth Approach", arXiv 2025 (arXiv:2502.05171)
Short form: Geiping et al., "Scaling up Test-Time Compute with Latent Reasoning: A Recurrent Depth Approach", arXiv 2025, arXiv:2502.05171
Source checked: arXiv v2 (17 Feb 2025), 37 pp. The arXiv page lists no venue. Later conference acceptance: [unverified].
Model: huggingface.co/tomg-group-umd/huginn-0125. Code: github.com/seal-rg/recurrent-pretraining (p.1).

## Problem & gap
- Mainstream test-time scaling = post-train on long CoT so the model "verbalizes" intermediate steps. The authors argue that projecting expensive internal reasoning down to one verbalized token at a time "appears wasteful" (Sec 1). CoT also needs bespoke demonstration data and long context windows (Sec 2).
- Huginn instead runs a recurrent block in depth. The model iterates a hidden state rather than writing tokens, so it "unroll[s] to arbitrary depth at test-time" (Abstract). Prior looped/universal transformer work was theory or small scale (Sec 8). This paper trains one at 3.5B params / 800B tokens.
- **Left open (picked up later):** one proof-of-concept run with no LR cooldown (Sec 5.1, 10). Adaptive depth is only a zero-shot KL heuristic (Sec 6.1), with no learned exit or halting. Post-training (RL, compressing the recurrence, internalizing CoT) is listed as future work (Sec 9). These are the gaps later looped-LM papers address.

## Core mechanism: reveal sequence on Fig 2 (PDF p.3)
Figure file: `figures/huginn-fig2.png` (crop excludes the caption). Bboxes are fractions (x0,y0,x1,y1) of that PNG.
Equations (Sec 3.1, unnumbered): `e = P(x)`; `s0 ~ N(0, σ² I_{n·h})`; `s_i = R(e, s_{i-1}) for i ∈ {1..r}`; `p = C(s_r)`.

1. **Prelude embeds once.** P (blue) maps tokens ("Hello") into latent space with a few layers, giving e. Highlight: "Hello" → P box, bbox (0.03, 0.05, 0.25, 0.30).
2. **Start from noise, not from the input.** s0 is drawn randomly from N(0, σ²I). This plus input injection promotes *path independence*, i.e. convergence that does not depend on the initial state (Sec 3.1, citing Anil et al. 2022). Highlight: N(0,σ²I) label and s0 arrow, bbox (0.13, 0.33, 0.29, 0.62).
3. **One shared core, run r times.** The same green block R (4 layers in Huginn) updates s_i. Each pass adds depth without adding parameters, so r=32 gives effective depth 2+4·32+2 = 132 layers (Sec 3.2). Highlight: the R → R → … → R chain, bbox (0.29, 0.32, 0.69, 0.62).
4. **Re-inject e at every step.** The dashed arrows carry e into every R. Inside R, an adapter A: R^{2h}→R^h concatenates [s_i, e] (Sec 3.2). The rationale is the gradient-descent analogy: the data must enter every step, or the fixed point depends only on boundary conditions (Sec 3.1). Highlight: dashed "e" arrows, bbox (0.23, 0.08, 0.66, 0.36).
5. **Coda decodes the final state.** C (red) un-embeds s_R and outputs next-token probabilities p ("World"). Highlight: s_R arrow → C → "World", bbox (0.69, 0.05, 0.94, 0.45).
6. *(optional)* **Legend: prelude / recurrent / coda; dashed = injection, solid = residual stream.** Highlight: bbox (0.14, 0.62, 0.86, 0.90).

**Why prelude/coda (author-stated, Sec 3.1):** analyses of fixed-depth LLMs show the "initial and the end layers … are noticeably different, whereas middle layers are interchangeable and permutable." So only the middle is looped.
> Storyline check: the course note says naive looping was hard to train because each pass must play every role. The paper does not test that directly. There is no ablation removing the prelude/coda. The training failures it does document come from norms and initialization (Sec 4.3, Fig 5; see below). Present the "every role" framing as our motivation, not the paper's finding.

### Training recipe (Sec 3.3, Sec 4; figure `figures/huginn-fig3.png`, Fig 3, p.4)
- **Random iteration count per sequence:** the loss is `L(θ) = E_x E_{r~Λ} L(m_θ(x,r), x′)`. Λ is a log-normal Poisson: `τ ~ N(log(r̄) − ½σ², σ)` (Eq 1), `r ~ P(e^τ) + 1` (Eq 2), with σ = ½. Huginn uses r̄ = 32. Fig 3 shows a mean of 33.0, median 29.0 and mode 24.0, with a heavy tail out to ~150.
- **Truncated backprop:** gradients flow through only the last k = 8 iterations, so memory and backward cost do not depend on r. The prelude still gets gradients every step because e is injected at every iteration (Sec 3.3).
- **Locked-step sampling:** one r per micro-batch, synchronized across workers (Sec 4.1).
- **Shape:** (l_P, l_R, l_C) = (2, 4, 2), h = 5280, 55 heads × 96. That is ≈1.5B params in prelude+coda, 1.5B in the core and 0.5B in the tied embedding (Sec 4.1). Sandwich RMSNorm in every layer (Sec 3.2).
- **Scale:** 4096 AMD MI250X GPUs on Frontier; 52–64 TFLOP/s per GPU; global batch 16M tokens (Sec 4.2). The paper gives the token count as 800B in the abstract and Sec 5, and as 795B in Sec 4.2.
- **Failed runs (Fig 5, p.6):** Bad Run 1: token-wise hidden-state correlation went to 1.0 (representation collapse). Bad Run 2: validation perplexity was the same at 1 and 32 recurrences, meaning the model learned to ignore s. Main run: sandwich norm restored and peak LR lowered to 4×10⁻⁵ (Sec 4.3).
  Note: Sec 4.1 states the optimizer η = 5×10⁻⁴, and Sec 4.3 says the main run used a peak LR of 4×10⁻⁵. This is an internal inconsistency in the paper.

## Key measured results
1. **Recurrence beats a same-recipe fixed-depth twin, most on hard tasks.** Table 4, p.9.
   - Measurement: at 180B tokens, fixed-depth baseline vs. recurrent model at r = 32: GSM8K CoT (strict/flexible) 1.82/2.20 vs 9.02/10.24; ARC-C 26.96 vs 29.18; SciQ 73.20 vs 80.60. At 800B tokens, r = 32 vs r = 1: GSM8K CoT 34.80/42.08 vs 0.00/0.00; ARC-C 38.23 vs 24.06.
   - Claim: the recurrent model is "already 5 times better" on GSM8K at 180B. Its r = 1 performance barely changes from 180B to 800B, so "further improvements … [are] encoded entirely into the iterations of the recurrent block" (Sec 5.3).
2. **Test-time scaling curves saturate at task-dependent depths.** Fig 1 (p.1), Fig 7 (p.8), Table 1 (p.7). Files: `huginn-fig1.png`, `huginn-fig7.png`.
   - Measurement: Table 1, zero-shot, r = 4 → 32: ARC-C 27.99 → 38.23; HellaSwag 43.46 → 65.21; MMLU 23.39 → 31.38. Fig 1's top axis converts r into "materialized parameters": 3.6B at r=1, 52.6B at r=32, 103B at r=64. Fig 7: HellaSwag is near its peak by r = 8 (caption); GSM8K CoT and HumanEval keep rising to r ≈ 32 (my graph reading).
   - Claim: performance improves "up to a computation load equivalent to 50 billion parameters" (Abstract). Easier tasks saturate sooner (Fig 1 caption; Sec 5.3).
   - Caveat: Fig 1's GSM8K CoT plateau reads ≈47%, above Table 2's 42.08 (r=32). The caption does not say which checkpoint was used. The EMA model reaches 47.23% flexible at r = 64 (Sec 5.4), but whether Fig 1 uses it is [unverified].
3. **More context → more useful iterations.** Fig 9, p.9; file `huginn-fig9.png`.
   - Measurement: ARC-C (un-normalized acc.) saturates around 8–12 iterations at 0-shot, ≈20 iterations at 1-shot, and ≈32 iterations at 25–50-shot (Sec 5.3).
   - Claim: the model "uses more recurrence to extract more information from the additional few-shot examples" (Fig 9 caption).
4. **Zero-shot per-token adaptive compute.** Fig 10, p.10; file `huginn-fig10.png`; Table 6, p.24.
   - Measurement: the model exits when the KL between successive steps is below 5×10⁻⁴. On the first 50 questions per MMLU category, mean steps to exit (default → continuous-CoT warm start): HS math 12.7 → 11.9; philosophy 14.6 → 13.5; logical fallacies 15.6 → 14.4; moral scenarios 16.2 → 16.0. MT-Bench (Table 6): baseline 32 it. 5.662, 64 it. 5.693, KL exit 5.562, KV-cache budget 4 5.856. Std. errors are ≈0.39 and the differences are not statistically significant.
   - Claim: compute varies by category ("on average 3.5 steps more on moral scenarios" than HS math). Early exit and cache sharing come "for free" without training. Continuous CoT (warm-starting s0 from the previous token's s_r) cuts 1–2 steps (Sec 6.1–6.3).
   - Note: Sec 6.1 quotes the standard MT-Bench score as 5.63, while Table 6 lists 5.662 (32 it.) and 5.693 (64 it.). This is a minor internal mismatch.

### Emergent latent behaviours (Sec 7; for "think by iterating hidden states")
- **Fig 11 (p.11, `huginn-fig11.png`):** heat map of ‖s_i − s*‖ per token (rows) over iterations 0–64 (columns), with s* computed at r = 128, on an unsafe prompt. Convergence is token-specific. The key words "really wrong-ed" converge slowest; "school" oscillates.
  Reveal boxes: whole plot (0.11, 0.02, 0.87, 0.94); "really/wrong" rows (0.01, 0.56, 0.87, 0.62); "school" row (0.01, 0.53, 0.87, 0.56); colorbar (0.92, 0.14, 0.99, 0.85).
- **Fig 12 (p.12, `huginn-fig12.png`):** PCA (PC1–6) trajectories of single tokens; dark→bright = iteration order; red × = center of mass.
  Reveal: (a) "deeper" converges to a fixed point, top row (0.00, 0.00, 1.00, 0.33). (b) "3" from a GSM8K question traces an **orbit**, middle row (0.00, 0.345, 1.00, 0.665). (c) "wrong" acts as a **slider**, drifting in one direction, bottom-middle panel (0.34, 0.68, 0.65, 1.00).
  Authors' reading: a slider "could [be used] to count how many iterations have occurred" (Sec 7). Orbits on numbers resemble the periodic arithmetic features of Nanda et al. 2022 (Sec 7). Fig 16 (p.27): "rotating the number three".
- **Path independence:** trajectories from several random s0 follow the same orbits and fixed points (Sec 7; App. Fig 22–25).
- These are qualitative observations on a handful of prompts; no quantitative metric is reported.

## Limitations the authors state
- Proof-of-concept with a single large run (Sec 10). The checkpoint saw only 47,000 steps on a "broadly untested mixture", and the LR was "never cooled down" (Sec 5.1). The data mixture was not ablated (Sec 4.1).
- Fewer memorized facts: OBQA closed 38.2 → open 49.2 when given the relevant fact (Table 5; Sec 5.3). Table 1 lists OBQA at r=32 as 38.80, which does not match Table 5's 38.2.
- Oversight: latent reasoning "comes with costs in model oversight" compared with human-readable CoT (App. A, "Potential Implications").
- Not studied: linear attention, multiple recurrent stages, MoE combination (Sec 9). Self-speculative decoding is described but no speed-up numbers are reported (Sec 6.4).
- The non-recurrent baseline exists only at 180B tokens (Sec 4.2, Table 4), so there is no matched comparison at 800B.

## Open questions
- Can post-training (RL on graded-difficulty data, distilling CoT into recurrence, compressing r) sharpen latent reasoning (Sec 9)?
- How should adaptive depth be learned rather than set by a KL threshold, and what does early exit cost on hard reasoning, as opposed to MT-Bench?
- Do orbits and sliders carry causal computation, or are they just correlates? Can latent trajectories be audited as easily as CoT text?

## One-sentence takeaway (slide Remark)
Huginn shows a 3.5B model can "think longer" by looping one shared core block on a hidden state. With random-depth training and truncated backprop, accuracy on reasoning tasks like GSM8K rises with test-time iterations (Table 4: 0.00 → 42.08 flexible from r=1 to r=32) without writing a single extra token.
