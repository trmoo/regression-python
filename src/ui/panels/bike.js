// © 2026 티쳐무 · 모든 권리 보유
// 자전거 대여 회귀 분석의 그림 도구 — 레슨의 panel 셀이 이름으로 부른다.
// 숫자가 파이썬 결과와 같아야 하는 도구는 tools/golden.mjs 가 레슨의 py 코드를 돌려 만든 자료(d)를 받는다.
import { h, svg, fill, rich } from '../../lib/ui.js';
import { frame, slider } from './chart.js';

const expm1 = (x) => Math.exp(x) - 1;
const f = (v, n = 2) => Number(v).toFixed(n);
const won = (v) => Math.round(v).toLocaleString('ko-KR');
const noData = () => h('p', {}, '그림 자료가 없습니다(npm run golden).');

// 버튼 묶음 하나 — 고른 값을 onPick 으로 알린다
function seg(options, value, onPick) {
  const btns = options.map(([v, label]) => h('button', { type: 'button', class: v === value ? 'on' : '', onClick: () => { btns.forEach((b) => b.classList.remove('on')); btns[options.findIndex((o) => o[0] === v)].classList.add('on'); onPick(v); } }, label));
  return h('div', { class: 'seg', role: 'group' }, btns);
}

const pathOf = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('');

// ── 회귀 분석의 순서 ──
const ROAD = [
  ['0', '문제와 데이터', '무엇을 예측할까', '#start/intro'],
  ['Ⅰ', '불러오기·특성 파악', 'info · describe', '#eda/load'],
  ['Ⅰ', '이상치 확인', '상자그림', '#eda/outlier'],
  ['Ⅰ', '변수 고르기', '점그래프 · 상관', '#eda/choose'],
  ['Ⅰ', '상관·히트맵', '0.3 이상 고르기', '#eda/corr'],
  ['Ⅱ', '통계적 회귀', 'OLS · summary', '#ols/fit'],
  ['Ⅲ', '나누기', '학습 70 · 평가 30', '#ml/split'],
  ['Ⅲ', '학습·예측·평가', 'fit · predict · MSE', '#ml/train'],
];
export function roadmapPanel() {
  return h('div', {},
    h('p', { class: 'lead' }, '교과서 114~121쪽 실습의 흐름이다. 칸을 누르면 그 레슨으로 간다.'),
    h('ol', { class: 'road' }, ROAD.map(([n, t, s, href]) => h('li', {}, h('a', { href }, h('b', {}, h('span', { class: 'tag' }, n), t), h('span', {}, s))))));
}

