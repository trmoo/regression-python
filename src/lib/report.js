// © 2026 티쳐무 · 모든 권리 보유
// 「💾 활동 저장」 — 이 브라우저에 남은 활동(빈칸에 쓴 코드 · 통과 여부 · 고른 답)을
// 혼자 열리는 HTML 파일 한 장으로 만든다. 학번·이름은 이 파일에만 들어가고 어디에도 저장하지 않는다.
// ⚠ 화면 요소(DOM)를 쓰지 말 것 — 글자(HTML)만 만든다. node 시험이 불러다 쓴다. 내려받기는 main.js 가 한다.
import { TABS, graded, splitTemplate } from '../lessons/index.js';

const LETTERS = 'ㄱㄴㄷㄹㅁ';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// 레슨 글의 `코드` · **굵게** 를 HTML 로(먼저 이스케이프하므로 학생 글·레슨 글이 태그로 바뀌지 않는다)
const md = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');

// 레슨 하나의 점수 — 빈칸 셀 통과 · 해석 문제 · 확인 문제
export function lessonStats(L, store) {
  const codes = L.cells.filter(graded);
  const asks = L.cells.filter((c) => c.kind === 'ask');
  const quiz = L.quiz ?? [];
  const qa = store.quiz?.[L.id] ?? {};
  return {
    passed: codes.filter((c) => store.passed?.[c.id]).length, codes: codes.length,
    askRight: asks.filter((c) => store.ask?.[c.id] === c.answer).length, asks: asks.length,
    quizRight: quiz.filter((q, i) => qa[i] === q.answer).length, quiz: quiz.length,
  };
}

function codeBlock(cell, store) {
  const vals = store.answers?.[cell.id] ?? [];
  const body = splitTemplate(cell.code).map((p) => (p.text !== undefined ? esc(p.text)
    : `<mark>${esc(vals[p.blank] ?? '') || '&#12288;&#12288;'}</mark>`)).join('');
  const st = store.passed?.[cell.id] ? ['ok', '✅ 통과'] : vals.some((v) => String(v ?? '').trim()) ? ['mid', '✏️ 채우는 중'] : ['no', '— 비어 있음'];
  return `<div class="cell"><div class="head"><b>${esc(cell.title)}</b><span class="st ${st[0]}">${st[1]}</span></div><pre>${body}</pre></div>`;
}

function choiceLine(q, picked) {
  if (picked === undefined || picked === null) return `<div class="q"><p>${md(q.q)}</p><p class="ans no">— 아직 안 풂</p></div>`;
  const right = picked === q.answer;
  return `<div class="q"><p>${md(q.q)}</p><p class="ans ${right ? 'ok' : 'bad'}">${right ? '⭕' : '❌'} 고른 답: ${LETTERS[picked]}. ${md(q.choices[picked])}</p></div>`;
}

const two = (n) => String(n).padStart(2, '0');
export const fmtWhen = (d) => `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}. ${two(d.getHours())}:${two(d.getMinutes())}`;

