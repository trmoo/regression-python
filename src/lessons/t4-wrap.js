// © 2026 티쳐무 · 모든 권리 보유
// Ⅳ. 정리 — 통계적 회귀와 기계학습 회귀 견주기 · 처음부터 끝까지 한 셀 · 한 장 정리 · 확인 문제
import { LOAD, ML_X, ML_SPLIT } from './common.js';

export const CHEAT = [
  ['데이터 읽기', "`pd.read_csv('smtrain.csv')`", '판다스'],
  ['모양·결측치 보기', '`df.info()` · `df.shape`', '판다스'],
  ['통계 요약', '`df.describe()`', '판다스'],
  ['값 세기', "`df['열'].value_counts()`", '판다스'],
  ['상자그림', "`df[['열1', '열2']].boxplot()`", '판다스 + 맷플롯립'],
  ['상관행렬', '`df.corr()`', '판다스'],
  ['히트맵', '`sns.heatmap(df.corr(), annot=True)`', '씨본'],
  ['상수항 더하기', '`sm.add_constant(X)`', 'statsmodels'],
  ['통계적 회귀', '`sm.OLS(y, X).fit()` → `.summary()`', 'statsmodels'],
  ['데이터 나누기', '`train_test_split(X, y, test_size=0.3, random_state=…)`', 'scikit-learn'],
  ['기계학습 회귀', '`LinearRegression().fit(X_train, y_train)`', 'scikit-learn'],
  ['예측', '`model.predict(X_test)`', 'scikit-learn'],
  ['평균 제곱 오차', '`mean_squared_error(y_test, y_pred)`', 'scikit-learn'],
  ['범주를 0·1 열로', "`pd.get_dummies(X, columns=['열'], drop_first=True)`", '판다스'],
];

export const T4 = {
  id: 'wrap', num: 'Ⅳ', icon: '📝', title: '정리', desc: '두 가지 회귀 분석을 견주고 전체 흐름을 한눈에 정리한다',
  lessons: [
    {
      id: 'summary', title: '정리 — 두 가지 회귀 분석 견주기', short: '정리',
      goal: [
        '통계적 회귀와 기계학습 회귀의 **목적·도구·평가 방법**을 견주어 말한다',
        '처음부터 끝까지의 코드를 한 셀로 다시 돌려 본다',
      ],
      cells: [
        {
          kind: 'tip', tone: 'compare', title: '통계적 회귀 분석 vs 기계학습 기반 회귀 분석', table: {
            head: ['', '통계적 회귀 분석', '기계학습 기반 회귀 분석'],
            rows: [
              ['목적', '변수와 결과의 **관계를 설명**한다(계수·유의성)', '처음 보는 데이터를 **정확히 예측**한다'],
              ['라이브러리', '`statsmodels`', '`scikit-learn`'],
              ['데이터', '전체(10,886줄)로 식을 구한다', '학습용 70% 로 배우고 평가용 30% 로 잰다'],
              ['상수항', '`sm.add_constant(X)` 로 직접 더한다', '알아서 넣는다'],
              ['인자 차례', '`sm.OLS(y, X)` — y 먼저', '`fit(X, y)` — X 먼저'],
              ['결과', '`summary()` 표 — R² 0.444, 계수, P>|t|', '`predict()` 예측값 — MSE 1.07'],
              ['이번 실습의 발견', 'windspeed 는 유의하지 않다(p = 0.966)', 'hour 를 범주로 바꾸면 MSE 1.07 → 0.42'],
            ],
          },
        },
        { kind: 'section', title: '처음부터 끝까지 한 번에', text: '교과서 114~121쪽의 실습을 한 셀에 모았다. 실행하면 상관 분석으로 고른 변수, 통계적 회귀의 R², 기계학습 회귀의 MSE 가 차례로 나온다.' },
        {
          kind: 'example', id: 'su-all', title: '전체 흐름',
          code: LOAD + "\nimport statsmodels.api as sm\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.metrics import mean_squared_error\n\n# 1. 상관관계로 변수 고르기\ncols = ['count', 'day', 'hour', 'season', 'workingday', 'weather', 'temp', 'humidity', 'windspeed']\nr = smtrain[cols].corr()['count'].abs()\nprint('상관 0.3 이상:', r[r >= 0.3].index.tolist())\n\n# 2. 통계적 회귀\nX = sm.add_constant(smtrain[['temp', 'hour', 'humidity', 'windspeed']])\ny = smtrain['count']\nresults = sm.OLS(y, X).fit()\nprint('R² =', round(results.rsquared, 3))\n\n# 3. 기계학습 회귀\n" + ML_X + "\n" + ML_SPLIT + "\nmodel = LinearRegression().fit(X_train, y_train)\nprint('MSE =', round(mean_squared_error(y_test, model.predict(X_test)), 3))",
        },
        {
          kind: 'tip', tone: 'compare', title: '한 장 정리 — 이번 실습에 나온 명령', table: {
            head: ['하는 일', '코드', '라이브러리'],
            rows: CHEAT,
          },
        },
      ],
      quiz: [
        { q: '「기온이 1℃ 오를 때 대여량이 얼마나 느는지, 그 관계가 우연이 아닌지」 알고 싶다. 알맞은 방법은?', choices: ['통계적 회귀 분석의 summary 에서 계수와 P>|t| 를 본다', '기계학습 회귀의 MSE 만 본다', '히트맵의 색만 본다'], answer: 0, why: '관계의 크기(계수)와 유의성(p 값)은 통계적 회귀 결과표에서 읽는다.' },
        { q: '기계학습 회귀에서 평가용 데이터를 따로 두는 까닭은?', choices: ['계산 시간을 줄이려고', '처음 보는 데이터에 대한 예측 실력을 재려고', '결측치를 없애려고'], answer: 1, why: '배운 데이터로만 재면 외운 것과 이해한 것을 가릴 수 없다.' },
        { q: '`sm.OLS(y, X)` 와 `model.fit(X, y)` 의 공통점은?', choices: ['둘 다 y 가 먼저다', '둘 다 독립 변수와 종속 변수를 받아 회귀식을 구한다', '둘 다 상수항을 알아서 넣는다'], answer: 1, why: '하는 일은 같지만 인자 차례와 상수항 처리가 다르다.' },
        { q: '이 데이터의 `count` 에 대해 옳은 것은?', choices: ['실제 대여 수 그대로다', 'log(대여 수 + 1) 이라 예측값을 대여 수로 읽으려면 expm1 로 되돌린다', '대여 수의 제곱이다'], answer: 1, why: '첫 줄 count 2.83 = log(3 + 13 + 1). 예측값·MSE 모두 로그 값 기준이다.' },
        { q: '선형 회귀에서 hour 를 숫자 하나로 넣었을 때의 한계는?', choices: ['계산이 너무 느리다', '시각이 1 늘 때마다 늘 같은 만큼 변한다고 가정해, 출퇴근 봉우리를 그릴 수 없다', 'hour 는 회귀에 쓸 수 없다'], answer: 1, why: '범주로 바꾸면(원-핫 인코딩) 시각마다 높이를 따로 정할 수 있어 MSE 가 1.07 → 0.42 로 줄었다.' },
        { q: '상관계수 0.3 이상인 변수만 고를 때 `abs()` 를 쓰는 까닭은?', choices: ['음의 상관도 강한 관계이므로', '계산을 빠르게 하려고', '상관계수를 0 ~ 100 으로 바꾸려고'], answer: 0, why: 'humidity 의 −0.33 처럼 음수여도 세기는 0.33 이다.' },
      ],
    },
  ],
};