// ── count 는 로그 값 — 두 분포와 되돌리기 ──
export function logCountPanel(cell, d) {
  if (!d) return noData();
  let mode = 'raw', x = 5;
  const box = h('div', { class: 'viz-wrap' });
  const info = h('div', { class: 'panel-info' });
  const total = d.raw.reduce((a, b) => a + b, 0);   // 10,886 — 데이터 줄 수 = 기록된 시간의 수
  // 막대 i 가 맡은 구간을 사람 말로. 대여 수는 정수라 「34~66대」 처럼 끝을 정수로 적는다(마지막 막대만 오른쪽 끝을 품는다)
  const rawRange = (i, e) => `${Math.ceil(e[i])}~${i === e.length - 2 ? d.max : Math.ceil(e[i + 1]) - 1}대`;
  const logRange = (i, e) => `count ${f(e[i])}~${f(e[i + 1])} (대여 수 약 ${won(expm1(e[i]))}~${won(expm1(e[i + 1]))}대)`;
  function draw() {
    const counts = mode === 'raw' ? d.raw : d.log;
    const edges = mode === 'raw' ? d.rawEdges : d.logEdges;
    const range = mode === 'raw' ? rawRange : logRange;
    const ymax = Math.max(...counts) * 1.1;
    const C = frame({ h: 260, x: [edges[0], edges[edges.length - 1]], y: [0, ymax], xlab: mode === 'raw' ? '그 한 시간 동안 빌려 간 자전거 수(대)' : 'count = log(대여 수 + 1)', ylab: '그런 시간의 수(번)', label: '대여량 분포' });
    counts.forEach((c, i) => C.layer.appendChild(svg('rect', { x: C.sx(edges[i]) + 0.5, y: C.sy(c), width: Math.max(0, C.sx(edges[i + 1]) - C.sx(edges[i]) - 1), height: C.sy(0) - C.sy(c), class: mode === 'raw' ? 'bar-b' : 'bar-a' },
      svg('title', {}, `${range(i, edges)} 빌려 간 시간: ${c.toLocaleString('ko-KR')}번`))));
    const at = mode === 'raw' ? expm1(x) : x;
    C.layer.appendChild(svg('line', { x1: C.sx(at), x2: C.sx(at), y1: C.sy(0), y2: C.sy(ymax), class: 'cur' }));
    fill(box, C.root);
    // 빨간 선이 지나는 막대를 말로 읽어 준다 — 「몇 시간」 이 무엇을 센 것인지 숫자로 보이게
    let k = edges.findIndex((e, i) => i < edges.length - 1 && at >= e && at < edges[i + 1]);
    if (k < 0) k = at < edges[0] ? 0 : counts.length - 1;
    fill(info, `count = ${f(x)}  →  대여 수 = e^${f(x)} − 1 ≈ `, h('span', { class: 'big-num' }, `${won(expm1(x))}대`),
      h('div', { class: 'sub' }, `빨간 선이 지나는 막대: 한 시간에 ${range(k, edges)} 빌려 간 시간이 `, h('strong', {}, `${counts[k].toLocaleString('ko-KR')}번`), ` 있었다(전체 ${total.toLocaleString('ko-KR')}시간의 ${(counts[k] / total * 100).toFixed(1)}%).`),
      h('div', { class: 'sub' }, mode === 'raw'
        ? `한 시간 대여 수는 ${d.min}대 ~ ${d.max}대, 평균 ${d.mean}대 · 중앙값 ${d.median}대. 적은 쪽에 몰리고 오른쪽으로 길게 늘어진다.`
        : '로그를 씌우면 큰 값이 많이 줄어 고르게 퍼진다. 직선 회귀는 이쪽을 다루기 쉽다.'));
  }
  const s = slider({ label: 'count 값', min: 0.7, max: 6.9, step: 0.01, value: x, onInput: (v) => { x = v; draw(); }, show: (v) => f(v) });
  draw();
  return h('div', {},
    h('p', { class: 'lead' }, `데이터의 한 줄은 「어느 날 어느 한 시간」의 기록이다 — 모두 ${total.toLocaleString('ko-KR')}줄이니 ${total.toLocaleString('ko-KR')}시간을 기록한 셈이다. 그 한 시간 동안 빌려 간 자전거 수를 30구간으로 나누고, 구간마다 그런 시간이 몇 번 있었는지 세어 막대로 그렸다(히스토그램). 막대에 마우스를 올리면 숫자가 보인다.`),
    h('div', { class: 'panel-row' }, seg([['raw', '실제 대여 수'], ['log', 'count (로그)']], mode, (v) => { mode = v; draw(); }), s.el),
    box, info);
}

