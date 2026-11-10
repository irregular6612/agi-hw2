# MoR: Mixture-of-Recursions (source digest)

Source PDF: `papers/mor.pdf` = arXiv 2507.10524**v3** (25 Oct 2025), 38 pp. All page numbers below are PDF pages (1-indexed).

## Citation line (slide footer)
Bae, Kim, Bayat, et al., "Mixture-of-Recursions: Learning Dynamic Recursive Depths for Adaptive Token-Level Computation", NeurIPS 2025, arXiv:2507.10524
- Venue: the arXiv v3 PDF and abstract page print no venue. "NeurIPS 2025" comes from the task brief **[unverified in PDF]**.
- Full first-author list (p.1): Sangmin Bae\*, Yujin Kim\*, Reza Bayat\* (equal contribution), Sungnyun Kim, Jiyoun Ha, Tal Schuster, Adam Fisch, Hrayr Harutyunyan, Ziwei Ji, Aaron Courville†, Se-Young Yun† (KAIST AI, Mila, Google).

## Problem & gap
- **Targets:** Recursive/looped Transformers (UT, Giannou, Yang, Saunshi, Geiping/Huginn) "simply apply a fixed recursion depth to all tokens". Prior adaptive versions use post-hoc early exit, which needs separate training phases that "can degrade performance". Tied weights still keep a **separate KV cache per depth**, so memory and IO do not shrink (§2.1 "Limitations in prior works", p.3).
- **Proposal:** learn a per-token recursion depth with a lightweight router **during pretraining**, and make KV caching depth-aware, inside one architecture (§1, p.2).
- **Leaves open:** whether the router allocates depth by *reasoning* difficulty. All tests are pretraining LM loss and few-shot accuracy at ≤1.7B, with no CoT/reasoning post-training (§7.1). Capacity (top-k) cannot be changed after training (§7.1).

## Core mechanism as reveal steps: Figure 2, PDF p.4
Figure file: `figures/mor-fig2.png` (1335×483 px, caption excluded). Boxes are fractions of that image (x0,y0,x1,y1).
Background, not in Fig 2: all variants use **Middle-Cycle** sharing. First and last layers are unique, and the middle layers form one shared block that is reused N_r times (Table 1 p.3; chosen in §4.1).

1. **One shared block, applied as "Loop 1, 2, 3"**: every token enters the first recursion, and each "Loop" box is the *same* weight block reused.
   Highlight: panel (a) bottom, Loop 1 + its router + the full row of 9 tokens. Box ≈ (0.01, 0.62, 0.24, 0.87).
2. **Expert-choice router = progressive top-k**: at each recursion step a router scores tokens and keeps only the top-k. Only survivors can be picked at the next step ("hierarchical filtering", Eq. 2.1). For N_r=3 the capacities are 3/3, 2/3, 1/3 of tokens (§2.2.1, p.5). Dashed squares are dropped tokens.
   Highlight: panel (a), Loop 2 and Loop 3 with their routers and thinning token rows. Box ≈ (0.01, 0.07, 0.24, 0.62).
3. **Token-choice router = commit once**: a single router decision at the start assigns each token a total depth (1, 2 or 3 loops; top-1 over N_r "experts", Eq. 2.2). There is no causality leak, but loads can be unbalanced and need a balancing loss (Table 2-Left).
   Highlight: all of panel (b). Box ≈ (0.30, 0.17, 0.74, 0.88).
4. **Recursion-wise KV caching**: at each depth only the tokens routed there store KV, and attention is restricted to them (blue cells). KV memory/IO ≈ (N_r+1)/2N_r of vanilla, and attention FLOPs ≈ (k/N_ctx)² (Table 2-Right, p.5).
   Highlight: panel (c), top matrix. Box ≈ (0.81, 0.04, 0.98, 0.47).
5. **Recursive KV sharing (variant)**: KV from the first recursion, which every token passes, is cached once and reused at all deeper steps (purple keys). KV memory is 1/N_r, but KV IO stays at 1× and attention FLOPs are k/N_ctx (Table 2-Right).
   Highlight: panel (c), bottom matrix. Box ≈ (0.81, 0.50, 0.98, 0.88).

