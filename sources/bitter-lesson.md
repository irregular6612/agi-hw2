# bitter-lesson — The Bitter Lesson (Sutton, 2019)

**Citation (slide footer):** R. Sutton, "The Bitter Lesson", essay, March 13, 2019. http://www.incompleteideas.net/IncIdeas/BitterLesson.html
Source checked: full text (about 1,100 words), read 2026-11-21.

**Evidence status:** An opinion essay built on historical examples (chess, Go, speech recognition, computer vision). It has no experiments. Treat it as a framing, not a result.

## Claims we use (slides #3, #91)

- **Main claim:** across 70 years of AI, general methods that leverage computation win "by a large margin". The ultimate reason given is the falling cost of computation (Moore's law, generalized).
- **What scales:** search and learning are named as the two methods that "seem to scale arbitrarily" with more computation.
- **The pattern:** building in human knowledge helps in the short run, then plateaus and can even inhibit progress. Breakthroughs come from scaling computation.
- **Second lesson (useful for #91):** the contents of minds are too complex to build in. We should "build in only the meta-methods" that find this complexity. The essay also notes modern vision nets keep a few built-in ideas (convolution, certain invariances) and still win. So the essay does not say "zero inductive bias"; it says "do not build in what we think we know about the content".

## Not in the essay

- The word "Transformer" does not appear. Linking the Transformer's success to the Bitter Lesson is **our** interpretation (`[ours]` on #3).
- The essay says nothing about recurrence, depth, or looping. The "tension" line on #91 is ours.