// ── 상자그림 해부 ──
const BOX_NAME = { temp: '기온 temp', humidity: '습도 humidity', windspeed: '풍속 windspeed' };
export function boxAnatomyPanel(cell, d) {
  if (!d) return noData();
  let col = 'windspeed';
  const box = h('div', { class: 'viz-wrap' });
  const info = h('div', { class: 'panel-info' });
  function draw() {
    const b = d[col];
    const lo = Math.min(b.min, b.lo), hi = Math.max(b.max, b.hi);
    const pad = (hi - lo) * 0.06;
    const C = frame({ h: 210, x: [lo - pad, hi + pad], y: [0, 10], yticks: [], xlab: BOX_NAME[col], label: '상자그림 해부', pad: { l: 16, r: 16, t: 10, b: 40 } });
    const L = C.layer, y = C.sy(5), top = C.sy(7), bot = C.sy(3);
    const line = (x1, x2, y1, y2, cls) => L.appendChild(svg('line', { x1, x2, y1, y2, class: cls }));
    const text = (x, yy, t, cls = 'lab', anchor = 'middle') => L.appendChild(svg('text', { x, y: yy, 'text-anchor': anchor, class: cls }, t));
    line(C.sx(b.lo), C.sx(b.lo), C.sy(1), C.sy(9.4), 'fence');
    line(C.sx(b.hi), C.sx(b.hi), C.sy(1), C.sy(9.4), 'fence');
    text(C.sx(b.lo), C.sy(9.6) - 2, `아래 울타리 ${f(b.lo)}`, 'lab red');
    text(C.sx(b.hi), C.sy(9.6) - 2, `위 울타리 ${f(b.hi)}`, 'lab red');
    line(C.sx(b.wlo), C.sx(b.q1), y, y, 'whisk');
    line(C.sx(b.q3), C.sx(b.whi), y, y, 'whisk');
    line(C.sx(b.wlo), C.sx(b.wlo), C.sy(6), C.sy(4), 'whisk');
    line(C.sx(b.whi), C.sx(b.whi), C.sy(6), C.sy(4), 'whisk');
    L.appendChild(svg('rect', { x: C.sx(b.q1), y: top, width: C.sx(b.q3) - C.sx(b.q1), height: bot - top, class: 'box' }));
    line(C.sx(b.med), C.sx(b.med), top, bot, 'whisk');
    text(C.sx(b.q1), C.sy(2.1), `Q1 ${f(b.q1)}`, 'lab brand', 'end');
    text(C.sx(b.q3), C.sy(2.1), `Q3 ${f(b.q3)}`, 'lab brand', 'start');
    text(C.sx(b.med), C.sy(7.6), `중앙값 ${f(b.med)}`, 'lab');
    for (const v of b.outs) L.appendChild(svg('circle', { cx: C.sx(v), cy: y, r: 5, class: 'pt-sel' }));
    fill(box, C.root);
    const iqr = b.q3 - b.q1;
    fill(info, `IQR = Q3 − Q1 = ${f(b.q3)} − ${f(b.q1)} = ${f(iqr)}`,
      h('div', { class: 'sub' }, `아래 울타리 = Q1 − 1.5 × IQR = ${f(b.lo)}  ·  위 울타리 = Q3 + 1.5 × IQR = ${f(b.hi)}`),
      h('div', { class: 'sub' }, `울타리 밖(빨간 점): 아래 ${b.nlo}줄 · 위 ${b.nhi}줄. 수염은 울타리 안에서 가장 먼 실제 값(${f(b.wlo)} ~ ${f(b.whi)})까지 그린다.`));
  }
  draw();
  return h('div', {},
    h('p', { class: 'lead' }, '위 셀의 상자그림 하나를 크게 펼쳤다. 열을 바꿔 가며 울타리와 이상치를 보자.'),
    h('div', { class: 'panel-row' }, seg(Object.entries(BOX_NAME), col, (v) => { col = v; draw(); })),
    box, info);
}

// ── 시간대별 평균 — 근무일 vs 쉬는 날 ──
export function hourProfilePanel(cell, d) {
  if (!d) return noData();
  let hr = 8;
  const box = h('div', { class: 'viz-wrap' });
  const info = h('div', { class: 'panel-info' });
  const hours = [...Array(24).keys()];
  function draw() {
    const C = frame({ h: 280, x: [-0.5, 23.5], y: [1.5, 6.5], xticks: [0, 3, 6, 9, 12, 15, 18, 21], xlab: '시각(hour)', ylab: '평균 count', label: '시간대별 평균 대여량' });
    C.layer.appendChild(svg('line', { x1: C.sx(hr), x2: C.sx(hr), y1: C.sy(1.5), y2: C.sy(6.5), class: 'cur' }));
    for (const [arr, cls, pt] of [[d.rest, 'line-a', 'pt-a'], [d.work, 'line-b', 'pt-b']]) {
      C.layer.appendChild(svg('path', { d: pathOf(hours.map((i) => [C.sx(i), C.sy(arr[i])])), class: cls }));
      hours.forEach((i) => C.layer.appendChild(svg('circle', { cx: C.sx(i), cy: C.sy(arr[i]), r: i === hr ? 6 : 3.5, class: pt })));
    }
    hours.forEach((i) => C.layer.appendChild(svg('rect', { x: C.sx(i - 0.5), y: C.sy(6.5), width: C.sx(1) - C.sx(0), height: C.sy(1.5) - C.sy(6.5), class: 'hit', onClick: () => { hr = i; s.set(i); draw(); } })));
    fill(box, C.root);
    fill(info, `${hr}시 — 근무일 ${f(d.work[hr])} (대여 수 약 ${won(expm1(d.work[hr]))}대) · 쉬는 날 ${f(d.rest[hr])} (약 ${won(expm1(d.rest[hr]))}대)`,
      h('div', { class: 'sub' }, '그래프를 누르거나 슬라이더를 움직여 시각을 바꿔 보자. 로그 값의 평균을 되돌린 것이라 대여 수는 대략이다.'));
  }
  const s = slider({ label: '시각', min: 0, max: 23, step: 1, value: hr, onInput: (v) => { hr = v; draw(); }, show: (v) => `${v}시` });
  draw();
  return h('div', {},
    h('p', { class: 'lead' }, '위 점그래프의 점(시각별 평균)만 이어 그렸다. 주황이 근무일, 초록이 쉬는 날이다.'),
    h('div', { class: 'legend' }, h('span', {}, h('i', { style: { background: '#f59e0b' } }), '근무일(workingday = 1)'), h('span', {}, h('i', { style: { background: 'var(--brand)' } }), '쉬는 날(workingday = 0)')),
    h('div', { class: 'panel-row' }, s.el), box, info);
}