## Key measured results

**R1. Main isoFLOP comparison: Table 3, p.6** (360M-base Llama-style, FineWeb-Edu, Middle-Cycle; crop `figures/mor-tab3.png`)
- Measurement: at **16.5e18 FLOPs**, MoR (expert-choice, recursion-wise cache, N_r=2, **167M** non-emb params) gets NLL **2.7511**, few-shot avg **43.1**. Vanilla (**315M**) gets **2.7824 / 42.3**. MoR trained on **27B** tokens and Vanilla on **20B** in the same FLOPs.
  At N_r=3: MoR (118M) **2.7925 / 42.6**, Recursive (fixed depth) **2.8466 / 41.5**. N_r=3 token-choice: **2.9163 / 40.0**. N_r=3 expert + KV share: **2.7983 / 41.9** (31B tokens).
  Fixed 20B tokens: MoR N_r=2 uses **12.3e18** FLOPs for **2.7749 / 42.9**, and the text reports **−19%** training time and **−25%** peak memory vs vanilla (§3.1).
- Claim (§3.1): "MoR outperforms baselines with fewer parameters under equal train compute", "despite using nearly 50% fewer parameters".
- Flag:
  - Part of the isoFLOP win is **more data**: 27–30B vs 20B tokens, as the authors acknowledge ("process more training tokens").
  - At fixed 20B tokens, only N_r=2 beats vanilla. N_r=3/4 are worse on both NLL and avg (2.8246/41.8, 2.8519/41.5).
  - The fixed-depth Recursive N_r=2 baseline also beats vanilla on avg few-shot (**42.6 vs 42.3**) while its NLL is worse (2.8079). The few-shot avg moves by tenths and no seeds are reported.
  - Token-choice MoR is worse than plain fixed-depth recursion (40.0 vs 41.5).

**R2. Scaling across sizes: Fig 3, p.7** (`figures/mor-fig3.png`) **and App. Table 9, p.27**
- Measurement:
  - 4 sizes (135M / 360M / 730M / 1.7B), N_r=3, budgets of 2, 5 and 16.5e18 FLOPs.
  - At 16.5e18 (Table 9) the NLL pairs are:
    - 135M: MoR **2.9490** vs Vanilla **2.8432**
    - 360M: **2.7924** vs **2.7824**
    - 730M: **2.7438** vs **2.7048**
    - 1.7B: **2.8316** vs **2.8658**
  - MoR beats Recursive in every cell of Fig 3.
- Claim (Fig 3 caption, §3.2): MoR "matches or exceeds the standard Transformers at larger scales" with ≈1/3 the unique parameters.
- Flag: at the largest budget, vanilla still has lower NLL at 360M and 730M. The only win at the largest budget is 1.7B, where vanilla saw just **4.8B tokens** (MoR 6.5B), so that model is far from compute-optimal. MoR's clear gains sit at the **low budget (2e18)**. Read Fig 3 panel by panel.

**R3. Inference throughput: Fig 4a, p.8** (`figures/mor-fig4.png`, left panel ≈ (0.00, 0.00, 0.30, 0.88))
- Measurement: 360M scale, continuous depth-wise batching, decoding ~256 tokens with no prefix, normalized to vanilla.
  - B=32: MoR-2/3/4 = **×1.23 / ×1.33 / ×1.42**.
  - B=Max: **×1.60 / ×1.95 / ×2.06**. Max batch is 42/48/51 vs 32 for vanilla on an H100 (App. E, p.28).
  - Log-likelihood is above vanilla only for MoR-2. MoR-3/4 are slightly lower.
- Claim (§3.3): "MoR-4 achieves up to a 2.06× speedup", a "favorable trade-off".
- Flag:
  - One model size.
  - Throughput **excludes the time spent caching/updating KV pairs** ("we leave a more precise speed comparison … as future work", App. E).
  - MoR-4 is compared against a 34-layer vanilla.
  - The 2.06× needs the larger batch that KV savings allow, and it comes with a quality drop.

