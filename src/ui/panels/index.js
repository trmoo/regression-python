// © 2026 티쳐무 · 모든 권리 보유
// 눈으로 보기 도구 모음 — 레슨의 panel 셀이 이름으로 부른다.
// 그림 속 숫자가 파이썬 결과와 같아야 하는 도구는 golden.panels[셀 id] 로 자료를 받는다(tools/golden.mjs 가 만든다).
import { h } from '../../lib/ui.js';
import {
  roadmapPanel, logCountPanel, boxAnatomyPanel, hourProfilePanel, corrThresholdPanel, summaryReadPanel,
  predictCalcPanel, splitViewPanel, predActualPanel, hourLinePanel, mseBarsPanel,
} from './bike.js';

export const PANELS = {
  roadmap: { title: '🗺️ 회귀 분석의 순서', build: roadmapPanel },
  logCount: { title: '👀 실제 대여 수와 count(로그) — 두 분포', build: logCountPanel },
  boxAnatomy: { title: '👀 상자그림 해부 — 울타리와 이상치', build: boxAnatomyPanel },
  hourProfile: { title: '👀 시간대별 평균 대여량 — 근무일 vs 쉬는 날', build: hourProfilePanel },
  corrThreshold: { title: '👀 기준값을 바꾸면 골라지는 변수가 어떻게 달라질까', build: corrThresholdPanel },
  summaryRead: { title: '👀 결과표(summary)를 눌러 읽기', build: summaryReadPanel },
  predictCalc: { title: '👀 회귀식 계산기', build: predictCalcPanel },
  splitView: { title: '👀 어떤 줄이 평가용으로 갔을까', build: splitViewPanel },
  predActual: { title: '👀 실제값과 예측값을 한 그림에', build: predActualPanel },
  hourLine: { title: '👀 직선 하나로는 시간대를 그릴 수 없다', build: hourLinePanel },
  mseBars: { title: '👀 MSE 견주기', build: mseBarsPanel },
};

export function buildPanel(cell, golden) {
  const P = PANELS[cell.panel];
  if (!P) return h('div', { class: 'panel' }, `(도구 ${cell.panel} 를 찾지 못했습니다)`);
  return h('section', { class: 'panel' },
    h('div', { class: 'panel-head' }, P.title),
    h('div', { class: 'panel-body' }, P.build(cell, golden?.panels?.[cell.id], golden)));
}
