// © 2026 티쳐무 · 모든 권리 보유
// Ⅰ. 데이터 탐색과 전처리 — 교과서 노트북 「1. 회귀 분석 실습」 (1)~(5)
//   불러오기·특성 파악(info·describe) → 이상치 확인(상자그림) → 분석할 변수 고르기(점그래프·temp↔atemp) → 상관관계와 히트맵
import { LOAD, PLOT, COLS } from './common.js';

export const T1 = {
  id: 'eda', num: 'Ⅰ', icon: '🔍', title: '탐색과 전처리', desc: '데이터를 불러와 들여다보고, 이상치를 확인하고, 분석할 변수를 고른다',
  lessons: [
    // ───────────────────────── Ⅰ-1 불러오기와 특성 파악 ─────────────────────────
    {
      id: 'load', title: '데이터 불러오기와 특성 파악', short: '불러오기',
      goal: [
        '`pd.read_csv( )` 로 CSV 파일을 데이터프레임으로 읽는다',
        '`head( )` · `info( )` · `describe( )` 로 데이터의 모양과 통계를 살핀다',
        '결과에서 **결측치**와 **이상한 값**을 찾아낸다',
      ],
      cells: [
        { kind: 'section', title: '(1) 데이터 불러오기', text: '판다스(pandas)는 표 모양 데이터를 다루는 파이썬 라이브러리다. 흔히 `pd` 라는 짧은 이름으로 불러온다.' },
        {
          kind: 'code', id: 'ld-read', title: '판다스로 CSV 읽기',
          code: "import pandas as 【0】\nsmtrain = pd.【1】('smtrain.csv')",
          blanks: [
            { answers: ['pd'], hint: '판다스의 짧은 이름(두 글자)', strict: true },
            { answers: ['read_csv'], hint: 'read(읽다) + _ + csv' },
          ],
          vars: ['smtrain'],
        },
        {
          kind: 'code', id: 'ld-head', title: '위에서 세 줄만 보기',
          code: "smtrain.【0】(3)",
          blanks: [{ answers: ['head'], hint: '머리(맨 위)를 뜻하는 영어 낱말' }],
          read: '한 줄이 「어느 날 어느 한 시간」의 기록이다. 맨 왼쪽 0·1·2 는 줄 번호(인덱스)다.',
        },
        { kind: 'tip', tone: 'fix', title: '노트북 주석과 실제가 다르다', text: '교과서 노트북의 이 셀 주석은 「상위 3개의 행 불러오기」인데 코드는 `smtrain.head()` 다. 괄호를 비우면 **5줄**이 나온다. 3줄만 보려면 `head(3)` 처럼 숫자를 넣어야 한다.' },
        { kind: 'section', title: '(2-1) 데이터의 전체 정보', text: '줄이 몇 개인지, 열마다 비어 있는 칸(결측치)이 있는지, 숫자인지 글자인지를 한 번에 보여 주는 함수가 있다.' },
        {
          kind: 'code', id: 'ld-info', title: '[실습] 데이터의 전체적인 정보 확인하기',
          code: "smtrain.【0】()",
          blanks: [{ answers: ['info'], hint: 'information(정보) 의 앞 네 글자' }],
          read: '`10886 entries` → 10,886줄, `17 columns` → 17열. 모든 열의 Non-Null Count 가 10886 이라 **비어 있는 칸이 하나도 없다.** `datetime` 만 글자이고 나머지는 숫자(int64 정수 · float64 실수)다.',
        },
        { kind: 'tip', tone: 'colab', title: '코랩과 글자가 조금 다른 곳', text: '이 실습실의 판다스는 3.0 판이라 글자 열을 `str`, 첫 줄을 `<class \'pandas.DataFrame\'>` 로 적는다. 코랩(판다스 2.2)에서는 `object`, `<class \'pandas.core.frame.DataFrame\'>` 로 나온다. 뜻은 같다.' },
        {
          kind: 'ask', id: 'ld-ask-null', title: '결과 해석', q: 'info( ) 결과로 알 수 있는 것은?',
          choices: ['결측치가 있는 열이 여러 개다', '결측치가 하나도 없다', '모든 열이 글자로 되어 있다'],
          answer: 1, why: '17개 열 모두 Non-Null Count 가 10886(전체 줄 수)이다. 그래서 이번 실습에서는 결측치를 채우거나 지우는 단계가 필요 없다.',
        },
        { kind: 'section', title: '(2-2) 통계적 특성 알아보기', text: '`describe( )` 는 숫자 열마다 개수(count) · 평균(mean) · 표준편차(std) · 최솟값(min) · 사분위수(25% · 50% · 75%) · 최댓값(max)을 계산한다.' },
        {
          kind: 'code', id: 'ld-desc', title: '[추가] 통계적 특성 알아보기',
          code: "smtrain.【0】()",
          blanks: [{ answers: ['describe'], hint: '묘사하다·설명하다(영어 동사)' }],
          read: '`hour` 는 0~23 이다. `humidity`(습도)의 **최솟값이 0** 이고 `windspeed`(풍속)의 최솟값도 0 이다 — 습도 0% 는 실제로는 거의 없는 값이다. 다음 레슨에서 이상치로 살펴본다.',
        },
        {
          kind: 'ask', id: 'ld-ask-day', title: '결과 해석', q: '위 결과에서 `day` 열(날짜의 「일」)의 최댓값(max)을 읽어 보자. 무엇을 알 수 있나?',
          choices: ['31 — 한 달 내내 기록했다', '19 — 매달 1~19일 기록만 들어 있다', '12 — 월(month)과 같은 값이다'],
          answer: 1, why: '`day` 의 max 가 19 다. 이 데이터에는 매달 **1~19일**만 들어 있다 — 원래 자료가 공개 대회용이라 매달 1~19일은 학습용, 20일부터는 평가용으로 나뉘어 있었기 때문이다. 표의 최솟값·최댓값만 읽어도 데이터가 어떻게 모였는지 실마리를 얻는다.',
        },
        { kind: 'tip', tone: 'warn', title: '평균을 그대로 대여 수로 바꾸면 안 된다', text: '`count` 의 평균 4.59 를 e^4.59 − 1 ≈ 98 대로 바꾸면 「평균 대여 수」가 아니다. 로그의 평균은 평균의 로그와 다르다. 실제 대여 수의 평균은 191.6 대다.' },
        {
          kind: 'code', id: 'ld-vc', title: '날씨별로 몇 줄인지 세기',
          what: '범주(종류)를 나타내는 열은 값마다 몇 번 나오는지 세어 보면 좋다.',
          code: "smtrain['weather'].【0】()",
          blanks: [{ answers: ['value_counts'], hint: '값(value) + _ + 세다(counts)' }],
          read: '맑음(1)이 7,192줄로 가장 많고, 폭우·폭설(4)은 **딱 1줄**뿐이다. 이렇게 드문 범주는 모델이 배울 거리가 거의 없다.',
        },
        { kind: 'free', title: '자유 실험', text: "`smtrain.shape` · `smtrain.columns` · `smtrain['hour'].value_counts()` 를 실행해 보자." },
      ],
      quiz: [
        { q: '`smtrain.head()` 처럼 괄호를 비우면 몇 줄이 나올까?', choices: ['3줄', '5줄', '10줄'], answer: 1, why: '기본값이 5다. 원하는 수가 있으면 `head(3)` 처럼 넣는다.' },
        { q: '열마다 비어 있지 않은 칸의 수와 자료형을 한 번에 보여 주는 함수는?', choices: ['`describe()`', '`info()`', '`head()`'], answer: 1, why: '`info()` 의 Non-Null Count 로 결측치를 찾는다. `describe()` 는 통계값을 계산한다.' },
        { q: 'describe( ) 결과에서 「이상한 값」의 실마리가 된 것은?', choices: ['`hour` 의 최댓값이 23', '`humidity` 의 최솟값이 0', '`temp` 의 평균이 20.2'], answer: 1, why: '습도 0% 는 자연에서 거의 나오지 않는 값이라 측정이 잘못되었을 수 있다.' },
      ],
    },

    // ───────────────────────── Ⅰ-2 이상치 확인 ─────────────────────────
    {
      id: 'outlier', title: '이상치 확인 — 상자그림', short: '이상치',
      goal: [
        '`boxplot( )` 으로 여러 열의 상자그림을 한 번에 그린다',
        '사분위수 · IQR · 울타리로 **이상치**가 어떻게 정해지는지 안다',
        '이상치를 무조건 지우지 않고 **까닭을 따져 본다**',
      ],
      cells: [
        { kind: 'example', id: 'ou-load', title: '준비 — 데이터 읽기', what: '레슨마다 새 노트북이다. 데이터를 다시 읽는다.', code: LOAD },
        { kind: 'section', title: '(3) 이상치 확인', text: '이상치는 다른 값들과 동떨어진 값이다. 연속형 숫자 열인 기온·습도·풍속의 상자그림을 그려 보자.' },
        {
          kind: 'code', id: 'ou-box', title: '연속형 속성의 상자그림',
          code: "smtrain[['temp', 'humidity', 'windspeed']].【0】()",
          blanks: [{ answers: ['boxplot'], hint: '상자(box) + 그림(plot)' }],
          read: '`temp` 는 점이 없다. `humidity` 는 **아래쪽**, `windspeed` 는 **위쪽**에 동그라미(이상치)가 찍혔다. 그래프 위의 `<Axes: >` 는 그래프 영역을 만들었다는 알림이다.',
        },
        { kind: 'panel', panel: 'boxAnatomy', id: 'pn-box', py: "import pandas as pd, json\ndf = pd.read_csv('smtrain.csv')\nout = {}\nfor c in ['temp', 'humidity', 'windspeed']:\n    s = df[c]\n    q1, med, q3 = s.quantile(0.25), s.median(), s.quantile(0.75)\n    iqr = q3 - q1\n    lo, hi = q1 - 1.5 * iqr, q3 + 1.5 * iqr\n    inside = s[(s >= lo) & (s <= hi)]\n    out[c] = {'min': float(s.min()), 'max': float(s.max()), 'q1': round(float(q1), 4), 'med': round(float(med), 4), 'q3': round(float(q3), 4), 'lo': round(float(lo), 4), 'hi': round(float(hi), 4), 'wlo': float(inside.min()), 'whi': float(inside.max()), 'nlo': int((s < lo).sum()), 'nhi': int((s > hi).sum()), 'outs': sorted(set(round(float(v), 1) for v in s[(s < lo) | (s > hi)]))[:40]}\nprint(json.dumps(out))" },
        {
          kind: 'ask', id: 'ou-ask-most', title: '결과 해석', q: '이상치 점이 가장 많은 열은?',
          choices: ['temp (기온)', 'humidity (습도)', 'windspeed (풍속)'],
          answer: 2, why: '풍속은 위 울타리(약 32)를 넘는 값이 227줄이다. 습도는 아래 울타리(2)보다 작은 0 이 22줄, 기온은 이상치가 없다.',
        },
        {
          kind: 'code', id: 'ou-iqr', title: '풍속의 위 울타리를 직접 계산하기',
          what: '상자의 아래 끝이 Q1(25%), 위 끝이 Q3(75%)이고 그 차이가 IQR 이다. Q3 + 1.5 × IQR 보다 크면 이상치로 찍힌다.',
          code: "q1 = smtrain['windspeed'].quantile(0.25)\nq3 = smtrain['windspeed'].quantile(【0】)\niqr = q3 - q1\nupper = q3 + 1.5 * iqr\nprint(round(upper, 2))\nprint((smtrain['windspeed'] > upper).sum())",
          blanks: [{ answers: ['0.75', '.75'], hint: '위쪽 사분위수 Q3 는 몇 %의 자리일까(소수로)' }],
          vars: ['upper'],
          read: '위 울타리는 약 31.99, 그보다 센 바람이 기록된 줄은 227줄이다.',
        },
        {
          kind: 'code', id: 'ou-zero', title: '0 이 몇 번 기록되었나',
          code: "print((smtrain['humidity'] == 【0】).sum())\nprint((smtrain['windspeed'] == 0).sum())",
          blanks: [{ answers: ['0'], hint: '습도가 몇 % 인 줄을 셀까?' }],
          read: '습도 0% 가 22줄, 풍속 0 이 **1,313줄**(전체의 12%)이다. 풍속 0 이 이렇게 많은 것은 바람이 정말 없었다기보다 측정이 빠진 자리를 0 으로 채웠을 가능성이 크다.',
        },
        { kind: 'tip', tone: 'warn', title: '이상치라고 바로 지우지 않는다', text: '바람이 아주 센 날은 실제로 있었을 수 있다 — 상자그림의 점은 「다시 보라」는 신호이지 「틀렸다」는 판정이 아니다. 습도 0% 처럼 **있을 수 없는 값**은 잘못 기록된 것일 수 있고, 풍속 0 이 지나치게 많은 것은 빈 칸을 0 으로 채운 흔적일 수 있다. 교과서 실습은 여기서 값을 지우지 않고 그대로 다음 단계로 간다.' },
        {
          kind: 'ask', id: 'ou-ask-do', title: '생각해 보기', q: '습도 0% 인 22줄을 어떻게 다루는 것이 가장 알맞을까?',
          choices: ['그래프에서 튀니까 아무 생각 없이 지운다', '기록 오류일 가능성을 따져 보고, 지우거나 비슷한 날의 값으로 채우는 등 처리 방법을 정한다', '상자그림은 원래 틀리기 쉬우니 무시한다'],
          answer: 1, why: '이상치는 「왜 그 값이 나왔나」를 먼저 따진다. 처리 방법(삭제·대체·유지)은 그 까닭에 따라 고른다. 전체 10,886줄 가운데 22줄이라 이 실습의 결과에는 영향이 작다.',
        },
        { kind: 'free', title: '자유 실험', text: "습도가 0 인 줄만 골라 보자: `smtrain[smtrain['humidity'] == 0].head()` — 날짜가 서로 가까운가?" },
      ],
      quiz: [
        { q: 'Q1 = 7, Q3 = 17 이면 IQR 은?', choices: ['10', '24', '1.5'], answer: 0, why: 'IQR = Q3 − Q1 = 17 − 7 = 10.' },
        { q: '상자그림에서 이상치로 찍히는 값은?', choices: ['평균보다 큰 값', 'Q1 − 1.5×IQR 보다 작거나 Q3 + 1.5×IQR 보다 큰 값', '최댓값과 최솟값'], answer: 1, why: '이 두 경계(울타리) 밖의 값이 점으로 찍힌다.' },
        { q: '이상치를 찾았을 때 먼저 할 일은?', choices: ['모두 지운다', '왜 그런 값이 나왔는지 따져 본다', '평균으로 모두 바꾼다'], answer: 1, why: '진짜로 일어난 드문 일인지, 기록 오류인지에 따라 처리 방법이 달라진다.' },
      ],
    },

    // ───────────────────────── Ⅰ-3 분석할 변수 고르기 ─────────────────────────
    {
      id: 'choose', title: '분석할 속성(변수) 고르기', short: '변수 고르기',
      goal: [
        '`sns.pointplot( )` 으로 시간대별 대여량을 근무일·휴일로 나누어 비교한다',
        '`temp` 와 `atemp` 처럼 **거의 같은 정보**를 가진 변수를 상관계수로 찾아낸다',
        '`casual`·`registered` 를 독립 변수로 쓰면 안 되는 까닭을 설명한다',
      ],
      cells: [
        { kind: 'example', id: 'ch-load', title: '준비 — 데이터 읽기', code: LOAD },
        { kind: 'section', title: '그래프 라이브러리 불러오기', text: '맷플롯립(matplotlib)은 파이썬의 기본 그래프 라이브러리이고, 씨본(seaborn)은 그 위에서 통계 그래프를 더 쉽고 보기 좋게 그려 준다.' },
        {
          kind: 'code', id: 'ch-import', title: 'seaborn 과 matplotlib 불러오기',
          code: "import seaborn as 【0】\nimport matplotlib.pyplot as 【1】",
          blanks: [
            { answers: ['sns'], hint: '씨본의 짧은 이름(세 글자, s 로 시작)', strict: true },
            { answers: ['plt'], hint: 'plot 을 줄인 세 글자', strict: true },
          ],
        },
        { kind: 'section', title: '시간대별 대여량 — 근무일과 휴일', text: '한 그림(fig) 안에 그래프 영역(ax) 둘을 나란히 만들고, 왼쪽에는 근무일 여부, 오른쪽에는 공휴일 여부로 색을 나눈 점그래프를 그린다.' },
        { kind: 'tip', tone: 'easy', title: 'sns.pointplot( ) 이란', text: '**x 값마다 y 의 평균을 점 하나로 찍고, 점끼리 선으로 이어 주는 그래프**다. 여기서는 0시·1시·…·23시마다 그 시각의 기록(433~456줄)에 담긴 `count` 의 평균을 점으로 찍는다. 곧 `smtrain.groupby(\'hour\')[\'count\'].mean()` 을 구해 그리는 일을 한 줄로 해 준다. `hue=` 를 주면 그 열의 값(예: 근무일 1 · 쉬는 날 0)마다 색을 달리해 따로 그리고, `ax=` 는 어느 칸(ax1·ax2)에 그릴지 정한다.' },
        {
          kind: 'code', id: 'ch-point', title: '시간대별 점그래프 두 개',
          what: '`hue=` 에 적은 열의 값에 따라 색이 나뉜다. 점은 그 시각의 평균, 세로 막대는 그 평균이 얼마나 믿을 만한지(신뢰구간)다. 그리는 데 몇 초 걸린다.',
          code: "fig, (ax1, ax2) = plt.subplots(ncols=2, figsize=(10, 3))\nsns.pointplot(data=smtrain, x='hour', y='count', hue='【0】', ax=ax1)\nsns.pointplot(data=smtrain, x='hour', y='count', hue='【1】', ax=ax2)",
          blanks: [
            { answers: ['workingday'], hint: '근무일인지 나타내는 열' },
            { answers: ['holiday'], hint: '공휴일인지 나타내는 열' },
          ],
          read: '왼쪽 그래프의 주황(근무일 1)은 **아침 8시와 저녁 5~6시** 두 번 솟는다 — 출퇴근이다. 파랑(쉬는 날 0)은 낮에 둥글게 하나로 솟는다.',
        },
        { kind: 'panel', panel: 'hourProfile', id: 'pn-hour', py: "import pandas as pd, json\ndf = pd.read_csv('smtrain.csv')\ng = df.groupby(['workingday', 'hour'])['count'].mean().round(3)\nprint(json.dumps({'work': g[1].tolist(), 'rest': g[0].tolist(), 'all': df.groupby('hour')['count'].mean().round(3).tolist()}))" },
        {
          kind: 'ask', id: 'ch-ask-peak', title: '결과 해석', q: '근무일 그래프가 아침·저녁 두 번 솟는 까닭으로 가장 알맞은 것은?',
          choices: ['그 시각에 기온이 가장 높아서', '출퇴근·등하교에 자전거를 많이 타서', '데이터가 잘못 기록되어서'],
          answer: 1, why: '쉬는 날에는 그런 봉우리가 없다. 근무일에만 나타나니 출퇴근 이동으로 보는 것이 자연스럽다.',
        },
        { kind: 'tip', tone: 'key', title: '기억해 둘 것 — hour 와 count 는 직선 관계가 아니다', text: '시각이 늦을수록 대여량이 **꾸준히** 늘거나 줄지 않는다. 새벽에 바닥, 8시에 솟고, 낮에 조금 내려갔다가 17시에 또 솟는다. 회귀 모델에 `hour` 를 숫자 하나로 넣으면 이 모양을 직선 하나로 흉내 내야 한다 — Ⅲ단원 「더 해 보기」에서 다시 만난다.' },
        { kind: 'section', title: '[추가] temp 와 atemp 의 관계', text: '기온(`temp`)과 체감 온도(`atemp`)는 비슷해 보인다. 산점도를 그리고 상관계수를 구해 보자.' },
        {
          kind: 'code', id: 'ch-atemp', title: 'temp 와 atemp 의 상관관계 확인하기',
          code: "plt.scatter(smtrain.temp, smtrain.atemp)\nsmtrain[['temp', 'atemp']].【0】()",
          blanks: [{ answers: ['corr'], hint: 'correlation(상관) 의 앞 네 글자' }],
          read: '점들이 거의 한 줄로 늘어서 있고 상관계수가 **0.98** 이다. 체감 온도는 기온으로 거의 다 설명된다.',
        },
        {
          kind: 'ask', id: 'ch-ask-atemp', title: '생각해 보기', q: '`temp` 와 `atemp` 를 둘 다 독립 변수로 넣으면?',
          choices: ['정보가 두 배가 되어 예측이 크게 좋아진다', '거의 같은 정보를 두 번 넣는 셈이라, 계수가 불안정해지고 해석이 어려워진다', '오류가 나서 실행되지 않는다'],
          answer: 1, why: '독립 변수끼리 너무 닮으면(다중공선성) 모델이 둘 사이에서 몫을 제대로 나누지 못해 계수가 크게 흔들린다. 그래서 하나(`temp`)만 남긴다.',
        },
        { kind: 'section', title: '분석에 쓸 변수만 고르기', text: '교과서는 아래 9개 열로 상관관계를 살펴본다. 빠진 열과 까닭을 정리해 보자.' },
        {
          kind: 'tip', tone: 'compare', title: '뺀 열과 까닭', table: {
            head: ['뺀 열', '까닭'],
            rows: [
              ['`casual` · `registered`', '**꼭 빼야 한다.** 둘을 더한 것이 대여 수라 `count` 를 만든 재료다. 넣으면 거의 완벽히 맞히지만, 대여량을 예측하려는 순간에는 이 값을 알 수 없다.'],
              ['`atemp`', '`temp` 와 상관계수 0.98 — 같은 정보가 두 번 들어간다.'],
              ['`datetime`', '글자다. 연·월·일·시는 이미 `year`·`month`·`day`·`hour` 로 나뉘어 있다.'],
              ['`holiday` · `year` · `month` · `dayofweek`', '이 단계에서는 빼고 시작한다. 비슷한 정보를 `workingday`(근무일)·`season`(계절)이 담고 있다. Ⅲ단원의 기계학습 회귀에서는 `month`·`dayofweek` 를 다시 넣는다.'],
            ],
          },
        },
        { kind: 'example', id: 'ch-cols', title: '분석에 필요한 변수만 선택하기', code: COLS + "\nprint(len(cols), '개 열')" },
        {
          kind: 'ask', id: 'ch-ask-leak', title: '생각해 보기', q: '내일 오전 8시의 대여량을 예측하려 한다. 다음 중 **예측할 때 미리 알 수 없는** 값은?',
          choices: ['그 시각의 일기예보 기온(`temp`)', '그 시각이 몇 시인지(`hour`)', '그 시각의 회원 대여 수(`registered`)'],
          answer: 2, why: '회원 대여 수는 대여가 끝나야 안다 — 예측하려는 값의 일부다. 이런 변수를 넣는 실수를 「데이터 누수」라고 한다.',
        },
        { kind: 'free', title: '자유 실험', text: "요일별 점그래프도 그려 보자: `sns.pointplot(data=smtrain, x='hour', y='count', hue='dayofweek')`" },
      ],
      quiz: [
        { q: "`sns.pointplot(..., hue='workingday')` 에서 `hue` 가 하는 일은?", choices: ['그래프 제목을 정한다', '그 열의 값에 따라 색을 나누어 따로 그린다', 'x 축을 정한다'], answer: 1, why: '`hue` 는 색(색조)이라는 뜻이다. 근무일(1)과 쉬는 날(0)이 다른 색으로 그려진다.' },
        { q: 'temp 와 atemp 의 상관계수가 0.98 이라는 것은?', choices: ['두 변수가 거의 같은 정보를 담고 있다', '두 변수는 관계가 없다', 'temp 가 atemp 의 원인이다'], answer: 0, why: '1 에 가까울수록 함께 움직인다. 인과까지는 말할 수 없다.' },
        { q: '`count` 를 예측할 때 독립 변수로 쓰면 **안 되는** 열은?', choices: ['`temp`', '`registered`', '`humidity`'], answer: 1, why: 'registered + casual = 대여 수. 예측하려는 값의 일부라 미리 알 수 없다.' },
      ],
    },

    // ───────────────────────── Ⅰ-4 상관관계와 히트맵 ─────────────────────────
    {
      id: 'corr', title: '히트맵과 상관관계 계수', short: '상관·히트맵',
      goal: [
        '`corr( )` 로 상관행렬을 구하고 `sns.heatmap( )` 으로 색 지도를 그린다',
        '상관계수의 **부호(방향)**와 **크기(세기)**를 읽는다',
        '`count` 와 상관계수의 절댓값이 0.3 이상인 변수를 골라낸다',
      ],
      cells: [
        { kind: 'example', id: 'co-load', title: '준비 — 데이터 읽기와 변수 목록', code: LOAD + '\n' + PLOT + '\n' + COLS },
        { kind: 'section', title: '(4) 상관행렬 구하기', text: '상관계수는 두 변수가 **함께 움직이는 정도**를 −1 ~ 1 로 나타낸다. 여러 변수를 한꺼번에 넣으면 모든 짝의 상관계수를 표(상관행렬)로 보여 준다.' },
        {
          kind: 'code', id: 'co-corr', title: '[추가] 필요한 변수만 가지고 상관행렬 구하기',
          code: "corr_data = smtrain[cols]\ncorr_data.【0】()",
          blanks: [{ answers: ['corr'], hint: '상관(correlation) 의 앞 네 글자' }],
          vars: ['corr_data'],
          read: '대각선은 모두 1(자기 자신과의 상관)이고, 표는 대각선을 기준으로 좌우가 같다.',
        },
        { kind: 'tip', tone: 'easy', title: '상관계수 읽는 법', text: '**부호**는 방향 — + 면 한쪽이 클 때 다른 쪽도 크고, − 면 한쪽이 클 때 다른 쪽은 작다. **절댓값**은 세기 — 1 에 가까울수록 직선에 가깝게 함께 움직이고, 0 에 가까우면 직선 관계가 거의 없다. 상관이 있어도 원인과 결과라는 뜻은 아니다.' },
        { kind: 'section', title: '(5) 히트맵 그리기', text: '숫자가 81개나 되는 표는 한눈에 읽기 어렵다. 값을 색으로 칠한 히트맵을 그려 보자.' },
        {
          kind: 'code', id: 'co-heat', title: '상관행렬을 히트맵으로 나타내기',
          what: '`linewidths` 는 칸 사이 선 두께, `square` 는 칸을 정사각형으로, `annot` 은 칸 안에 숫자 쓰기, `fmt=\'.2f\'` 는 소수 둘째 자리까지, `cmap` 은 색 이름이다.',
          code: "plt.figure(figsize=(10, 10))\nsns.【0】(corr_data.corr(), linewidths=0.1, square=True, annot=【1】, fmt='.2f', cmap='PiYG')",
          blanks: [
            { answers: ['heatmap'], hint: '열(heat) + 지도(map)' },
            { answers: ['True'], hint: '칸 안에 숫자를 쓸까? 참(첫 글자 대문자)', strict: true },
          ],
          read: '초록이 진할수록 +1, 분홍이 진할수록 −1 에 가깝다. `count` 줄에서 가장 진한 칸은 `hour`(0.57)다.',
        },
        {
          kind: 'ask', id: 'co-ask-top', title: '결과 해석', q: '`count` 와 **음(−)의 상관**이 가장 큰 변수는?',
          choices: ['humidity (−0.33)', 'weather (−0.11)', 'workingday (−0.02)'],
          answer: 0, why: '습도가 높을수록 대여량이 줄어드는 경향이 있다. 습도가 높은 날은 흐리거나 비가 오는 날이 많다(습도와 날씨의 상관 0.41).',
        },
        { kind: 'panel', panel: 'corrThreshold', id: 'pn-thr', py: "import pandas as pd, json\ndf = pd.read_csv('smtrain.csv')\n" + COLS + "\nc = df[cols].corr()['count'].drop('count').round(3)\nprint(json.dumps({'names': c.index.tolist(), 'r': c.tolist()}))" },
        { kind: 'section', title: 'count 와 상관이 높은 변수만 고르기', text: '상관계수의 **절댓값**이 0.3 이상인 변수를 골라 보자. 절댓값을 쓰는 까닭은 −0.33 처럼 음의 상관도 강한 관계이기 때문이다.' },
        {
          kind: 'code', id: 'co-select', title: '상관관계가 높은 변수 추출하기',
          code: "correlation_matrix = corr_data.corr()\ncorrelations = correlation_matrix['count'].【0】()\nselected_features = correlations[correlations 【1】 0.3].index\nprint(selected_features)",
          blanks: [
            { answers: ['abs'], hint: '절댓값(absolute value) 의 앞 세 글자' },
            { answers: ['>=', '>'], hint: '「0.3 이상」을 나타내는 비교 기호' },
          ],
          vars: ['selected_features'],
          read: "`count` 자신과 `hour` · `temp` · `humidity` 가 골라졌다.",
        },
        {
          kind: 'ask', id: 'co-ask-self', title: '결과 해석', q: '골라진 목록에 `count` 가 들어 있는 까닭은?',
          choices: ['count 가 가장 중요한 독립 변수라서', 'count 와 count 의 상관계수는 1 이라서', '코드에 오류가 있어서'],
          answer: 1, why: '자기 자신과의 상관은 언제나 1 이다. count 는 종속 변수이므로 독립 변수 후보에서는 뺀다 — 독립 변수 후보는 hour · temp · humidity 셋이다.',
        },
        { kind: 'tip', tone: 'warn', title: '다음 단계 미리 보기', text: '교과서의 통계적 회귀 실습은 이 셋에 `windspeed`(상관 0.12)를 더한 네 변수를 넣는다. 0.3 기준에 못 미치는 변수가 회귀 결과표에서 어떻게 나타나는지 다음 단원에서 확인해 보자.' },
        { kind: 'free', title: '자유 실험', text: "atemp · year · month 를 cols 에 더해 상관행렬을 다시 구해 보자. 예: `smtrain[cols + ['atemp', 'year']].corr()['count']`" },
      ],
      quiz: [
        { q: '상관계수 −0.33 과 +0.33 의 관계의 세기는?', choices: ['−0.33 이 더 약하다', '세기는 같고 방향만 다르다', '+0.33 이 더 약하다'], answer: 1, why: '세기는 절댓값으로 본다. 그래서 고를 때 `abs()` 를 썼다.' },
        { q: '히트맵에서 `annot=True` 가 하는 일은?', choices: ['색을 바꾼다', '칸 안에 숫자를 써 넣는다', '칸을 정사각형으로 만든다'], answer: 1, why: 'annotation(주석)의 줄임말. 정사각형은 `square=True`.' },
        { q: '상관계수가 0.57 인 hour 와 count 에 대해 말할 수 있는 것은?', choices: ['hour 가 count 의 원인이다', '두 변수가 어느 정도 함께 움직인다', '두 변수는 완벽한 직선 관계다'], answer: 1, why: '상관은 함께 움직이는 정도만 말한다. 1 이 아니므로 직선에서 벗어난 점도 많다.' },
      ],
    },
  ],
};