// ── 상관계수 기준값 바꾸기 ──
export function corrThresholdPanel(cell, d) {
  if (!d) return noData();
  let thr = 0.3;
  const rows = d.names.map((n, i) => ({ n, r: d.r[i] })).sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
  const list = h('div', {});
  const info = h('div', { class: 'panel-info' });
  function draw() {
    const pct = (v) => `${Math.abs(v) * 50}%`;
    fill(list, rows.map(({ n, r }) => {
      const picked = Math.abs(r) >= thr;
      return h('div', { class: `thr-row ${picked ? 'picked' : ''}` },
        h('span', { class: 'name' }, n),
        h('span', { class: 'track' },
          h('span', { class: `fillbar ${r >= 0 ? 'pos' : 'neg'}`, style: { width: pct(r) } }),
          h('span', { class: 'mid' }),
          h('span', { class: 'cut', style: { left: `${50 + thr * 50}%` } }),
          h('span', { class: 'cut', style: { left: `${50 - thr * 50}%` } })),
        h('span', { class: 'val' }, f(r, 3)));
    }));
    const got = rows.filter(({ r }) => Math.abs(r) >= thr).map(({ n }) => n);
    fill(info, `기준 |r| ≥ ${f(thr)} → 골라진 변수 ${got.length}개: `, h('strong', {}, got.length ? got.join(', ') : '(없음)'),
      h('div', { class: 'sub' }, thr === 0.3 ? '교과서와 같은 기준이다. 아래 셀의 결과(count 를 뺀 셋)와 같다.' : '기준을 낮추면 더 많은 변수가, 높이면 더 적은 변수가 골라진다. 정해진 정답 기준은 없고 분석하는 사람이 정한다.'));
  }
  const s = slider({ label: '기준값', min: 0, max: 0.6, step: 0.05, value: thr, onInput: (v) => { thr = Number(v.toFixed(2)); draw(); }, show: (v) => f(v) });
  draw();
  return h('div', {},
    h('p', { class: 'lead' }, '`count` 와 각 변수의 상관계수다. 가운데 선에서 오른쪽(초록)은 +, 왼쪽(분홍)은 −. 빨간 점선이 기준값 ±이다.'),
    h('div', { class: 'panel-row' }, s.el), list, info);
}

