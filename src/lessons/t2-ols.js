// © 2026 티쳐무 · 모든 권리 보유
// Ⅱ. 통계적 회귀 분석 — 교과서 노트북 「2. 통계적 회귀 분석 실습」 (1)~(4)
//   독립·종속 변수 → 상수항 → sm.OLS(y, X).fit( ) → summary( ) 읽기 → 유의하지 않은 변수 빼기 → 회귀식으로 예측
import { LOAD } from './common.js';

const OLS4 = "import statsmodels.api as sm\nX = smtrain[['temp', 'hour', 'humidity', 'windspeed']]\ny = smtrain['count']\nX = sm.add_constant(X)\nresults = sm.OLS(y, X).fit()";

export const T2 = {
  id: 'ols', num: 'Ⅱ', icon: '📐', title: '통계적 회귀', desc: 'statsmodels 로 회귀식을 구하고 결과표(summary)를 읽는다',
  lessons: [
    // ───────────────────────── Ⅱ-1 모델 만들고 결과표 읽기 ─────────────────────────
    {
      id: 'fit', title: '통계적 회귀 분석 — 모델 만들고 결과표 읽기', short: 'OLS 와 summary',
      goal: [
        '독립 변수 X 와 종속 변수 y 를 정한다',
        '`sm.add_constant( )` 로 상수항을 더하고 `sm.OLS(y, X).fit( )` 으로 회귀식을 구한다',
        '`summary( )` 에서 **R²(결정 계수)** · **coef(계수)** · **P>|t|(유의 확률)** 을 읽는다',
      ],
      cells: [
        { kind: 'example', id: 'ft-load', title: '준비 — 데이터 읽기', code: LOAD },
        { kind: 'section', title: '(1) 독립 변수와 종속 변수 선택하기', text: '앞 단원에서 고른 `temp` · `hour` · `humidity` 에 `windspeed` 를 더한 네 변수로 대여량(`count`)을 설명해 보자. 교과서 노트북과 같은 선택이다.' },
        { kind: 'tip', tone: 'key', title: '왜 windspeed 를 더할까', text: '앞 단원에서 `windspeed` 와 `count` 의 상관계수는 **0.12** 로, 0.3 기준에 못 미쳤다. 교과서 노트북은 까닭을 적지 않았지만 이렇게 볼 수 있다. ① 이 실습의 물음은 「**날씨**와 자전거 대여량」이다. 이 데이터에서 숫자로 잰 날씨는 기온(`temp`) · 습도(`humidity`) · 풍속(`windspeed`) 세 가지이고, 이상치 레슨에서 상자그림으로 살핀 것도 이 셋이었다. ② 「바람이 세면 자전거를 덜 탈 것」이라는 생활 속 짐작으로는 관계가 있을 법하다. ③ 상관계수는 변수를 **하나씩** 떼어 본 값이다. 다른 변수와 **함께** 넣었을 때 쓸모가 있는지는 회귀 결과표의 **p값**(`P>|t|`)으로 따로 확인해야 한다. — 그래서 일부러 넣어 보고, (4) 결과표에서 정말 쓸모가 있는지 가려낸다.' },
        {
          kind: 'code', id: 'ft-xy', title: '독립 변수와 종속 변수 설정하기',
          code: "X = smtrain[['temp', 'hour', 'humidity', 'windspeed']]\ny = smtrain[【0】]",
          blanks: [{ answers: ["'count'", '"count"'], hint: '예측할 열 이름을 따옴표로' }],
          vars: ['X', 'y'],
        },
        { kind: 'tip', tone: 'easy', title: '왜 X 는 대문자, y 는 소문자일까', text: '수학에서 여러 값을 묶은 표(행렬)는 대문자, 한 줄짜리 값(벡터)은 소문자로 쓰는 습관을 따른 것이다. X 는 네 열짜리 표, y 는 한 열이다. 대괄호도 X 는 두 겹 `[[ ]]`(표), y 는 한 겹 `[ ]`(열 하나)이다.' },
        { kind: 'section', title: '(2) 상수항 추가하기', text: '회귀식 count = **b₀** + b₁×temp + b₂×hour + … 의 맨 앞 b₀ 이 상수항(절편)이다. statsmodels 는 상수항을 알아서 넣지 않으므로 값이 모두 1 인 열을 직접 더한다.' },
        {
          kind: 'code', id: 'ft-const', title: '상수항 추가하기',
          what: 'statsmodels 는 통계 분석(가설검정·회귀 등)을 위한 라이브러리이고, 흔히 `sm` 이라는 짧은 이름으로 불러온다.',
          code: "import statsmodels.api as sm\nX = sm.【0】(X)\nX",
          blanks: [{ answers: ['add_constant'], hint: '더하다(add) + _ + 상수(constant)' }],
          vars: ['X'],
          read: '맨 앞에 값이 모두 1.0 인 `const` 열이 생겼다. 표가 길어 앞 5줄과 뒤 5줄만 보이고, 아래에 크기(10886 rows × 5 columns)가 적힌다.',
        },
        {
          kind: 'ask', id: 'ft-ask-const', title: '생각해 보기', q: '상수항 없이 회귀식을 구하면 어떻게 될까?',
          choices: ['결과가 똑같다', '모든 독립 변수가 0 일 때 예측값이 반드시 0 이 되도록 직선이 원점을 지나게 된다', '오류가 나서 실행되지 않는다'],
          answer: 1, why: '절편이 없으면 직선이 원점에 묶인다. 기온 0℃·0시·습도 0% 에서 대여량이 꼭 0 일 까닭은 없으므로 상수항을 넣는다.',
        },
        { kind: 'section', title: '(3) 통계적 회귀 분석 모델 생성·적합하기', text: 'OLS(Ordinary Least Squares, 최소제곱법)는 실제값과 예측값의 차이(잔차)를 제곱해 더한 값이 가장 작아지는 계수를 찾는다.' },
        {
          kind: 'code', id: 'ft-ols', title: '모델 만들기',
          code: "model = sm.【0】(y, X)",
          blanks: [{ answers: ['OLS'], hint: '최소제곱법의 영어 머리글자(대문자 세 글자)' }],
        },
        { kind: 'tip', tone: 'warn', title: '순서에 주의 — (y, X)', text: 'statsmodels 의 `sm.OLS( )` 는 **종속 변수 y 가 먼저**, 독립 변수 X 가 나중이다. Ⅲ단원의 scikit-learn 은 반대로 `fit(X, y)` 다. 순서를 바꿔 쓰면 엉뚱한 식을 구하거나 오류가 난다.' },
        {
          kind: 'code', id: 'ft-fit', title: '데이터에 모델을 적합하기',
          what: '`model` 은 「무엇을 무엇으로 설명할지」만 정해 둔 것이다. `fit( )` 을 불러야 실제로 계수를 계산한다.',
          code: "results = model.【0】()\nresults",
          blanks: [{ answers: ['fit'], hint: '(옷이) 맞다·맞추다' }],
          vars: ['results'],
          read: '결과 객체가 만들어졌다는 알림만 나온다. 내용은 다음 셀에서 본다.',
        },
        { kind: 'section', title: '(4) 회귀 분석 결과 확인하기', text: '`summary( )` 는 회귀 분석 결과를 표 하나로 정리해 준다. 낯선 낱말이 많지만 먼저 볼 곳은 세 군데다 — **R-squared**, **coef**, **P>|t|**.' },
        {
          kind: 'code', id: 'ft-summary', title: '결과표 출력하기',
          code: "print(results.【0】())",
          blanks: [{ answers: ['summary'], hint: '요약' }],
        },
        { kind: 'panel', panel: 'summaryRead', id: 'pn-sum', from: 'ft-summary' },
        {
          kind: 'ask', id: 'ft-ask-r2', title: '결과 해석', q: 'R-squared 가 0.444 라는 것은?',
          choices: ['예측이 44.4% 맞는다', '대여량(count)이 들쭉날쭉한 정도의 약 44% 를 이 네 변수로 설명한다', '상관계수가 0.444 다'],
          answer: 1, why: '결정 계수는 종속 변수의 변동 가운데 회귀식이 설명하는 비율이다. 나머지 56% 는 날씨·요일·계절 같은 다른 까닭이나 우연이다.',
        },
        {
          kind: 'ask', id: 'ft-ask-p', title: '결과 해석', q: '유의수준 0.05 에서 **유의하지 않은** 변수는?',
          choices: ['temp', 'hour', 'humidity', 'windspeed'],
          answer: 3, why: 'windspeed 의 P>|t| 가 **0.966** 으로 0.05 보다 훨씬 크다. 계수도 0.0000556 으로 0 에 가깝고, 신뢰구간 [−0.003, 0.003] 이 0 을 품고 있다. 상관 분석에서 0.3 기준에 못 미쳤던 변수다.',
        },
        {
          kind: 'ask', id: 'ft-ask-coef', title: '결과 해석', q: '`hour` 의 coef 가 0.0980 이다. 뜻으로 알맞은 것은?',
          choices: ['다른 변수가 같을 때, 한 시간 늦어질 때마다 count(로그 값)가 약 0.098 커진다', '한 시간마다 자전거가 0.098 대 늘어난다', 'hour 와 count 의 상관계수가 0.098 이다'],
          answer: 0, why: '계수는 「그 변수만 1 늘고 나머지는 그대로일 때 y 가 바뀌는 양」이다. y 가 로그 값이므로 자전거 대수로는 곱으로 바뀐다 — 아래 상자를 보자.',
        },
        { kind: 'tip', tone: 'key', title: '🔬 더 깊이 — 로그 값의 계수를 대여 수로 읽기', text: 'count = log(대여 수 + 1) 이므로 count 가 0.098 커지면 (대여 수 + 1) 은 e^0.098 ≈ **1.10배**가 된다. 곧 「한 시간 늦을 때마다 대여 수가 약 10% 많아진다」는 뜻이다. temp 의 0.0538 은 1℃ 오를 때마다 약 5.5%, humidity 의 −0.0134 는 습도 1% 오를 때마다 약 1.3% 줄어든다는 뜻이다.' },
      ],
      quiz: [
        { q: '`sm.OLS(y, X)` 에서 첫째 자리에 오는 것은?', choices: ['독립 변수 X', '종속 변수 y', '상수항'], answer: 1, why: 'statsmodels 는 (y, X) 차례다. scikit-learn 의 fit(X, y) 와 반대다.' },
        { q: '`sm.add_constant(X)` 를 하면 X 에 무엇이 생기나?', choices: ['값이 모두 1 인 const 열', '값이 모두 0 인 열', '평균 열'], answer: 0, why: '이 열의 계수가 절편(상수항)이 된다.' },
        { q: 'summary 에서 어떤 변수의 P>|t| 가 0.05 보다 크다면?', choices: ['그 변수는 가장 중요하다', '그 변수의 계수가 0 이 아니라고 말할 근거가 부족하다(유의하지 않다)', '모델 전체가 쓸모없다'], answer: 1, why: '계수마다 「이 계수는 0 이다」를 검정한다. p 가 크면 그 가설을 버리지 못한다.' },
        { q: '결정 계수 R² 의 범위는?', choices: ['−1 ~ 1', '0 ~ 1', '0 ~ 100'], answer: 1, why: '0 이면 하나도 설명 못 하고 1 이면 완벽히 설명한다. (−1 ~ 1 은 상관계수의 범위.)' },
      ],
    },

    // ───────────────────────── Ⅱ-2 회귀식 다듬기와 예측 ─────────────────────────
    {
      id: 'use', title: '회귀식 다듬기와 예측', short: '회귀식·예측',
      goal: [
        '유의하지 않은 변수를 빼고 다시 적합해 R² 를 견준다',
        '`params` 로 계수를 꺼내 **회귀식**을 적는다',
        '새 조건을 넣어 대여량을 예측하고 `np.expm1( )` 로 대여 수로 되돌린다',
      ],
      cells: [
        { kind: 'example', id: 'us-load', title: '준비 — 지난 레슨의 모델 다시 만들기', what: '데이터를 읽고, 네 변수로 만든 모델 `results` 를 다시 만든다.', code: LOAD + '\n' + OLS4 + "\nprint('준비 끝')" },
        { kind: 'section', title: 'windspeed 를 빼면?', text: '유의하지 않은 변수는 빼고 다시 적합하는 것이 보통이다. 설명력이 얼마나 줄어드는지 견주어 보자.' },
        {
          kind: 'code', id: 'us-drop', title: '세 변수로 다시 적합하기',
          code: "X2 = sm.add_constant(smtrain[['temp', 'hour', 'humidity']])\nresults2 = sm.OLS(y, X2).fit()\nprint(round(results.rsquared, 4), round(results2.【0】, 4))\nprint(round(results.rsquared_adj, 4), round(results2.rsquared_adj, 4))",
          blanks: [{ answers: ['rsquared'], hint: 'R-squared 를 한 낱말로(소문자)' }],
          vars: ['results2'],
          read: '첫 줄(R²)도 둘째 줄(수정 결정 계수)도 넷째 자리까지 **똑같다**. windspeed 는 설명에 보태는 것이 없었다.',
        },
        { kind: 'tip', tone: 'easy', title: '수정 결정 계수(Adj. R-squared)', text: 'R² 는 변수를 더하기만 하면 (쓸모없는 변수라도) 커지거나 그대로다. 그래서 변수 개수만큼 깎아 주는 **수정 결정 계수**로 모델을 견준다. 변수를 뺐는데 수정 결정 계수가 그대로이거나 커지면 뺀 변수는 쓸모가 없었다는 뜻이다. 변수가 적은 식은 읽기도 쉽다.' },
        {
          kind: 'code', id: 'us-params', title: '계수 꺼내기',
          code: "results2.【0】",
          blanks: [{ answers: ['params'], hint: 'parameters(매개변수) 의 줄임말' }],
          read: '회귀식은 **count = 3.1995 + 0.0538 × temp + 0.0980 × hour − 0.0134 × humidity** 다.',
        },
        { kind: 'panel', panel: 'predictCalc', id: 'pn-calc', py: "import pandas as pd, json\nimport statsmodels.api as sm\ndf = pd.read_csv('smtrain.csv')\nr = sm.OLS(df['count'], sm.add_constant(df[['temp', 'hour', 'humidity']])).fit()\nm = df.groupby('hour')['count'].mean().round(3)\nprint(json.dumps({'b': {k: float(v) for k, v in r.params.items()}, 'hourMean': m.tolist(), 'tempMean': round(float(df['temp'].mean()), 2), 'humMean': round(float(df['humidity'].mean()), 2)}))" },
        { kind: 'section', title: '새 조건으로 예측하기', text: '기온 25℃, 습도 50% 인 날 **아침 8시**의 대여량을 예측해 보자. 예측할 값도 모델을 만들 때와 같은 열(`const` 포함)을 가진 표로 넣는다.' },
        {
          kind: 'code', id: 'us-predict', title: '예측값 구하기',
          code: "import numpy as np\nnew = pd.DataFrame({'const': [1.0], 'temp': [25], 'hour': [【0】], 'humidity': [50]})\npred = results2.predict(new)\nprint(pred.round(3))\nprint(np.expm1(pred).round(1))",
          blanks: [{ answers: ['8'], hint: '아침 몇 시?' }],
          vars: ['pred'],
          read: '예측 count 는 4.66, 대여 수로 되돌리면 약 **104.6 대**다.',
        },
        {
          kind: 'ask', id: 'us-ask-line', title: '생각해 보기', q: '이 회귀식에서 hour 는 1 늘 때마다 **늘 똑같이** 0.098 씩 더해진다. 앞에서 본 시간대별 평균 대여량과 견주면?',
          choices: ['실제로도 시각이 늦을수록 꾸준히 늘어나므로 잘 맞는다', '실제는 8시·17시에 솟았다 내려가는 모양이라, 직선 하나로는 이 모양을 그릴 수 없다', '시각은 대여량과 관계가 없다'],
          answer: 1, why: '위 계산기의 그래프에서 회색 실제 평균선과 파란 직선을 견주어 보자. 새벽에는 직선이 너무 높고 출근 시간에는 너무 낮다. 이 한계를 Ⅲ단원 「더 해 보기」에서 고쳐 본다.',
        },
      ],
      quiz: [
        { q: '변수를 하나 뺐는데 R² 가 거의 그대로라면?', choices: ['뺀 변수는 설명에 거의 보탬이 되지 않았다', '모델이 잘못 만들어졌다', '그 변수가 가장 중요했다'], answer: 0, why: '설명력이 그대로이니 빼도 손해가 없다. 변수가 적은 식이 읽기도 쉽다.' },
        { q: '회귀식 count = 3.2 + 0.05×temp 에서 temp 가 20 이면 count 는?', choices: ['3.25', '4.2', '23.2'], answer: 1, why: '3.2 + 0.05 × 20 = 3.2 + 1.0 = 4.2.' },
        { q: '예측한 count(로그 값)를 실제 대여 수로 되돌리는 함수는?', choices: ['`np.log1p( )`', '`np.expm1( )`', '`np.round( )`'], answer: 1, why: 'count = log(대여 수 + 1) 이므로 대여 수 = e^count − 1 = expm1(count).' },
      ],
    },
  ],
};
