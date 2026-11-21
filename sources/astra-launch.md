# astra-launch — GPT-6 Astra launch: what Altman said, and how big the jump was

Purpose: the opener slide after the title (Altman photo + quote, next to 2–3 headline numbers).

All pages read on 21 Nov 2026. Quotes are copied from the pages or the video captions named. Nothing in quotation marks is paraphrased.

**Citation (slide footer):** OpenAI, "GPT-6 Astra: A new generation of intelligence," 3 Sept 2026, https://openai.com/index/gpt-6-astra/ ; ARC Prize, "OpenAI's GPT-6 Astra on ARC-AGI-3," 3 Sept 2026, https://arcprize.org/blog/astra ; Sources podcast (A. Heath), "Sam Altman on Astra, AGI, and the future of OpenAI," 1 Sept 2026, https://www.youtube.com/watch?v=VeizK1M7V7E

**Evidence status:** Launch date is confirmed (OpenAI page metadata: "September 3"). The "AGI era" line is **Greg Brockman's**, not Altman's. Altman's closest words are hedged ("feels like", "kind of", "sort of. Close at least"). The ARC-AGI-3 99.9% is **confirmed by ARC Prize**, but only under a new harness. Independent indices (Artificial Analysis) show a much smaller jump than OpenAI's own table.

## 1. Did Altman say "we built AGI" about Astra? — No

I found no Altman statement that Astra is AGI or that "we built AGI": not in the launch post, not in his interviews, and not in the press coverage I read. The launch post does not contain the string "AGI" except as benchmark names (ARC-AGI-*). The "AGI era" claim the presenter remembers is Brockman's (§1d).

