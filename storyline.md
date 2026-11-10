# Storyline v1 — Looped Transformers & Latent Reasoning

AGI26F HW2 · Team 5 (Juhyeon Park, Youngho Kim) · 2026-11-23 · English talk
Session A ≈30 min · Session B ≈30 min · Discussion ≈20 min

> 이 문서는 슬라이드를 만들기 전 승인용 개요다. 슬라이드 제목은 **주장 한 문장(영어)**, 괄호 안은 시각 자료와 공개 단계(build 수).
> 모든 수치는 `sources/*.md`(원문 재확인본)에서 왔다. `[plot]` = 그래프 판독값, `[ours]` = 우리 해석.

---

## RQ 원장 (덱 전체를 꿰는 질문)

Guiding question (과제 페이지): **Can a model think longer by reusing its layers instead of writing more tokens?**

| ID | 질문 | 답하는 절 | 답 (요지) |
|---|---|---|---|
| Q1 | Can reused layers compute what a deeper stack computes? | §2 (A) | Yes, in principle — many reasoning tasks need depth, not parameters, and loops supply depth. But the evidence is existence proofs and small synthetic tasks. |
| Q2 | Can we train a looped model so that extra loops help at test time? | §3 (A) | Yes, within the trained range — input injection + random loop counts + truncated backprop make loops trainable; accuracy rises with loops until a task-dependent ceiling. |
| Q3 | Does looping pay off at scale — per parameter, and per FLOP? | §4 (B) | Per parameter, yes, mostly on math/reasoning. Per FLOP at matched data, not shown. Loops past the trained depth hurt. |
| Q4 | What do we lose when reasoning moves into hidden states — and what is actually established in 2026? | §5 (B) | Looping alone did not reduce CoT monitorability in the one controlled study, but deeper loops under pressure hid cues. Astra looping is unconfirmed; RLT went from design doc to toy evidence. |

**최종 답 (결론 슬라이드)**: *Yes — up to the depth it was trained for. Beyond that, not yet; and what it adds is harder to read.*

세션 연결 장치: Session A 마지막 슬라이드가 Huginn이 남긴 3가지 열린 문제를 넘기고, Session B 첫 슬라이드가 그것을 Q3로 받는다.
콜백 장치: (i) §1의 "CoT vs loop" 그림이 §2 끝 Theorem 5.4에서 다시 등장, (ii) §4의 "trained depth 넘으면 하락"이 §5 cotmon 해석(T=6,8은 학습 깊이 밖)에서 다시 등장.

---

## §1 Background → Gap → Questions  (Session A, ~7 min)

| # | Title (assertion) | Visual / builds | Source |
|---|---|---|---|
| 1 | Thinking Longer Without Writing More | 제목 슬라이드 | — |
| 2 | A Transformer's depth caps the sequential steps it can take per token | 직접 그린 단순 도식: L layers → 1 token (1) | UT App B |
| 3 | Today's models get around the cap by writing tokens | Saunshi Fig 4 왼쪽(CoT as loop) 강조, 오른쪽 흐림 (1) | Saunshi Fig 4 |
| 4 | A looped model reuses the same layers instead | 같은 그림, 오른쪽(latent thoughts) 강조 (1) | Saunshi Fig 4 |
| 5 | *Guiding question* 큰 글씨 | 텍스트 1문장 | course page |
| 6 | Eight years, four threads of work | 타임라인 2018→2026, 실(theory / training / scale / oversight)별로 공개 (4) — 종합 슬라이드 | 전체 |
| 7 | Each thread leaves one gap open | 표: requirement · who tried · what's missing, 행 단위 공개 (4) — 종합 슬라이드 | 전체 |
| 8 | Four questions for today | Q1–Q4 목록 + 어느 세션이 답하는지 | — |

