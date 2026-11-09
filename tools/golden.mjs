// © 2026 티쳐무 · 모든 권리 보유
// 기준 출력 만들기 — 레슨의 모든 셀을 정답으로 채워 진짜 파이썬(Pyodide)으로 위에서부터 돌리고,
// 그 결과를 src/data/golden.json 에 담는다. 앱은 엔진을 켜지 않아도 이 결과(그림 포함)를 보여 줄 수 있고,
// 엔진을 켜면 학생이 돌린 결과를 이 결과와 견주어 채점한다.
// 실행: npm run golden
import { writeFileSync } from 'fs';
import { join } from 'path';
import { makeEngine, ROOT } from './engine-node.mjs';
import { LESSONS, runnable, answerCode } from '../src/lessons/index.js';

const t0 = Date.now();
const eng = await makeEngine();
console.log(`  엔진 준비 ${Date.now() - t0}ms`);
const golden = { cells: {}, panels: {} };
const problems = [];

for (const L of LESSONS) {
  const t1 = Date.now();
  for (const c of L.cells) {
    if (runnable(c)) {
      const r = eng.run(L.id, answerCode(c), c.vars ?? []);
      golden.cells[c.id] = r;
      if (r.error && !c.expectError) problems.push(`${L.id}/${c.id}: ${r.error.type}: ${r.error.message}`);
      if (!r.error && c.expectError) problems.push(`${L.id}/${c.id}: 오류가 나야 하는데 나지 않았습니다`);
      const warns = r.items.filter((it) => it.kind === 'warn');
      if (warns.length) problems.push(`${L.id}/${c.id}: 학생 화면에 경고가 뜹니다 — ${warns.map((w) => w.text).join(' | ').slice(0, 300)}`);
    } else if (c.kind === 'panel' && c.py) {
      // 그림 자료는 따로 이름 공간에서 — 레슨 변수를 건드리지 않게
      const r = eng.run(`panel:${c.id}`, c.py);
      if (r.error) { problems.push(`panel ${c.id}: ${r.error.type}: ${r.error.message}`); continue; }
      const out = r.items.filter((it) => it.kind === 'out').map((it) => it.text).join('');
      golden.panels[c.id] = JSON.parse(out);
    }
  }
  console.log(`  ${L.id} ${L.cells.filter(runnable).length}셀 ${Date.now() - t1}ms`);
}

const json = JSON.stringify(golden);
writeFileSync(join(ROOT, 'src/data/golden.json'), json);
const imgs = Object.values(golden.cells).flatMap((r) => r.items.filter((it) => it.kind === 'image'));
console.log(`  그림 ${imgs.length}장 · golden.json ${(json.length / 1024).toFixed(0)}KB`);
if (problems.length) { console.error('❌ 문제가 있습니다\n' + problems.join('\n')); process.exit(1); }
console.log(`✅ 기준 출력 — 셀 ${Object.keys(golden.cells).length}개 · 그림 자료 ${Object.keys(golden.panels).length}개`);
