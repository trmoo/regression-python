/*!
 * 자전거 대여량 회귀 분석 실습실 — © 2026 티쳐무 · 모든 권리 보유
 * 학교 수업 목적으로만 이용해 주세요. 오픈소스 라이선스를 붙이지 않았습니다.
 */
// 시작점 — 탭 5개. 주소 끝의 #탭/레슨 (예: #ols/fit) 으로 바로 갈 수 있다.
// 레슨마다 노트북을 한 번만 만들어 두고, 탭을 옮겨도 실행 상태가 남게 한다.
import './style.css';
import golden from './data/golden.json';
import { h, loadStore, fill, modal, clearStore, toast } from './lib/ui.js';
import { TABS, graded } from './lessons/index.js';
import { Notebook } from './ui/notebook.js';
import { buildEngineBar } from './ui/enginebar.js';
import { start } from './engine/kernel.js';

const views = new Map();
const DEMO = new URLSearchParams(location.search).has('demo');

const top = document.getElementById('top');
const tabs = document.getElementById('tabs');
const pills = document.getElementById('pills');
const main = document.getElementById('main');
document.getElementById('nav').appendChild(buildEngineBar());

top.append(
  h('a', { class: 'brand', href: '#start/intro' },
    h('span', { class: 'logo', 'aria-hidden': 'true' }, '🚲'),
    h('div', {}, h('h1', {}, '자전거 대여량 회귀 분석 실습실'), h('p', {}, '「데이터 과학」 교과서 114~121쪽 — 날씨와 자전거 대여량은 어떤 관계가 있을까? 브라우저의 진짜 파이썬으로'))),
  h('div', { class: 'top-links' },
    h('a', { class: 'btn ghost light', href: '#wrap/summary' }, '📝 한 장 정리'),
    h('button', {
      class: 'btn ghost light', type: 'button', onClick: async () => {
        const ok = await modal('내 기록을 지울까요?', '이 브라우저에 남은 빈칸 답·통과 표시·문제 답을 모두 지웁니다. 함께 쓰는 컴퓨터라면 수업이 끝날 때 눌러 주세요.', { ok: '지우기', cancel: '취소' });
        if (!ok) return;
        clearStore();
        toast('기록을 지웠어요. 새로 고침합니다.');
        setTimeout(() => location.reload(), 600);
      },
    }, '🧹 내 기록 지우기')));

function route() {
  const [a, b] = location.hash.slice(1).split('/');
  const tab = TABS.find((t) => t.id === a) ?? TABS[0];
  const lesson = tab.lessons.find((l) => l.id === b) ?? tab.lessons[0];
  return { tab, lesson };
}

function lessonProgress(l, store) {
  const g = l.cells.filter(graded);
  return [g.filter((c) => store.passed[c.id]).length, g.length];
}

function drawNav() {
  const store = loadStore();
  const r = route();
  fill(tabs, ...TABS.map((t) => {
    const sum = t.lessons.map((l) => lessonProgress(l, store)).reduce((a, [d, n]) => [a[0] + d, a[1] + n], [0, 0]);
    const done = sum[1] && sum[0] === sum[1];
    return h('a', { class: `tab ${r.tab === t ? 'on' : ''}`, href: `#${t.id}/${t.lessons[0].id}`, 'aria-current': r.tab === t ? 'page' : null, title: t.desc },
      h('span', { class: 'tab-num' }, t.num), h('span', { class: 'tab-title' }, `${t.icon} ${t.title}`),
      sum[1] ? h('span', { class: `tab-prog ${done ? 'done' : ''}` }, done ? '✅' : `${sum[0]}/${sum[1]}`) : null);
  }));
  pills.hidden = r.tab.lessons.length < 2;
  fill(pills, r.tab.lessons.map((l, i) => {
    const [d, n] = lessonProgress(l, store);
    return h('a', { class: `pill ${r.lesson === l ? 'on' : ''}`, href: `#${r.tab.id}/${l.id}`, 'aria-current': r.lesson === l ? 'page' : null },
      h('span', { class: 'pill-num' }, `${r.tab.num}-${i + 1}`), l.short, n ? h('span', { class: `pill-prog ${d === n ? 'done' : ''}` }, d === n ? '✓' : `${d}/${n}`) : null);
  }));
}

// 레슨 끝의 「다음 레슨」 단추 — 차례대로 따라가게
const ORDER = TABS.flatMap((t) => t.lessons.map((l) => ({ t, l })));
function nextLink(lesson) {
  const i = ORDER.findIndex((x) => x.l === lesson);
  const n = ORDER[i + 1];
  return n ? h('div', { class: 'next-row' }, h('a', { class: 'btn primary', href: `#${n.t.id}/${n.l.id}` }, `다음 → ${n.t.num}. ${n.l.title}`)) : null;
}

function show() {
  const { tab, lesson } = route();
  drawNav();
  const key = `${tab.id}/${lesson.id}`;
  if (!views.has(key)) {
    const nb = new Notebook(lesson, golden, drawNav);
    nb.el.appendChild(nextLink(lesson) ?? h('span', {}));
    // 주소에 ?demo 를 붙이면 정답을 채워 위에서부터 실행해 둔다(교사 시연·화면 캡처용)
    if (DEMO) queueMicrotask(() => nb.demo());
    views.set(key, nb.el);
  }
  main.replaceChildren(views.get(key));
  document.title = `${lesson.short} · 자전거 대여량 회귀 분석 실습실`;
  window.scrollTo(0, 0);
}

// 도구 막대가 탭·알약 막대 바로 아래에 붙도록 높이를 알려 준다
const syncHeight = () => document.documentElement.style.setProperty('--nav-h', `${document.getElementById('nav').offsetHeight}px`);
new ResizeObserver(syncHeight).observe(document.getElementById('nav'));

window.addEventListener('hashchange', show);
show();
if (DEMO) start();