**R4. Ablations: Fig 4b/4c (p.8) and Table 4 (p.9)**
- Sharing strategy (Fig 4b, 135M/360M Recursive N_r=3, 10B tokens): Middle-Cycle has the lowest NLL at both sizes. Box ≈ (0.31, 0.00, 0.66, 0.88).
- KV sharing (Fig 4c, 360M, 10B tokens): sharing *raises* NLL for expert-choice MoR (MoR-E) and *lowers* it for token-choice (MoR-T). Box ≈ (0.67, 0.00, 1.00, 0.88).
- Router (Table 4, 360M, N_r=3):
  - Expert-choice pick (aux loss, sigmoid, linear): dead-token **0.1%**, NLL **2.8667**, few-shot **40.1**. With an auxiliary router + tanh, **66.7%** of tokens are dead.
  - Token-choice pick (balancing loss 0.1, softmax, linear, no z-loss): MaxVio **0.266**, NLL **2.9358**, few-shot **39.1**.
- Small inconsistency: §4.2 says "Softmax activation with an MLP router performs best", but the gray-highlighted token-choice row uses a **Linear** router.

## Limitations the authors state (§7.1, p.12, plus scattered)
- Scale: only ≤1.7B because of compute. Next step is >3B on larger corpora (§7.1 "Further scaling").
- Reasoning untested: how the router adapts once post-trained on CoT/reasoning data is future work (§7.1 "Reasoning MoR models").
- **Adaptive capacity:** expert-choice with aux loss separates selected from unselected router scores almost perfectly (Fig 5b), so **top-k cannot be adjusted after training** (§7.1).
- Token-choice "often struggles to balance loads … even for nearly half of the training steps" (§4.2).
- Throughput protocol omits KV cache update cost (App. E). Middle-Cycle vs Cycle at equal unique parameters was validated at one scale only (App. F, p.29).

## Open questions (for the "where it stands" slide)
- Does adaptive depth help *reasoning*? The evidence is LM loss and 6 few-shot benchmarks (LAMBADA, HellaSwag, PIQA, WinoGrande, ARC, MMLU) at ≤1.7B. There is no math/CoT task.
- "Test-time scaling" (Fig 5c, p.10) only increases depth **up to the trained N_r** (500 samples). Going past the trained depth is untested, and a larger N_r means fewer unique parameters and lower overall LL.
- How much of the isoFLOP gain is architecture, and how much is the extra tokens? A matched-token, matched-FLOP control exists only for N_r=2.
- Is per-token depth meaningful? The evidence is one qualitative sentence (Fig 1-right, §5.2) plus a token table in the appendix (Table 17).

## One-sentence takeaway (slide "Remark")
MoR makes looping *adaptive per token*: a router learned during pretraining sends only "hard" tokens through more passes of one shared block, and caching KV only for those tokens turns that adaptivity into memory and throughput savings. The evidence is pretraining loss and few-shot accuracy at ≤1.7B, not reasoning.

## Notes vs. the vault preread note
- The vault note's numbers match the PDF everywhere I checked (Table 3, Table 4, Fig 4a multipliers, §7.1). It also already flags the Table 4 text/table mismatch and the more-tokens confound.
- The vault lists the venue as "arXiv preprint"; the task brief says NeurIPS 2025 (not printed in the PDF).
- Additions here that the vault does not state:
  - The 1.7B undertraining caveat (4.8B tokens) from App. Table 9.
  - The KV-update-time exclusion in the throughput protocol.
  - Recursive N_r=2 also beats vanilla on few-shot avg.
- Minor: Table 3 vs Table 9 report slightly different numbers for the same 360M/16.5e18 runs. Vanilla avg is 42.3 in Table 3 and 42.49 in Table 9; MoR N_r=3 is 42.6 vs 42.68. The source of the difference is **[unverified]**, probably a different evaluation pass.
