# s1_background

## s1_background/title#1
안녕하십니까. Team 5의 발표를 시작하겠습니다. 오늘의 질문은 모델이 토큰을 더 쓰는 대신 같은 층을 다시 돌려서 더 오래 생각할 수 있는가입니다. 두 세션에 걸쳐 답하겠습니다.

## s1_background/sept-2026-one-scoop-said-gpt-6-astra-loops-and-i#1
출발점은 올해 9월 1일 미국 시각에 나온 The Information의 기사입니다. 제목은 OpenAI의 Astra에 쓰인 기술이 보안 우려를 낳는다는 내용입니다. 본문은 유료라 저희도 직접 읽지 못했고, 아래 문장은 다른 글에 옮겨 실린 부분입니다. 이름을 밝히지 않은 내부자를 인용해 Astra가 recurrent depth, 곧 루프 Transformer를 쓰고 그 때문에 생각 과정인 chain of thought, 줄여서 CoT가 가려진다고 썼습니다.

## s1_background/sept-2026-one-scoop-said-gpt-6-astra-loops-and-i#2
이 기사 한 편이 이틀 만에 퍼졌습니다. 다음 날 TechCrunch가 같은 내용을 옮기면서 Redwood의 CEO가 깊이 우려한다고 쓴 글을 실었습니다. 같은 날 X에서는 루프 Transformer와 recurrent depth, Neuralese라는 말이 타임라인을 덮었다는 글이 돌았습니다. 9월 3일 Fortune은 OpenAI가 이 방법을 썼다고 사실처럼 적었고, OpenAI 출신 안전 연구자가 업계의 몇 안 되는 레드라인을 넘는다고 한 말을 인용했습니다.

## s1_background/sept-2026-one-scoop-said-gpt-6-astra-loops-and-i#3
오른쪽 세 건을 거슬러 올라가면 모두 왼쪽 기사 하나에 닿습니다. OpenAI는 시스템 카드에서 구조를 밝히지 않았고, 수석 과학자는 CoT 모니터링을 지켜 왔다는 말과 함께 구조는 나중에 공개하겠다고만 했습니다. 저희는 이 문장을 확인되지 않은 주장으로 두고 발표 끝에서 측정과 나란히 놓겠습니다.

## s1_background/research-followed-looped-papers-at-iclr-jumped-t#1
연구 쪽 관심은 숫자로 확인할 수 있습니다. OpenReview 검색으로 ICLR 투고 가운데 제목이나 초록, 키워드에 ‘looped’가 들어간 논문을 셌습니다. 철회된 투고까지 넣은 값입니다. 2024년 3편, 2025년 4편, 2026년 11편으로 해마다 손에 꼽을 정도였습니다.

## s1_background/research-followed-looped-papers-at-iclr-jumped-t#2
ICLR 2027에서는 189편으로 뛰었습니다. 그중 175편은 이 단어를 모델 구조를 가리키는 데 씁니다. 이 수는 검색 색인으로 센 값이고 전체를 훑은 값은 아닙니다. 투고는 관심의 표시이고 결과는 심사와 재현을 거쳐야 나옵니다. Astra 보도와 시기는 가깝지만 보도가 이 증가를 불렀다고 볼 근거는 없습니다.

## s1_background/guiding-question#1
수업이 준 질문도 이 주제를 가리킵니다. 오늘 발표는 루프가 무엇인지에서 시작해 무엇을 할 수 있는지를 거쳐 가져다 쓸 만한지에서 끝납니다. 각주처럼 여기서 재귀는 네트워크 안의 반복이고, Topic 9의 시스템 수준 자기 개선과는 층위가 다릅니다.

## s1_background/four-questions-for-today#1
이 흐름을 네 질문으로 쪼갰습니다. Q1과 Q2는 왜 루프가 필요하고 원리상 어디까지 가능한지를 묻습니다. Q3는 실제 언어 모델을 만드는 과정이고 Huginn까지만 이번 세션에서 다룹니다. Q4는 Astra 보도가 건드린 물음, 루프를 쓰면 무엇을 잃는가입니다.

## s1_background/what-we-want-ai-that-thinks-deeply-enough-to-sol#1
Q1은 목표에서 출발합니다. 깊이 생각한다는 말을 답하기 전에 여러 단계의 계산을 거친다는 뜻으로 좁혔습니다. 이 정의는 논문에서 가져온 주장이 아니고 저희가 세운 틀입니다. 이 틀에서 보면 지금까지의 길은 둘입니다. 층을 더 쌓거나, 모델이 더 긴 CoT를 쓰게 하는 길입니다.

## s1_background/way-1-stack-more-layers-measured-by-scaling-laws#1
첫 번째 길은 층 쌓기입니다. 깊은 네트워크가 더 깊이 생각한다는 믿음이 있었고, 그 진척은 scaling law로 쟀습니다. Kaplan 등은 2020년에 test loss가 파라미터, 데이터, 계산량에 대해 거듭제곱 법칙을 따른다고 측정했습니다.

