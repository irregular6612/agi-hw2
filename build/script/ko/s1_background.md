# s1_background

## s1_background/title#1

안녕하십니까. Team 5의 발표를 시작하겠습니다. 저희는 같은 층을 반복하는 Looped Transformers로, 토큰을 더 쓰지 않고 내부 상태에서 계산하는 잠재 추론을 살펴보겠습니다.

## s1_background/sept-2026-one-scoop-said-gpt-6-astra-loops-and-i#1

왼쪽 카드는 2026년 9월 1일 The Information의 유료 기사입니다. 익명 내부자를 근거로 Astra가 층을 반복하며, 추론 일부나 전부가 가려진다고 보도했습니다. CoT는 중간 추론을 토큰으로 써 나가는 과정입니다. 제목은 이 기술이 보안 우려를 낳는다는 내용입니다.

## s1_background/sept-2026-one-scoop-said-gpt-6-astra-loops-and-i#2

오른쪽을 위에서부터 보겠습니다. 9월 2일 TechCrunch는 안전 전문가들의 우려와 Redwood CEO의 강한 걱정을 전했습니다. 같은 날 X의 @altryne는 루프, 반복 깊이, Neuralese가 타임라인을 채웠다고 썼습니다. 9월 3일 Fortune은 Astra 일부에 이 구조를 썼다고 단정했습니다. 전 OpenAI 연구자의 금지선을 넘는다는 우려도 인용했습니다.

## s1_background/sept-2026-one-scoop-said-gpt-6-astra-loops-and-i#3

아래 문장처럼 모두 유료 기사 하나로 거슬러 올라갑니다. OpenAI의 구조 확인은 없었습니다. 끝에서 이 주장으로 돌아오고, 먼저 연구의 관심도 보겠습니다.

## s1_background/research-followed-looped-papers-at-iclr-jumped-t#1

가로는 ICLR 연도이고 막대 높이는 ‘looped’를 언급한 투고 수입니다. 파란 막대는 2024년 3편, 2025년 4편, 2026년 11편입니다. 제목이나 초록, 키워드의 검색 색인으로 셌으며 철회와 심사 전 탈락도 포함합니다. 전체 논문을 대조한 수는 아닙니다.

## s1_background/research-followed-looped-papers-at-iclr-jumped-t#2

금색 막대가 ICLR 2027입니다. 189편 중 175편이 모델을 가리키는 용례입니다. 관심이 늘었다는 신호로 읽겠습니다. 투고 수가 성능을 입증하지는 않으며, Astra 보도가 증가의 원인인지는 알 수 없습니다.

## s1_background/guiding-question#1

질문은 층을 재사용해서 더 오래 생각할 수 있느냐입니다. 무엇인지, 무엇을 할 수 있는지, 쓸 만한지 살펴봅니다. 아래의 재귀는 신경망 내부 반복입니다. 수업 Topic 9의 시스템 수준 자기개선과 구분합니다.

## s1_background/four-questions-for-today#1

Q1은 층을 쌓거나 CoT를 늘릴 때 어디서 막히는지입니다. Q2는 루프의 계산 가능성과 그 계산을 학습할 수 있는지입니다. Q3는 언어 모델로 구현하고 규모를 키워도 이득인지입니다. Q4는 도입할 가치와 잃는 점입니다.

## s1_background/what-we-want-ai-that-thinks-deeply-enough-to-sol#1

Q1부터 시작합니다. 저희는 깊게 생각한다는 목표를 답 전에 여러 계산 단계를 거치는 것으로 잡았습니다. 논문 주장이 아닌 저희 설명 틀입니다. 두 방법은 층을 더 쌓기, CoT를 더 길게 쓰기입니다.

## s1_background/way-1-stack-more-layers-measured-by-scaling-laws#1

첫 방법은 층을 늘리면 더 깊이 생각하리라는 기대입니다. 스케일링 법칙은 파라미터와 데이터, 계산량의 크기와 성능의 관계입니다. 여기서는 다른 조건이 병목이 아닐 때, 예측 오차인 테스트 손실이 각 크기의 거듭제곱에 따라 변합니다.

## s1_background/way-1-stack-more-layers-measured-by-scaling-laws#2

