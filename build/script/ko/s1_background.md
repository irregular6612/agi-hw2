# s1_background

## s1_background/title#1
안녕하십니까, Team 5입니다. 지금은 모델을 더 오래 생각하게 하려면 생각을 글로 길게 쓰게 합니다. 오늘 저희가 묻는 질문은, 그 대신 같은 층을 여러 번 다시 돌려서 글을 더 쓰지 않고도 더 깊이 생각하게 만들 수 있느냐입니다. 이런 모델을 Looped Transformer라고 부릅니다.

## s1_background/sept-2026-openai-ships-gpt-6-astra#1
이 주제가 왜 지금 뜨거운지부터 보겠습니다. 9월 3일 OpenAI가 GPT-6 Astra를 공개했고, 그 직전 팟캐스트에서 Sam Altman은 Astra가 컴퓨터를 다루는 일에서 사람과 거의 비슷해진 것 같다고, AGI로 가는 길의 한 걸음처럼 느껴졌다고 말했습니다.

## s1_background/sept-2026-openai-ships-gpt-6-astra#2
오른쪽은 같은 시험 환경에서 ARC Prize가 잰 ARC-AGI-3 점수입니다. GPT-5.6 Sol이 7.8%, 그때까지 최고였던 Claude Opus 5가 30.2%였는데, Astra는 62.7%로 두 배를 넘겼습니다. 그러자 이 모델을 어떻게 만들었느냐를 두고 소문이 돌았습니다.

## s1_background/sept-2026-gpt-6-astra-loops-spread-across-x-and-#1
소문은 Astra가 같은 층을 반복해 돌리는 루프 구조를 쓴다는 이야기였습니다. 9월 2일 X는 loop transformers나 Neuralese 같은 말로 뒤덮였는데, Neuralese는 말로 쓰이지 않은 내부 표현입니다. 같은 날 LessWrong의 R. Arike는 보도가 Astra를 Geiping 연구진의 recurrent depth에 견줬다고 전합니다. 이 연구는 뒤에서 Huginn으로 다룹니다.

## s1_background/sept-2026-gpt-6-astra-loops-spread-across-x-and-#2
안전 쪽의 걱정은 더 컸습니다. TechCrunch 기사에서 Redwood의 CEO는 극도로 우려된다고 했고, Astral Codex Ten은 생각을 글로 적지 않고 루프에 되넣는 방식이라고 설명합니다. 글로 남지 않는 생각은 감시하기 어렵다는 걱정인데, OpenAI가 이 구조를 확인한 적은 없어서 발표 끝에서 다시 짚겠습니다.

## s1_background/research-followed-looped-papers-at-iclr-jumped-t#1
연구 쪽도 움직였습니다. 막대는 ICLR 투고 가운데 looped라는 단어가 들어간 논문 수인데, 2024년 3편, 2025년 4편, 2026년 11편으로 손에 꼽을 정도였습니다.

## s1_background/research-followed-looped-papers-at-iclr-jumped-t#2
그런데 ICLR 2027에서는 189편으로 뛰었고, 그중 175편은 모델을 가리키는 말로 썼습니다. 1년 만에 열 배 넘게 늘면서, 이 주제가 연구의 한가운데로 들어왔습니다.

## s1_background/guiding-question#1
그래서 오늘의 질문은 이렇습니다. 모델이 토큰을 더 쓰는 대신 층을 다시 써서 더 오래 생각할 수 있을까. 루프 모델이 무엇인지, 무엇을 할 수 있는지, 가져다 쓸 만한지로 나눠 보겠습니다.

## s1_background/four-questions-for-today#1
이걸 네 질문으로 풀겠습니다. Q1은 층을 쌓는 방법과 생각을 길게 쓰는 방법이 어디서 막히는지, Q2는 루프가 원리상 무엇을 계산하고 학습으로 그걸 찾을 수 있는지 묻습니다. Q3는 루프 언어 모델을 만들고 키우는 법을, Q4는 도입할 가치와 그 대가를 봅니다.

