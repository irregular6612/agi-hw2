// §3 Q2 — Can we train a looped model so that extra loops help at test time?  (Session A, mechanism in depth)
const { T, add, figSeq, image, spotlight, text, remark } = require("./lib");
const { cover, answer } = require("./common");

const YANG = 'Yang, Lee, Nowak, Papailiopoulos, "Looped Transformers are Better at Learning Learning Algorithms", ICLR 2024';
const HUG = 'Geiping et al., "Scaling up Test-Time Compute with Latent Reasoning: A Recurrent Depth Approach", arXiv:2502.05171 (2025)';

module.exports = function () {
  cover("Q2", "Q1 showed that loops can compute in principle. Now: can gradient descent find those weights, and does the model actually get better when we let it loop more at test time?");

  figSeq({
    crumb: ["Q2", "Yang"], cite: `${YANG}, Fig. 1 and Sec. 4.1`,
    title: "One looped layer learns in-context regression",
    fig: "yang-fig1.png", layout: "top",
    items: [
      { label: "The task: regression in context.", body: "The prompt holds (x, y) pairs from a hidden w; the model predicts y for a new x.", box: [0, 0, 1, 0.4] },
      { label: "A 12-layer Transformer solves it in one pass.", body: "It learns roughly the closed-form answer, which needs a matrix inverse.", box: [0, 0.41, 0.48, 0.99] },
      { label: "Yang et al. loop one layer instead.", body: "The ⊕ adds the prompt back before every pass: Yₜ₊₁ = M(Yₜ + P).", box: [0.5, 0.41, 0.99, 0.73] },
      { label: "Each pass can act like one gradient-descent step.", body: "Gradient descent is repeated matrix products, which one block can apply again and again.", box: [0.5, 0.75, 0.99, 0.99] },
    ],
    remark: "Giannou hand-set the weights of a looped Transformer; Yang trains them. Only the last 15 of 20 loops are supervised.",
    notes: [
      "Setup from Garg et al. 2022: linear regression in context, d = 20, k = 40 examples.",
      "The 12-layer GPT-2 baseline has 9.48M parameters.",
      "Input injection is the key design choice. Remember the ⊕; Huginn will reuse it.",
      "This is the authors' motivation, an analogy, not a proof that the loop implements GD.",
      "Training loss is averaged over the last T of b iterations (b = 20, T = 15), like truncated backprop through time.",
    ],
  });

  figSeq({
    crumb: ["Q2", "Yang"], cite: `${YANG}, Fig. 3 (values read from the plot)`,
    title: "Without input injection, loops drift past training",
    fig: "yang-fig3.png",
    items: [
      { label: "Weight tying alone: Yₜ₊₁ = M(Yₜ).", body: "Error is lowest at the trained loop count (dashed), then climbs toward 1 by 100 loops.", box: [0.18, 0.13, 1.0, 0.62] },
      { label: "With injection: Yₜ₊₁ = M(Yₜ + P).", body: "Error stays near 10⁻³ out to 100 loops: a fixed point, not drift.", box: [0.18, 0.74, 1.0, 0.86] },
    ],
    remark: "Feeding the input into every pass is what makes extra loops safe.",
  });

  figSeq({
    crumb: ["Q2", "Yang"], cite: `${YANG}, Fig. 2 and Sec. 5.2`,
    title: "One looped layer matches 12 layers with 1/12 the parameters",
    fig: "yang-fig2.png", layout: "top",
    items: [
      { label: "Error falls to about 10⁻³ within 20–30 loops, and stays there to 100.", box: [0, 0, 0.36, 1] },
      { label: "Looped (0.79M params) and 12-layer (9.48M) curves overlap.", body: "Both track least squares across 0–40 examples.", box: [0.38, 0, 0.99, 1] },
    ],
    remark: "Parameters were saved; compute was not. Twenty passes of one layer cost more than one pass of twelve, and FLOPs are not reported.",
  });

  figSeq({
    crumb: ["Q2", "Huginn"], cite: `${HUG}, Fig. 2 and Sec. 3.1–3.2`,
    title: "Huginn: embed once, loop a core r times, decode once",
    fig: "huginn-fig2.png", layout: "top",
    items: [
      { label: "The prelude embeds once.", body: "Two layers P map the input tokens to e.", box: [0.03, 0.05, 0.25, 0.3] },
      { label: "The state starts from noise.", body: "s₀ is random, so the answer should not depend on where the loop starts.", box: [0.13, 0.33, 0.29, 0.62] },
      { label: "One shared core runs r times.", body: "Four layers R, reused: r = 32 gives an effective depth of 132 layers with no new parameters.", box: [0.29, 0.32, 0.69, 0.62] },
      { label: "The input is re-injected at every pass.", body: "Each R reads [sᵢ, e]: Yang's ⊕, at LLM scale.", box: [0.23, 0.08, 0.66, 0.36] },
      { label: "The coda decodes the final state.", body: "Two layers C turn s_R into next-token probabilities.", box: [0.69, 0.05, 0.94, 0.45] },
    ],
    remark: "Same recipe as Yang, scaled up: 3.5B parameters trained on 800B tokens.",
    notes: [
      "e = P(x). Prelude and coda together hold about 1.5B parameters.",
      "s₀ ~ N(0, σ²I). With input injection this promotes path independence (Anil et al. 2022).",
      "Effective depth = 2 + 4·32 + 2 = 132. The core is another 1.5B parameters.",
      "An adapter maps the concatenation [sᵢ, e] from 2h back to h.",
      "p = C(s_r).",
      "Trained on 4,096 AMD MI250X GPUs on Frontier.",
    ],
  });

  add({
    crumb: ["Q2", "Huginn"], cite: `${HUG}, Sec. 3.1`,
    title: "Only the middle is looped: first and last layers differ",
    notes: "Read the quote, then flag the grey box clearly as our framing. The course page states the 'every role' reason as fact; the paper never tests it.",
    draw: (s) => {
      text(s, [
        { text: "“", options: { color: T.gold, bold: true, fontSize: 40 } },
        { text: "the initial and the end layers … are noticeably different, whereas middle layers are interchangeable and permutable.", options: { italic: true } },
      ], { x: 1.0, y: 1.7, w: 11.3, h: 1.8 }, { fontSize: 28 });
      text(s, "Geiping et al., citing analyses of fixed-depth LLMs", { x: 1.0, y: 3.5, w: 11.3, h: 0.4 }, { fontSize: 16, color: T.gray });
      s.addShape("rect", { x: 1.0, y: 4.5, w: 11.3, h: 1.6, fill: { color: "F2F2F2" }, line: { type: "none" } });
      text(s, [
        { text: "[ours]  ", options: { bold: true, color: T.gray } },
        { text: "One way to read it: without a prelude and a coda, a single block would have to play every role, from reading tokens to writing them. The paper does not test this; it has no ablation that removes them." },
      ], { x: 1.25, y: 4.7, w: 10.8, h: 1.3 }, { fontSize: 19 });
    },
  });

  figSeq({
    crumb: ["Q2", "Huginn"], cite: `${HUG}, Fig. 3, Eq. 1–2 and Sec. 3.3`,
    title: "Train on random loop counts; backprop only the last 8",
    fig: "huginn-fig3.png",
    items: [
      { label: "Sample r for every step.", body: "r follows a log-normal Poisson: mean 33, mode 24, with a long tail to ~150.", box: [0.15, 0.02, 0.98, 0.72] },
      { label: "Backprop through the last 8 passes only.", body: "Memory stays fixed however large r is. The prelude still learns, because e enters every pass." },
    ],
    remark: "Training on many depths is what makes depth a dial at test time.",
    notes: ["τ ~ N(log r̄ − ½σ², σ), r ~ Poisson(e^τ) + 1, with r̄ = 32 and σ = ½.", "Truncated backprop, k = 8. One r per micro-batch, synchronized across workers."],
  });

  figSeq({
    crumb: ["Q2", "Huginn"], cite: `${HUG}, Fig. 5 and Sec. 4.3`,
    title: "Two failed runs: states collapsed, or the loop was ignored",
    fig: "huginn-fig5.png", layout: "top",
    items: [
      { label: "Bad Run 1: every token's state became the same.", body: "Hidden-state correlation (middle, orange) sat at 1.0, and the loss stalled.", box: [0.27, 0.03, 0.56, 0.84] },
      { label: "Bad Run 2: the model learned to ignore its loop.", body: "Validation perplexity (right, green) was the same at 1 and at 32 recurrences.", box: [0.58, 0.03, 0.96, 0.84] },
      { label: "The main run fixed norms and lowered the learning rate.", body: "Its states stay distinct (blue, middle), and more recurrence gives lower perplexity (blue, right)." },
    ],
    remark: "Looping at scale is fragile. Both failures came from normalization and learning rate, not from the idea.",
  });

  figSeq({
    crumb: ["Q2", "Huginn"], cite: `${HUG}, Fig. 7 and Table 4`,
    title: "Accuracy rises with loops, then saturates task by task",
    fig: "huginn-fig7.png",
    items: [
      { label: "Easy tasks saturate early.", body: "HellaSwag is near its peak by r = 8.", box: [0.13, 0.25, 0.99, 0.64] },
      { label: "Hard tasks keep climbing to r ≈ 32.", body: "GSM8K CoT goes from 0.00 at r = 1 to 42.08 at r = 32 (Table 4).", box: [0.13, 0.43, 0.99, 0.87] },
      { label: "No single depth suits every task.", body: "The ceiling depends on the task, and on how much context it gives (Fig. 9)." },
    ],
    remark: "Extra loops are useful only up to a ceiling that the task sets.",
    notes: ["", "Table 4 (800B tokens): GSM8K CoT strict/flexible 34.80/42.08 at r = 32 vs 0.00/0.00 at r = 1. ARC-C 24.06 → 38.23.", "ARC-C saturates at 8–12 iterations zero-shot, about 32 at 25–50-shot."],
  });

  figSeq({
    crumb: ["Q2", "Huginn"], cite: `${HUG}, Fig. 11 and Sec. 7`,
    title: "Each token converges at its own pace",
    fig: "huginn-fig11.png",
    items: [
      { label: "Rows are tokens; color is distance to the final state.", body: "Darker means closer. Most tokens settle within about 30 passes.", box: [0.11, 0.02, 0.87, 0.94] },
      { label: "The key words of an unsafe request settle last.", body: "“really wrong” stays far from its fixed point for 60 passes.", box: [0.0, 0.558, 0.87, 0.618] },
    ],
    remark: "If depth needs differ by token, one global r wastes compute. Q3 picks this up.",
    notes: ["The final state s* is computed at r = 128. Prompt: an unsafe request about making a bomb."],
  });

  figSeq({
    crumb: ["Q2", "Huginn"], cite: `${HUG}, Fig. 12 and Sec. 7 (qualitative, a few prompts)`,
    title: "Latent thoughts take shapes: fixed points, orbits, sliders",
    fig: "huginn-fig12.png",
    figBox: { x: T.X, y: 1.3, w: 6.6, h: 5.6 }, textBox: { x: 7.4, y: 1.45, w: 5.5, h: 5.4 },
    items: [
      { label: "Fixed point: “deeper” settles to one spot.", box: [0, 0, 1, 0.33] },
      { label: "Orbit: the number “3” keeps circling.", body: "Like the periodic number features in small arithmetic models (Nanda et al., 2022).", box: [0, 0.345, 1, 0.665] },
      { label: "Slider: “wrong” drifts in one direction.", body: "The authors suggest it could count passes.", box: [0.34, 0.68, 0.65, 1.0] },
    ],
    remark: "These are pictures of a few prompts, not a measurement. Whether an orbit does computation is open.",
    notes: ["PCA of one token's state across passes; dark to bright is iteration order; red × is the centre of mass."],
  });

  answer("Q2", {
    short: "Yes — within the depth it was trained for.",
    evidence: [
      { t: "Re-injecting the input keeps a loop stable past training.", src: "Yang Fig. 3 (toy regression)" },
      { t: "Random r and truncated backprop trained a 3.5B looped LM.", src: "Huginn Sec. 3.3" },
      { t: "GSM8K CoT 0.00 → 42.08 from r = 1 to 32; easy tasks saturate by r ≈ 8.", src: "Huginn Table 4, Fig. 7" },
      { t: "One run, after two failed ones, with no matched non-looped baseline at 800B tokens.", src: "Huginn Sec. 4.2–4.3", kind: "but" },
    ],
  });

  add({
    crumb: ["Q2", "Handoff"], title: "Huginn leaves three questions for Session B",
    cite: `${HUG}, Sec. 4.2, 6.1 and App. A`,
    notes: "Hand over to the second presenter here. Each open question maps to the next sections: 1 and 2 to Q3, 3 to Q4.",
    draw: (s) => {
      const items = [
        ["Is it worth the compute?", "The only non-looped twin stops at 180B tokens; at 800B there is no matched baseline.", "→ Q3"],
        ["Can each token choose its own depth?", "Early exit is a zero-shot KL threshold, not something the model learns.", "→ Q3"],
        ["Can we still read what it thinks?", "The authors note that latent reasoning costs oversight compared with a written chain of thought.", "→ Q4"],
      ];
      items.forEach(([h, b, q], i) => {
        const y = 1.55 + i * 1.6;
        text(s, String(i + 1), { x: T.X, y, w: 0.5, h: 0.6 }, { fontSize: 28, bold: true, color: T.gold });
        text(s, [{ text: h, options: { bold: true, breakLine: true } }, { text: b, options: { color: T.gray, fontSize: 17 } }], { x: 1.1, y, w: 10.2, h: 1.3 }, { fontSize: 22 });
        text(s, q, { x: 11.5, y, w: 1.4, h: 0.6 }, { fontSize: 22, bold: true, color: T.gold, align: "right" });
      });
    },
  });
};