// ── summary 표를 눌러 읽기 ──
const SUMMARY_HELP = [
  ['Dep. Variable:', /Dep\. Variable:/, '종속 변수 — 설명하려는 결과(`count`).', ''],
  ['R-squared:', /(?<!Adj\. )R-squared:/, '결정 계수 — count 의 흩어짐 가운데 이 식이 설명하는 비율(0 ~ 1). 1 에 가까울수록 잘 맞는다.', 'results.rsquared'],
  ['Adj. R-squared:', /Adj\. R-squared:/, '수정 결정 계수 — 쓸모없는 변수를 넣으면 깎이도록 변수 개수를 감안한 R². 모델끼리 견줄 때 쓴다.', 'results.rsquared_adj'],
  ['F-statistic:', /F-statistic:/, '모델 전체의 F 통계량 — 「상수항을 뺀 계수가 모두 0 이다(이 식은 쓸모없다)」를 검정한다. 아래 「결과표 더 읽기 ②」에서 t 와 견준다.', 'results.fvalue'],
  ['Prob (F-statistic):', /Prob \(F-statistic\):/, '위 F 검정의 p 값. 0.05 보다 작으면 「모델이 유의하다」. 0.00 은 아주 작다는 뜻이다.', 'results.f_pvalue'],
  ['No. Observations:', /No\. Observations:/, '데이터 수(줄 수) — 10,886줄 전체를 썼다.', 'results.nobs'],
  ['Df Model:', /Df Model:/, '모델 자유도 = 독립 변수 개수(상수항 제외).', 'results.df_model'],
  ['coef', /\bcoef\b/, '계수 — 회귀식의 숫자. 그 변수가 1 늘 때(다른 변수는 그대로) count 가 바뀌는 양.', 'results.params'],
  ['std err', /std err/, '계수의 표준 오차 — 계수 추정이 얼마나 흔들리는가.', 'results.bse'],
  [' t ', /(?<=std err\s+)t(?=\s)/, 't 값 = coef ÷ std err. 「이 계수는 0 이다」를 검정하는 통계량.', 'results.tvalues'],
  ['P>|t|', /P>\|t\|/, '계수마다의 유의 확률(p 값). 0.05 보다 작으면 그 변수가 유의하다. 0.000 은 0 이 아니라 0.0005 보다 작다는 뜻이다.', 'results.pvalues'],
  ['[0.025      0.975]', /\[0\.025\s+0\.975\]/, '계수의 95% 신뢰구간. 0 을 품고 있으면 그 계수는 유의하지 않다.', 'results.conf_int()'],
  ['const', /^const/m, '상수항(절편) — 독립 변수가 모두 0 일 때의 예측값. add_constant 로 더한 열이다.', "results.params['const']"],
  ['Durbin-Watson:', /Durbin-Watson:/, '잔차끼리 이어져 있는지(자기상관) — 2 근처면 괜찮다. 이 데이터는 시간 순서라 0.47 로 낮다(앞뒤 시각끼리 닮았다).', ''],
  ['Cond. No.', /Cond\. No\./, '조건수 — 아주 크면(수천 이상) 독립 변수끼리 너무 닮았다는 신호.', ''],
];
export function summaryReadPanel(cell, _d, golden) {
  const ref = golden?.cells?.[cell.from];
  const text = ref?.items?.filter((it) => it.kind === 'out').map((it) => it.text).join('') ?? '';
  if (!text) return h('p', {}, '결과표 자료가 없습니다.');
  const help = h('div', { class: 'sum-help' }, h('p', {}, '👆 노랗게 칠한 이름을 눌러 보세요.'));
  const hits = [];
  for (const [label, re, what, attr] of SUMMARY_HELP) {
    const m = re.exec(text);
    if (!m || hits.some((x) => m.index < x.end && m.index + m[0].length > x.start)) continue;
    hits.push({ start: m.index, end: m.index + m[0].length, label, what, attr });
  }
  // 계수 표 안의 변수 이름 줄
  const coefBlock = /-{20,}\n([\s\S]*?)\n={20,}/.exec(text);
  if (coefBlock) {
    const base = coefBlock.index + coefBlock[0].indexOf(coefBlock[1]);
    let off = 0;
    for (const line of coefBlock[1].split('\n')) {
      const name = /^(\S+)/.exec(line)?.[1];
      if (name && name !== 'const') {
        const nums = line.trim().split(/\s+/);
        hits.push({ start: base + off, end: base + off + name.length, label: name, what: `독립 변수 ${name} 의 줄 — 계수 ${nums[1]}, P>|t| ${nums[4]}. ${Number(nums[4]) > 0.05 ? '**0.05 보다 커서 유의하지 않다.**' : '0.05 보다 작아 유의하다.'}`, attr: `results.params['${name}']` });
      }
      off += line.length + 1;
    }
  }
  hits.sort((a, b) => a.start - b.start);
  const pre = h('pre', { class: 'sum-pre' });
  let last = 0;
  const spans = [];
  for (const x of hits) {
    if (x.start < last) continue;
    pre.appendChild(document.createTextNode(text.slice(last, x.start)));
    const sp = h('span', { class: 'hot', tabindex: 0, role: 'button' }, text.slice(x.start, x.end));
    const pick = () => {
      spans.forEach((s) => s.classList.remove('on'));
      sp.classList.add('on');
      fill(help, h('p', {}, h('strong', {}, x.label.trim()), ' — ', rich(x.what)), x.attr ? h('p', {}, '값만 꺼내려면: ', h('code', {}, x.attr)) : null);
    };
    sp.addEventListener('click', pick);
    sp.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    spans.push(sp);
    pre.appendChild(sp);
    last = x.end;
  }
  pre.appendChild(document.createTextNode(text.slice(last)));
  return h('div', {}, h('p', { class: 'lead' }, '위 셀에서 찍은 결과표다. 먼저 볼 곳은 R-squared · coef · P>|t| 세 군데다.'), pre, help);
}