## s1_background/what-we-want-ai-that-thinks-deeply-enough-to-sol#1
Q1부터 보겠습니다. 깊이 생각한다는 건 답하기 전에 계산 단계를 많이 거친다는 뜻입니다. 왼쪽은 층을 쌓는 방법으로, 층이 4개에서 8개, 12개로 늘면 토큰당 단계도 늘지만 파라미터 막대도 함께 찹니다. 오른쪽은 chain of thought, 줄여서 CoT로, 모델이 중간 생각을 글로 써 가며 푸는 방식입니다. 층은 4개 그대로 두고 생각 토큰 t1, t2를 써서 입력에 붙이니, 파라미터 대신 토큰이 늘어납니다. 층은 파라미터로, CoT는 토큰으로 값을 치르는 셈입니다.

## s1_background/way-1-stack-more-layers-measured-by-scaling-laws#1
층을 쌓는 쪽의 기대는 더 깊은 네트워크가 더 깊이 생각하리라는 것이었고, 진전은 스케일링 법칙으로 쟀습니다. Kaplan 연구진에 따르면 다음 토큰 예측 오차인 테스트 손실은 파라미터, 데이터, 계산량에 대해 거듭제곱 법칙으로 줄어듭니다.

## s1_background/way-1-stack-more-layers-measured-by-scaling-laws#2
그런데 이 잣대는 더 깊게가 아니라 더 크게를 말합니다. 성능은 전체 규모에는 강하게, 깊이와 너비의 배분에는 약하게 반응했고, 그것도 추론이 아닌 테스트 손실 기준이었습니다.

## s1_background/way-1-stack-more-layers-measured-by-scaling-laws#3
그 틈을 Saunshi 연구진이 짚었습니다. 많은 추론 문제는 파라미터보다 깊이를 요구한다는 주장입니다. 그런데 보통의 Transformer는 층마다 가중치가 따로 있어서, 깊이를 늘리면 파라미터도 함께 늘어납니다.

## s1_background/the-price-depth-caps-a-transformer-s-steps-per-t#1
그래서 치르는 값이 있습니다. 토큰이 아래에서 들어와 Layer 1부터 Layer L까지 오르고, 금색 괄호의 L단계를 마치면 어려운 문제라도 답을 내야 합니다. 더 계산하려면 토큰이나 통과 횟수를 늘리는 수밖에 없습니다. 그래서 지금의 모델들은 다른 길을 택했습니다.

## s1_background/today-s-models-get-around-the-cap-by-writing-tok#1
그래서 지금의 모델은 토큰을 써서 이 한계를 돌아갑니다. Saunshi 논문 그림의 왼쪽 금색 상자에서 파란 막대가 모델 전체입니다. 입력을 읽고 빨간 t1을 써내면 그게 입력에 붙어 다시 들어가고, 이어서 t2와 t3를 씁니다. 단계를 늘릴수록 중간 단계를 모두 글로 써내고 다시 읽어야 하는 셈입니다.

## s1_background/a-looped-model-reuses-the-same-layers-instead#1
이번엔 오른쪽, 루프 모델입니다. 같은 파란 블록을 되풀이해 씁니다. 한 번 지날 때마다 모든 위치의 빨간 상태, 곧 잠재 생각이 제자리에서 갱신되고, 갈색 칸은 CoT라면 쓰였을 토큰의 빈 자리입니다. 생각이 내부에서 이어지니 토큰이 들지 않습니다. 토큰은 여전히 병렬로 처리하고, 반복은 깊이 방향으로만 일어납니다.

## s1_background/answer-to-q1#1
Q1의 답은 금색 문장입니다. 층은 파라미터로, chain of thought는 토큰으로 값을 치르고, 토큰당 깊이는 고정되어 있습니다. 근거는 세 줄로, 테스트 손실은 깊이보다 규모를 따랐고, 추론은 파라미터보다 깊이를 요구하며, 한 번의 통과는 많아야 L단계입니다. But 줄처럼 CoT는 깊이를 얻는 대신 단계를 전부 토큰으로 써내야 하고, 루프가 노리는 자리가 바로 여기입니다. 이제 연구 지도를 펼쳐 보겠습니다.

