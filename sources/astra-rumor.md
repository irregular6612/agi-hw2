# astra-rumor — How the "Astra loops" claim spread (1–3 Sept 2026)

Purpose: the opening hook. These are the pieces that *asserted or amplified* that GPT-6 Astra uses a looped / recurrent-depth Transformer. Raschka's posts (`astra.md`) are commentary that pushes back; they are not the rumor itself.

All pages read in the browser on 21 Nov 2026. Quotes below are copied from the pages.

## 1. The scoop — The Information, Tue 1 Sept 2026 (US date)
- A. Efrati, S. Palazzolo, R. Drew, "OpenAI Technique in 'Astra' Model Sparks Security Concerns." https://www.theinformation.com/articles/secret-technique-behind-openais-astra-model-sparks-security-concerns
- Paywalled. Only the headline, byline and date are visible. The page shows "Sep 1, 2026" (US time; `astra.md` gives 00:40 UTC on 2 Sept, same event).
- The body text we have is the passage Raschka reproduced in his Fig. 1 (see `astra.md`): "recurrent depth or looped transformer" ... "obscures some or all of the AI's reasoning."
- Sourcing: unnamed insiders (per Raschka and TechCrunch's summary).

## 2. Amplified — TechCrunch, Wed 2 Sept 2026
- R. Brandom, "OpenAI's new reasoning technique alarms AI safety experts." https://techcrunch.com/2026/09/02/openais-new-reasoning-technique-alarms-ai-safety-experts/
- Repeats the scoop: Astra "will use a reasoning technique called 'recurrent depth'," as "The Information reported on Tuesday."
- Hedge in the same article: "Astra's use of the technique is reportedly limited"; the chain of thought "is still expected to be legible."
- Reactions it quotes:
  - Buck Shlegeris (Redwood CEO): "I am extremely concerned by the reporting that Astra uses opaque recurrence."
  - Ryan Greenblatt (Redwood): worry about "scaling up the opaque reasoning to the point where the model reasons entirely or almost entirely in latent space."
  - Zvi Mowshowitz: "The technique is playing with fire."
- Also: a follow-up report from The Information (Wed morning) said Anthropic and Google DeepMind "were already discussing the technique."

## 3. Went viral — X, Alex Volkov (@altryne), 2 Sept 2026, ≈18:30 UTC
- https://x.com/altryne/status/2095217761643561147 (time decoded from the post ID; no date shown in the page text)
- "If you are seeing "loop transformers", "recurrent depth" and "Neuralese" all over your timeline all of the sudden like me, here's why:" followed by an X article "Looped Transformers discourse summary" (7 min read).
- Use: evidence that the claim was trending, not evidence about Astra.
- For reference, Raschka's own X post with "A lot of hype around OpenAI's Astra model" decodes to ≈13:26 UTC the same day (https://x.com/rasbt/status/2095141254958858496).

## 4. Stated as fact — Fortune, Thu 3 Sept 2026, 1:51 PM ET
- J. Kahn, "Safety experts warn novel design of OpenAI's Astra model could make future AI agents harder to monitor" (page title: "AI experts worry OpenAI's Astra model may be a dangerous step toward models with opaque reasoning"). https://fortune.com/2026/09/03/reports-openais-astra-model-uses-a-new-more-efficient-ai-architecture-alarms-ai-safety-experts-who-worry-the-method-makes-models-harder-to-control/
- Asserts without hedging: "For its new model, OpenAI has employed a method alternately referred to as "recurrent depth" or "looped Transformers" for a portion of the model's internal architecture."
- Credits the scoop: "The Information first reported on OpenAI's use of recurrent depth in Astra earlier this week."
- Steven Adler (ex-OpenAI safety), on X, quoted by Fortune: if the report was true, "OpenAI seems to be violating one of the few redlines that exists in the AI industry."
- Peter Wildeford: "potentially very concerning" and "potentially reckless."
- OpenAI side, as Fortune reports it:
  - Pachocki on X: "OpenAI has worked to preserve and utilize chain-of-thought monitoring since our very first reasoning models." He "said OpenAI would share more details of Astra's architecture in the future."
  - Fortune's paraphrase (not a direct quote): Pachocki and other OpenAI researchers said "it had limited the extent to which the looped Transformer architecture is used so that the model's reasoning remains legible." [Caution: this is Fortune's wording. None of the direct quotes we have (here, TechCrunch, Raschka) contains an explicit admission that Astra loops. Treat as "reported," not "confirmed."]
- Fortune's explainer line "Studies have shown looped Transformers can achieve the same performance as standard ones while using 50% to 90% less computing power" has no citation. Do not reuse it.

## Evidence status (for the slide)
- Origin: one paywalled scoop with unnamed sources (1 Sept).
- Within ~48 hours: TechCrunch repeated it, safety researchers reacted, X was flooded, Fortune stated it as fact.
- OpenAI never confirmed the architecture in the system card (`astra.md`). Pachocki's direct quotes defend CoT monitoring and promise details later.

## Remark (one sentence)
One paywalled scoop became, within two days, a stated fact in national press; the architecture itself was never confirmed.
