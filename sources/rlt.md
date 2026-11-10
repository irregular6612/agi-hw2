# rlt — Recurrent Looped Transformer (Princeton)

**Citation (slide footer):** Y. Zhang, J. Feng, S. Qin, S.-Y. Kung, M. Wang (Princeton / UPenn), "Recurrent Looped Transformer," project page + arXiv:2610.07591 (v1 Oct 6, v2 Oct 11, 2026); first released as a single-author technical report on Sept 12, 2026. https://yifanzhang-pro.github.io/recurrent-looped-tranformer/

**Evidence status:** It depends on which version you cite.
- **Sept 12, 2026 version** (the one the course page calls a "design document"): a design document with no experiments. It is a 16-page tech report by Yifan Zhang alone, and its only cost figures are analytical big-O counts. The course framing is accurate for this version.
- **Current version (checked 2026-11-04):** an arXiv preprint (not peer-reviewed) with small-scale synthetic experiments: about 26M-parameter models, six algorithmic tasks, three seeds. It has no language-model-scale results, no RL results and no GPU throughput numbers.
- Repo commit history: page created 2026-09-12; first "preliminary synthetic experiments" (community-contributed) on 09-13; three-seed results 09-16 to 09-18; arXiv links added 10-07. **Tell the class that the "no measured results" description is now out of date.** The update is itself a "virality → validation" story.

## What is proposed (architecture)
- The layers are split between a **parallel causal encoder** and a **recurrent decoder**. At each token, the decoder merges the encoder output with the *previous token's final decoder state*. That state is carried across every prompt and response token, together with a per-layer sliding-window (SWA) KV cache.
- Key equation (page): `(s_t, C_t^D) = D_φ(Merge(e_t, s_{t−1}); M_{≤t}, C_{t−1}^D, t)`.
- "After t tokens, that path traverses tL_D decoder blocks while the per-token block count stays fixed."
- **What gets looped is different from Ouro/Nanbeige.** Depth grows with *sequence length*, so this is RNN-style recurrence through time. Per-token depth is fixed. The page says: "RLT-1 is an RNN whose recurrent cell is the gated merge followed by the full Transformer decoder."
- Controls: **RLT-2** updates the feedback once per chunk of B tokens. **RLT-0** never feeds back (B = ∞) and has 787,968 fewer parameters at each 8-layer split.

## What is claimed (quotes)
- Sept 12 report abstract: "This creates a latent computation path with no fixed architectural depth limit as the sequence extends." Tagline: "Latent reasoning with infinite temporal depth."
- The same Sept 12 page hedges itself: "Infinite depth refers to an extensible temporal path, not infinite work within a token. **Realized reasoning gains, hardware efficiency, and RL scaling remain to be established.**"
- Sept 12 report §4.1–4.3: "Memory reuse, batching, and kernel fusion are implementation targets, not measured speedups." Also: "hardware-efficient training and inference remain engineering goals until measured." And: "structural depth alone is not a reasoning guarantee" (§3.3).
- The Sept 12 "cost counts" are analytical only. Prefill is O((L_E+L_D)(Td²+T²d) + GTd² + L_D·T·min(W,T)·d) (Eq. 3.2), and cache size is O((L_E+G)t·d_KV + L_D·min(t,W−1)·d^D_KV + d) (Eq. 3.3). The proposed config was 48 encoder + 48 decoder layers, "96 logical blocks" per token. **That 48+48 model was never trained.** The current page says "A tied 48+48 layout illustrates this option in the report; the experiments below use untied eight- and sixteen-layer layouts."
- Current abstract: "the computation path grows with sequence length at a fixed per-token cost."

## What is measured (current page / arXiv v2)
All numbers are mean ± sample SD over seeds 42–44. Model width is 512, and there are 8 layers in total split between encoder and decoder ("5+3" = 5 encoder + 3 decoder). The baseline is "GPT Layer 8".
- **Parity:** trained on ≤ 40 bits. At 256 bits, the 5+3 and 7+1 splits reach **100 ± 0%**; the Transformer gets 50.07 ± 1.63% (chance).
- **S5 swaps at 256 ops (8× training length):** 4+4 reaches **97.30 ± 2.76%**, versus **0.85 ± 0.30%** for the Transformer. At 512 ops, 4+4 drops to 55.70 ± 25.78%. The 7+1 and 8+0 splits are near chance.
- **Mod-5, flat, length 63:** 6+2 reaches **93.36 ± 5.69%**, versus 33.20 ± 2.33%. With brackets at length 64: 67.97 ± 2.91% versus 46.71 ± 1.21%.
- **Ablation:** removing the feedback (RLT-0) drops 64-bit parity to 50.23 ± 3.80% and S5 swaps at 48 ops to 7.26 ± 3.17%. Chunked feedback (B = 4) keeps parity-64 at 98.99 ± 1.66% but cuts swaps-S5 at 64 ops from 100% to 19.60 ± 6.54%.
- **Negative or limited results the authors report themselves:**
  - Standard S5 (not the swap version) stays near the 1/120 chance level for every model: 0.72–1.43% at 512.
  - Addition beyond 8 digits fails for every model: 14.89–16.84% at 32 digits.
  - Flat mod-5 is very sensitive to the seed: the three 4+4 seeds scored 17.58%, 19.53% and 98.96%.
- **Confounds:** RLT has 26.10–28.73M parameters versus 25.31M for the GPT baseline, so "equal layer counts do not match parameters or compute." The community replication (about 79K parameters) matched parameters and data but "FLOPs were not" matched.
- **Cost, measured on CPU only** (seconds per training step, 4+4, flat mod-5): RLT-1 62.59, RLT-2 chunk4 27.52, RLT-0 14.54. Per-token feedback is therefore about 4.3× slower per step than no feedback. "These experiments use supervised training; RL performance is not evaluated."

## Key figures
- `figures/rlt-architecture.png`: causal encoder → KV memory, plus the recurrent decoder chain H_{T−2} → H_T across prompt and response tokens (page `figure1.png`). Use it on the "what is RLT" slide.
- `figures/rlt-length-generalization.png`: 4-panel length-generalization plot (parity, S5 swaps, mod-5 ×2). The gray band marks training lengths and the dashed black line is the GPT baseline. Use it on the "what was actually measured" slide.

## Open questions / discussion hooks
1. **Generalization:** Is RLT's length extrapolation real algorithmic generalization, or does it only work on tasks whose solution is a per-token finite-state update? It works on parity and S5 swaps but fails on standard S5 and long addition.
2. **ARC-AGI:** Every result is on toy tasks at about 26M parameters. Nothing shows the extra recurrent depth helps compositional, few-shot abstraction of the ARC kind. What experiment would show it?
3. **Measuring intelligence / virality vs validation:** The page went from "infinite temporal depth" with zero experiments (Sept 12) to three-seed toy results (Oct). How should we weigh a claim that is revised every few days on a project page, compared with a fixed and reviewed paper?
4. **Safety:** RLT carries an unreadable hidden state across the *entire* prompt and response. If this scaled up, how much reasoning would leave the token stream? (Link to `cotmon`.)
5. **Answering the guiding question:** RLT gets more depth only by processing *more tokens*. So it does not "think longer without writing more tokens." It thinks deeper *across* tokens.

## Remark (one sentence)
RLT started as a design document promising "infinite temporal depth" with no measurements. Five weeks later it has small, three-seed toy experiments that show striking length generalization on parity and swap-S5, but no evidence yet at language-model scale, for RL, or on real hardware.
