# Reasoning with Latent Thoughts: On the Power of Looped Transformers (Saunshi et al., ICLR 2025)

**Citation line (slide footer):** Saunshi, Dikkala, Li, Kumar, Reddi, "Reasoning with Latent Thoughts: On the Power of Looped Transformers", ICLR 2025 (arXiv:2502.17416)
Short form: Saunshi et al., "Reasoning with Latent Thoughts: On the Power of Looped Transformers", ICLR 2025, arXiv:2502.17416
Source checked: arXiv v1 (24 Feb 2025), 27 pp. The header reads "Published as a conference paper at ICLR 2025" and "Submitted on Oct. 1, 2024". Authors are from Google Research, plus TTI-Chicago for Z. Li.
Timeline note: the content predates Huginn's arXiv post (7 Feb 2025) even though the arXiv post came later.

## Problem & gap
- Scaling laws say performance tracks parameter count. Ye et al. (2024) showed depth matters too. This paper makes the stronger claim that "many reasoning problems require a large depth but not necessarily many parameters" (Abstract; Claim 1, Sec 1).
- Prior looping work targeted parameter efficiency (ALBERT), adaptive compute (Universal Transformer), equilibrium models, or in-context learning, and judged LMs by perplexity. This paper studies looping for *downstream reasoning* (Sec 1, Sec 6).
- **Left open (picked up later):** looped models are trained at a *fixed* loop count, at most 1B-scale and 250B tokens. Using loops for inference-time scaling is named as future work: "leveraging looping explicitly for inference-time scaling is a very promising future direction" (Sec 3.4, Sec 7). Recurrent-depth LMs with variable test-time depth, such as Huginn, take this up. *Why* looping has a reasoning bias "is still an open question" (Sec 3.3).

## Core mechanism: reveal sequence on Fig 1 (PDF p.2)
Figure file: `figures/saunshi-fig1.png` (caption excluded). Bboxes are fractions (x0,y0,x1,y1) of that PNG.
Notation (Sec 2): for a block f of k layers, `f^(L) = f ∘ … ∘ f` (L times) is written **(k ⊗ L)**. It is a kL-layer model whose L blocks of k consecutive layers share weights. The formal version is Def 5.2: `p_{θ,T} = OUTPUT ∘ (TB_θ)^T ∘ EMBED`.

1. **Iso-param baseline (k ⊗ 1).** k distinct layers, run once. Same parameters as the looped model, but L× fewer FLOPs. Highlight: left panel, bbox (0.01, 0.03, 0.245, 0.97).
2. **Looped model (k ⊗ L).** The same k-layer block (every box is labelled "1") is applied L times. Parameters match (k⊗1); depth and FLOPs match (kL⊗1). Highlight: second panel, bbox (0.25, 0.03, 0.47, 0.97).
3. **Iso-FLOP baseline (kL ⊗ 1).** kL distinct layers (boxes 1, 2, …, L): same effective depth and FLOPs, but L× more parameters. Highlight: third panel, bbox (0.47, 0.03, 0.725, 0.97).
4. **The question the comparison asks.** If (k⊗L) ≈ (kL⊗1) and ≫ (k⊗1), then depth, not parameter count, is what the task needs. Highlight panels 1–3 together, bbox (0.01, 0.03, 0.725, 0.97).
5. **Middle looping.** Distinct first and last layers with a looped middle block. Inspired by stacking/MidAS: "the first and last layers play a special role" (Sec 3.3). This is the same intuition as Huginn's prelude/coda. Highlight: right panel, bbox (0.78, 0.03, 0.995, 0.97).
   Table 3 writes this model as "(4 ⊗ 1, 4, 1)" and says it is iso-param with (12⊗1) and iso-FLOP with (24⊗1). Its exact layout (presumably 4 + a 4-layer block × 4 + 4 = 24 effective layers) is not spelled out: [unverified].

