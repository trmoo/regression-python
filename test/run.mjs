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
import { LOCK, ITER, checkPassword, _resetLock } from '../src/lib/teacher-lock.js';
import { existsSync, readdirSync, statSync } from 'fs';
import { buildReport, reportFileName } from '../src/lib/report.js';
import { join } from 'path';

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
    if (c.kind === 'ask') {
      ok(Number.isInteger(c.answer) && c.answer < c.choices.length && c.why && c.id, `${c.id ?? L.id}: 고르기 문제 정답 번호·해설·아이디`);
      // 결과 해석 문제는 실행한 뒤에 푼다 — 「실행 전 짐작」 을 다시 넣지 않게(2026-11-12 사용자 지시)
      ok(c.before === undefined && !/짐작|실행하기 전/.test(`${c.title ?? ''}${c.q}`), `${c.id}: 실행 전에 짐작하는 문제는 쓰지 않는다 — 실행 셀 뒤의 결과 해석으로`);
      ok(L.cells.slice(0, L.cells.indexOf(c)).some(runnable), `${c.id}: 앞에 실행 셀이 없다 — 결과를 낸 셀 뒤에 둘 것`);
    }
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

// ── ⑥ 교사용 잠금(정답 채우기 · ?demo) — 2026-11-12 사용자 지시 ──
ok(/^[0-9a-f]{32}$/.test(LOCK.salt) && /^[0-9a-f]{64}$/.test(LOCK.hash) && ITER >= 100000, '잠금 값 모양(소금 16바이트 · 해시 32바이트 · 되풀이 10만 번 이상)');
_resetLock();
// ⚠ 공개되는 이 파일에는 비밀번호를 닮은 값도 적지 않는다 — 닮은 틀린 값은 아래 test/local 쪽에서 원문으로 만든다
for (const bad of ['', '0000', 'password', 'teacher']) ok((await checkPassword(bad)) === false, `틀린 비밀번호 「${bad}」 가 열렸다`);
ok((await checkPassword('x')) === false, '다섯 번째 틀린 값'); // 위 네 번 + 이번 = 다섯 번 틀림
ok((await checkPassword('y')) === 'wait', '다섯 번 틀린 뒤에는 30초 동안 받지 않아야 한다');
_resetLock();
const PW_FILE = new URL('./local/teacher-pw.txt', import.meta.url);
if (existsSync(PW_FILE)) {
  // 원문은 깃에 올리지 않는 test/local/ 에만 있다 — 그 파일이 있는 컴퓨터에서만 「맞는 비밀번호」 와 「원문이 새지 않았는지」 를 본다
  const pw = readFileSync(PW_FILE, 'utf8').trim();
  for (const near of [pw.toUpperCase(), `${pw} `, pw.slice(0, -1)]) ok((await checkPassword(near)) === false, '비밀번호를 닮은 틀린 값(대문자 · 뒤 빈칸 · 한 글자 빠짐)이 열렸다');
  _resetLock();
  ok((await checkPassword(pw)) === true, '선생님 비밀번호가 열리지 않는다 — LOCK 값을 다시 만들었나?');
  _resetLock();
  const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
  const files = ['README.md', 'LICENSE', 'index.html', 'package.json', 'vite.config.js', '.github/workflows/deploy.yml'];
  const walk = (d) => { for (const f of readdirSync(join(root, d))) { const p = join(d, f); if (statSync(join(root, p)).isDirectory()) { if (!/local$/.test(p)) walk(p); } else files.push(p); } };
  ['src', 'tools', 'test'].forEach(walk);
  const leaked = files.filter((f) => !/\.(zip|csv)$/.test(f) && readFileSync(join(root, f), 'utf8').includes(pw));
  ok(leaked.length === 0, `선생님 비밀번호 원문이 들어 있다: ${leaked.join(', ')}`);
} else console.log('(test/local/teacher-pw.txt 가 없어 맞는 비밀번호 · 원문 새는지 검사는 건너뜁니다)');

