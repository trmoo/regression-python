// © 2026 티쳐무 · 모든 권리 보유
// 교사용 잠금 — 「👩‍🏫 정답 채우기」 단추와 주소 끝 ?demo(정답을 채워 실행하는 시연 모드)는
// 선생님 비밀번호를 넣어야 열린다.
//
// 비밀번호 원문은 소스·저장소·빌드본 어디에도 없다. 아래 LOCK 에는 PBKDF2(SHA-256) 를
// 31만 번 되풀이해 얻은 값(hash)과 소금(salt)만 있다. 넣은 값을 같은 방법으로 셈해 견줄 뿐,
// 거꾸로 hash 에서 비밀번호를 되돌려 얻을 수는 없다. 되풀이를 많이 하는 까닭 —
// 소스에서 hash 를 꺼내 「아무 말이나 넣어 보기」를 해도 한 번에 0.1초쯤 걸려, 하나하나 맞춰 보기 어렵게.
// 화면에서는 다섯 번 틀리면 30초 동안 받지 않는다.
//
// ⚠ 이것은 학습 장치다 — 인터넷 없이도 빈칸을 채점하려고 빈칸 정답이 화면 코드 안에 들어 있어,
//   개발자 도구를 다룰 줄 알면 볼 수 있다. 막는 것은 「단추 한 번으로 모든 정답 채우기」다.
// ⚠ 화면 요소(DOM)를 쓰지 말 것 — node 시험이 불러다 쓴다. 비밀번호 창은 src/ui/teacher-gate.js.
// 새 비밀번호: node tools/make-teacher-hash.mjs <새 비밀번호> → 찍힌 두 값을 아래에 옮겨 적는다.
export const ITER = 310000;
export const LOCK = {
  salt: '82a9a9afac9818aeb7066f50d720362f',
  hash: '2237d5d4cba74c6a06bdfbc3fd87936ec86096d85043046f66f6e04bc2aa0013',
};

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const fromHex = (s) => new Uint8Array(s.match(/../g).map((x) => parseInt(x, 16)));

// 비밀번호 → PBKDF2-SHA256(소금, 되풀이 횟수) 32바이트를 16진수 글자로
export async function derive(pw, salt = LOCK.salt, iter = ITER) {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new Error('no-subtle');
  const key = await subtle.importKey('raw', new TextEncoder().encode(String(pw).normalize('NFC')), 'PBKDF2', false, ['deriveBits']);
  const bits = await subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: fromHex(salt), iterations: iter }, key, 256);
  return hex(bits);
}

let unlocked = false;   // 이 창(탭)을 닫거나 새로 고치면 다시 잠긴다 — 어디에도 저장하지 않는다
let fails = 0;
let waitUntil = 0;
export const isUnlocked = () => unlocked;

// 돌려주는 값: true(맞음) · false(틀림) · 'wait'(여러 번 틀려 잠시 쉬는 중) · 'nosubtle'(이 주소에서는 셈할 수 없음)
export async function checkPassword(pw, now = Date.now()) {
  if (unlocked) return true;
  if (now < waitUntil) return 'wait';
  let got;
  try { got = await derive(pw); } catch { return 'nosubtle'; }
  if (got === LOCK.hash) { unlocked = true; fails = 0; return true; }
  fails += 1;
  if (fails >= 5) { fails = 0; waitUntil = now + 30000; }
  return false;
}

// 시험에서만 쓴다 — 잠금 상태를 처음으로
export function _resetLock() { unlocked = false; fails = 0; waitUntil = 0; }