// 파일 이름 — 학번_이름_자전거회귀분석.html (비우면 날짜로). 파일 이름에 쓸 수 없는 글자는 뺀다
export function reportFileName({ id = '', name = '', when = new Date() } = {}) {
  const clean = (s) => String(s).replace(/[\\/:*?"<>|\s]+/g, '').slice(0, 20);
  const who = [clean(id), clean(name)].filter(Boolean).join('_');
  const day = `${when.getFullYear()}${two(when.getMonth() + 1)}${two(when.getDate())}`;
  return who ? `${who}_자전거회귀분석.html` : `자전거회귀분석_활동_${day}.html`;
}

export function buildReport(store, { id = '', name = '', when = new Date() } = {}) {
  const lessons = TABS.flatMap((t) => t.lessons.map((l) => ({ t, l })));
  const rows = lessons.map(({ t, l }) => ({ t, l, s: lessonStats(l, store) }));
  const sum = rows.reduce((a, { s }) => ({ passed: a.passed + s.passed, codes: a.codes + s.codes, askRight: a.askRight + s.askRight, asks: a.asks + s.asks, quizRight: a.quizRight + s.quizRight, quiz: a.quiz + s.quiz }), { passed: 0, codes: 0, askRight: 0, asks: 0, quizRight: 0, quiz: 0 });
  const table = rows.map(({ t, l, s }) => `<tr><td>${esc(t.num)}</td><td>${esc(l.title)}</td><td>${s.passed} / ${s.codes}</td><td>${s.askRight} / ${s.asks}</td><td>${s.quizRight} / ${s.quiz}</td></tr>`).join('');
  const sections = rows.map(({ t, l }) => {
    const parts = [];
    for (const c of l.cells) {
      if (c.kind === 'code') parts.push(codeBlock(c, store));
      else if (c.kind === 'ask') parts.push(choiceLine(c, store.ask?.[c.id]));
    }
    const qa = store.quiz?.[l.id] ?? {};
    if (l.quiz?.length) parts.push(`<h4>📝 확인 문제</h4>${l.quiz.map((q, i) => choiceLine(q, qa[i])).join('')}`);
    return `<section><h3>${esc(t.num)}. ${esc(l.title)}</h3>${parts.join('')}</section>`;
  }).join('');
  return `<!doctype html>
<!-- 자전거 대여량 회귀 분석 실습실 · 활동 기록 · © 2026 티쳐무 · 모든 권리 보유 -->
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>활동 기록 · 자전거 대여량 회귀 분석 실습실</title>
<style>
body{font-family:'Pretendard','Apple SD Gothic Neo','Malgun Gothic',sans-serif;max-width:900px;margin:24px auto;padding:0 16px;color:#0f172a;line-height:1.6}
h1{font-size:1.5rem;margin:0 0 4px}h3{border-left:6px solid #0f766e;padding-left:10px;margin:28px 0 10px}h4{margin:14px 0 6px}
.who{display:flex;gap:18px;flex-wrap:wrap;background:#f0fdfa;border:1px solid #99f6e4;border-radius:10px;padding:8px 14px;margin:10px 0}
table{border-collapse:collapse;width:100%;font-size:.92rem}th,td{border:1px solid #cbd5e1;padding:5px 8px;text-align:center}td:nth-child(2){text-align:left}th{background:#f1f5f9}
tfoot td{font-weight:800;background:#f8fafc}
.cell{border:1px solid #e2e8f0;border-radius:8px;padding:6px 10px;margin:8px 0}.head{display:flex;justify-content:space-between;gap:10px}
pre{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:8px 10px;white-space:pre-wrap;font-family:Consolas,'D2Coding',monospace;font-size:.9rem;margin:6px 0}
mark{background:#fef3c7;border-bottom:2px solid #f59e0b;padding:0 2px}
code{background:#f1f5f9;border-radius:4px;padding:0 4px;font-size:.92em}
.st{font-weight:700}.ok{color:#15803d}.mid,.bad{color:#b45309}.no{color:#64748b}
.q{margin:8px 0;padding-left:10px;border-left:3px solid #e2e8f0}.q p{margin:2px 0}.ans{font-weight:600}
footer{margin:30px 0 10px;color:#64748b;font-size:.85rem;border-top:1px solid #e2e8f0;padding-top:10px}
@media print{body{margin:0}section{break-inside:auto}.cell,.q{break-inside:avoid}}
</style></head><body>
<h1>🚲 자전거 대여량 회귀 분석 실습실 — 활동 기록</h1>
<div class="who"><span>학번: <b>${esc(id) || '(적지 않음)'}</b></span><span>이름: <b>${esc(name) || '(적지 않음)'}</b></span><span>저장한 때: <b>${fmtWhen(when)}</b></span></div>
<table><thead><tr><th>단원</th><th>레슨</th><th>빈칸 셀 통과</th><th>결과 해석</th><th>확인 문제</th></tr></thead><tbody>${table}</tbody>
<tfoot><tr><td colspan="2">합계</td><td>${sum.passed} / ${sum.codes}</td><td>${sum.askRight} / ${sum.asks}</td><td>${sum.quizRight} / ${sum.quiz}</td></tr></tfoot></table>
${sections}
<footer>이 파일은 학생의 브라우저에 남은 기록으로 만들었고, 어디로도 보내지 않았습니다. 노란 칸이 학생이 빈칸에 쓴 글자입니다.<br>
© 2026 티쳐무 · 모든 권리 보유 · 학교 수업 목적으로만 이용해 주세요.</footer>
</body></html>`;
}