// ── 회귀식 계산기 + 시간대 비교 ──
export function predictCalcPanel(cell, d) {
  if (!d) return noData();
  const b = d.b;
  const st = { temp: 25, hour: 8, humidity: 50 };
  const out = h('div', {});
  const box = h('div', { class: 'viz-wrap' });
  const pred = (t, hr, hu) => b.const + b.temp * t + b.hour * hr + b.humidity * hu;
  function draw() {
    const y = pred(st.temp, st.hour, st.humidity);
    fill(out,
      h('div', { class: 'calc-eq' }, `count = ${f(b.const, 4)} + ${f(b.temp, 4)}×${st.temp} + ${f(b.hour, 4)}×${st.hour} − ${f(-b.humidity, 4)}×${st.humidity} = ${f(y, 3)}`),
      h('div', { class: 'calc-out' }, h('span', {}, '예측 count ', h('span', { class: 'big-num' }, f(y, 2))), h('span', {}, '→ 대여 수 약 ', h('span', { class: 'big-num' }, `${won(expm1(y))}대`))));
    const C = frame({ h: 260, x: [-0.5, 23.5], y: [1.5, 6.5], xticks: [0, 3, 6, 9, 12, 15, 18, 21], xlab: '시각(hour)', ylab: 'count', label: '회귀식과 실제 평균' });
    const hours = [...Array(24).keys()];
    C.layer.appendChild(svg('path', { d: pathOf(hours.map((i) => [C.sx(i), C.sy(d.hourMean[i])])), class: 'line-gray' }));
    C.layer.appendChild(svg('path', { d: pathOf(hours.map((i) => [C.sx(i), C.sy(Math.max(1.5, Math.min(6.5, pred(d.tempMean, i, d.humMean))))])), class: 'line-fit' }));
    C.layer.appendChild(svg('circle', { cx: C.sx(st.hour), cy: C.sy(Math.max(1.5, Math.min(6.5, y))), r: 7, class: 'pt-sel' }));
    fill(box, C.root);
  }
  const mk = (k, label, min, max, unit) => slider({ label, min, max, step: 1, value: st[k], onInput: (v) => { st[k] = v; draw(); }, show: (v) => `${v}${unit}` }).el;
  draw();
  return h('div', {},
    h('p', { class: 'lead' }, '세 변수를 움직이면 회귀식이 대여량을 계산한다(windspeed 를 뺀 식).'),
    h('div', { class: 'panel-row' }, mk('temp', '기온', 0, 41, '℃'), mk('hour', '시각', 0, 23, '시'), mk('humidity', '습도', 0, 100, '%')),
    out,
    h('p', { class: 'lead' }, `아래 그래프의 회색 선은 실제 시간대별 평균, 파란 선은 평균 기온(${d.tempMean}℃)·평균 습도(${d.humMean}%)일 때 회귀식이 예측한 값이다. 빨간 점은 위에서 고른 조건의 예측이다.`),
    h('div', { class: 'legend' }, h('span', {}, h('i', { style: { background: '#94a3b8' } }), '실제 평균'), h('span', {}, h('i', { style: { background: '#2563eb' } }), '회귀식(직선)')),
    box);
}

