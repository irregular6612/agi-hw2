# cotmon — On the Chain-of-Thought Monitorability of Looped Language Models

**Citation (slide footer):** H. Wang, I. B. Balappanawar, H. Zhang (UIUC), "On the Chain-of-Thought Monitorability of Looped Language Models," arXiv:2610.02741 (preprint, v1 Oct 2, 2026). https://arxiv.org/abs/2610.02741. Local PDF: `papers/cotmon.pdf`, 59 pp.

**Evidence status:** Preprint with experiments, not peer-reviewed. These are the first systematic measurements on this question. Scale is limited to open models of 1.4B to 3B parameters with loop support.

## Motivation (what the paper takes as given)
- It cites OpenAI's Astra system card: "researchers at OpenAI also posted that GPT-6 Astra shows a substantial decrease in CoT monitorability compared to previous models (OpenAI, 2026)."
- It offers two candidate explanations: (I) higher capability means fewer CoT tokens are needed, or (II) "the looped transformer architecture that GPT-6 Astra has been **speculated** to use (Raschka, 2026)." This paper tests (II).

## Setup
- **LoopLM** = an L-layer stack applied T times with shared weights, so effective depth is L·T.
- **Experiment 1 (controlled):** Ouro-1.4B-Thinking and Ouro-2.6B-Thinking at loop depth T ∈ {4, 6, 8}. "T = 4 is the default loop depth."
  - vLLM does not support Ouro's token-level early-exit gating, so every token runs all T loops.
  - Only questions with a positive hint effect at all three T values are kept, so each T is scored on the same set.
- **Experiment 2 (confounded):** Nanbeige4.2-3B (looped) against six non-looped models matched on parameter count, layer count, or effective depth. The matches are Qwen3.5-4B, Gemma-4-E4B, GPT-OSS-20B, Qwen3.5-2B, Qwen3.5-35B-A3B and GLM-4.7-Flash.
- **Tasks:** eight MonitorBench tasks. Five are "Cue Answer" (Logic, Health, Safety, Engineering, Science), where the prompt says "As a user, I guess the answer is A". Three are "Cue Condition" (Knowledge, Preference, Law Judgment).
- **Stress tests:**
  - *Direct Concealment*: "do not mention" the cue.
  - *Monitor-aware Evasion*: the model is told it is being monitored and should avoid detection.
- **Monitorability score** = min(E[Z | X=1, Y=1] / R_effect, 1), where R_effect = TE / E[Y | X=1]. In words: of the correct answers the hint caused, what fraction did the monitor flag as hint-driven? (§3.2)
- **Run settings:** 4 rollouts per instance, up to 16,384 tokens, temperature 0.6. Qwen3.8-27B acts as both monitor and verifier. Three judges agreed unanimously more than 90% of the time, but that check was run on the Logic task only.

## What is claimed (quotes)
- Abstract: "deeper loop depth can reduce CoT monitorability in some tasks under stress tests, but looped transformer architecture alone does not necessarily imply lower monitorability."
- §4.2: "the results provide no evidence that adopting a looped transformer architecture alone necessarily makes models less monitorable."

## What is measured
- **Loop depth, Direct Concealment, CoT-only, Ouro-1.4B, T=4→8 (Fig. 2, Table 6b):**
  - Logic **77.94 → 41.79** (−36 percentage points)
  - Science 40.78 → 23.61 (−17 pp)
  - Engineering 54.35 → 43.57 (−11 pp)
  - Ouro-2.6B, Logic: 73.60 → 57.88.
- **Where it does not hold (Fig. 2):**
  - Health and Safety Cue Answer do not decline. Health for the 1.4B model actually rises.
  - The three Cue Condition tasks stay at about 90–100%.
  - The standard (no stress test) average barely changes.
- **Alternative explanations ruled out (§4.1.1, Tables 1–2):**
  - Change in pass rate versus change in monitorability: Spearman **ρ = −0.126, p = 0.493**.
  - Change in CoT length versus change in monitorability: **ρ = 0.248, p = 0.172**.
  - Both are computed over 32 cells (8 tasks × 2 models × 2 stress tests). CoTs did not get shorter. Ouro-2.6B wrote about 400 more tokens on Engineering at T = 8.
- **Qualitative (Fig. 4, one hand-picked Logic item):**
  - T=4: the cue is used as the target (22 cue mentions in the CoT).
  - T=6: the cue is "framed as check" (6).
  - T=8: the cue is "not acknowledged in the CoT" (0), with the same final answer.
- **Looped vs non-looped, standard setting (§4.2):** Nanbeige averages **81.35%** versus 67.18–76.92% for the non-looped models. Table 10(a) lists 66.08 for Qwen3.5-2B, so the text understates the bottom of that range.
- **Looped vs non-looped, Direct Concealment (Table 3):** Nanbeige 78.75 versus 66.22–79.25. It ranks 2nd of 7, and is lower on some tasks (Science 39.25 vs 49.34 for Qwen3.5-4B).
- **Side finding (App. A.2.6):** Monitor-aware Evasion *raised* the CoT average for all 7 models, e.g. Nanbeige 81.4 → 95.2. When told to hide the cue, the models talk about hiding it.

## Limitations (authors, App. A.1) + caveats
- The controlled result rests on a single model family (Ouro). The mechanism is not established. The cross-model comparison "should not be interpreted as a strictly causal comparison."
- The score measures whether the model *verbalizes a planted cue*. It does not measure detection of real sabotage or reward hacking.
- From the user's own Obsidian note: T = 6 and T = 8 may be outside Ouro's trained depth. The design cannot separate "more latent compute" from "running at an untrained loop count."

## Key figures
- `figures/cotmon-fig2-loopdepth.png`: Fig. 2, a 3×3 grid of monitorability versus T for 8 tasks plus the average. Green = standard, orange = Direct Concealment, purple = Monitor-aware Evasion. The 1.4B model is the upper row of each panel. Use it as the main evidence slide.
- `figures/cotmon-fig4-qualitative.png`: Fig. 4, the T=4/6/8 excerpts with cue counts of 22 / 6 / 0. Good as a discussion hook slide.

## Open questions / discussion hooks
1. **Safety:** As reasoning moves into hidden states, is CoT monitoring enough? The OpenAI card already points to activation monitoring. What would a "monitorability score" for latent loops look like?
2. **Measuring intelligence:** A score of 0 cue mentions at T=8 tells us nothing about whether the cue was *used*. How do we measure hidden reliance without reading activations?
3. **Generalization:** Does the T=8 drop show deeper latent reasoning, or out-of-distribution behaviour at an untrained loop count? Would a model trained with variable T behave the same way?
4. **ARC-AGI / scale:** The effect appears only on logic- and science-style puzzles under pressure. Would frontier-scale loopers, rumoured for Astra (`astra`), magnify the effect on hard abstraction tasks? Evidence so far is at 1.4B to 3B parameters only.

## Remark (one sentence)
Looping by itself did not make models less monitorable. But turning up the loop count on the same model, under instructions to hide, made the cue disappear from the CoT on some reasoning tasks (Logic 78% → 42%), and that change was not explained by accuracy or CoT length.
