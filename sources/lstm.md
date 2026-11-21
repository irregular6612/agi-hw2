# lstm — Long Short-Term Memory

**Citation (slide footer):** Hochreiter, Schmidhuber, "Long Short-Term Memory", Neural Computation 9(8):1735–1780, 1997
Source checked: abstract and opening pages only (6-page excerpt PDF from a CMU course reading list, downloaded 2026-11-21). The full 46-page journal version was not read.

**Evidence status:** Peer-reviewed. We use only the abstract.

## Claims we use (slide #2)

- **Plain RNNs struggle with long time lags.** Learning to store information over long intervals with recurrent backpropagation "takes a very long time, mostly because of insufficient, decaying error backflow" (Abstract). This is the vanishing-gradient problem.
- **LSTM is the fix.** Gated "constant error carousels" keep error flow constant, and LSTM bridges time lags beyond 1000 steps on artificial tasks (Abstract).
- **Cost per step is constant.** LSTM's "computational complexity per time step and weight is O(1)" (Abstract). This supports "memory per token is constant" for RNNs.

## How to say it on the slide

- Say "plain RNNs lose distant information (vanishing gradients); LSTM reduced this but kept the one-step-at-a-time structure." Do not say LSTM solved long-range dependencies outright. Kaplan et al. 2020 still find LSTMs plateau after under 100 tokens of context (`kaplan.md`).
