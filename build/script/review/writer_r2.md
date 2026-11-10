# writer r2 (ko) — judgments and changes

## Flags

| build | reviewer | sev | verdict | reason / action |
|---|---|---|---|---|
| [142] | both | high | agree | four-beat summary was a slogan; rewritten as reading the table, Q2 strongest, Q3 half, trained depth named where it actually appeared |
| [144] | both | high | agree | subjects restored: Huginn/Ouro for "up to depth", Ouro Table 10 for "beyond", Wang T 6→8 for "harder to read" |
| [145] | both | high | agree | definitional ending dropped; three conditions tied to the nearest existing result each, closes on what was measured |
| [133] | Anthropic high / OpenAI med | agree | chiasmus replaced by what each experiment cannot answer, then the remaining judgment |
| [44] | Anthropic | high | agree | Answer Q1 now starts from the three sources, one number (99.6), no abstract proposition |
| [13] | both | med | partly | the four-gap column is the slide's own structure; softened the "blank → question" bridge, did not invent a "most curious" narrative |
| [66] | both | med | agree | each device explained by what it prevents; paired sentence removed |
| [83] | OpenAI | med | agree | only one hand-off kept (Session B starts with question 1) |
| [143] | OpenAI | med | agree | pre-emptive "not criticism" removed |
| [108] | Anthropic | med | disagree | "parameter efficiency, not compute efficiency" is the [ours] box on slide; kept as one of the 3 allowed |
| [127] | Anthropic | med | partly | quip replaced with what the average and Health show |
| [4] | Anthropic | med | partly | mirrored pair softened; the contrast is the slide's point |

## Changes by pattern
- 다만: 11 → 3 ([43], [56], [131]). Others moved before the number or dropped where redundant ([25], [35], [42], [70], [82], [87], [115], [133]).
- "X이지 Y가 아닙니다": 7 → 3 ([49], [56], [108]). Rewritten in [43], [63], [81], [82], [140].
- "저희는 ~라고 읽습니다": 0 left ([63], [87], [96]).
- Hand-off announcements: [35], [77], [84], [88], [83] cut to one destination each.
- Answer slides: Q1 evidence-first, Q2 limit-first then yes, Q3 missing-result-first, Q4 source-sorting then answer. One number re-said each.
- Terms: 루프/루프 모델/파라미터/패스/숨은 상태/역전파 unified in s1, s2, s5, s6. Proper nouns and quoted slide phrases untouched.
- Facts and numbers unchanged.

## count.js totals
s1 5:08/5:00 · s2 10:36/10:30 · s3 11:45/11:30 · s4 11:42/11:30 · s5 10:17/10:00 · s6 4:37/4:30. All within −10%…+3%. Session A 27:29, Session B 26:36.

## check_script
149 builds, 0 problems, 0 warnings. Banned-character grep 0.

## r3 (both r2 reviewers, four repeat highs)
- [44] hand-off line dropped; ends on what training has not yet been seen to find (weights hand-written or existence-only), then "그것이 다음 질문입니다".
- [141] conditions first (trained depth exceeded, told to conceal), then the readability reading; "합친 것이 저희 답" and "네 답을 한 자리에" removed; ends on the one-item, one-condition evidence.
- [142] "세 줄에 걸쳐" reader-reaction line replaced by the common limit stated directly (Q2 42 inside depth; Ouro 4→8 and T 6→8 outside), no three-beat frame.
- [145] "~가 지워집니다" x3 replaced; each condition gets a different sentence shape and order, ending kept.
- "~셈입니다" 4 → 2 ([121], MoR tokens). Announce-before-content removed in [1], [53], [133].
- Lengths: builds −3.8%…+10.3%; sections all within −10%…+3% (s5 at +3.0%). check_script 0 problems.
