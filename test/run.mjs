// © 2026 티쳐무 · 모든 권리 보유
// npm test — 레슨 자료 점검 + 진짜 파이썬(Pyodide, 앱과 같은 판)으로 다시 돌려 기준 출력과 대조
//   ① 자료 모양: 아이디 겹침 · 빈칸 수 · 고르기 정답 번호 · 그림 도구 이름 · 표 칸 수
//   ② 기준 출력(golden.json)이 지금 레슨 코드와 같은가 — 레슨을 고치고 npm run golden 을 잊으면 여기서 걸린다
//   ③ 정답으로 받는 다른 답이 정말 같은 결과를 내는가 · 엉뚱한 답은 통과하지 못하는가
//   ④ 설명 문장에 적은 숫자가 실제 출력·그림 자료에 있는가
//   ⑤ 화면 채점(output.js)과 node 채점(engine-node.mjs)의 outText 가 같은 코드인가
import { readFileSync } from 'fs';
import { LESSONS, TABS, runnable, graded, answerCode, fillAnswers, splitTemplate } from '../src/lessons/index.js';
import { CHEAT } from '../src/lessons/t4-wrap.js';
import { makeEngine, outText } from '../tools/engine-node.mjs';

const golden = JSON.parse(readFileSync(new URL('../src/data/golden.json', import.meta.url), 'utf8'));
let pass = 0;
const fails = [];
const ok = (cond, msg) => { if (cond) pass++; else fails.push(msg); };

