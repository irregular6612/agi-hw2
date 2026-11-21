# s1_background

## s1_background/title#1
안녕하십니까. Team 5의 발표를 시작하겠습니다. 저희는 같은 층을 반복하는 Looped Transformers로, 토큰을 더 쓰지 않고 내부 상태에서 계산하는 잠재 추론을 살펴보겠습니다.

## s1_background/sept-2026-openai-ships-gpt-6-astra#1
2026년 9월 3일 OpenAI가 GPT-6 Astra를 공개했습니다. 공개 직전 팟캐스트에서 Sam Altman은 Astra가 컴퓨터를 쓰는 일에서 사람과 거의 같은 수준에 왔고, AGI로 가는 길의 한 걸음 같다고 말했습니다. AGI를 만들었다는 말은 아니고, ‘같다’와 ‘거의’가 붙은 말입니다.

## s1_background/sept-2026-openai-ships-gpt-6-astra#2
오른쪽은 ARC-AGI-3 점수입니다. 같은 시험 환경에서 ARC Prize가 직접 잰 값입니다. 이전 OpenAI 모델 GPT-5.6 Sol은 7.8%, 그때까지 가장 높던 Claude Opus 5는 30.2%였습니다. Astra는 62.7%로 두 배 넘게 올랐습니다. 이 모델이 어떻게 만들어졌는지를 두고 바로 소문이 돌았습니다.

## s1_background/sept-2026-gpt-6-astra-loops-spread-across-x-and-#1
2026년 9월 2일의 두 글입니다. 왼쪽 X의 @altryne는 루프와 반복 깊이, Neuralese가 화제가 된 배경을 설명합니다. Neuralese는 말로 쓰지 않은 내부 표현입니다. 오른쪽 LessWrong의 R. Arike는 Astra 보도를 Geiping의 반복 깊이 연구와 연결하며 우려를 묻습니다.

## s1_background/sept-2026-gpt-6-astra-loops-spread-across-x-and-#2
아래도 전문을 읽을 수 있습니다. 9월 2일 TechCrunch는 안전 전문가와 Redwood CEO의 강한 우려를 전합니다. 9월 25일 Astral Codex Ten의 S. Alexander는 내부 상태를 루프에 되넣는 방식을 설명합니다. 네 글이 Astra의 구조를 확인한 증거는 아닙니다.

## s1_background/research-followed-looped-papers-at-iclr-jumped-t#1
가로는 ICLR 연도, 막대 높이는 ‘looped’를 언급한 투고 수입니다. 파란 막대는 2024년 3편, 2025년 4편, 2026년 11편입니다.

## s1_background/research-followed-looped-papers-at-iclr-jumped-t#2
금색 ICLR 2027 막대는 189편입니다. 그중 175편은 모델을 가리키는 용례입니다. 연구에서도 이 주제에 대한 관심이 커졌습니다.

## s1_background/guiding-question#1
같은 층을 재사용해서 토큰을 더 쓰지 않고 오래 생각할 수 있습니까? 무엇인지, 무엇을 계산할 수 있는지, 도입할 만한지 살펴보겠습니다.

## s1_background/four-questions-for-today#1
Q1은 층과 추론 문장을 늘리는 방법의 한계입니다. Q2는 루프의 계산 가능성과 학습 가능성입니다. Q3는 언어 모델의 구현과 규모 확장입니다. Q4는 도입할 가치와 그 대가입니다.

## s1_background/what-we-want-ai-that-thinks-deeply-enough-to-sol#1
Q1부터 보겠습니다. 깊게 생각한다는 것을 답하기 전에 계산 단계를 많이 거치는 것으로 잡습니다. 지금까지의 방법은 두 가지입니다. 아래 그림의 왼쪽은 층을 더 쌓는 방법입니다. 층이 4개에서 8개, 12개로 늘면 토큰 하나가 거치는 단계도 늘지만 파라미터 막대도 함께 찹니다. 오른쪽은 chain of thought, 줄여서 CoT입니다. 층은 4개 그대로 두고 중간 생각을 토큰으로 써서 다시 입력에 넣습니다. 파라미터는 그대로지만 토큰이 늘어납니다. 층은 파라미터로, CoT는 토큰으로 값을 치르는 셈입니다.

## s1_background/way-1-stack-more-layers-measured-by-scaling-laws#1
첫 방법은 층을 늘리면 더 깊이 생각하리라는 기대입니다. 스케일링 법칙은 파라미터와 데이터, 계산량의 크기와 성능의 관계입니다. 여기서는 다른 조건이 병목이 아닐 때, 예측 오차인 테스트 손실이 각 크기의 거듭제곱에 따라 변합니다.

## s1_background/way-1-stack-more-layers-measured-by-scaling-laws#2
새 문장은 측정 기준의 한계입니다. 테스트 손실은 전체 규모에 강하게 반응하지만 깊이와 너비의 배분에는 약하게 반응합니다. 추론 능력을 직접 잰 지표는 아닙니다.