// ── 학습용·평가용 나누기 ──
export function splitViewPanel(cell, d) {
  if (!d) return noData();
  let seed = '2000';
  const grid = h('div', { class: 'split-grid', role: 'img', 'aria-label': '앞 100줄이 학습용과 평가용 가운데 어디로 갔는지' });
  const info = h('div', { class: 'panel-info' });
  function draw() {
    const s = d.seeds[seed];
    fill(grid, s.test.map((t, i) => h('span', { class: t ? 'test' : '', title: `${i}번 줄 → ${t ? '평가용' : '학습용'}` }, i)));
    const n = s.test.reduce((a, b) => a + b, 0);
    fill(info, `random_state=${seed} — 앞 100줄 가운데 평가용 ${n}줄`,
      h('div', { class: 'sub' }, `전체로는 학습용 ${s.ntrain.toLocaleString('ko-KR')}줄 · 평가용 ${s.ntest.toLocaleString('ko-KR')}줄. X_test 의 맨 앞 줄 번호: ${s.head.join(', ')}`),
      h('div', { class: 'sub' }, seed === '2000' ? '교과서와 같은 씨앗이다. 몇 번을 실행해도 똑같이 나뉜다.' : '씨앗을 바꾸면 다른 줄이 평가용으로 뽑힌다. 비율(30%)은 그대로다.'));
  }
  draw();
  return h('div', {},
    h('p', { class: 'lead' }, '데이터 앞 100줄이 어디로 갔는지 칠했다. 초록은 학습용, 주황은 평가용이다.'),
    h('div', { class: 'panel-row' }, h('span', {}, 'random_state'), seg(Object.keys(d.seeds).sort((a, b) => b - a).map((k) => [k, k]), seed, (v) => { seed = v; draw(); })),
    grid, info);
}

// ── 예측값 vs 실제값 산점도 ──
const isRush = (hr) => (hr >= 7 && hr <= 9) || (hr >= 16 && hr <= 19);
const isNight = (hr) => hr <= 5;
export function predActualPanel(cell, d) {
  if (!d) return noData();
  let which = 'linear';
  const box = h('div', { class: 'viz-wrap' });
  const info = h('div', { class: 'panel-info' });
  function draw() {
    const s = d[which];
    const C = frame({ w: 520, h: 420, x: [0, 7.2], y: [0, 7.2], xlab: '실제 count', ylab: '예측 count', label: '실제값과 예측값' });
    C.layer.appendChild(svg('line', { x1: C.sx(0), y1: C.sy(0), x2: C.sx(7.2), y2: C.sy(7.2), class: 'line-ref' }));
    s.y.forEach((yv, i) => {
      const hr = s.h[i];
      C.layer.appendChild(svg('circle', { cx: C.sx(yv), cy: C.sy(Math.max(0, Math.min(7.2, s.p[i]))), r: 2.6, class: isRush(hr) ? 'pt-b' : isNight(hr) ? 'pt-gray' : 'pt-a', 'fill-opacity': 0.55 }));
    });
    fill(box, C.root);
    const err = s.y.map((yv, i) => (yv - s.p[i]) ** 2);
    const part = (fn) => { const idx = s.h.map((hr, i) => (fn(hr) ? i : -1)).filter((i) => i >= 0); return idx.reduce((a, i) => a + err[i], 0) / idx.length; };
    fill(info, `그림에 찍은 점들의 제곱 오차 평균 — 출퇴근 시간 ${f(part(isRush), 2)} · 새벽 ${f(part(isNight), 2)} · 그 밖 ${f(part((hr) => !isRush(hr) && !isNight(hr)), 2)}`,
      h('div', { class: 'sub' }, which === 'linear'
        ? '점선(대각선)에 가까울수록 정확하다. 새벽(회색)은 실제보다 높게, 출퇴근(주황)은 낮게 예측하는 점이 많다 — 시각을 직선 하나로 다룬 탓이다.'
        : 'hour 를 범주로 바꾸자 점들이 대각선 가까이 모였다. 특히 새벽(회색)의 오차가 크게 줄었다.'));
  }
  draw();
  return h('div', {},
    h('p', { class: 'lead' }, '평가용 데이터를 네 줄에 하나씩 골라 찍었다(약 820개). 가로가 실제값, 세로가 예측값이다.'),
    h('div', { class: 'panel-row' }, seg([['linear', '교과서 모델'], ['dummy', '🔬 hour 를 범주로']], which, (v) => { which = v; draw(); })),
    h('div', { class: 'legend' }, h('span', {}, h('i', { style: { background: '#f59e0b' } }), '출퇴근(7~9시 · 16~19시)'), h('span', {}, h('i', { style: { background: '#94a3b8' } }), '새벽(0~5시)'), h('span', {}, h('i', { style: { background: 'var(--brand)' } }), '그 밖')),
    box, info);
}

