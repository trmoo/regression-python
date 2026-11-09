/* © 2026 티쳐무 · 모든 권리 보유
   파이썬 일꾼(Web Worker) — 이 파일은 글자 그대로(?raw) 읽혀 Blob(또는 data:) 주소로 띄워진다.
   그래서 빌드한 dist/index.html 한 파일 안에도 들어가고, 번들러를 거치지 않으므로
   브라우저가 바로 읽는 문법만 쓴다. 준비 순서는 tools/engine-node.mjs 와 같아야 한다.

   왜 일꾼인가 — 학생 코드가 오래 걸리거나 끝나지 않으면 바깥에서 terminate( ) 로 끊어야 한다.
   메인 화면에서 돌리면 탭 전체가 얼어붙는다. */

let py = null;
let runPy = null;
let resetPy = null;

const PKG_KO = { numpy: '넘파이', pandas: '판다스', matplotlib: '맷플롯립', scipy: '사이파이', statsmodels: '스탯츠모델스', 'scikit-learn': '사이킷런' };

function fromDataUrl(url) {
  const b64 = url.slice(url.indexOf(',') + 1);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function boot(msg) {
  const base = `https://cdn.jsdelivr.net/pyodide/v${msg.version}/full/`;
  const t0 = performance.now();
  self.postMessage({ type: 'progress', text: '파이썬 엔진을 받는 중…' });
  const mod = await import(base + 'pyodide.mjs');
  py = await mod.loadPyodide({ indexURL: base });
  self.postMessage({ type: 'progress', text: '라이브러리(판다스·맷플롯립·스탯츠모델스·사이킷런)를 받는 중…' });
  await py.loadPackage(msg.packages, {
    messageCallback: (m) => {
      const k = /^Loading (.+)$/.exec(m);
      if (k) self.postMessage({ type: 'progress', text: '받는 중: ' + k[1].split(', ').map((p) => PKG_KO[p] || p).join(', ') });
    },
    errorCallback: () => {},
  });
  // 코랩에서 파일을 올린 것처럼 — 노트북과 같은 자리(지금 폴더)에 smtrain.csv 를 둔다
  py.FS.mkdirTree(msg.home);
  for (const [name, text] of Object.entries(msg.files)) py.FS.writeFile(`${msg.home}/${name}`, text);
  py.FS.writeFile(`${msg.home}/${msg.seabornName}`, fromDataUrl(msg.seaborn));
  py.runPython(`import os; os.chdir('${msg.home}')`);
  self.postMessage({ type: 'progress', text: '라이브러리를 준비하는 중…(처음 한 번은 글꼴 목록을 만드느라 조금 걸려요)' });
  py.runPython(msg.runner);
  py.globals.get('setup')(`${msg.home}/${msg.seabornName}`);
  runPy = py.globals.get('run');
  resetPy = py.globals.get('reset');
  let bytes = 0;
  try { for (const x of performance.getEntriesByType('resource')) if (x.name.includes('pyodide')) bytes += x.transferSize || x.encodedBodySize || 0; } catch (_) { /* 용량만 못 잰다 */ }
  self.postMessage({ type: 'ready', ms: Math.round(performance.now() - t0), bytes, version: py.version });
}

self.onmessage = async (e) => {
  const msg = e.data || {};
  if (msg.type === 'init') {
    try { await boot(msg); } catch (err) { self.postMessage({ type: 'fail', message: String((err && err.message) || err) }); }
    return;
  }
  if (msg.type === 'run') {
    try {
      const json = runPy(msg.ns, msg.code, JSON.stringify(msg.vars || []));
      self.postMessage({ type: 'result', id: msg.id, result: JSON.parse(json) });
    } catch (err) {
      self.postMessage({ type: 'result', id: msg.id, result: { items: [], vars: {}, error: { type: 'EngineError', message: String((err && err.message) || err), line: null, source: '', trace: '' } } });
    }
    return;
  }
  if (msg.type === 'reset') { resetPy(msg.ns); self.postMessage({ type: 'result', id: msg.id, result: null }); }
};