## s1_background/way-1-stack-more-layers-measured-by-scaling-laws#3
마지막은 Saunshi의 문제 제기입니다. 많은 추론 문제는 많은 파라미터보다 긴 계산 깊이를 요구합니다. 하지만 서로 다른 층을 쌓으면 깊이와 파라미터가 함께 늘어납니다.

## s1_background/the-price-depth-caps-a-transformer-s-steps-per-t#1
아래 입력이 파란 1층부터 L층까지 올라갑니다. 금색 괄호가 한 번에 거치는 L단계입니다. 어려운 문제도 여기서 출력해야 합니다. 더 계산하려면 토큰이나 통과 횟수를 늘려야 합니다. 깊이가 고정되는 이유를 RNN과 비교하겠습니다.

## s1_background/same-sentence-two-ways-to-read-it-step-by-step-o#1
아래는 같은 여섯 토큰, 위 h는 내부 상태입니다. RNN은 앞 상태를 다음 계산에 넘기는 순환 신경망입니다. 왼쪽 금색은 h1부터 h6까지 차례로 켜지고, 오른쪽 Transformer는 함께 켜집니다. 각 위치는 자신까지의 토큰을 참조합니다.

끝의 O(n)은 층당 순차 단계가 입력 길이 n에 비례한다는 뜻입니다. O(1)은 길이에 따라 늘지 않는다는 뜻입니다. 학습과 입력 읽기의 비교이며, 생성은 둘 다 한 토큰씩 합니다.

## s1_background/rnns-read-step-by-step-transformers-read-all-at-#1
표의 왼쪽은 RNN과 LSTM, 오른쪽은 Transformer입니다. RNN은 같은 가중치를 반복하며 단계당 비용이 일정합니다. Transformer는 위치들을 병렬로 처리하고, 참조가 허용된 토큰끼리 한 단계로 정보를 전달합니다.

## s1_background/rnns-read-step-by-step-transformers-read-all-at-#2
약점 행입니다. RNN은 O(n)의 순차 계산이 필요합니다. 기본 RNN의 학습 신호가 약해지는 기울기 소실을 LSTM이 줄였지만 순차 구조는 유지됩니다.

Transformer는 토큰 순서로 반복하지 않고 정해진 층을 지나므로 깊이가 고정됩니다. 토큰끼리 정보를 참조하는 어텐션 비용은 길이 n의 제곱과 너비 d에 비례합니다. UT의 과제에서는 학습보다 긴 입력에도 취약했습니다.

## s1_background/rnns-read-step-by-step-transformers-read-all-at-#3
귀납 편향은 특정 규칙을 배우기 쉬운 구조의 성향입니다. RNN은 같은 규칙을 순서대로 적용합니다. 오른쪽은 저희 해석입니다. Transformer는 위치들을 연결하고 순서를 위치 인코딩으로 별도로 주므로 순서와 거리의 가정이 약합니다.

## s1_background/today-s-models-get-around-the-cap-by-writing-tok#1
왼쪽 금색 영역을 아래부터 보겠습니다. 파란 막대는 모델 전체입니다. 입력에서 빨간 t1을 쓰고, 입력에 붙여 t2와 t3을 이어 씁니다. CoT는 계산을 늘리는 만큼 토큰을 쓰고 다시 읽습니다.

## s1_background/a-looped-model-reuses-the-same-layers-instead#1
오른쪽은 같은 파란 블록을 반복해 빨간 내부 상태를 갱신합니다. 아래 흰 칸은 입력, 갈색은 미래 CoT 토큰을 대신하는 빈 자리입니다.

토큰을 하나씩 읽는 방식으로 돌아가지 않습니다. 토큰은 계속 병렬로 처리하고 깊이 방향으로 반복합니다. 2018년 Universal Transformers의 아이디어입니다. CoT는 토큰으로, 루프는 내부 상태로 계산을 이어 갑니다.

## s1_background/answer-to-q1#1
Q1의 답입니다. 층은 파라미터를, CoT는 토큰을 더 쓰며 토큰당 깊이는 고정됩니다. 체크 세 줄을 짚겠습니다. 테스트 손실은 깊이보다 규모에 민감했습니다. 추론에는 많은 파라미터 없이도 긴 깊이가 필요할 수 있습니다. 한 번의 통과는 최대 L단계입니다.

CoT는 토큰을 써서 그 한계를 우회합니다. 이제 Q2로 넘어가며 루프 연구의 지도를 보겠습니다.

## s1_background/roadmap-each-answer-raised-the-next-question#1
지도는 시간순이며 금색 상자는 다룰 여섯 논문입니다. 화살표는 남겨진 질문을 잇습니다. 출발점은 RNN의 반복, 2016년 ACT의 종료 시점 학습, 2017년 Transformer의 병렬 처리와 고정 깊이입니다.

## s1_background/roadmap-each-answer-raised-the-next-question#2
2018년 Universal Transformers는 층을 추가하지 않고 반복합니다. ACT로 토큰별 종료 시점도 정합니다.

