// © 2026 티쳐무 · 모든 권리 보유
// Ⅲ. 기계학습 기반 회귀 분석 — 교과서 노트북 「3. 기계학습 기반 회귀 분석 실습」 (1)~(7)
//   변수 10개 → train_test_split(7:3) → LinearRegression( ).fit → predict → y_test[:5] → MSE
//   + 🔬 더 해 보기: hour 를 범주로 바꾸면(get_dummies) MSE 가 얼마나 줄어드나
import { LOAD, ML_X, ML_SPLIT } from './common.js';

const READY = LOAD + '\n' + ML_X + "\ny = smtrain['count']\n" + ML_SPLIT;
const TRAINED = READY + "\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.metrics import mean_squared_error\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)\ny_pred = model.predict(X_test)";

export const T3 = {
  id: 'ml', num: 'Ⅲ', icon: '🤖', title: '기계학습 회귀', desc: 'scikit-learn 으로 학습용·평가용을 나누어 학습하고 MSE 로 평가한다',
  lessons: [
    // ───────────────────────── Ⅲ-1 데이터 나누기 ─────────────────────────
    {
      id: 'split', title: '학습용과 평가용으로 데이터 나누기', short: '데이터 나누기',
      goal: [
        '독립 변수 10개와 종속 변수를 정한다',
        '`train_test_split( )` 으로 학습용 70% · 평가용 30% 로 나눈다',
        '`random_state` 가 하는 일을 설명한다',
      ],
      cells: [
        { kind: 'example', id: 'sp-load', title: '준비 — 데이터 읽기', code: LOAD },
        { kind: 'section', title: '(1) 독립 변수와 종속 변수 선택하기', text: '통계적 회귀에서는 변수를 넷만 골라 계수를 하나하나 해석했다. 기계학습 회귀에서는 **예측을 잘하는 것**이 목표라 쓸 만한 변수를 넉넉히 넣는다. 교과서 노트북은 아래 10개를 넣는다.' },
        {
          kind: 'code', id: 'sp-xy', title: '독립 변수와 종속 변수 설정하기',
          code: ML_X + "\ny = smtrain[【0】]\nprint(X.shape, y.shape)",
          blanks: [{ answers: ["'count'", '"count"'], hint: '예측할 열 이름을 따옴표로' }],
          vars: ['X', 'y'],
          read: 'X 는 10,886줄 × 10열, y 는 10,886개짜리 한 줄이다.',
        },
        { kind: 'section', title: '(2) 데이터 분할하기', text: '모델이 배운 데이터로 시험까지 보면 실력을 부풀려 재게 된다. 그래서 일부를 **떼어 두었다가** 학습이 끝난 뒤에 평가한다.' },
        { kind: 'tip', tone: 'easy', title: '시험 문제를 미리 보여 주면 안 된다', text: '문제집(학습용 데이터)으로 공부하고, 처음 보는 시험지(평가용 데이터)로 실력을 잰다. 문제집에 있던 문제를 그대로 시험에 내면 외운 학생도 100점이 나와서 진짜 실력을 알 수 없다.' },
        {
          kind: 'code', id: 'sp-split', title: '학습용·평가용으로 나누기',
          what: '`test_size` 는 평가용 데이터의 비율, `random_state` 는 무작위로 섞는 「씨앗」 번호다.',
          code: "from sklearn.model_selection import train_test_split\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=【0】, random_state=2000)",
          blanks: [{ answers: ['0.3', '.3'], hint: '평가용 30% 를 소수로' }],
          vars: ['X_test', 'y_test'],
        },
        {
          kind: 'code', id: 'sp-shape', title: '나뉜 크기 확인하기',
          code: "print(X_train.【0】, X_test.shape)\nprint(len(y_train), len(y_test))",
          blanks: [{ answers: ['shape'], hint: '(줄 수, 열 수) 를 알려 주는 속성' }],
          read: '학습용 7,620줄, 평가용 3,266줄 — 10,886줄의 70% 와 30% 다.',
        },
        {
          kind: 'ask', id: 'sp-ask-order', title: '생각해 보기', q: '함수가 돌려준 네 값을 `X_train, X_test, y_train, y_test` 차례로 받는다. 차례를 `X_train, y_train, X_test, y_test` 로 바꿔 받으면?',
          choices: ['파이썬이 알아서 바로잡는다', '오류는 안 나도 이름과 내용이 엇갈려, 평가용 X 를 y_train 이라고 부르게 된다', '실행되지 않는다'],
          answer: 1, why: '`train_test_split` 은 「X 학습·X 평가·y 학습·y 평가」 차례로 돌려준다. 받는 이름은 우리가 붙이는 것일 뿐이라 차례가 틀려도 경고해 주지 않는다.',
        },
        { kind: 'panel', panel: 'splitView', id: 'pn-split', py: "import pandas as pd, json\nfrom sklearn.model_selection import train_test_split\ndf = pd.read_csv('smtrain.csv')\nout = {'n': len(df), 'seeds': {}}\nfor s in [2000, 0, 42]:\n    tr, te = train_test_split(df, test_size=0.3, random_state=s)\n    first = set(te.index[te.index < 100])\n    out['seeds'][str(s)] = {'test': [int(i in first) for i in range(100)], 'ntrain': len(tr), 'ntest': len(te), 'head': [int(i) for i in te.index[:5]]}\nprint(json.dumps(out))" },
        {
          kind: 'ask', id: 'sp-ask-seed', title: '결과 해석', q: '`random_state=2000` 을 지우고 여러 번 실행하면?',
          choices: ['언제나 똑같이 나뉜다', '실행할 때마다 다른 줄이 뽑혀, 뒤에서 구할 MSE 도 조금씩 달라진다', '오류가 난다'],
          answer: 1, why: '씨앗 번호를 정해 두면 누가 언제 돌려도 똑같이 나뉘어 결과를 견줄 수 있다. 교과서와 같은 숫자를 얻으려면 2000 을 그대로 써야 한다.',
        },
        { kind: 'free', title: '자유 실험', text: "평가용 데이터의 앞부분을 보자: `X_test.head()` — 줄 번호가 뒤섞여 있다. 무작위로 뽑았기 때문이다." },
      ],
      quiz: [
        { q: '`test_size=0.3` 의 뜻은?', choices: ['학습용이 30%', '평가용이 30%', '30번 반복'], answer: 1, why: '평가용(test) 데이터의 비율이다. 나머지 70% 가 학습용.' },
        { q: '학습용과 평가용을 나누는 까닭은?', choices: ['계산을 빠르게 하려고', '모델이 처음 보는 데이터로 실력을 재려고', '데이터를 아끼려고'], answer: 1, why: '배운 데이터로만 재면 외운 것과 이해한 것을 가릴 수 없다.' },
        { q: '`random_state` 를 같은 숫자로 두면?', choices: ['언제나 똑같이 나뉜다', '데이터가 정렬된다', '평가용이 사라진다'], answer: 0, why: '무작위로 섞는 순서가 고정되어 결과를 다시 만들 수 있다(재현성).' },
      ],
    },

    // ───────────────────────── Ⅲ-2 학습·예측·평가 ─────────────────────────
    {
      id: 'train', title: '학습하고 예측하고 평가하기', short: '학습·평가',
      goal: [
        '`LinearRegression( )` 모델을 만들고 `fit(X_train, y_train)` 으로 학습한다',
        '`predict(X_test)` 로 예측하고 실제값 `y_test` 와 견준다',
        '평균 제곱 오차(**MSE**)로 모델을 평가하고 그 크기를 해석한다',
      ],
      cells: [
        { kind: 'example', id: 'tr-load', title: '준비 — 데이터 읽고 나누기', code: READY + "\nprint('학습용', X_train.shape, '평가용', X_test.shape)" },
        { kind: 'section', title: '(3) 기계학습 기반 회귀 모델 생성 및 학습하기', text: 'scikit-learn(사이킷런)은 기계학습 모델을 모아 둔 라이브러리다. 어느 모델이든 **만들기 → `fit` 으로 학습 → `predict` 로 예측** 의 같은 순서로 쓴다.' },
        {
          kind: 'code', id: 'tr-fit', title: '선형 회귀 모델 만들고 학습하기',
          code: "from sklearn.linear_model import 【0】\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)",
          blanks: [{ answers: ['LinearRegression'], hint: '선형(Linear) + 회귀(Regression), 낱말마다 첫 글자 대문자' }],
          vars: ['model'],
          read: '`LinearRegression()` 이라는 글자는 「학습을 마친 모델」이라는 알림이다(코랩에서는 상자 모양으로 보인다).',
        },
        { kind: 'tip', tone: 'warn', title: '이번엔 (X, y) 순서', text: 'scikit-learn 의 `fit( )` 은 **독립 변수 X 가 먼저**다. statsmodels 의 `sm.OLS(y, X)` 와 반대다. 또 scikit-learn 은 상수항(절편)을 알아서 넣으므로 `add_constant` 가 필요 없다.' },
        { kind: 'section', title: '(4)~(5) 예측 모델 생성하고 예측값 출력하기', text: '학습한 모델에 **평가용 X** 를 넣으면 대여량을 예측한다. 모델은 평가용 데이터의 정답(`y_test`)을 본 적이 없다.' },
        {
          kind: 'code', id: 'tr-pred', title: '[실습] 학습된 회귀 모델로 평가 데이터 예측',
          code: "y_pred = model.【0】(X_test)\nprint(y_pred)",
          blanks: [{ answers: ['predict'], hint: '예측하다(영어 동사)' }],
          vars: ['y_pred'],
          read: '3,266개의 예측값(로그 값)이 나왔다. 너무 길어 가운데는 `...` 로 줄여 보여 준다.',
        },
        { kind: 'section', title: '(6) 실젯값 출력하기', text: '예측값의 앞 다섯 개와 견줄 수 있게 실제값도 앞 다섯 개를 꺼내 보자.' },
        {
          kind: 'code', id: 'tr-real', title: '[실습] y_test 에서 처음부터 5개 데이터를 선택',
          code: "【0】",
          blanks: [{ answers: ['y_test[:5]', 'y_test.head()', 'y_test.head(5)', 'y_test[0:5]', 'y_test.iloc[:5]'], hint: '슬라이싱 `[ : ]` 이나 head( ) 를 써 보자' }],
          read: '왼쪽 숫자(5050, 2723 …)는 원래 데이터의 줄 번호다. 무작위로 뽑혀 뒤섞여 있다.',
        },
        {
          kind: 'example', id: 'tr-side', title: '예측값과 실제값을 나란히 놓고 대여 수로 되돌리기',
          code: "import numpy as np\nside = pd.DataFrame({'실제 count': y_test[:5].values, '예측 count': y_pred[:5]})\nside['실제 대여 수'] = np.expm1(side['실제 count']).round()\nside['예측 대여 수'] = np.expm1(side['예측 count']).round()\nside.round(3)",
          read: '첫 줄은 실제 329 대인데 87 대로 예측했다. 로그 값으로는 1.3 쯤 차이지만 대여 수로는 네 배 가까이 어긋난다.',
        },
        { kind: 'section', title: '(7) 평가하기', text: '평균 제곱 오차(MSE)는 (실제값 − 예측값)² 을 모두 더해 개수로 나눈 값이다. 0 에 가까울수록 예측이 정확하다.' },
        {
          kind: 'code', id: 'tr-mse', title: 'MSE 구하기',
          code: "from sklearn.metrics import 【0】\nmse = mean_squared_error(y_test, y_pred)\nprint('Mean Squared Error (MSE):', mse)",
          blanks: [{ answers: ['mean_squared_error'], hint: '평균(mean) _ 제곱(squared) _ 오차(error)' }],
          vars: ['mse'],
          read: 'MSE 는 약 **1.07** 이다.',
        },
        { kind: 'panel', panel: 'predActual', id: 'pn-pa', py: "import pandas as pd, numpy as np, json\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.linear_model import LinearRegression\ndf = pd.read_csv('smtrain.csv')\nX = df[['season', 'workingday', 'weather', 'temp', 'humidity', 'windspeed', 'month', 'day', 'hour', 'dayofweek']]\nXd = pd.get_dummies(X, columns=['hour'], drop_first=True, dtype=int)\ny = df['count']\nout = {}\nfor name, XX in [('linear', X), ('dummy', Xd)]:\n    a, b, c, d = train_test_split(XX, y, test_size=0.3, random_state=2000)\n    p = LinearRegression().fit(a, c).predict(b)\n    out[name] = {'y': d.values[::4].round(3).tolist(), 'p': p[::4].round(3).tolist(), 'h': b['hour'].values[::4].tolist() if 'hour' in b else X.loc[b.index, 'hour'].values[::4].tolist()}\nprint(json.dumps(out))" },
        { kind: 'section', title: 'MSE 1.07 은 잘한 걸까?', text: '숫자 하나만 보고는 알 수 없다. 견줄 기준이 필요하다. 가장 단순한 예측 — **무엇이 오든 학습용 평균 하나로 찍기** — 와 견주어 보자.' },
        {
          kind: 'code', id: 'tr-base', title: '평균만 찍었을 때의 MSE 와 R²',
          code: "base = np.full(len(y_test), y_train.mean())\nprint(round(mean_squared_error(y_test, base), 3))\nprint(round(model.【0】(X_test, y_test), 3))",
          blanks: [{ answers: ['score'], hint: '점수(영어)' }],
          read: '평균만 찍으면 MSE 가 **2.05**, 선형 회귀는 1.07 — 오차를 절반쯤 줄였다. `score( )` 는 평가용 데이터의 R² 를 돌려주며 0.477 이다(1 − 1.07 ÷ 2.05 와 거의 같다).',
        },
        {
          kind: 'ask', id: 'tr-ask-mse', title: '결과 해석', q: '이 모델의 평가로 가장 알맞은 것은?',
          choices: ['MSE 가 1 에 가까우니 거의 완벽하다', '평균만 찍는 것보다는 오차가 절반쯤 줄었지만, 대여 수로 되돌리면 여러 배씩 어긋나는 예측도 많다', 'MSE 는 클수록 좋으므로 더 키워야 한다'],
          answer: 1, why: 'MSE 는 0 에 가까울수록 좋고, 크기는 기준(평균 찍기 2.05)과 견주어 읽는다. 로그 값의 오차 1 은 대여 수로는 약 2.7배 차이다.',
        },
        { kind: 'example', id: 'tr-coef', title: '학습된 계수 보기', what: '`coef_` 에 변수마다의 계수, `intercept_` 에 절편이 들어 있다.', code: "print(pd.Series(model.coef_, index=X.columns).round(4))\nprint('절편', round(model.intercept_, 4))" },
        { kind: 'tip', tone: 'easy', title: '계수를 볼 때 조심할 점', text: '`season`(계절)과 `month`(월)는 거의 같은 정보다. 그래서 둘의 몫이 엇갈려 season 은 음수, month 는 양수가 되었다. 기계학습 회귀는 계수 하나하나의 해석보다 **예측이 얼마나 정확한가**를 먼저 본다.' },
        { kind: 'free', title: '자유 실험', text: "학습용 데이터로 잰 MSE 와 견주어 보자: `mean_squared_error(y_train, model.predict(X_train))` — 평가용과 비슷하면 외우기만 한 모델이 아니다." },
      ],
      quiz: [
        { q: 'scikit-learn 모델을 쓰는 순서로 알맞은 것은?', choices: ['predict → fit → 만들기', '만들기 → fit → predict', 'fit → 만들기 → predict'], answer: 1, why: '`LinearRegression()` 으로 만들고 `fit(X_train, y_train)` 으로 배우고 `predict(X_test)` 로 예측한다.' },
        { q: '`model.predict( )` 에 넣는 것은?', choices: ['y_test', 'X_test', 'y_train'], answer: 1, why: '모델은 X 를 받아 y 를 예측한다. 평가할 때는 평가용 X 를 넣는다.' },
        { q: '실제값이 5, 예측값이 3 인 데이터 하나의 제곱 오차는?', choices: ['2', '4', '−2'], answer: 1, why: '(5 − 3)² = 4. 제곱하므로 언제나 0 이상이다.' },
        { q: 'MSE 가 작아질수록?', choices: ['예측이 정확해진다', '예측이 부정확해진다', '데이터가 많아진다'], answer: 0, why: '오차 제곱의 평균이므로 0 에 가까울수록 실제값에 가깝게 예측한 것이다.' },
      ],
    },

    // ───────────────────────── Ⅲ-3 더 해 보기 ─────────────────────────
    {
      id: 'more', title: '🔬 더 해 보기 — 시각(hour)을 범주로 바꾸면', short: '🔬 더 해 보기',
      goal: [
        '숫자 하나로 넣은 `hour` 가 「직선」 이라는 한계를 가진다는 것을 그래프로 확인한다',
        '`pd.get_dummies( )` 로 범주형 변수를 0·1 열들로 바꾼다',
        '같은 방법으로 학습·평가해 **MSE 가 얼마나 줄어드는지** 견준다',
      ],
      cells: [
        { kind: 'example', id: 'mo-load', title: '준비 — 지난 레슨의 모델 다시 만들기', code: TRAINED + "\nmse = mean_squared_error(y_test, y_pred)\nprint('지난 레슨 MSE', round(mse, 4))" },
        { kind: 'section', title: '직선 하나로 시간대를 그리면', text: '선형 회귀는 hour 가 1 늘 때마다 **늘 같은 만큼** 더한다. 아래 그래프에서 실제 시간대별 평균(회색)과 견주어 보자.' },
        { kind: 'panel', panel: 'hourLine', id: 'pn-hl', py: "import pandas as pd, numpy as np, json\ndf = pd.read_csv('smtrain.csv')\nm = df.groupby('hour')['count'].mean()\nb1, b0 = np.polyfit(df['hour'], df['count'], 1)\nprint(json.dumps({'mean': m.round(3).tolist(), 'b0': round(float(b0), 4), 'b1': round(float(b1), 4)}))" },
        { kind: 'tip', tone: 'easy', title: '시각을 「번호표」로 바꾸기', text: '0시·1시·…·23시를 크기가 있는 숫자가 아니라 **24가지 종류**로 다루면, 모델이 시각마다 따로 높이를 정할 수 있다. 「지금이 8시인가?」(0 또는 1) 같은 열을 시각마다 하나씩 만드는 것이다. 이것을 **원-핫 인코딩**이라고 한다.' },
        {
          kind: 'ask', id: 'mo-guess', before: true, title: '실행하기 전에 짐작해 보기', q: 'hour 를 24가지 종류로 바꿔 넣으면 MSE(지금 1.07)는 어떻게 될까?',
          choices: ['거의 그대로일 것이다', '크게 줄어들 것이다', '오히려 커질 것이다'],
          answer: 1, why: '아래에서 직접 확인해 보자 — 0.42 쯤으로 절반 넘게 줄어든다. 시간대에 따른 출퇴근 봉우리를 그릴 수 있게 되었기 때문이다.',
        },
        {
          kind: 'code', id: 'mo-dummy', title: 'hour 를 0·1 열들로 바꾸기',
          what: '`drop_first=True` 는 맨 앞 범주(0시) 열을 뺀다. 나머지 23개가 모두 0 이면 0시라는 뜻이라 따로 없어도 된다. `dtype=int` 는 True/False 대신 1/0 으로 만든다.',
          code: "X2 = pd.get_dummies(X, columns=[【0】], drop_first=True, dtype=int)\nprint(X2.shape)\nprint(X2.columns.tolist()[9:13])",
          blanks: [{ answers: ["'hour'", '"hour"'], hint: '범주로 바꿀 열 이름을 따옴표로' }],
          vars: ['X2'],
          read: 'hour 한 열이 `hour_1` ~ `hour_23` 스물세 열로 바뀌어 모두 32열이 되었다.',
        },
        {
          kind: 'code', id: 'mo-fit', title: '같은 방법으로 학습·평가하기',
          what: '`random_state=2000` 을 그대로 두어야 지난 레슨과 **같은 줄**로 나뉘어 공정하게 견줄 수 있다.',
          code: "X2_train, X2_test, y_train, y_test = train_test_split(X2, y, test_size=0.3, random_state=【0】)\nmodel2 = LinearRegression().fit(X2_train, y_train)\nmse2 = mean_squared_error(y_test, model2.predict(X2_test))\nprint('hour 숫자 그대로', round(mse, 4))\nprint('hour 를 범주로', round(mse2, 4))",
          blanks: [{ answers: ['2000'], hint: '지난 레슨과 같은 씨앗 번호', strict: true }],
          vars: ['mse2'],
          read: 'MSE 가 **0.42** 로 줄었다.',
        },
        { kind: 'panel', panel: 'mseBars', id: 'pn-mse', py: "import pandas as pd, numpy as np, json\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.metrics import mean_squared_error\ndf = pd.read_csv('smtrain.csv')\nX = df[['season', 'workingday', 'weather', 'temp', 'humidity', 'windspeed', 'month', 'day', 'hour', 'dayofweek']]\ny = df['count']\nout = []\nfor name, XX in [('평균만 찍기', None), ('교과서 모델 (hour 숫자)', X), ('hour 를 범주로', pd.get_dummies(X, columns=['hour'], drop_first=True, dtype=int)), ('hour·season·weather 범주', pd.get_dummies(X, columns=['hour', 'season', 'weather'], drop_first=True, dtype=int))]:\n    a, b, c, d = train_test_split(X if XX is None else XX, y, test_size=0.3, random_state=2000)\n    p = np.full(len(d), c.mean()) if XX is None else LinearRegression().fit(a, c).predict(b)\n    out.append({'name': name, 'mse': round(float(mean_squared_error(d, p)), 4)})\nprint(json.dumps(out, ensure_ascii=False))" },
        {
          kind: 'ask', id: 'mo-ask-why', title: '결과 해석', q: 'MSE 가 크게 줄어든 까닭으로 가장 알맞은 것은?',
          choices: ['데이터가 더 많아져서', '시각마다 따로 높이를 정할 수 있게 되어, 출퇴근 봉우리 같은 굽은 모양을 따라갈 수 있어서', '평가용 데이터를 학습에 써서'],
          answer: 1, why: '데이터 줄 수도, 나누는 방법도 같다. 바뀐 것은 hour 를 넣는 방식 하나다. 데이터를 들여다보고(점그래프) 그 모양에 맞게 변수를 다듬는 것이 예측을 크게 좋게 만든다.',
        },
        { kind: 'tip', tone: 'key', title: '탐색 단계에서 본 그래프가 답을 알려 주었다', text: 'Ⅰ단원의 점그래프에서 「hour 와 count 는 직선 관계가 아니다」를 이미 보았다. 회귀 분석은 코드를 돌리는 일만이 아니라, **탐색에서 찾은 사실을 모델에 반영하는 일**이다. 근무일인지에 따라 봉우리 모양이 달랐다는 것까지 넣으면 더 좋아질 수 있다.' },
        { kind: 'free', title: '자유 실험', text: "`season` · `weather` 도 범주로 바꿔 보자: `pd.get_dummies(X, columns=['hour', 'season', 'weather'], drop_first=True, dtype=int)` 로 X2 를 다시 만들고 위 셀을 다시 실행한다." },
      ],
      quiz: [
        { q: '`pd.get_dummies(X, columns=[\'hour\'])` 가 하는 일은?', choices: ['hour 열을 지운다', 'hour 의 값마다 0·1 로 된 열을 만든다', 'hour 를 평균으로 바꾼다'], answer: 1, why: '「이 줄이 그 시각인가」를 0·1 로 나타내는 열들(원-핫 인코딩)을 만든다.' },
        { q: '두 모델을 공정하게 견주려면?', choices: ['random_state 를 다르게 한다', '같은 random_state 로 같은 줄을 평가용으로 쓴다', '평가용 데이터로 학습한다'], answer: 1, why: '평가용 시험지가 같아야 점수를 견줄 수 있다.' },
        { q: '이 실습에서 예측이 크게 좋아진 원동력은?', choices: ['더 비싼 컴퓨터', '데이터 탐색에서 발견한 「굽은 관계」를 모델에 반영한 것', '변수를 모두 지운 것'], answer: 1, why: '점그래프에서 본 출퇴근 봉우리를 시각별 열로 담아냈다.' },
      ],
    },
  ],
};
