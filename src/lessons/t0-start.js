// © 2026 티쳐무 · 모든 권리 보유
// 0. 시작 — 문제 상황 · 회귀 분석의 순서 · smtrain.csv 의 열 17개 · count 가 로그 값이라는 것
export const T0 = {
  id: 'start', num: '0', icon: '🚲', title: '시작', desc: '문제 상황과 데이터 — 무엇을 예측하려 하나',
  lessons: [
    {
      id: 'intro', title: '날씨와 자전거 대여량은 어떤 관계가 있을까?', short: '문제와 데이터',
      goal: [
        '공유 자전거 대여 기록으로 **무엇을 예측하려는지** 말할 수 있다',
        '회귀 분석이 「데이터 준비 → 탐색·전처리 → 모델 만들기 → 평가」 순서로 흘러간다는 것을 안다',
        '`count` 열이 실제 대여 수가 아니라 **로그로 바꾼 값**이라는 것을 확인한다',
      ],
      cells: [
        { kind: 'section', title: '문제 상황', text: '도시 곳곳에 공유 자전거 대여소가 있다. 자전거가 모자라면 손님을 놓치고, 남으면 자리만 차지한다. 운영 회사는 **「몇 시에, 어떤 날씨에, 자전거가 얼마나 빌려질까」**를 미리 알고 싶다. 2년 동안 **한 시간마다** 남긴 대여 기록(`smtrain.csv`, 10,886줄)으로 대여량을 예측하는 회귀 모델을 만들어 보자.' },
        { kind: 'tip', tone: 'easy', title: '회귀 분석이란', text: '여러 값(기온·시각·습도 …)으로 **숫자 하나**(대여량)를 예측하는 식을 데이터에서 찾아내는 방법이다. 예측하려는 값을 **종속 변수**(y), 예측에 쓰는 값을 **독립 변수**(X)라고 부른다.' },
        { kind: 'panel', panel: 'roadmap' },
        { kind: 'section', title: '데이터 열 17개', text: '한 줄이 「어느 날 어느 한 시간」이다. 아래 표는 열의 뜻이다. 숫자로 적혀 있어도 사실은 **종류(범주)**를 나타내는 열이 많다는 데 눈여겨보자.' },
        {
          kind: 'tip', tone: 'compare', title: 'smtrain.csv 의 열', table: {
            head: ['열', '뜻', '값'],
            rows: [
              ['`datetime`', '날짜와 시각', '2011-01-01 0:00 ~ 2012-12-19 23:00'],
              ['`season`', '계절', '1 봄 · 2 여름 · 3 가을 · 4 겨울'],
              ['`holiday`', '공휴일인가', '1 공휴일 · 0 아님'],
              ['`workingday`', '근무일인가(주말·공휴일이 아닌 날)', '1 근무일 · 0 쉬는 날'],
              ['`weather`', '날씨', '1 맑음 · 2 흐림·안개 · 3 약한 비·눈 · 4 폭우·폭설'],
              ['`temp` · `atemp`', '기온 · 체감 온도', '℃'],
              ['`humidity`', '습도', '%'],
              ['`windspeed`', '풍속', '숫자가 클수록 바람이 세다'],
              ['`casual` · `registered`', '비회원 · 회원 대여 수', '대'],
              ['`count`', '**대여량 — 예측할 값(y)**', '⚠️ log(대여 수 + 1) 로 바꾼 값'],
              ['`year` · `month` · `day` · `hour`', '연 · 월 · 일 · 시', 'datetime 에서 떼어 낸 값'],
              ['`dayofweek`', '요일', '0 월요일 ~ 6 일요일'],
            ],
          },
        },
        {
          kind: 'example', id: 'in-load', title: '데이터 불러오기',
          what: '교과서 노트북의 첫 실습이다. `pandas` 를 `pd` 라는 짧은 이름으로 불러오고, CSV 파일을 표(데이터프레임)로 읽는다.',
          code: "import pandas as pd\nsmtrain = pd.read_csv('smtrain.csv')\nsmtrain.head()",
        },
        { kind: 'tip', tone: 'colab', title: '코랩에서는 파일부터 올린다', text: '코랩은 내 컴퓨터의 파일을 모르므로, 교과서 노트북은 맨 처음에 `from google.colab import files` → `files.upload()` 로 `smtrain.csv` 를 올린다. 이 실습실에는 파일이 이미 들어 있어 그 셀을 건너뛴다.' },
        { kind: 'section', title: 'count 를 들여다보자', text: '첫 줄의 `count` 는 2.83 이다. 자전거 2.83 대가 빌려졌다는 것은 말이 안 된다. 같은 줄의 비회원(`casual`) 3 대와 회원(`registered`) 13 대를 더하면 16 대 — `count` 는 **log(16 + 1) = 2.83** 이다.' },
        {
          kind: 'code', id: 'in-log', title: 'count 가 로그 값인지 확인하기',
          what: '`np.log1p(x)` 는 log(x + 1) 을 계산한다. 비회원 + 회원 대여 수에 log1p 를 씌운 값이 `count` 와 같은지 앞 다섯 줄을 견주어 보자.',
          code: "import numpy as np\ntotal = smtrain['casual'] + smtrain['【0】']\nprint(np.log1p(total).head())\nprint(smtrain['count'].head())",
          blanks: [{ answers: ["registered"], hint: '회원 대여 수 열 이름(영어 소문자)' }],
          vars: ['total'],
          read: '두 줄의 숫자가 똑같다. 그래서 이 실습의 예측값도 **로그 값**으로 나온다. 실제 대여 수로 되돌리려면 `np.expm1( )` (e^x − 1) 을 쓴다.',
        },
        { kind: 'panel', panel: 'logCount', id: 'pn-log', py: "import pandas as pd, numpy as np, json\ndf = pd.read_csv('smtrain.csv')\nraw = df['casual'] + df['registered']\nh1, e1 = np.histogram(raw, bins=30)\nh2, e2 = np.histogram(df['count'], bins=30)\nprint(json.dumps({'raw': h1.tolist(), 'rawEdges': e1.round(3).tolist(), 'log': h2.tolist(), 'logEdges': e2.round(4).tolist(), 'min': int(raw.min()), 'max': int(raw.max()), 'mean': round(float(raw.mean()), 1), 'median': float(raw.median())}))" },
        { kind: 'tip', tone: 'easy', title: '왜 로그로 바꿨을까', text: '대여 수는 한밤중 1 대부터 퇴근 시간 977 대까지 차이가 크고, 적은 값 쪽에 몰려 있다. 로그를 씌우면 큰 값은 많이, 작은 값은 조금 줄어들어 **고르게 퍼진 모양**이 되고, 직선 회귀가 다루기 쉬워진다. 다만 그만큼 **결과를 읽을 때 한 번 되돌려 생각**해야 한다.' },
        { kind: 'free', title: '자유 실험', text: "실제 대여 수가 가장 많았던 때는 언제일까? `smtrain.loc[total.idxmax()]` 를 실행해 보자. — `total.idxmax()` 는 total 에서 **가장 큰 값이 있는 줄 번호**를 알려 주고, `smtrain.loc[줄 번호]` 는 smtrain 에서 **그 줄 하나를 통째로** 꺼낸다. 둘을 이으면 「대여 수가 가장 많았던 한 시간의 기록」이 나온다." },
      ],
      quiz: [
        { q: '이 실습에서 예측하려는 값(종속 변수)은?', choices: ['`temp` (기온)', '`count` (대여량)', '`hour` (시각)'], answer: 1, why: '기온·시각·습도 등으로 대여량을 예측한다. 예측하는 값이 종속 변수 y 다.' },
        { q: '`count` 가 4.0 이라면 실제 대여 수는 약 몇 대일까?', choices: ['4 대', '약 54 대 (e⁴ − 1)', '약 400 대'], answer: 1, why: 'count = log(대여 수 + 1) 이므로 대여 수 = e^count − 1 = e⁴ − 1 ≈ 53.6 대.' },
        { q: '`season` 열의 값 1·2·3·4 는 무엇일까?', choices: ['양을 나타내는 숫자(4가 1의 네 배)', '계절을 나타내는 번호(범주)', '측정한 온도'], answer: 1, why: '숫자로 적혀 있지만 봄·여름·가을·겨울이라는 **종류**다. 4 가 1 보다 「크다」는 뜻이 없다.' },
      ],
    },
  ],
};