## s1_background/way-1-stack-more-layers-measured-by-scaling-laws#2
그런데 이 지표는 깊이를 가리키지 않았습니다. 성능은 규모에 강하게 의존하고 깊이 대 너비 같은 모양에는 약하게 의존했습니다. 여기서 성능은 test loss이고 추론 정확도와는 다른 지표입니다.

## s1_background/way-1-stack-more-layers-measured-by-scaling-laws#3
Saunshi 등의 2025년 논문이 이 틈을 짚습니다. 많은 추론 문제는 큰 깊이가 필요하지만 파라미터가 많을 필요는 없습니다. 그런데 보통의 스택에서는 층 하나를 더하면 파라미터도 함께 늘어납니다. 깊이만 따로 살 방법이 없습니다.

## s1_background/the-price-depth-caps-a-transformer-s-steps-per-t#1
깊이를 고정한 대가는 그림에 있습니다. 토큰 하나는 Layer 1부터 L까지 한 번 지나고 곧바로 답해야 하니, 패스 한 번에 밟을 수 있는 단계는 많아야 L개입니다. Universal Transformers 논문은 이를 두고 Transformer가 RNN의 반복 편향을 내려놓았다고 썼습니다. 더 많은 단계가 필요하면 토큰이나 패스를 늘려 일을 나누어야 합니다.

## s1_background/today-s-models-get-around-the-cap-by-writing-tok#1
지금의 모델들은 토큰 쪽을 택했습니다. 이것이 두 번째 길이고 그림은 Saunshi 논문의 Figure 4 왼쪽입니다. 파란 막대가 모델 전체, 빨간 테두리가 방금 쓴 생각입니다. 패스마다 토큰 하나를 써서 다시 넣으니 단계가 늘면 토큰도 늘어납니다. Huginn의 저자들은 이를 낭비로 보았고 Ouro의 저자들은 문맥이 불어난다고 지적합니다.

## s1_background/same-sentence-two-ways-to-read-it-step-by-step-o#1
표로 들어가기 전에 두 모델이 같은 문장을 어떻게 읽는지 움직임으로 보겠습니다. 왼쪽 RNN은 h2를 계산하려면 h1이 끝나야 해서 여섯 단어에 여섯 걸음이 듭니다. 오른쪽 Transformer는 attention으로 여섯 자리를 한 걸음에 함께 계산합니다. 층 하나마다 순차 단계가 RNN은 길이만큼, Transformer는 한 번입니다. 아래 회색 줄처럼 글을 생성할 때는 둘 다 한 토큰씩 씁니다. 차이는 학습과 프롬프트를 읽는 단계에서 납니다.

## s1_background/rnns-read-step-by-step-transformers-read-all-at-#1
그렇다면 Transformer는 왜 깊이를 고정한 채로 만들어졌을까요. 왼쪽 RNN은 매 걸음 같은 가중치를 써서 반복 계산을 자연스럽게 표현합니다. 오른쪽 Transformer는 시퀀스 전체를 병렬로 학습하고 어느 토큰이든 한 단계 만에 다른 토큰에 닿습니다.

## s1_background/rnns-read-step-by-step-transformers-read-all-at-#2
약점은 장점의 뒷면입니다. RNN은 한 걸음씩 가야 해서 학습을 병렬로 나눌 수 없고 먼 정보는 기울기 소실로 흐려집니다. Transformer 쪽 첫 줄이 앞에서 본 상한입니다. attention 비용은 길이의 제곱으로 늘어납니다.

## s1_background/rnns-read-step-by-step-transformers-read-all-at-#3
마지막 행은 inductive bias, 곧 모델이 미리 깔고 있는 가정입니다. RNN은 같은 규칙이 걸음마다 반복된다고 가정합니다. Transformer 칸은 저희 해석입니다. 순서가 위치 인코딩으로만 들어오니 순서나 거리에 대한 가정이 거의 없다고 보았습니다. 고정 깊이는 반복의 가정을 내려놓고 병렬 학습을 택한 결과입니다.

## s1_background/transformers-won-because-they-scale-the-bitter-l#1
반복을 버린 쪽이 이긴 이유는 Sutton의 2019년 에세이가 요약합니다. 70년의 AI 연구에서 계산을 쓸수록 좋아지는 일반적인 방법, 곧 탐색과 학습이 큰 차이로 이겼다는 주장입니다. 실험 없는 에세이라 관점으로만 씁니다.

## s1_background/transformers-won-because-they-scale-the-bitter-l#2
측정은 Kaplan 등의 2020년 논문에 있습니다. 파라미터를 맞추고 키우면 Transformer가 LSTM을 점점 앞섭니다. LSTM은 100토큰이 되기 전에 평평해집니다. 긴 문맥을 더 잘 쓴 쪽이 이긴 셈입니다.

