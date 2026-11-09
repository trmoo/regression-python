// © 2026 티쳐무 · 모든 권리 보유
// 여러 레슨이 함께 쓰는 코드 조각. index.js 에 두면 탭 파일과 서로 부르는 고리가 생겨 따로 둔다.
// ⚠ 화면 요소(DOM)를 쓰지 말 것 — node 가 불러다 쓴다.

// 레슨마다 맨 위에서 데이터를 다시 읽는다(레슨 = 새 노트북)
export const LOAD = "import pandas as pd\nsmtrain = pd.read_csv('smtrain.csv')";
export const PLOT = "import seaborn as sns\nimport matplotlib.pyplot as plt";
export const COLS = "cols = ['count', 'day', 'hour', 'season', 'workingday', 'weather', 'temp', 'humidity', 'windspeed']";
// 기계학습 회귀의 독립 변수 10개 — 교과서 노트북 3장 그대로
export const ML_X = "X = smtrain[['season', 'workingday', 'weather', 'temp', 'humidity', 'windspeed', 'month', 'day', 'hour', 'dayofweek']]";
export const ML_SPLIT = "from sklearn.model_selection import train_test_split\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=2000)";