// ── ⑦ 💾 활동 저장(HTML 파일) — 2026-11-12 사용자 지시 ──
{
  const ALL = LESSONS.flatMap((L) => L.cells);
  const nCode = ALL.filter(graded).length;
  const nChoice = ALL.filter((c) => c.kind === 'ask').length + LESSONS.reduce((a, L) => a + (L.quiz?.length ?? 0), 0);
  const empty = { answers: {}, passed: {}, quiz: {}, free: {}, ask: {}, exam: {}, code: {} };
  const when = new Date(2026, 10, 12, 9, 5);
  const blank = buildReport(empty, { when });
  const escT = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  ok(LESSONS.every((L) => blank.includes(escT(L.title))), '활동 기록에 빠진 레슨 제목이 있다');
  ok(blank.includes(`0 / ${nCode}`) && blank.includes('(적지 않음)') && blank.includes('2026. 11. 12. 09:05'), '빈 기록의 합계 · 이름 칸 · 저장한 때');
  ok(reportFileName({ when }) === '자전거회귀분석_활동_20261112.html', '이름을 비우면 파일 이름은 날짜로');
  ok(reportFileName({ id: '20315', name: '홍 길/동?', when }) === '20315_홍길동_자전거회귀분석.html', '파일 이름에서 빈칸 · 쓸 수 없는 글자를 뺀다');
  // 모두 맞게 한 학생 — 빈칸에 정답 · 통과 · 고른 답 모두 정답 · 자유 실험에 태그를 넣어 본다
  const full = { ...empty, answers: {}, passed: {}, ask: {}, quiz: {}, free: {} };
  for (const c of ALL.filter(graded)) { full.answers[c.id] = c.blanks.map((b) => b.answers[0]); full.passed[c.id] = 1; }
  for (const c of ALL.filter((x) => x.kind === 'ask')) full.ask[c.id] = c.answer;
  for (const L of LESSONS) { full.quiz[L.id] = Object.fromEntries((L.quiz ?? []).map((q, i) => [i, q.answer])); }
  full.free.intro = "print('<script>x = 1</script>')";
  const done = buildReport(full, { id: '20315', name: '<b>홍길동</b>', when });
  ok(done.includes(`${nCode} / ${nCode}`) && (done.match(/❌/g) ?? []).length === 0 && (done.match(/⭕/g) ?? []).length === nChoice, '모두 맞힌 기록의 합계와 ⭕ 개수');
  ok(done.includes('<mark>registered</mark>'), '빈칸에 쓴 글자가 노란 칸으로 들어간다');
  ok(!/<script/i.test(done) && done.includes('&lt;script&gt;') && done.includes('&lt;b&gt;홍길동'), '학생이 쓴 글자는 태그로 바뀌지 않는다(내려받은 파일에 스크립트 0개)');
  ok(done.includes('티쳐무'), '활동 기록에 저작권 표시');
  // 틀린 답 하나 → ❌ 하나
  const oneWrong = { ...full, ask: { ...full.ask } };
  const firstAsk = ALL.find((c) => c.kind === 'ask');
  oneWrong.ask[firstAsk.id] = (firstAsk.answer + 1) % firstAsk.choices.length;
  ok((buildReport(oneWrong, { when }).match(/❌/g) ?? []).length === 1, '틀린 답은 ❌ 로 남는다');
  // 학번 · 이름은 파일에만 — 저장소(localStorage)에 넣지 않는다
  const reportSrc = readFileSync(new URL('../src/lib/report.js', import.meta.url), 'utf8');
  const mainSrc = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const saveFn = mainSrc.slice(mainSrc.indexOf('async function saveActivity'), mainSrc.indexOf('function route'));
  ok(saveFn.length > 100 && !/localStorage|sessionStorage|saveStore|store\.\w+\s*=/.test(reportSrc + saveFn), '학번·이름을 브라우저에 저장하는 코드가 있다');
}

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
