// © 2026 티쳐무 · 모든 권리 보유
// 파이썬 엔진 준비물 — 브라우저 일꾼(kernel.js → worker.js)과 node(tools/engine-node.mjs)가 **이 목록 하나를** 함께 쓴다.
// 그래서 미리 계산해 둔 결과(golden.json)와 학생 화면의 결과가 같은 판의 라이브러리로 나온다.
// ⚠ 화면 요소(DOM)를 쓰지 말 것 — node 가 불러다 쓴다.
export const PYODIDE_VERSION = '314.0.7';

// Pyodide 배포판에 들어 있는 패키지(필요한 짝꿍 패키지는 Pyodide 가 알아서 함께 받는다).
// seaborn 은 배포판에 없어서 src/engine/seaborn-0.13.2.zip 을 따로 풀어 쓴다(tools/make_seaborn.py).
export const PACKAGES = ['numpy', 'pandas', 'matplotlib', 'scipy', 'statsmodels', 'scikit-learn'];

export const SEABORN_ZIP = 'seaborn-0.13.2.zip';
export const DATA_FILE = 'smtrain.csv';
export const HOME = '/home/pyodide';