Gap 표 (#7) 초안:
- compute more? → UT, Giannou, Saunshi → existence proofs / synthetic only
- trained to use loops? → Yang, Huginn → small scale or a single run
- pays off at scale? → Saunshi 1B, MoR, Ouro → baselines differ in data / FLOPs
- what do we lose? → (none until 2026) → unmeasured

---

## §2 Q1 — Can reused layers compute what a deeper stack computes?  (Session A, ~9 min)

| # | Title (assertion) | Visual / builds | Source |
|---|---|---|---|
| 9 | Q1 섹션 표지 | 질문 1문장 | — |
| 10–13 | Universal Transformers apply one shared block again and again | UT Fig 1 공개 4단계: per-position states+attention → transition → same block again → tied weights | UT Fig 1, Eq 4–5 |
| 14 | With ACT, each token decides how many steps it needs | Fig 1 전체 + ACT 한 문장 | UT Sec 2.2 |
| 15 | UT spent more steps on facts that answer the question | ut-fig3; 3.8 / 3.1 / 2.3 steps for 3/2/1-fact tasks. 각주: bAbI 헤드라인은 best-of-10 | UT Sec 3.1, Fig 3, App E |
| 16–20 | A fixed ≤13-layer Transformer becomes a computer once you loop it | Giannou Fig 1 공개 5단계: punchcard → pointers → fixed weights → one pass = one instruction (Fig 5 사이클로 전환) → output fed back | Giannou Fig 1, 5, Alg 1 |
| 21 | Program length becomes loop count, not depth | Fig 1 전체 + Remark | Giannou Sec 5.1 |
| 22 | Every "result" here is a proof, not a measurement | 표: SUBLEQ 9 layers/2 heads · calculator 12 · SGD 13 | Giannou Table 1 |
| 23–26 | Compare at equal parameters and at equal FLOPs | Saunshi Fig 1 공개: (k⊗1) → (k⊗L) → (kL⊗1) → 비교 질문 | Saunshi Fig 1 |
| 27 | One layer looped 12× adds as well as 12 distinct layers | 막대 순차 공개: (1⊗1) 0.0 → (12⊗1) 100.0 → (1⊗12) 99.6. 각주: best of 3 seeds | Saunshi Table 1 |
| 28 | In theory, m loops can simulate m steps of chain-of-thought | **#3–4 그림 재등장** + Thm 5.4 한 줄 | Saunshi Thm 5.4 |
| 29 | **Answer to Q1** | "Yes, in principle… but existence ≠ learned" → Q2로 넘김 | — |

---

## §3 Q2 — Can we train a looped model so that extra loops help at test time?  (Session A, ~14 min) — **mechanism in depth**

| # | Title (assertion) | Visual / builds | Source |
|---|---|---|---|
| 30 | Q2 섹션 표지 | — | — |
| 31–34 | A single looped layer learns in-context regression | Yang Fig 1 공개 4단계: task → 12-layer baseline → looped + input injection(⊕) → loop ≈ GD step | Yang Fig 1, Sec 4.1 |
| 35 | Without re-injecting the input, the loop drifts after the trained depth | yang-fig3: weight-tying 곡선 강조 → injection 곡선 강조 (2) `[plot]` | Yang Fig 3 |
| 36 | One looped layer matches 12 layers with 1/12 of the parameters | yang-fig2 (2). 각주: FLOPs 비교 없음(20 loops vs 12 layers) | Yang Fig 2 |
| 37–42 | Huginn: embed once, loop a core block r times, decode once | **Huginn Fig 2 공개 5단계**: prelude → s0 from noise → shared core × r → re-inject e → coda | Huginn Fig 2, Sec 3.1 |
| 43 | Only the middle is looped because first and last layers play distinct roles | 인용 1문장 + 회색 박스 "[ours] 'each pass must play every role' is our framing; the paper has no ablation" | Huginn Sec 3.1 |
| 44 | Train with a random loop count, backprop through only the last 8 | huginn-fig3 분포 + Eq 1–2 (2) | Huginn Sec 3.3, Fig 3 |
| 45 | Two failed runs: states collapsed, or the model ignored its own loop | Fig 5 (추출 필요) (2) | Huginn Sec 4.3, Fig 5 |
| 46 | Accuracy rises with loops, then saturates task by task | huginn-fig7 + 막대: GSM8K CoT r=1 0.00 → r=32 42.08; ARC-C 27.99 → 38.23 (r=4→32) (3) | Huginn Table 1, 4, Fig 7 |
| 47 | Each token converges at its own pace | huginn-fig11: "really/wrong" 행 → "school" 행 (2) | Huginn Fig 11 |
| 48 | Latent thoughts have shapes: fixed points, orbits, sliders | huginn-fig12 행별 공개 (3). 각주: 정성 관찰, 소수 prompt | Huginn Fig 12, Sec 7 |
| 49 | **Answer to Q2** | "Yes, within the trained range…" | — |
| 50 | Huginn leaves three things open → Session B | ① every token gets the same depth ② no equal-compute baseline at 800B ③ halting is a KL heuristic | Huginn Sec 4.2, 6.1, 10 |

---

## §4 Q3 — Does looping pay off at scale, per parameter and per FLOP?  (Session B, ~16 min)

| # | Title (assertion) | Visual / builds | Source |
|---|---|---|---|
| 51 | Q3 섹션 표지 (#50의 3가지를 다시 보여주며 시작) | — | — |
| 52 | At 1B scale, looping lifts reasoning more than perplexity | 막대 공개: math 26.7 (12⊗1) → 34.3 (12⊗2) → 29.3 (24⊗1); reasoning primitives 35.7 → 51.2 → 47.5; ppl 8.16 → 7.90 → 7.40 (3) | Saunshi Table 3 |
| 53–57 | MoR gives each token its own number of loops | MoR Fig 2 공개 5단계: shared block → expert-choice top-k → token-choice → recursion-wise KV → KV sharing | MoR Fig 2 |
| 58 | MoR's equal-FLOP win comes partly from seeing more tokens | 표 행 공개: vanilla 315M 2.7824/42.3 (20B tok) → MoR 167M 2.7511/43.1 (27B tok) → fixed-depth recursive also 42.6 (3) | MoR Table 3 |
| 59 | Up to 2.06× throughput — at one size, excluding KV-update time | mor-fig4 왼쪽 패널 | MoR Fig 4a, App E |
| 60–64 | Ouro trains an exit gate for every loop | Ouro Fig 3 공개 5단계: stack × 4 → head+gate per loop → loss − β·entropy → CDF threshold → early exit | Ouro Fig 3, Sec 3 |
| 65 | A 1.4B looped model beats a 4B dense model on math, not on knowledge | 막대 공개: MATH500 82.40 vs 59.60 · GSM8K 78.92 vs 72.86 → MMLU 67.35 vs 73.19 · HumanEval 74.40 vs 77.40 (2) | Ouro Table 7 |
| 66 | But the baseline saw different data, and the paper's own control favors no looping | 7.7T vs 36T 토큰 + App D.1: equal-depth non-looped > looped in every setting (2). `[ours]` 4 loops ≈ 4× per-token compute | Ouro Table 1, App D.1 |
| 67 | Looping past the trained depth hurts | 점 공개: MMLU T=1 41.21 → T=2 60.43 → T=4 67.45 → T=8 64.49 (4) | Ouro Table 10 |
| 68 | Loops don't store more knowledge; they manipulate it better (in toy models) | ouro-fig6: storage ≈2 bits/param 양쪽 → Mano L=24: 92.2 vs 34.8 (2). 각주: ≤40M params, best of 3 seeds | Ouro Fig 6, App B.2 |
| 69 | **Answer to Q3** | "Per parameter yes (math/reasoning); per FLOP at matched data not shown; past trained depth hurts" | — |

(시간이 모자라면 #59, #68을 뺀다. Ouro early-exit Fig 5는 예비 슬라이드로.)

---

## §5 Q4 — What do we lose, and what is actually established in 2026?  (Session B, ~10 min)

| # | Title (assertion) | Visual / builds | Source |
|---|---|---|---|
| 70 | Q4 섹션 표지 | — | — |
| 71 | Sept 2026: a press report said GPT-6 Astra loops | 타임라인 공개: The Information (claim) → Pachocki quote → system card → Raschka (4) | astra |
| 72 | What OpenAI confirmed — and what it didn't | 2열 표: confirmed (monitorability ↓; controllability not due to architecture) vs unconfirmed (looping) | System card §9 |
| 73 | How to measure monitorability: plant a hint, check if the CoT admits using it | 설정 도식(직접 그림): cue "I guess the answer is A" → answer → monitor | cotmon §3.2 |
| 74 | More loops on the same model hid the hint on logic tasks | cotmon-fig2: Logic 77.94 → 41.79 (T 4→8, concealment) 강조 → 하락 없는 과제들 강조 (2) | cotmon Fig 2, Table 6b |
| 75 | At T=4 the hint is the target; at T=8 it is never mentioned | cotmon-fig4: 22 → 6 → 0 cue mentions (3) | cotmon Fig 4 |
| 76 | But T=6 and 8 are past Ouro's trained depth | **#67 그래프 재등장** + 한 줄 (콜백) | Ouro Table 10; cotmon setup |
| 77 | A looped model vs six non-looped ones: no monitorability penalty | Nanbeige 81.35% vs 67–77% (standard) | cotmon §4.2 |
| 78 | RLT, Sept 12: "infinite temporal depth," zero experiments | rlt-architecture + 인용 "remain to be established" | rlt |
| 79 | RLT, October: three-seed toy results, failures included | rlt-length-generalization: parity 100% vs 50% → S5 standard ≈ chance, addition fails (2). `[ours]` RLT deepens across tokens, so it does not answer our guiding question | rlt |
| 80 | **Answer to Q4** | — | — |

---

## §6 Synthesis & conclusion  (Session B, ~4 min) — 한 슬라이드 한 아이디어 예외 구간

| # | Title | Visual | Source |
|---|---|---|---|
| 81 | Four questions, four answers | Q/A 표 (Q1–Q4) | 원장 |
| 82 | Where claims ran ahead of measurements | 카드 6장: UT best-of-10 · Giannou proofs · MoR +35% tokens · Ouro external baselines · Astra rumor · RLT design doc | 각 source |
| 83 | So, can a model think longer by reusing its layers? | 최종 답 1문장 | — |

## §7 Discussion  (both, ~20 min)

| # | Question | Course link |
|---|---|---|
| 84 | Universal Transformers looped in 2018. What, if anything, is new in 2025–26? | (novelty) |
| 85 | If reasoning moves into loops, what should we monitor instead of the chain of thought? | **safety** |
| 86 | Loops length-generalize on parity but not on addition, and not past the trained depth. Is that generalization — and would it help on ARC-AGI? | **generalization, ARC-AGI** |
| 87 | Thanks + references | — |

---

## 다음 단계 전 확인할 것

- 슬라이드 수: 약 87장 (공개 단계 포함). 참고 덱의 밀도(89장/35분)보다 느슨하다.
- 추가로 잘라야 할 그림: Huginn Fig 5 (실패한 학습 2건), Ouro Table 10은 우리가 직접 그린다.
- 직접 그릴 도식: #2 (fixed depth), #73 (monitorability 측정 방식).

---

## v2 반영 (2026-11-04) — 승인됨, 결론·토론은 Claude 초안 (발표자 검토 전)

- 구조(Q1–Q4, A/B 경계) 승인. #43 `[ours]` 표기 승인.
- #50 핸드오프를 "Session B로 넘기는 질문 3개"로 바꿈: ① compute 가치 → Q3 ② 토큰별 깊이 → Q3 ③ 읽을 수 있나 → Q4.
- 결론(#83, 2 builds): *Yes — up to the depth it was trained for. Beyond that, not yet; and what it adds is harder to read.* + "What would settle it": (1) same-data, same-FLOP dense 비교 at scale (2) 학습 깊이 너머에서도 오르는 학습법 (3) 토큰이 아니라 loop 자체를 읽는 방법.
- 토론 3개, 각 슬라이드에 "Our starting point" 회색 상자:
  1. novelty — 아이디어는 2018년 그대로, 새것은 recipe(injection, random depth, truncated backprop, norm)와 scale(800B–7.7T).
  2. safety — loop 수/토큰별 깊이, latent 경로 probe, 학습 범위 안의 loop 수 유지. 검증된 것 없음.
  3. generalization·ARC-AGI — loop는 한 단계를 반복할 뿐, ARC는 새 조합을 요구. 반복이 그걸 준다는 증거 없음.
- 산출물: `build/out/looped-transformers.pptx` (149 builds ≈ 87 아이디어). 빌드: `node build/build.js`, QA: `build/qa.sh build/out/looped-transformers.pptx`.
