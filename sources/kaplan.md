# kaplan — Scaling Laws for Neural Language Models

**Citation (slide footer):** Kaplan, McCandlish, Henighan, Brown, Chess, Child, Gray, Radford, Wu, Amodei, "Scaling Laws for Neural Language Models", arXiv:2001.08361, 2020
Source checked: arXiv v1 PDF (downloaded 2026-11-21), Sec 1.2, Sec 2, Sec 3.2.1, Figure 7 caption. Figure 17 (appendix) itself was not inspected.

**Evidence status:** Preprint with large-scale measurements (OpenAI, WebText2, 1024-token context). Widely cited.

## Claims we use

- **Scale, not shape (Part 1 of storyline v5).** Sec 1.1 summary: "Performance depends strongly on scale, weakly on model shape." Scale = non-embedding parameters N, data D, compute C. "Within reasonable limits, performance depends very weakly on other architectural hyperparameters such as depth vs. width" (Sec 1.1, details in Sec 3). Performance follows a power law in each of N, D, C when the other two do not bottleneck it ("Smooth power laws", Sec 1.1).
  - Use: the loss proxy says "make it bigger", not "make it deeper". Note the metric is test loss (cross-entropy), not reasoning accuracy. Saunshi et al. 2025 argue reasoning needs depth more than parameters (`saunshi.md`), which is the gap this proxy hides.
- **Transformers beat LSTMs as they scale (#3).** Figure 7 compares them at equal non-embedding parameters, same data and context length. LSTMs match Transformers on tokens early in the context but "cannot match" them on later tokens (Sec 3.2.1). Figure 7 headline: Transformers "asymptotically outperform LSTMs due to improved use of long contexts"; LSTMs plateau after under 100 tokens.
  - Note: the paper's stated reason is better use of long context, not parallelism. Parallel training is Vaswani's argument (`vaswani.md`). Keep the two reasons separate on #3.
- **Looping was already measured in 2020 (#91, also usable on #77).** The authors also trained Universal Transformers ("recurrent Transformers"). These "re-use parameters, and so perform slightly better as a function of N, at the cost of additional compute per-parameter" (Sec 3.2.1, Figure 17).
  - This is the earliest scaling-law evidence for our bottleneck 1: looping saves parameters, not compute.

## Not checked

- Exact numbers in Figure 7 and Figure 17. Do not put numbers from these figures on slides until the figures are read.