### 1a. Best slide quote — Altman, Sources podcast (Alex Heath), released 1 Sept 2026, at 46:20
- Video: https://www.youtube.com/watch?v=VeizK1M7V7E (upload date 2026-09-01; "filmed in two parts and in collaboration with TIME"). Recorded **before** launch, after Altman had used Astra internally.
- Source text = YouTube captions (auto-generated; "parody" is the caption's mishearing of "parity"). Speaker turns checked from the caption ">>" markers and the video frame.
- **Slide version (20 words):** "Astra feels like it kind of reached human parity on using computers … one of those steps along the path to AGI"
- **Full context (46:02–46:36):** "The computer use caught me by surprise. Like I had been excited about this for a long time and I had always been disappointed. Like the models were just never that good at clicking around a computer. It was always too slow or it didn't quite work. […] And Astra feels like it kind of reached human parody on using computers. And I don't know why that hit me as like one of those steps along the path to AGI where I was like, "Wow, this is really doing it." But it did hit me that way. Um like an emotional level."
- **Hedges:** "feels like", "kind of", "one of those steps along the path to AGI". It is a claim about computer use, not a claim that Astra is AGI.
- The viral X version, "Astra feels like it reached human parity at using computers." (Dan McAteer, https://x.com/daniel_mac8/status/2094571981685330400, 31 Aug 2026 23:44 UTC), drops "kind of". The clip came from Heath's trailer post "Sam Altman. Sources Podcast. Tomorrow." (https://x.com/alexeheath/status/2094550179341091322, 31 Aug 22:17 UTC). Use the podcast wording, not the X wording.

### 1b. Altman asked directly whether AGI is here — same podcast, 24:39–25:20
- Heath: "How are you feeling about AGI these days?"
- Altman: "I mean, at best you could say it's a very poorly defined term. I was going to say it's like an irrelevant marketing term."
- Heath: "Well, last I checked, your charter defines it as a highly autonomous system that outperforms humans at most economically val valuable work. I think there are many people that would look at current models and say like, "Okay, it's there." […] Um, do you think it's there?"
- Altman: **"Sort of. Close at least."** … "I think there are a lot of a lot of people who would like look at our latest internal models and say this is like very AGI like."
- Later (26:43), on what declaring AGI would mean: "I don't think it matters. There isn't any."
- Caution: ACS Information Age (T. Williams, 7 Sept 2026, https://ia.acs.org.au/article/2026/openai-says-the-agi-era-is-here-experts-disagree.html) attributes "there are many people that would look at current models and say like, 'Okay, it's there'" to Altman. The caption turn markers show that this is **Heath's** line, not Altman's. Do not quote it as Altman's.

### 1c. Altman before launch — TIME, "Inside OpenAI's Reboot" (A. Heath, 26 Aug 2026)
- https://time.com/article/2026/08/26/openai-sam-altman-interview/ (read via fetch; curl was blocked)
- "I expect this will be the first model where the model actually invents new things in a way that matters," Altman told the group.
- "That's a very AGI-like thing."
- Reporter's paraphrase, not a direct quote: Altman said OpenAI was "not quite yet" there, but that by the end of the year the company would have an internal system he would call AGI.

### 1d. Who did say "AGI era" — Greg Brockman (President), press briefing before the 3 Sept launch
- Gizmodo (3 Sept 2026, 4:22 pm ET), https://gizmodo.com/openai-claims-were-in-the-agi-era-with-release-of-gpt-6-astra-2000807013 : "It's not unreasonable to feel that we are now in the AGI era," … "I think that if we fast-forward a couple of years, when we look back and say, 'When was it really that AGI was created?' I think it's going to be about this time, and I think it might be about this model."
- Fox Business and ACS print the first line as "I think it's not unreasonable to feel that we are now in the AGI era." The briefing was not public, so the wording varies slightly by outlet.
- Ynet, https://www.ynetnews.com/tech-and-digital/article/hyosn10000gg : asked directly whether OpenAI had reached AGI, Brockman replied: "For me personally, I do think we're there."
- Brockman on X, 3 Sept 2026 21:46 UTC: "arc-agi-3 is now saturated" (https://x.com/gdb/status/2095629409017614390, quoting ARC Prize's post).

### 1e. Altman on launch day (not about AGI)
- Fox Business, "The Claman Countdown" (3 Sept 2026), https://foxbusiness.com/technology/openai-unveils-gpt-6-astra-major-advances-ai-capabilities : "We have set a new standard with this model. It's why it took us a while to get it out, but we think it'll be worth the wait," (about safety; Fox's lead-in calls Astra "most aligned model ever").

## 2. Performance facts for the chart

| # | Benchmark | Astra | Comparison | Measured by | Flag |
|---|---|---|---|---|---|
| 1 | ARC-AGI-3, Semi-Private, **Standard harness** | **62.7%** (max, $26K) | prev. best Claude Opus 5 **30.2%**; GPT-5.6 Sol **7.8%** | ARC Prize (verified leaderboard) | **Independent**, same harness = fair comparison |
| 1b | ARC-AGI-3, **Provider Adapter harness** | **99.9%** (high, $19K) | GPT-5.6 Sol had no run on this harness | ARC Prize | Independent, but a **new harness introduced with Astra** |
| 2 | Terminal-Bench v4.0 (agentic coding) | **59%** | GPT-5.6 Sol **40%**; Claude Fable 5.1 52% | Artificial Analysis (9 Sept) | **Independent** |
| 2v | Terminal-Bench 4.0 | 57.9% | GPT-5.6 Sol 37.3%; Fable 5.1 55.8% | OpenAI launch table | Vendor |
| 3 | AA-Omniscience hallucination rate (max effort) | **51%** | GPT-5.6 Sol **92%** | Artificial Analysis | **Independent** (lower is better) |
| 4 | AA Intelligence Index (composite) | **53** | GPT-5.6 Sol 47 (derived from "gains 6 points"); tied with Claude Fable 5.1 (53) | Artificial Analysis | **Independent**: the counterpoint, a modest jump |

Sources and exact wording:
- **ARC Prize blog** (G. Kamradt, 3 Sept 2026, https://arcprize.org/blog/astra): "GPT-6 Astra scores 62.7% for $26K on ARC-AGI-3 Semi-Private with our Standard harness, and 99.9% for $19K with a Provider Adapter harness." "It used fewer actions than the median tested human on 96% of levels." "With the Provider Adapter harness, Astra's best observed score on ARC-AGI-3 Semi-Private increased from 62.7% to 99.9%." And: "we are not claiming that it is AGI."
  - Harness definitions (same page): Standard "enables a model to carry forward notes it chooses to keep"; Provider Adapter "preserves opaque reasoning state between requests and uses compaction for longer conversations."
- **ARC Prize leaderboard** (https://arcprize.org/leaderboard, data read 21 Nov): Claude Opus 5 (high) 30.2% $20.7K (release 2026-07-24); GPT-5.6 Sol (max) 7.8% $25.1K. Standard-harness runs only for both. Later entries, after Astra: Claude Fable 5.2 81.2% Standard (2026-11-09); GPT-6.2 Astra 100.0% Provider Adapter (2026-11-17).
- **OpenAI launch post** (3 Sept 2026, https://openai.com/index/gpt-6-astra/): "Astra also saturates ARC-AGI-3 with a 99.9% score and ExploitBench with a 100% score." The table puts Astra 99.9% next to GPT-5.6 Sol 7.8% and Claude Opus 5 30.2%. Footnote 1: "On ARC-AGI-3, GPT-6 Astra was run with our responses API harness, which changes two settings to better match real-world performance."
  - **Unfair comparison on the vendor chart:** 99.9% (Provider Adapter) is set against 7.8% and 30.2% (Standard). For like-for-like, use 62.7% vs 30.2% vs 7.8%.
  - OpenAI's own harness post (29 July 2026, https://openai.com/index/how-two-settings-tripled-our-arc-agi-3-scores/): "With the official harness, GPT‑5.6 Sol scored 13.3% on the ARC-AGI-3 public set. With retained reasoning and compaction, it scored 38.3%." This is the "tripled" figure Raschka quoted (`astra.md`); it is on the **public** set, not the leaderboard's semi-private set.
- **Epoch AI review of ARC-AGI-3** (as of 30 Oct 2026, https://epoch.ai/benchmarks/arc-agi-3/review): the headline score is Relative Human Action Efficiency, not a percent correct. "the average human tester would only score 48% on the public set." "every model evaluated at the same effort level under both harnesses scored substantially higher with the 'Provider Adapter' harness." Use these as caveats if anyone asks what "99.9%" means.
- **Artificial Analysis** ("Benchmarking GPT-6 Astra", 9 Sept 2026, https://artificialanalysis.ai/articles/benchmarking-gpt-6-astra): "GPT-6 Astra (max) scores 53 in the Index, level with Claude Fable 5.1 (max with fallback). It gains 6 points on its predecessor, GPT-5.6 Sol (max)." "GPT-6 Astra scores 59% on Terminal-Bench v4.0, ahead of Claude Fable 5.1 (52%) and 19 points ahead of GPT-5.6 Sol (40%)." Hallucination: "a significant decrease in hallucination rate from 92% to 51% at max effort." It also reports a drop of ~45 Elo points in GDPval-AA v2 relative to Sol.
  - Index history: OpenAI's launch table cites AA Intelligence Index v4.1.1 as Astra 61.2 vs Sol 60.9 vs Fable 5.1 65.7, which is **no jump**. The Decoder (5 Sept, https://the-decoder.com/artificial-analysis-overhauls-its-intelligence-index-after-gpt-6-astra-scoring-drew-skepticism/) reports that AA revised the index (v4.2) after that result drew criticism. Index numbers depend on the version, so put the version on the slide.

**"Something earlier models could not" (vendor claim, not independently checked):** OpenAI launch post, footnote 9: "For more than a decade, the best known result established that infinitely many pairs of primes are at most 246 apart. Julia Stadlmann recently improved that bound to 240. Astra helped establish a stronger bound of 186". Footnote 10: "Astra improved a term in a bound on these gaps that had remained unchanged for more than 80 years." OpenAI links proofs, but I did not find a mathematician's independent check. Say "OpenAI reports".

**Not verified / do not use without a check:**
- FrontierMath Tier 4 (v2): OpenAI's table gives 97.6% vs Sol 83.0%, and the prose says "98%". Epoch's hub page renders its data with JavaScript, and I could not read Astra's entry. The Decoder says Epoch ranked Astra first of 267 models (169 points), but that is secondhand.
- OpenAI's "ExploitBench 100%" and the internal evaluations are vendor-only.

## 3. Photo

- File: `figures/altman-photo.jpg` (1216 × 1140 px, JPEG, no resize needed). Downloaded 21 Nov 2026.
- Commons page: https://commons.wikimedia.org/wiki/File:Sam_Altman_speaking_at_TED_(cropped).jpg
- Author: Steve Jurvetson (individual photographer, not press or agency). Original on Flickr: https://www.flickr.com/photos/jurvetson/54446118165/
- Taken 11 Apr 2025, TED. License: **CC BY 2.0** (https://creativecommons.org/licenses/by/2.0), attribution required.
- **Credit line:** Photo: Steve Jurvetson, "Sam Altman speaking at TED" (cropped), CC BY 2.0, via Wikimedia Commons.
- Rejected: TechCrunch Disrupt photos (press), Modi/India photo (GODL-India, not CC), White House dinner 2025 (public domain, but a group shot).

## Open questions / discussion hooks
1. The "AGI" framing came from OpenAI's president, not from its CEO. Altman's own words are hedged, and he calls AGI "a very poorly defined term". Who in a company gets to "declare" AGI?
2. The headline 62.7% → 99.9% jump on ARC-AGI-3 is mostly a **harness** change: keeping opaque reasoning state between calls. This links to the hidden-reasoning thread (`astra.md`, `astra-rumor.md`): the harness that gives the big number is the one that keeps the reasoning out of sight.
3. Benchmark vs index: near-perfect scores on single benchmarks, but the composite index moved only +6 (or 0 on v4.1.1). Which one is "the jump"?

## Remark (one sentence)
Altman never said Astra is AGI. His closest words were that Astra "feels like it kind of reached human parity on using computers" and that AGI is "sort of. Close at least." The "AGI era" line is Brockman's. The independent like-for-like ARC-AGI-3 jump is 30.2% → 62.7% (99.9% needs the new harness).
