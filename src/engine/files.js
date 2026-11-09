// © 2026 티쳐무 · 모든 권리 보유
// 실습 데이터 — 교과서 실습과 같은 smtrain.csv (시간마다 자전거 대여 기록 10,886줄).
// 파이썬 엔진 안에서는 노트북처럼 pd.read_csv('smtrain.csv') 로 읽는다.
// 원 자료: UCI 「Bike Sharing Dataset」(Fanaee-T & Gama, 2013, CC BY 4.0) — 출처는 LICENSE 와 앱 안내에 밝혔다.
import smtrain from '../data/smtrain.csv?raw';
import { DATA_FILE } from './setup.js';

export const FILES = { [DATA_FILE]: smtrain };