### Second reveal: "looped models simulate CoT" (Fig 4, PDF p.13; `figures/saunshi-fig4.png`)
- **Left: CoT viewed as a loop.** Each pass through the model appends one new thought token (t1, then t2, then t3, outlined in red) and feeds it back as input. Bbox (0.03, 0.00, 0.37, 1.00).
- **Right: looped model.** Each loop updates *all* positions in parallel; the red outlines are "latent thoughts". Extra dummy positions (tan boxes at the bottom right) stand in for future CoT tokens. Bbox (0.64, 0.00, 0.99, 1.00).
- **Theorem 5.4 (Sec 5.4):** for any L-layer non-looped transformer, there is a looped transformer with L + O(1) layers, Ω(log(n+m)) more embedding dimensions and constantly many more heads. Run for m loops on input v plus m dummy tokens #^m, it reproduces the output of m CoT steps: `TF^m_θ(v) = TF_{θ′,m}(v, #^m)`.
  Proof idea (Sec 5.4, App. B.3): (i) *mask all-but-one*: a loop counter means only position n+t is updated in loop t; (ii) *shift by one*: attention passes the previous position's output forward; (iii) *token decoding*: an MLP simulates decoding and re-embedding.
- **Other theory:**
  - Thm 5.1: a 1-layer block looped ⌈log₂ n⌉ times composes n elements of any finite group.
  - Thm 5.2: any L-layer transformer with ≤ R distinct layers is simulated by looping one layer L times, at width d + R + 2.
  - Cor 5.3: p-hop is solved with ⌊log₂ p⌋ + 2 loops, matching Sanford et al.'s depth lower bound.
  These are expressivity (existence) results: "the goal is to provide some intuition and formalization for the expressive power" (Sec 5). They are not learnability results.

## Key measured results
1. **Synthetic reasoning needs depth, not parameters.** Table 1 (p.4), Table 2 (p.5).
   - Measurement, addition of n 3-digit numbers, n = 32: (12⊗1) 100.0; (1⊗1) 0.0; (1⊗12) 99.6; (2⊗1) 38.8 vs (2⊗6) 99.5; (3⊗1) 60.7 vs (3⊗4) 96.6.
   - Measurement, p-hop (|Σ| = 4, n = 256, p = 32): (6⊗1) 99.6; (1⊗1) 49.0; (1⊗6) 99.5.
   - Measurement, i-GSM (mod 7): (8⊗1) 73.2; (1⊗1) 24.5; (1⊗2) 52.3; (1⊗4) 69.9; (1⊗8) 73.2; (2⊗4) 73.6.
   - Claim: "even a 1-layer network looped 12 times is able to solve this, despite using merely 1/12th of the parameters", so addition "primarily requires depth" (Sec 2.1).
   - Caveat: each synthetic setting reports the best of 3 seeds (max, not mean), because the authors "care about expressivity" (App. A.1).
2. **1B LM: worse perplexity, but disproportionately better reasoning (iso-param vs iso-FLOP).** Table 3, p.6. Pile, 250B tokens.
   - Measurement (ppl ↓ / closed-book QA / open-book QA / math word problems / reasoning primitives):
     - (24⊗1): 7.40 / 11.2 / 33.9 / 29.3 / 47.5
     - (12⊗1): 8.16 / 8.2 / 26.9 / 26.7 / 35.7
     - (12⊗2): 7.90 / 9.3 / 30.8 / **34.3** / **51.2**
     - (4⊗1): 10.12 / 1.8 / 13.8 / 9.7 / 19.4
     - (4⊗6): 8.79 / 6.7 / 26.2 / 24.8 / **56.9**
   - "% Gap" (Eq 1) is the share of the iso-param → iso-FLOP gap that looping closes. Perplexity: 34–48% across k. Reasoning primitives: 131–153%. Above 100% means the looped model beats the 24-layer model.
   - Claim: looped models "have an inductive bias towards good reasoning despite having worse perplexity and memorization" (Claim 2). (12⊗2) beats the 24-layer baseline on math (34.3 vs 29.3) with 50% of the parameters (Sec 3.1).
   - Isoplots (Fig 2, p.7; `saunshi-fig2.png`): at equal log-perplexity, looped models score higher on open-book QA and math but are aligned on closed-book QA (Sec 3.2).
     Reveal: top row = (12⊗1) vs (12⊗2), bbox (0.00, 0.00, 1.00, 0.47); bottom row = regularized model, bbox (0.00, 0.52, 1.00, 1.00).
