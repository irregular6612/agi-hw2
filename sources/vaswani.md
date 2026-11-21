# vaswani — Attention Is All You Need

**Citation (slide footer):** Vaswani, Shazeer, Parmar, Uszkoreit, Jones, Gomez, Kaiser, Polosukhin, "Attention Is All You Need", NeurIPS 2017 · arXiv:1706.03762
Source checked: arXiv v7 PDF (downloaded 2026-11-21), Sec 1, Sec 3.5, Sec 4, Table 1.

**Evidence status:** Peer-reviewed. Table 1 is an analytical complexity comparison, not a measurement.

## Claims we use (slide #2)

- **RNNs cannot parallelize within a sequence.** Recurrent models compute h_t from h_{t−1} and the input at t. The paper says this "inherently sequential nature precludes parallelization within training examples" (Sec 1). It adds that this "fundamental constraint of sequential computation" remains despite efficiency tricks.
- **The Transformer drops recurrence and parallelizes.** It relies "entirely on an attention mechanism" and "allows for significantly more parallelization" (Sec 1).
- **Table 1 (per layer, n = sequence length, d = width):**
  - Self-attention: complexity O(n²·d), sequential operations O(1), maximum path length O(1).
  - Recurrent: complexity O(n·d²), sequential operations O(n), maximum path length O(n).
  - Use: "attention cost grows with the square of length" and "any token can reach any other in one step" both come from this table.
- **Order comes only from positional encodings.** Because the model has "no recurrence and no convolution", position information must be injected separately (Sec 3.5).
- **Shorter paths make long-range dependencies easier to learn** (Sec 4, citing Hochreiter et al.). This is the paper's stated reason for comparing path lengths.

## Not in the paper

- The paper does not use the phrase "inductive bias". Our #2 sentence on the Transformer's inductive bias is our characterization, supported by Sec 3.5 (no built-in order) and Battaglia et al. 2018 (`battaglia.md`).
- The paper does not study scaling laws. For "scales with compute", use `kaplan.md`.
