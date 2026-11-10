# Ouro: Scaling Latent Reasoning via Looped Language Models (source digest)

Source PDF: `papers/ouro.pdf` = arXiv 2510.25741**v6** (11 Oct 2026), 54 pp. Page numbers are PDF pages (1-indexed). Earlier arXiv versions may differ in numbers.

## Citation line (slide footer)
Zhu, Wang, Hua, et al., "Scaling Latent Reasoning via Looped Language Models", arXiv preprint 2025, arXiv:2510.25741
- No venue is printed on the PDF or arXiv page. Rui-Jie Zhu\*, Zixuan Wang\*, Kai Hua\*, Tianyu Zhang\*, … (ByteDance Seed, UC Santa Cruz, Princeton, Mila, …). Senior authors include Yoshua Bengio and Jason Eshraghian.

## Problem & gap
- **Targets:**
  - LLMs "think" mainly through explicit CoT tokens, which is added in post-training and bloats the context.
  - Looped/recurrent-depth models (Universal Transformer, Saunshi, Geiping/Huginn, MoR) had only been shown "at modest scales". Whether looping gives frontier-level gains "at practically meaningful scales is unproven" (§1, p.2).
  - Learned adaptive exits "tend to collapse to shallow depths or overuse long loops" (§1). Huginn-style priors (Poisson-lognormal) or PonderNet's geometric prior bias toward early halting (§3.3, p.7).
- **Proposal:** pretrain a looped LM at multi-trillion-token scale, with a per-step exit gate trained by an entropy (uniform-prior KL) regularizer.
- **Leaves open:**
  - No same-data non-looped control at full scale; the headline comparisons are against external models.
  - Accuracy degrades when looping past the trained depth.
  - RL post-training did not work with variable depth (§4.5).

## Core mechanism as reveal steps: Figure 3, PDF p.4
Figure file: `figures/ouro-fig3.png` (1398×588 px, caption excluded). Boxes are fractions (x0,y0,x1,y1).

1. **Same N-layer stack, looped T times**: the whole stack (Layer 1…N) is applied repeatedly with tied weights, F^(t) = lmhead ∘ M^L ∘ … ∘ M^L ∘ emb (Eq. 1, §3.1). Ouro uses **T_max = 4**: 1.4B = 24 layers × 4 and 2.6B = 48 layers × 4 (Table 2 p.9; §4.3.1 p.11).
   Highlight: Training panel, the three loop columns with their wrap-around arrows. Box ≈ (0.02, 0.06, 0.40, 0.66).
2. **Every loop gets a head and an exit gate**: after each step t, an LM head gives loss L^(t), and a gate gives the per-step exit probability λ_t = σ(Linear(h^(t))). Survival products turn these into a distribution p_φ(t|x) over exit steps (Eq. 3, §3.2).
   Highlight: Training panel, the bottom row of Exit Gate / Head boxes and p_1, L^(1) … p_Tmax, L^(Tmax). Box ≈ (0.02, 0.70, 0.41, 0.85).
3. **Stage I loss = expected task loss − β·entropy**: L = Σ_t p_φ(t|x)·L^(t) − β·H(p_φ). Without the entropy term, mass self-reinforces onto t=T_max. The objective equals a β-ELBO with a **uniform prior** over exit steps (Eq. 4, §3.3). β = 0.1 in Stage 1a and 0.05 afterwards (§4.3).
   Highlight: the formula under the Training panel. Box ≈ (0.09, 0.86, 0.33, 0.96).
4. **Inference: accumulate exit probability (Q-exit)**: CDF_n = p_1+…+p_n. Keep looping while CDF < q, a single deployment knob for compute vs accuracy (§3.2, after PALBERT).
   Highlight: Inference panel, the gates at t=1 and t=2 with "CDF_1 < threshold" and "CDF_2 < threshold". Box ≈ (0.47, 0.70, 0.72, 0.89).
5. **Early exit at t=n; the remaining loops are skipped**: once CDF_n crosses q, the head decodes and the faded loops are never run. Stage II (§3.4) then freezes the LM and trains only the gate with BCE toward a label w = σ(50·(I−0.005)), where I is the detached per-step loss improvement.
   Highlight: Inference panel, the t=n column with "Early Exit → Head" and the faded t=T_max column. Box ≈ (0.73, 0.15, 0.98, 0.90).

Training scale (Fig 4 p.8, Table 1 p.8):
- Stages for each model: Stage 1a 3T (8 loops, which were unstable) → Stage 1b 3T (4 loops; here the 2.6B is upcycled from 24 to 48 layers by duplication) → CT annealing 1.4T → LongCT 20B → mid-training 300B.
- Total **7.7T tokens** per base model.
- Reasoning SFT on ~8.3M examples produces Ouro-Thinking.