3. **Depth scaling law: loops vs. fresh layers.** Fig 3, p.9; `saunshi-fig3.png`.
   - Measurement: models (4⊗L) for L ∈ {1,2,3,6,9,12} vs (4L⊗1), so effective depth D runs 4–48. Both follow `Acc = α log(D) + β` (Eq 2). The ratio α_loop/α_base per panel title is: perplexity 0.5, closed-book 0.5, eval token acc 0.5, open-book 0.6, math 0.6, reasoning primitives 1.2. The text gives the last as 1.19×.
   - Claim: "more loops continue to help, and the relative benefit of loops is higher for reasoning tasks". This is "akin to the inference-time scaling of chain-of-thought" (Abstract; Sec 3.4).
   - Reveal: reasoning primitives panel (bottom-right), bbox (0.66, 0.50, 1.00, 1.00); closed-book panel (top-middle), bbox (0.33, 0.00, 0.66, 0.50).
4. **Looping-inspired regularizer gets the bias without the perplexity cost.** Table 4, p.10.
   - Method: add a cosine-similarity term between corresponding layers of adjacent k-layer blocks, Eq (3)–(4): `L = L_xent + λ_reg |G|⁻¹ Σ_G R_G(k)`.
   - Measurement: 24-layer model with k = 4, λ_reg = 10 vs baseline. Ppl 7.38 vs 7.40; closed-book 12.5 vs 11.2; open-book 36.2 vs 33.9; math 36.4 vs 29.3; reasoning primitives 57.2 vs 47.5. Block cosine similarity ends ≈ 0.98 or higher (Fig 5, App.).
   - Claim: the regularizer "inherits the inductive bias of looped models towards reasoning without affecting perplexity" (Sec 1, Sec 4).

## Limitations the authors state
- Only a "non-exhaustive list" of reasoning problems was tested. It is open whether the results extend to multimodal and common-sense reasoning, and "a succinct formalization of reasoning problems itself" is future work (Sec 1, Sec 7).
- Looped LMs have worse perplexity and memorization than iso-FLOP models, which is "the primary reason looped models have been ignored for language modeling" (Sec 3.1).
- Why the inductive bias arises is unexplained ("still an open question", Sec 3.3). The best looping strategy, e.g. middle looping, is left for future work (Sec 3.3).
- Inference-time scaling with loops is not done here; it is only proposed (Sec 3.4, Sec 7).

## Open questions
- The theory shows existence (looping *can* simulate CoT). Do trained looped LMs actually implement CoT-like latent steps?
- Do the % Gap and α-ratio patterns hold beyond 1B/250B tokens, and with variable loop counts at test time?
- How does the cosine regularizer relate to stacking (MidAS) and to explicit weight sharing at scale?

## Internal inconsistencies / notes
- Model size: Sec 3 says "24-layer 1B parameter model", while App. A.2 says the base model "is a 1.5B parameter decoder only Transformer" (d = 2048, FFN 5120, 32 heads). Use "1B-scale" on slides.
- Sec 2.1 says k ∈ {2, 3, 4, 6} for addition, but Table 1 shows k = 1, 2, 3.
- Table 3's "All Tasks Average" covers 15 tasks (closed/open QA + math). Reasoning primitives (4 tasks) are reported separately, for 19 tasks in total (Sec 3.1).

## One-sentence takeaway (slide Remark)
At fixed parameters, looping a k-layer block L times recovers most of the reasoning benefit of a kL-layer model. On the 1B-scale reasoning-primitive tasks it beats that model: (4⊗6) scores 56.9 vs 47.5 for the 24-layer model, with 6× fewer parameters (Table 3). In theory, T loops can simulate T steps of chain-of-thought, so depth through reuse acts as "latent thoughts".