// ── ① 자료 모양 ──
const panelSrc = readFileSync(new URL('../src/ui/panels/index.js', import.meta.url), 'utf8');
const PANEL_NAMES = [...panelSrc.matchAll(/^  (\w+): \{ title:/gm)].map((m) => m[1]);
ok(PANEL_NAMES.length === 11, `그림 도구가 11개여야 하는데 ${PANEL_NAMES.length}개`);
const usedPanels = new Set();
const ids = new Set();
for (const t of TABS) ok(t.lessons.length > 0, `탭 ${t.id} 에 레슨이 없음`);
for (const L of LESSONS) {
  ok(!ids.has(`L:${L.id}`), `레슨 아이디 겹침 ${L.id}`); ids.add(`L:${L.id}`);
  ok(L.goal?.length > 0, `${L.id}: 목표(goal)가 없음`);
  ok(L.quiz?.length >= 3, `${L.id}: 확인 문제가 3개보다 적음`);
  ok(L.cells.filter((c) => c.kind === 'free').length <= 1, `${L.id}: 자유 실험 칸은 레슨마다 하나(저장 자리가 하나다)`);
  for (const c of L.cells) {
    if (c.id) { ok(!ids.has(c.id), `셀 아이디 겹침 ${c.id}`); ids.add(c.id); }
    if (runnable(c)) ok(Boolean(c.id), `${L.id}: 아이디 없는 실행 셀`);
    if (c.kind === 'code') {
      const n = splitTemplate(c.code).filter((p) => p.blank !== undefined).length;
      ok(n === c.blanks.length && n > 0, `${c.id}: 빈칸 ${n}개인데 blanks ${c.blanks.length}개`);
      c.blanks.forEach((b, i) => ok(b.answers.length > 0 && b.hint, `${c.id} 빈칸 ${i}: 정답 또는 힌트가 없음`));
    }
    if (c.kind === 'ask') ok(Number.isInteger(c.answer) && c.answer < c.choices.length && c.why && c.id, `${c.id ?? L.id}: 고르기 문제 정답 번호·해설·아이디`);
    if (c.kind === 'panel') {
      ok(PANEL_NAMES.includes(c.panel), `${L.id}: 모르는 그림 도구 ${c.panel}`);
      usedPanels.add(c.panel);
      if (c.py) ok(golden.panels[c.id], `그림 자료 없음 ${c.id} (npm run golden)`);
      if (c.from) ok(golden.cells[c.from], `${c.id}: 결과표 셀 ${c.from} 이 없음`);
    }
    if (c.kind === 'tip') ok(['easy', 'key', 'warn', 'colab', 'fix', 'compare'].includes(c.tone), `${L.id} 상자 「${c.title}」 의 tone ${c.tone} 을 화면이 모름`);
    if (c.kind === 'tip' && c.table) ok(c.table.rows.every((r) => r.length === c.table.head.length), `${L.id} 상자 「${c.title}」 표의 칸 수가 머리글과 다름`);
  }
  for (const [i, q] of (L.quiz ?? []).entries()) ok(q.answer < q.choices.length && q.why, `${L.id} 확인 문제 ${i + 1}`);
}
for (const p of PANEL_NAMES) ok(usedPanels.has(p), `그림 도구 ${p} 를 쓰는 레슨이 없음`);
ok(CHEAT.every((r) => r.length === 3), '한 장 정리 줄 모양');
// 정답이 늘 첫째 보기면 찍어도 맞는다 — 고르기 문제의 정답 자리가 고루 퍼졌는가
const answerPos = LESSONS.flatMap((L) => [...L.cells.filter((c) => c.kind === 'ask'), ...(L.quiz ?? [])].map((q) => q.answer));
ok(new Set(answerPos).size >= 3, `고르기 정답 자리가 ${[...new Set(answerPos)].join(',')} 뿐`);

// ── ⑤ outText 가 화면과 node 에서 같은 코드인가 ──
const grab = (src) => { const a = src.indexOf('const STAMP'); return src.slice(a, src.indexOf('trimEnd();', a) + 10); };
ok(grab(readFileSync(new URL('../src/ui/output.js', import.meta.url), 'utf8')) === grab(readFileSync(new URL('../tools/engine-node.mjs', import.meta.url), 'utf8')), 'output.js 와 engine-node.mjs 의 outText 가 다릅니다');

// ── ④ 설명 문장이 기대는 숫자 ──
const has = (id, s) => ok(outText(golden.cells[id] ?? { items: [] }).includes(s), `${id} 출력에 「${s}」 가 없음 — 설명 문장을 함께 고칠 것`);
has('in-log', '2.833213'); has('in-log', '0.693147');
has('ld-info', '10886 entries'); has('ld-info', 'Data columns (total 17 columns)');
has('ld-desc', '19.000000'); has('ld-desc', '4.591364');
has('ld-vc', '7192'); has('ld-vc', '4       1');
has('ou-iqr', '31.99'); has('ou-iqr', '227');
has('ou-zero', '22'); has('ou-zero', '1313');
has('ch-atemp', '0.984948');
has('co-select', "['count', 'hour', 'temp', 'humidity']");
has('ft-const', '10886 rows x 5 columns');
has('ft-summary', 'R-squared:                       0.444'); has('ft-summary', '0.966'); has('ft-summary', '0.0980'); has('ft-summary', '0.473');
has('us-drop', '0.444 0.444'); has('us-drop', '0.4438 0.4438');
has('us-params', '3.199485'); has('us-params', '-0.013371');
has('us-predict', '4.66'); has('us-predict', '104.6');
has('sp-shape', '(7620, 10) (3266, 10)');
has('tr-real', '5050    5.799093');
has('tr-side', '329.0'); has('tr-side', '87.0');
has('tr-mse', '1.0716981');
has('tr-base', '2.049'); has('tr-base', '0.477');
has('tr-coef', 'season       -0.0539'); has('tr-coef', 'month         0.0765');
has('mo-dummy', '(10886, 32)');
has('mo-fit', '1.0717'); has('mo-fit', '0.4238');
has('su-all', 'R² = 0.444'); has('su-all', 'MSE = 1.072');
const P = golden.panels;
ok(P['pn-box']?.windspeed.nhi === 227 && P['pn-box']?.humidity.nlo === 22 && P['pn-box']?.temp.nhi === 0, '상자그림 자료: 풍속 위 227 · 습도 아래 22 · 기온 0');
ok(P['pn-log']?.min === 1 && P['pn-log']?.max === 977 && P['pn-log']?.mean === 191.6, '로그 자료: 대여 수 1 ~ 977, 평균 191.6');
ok(P['pn-hour']?.work[8] > P['pn-hour']?.rest[8] && P['pn-hour']?.rest[13] > P['pn-hour']?.work[13], '근무일은 8시에, 쉬는 날은 13시에 더 많다');
const mse = Object.fromEntries((P['pn-mse'] ?? []).map((x) => [x.name, x.mse]));
ok(Math.abs(mse['교과서 모델 (hour 숫자)'] - 1.0717) < 1e-4 && Math.abs(mse['hour 를 범주로'] - 0.4238) < 1e-4, 'MSE 막대 자료가 셀 결과와 같다');
ok(P['pn-split']?.seeds['2000'].ntest === 3266, '나누기 자료: 평가용 3,266줄');
ok(Math.abs(P['pn-calc']?.b.hour - 0.09796) < 1e-5, '계산기 계수가 결과표와 같다');
// 시간대 그림의 「새벽 너무 높게 · 8시 너무 낮게」 설명
const hl = P['pn-hl'];
ok(hl && hl.b0 + hl.b1 * 4 > hl.mean[4] && hl.b0 + hl.b1 * 8 < hl.mean[8], '직선이 새벽 4시는 높게, 8시는 낮게 예측한다');

// ── ②·③ 레슨을 다시 돌려 기준과 대조, 다른 답 · 엉뚱한 답 ──
console.log('🐍 Pyodide 를 켭니다(앱과 같은 판, 처음엔 30초쯤)…');
const eng = await makeEngine();
const same = (a, b) => outText(a) === outText(b) && JSON.stringify(a.vars) === JSON.stringify(b.vars) && !a.error === !b.error;
let alts = 0, wrongs = 0;
for (const L of LESSONS) {
  eng.reset(L.id);
  for (const c of L.cells.filter(runnable)) {
    if (graded(c)) {
      c.blanks.forEach((b, i) => {
        // 다른 정답: 이 셀까지의 이름 공간을 복사해 두고 그 위에서 돌린다
        for (const alt of b.answers.slice(1)) {
          eng.py.runPython(`NS['alt'] = dict(NS.get(${JSON.stringify(L.id)}, {'__name__': '__main__'}))`);
          const r = eng.run('alt', fillAnswers(c, (bb, j) => (j === i ? alt : bb.answers[0])), c.vars ?? []);
          ok(same(r, golden.cells[c.id]), `${c.id} 빈칸 ${i}: 다른 정답 「${alt}」 의 결과가 기준과 다름`);
          alts++;
        }
        if (!b.strict) {
          eng.py.runPython(`NS['alt'] = dict(NS.get(${JSON.stringify(L.id)}, {'__name__': '__main__'}))`);
          const bad = /^-?\d+(\.\d+)?$/.test(b.answers[0]) ? String(Number(b.answers[0]) + 7) : 'zzz_틀린답';
          const r = eng.run('alt', fillAnswers(c, (bb, j) => (j === i ? bad : bb.answers[0])), c.vars ?? []);
          ok(!same(r, golden.cells[c.id]) || r.error, `${c.id} 빈칸 ${i}: 엉뚱한 답 「${bad}」 도 통과해 버린다`);
          wrongs++;
        }
      });
    }
    const r = eng.run(L.id, answerCode(c), c.vars ?? []);
    ok(same(r, golden.cells[c.id]), `${c.id}: 기준 출력과 다름 — npm run golden 을 다시 돌렸나요?`);
    ok(c.expectError ? r.error : !r.error, `${c.id}: ${c.expectError ? '오류가 나야 하는데 안 남' : `오류 ${r.error?.type}: ${r.error?.message}`}`);
    ok(!r.items.some((it) => it.kind === 'warn'), `${c.id}: 학생 화면에 경고가 뜬다`);
    const imgs = r.items.filter((it) => it.kind === 'image').length;
    ok(imgs === golden.cells[c.id].items.filter((it) => it.kind === 'image').length, `${c.id}: 그림 수가 기준과 다름`);
  }
}
// 그래프를 그리는 셀은 그림이 꼭 하나 이상 나와야 한다(그림을 못 받으면 화면이 텅 빈다)
for (const id of ['ou-box', 'ch-point', 'ch-atemp', 'co-heat']) ok(golden.cells[id]?.items.some((it) => it.kind === 'image'), `${id}: 그림이 없음`);
// 학생이 plt.show( ) 를 불러도 그림이 한 번만, 그 자리에 나와야 한다
const shown = eng.run('show', "import matplotlib.pyplot as plt\nplt.plot([1, 2, 3])\nplt.show()\nprint('뒤')");
ok(shown.items.map((it) => it.kind).join(',') === 'image,out', `plt.show( ) 다음 차례가 그림 → 글자여야 함: ${shown.items.map((it) => it.kind)}`);

console.log(`\n다른 정답 ${alts}개 · 엉뚱한 답 ${wrongs}개를 함께 돌려 보았습니다.`);
if (fails.length) { console.error(`❌ ${fails.length}가지 실패 (통과 ${pass})\n- ${fails.join('\n- ')}`); process.exit(1); }
console.log(`✅ ${pass}가지 모두 통과`);