## s1_background/transformers-won-because-they-scale-the-bitter-l#3
세 번째 상자의 연결은 저희 해석입니다. Sutton의 글에는 Transformer라는 단어가 없습니다. 병렬 학습과 긴 문맥 모두 계산을 더 받아들이는 쪽이었다고 보았습니다. 루프가 같은 시험을 통과하는지는 발표 끝에서 다시 묻겠습니다.

## s1_background/a-looped-model-reuses-the-same-layers-instead#1
루프 모델은 이 두 흐름 사이에 놓입니다. Figure 4 오른쪽에서는 같은 파란 막대를 다시 지날 때마다 모든 위치가 제자리에서 갱신되고, 빨간 테두리의 생각은 토큰을 쓰지 않습니다. RNN의 반복을 깊이 축으로 옮긴 모양이고 2018년 Universal Transformers의 설계입니다. 층을 더하지 않고 깊이를, 토큰을 쓰지 않고 단계를 얻으려는 시도입니다.

## s1_background/answer-to-q1#1
두 길은 같은 곳에서 막힙니다. 층 쌓기는 깊이를 파라미터로 사고 CoT는 깊이를 토큰으로 삽니다. 토큰 하나가 패스 한 번에 거치는 깊이는 어느 쪽이든 L에 묶여 있습니다. 층 쪽은 지표가 깊이에 거의 반응하지 않았고, 늘리려 해도 파라미터가 따라 붙었습니다. CoT는 상한을 넘기는 하지만 넘는 단계마다 토큰을 써야 합니다. 남는 물음은 같은 층을 다시 돌려 이 상한을 토큰 없이 어디까지 넘을 수 있는가입니다.

## s1_background/roadmap-each-answer-raised-the-next-question#1
Q2로 가기 전에 지금까지를 지도 한 장에 올려 두겠습니다. 화살표는 앞 단계가 남긴 질문이고 금색 상자 여섯 개가 오늘 다룰 논문입니다. 왼쪽 뿌리에는 RNN과 Transformer, 그리고 언제 멈출지 배우는 ACT가 있습니다.

## s1_background/roadmap-each-answer-raised-the-next-question#2
고정 깊이가 단계 수를 막자 2018년 Universal Transformers가 블록 하나를 깊이 방향으로 재사용하고 토큰마다 멈추게 했습니다.

## s1_background/roadmap-each-answer-raised-the-next-question#3
다음 질문은 그 블록이 원리상 무엇까지 계산하는가였고, Giannou 등은 루프가 프로그래밍 가능한 컴퓨터가 된다고 증명했습니다. 그사이 아래 줄의 CoT는 토큰을 써서 단계를 늘렸습니다.

## s1_background/roadmap-each-answer-raised-the-next-question#4
2025년에는 증명이 언어 모델로 옮겨 갑니다. Huginn이 3.5B에서 루프를 학습시켰고, MoR는 토큰마다 깊이를 달리했고, Ouro는 7.7T 토큰까지 사전학습했습니다.

## s1_background/roadmap-each-answer-raised-the-next-question#5
올해 가을 RLT는 깊이를 토큰 사이로 이어 가며 시간 축의 반복을 되살립니다. Astra 상자는 확인되지 않은 보도라서 따로 표시했습니다. 이제 두 번째 칸, Universal Transformers로 들어갑니다.

<!-- ARCHIVE (v7): scripts of slides cut or replaced; restore by moving a block above this comment


## s1_background/sept-2026-two-headlines-in-one-month#1
계기는 올해 9월입니다. 9월 2일 The Information이 GPT-6 Astra가 루프를 쓰고 그래서 CoT가 가려진다고 보도했습니다. 내부자 인용의 유료 기사이고 OpenAI는 확인하지 않았습니다.

## s1_background/sept-2026-two-headlines-in-one-month#2
열흘 뒤 Princeton의 Recurrent Looped Transformer가 무한한 시간 깊이를 내건 16쪽 설계 문서로 빠르게 퍼졌습니다. 둘 다 아직 주장이고 측정과의 대조는 Session B에서 합니다.

## s1_background/the-idea-dates-to-2018-two-problems-held-it-back#1
그런데 아이디어 자체는 2018년부터 있었습니다. (a)는 앞의 상한입니다. 깊이가 고정돼 있으니 모델은 길고 비싼 CoT로 생각해야 했습니다.

## s1_background/the-idea-dates-to-2018-two-problems-held-it-back#2
(b)는 루프의 학습 문제입니다. 보통 스택은 앞쪽 층이 특징을 뽑고 뒤쪽 층이 결정하는데, 블록 하나를 그냥 되풀이하면 그 블록이 패스마다 모든 역할을 맡아야 합니다. 이 설명은 수업의 틀이고 ablation한 논문은 없습니다. Huginn의 설계에서 다시 나옵니다.

-->
