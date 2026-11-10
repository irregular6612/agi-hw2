# s1_background

## s1_background/title#1
안녕하십니까. Team 5의 발표를 시작하겠습니다. 오늘 저희가 묻는 질문은 모델이 토큰을 더 쓰는 대신 같은 층을 다시 돌려서 더 오래 생각할 수 있는가입니다. 두 세션에 걸쳐 답하겠습니다.

## s1_background/a-transformer-s-depth-caps-its-steps-per-token#1
토큰 하나가 아래에서 들어와 Layer 1부터 Layer L까지 차례로 지나고 위로 나갑니다. 한 층이 순차 계산 한 단계이므로 패스 한 번은 많아야 L단계입니다. Universal Transformers의 부록 B는 그래서 고정 깊이 모델이 계산적으로 universal일 수 없다고 지적합니다. 따라서 L단계보다 긴 계산이 필요한 문제는 그 일을 더 많은 토큰이나 더 많은 패스에 나누어 실어야 합니다. 지금의 모델들은 어느 쪽을 택하고 있을까요.

## s1_background/today-s-models-get-around-the-cap-by-writing-tok#1
토큰 쪽입니다. 이 그림은 Saunshi 논문의 Figure 4이고 왼쪽이 chain of thought, 줄여서 CoT입니다. 파란 막대 하나가 모델 전체이고 빨간 테두리가 방금 새로 쓴 생각입니다. 패스 한 번에 토큰 하나를 쓰고 그것을 다시 입력에 넣습니다. t1, t2, t3처럼 단계가 늘수록 토큰도 늘어납니다.

## s1_background/a-looped-model-reuses-the-same-layers-instead#1
오른쪽이 오늘 다룰 루프 모델입니다. 같은 파란 막대를 다시 통과하는데 이번에는 모든 위치가 제자리에서 한꺼번에 갱신됩니다. 빨간 테두리의 중간 생각은 밖으로 나오지 않고 숨은 상태에만 남습니다. 같은 층을 다시 쓰니 토큰 비용이 없습니다. 대신 그 생각을 저희가 읽을 수 없습니다.

## s1_background/guiding-question#1
이것이 수업에서 받은 질문입니다. 모델이 토큰을 더 쓰는 대신 층을 다시 써서 더 오래 생각할 수 있는가. 저희는 이 한 문장을 네 개의 질문으로 나누어 봅니다. 그 전에 이 연구들이 어떻게 쌓여 왔는지 시간순으로 보겠습니다.

## s1_background/eight-years-four-threads-of-work#1
2018년부터 2026년까지 여덟 해를 네 줄로 정리했습니다. 맨 위 줄은 루프가 계산을 할 수 있는가입니다. 2018년 Universal Transformers가 한 블록을 반복해 쓰는 설계를 냈고 2023년 Giannou는 루프를 돌린 Transformer가 프로그램 가능한 컴퓨터가 된다는 것을 증명했습니다. 2025년 Saunshi는 그 반복을 latent thought라고 불렀습니다.

## s1_background/eight-years-four-threads-of-work#2
그 아래 줄은 루프를 학습시킬 수 있는가입니다. Yang은 한 층을 돌려서 in-context learning을 학습시켰고 Huginn은 그것을 3.5B 모델로 키웠습니다. 위 줄이 손으로 만든 가중치라면 이 줄은 gradient descent가 그 가중치를 찾아 주는지를 묻습니다.

## s1_background/eight-years-four-threads-of-work#3
셋째 줄은 규모에서 이득이 있는가입니다. Saunshi는 같은 논문에서 1B 규모 언어 모델을 비교했고 MoR과 Ouro가 그 뒤를 이었습니다. 여기서부터는 루프가 파라미터와 FLOP 중 무엇을 아끼는지가 쟁점이 됩니다.

## s1_background/eight-years-four-threads-of-work#4
마지막 줄은 올해 2026년에야 생겼습니다. Astra가 루프를 쓴다는 보도, RLT라는 설계 문서, 그리고 CoT monitorability 연구가 9월과 10월에 몰려 나왔습니다. 생각이 토큰 밖으로 나가면 무엇을 잃는지를 묻는 줄이고 Session B에서 다룹니다.

## s1_background/each-thread-leaves-one-gap-open#1
같은 네 줄을 빠진 것 기준으로 다시 봅니다. 첫 줄은 루프가 한 패스보다 많은 계산을 할 수 있는가입니다. UT, Giannou, Saunshi가 답했지만 남은 것은 존재 증명과 작은 합성 과제뿐입니다.

## s1_background/each-thread-leaves-one-gap-open#2
다음 줄은 학습입니다. Yang과 Huginn이 시도했지만 하나는 toy task이고 다른 하나는 큰 실행 한 번입니다. 반복해서 확인된 결과가 없습니다.

## s1_background/each-thread-leaves-one-gap-open#3
규모 줄에서는 Saunshi 1B, MoR, Ouro가 모두 루프 모델이 낫다고 보고합니다. 그런데 비교 대상이 데이터 양이나 FLOP에서 다릅니다. 같은 데이터와 같은 FLOP에서 맞붙은 비교가 아직 없습니다.

## s1_background/each-thread-leaves-one-gap-open#4
마지막 줄은 무엇을 잃는가입니다. 2026년 보도와 보고서가 전부이고 측정은 거의 없습니다. 오른쪽 열을 세로로 읽으면 오늘 저희가 물을 것이 그대로 나옵니다.

## s1_background/four-questions-for-today#1
그래서 오늘의 질문은 넷입니다. Q1은 재사용한 층이 더 깊은 스택과 같은 계산을 할 수 있는가, Q2는 테스트 때 루프를 더 돌리면 좋아지도록 학습할 수 있는가이고 Session A가 맡습니다. Q3는 규모에서 파라미터당 그리고 FLOP당 이득이 있는가, Q4는 추론이 숨은 상태로 들어가면 무엇을 잃는가이고 Session B가 맡습니다. Q1부터 시작하겠습니다.
