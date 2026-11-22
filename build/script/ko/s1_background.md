# s1_background

<!-- 말할 거리(짧은 메모). 문장형 대본은 script/ko-full/에 있고, 노트의 ⏱ 시간은 그 대본 기준이다. -->

## s1_background/title#1
- 인사, Team 5
- 지금 모델은 오래 생각하려면 생각을 글(CoT)로 길게 씀
- 오늘 질문: 같은 층을 여러 번 다시 돌려서, 글을 더 안 쓰고도 더 깊이 생각할 수 있나
- 이런 모델 = Looped Transformer

## s1_background/sept-2026-openai-ships-gpt-6-astra#1
- 왜 지금 이 주제인가
- 9월 3일 OpenAI GPT-6 Astra 공개
- Altman (공개 직전 팟캐스트): 컴퓨터 다루는 일에서 사람과 거의 비슷, AGI로 가는 한 걸음 같다

## s1_background/sept-2026-openai-ships-gpt-6-astra#2
- ARC-AGI-3, ARC Prize가 같은 조건으로 잰 점수
- GPT-5.6 Sol 7.8%, 이전 최고 Claude Opus 5 30.2%, Astra 62.7% (두 배 넘게)
- 그러자 "어떻게 만들었나"를 두고 소문

## s1_background/sept-2026-gpt-6-astra-loops-spread-across-x-and-#1
- 소문: Astra가 같은 층을 반복해 돌리는 루프 구조라는 것
- 9월 2일 X 타임라인이 loop transformers, Neuralese(글로 안 쓰인 내부 표현) 같은 말로 도배
- LessWrong R. Arike: 보도가 Astra를 Geiping의 recurrent depth에 견줬다고 전함 (뒤에서 Huginn으로 다룸)

## s1_background/sept-2026-gpt-6-astra-loops-spread-across-x-and-#2
- 안전 쪽 걱정이 더 큼
- TechCrunch: Redwood CEO "극도로 우려"
- Astral Codex Ten: 생각을 글로 안 쓰고 루프에 되넣는 방식
- 글로 안 남는 생각은 감시가 어렵다는 걱정
- OpenAI는 구조를 확인한 적 없음, 끝에서 다시

## s1_background/research-followed-looped-papers-at-iclr-jumped-t#1
- 연구 쪽도 움직임
- 막대 = ICLR 투고 중 "looped"가 들어간 논문 수
- 2024년 3편, 2025년 4편, 2026년 11편: 손에 꼽는 수준

## s1_background/research-followed-looped-papers-at-iclr-jumped-t#2
- ICLR 2027에서 189편 (그중 175편은 모델 이름으로 씀)
- 1년 만에 열 배 넘게, 연구의 한가운데로

## s1_background/guiding-question#1
- 오늘의 질문: 토큰을 더 쓰는 대신 층을 다시 써서 더 오래 생각할 수 있나
- 나눠서: 루프 모델이 뭔지, 뭘 할 수 있는지, 가져다 쓸 만한지

## s1_background/four-questions-for-today#1
- 네 질문으로 풂
- Q1 층 쌓기와 CoT는 어디서 막히나
- Q2 루프는 원리상 뭘 계산하나, 학습으로 찾을 수 있나
- Q3 루프 언어 모델을 어떻게 만들고 키우나
- Q4 도입할 가치와 그 대가

## s1_background/what-we-want-ai-that-thinks-deeply-enough-to-sol#1
- Q1 시작. 깊이 생각한다 = 답하기 전에 계산 단계를 많이 거친다
- 왼쪽 층 쌓기: 4, 8, 12층으로 늘면 단계도 늘지만 파라미터 막대도 같이 참
- 오른쪽 CoT(중간 생각을 글로 써 가며 푸는 방식): 층 4개 그대로, 생각 토큰 t1, t2를 써서 입력에 붙임
- 정리: 층은 파라미터로, CoT는 토큰으로 값을 치름

## s1_background/way-1-stack-more-layers-measured-by-scaling-laws#1
- 층 쌓기의 기대: 더 깊은 네트워크가 더 깊이 생각할 것
- 진전은 스케일링 법칙으로 잼 (Kaplan)
- 테스트 손실(다음 토큰 예측 오차)이 파라미터, 데이터, 계산량에 거듭제곱으로 줄어듦

