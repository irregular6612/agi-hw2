# Current context added on 2026-11-08

Scope: four introductory slides after the original title. Existing 149 slides and notes are preserved. Slide text is English; spoken notes are Korean, matching the original deck. This is an update digest, not a revision of the older astra.md.

## 1. Astra discussion: reported architecture, not confirmed architecture

- The Information, Amir Efrati, Stephanie Palazzolo and Rocket Drew, 2026-09-01: https://www.theinformation.com/articles/secret-technique-behind-openais-astra-model-sparks-security-concerns . Title/byline accessible; detailed anonymous-insider claim is behind a paywall and was checked through explicit attribution in the sources below. The old deck uses September 2; it was not edited.
- Sebastian Raschka, 2026-09-02, first-person technical commentary: https://sebastianraschka.com/blog/2026/openai-astra-looped-transformers.html . Describes the public attention around the Astra/recurrent-depth report. Reusing layers does not itself imply removal of visible CoT.
- Jakub Pachocki X: https://x.com/merettm/status/2095023204993490967 . X direct retrieval returned 403. The linked statement is reproduced by Raschka and Model Republic. Computational depth within a factor of two of GPT-4 is not confirmation of looping.
- Raschka, 2026-09-09: https://magazine.sebastianraschka.com/p/gpt-6-astra-looped-transformers-and . Explicitly treats the architecture as not officially confirmed.
- Official release: https://openai.com/index/gpt-6-astra/ . Official monitorability evaluation: https://deploymentsafety.openai.com/gpt-6-astra/monitorability . These do not specify a looped architecture. No causal claim linking looping to the reported monitorability changes is made in the new slides.

## 2. Azure wording: a reported screenshot about GPT-6.1 Sol

- Original post: https://x.com/Algorithon/status/2107287650881208694 ; deletion report: https://x.com/Algorithon/status/2107318545529065613 . Direct X retrieval blocked; use the status label "X post / screenshot reproduced by Model Republic".
- Philip Dowdell, Model Republic, 2026-10-16: https://www.modelrepublic.org/articles/are-astra-and-gpt-6-1-sol-less-monitorable . Own investigation, links the posts and reproduces the Azure screenshot. Describes initial circulation on October 5; new slide says early October to avoid time-zone ambiguity.
- Screenshot phrase used on slide (6 words): "two inference passes instead of three". Full screenshot is not embedded; text is editable and hyperlinks lead to the published reproduction and X posts.
- Current Azure page: https://ai.azure.com/catalog/models/gpt-6.1-sol . The retrieved current page lacks the passes wording. The historical screenshot concerns Sol, not Astra. Its interpretation as shared-block recurrence is an inference, not a published blueprint of Astra. We do not assert the screenshot's authenticity from direct historical Azure access.

## 3. ICLR 2027 submission trend

Source: independent analysis https://txie1.github.io/iclr2027-trends/ , OpenReview metadata snapshot 2026-10-26. Embedded JSON was inspected, not inferred from chart heights.

| Year | Matching papers | All submissions | Recomputed share |
|---|---:|---:|---:|
| ICLR 2026 | 48 | 19,814 | 0.24225295% |
| ICLR 2027 | 289 | 42,822 | 0.67488674% |

Displayed shares are **0.24% and 0.67%**, rounded directly from counts. The website stores 0.675% for 2027; rounding that already-rounded value to 0.68% would introduce double rounding. Share ratio from raw counts is about 2.79. The site's displayed growth uses smoothing, so it is not copied.

Category: Latent, looped & recurrent-depth reasoning.
Search title + abstract using:

```text
latent reasoning|continuous (thought|reasoning)|looped (transformers?|language models?|models?)|recurrent[- ]depth
```

Includes withdrawn and desk-rejected submissions. A mention does not establish architectural use. These are not counts of accepted papers or a census of pure Looped Transformer work. The broader 381-paper looped/latent/delta-rule bucket is not used. This independent metadata analysis is primary evidence for its own keyword counts, not an official ICLR statistic.

## 4. Recent paper map

The map uses primary arXiv abstracts for the research topics. The ICLR affiliations of five papers come from https://github.com/kuoyang1999/awesome-tiny-recursive-models ; direct OpenReview pages and API2 returned browser verification / 403. Only Closing the Loop has a directly verified ICLR 2027 review header in its PDF. The slide therefore describes recent preprints, not six independently verified acceptance decisions.

| Topic [ours] | Paper | Primary source | OpenReview pointer |
|---|---|---|---|
| Training | Closing the Loop: Practical Training Recipes for Looped Language Models | https://arxiv.org/abs/2610.00673 ; PDF first line: under review at ICLR 2027 | https://openreview.net/forum?id=zsC1D9PH9q |
| Scaling | Scaling Laws for Looped Mixture of Experts | https://arxiv.org/abs/2609.40316 | https://openreview.net/forum?id=wvQiB7TLyy |
| Matched compute | SMELT: Scaling Laws for Compute-Matched MoE Looped Transformers | https://arxiv.org/abs/2609.01343 | https://openreview.net/forum?id=RFvMxqnGL9 |
| Decoding | Decoding Looped Transformers Better for (Almost) Free | https://arxiv.org/abs/2610.02185 | https://openreview.net/forum?id=Cy47kynZ5K |
| Routing | Shared Weights, Selected Computations: How Looped Transformers Route What Each Loop Does | https://arxiv.org/abs/2609.39892 | https://openreview.net/forum?id=bz5YoJ20wr |
| Mechanisms | Looped Transformers under the Jacobian Lens: Does the Global Workspace Survive Recurrence? | https://arxiv.org/abs/2609.01924 | https://openreview.net/forum?id=EwfPUo0f4x |

Synthesis [ours]: media attention and a broader research agenda make looping a timely topic. Temporal concurrence does not establish that the Astra launch caused the submission increase.
