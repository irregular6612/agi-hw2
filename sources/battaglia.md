# battaglia — Relational inductive biases, deep learning, and graph networks

**Citation (slide footer):** Battaglia et al., "Relational inductive biases, deep learning, and graph networks", arXiv:1806.01261, 2018
Source checked: arXiv v3 PDF (downloaded 2026-11-21), Sec 2, Table 1, and the self-attention passages (Sec 3.2.3 area, Appendix).

**Evidence status:** Position/review paper. Table 1 is a conceptual classification, not a measurement.

## Claims we use (slide #2, inductive-bias row)

- **Table 1 ("relational inductive biases in standard deep learning components"):**
  - Recurrent: entities = timesteps, relations = sequential, inductive bias = **sequentiality**, invariance = **time translation** (the same rule is applied at every step).
  - Fully connected: relations = all-to-all, inductive bias = **weak**.
  - Convolutional: locality, spatial translation. Graph network: arbitrary, node/edge permutations.
- **Self-attention is treated as a non-local / graph-network-style operation** (it cites Vaswani et al. 2017 among "self-attention"-style methods, and writes Transformer self-attention in its graph-network notation). Table 1 has no Transformer row.

## How to say it on the slide

- RNN row on #2 is directly supported (sequentiality, same rule every step). UT's wording, an inductive bias "towards learning iterative or recursive transformations", says the same thing (`ut.md`).
- Transformer row on #2 ("almost no assumption about order or distance; which relations matter is learned") is **our** reading of attention as all-to-all interaction with order supplied only by positional encodings (`vaswani.md`). Mark it `[ours]` or cite as "cf. Battaglia et al. 2018".