## Key measured results

**R1. Base models vs larger dense models: Tables 7–8, pp.13–14** (lm-eval-harness/evalplus, same pipeline for all)
- Measurement:
  - Ouro-1.4B R4 vs Qwen3-4B-Base:
    - Wins: BBH **71.02 vs 70.95**, GSM8K **78.92 vs 72.86**, MATH500 **82.40 vs 59.60**.
    - Losses: MMLU **67.35 vs 73.19**, MMLU-Pro **48.62 vs 51.40**, HumanEval **74.40 vs 77.40**, MBPP **73.00 vs 78.80**.
  - Ouro-2.6B R4 vs Qwen3-8B-Base:
    - Wins: MMLU-Pro **55.73 vs 53.72**, BBH **80.46 vs 77.65**, MATH500 **90.85 vs 62.30**.
    - Losses: MMLU **74.60 vs 76.63**, GSM8K **81.58 vs 83.09**, HumanEval **78.70 vs 84.80**.
- Claim: "1.4B and 2.6B … match 4B and 8B standard transformers on most benchmarks, yielding 2-3× parameter-efficiency gains" (§1). The abstract goes further: "match the results of up to 12B SOTA LLMs".
- Flag:
  - The baselines differ in data and recipe: 7.7T tokens vs Qwen3's 36T and Gemma3-4B's 4T.
  - The gains concentrate on math/reasoning, and knowledge/code tasks still favor Qwen3.
  - "Parameter efficiency" ≠ compute efficiency. A 24-layer × 4-loop model runs ~96 layer-applications per token, roughly the per-token FLOPs of a ~4× larger dense model (**analyst inference, not stated as such in the paper**).
  - The authors' own small-scale control (App. D.1, Table 18, p.44; 20B FineWeb-Edu tokens) found an **equal-depth non-shared Standard model scores higher than LoopLM in every setting**. The gap is 0.021–0.039 at step 2/4 for the 170M model and 0.017/0.025 for the 1.3B model, and it shrinks with size.
  - The same external model has slightly different scores across Tables 7 and 8 (Qwen3-4B BBH 70.95 vs 71.14).

**R2. Learned early exit: Fig 5, p.17** (MMLU only; `figures/ouro-fig5.png`)
- Measurement:
  - Fixed depth: ~**0.40** at 1 loop → ~**0.60** at 2 → **67.35%** at 4.
  - At an average of 2.5 exit rounds, the Stage II-trained gate reaches **~66%** vs **~64%** for the untrained gate (numbers from the text).
  - The hidden-state-difference heuristic lands within **1–2%** of the trained gate at 2–3 rounds.
- Claim: "the specialized adaptive exit training achieves the best accuracy at every computational budget". The trained-vs-untrained gap is "approximately 2%-3% accuracy at most operating points".
- Flag:
  - In the 3× render the three adaptive curves overlap closely. Interpolated at 2.5 rounds, the untrained gate is ≈0.65 vs trained ≈0.66, about 1 point. A 2–3 point gap is not visible at most points **[my reading of the plot]**.
  - One benchmark only, and no seeds are reported.
  - A plain heuristic is nearly as good as the learned gate.
  - Gate region: orange vs blue curves near x=2.5 ≈ (0.45, 0.08, 0.65, 0.30).
- Related, Table 14 p.18 (decode-time KV):
  - Keeping only the last-step KV cache costs **78.92→78.85** on GSM8K and **82.40→80.40** on MATH-500 with **4×** less memory. First-step-only collapses to **18.73 / 8.43**.
  - Prefill still needs all 4 caches; reusing them there loses ">10 points on GSM8K".

**R3. Knowledge storage vs manipulation: Fig 6, p.20** (`figures/ouro-fig6.png`; synthetic tasks on small GPT-2-style models)
- Measurement, storage (Capo, left plot, box ≈ (0.00, 0.00, 0.52, 1.00)):
  - Bios with N = 20K–500K people, models of 1M–40M params, 1000 exposures.
  - loop-1 and loop-4 models both reach **≈2 bits/parameter**.
- Measurement, manipulation (Mano, modular-23 arithmetic trees with no CoT; right table, box ≈ (0.60, 0.00, 1.00, 0.88)):
  - At L=24, Loop(3⊗4) scores **92.2** vs **11.0** for the iso-param Base(3⊗1) and **34.8** for the iso-FLOP Base(12⊗1). Loop(2⊗6) scores **78.0**.
  - But Loop(6⊗2) falls *below* the iso-FLOP Base at L=10 and L=16 (**93.4 vs 93.6**, **88.5 vs 94.4**). At L=24 it is roughly tied (**35.1 vs 34.8**).