// ── 직선 하나 vs 시각마다 따로 ──
export function hourLinePanel(cell, d) {
  if (!d) return noData();
  let showCat = false;
  const box = h('div', { class: 'viz-wrap' });
  const info = h('div', { class: 'panel-info' });
  const hours = [...Array(24).keys()];
  const line = (i) => d.b0 + d.b1 * i;
  function draw() {
    const C = frame({ h: 280, x: [-0.5, 23.5], y: [1.5, 6.5], xticks: [0, 3, 6, 9, 12, 15, 18, 21], xlab: '시각(hour)', ylab: '평균 count', label: '직선과 실제 평균' });
    hours.forEach((i) => C.layer.appendChild(svg('line', { x1: C.sx(i), x2: C.sx(i), y1: C.sy(d.mean[i]), y2: C.sy(showCat ? d.mean[i] : line(i)), class: 'resid' })));
    C.layer.appendChild(svg('path', { d: pathOf(hours.map((i) => [C.sx(i), C.sy(d.mean[i])])), class: 'line-gray' }));
    hours.forEach((i) => C.layer.appendChild(svg('circle', { cx: C.sx(i), cy: C.sy(d.mean[i]), r: 3.5, class: 'pt-gray' })));
    if (showCat) hours.forEach((i) => C.layer.appendChild(svg('rect', { x: C.sx(i - 0.4), y: C.sy(d.mean[i]) - 2, width: C.sx(0.8) - C.sx(0), height: 4, class: 'bar-b' })));
    else C.layer.appendChild(svg('path', { d: pathOf([[C.sx(0), C.sy(line(0))], [C.sx(23), C.sy(line(23))]]), class: 'line-fit' }));
    fill(box, C.root);
    fill(info, showCat
      ? '시각마다 따로 높이(주황 짧은 막대)를 정하면 실제 평균을 그대로 따라갈 수 있다. 빨간 세로선(어긋남)이 사라졌다.'
      : `직선: count = ${f(d.b0, 3)} + ${f(d.b1, 4)} × hour — 새벽 4시는 실제 ${f(d.mean[4])} 인데 직선은 ${f(line(4))}(너무 높다), 8시는 실제 ${f(d.mean[8])} 인데 직선은 ${f(line(8))}(너무 낮다).`,
    h('div', { class: 'sub' }, showCat ? '이것이 아래 셀에서 할 원-핫 인코딩(get_dummies)의 효과다.' : '빨간 세로선이 직선이 어긋난 만큼이다. 직선은 기울기 하나뿐이라 솟았다 내려가는 모양을 그릴 수 없다.'));
  }
  draw();
  return h('div', {},
    h('div', { class: 'panel-row' }, seg([[false, '직선 하나(지금 모델)'], [true, '시각마다 따로(범주)']], showCat, (v) => { showCat = v; draw(); })),
    box, info);
}

// ── MSE 견주기 ──
export function mseBarsPanel(cell, d) {
  if (!d) return noData();
  const max = Math.max(...d.map((x) => x.mse));
  const cls = ['base', 'book', '', ''];
  return h('div', {},
    h('p', { class: 'lead' }, '같은 평가용 데이터(random_state=2000)로 잰 MSE 다. 막대가 짧을수록 예측이 정확하다.'),
    d.map((x, i) => h('div', { class: `mse-row ${cls[i] ?? ''}` }, h('span', {}, x.name), h('span', { class: 'track' }, h('span', { class: 'fillbar', style: { display: 'block', width: `${(x.mse / max) * 100}%` } })), h('span', { class: 'val' }, f(x.mse, 3)))),
    h('p', { class: 'tiny' }, `교과서 모델은 평균만 찍는 것보다 오차를 ${Math.round((1 - d[1].mse / d[0].mse) * 100)}% 줄였고, hour 를 범주로 바꾸면 교과서 모델보다 ${Math.round((1 - d[2].mse / d[1].mse) * 100)}% 더 줄어든다. season·weather 까지 범주로 바꾼 맨 아래 줄은 같은 방법을 두 열에 더 쓴 결과다.`));
}