## s1_background/way-1-stack-more-layers-measured-by-scaling-laws#2
- 그런데 이 잣대가 말하는 건 "더 깊게"가 아니라 "더 크게"
- 전체 규모에는 민감, 깊이와 너비 배분에는 둔감
- 그것도 추론이 아니라 테스트 손실 기준

## s1_background/way-1-stack-more-layers-measured-by-scaling-laws#3
- 그 틈을 Saunshi가 짚음: 많은 추론 문제는 파라미터보다 깊이가 필요
- 보통 Transformer는 층마다 가중치가 따로라서, 깊이를 늘리면 파라미터도 늘어남

## s1_background/the-price-depth-caps-a-transformer-s-steps-per-t#1
- 치르는 값: 토큰이 Layer 1부터 L까지 한 번 오르면 끝 (금색 괄호, L단계)
- 어려운 문제여도 L단계 안에 답을 내야 함
- 더 계산하려면 토큰이나 통과 횟수를 늘리는 수밖에
- 그래서 지금 모델들은 다른 길을 택함

## s1_background/today-s-models-get-around-the-cap-by-writing-tok#1
- 지금 모델은 토큰을 써서 이 한계를 돌아감 (Saunshi 그림 왼쪽)
- 파란 막대 = 모델 전체
- 입력 읽고 t1을 써냄, t1이 입력에 붙어 다시 들어감, 이어서 t2, t3
- 단계를 늘릴수록 중간 단계를 전부 글로 쓰고 다시 읽어야 함

## s1_background/a-looped-model-reuses-the-same-layers-instead#1
- 오른쪽 = 루프 모델, 같은 파란 블록을 되풀이
- 한 번 돌 때마다 모든 위치의 빨간 상태(잠재 생각)가 제자리에서 갱신
- 갈색 칸 = CoT였다면 쓰였을 토큰 자리, 여기선 비어 있음, 토큰 비용 없음
- 토큰은 여전히 병렬 처리, 반복은 깊이 방향으로만

## s1_background/answer-to-q1#1
- 금색 문장: 층은 파라미터로, CoT는 토큰으로 값을 치르고, 토큰당 깊이는 고정
- 근거 세 줄: 손실은 깊이보다 규모를 따름 / 추론은 파라미터보다 깊이가 필요 / 한 번 통과는 많아야 L단계
- But: CoT는 깊이를 얻지만 단계를 전부 토큰으로 써야 함, 루프가 노리는 자리가 여기
- 넘김: 연구 지도

## s1_background/roadmap-each-answer-raised-the-next-question#1
- 시간순 지도. 금색으로 채워질 상자 6개 = 오늘의 논문, 화살표 = 남겨진 질문
- 출발점 셋: RNN(같은 규칙 반복), ACT 2016(언제 멈출지 학습), Transformer 2017(병렬 학습, 대신 깊이 고정)

## s1_background/roadmap-each-answer-raised-the-next-question#2
- 2018 Universal Transformers: 층을 더하지 않고 같은 블록을 되풀이
- ACT로 토큰마다 멈출 때를 정함

## s1_background/roadmap-each-answer-raised-the-next-question#3
- 다음 질문: 루프를 계속 돌리면 무엇까지 계산할 수 있나
- Giannou: 루프 Transformer가 프로그램을 실행할 수 있음을 증명
- 같은 시기 점선 CoT: 글로 단계를 늘리는 다른 길

## s1_background/roadmap-each-answer-raised-the-next-question#4
- 2025년, 실제 언어 모델을 학습
- Huginn(2월): 3.5B 루프 언어 모델
- Mixture-of-Recursions: 토큰마다 루프 횟수를 고름
- Ouro: 멈추는 법을 학습, 7.7T 토큰으로 규모 확장

## s1_background/roadmap-each-answer-raised-the-next-question#5
- 2026년 질문: 계산을 다음 토큰으로 넘길 수 있나
- RLT: 내부 정보를 다음 토큰으로 넘김, 반복을 다시 시간 축으로 (위쪽 점선)
- 아래 점선 = 처음 본 Astra 보도, 아직 미확인
- 넘김: 지도 왼쪽부터, 루프가 원리상 무엇을 계산하나