- Multi-hop QA (Fig 7 p.21): more loops learn 3-hop QA from fewer unique samples.
- Claim (§6.2 and Conclusion): looping "does not increase knowledge capacity" but gives "a better inductive bias towards … manipulation". The authors "demonstrated this advantage stems not from increased knowledge storage".
- Flag:
  - The causal link to the 1.4B/2.6B benchmark wins is an **extrapolation from toy models**: the storage test used ≤40M params, and the Mano results are the **best of 3 seeds** (App. B.2, p.36).
  - Real-data support is correlational. Loop1→Loop4 gains across MMLU categories are, for example, Elementary Math +155.6% and Global Facts +8.3% (App. B.4, p.37).
  - Theorem 1 (O(log D) loops for graph reachability) is an existence result under idealized assumptions. The authors say it "does not by itself explain the empirical performance gap" (§6.3, p.22).

**R4. Depth beyond training does not keep helping: Tables 10–13, pp.15–16**
- Measurement:
  - Ouro-1.4B base MMLU by loop count: T=1 **41.21**, T=2 **60.43**, T=4 **67.45**, then down to **64.49** at T=8.
  - Ouro-2.6B-Thinking: AIME24 peaks at T=3 (**70.33**) above T=4 (**64.70**). OlympiadBench drops to **39.26** at T=8.
- Claim: performance "peaks at the trained depth", while safety (HEx-PHI harmfulness) keeps improving into extrapolated steps (§5.3, §7.1).
- Flag: this directly limits "think longer by looping more". Extra loops past T_max=4 hurt task accuracy.

## Limitations the authors state
There is no dedicated Limitations section. These are scattered in the text:
- Training with 8 loops caused "loss spikes and gradient oscillations", so they cut to 4 loops. They ran no LR sweep and used conservative LRs (§4.3, pp.10–11).
- RLVR (DAPO/GRPO) did not beat SFT. vLLM/SGLang fixed execution paths break under variable depth (§4.5, p.12).
- Extrapolating past T=4 degrades benchmarks (§5.3).
- Faithfulness: "we cannot manipulate the latent reasoning process". They use an observational probe proxy instead (Quora QQP; adjacent-step agreement A[2,3]=551/1000, A[2,4]=361; §7.2, pp.24–25).
- Neither training stage "guarantees that next-token prediction loss decreases at every additional loop" (§7.2 "Anytime prediction", p.26).
- Small-scale controls: standard > LoopLM at equal depth (App. D.1). One Multi-hop QA iso-FLOP result may be "randomness, or insufficient hyperparameter tuning" (App. B.3 footnote 5).
- Conclusion asks for future work on "enhancing performance extrapolation at greater depths" (p.26).

## Open questions
- What remains of the 2–3× claim against a **same-data, same-FLOP** dense baseline at scale? The paper's own small-scale control points the other way.
- Can a looped model *extrapolate* depth? Today, loops past training help safety but hurt accuracy.
- Does storage-vs-manipulation hold for billion-parameter models trained on natural data, beyond the ≤40M synthetic setups?
- How can variable-depth models be trained with RL, and served with fast inference engines?

## One-sentence takeaway (slide "Remark")
Ouro is the first multi-trillion-token test of looping (7.7T tokens, 4 shared-weight loops, entropy-regularized learned exit). Small looped models rival 2–3× larger dense models mainly on math and reasoning benchmarks, and toy experiments suggest loops add knowledge manipulation rather than storage. But gains stop at the trained depth, and the same-data non-looped control at scale is missing.

## Notes vs. the vault preread note
- Numbers in the vault note match the v6 PDF wherever I checked (Tables 7–9, 10–14, Fig 6, §4.3, §4.5, B.2 best-of-3-seeds). The vault correctly flags the Fig 5 "2–3%" over-statement and the Table 7/8 inconsistencies.
- The vault says Appendix D was "caption-checked only". The text of D.1 says the **Standard model beats LoopLM in all settings at equal recurrent depth** (Table 18), which weakens the parameter-efficiency framing. This is new relative to the vault.
- Minor: App. D.1 lists model sizes as 53M/134M/374M/778M/1.36B, but Table 18 rows read 170M/340M/680M/1.3B. The reason is **[unverified]**.
- The abstract says "up to 12B", while the body and conclusion say "4B and 8B". 12B appears only as a radar baseline (Fig 1) and in Table 8 (Gemma3-12B), where Ouro-2.6B wins only some rows (e.g., MATH500 90.85 vs 83.20, BBH 80.46 vs 78.41).
