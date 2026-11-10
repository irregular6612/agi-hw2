# astra — The GPT-6 "Astra" recurrent-depth report and Raschka's analysis

**Citation (slide footer):** S. Raschka, "OpenAI Astra and Looped Transformers," blog (Ahead of AI), Sept 2, 2026. https://sebastianraschka.com/blog/2026/openai-astra-looped-transformers.html
- Longer follow-up: Raschka, "GPT-6 Astra, Looped Transformers, and Hidden Reasoning," Substack, Sept 9, 2026. https://magazine.sebastianraschka.com/p/gpt-6-astra-looped-transformers-and
- Primary sources:
  - A. Efrati & S. Palazzolo, "OpenAI Technique in 'Astra' Model Sparks Security Concerns," *The Information*, Sept 2, 2026 (paywalled; I read only the headline and description). https://www.theinformation.com/articles/secret-technique-behind-openais-astra-model-sparks-security-concerns
  - OpenAI, "GPT-6 Astra System Card," published Sept 3, 2026. https://deploymentsafety.openai.com/gpt-6-astra

**Evidence status:** The architecture claim is a press report from unnamed insiders that OpenAI has not confirmed. The *monitorability decline* is confirmed by OpenAI's own system card. OpenAI says the related rise in CoT controllability is **not** due to architecture. Raschka's posts are expert commentary and contain no new measurements.

## Timeline
| Date (2026) | Who | What |
|---|---|---|
| Sept 2, 00:40 UTC | *The Information* | Reports, citing insiders, that Astra uses "recurrent depth or looped transformer," and links it to CoT being obscured |
| Sept 2 | Raschka (blog) | "A lot of hype ... Let's debunk this a bit." |
| Sept 2–3 (approx.) | J. Pachocki (OpenAI Chief Scientist) | Clarification, quoted in Raschka's Substack (original post not retrieved; exact date [unverified]) |
| Sept 3 | OpenAI system card | Reports "substantial decrease in chain-of-thought monitorability"; says nothing about architecture |
| Sept 9 | Raschka (Substack) | Long version; now judges looped components "highly likely" |

## What was reported (claims)
- *The Information*, as reproduced in Raschka's Fig. 1: "The new technique OpenAI is using, known as recurrent depth or looped transformer, allows an AI model to improve its answers by processing the same text multiple times ... the new technique works in a way that obscures some or all of the AI's reasoning, otherwise known as its 'chain of thought.'"
- Pachocki, as quoted by Raschka: "I want to prevent a race into unmonitorability kicked off by confused reporting. The depth of the computation graph for our present frontier models, including Astra, is within a factor of two of GPT-4. ... I do think it [CoT monitoring] is fragile and unfortunately trending in a negative direction, for reasons not contingent on architecture changes."

## What is confirmed / measured (OpenAI system card, §9)
- "According to our evaluations, GPT-6 Astra shows a substantial decrease in chain-of-thought monitorability compared to previous models."
- §9.1.3: "The regressions are mostly due to the fact that Astra tends to produce shorter, less informative CoTs and seems to have reduced propensity and necessity for verbalizing its reasoning. At longer CoT lengths, Astra's CoT monitorability mostly recovers." The metric is g-mean² (built from TPR and TNR), with GPT-5.6 Sol as the monitor (§9.1.1, Fig. 22).
- CoT controllability (GPT-6 Sol appendix of the same card). Among CoTs of 750–1,250 tokens, the share that follow a requested CoT instruction is: **GPT-6 Astra 60.9%**, GPT-6 Sol 23.2%, GPT-5.6 Sol 16.1%, GPT-5.5 Thinking 1.7%.
- On cause: "We are also quite confident that changes in CoT controllability are **not differentially due to any architectural changes**. ... correlated with the increase in no-CoT capabilities."
- **Never confirmed anywhere:** that Astra is looped or recurrent-depth. §2 "Model Data and Training" describes no architecture.

## Raschka's arguments
**Against the hype (Sept 2 blog):**
- "The looped transformer idea is just reusing layers in the transformer block." His example is Nanbeige4.2-3B, which runs its 22-layer stack twice (44 effective layers, same storage, "almost 2x as expensive in terms of compute"). He reports that Nanbeige found "two passes gave the best trade-off and retained about 75% of the token efficiency."
- The idea traces back to Mixture-of-Recursions (NeurIPS), which uses a learned per-token router for 1, 2 or 3 passes.
- "Reusing layers does not by itself suppress visible chain of thought." The only plausible link: more internal passes could mean fewer reasoning tokens, "but we would get the same effect if we were scaling up the model size, like GPT 5.6 Luna -> GPT 5.6 Sol."
- "Astra may be a really good model, but this shouldn't be about this 'looped transformer aspect,' which is just a tiny architectural tweak."

**Partly in favour (Sept 9 Substack):**
- "still just a rumor or scoop, with no official confirmation ... However, I think it's highly likely that GPT-6 Astra uses looped transformer aspects." His reasons are the reporting, earlier research results, and Pachocki's "factor of two" remark. He adds that this remark "doesn't confirm the looped transformer architecture explicitly, and it could also just mean they use twice as many regular transformer blocks."
- He attributes Astra's gains mainly to "improved training recipes and training data". Shorter CoTs are, in his view, "a side effect of more 'intelligent' or capable models." His evidence: Luna uses "80% more tokens than Sol at similar modeling performance" (AA Intelligence Index v4.3).
- Note for the talk: the "debunk" is about *looping causes hidden CoT*, not about whether Astra loops at all.

## Key figure
- `figures/astra-raschka-figure1.png` (Raschka's Fig. 1, downsampled from 10416 px to 3000 px). It combines the quote from *The Information*, the Nanbeige 4.2 "repeat once with same 22-layer weights" diagram, and the Mixture-of-Recursions router. Credit: Sebastian Raschka.

## Open questions / discussion hooks
1. **Safety:** OpenAI confirms the monitorability loss but rules out architecture as the cause of the controllability rise. If RL plus no-CoT capability is enough to erode CoT monitoring, is the "looped = hidden reasoning" framing a distraction? (Connects to `cotmon`, which finds looping alone does not reduce monitorability.)
2. **Measuring intelligence:** "Fewer tokens at fixed accuracy" could mean more latent compute or simply a more capable model. Which measurement could tell the two apart for a closed model?
3. **ARC-AGI / generalization:** Raschka reports Astra at "99.9% on the ARC-AGI-3 benchmark (GPT-5.6 Sol only 7.8%)". [unverified: secondhand, not checked against ARC Prize.] He also notes, ambiguously, an OpenAI harness change that "tripled GPT 5.6 Sol's performance from to 13.3% to 38.3%". Ask the class: how much of a benchmark jump is architecture, how much is harness?
4. **Virality vs validation:** A paywalled scoop with anonymous sourcing set the research agenda. `cotmon` cites Astra as "speculated" to be looped and uses it as motivation. What evidence should be required before an architecture rumour shapes papers and talks?

## Remark (one sentence)
That Astra loops is still an unconfirmed press report. That Astra's chain of thought got harder to monitor is confirmed by OpenAI, and OpenAI attributes the controllability part to training, not architecture.