## s1_background/roadmap-each-answer-raised-the-next-question#3
2022년부터 2023년입니다. 위 Giannou는 프로그램 실행을 증명합니다. 아래 CoT는 토큰으로 계산을 늘리는 대안입니다.

## s1_background/roadmap-each-answer-raised-the-next-question#4
2025년 Huginn은 3.5B 파라미터의 언어 모델을 학습합니다. Mixture-of-Recursions는 토큰별 깊이를, Ouro는 학습된 종료와 7.7T 토큰의 사전학습을 다룹니다.

## s1_background/roadmap-each-answer-raised-the-next-question#5
2026년 Recurrent Looped Transformer는 상태를 다음 토큰으로 넘깁니다. 위 점선은 RNN과의 연결입니다. 아래 Astra 보도는 미확인입니다. 이제 앞부분부터 보겠습니다.

<!-- ARCHIVE (v7): scripts of slides cut or replaced; restore by moving a block above this comment


## s1_background/sept-2026-two-headlines-in-one-month#1
계기는 올해 9월입니다. 9월 2일 The Information이 GPT-6 Astra가 루프를 쓰고 그래서 CoT가 가려진다고 보도했습니다. 내부자 인용의 유료 기사이고 OpenAI는 확인하지 않았습니다.

## s1_background/sept-2026-two-headlines-in-one-month#2
열흘 뒤 Princeton의 Recurrent Looped Transformer가 무한한 시간 깊이를 내건 16쪽 설계 문서로 빠르게 퍼졌습니다. 둘 다 아직 주장이고 측정과의 대조는 Session B에서 합니다.

## s1_background/the-idea-dates-to-2018-two-problems-held-it-back#1
그런데 아이디어 자체는 2018년부터 있었습니다. (a)는 앞의 상한입니다. 깊이가 고정돼 있으니 모델은 길고 비싼 CoT로 생각해야 했습니다.

## s1_background/the-idea-dates-to-2018-two-problems-held-it-back#2
(b)는 루프의 학습 문제입니다. 보통 스택은 앞쪽 층이 특징을 뽑고 뒤쪽 층이 결정하는데, 블록 하나를 그냥 되풀이하면 그 블록이 패스마다 모든 역할을 맡아야 합니다. 이 설명은 수업의 틀이고 ablation한 논문은 없습니다. Huginn의 설계에서 다시 나옵니다.

## s1_background/transformers-won-because-they-scale-the-bitter-l#1

규모 확장의 관점에서 보겠습니다. Sutton의 2019년 글 The Bitter Lesson은 계산량을 활용하는 일반적인 방법이 결국 큰 차이로 앞선다고 주장합니다. 화면 아래의 두 방법은 탐색과 학습입니다. 실험 결과가 아닌 역사적 사례에 대한 해석입니다.

## s1_background/transformers-won-because-they-scale-the-bitter-l#2

여기에 Kaplan의 2020년 측정을 붙입니다. 같은 파라미터 수로 비교하면 규모가 커질수록 Transformer가 앞섭니다. LSTM도 문맥 앞부분에서는 비슷하지만, 100토큰이 되기 전에 추가 문맥의 이득이 정체됩니다.

## s1_background/transformers-won-because-they-scale-the-bitter-l#3

마지막은 저희 해석입니다. 병렬 학습으로 계산량을 더 활용했고, 긴 문맥도 더 잘 활용했다는 설명입니다. Sutton은 Transformer를 언급하지 않았습니다. 여기에 반복 계산을 더할 수 있는지 보겠습니다.

## s1_background/sept-2026-one-scoop-said-gpt-6-astra-loops-and-i#1
왼쪽 카드는 2026년 9월 1일 The Information의 유료 기사입니다. 익명 내부자를 근거로 Astra가 층을 반복하며, 추론 일부나 전부가 가려진다고 보도했습니다. CoT는 중간 추론을 토큰으로 써 나가는 과정입니다. 제목은 이 기술이 보안 우려를 낳는다는 내용입니다.

## s1_background/sept-2026-one-scoop-said-gpt-6-astra-loops-and-i#2
오른쪽을 위에서부터 보겠습니다. 9월 2일 TechCrunch는 안전 전문가들의 우려와 Redwood CEO의 강한 걱정을 전했습니다. 같은 날 X의 @altryne는 루프, 반복 깊이, Neuralese가 타임라인을 채웠다고 썼습니다. 9월 3일 Fortune은 Astra 일부에 이 구조를 썼다고 단정했습니다. 전 OpenAI 연구자의 금지선을 넘는다는 우려도 인용했습니다.

## s1_background/sept-2026-one-scoop-said-gpt-6-astra-loops-and-i#3
아래 문장처럼 모두 유료 기사 하나로 거슬러 올라갑니다. OpenAI의 구조 확인은 없었습니다. 끝에서 이 주장으로 돌아오고, 먼저 연구의 관심도 보겠습니다.
-->