새 문장은 측정 기준의 한계입니다. 테스트 손실은 전체 규모에 강하게 반응하지만 깊이와 너비의 배분에는 약하게 반응합니다. 추론 능력을 직접 잰 지표는 아닙니다.

## s1_background/way-1-stack-more-layers-measured-by-scaling-laws#3

마지막은 Saunshi의 문제 제기입니다. 많은 추론 문제는 많은 파라미터보다 긴 계산 깊이를 요구합니다. 하지만 서로 다른 층을 쌓으면 깊이와 파라미터가 함께 늘어납니다.

## s1_background/the-price-depth-caps-a-transformer-s-steps-per-t#1

왼쪽 그림을 아래에서 위로 읽겠습니다. 입력이 1층, 2층, 3층을 지나 마지막 L층에서 출력됩니다. 파란 상자는 층이고 금색 괄호는 순서대로 거치는 L단계입니다. 어려운 문제라도 한 번 통과할 때의 단계 수는 같습니다.

더 계산하려면 토큰이나 통과 횟수를 늘려야 합니다. 아래 UT 인용은 RNN의 반복 규칙을 배우기 쉬운 성질이 빠졌다는 지적입니다. RNN은 앞선 상태를 다음 계산으로 넘기는 순환 신경망입니다.

## s1_background/today-s-models-get-around-the-cap-by-writing-tok#1

이번에는 금색 테두리 안의 왼쪽을 아래부터 보겠습니다. 파란 막대 하나가 모델 전체입니다. 입력 i1부터 in을 처리해 빨간 테두리의 t1을 씁니다. 이를 입력에 붙여 t2, 다시 t3을 씁니다. 이것이 CoT로 단계를 늘리는 방식입니다.

Huginn은 매 단계를 말로 바꾸는 일이 낭비일 수 있다고 지적합니다. Ouro는 후속 학습에서 붙이는 CoT가 문맥을 길게 만든다고 지적합니다.

## s1_background/same-sentence-two-ways-to-read-it-step-by-step-o#1

저희가 만든 애니메이션으로, 같은 문장 ‘the cat sat on the mat’을 읽는 움직임입니다. 아래 여섯 칸은 토큰, 위 h1부터 h6은 내부 상태입니다. 한 바퀴 동안 금색을 따라가겠습니다.

왼쪽 RNN은 h1부터 h6까지 하나씩 켜집니다. 아직 계산하지 않은 점선 칸과 기다리는 위치 수가 줄어듭니다. 오른쪽 Transformer는 첫 단계에 여섯 칸이 함께 켜지고 완료됩니다. 연결선은 각 위치가 자신까지의 앞선 토큰을 참조한다는 뜻입니다.

끝의 O(n)은 길이 n만큼 순차 단계가 늘어난다는 뜻이고, O(1)은 층당 순차 단계 수가 길이에 따라 늘지 않는다는 뜻입니다. 아래 단서처럼 학습과 입력 읽기의 비교입니다. 문장을 생성할 때는 둘 다 한 토큰씩 씁니다.

## s1_background/rnns-read-step-by-step-transformers-read-all-at-#1

표로 정리하겠습니다. 왼쪽 열은 RNN과 LSTM, 오른쪽은 Transformer입니다. 금색 장점 행부터 읽겠습니다. RNN은 같은 가중치를 반복하며 단계당 비용이 일정합니다. Transformer는 한 문장 안의 위치들을 병렬로 학습합니다. 참조가 허용된 토큰끼리는 한 단계에 정보를 전달합니다.

## s1_background/rnns-read-step-by-step-transformers-read-all-at-#2

새 금색 행은 약점입니다. RNN은 O(n)의 순차 계산 때문에 한 문장 안을 병렬로 학습할 수 없습니다. 기본 RNN에서는 학습 신호가 약해지는 기울기 소실도 생깁니다. LSTM은 이를 줄였지만 순차 구조는 유지합니다.

Transformer는 토큰당 깊이가 고정됩니다. 어텐션은 토큰들이 서로의 정보를 참조하는 연산입니다. 비용 O(n²·d)는 길이 n의 제곱과 너비 d에 비례합니다. UT가 다룬 과제에서는 학습 때보다 긴 입력에도 취약했습니다.