## s1_background/roadmap-each-answer-raised-the-next-question#1
지도는 시간순이고, 금색으로 채워질 여섯 상자가 오늘의 논문, 화살표는 남겨진 질문입니다. 출발점은 같은 규칙을 반복하는 RNN, 2016년 언제 멈출지 배우는 ACT, 2017년 병렬 학습 대신 깊이가 고정된 Transformer입니다.

## s1_background/roadmap-each-answer-raised-the-next-question#2
2018년 Universal Transformers는 층을 더하지 않고 같은 블록을 되풀이하고, ACT로 토큰마다 멈출 때를 정했습니다.

## s1_background/roadmap-each-answer-raised-the-next-question#3
다음 질문은 루프를 계속 돌리면 무엇까지 계산할 수 있느냐였고, Giannou 연구진은 루프 Transformer가 프로그램을 실행할 수 있음을 증명했습니다. 같은 시기 점선의 chain of thought는 글로 단계를 늘리는 다른 길로 갔습니다.

## s1_background/roadmap-each-answer-raised-the-next-question#4
2025년에는 실제 언어 모델을 학습시킵니다. 2월의 Huginn이 3.5B 규모의 루프 언어 모델을 만들었고, 이어서 Mixture-of-Recursions는 토큰마다 루프 횟수를 고르게 했으며, Ouro는 멈추는 법을 학습하며 7.7T 토큰으로 규모를 키웠습니다.

## s1_background/roadmap-each-answer-raised-the-next-question#5
2026년의 질문은 계산을 다음 토큰으로 넘길 수 있느냐입니다. Recurrent Looped Transformer, RLT는 내부 정보를 다음 토큰으로 넘겨, 위쪽 점선처럼 반복을 다시 시간 축으로 가져옵니다. 아래 점선은 처음에 본 Astra 보도로, 아직 확인되지 않았습니다. 이제 지도 왼쪽부터, 루프가 원리상 무엇을 계산하는지 보겠습니다.

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

## s1_background/same-sentence-two-ways-to-read-it-step-by-step-o#1
같은 문장을 두 방식으로 읽어 보겠습니다. 위의 h가 각 토큰의 내부 상태이고, 왼쪽 RNN은 앞 상태를 다음 계산에 넘기는 순환 신경망이라, h1이 켜져야 h2가 켜지는 식으로 금색 불이 하나씩 들어옵니다. 오른쪽 Transformer는 여섯 상태가 한꺼번에 켜지고, 각 위치가 자기까지의 토큰을 바로 참조합니다. 그래서 층 하나의 순차 단계가 RNN은 길이 n에 비례하고 Transformer는 한 번입니다. 생성은 둘 다 한 토큰씩이니, 차이는 학습과 프롬프트 읽기에서 납니다.

## s1_background/rnns-read-step-by-step-transformers-read-all-at-#1
표로 정리하면, 첫 행은 강점입니다. RNN과 LSTM은 매 단계 같은 가중치를 써서 단계당 비용이 일정하고 반복 계산이 자연스럽습니다. Transformer는 문장 전체를 병렬로 학습하고, 어떤 토큰도 한 단계 만에 다른 토큰에 닿습니다.

## s1_background/rnns-read-step-by-step-transformers-read-all-at-#2
약점은 그 뒷면입니다. RNN은 길이 n만큼 순차 단계가 필요해 병렬 학습이 안 되고, 먼 정보가 흐려지는 기울기 소실은 LSTM이 줄였지만 순차 구조는 남았습니다. Transformer는 고정된 깊이가 토큰당 단계를 묶고, 어텐션 비용은 길이의 제곱으로 커지며, 학습보다 긴 입력에 약했습니다.

## s1_background/rnns-read-step-by-step-transformers-read-all-at-#3
마지막 행은 귀납 편향, 곧 구조 때문에 어떤 규칙을 더 쉽게 배우는 성향입니다. RNN은 같은 규칙을 한 단계씩 되풀이하는 순차성을 가집니다. Transformer는 모든 토큰이 서로 이어지고 순서는 위치 인코딩으로 따로 받으니, 저희가 보기에 순서나 거리에 대한 가정이 거의 없습니다.
-->