## s1_background/rnns-read-step-by-step-transformers-read-all-at-#3

마지막 행의 귀납 편향은 구조가 특정 규칙을 배우기 쉽게 하는 성향입니다. RNN은 같은 규칙을 순서대로 적용합니다. 오른쪽은 저희 해석입니다. 어텐션은 모든 위치를 연결하고 순서는 위치 인코딩으로 따로 주므로, 순서와 거리에 대한 가정이 약하다고 읽었습니다.

## s1_background/a-looped-model-reuses-the-same-layers-instead#1

앞서 본 CoT 그림의 오른쪽이 강조됐습니다. 아래 흰 칸은 입력, 옅은 갈색 칸은 미래 CoT 토큰을 대신할 빈 자리입니다. 같은 파란 모델을 반복 통과하며 각 위치의 내부 상태를 갱신합니다. 빨간 표시는 새로 쓴 토큰이 아닌 잠재 추론 상태입니다.

이 방식은 RNN의 반복을 토큰 순서에서 깊이 방향으로 옮깁니다. 2018년 Universal Transformers의 아이디어입니다. CoT와 루프 모두 답할 때 계산량을 늘리지만, 늘어나는 것이 각각 토큰과 내부 반복입니다.

## s1_background/answer-to-q1#1

Q1의 답입니다. 층은 파라미터를, CoT는 토큰을 더 쓰며 토큰당 깊이는 고정됩니다. 체크 세 줄을 짚겠습니다. 테스트 손실은 깊이보다 규모에 민감했습니다. 추론에는 많은 파라미터 없이도 긴 깊이가 필요할 수 있습니다. 한 번의 통과는 최대 L단계입니다.

CoT는 토큰을 써서 그 한계를 우회합니다. 이제 Q2로 넘어가며 루프 연구의 지도를 보겠습니다.

## s1_background/roadmap-each-answer-raised-the-next-question#1

지도는 왼쪽에서 오른쪽으로 시간을 따라갑니다. 금색 상자는 다룰 여섯 논문입니다. 화살표는 인용 관계가 아닌 앞 단계가 남긴 질문을 잇습니다.

먼저 2018년 이전의 세 상자입니다. RNN과 LSTM은 같은 규칙을 순서대로 반복합니다. 2016년 ACT는 반복 계산을 언제 끝낼지 학습하는 방법입니다. 2017년 Transformer는 병렬 학습을 택했지만 깊이는 고정됩니다.

## s1_background/roadmap-each-answer-raised-the-next-question#2

세 흐름이 2018년 Universal Transformers로 모입니다. 같은 블록을 깊이 방향으로 반복하고, ACT를 쓰면 토큰마다 멈출 시점을 정합니다.

## s1_background/roadmap-each-answer-raised-the-next-question#3

2022년부터 2023년 구간에는 두 경로가 나옵니다. 위 Giannou는 루프가 프로그램을 실행할 수 있음을 증명합니다. 학습 실험은 아닙니다. 아래 점선의 CoT는 토큰을 쓰며 계산을 늘리는 대안 경로입니다.

## s1_background/roadmap-each-answer-raised-the-next-question#4

다음 질문은 언어 모델 규모의 학습입니다. 2025년 2월 Huginn의 3.5B는 파라미터 수입니다. 이어 7월부터 10월에는 갈림길이 생깁니다. Mixture-of-Recursions는 토큰마다 필요한 깊이를 묻습니다. Ouro는 사전학습 규모를 키우며, 7.7T는 학습 토큰 수입니다.

## s1_background/roadmap-each-answer-raised-the-next-question#5

마지막은 2026년 9월부터 10월입니다. Recurrent Looped Transformer는 이전 토큰의 상태를 다음 토큰으로 넘깁니다. 위의 긴 점선은 RNN의 시간 방향 반복과 연결됩니다. 아래 GPT-6 Astra는 확인되지 않은 보도라 점선 상자입니다.

Q2에서는 Universal Transformers의 구조부터 보고, 루프가 원리상 어디까지 계산할 수 있는지 살펴보겠습니다.

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
-->
