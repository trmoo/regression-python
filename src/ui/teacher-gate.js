// © 2026 티쳐무 · 모든 권리 보유
// 선생님 비밀번호 창 — 「정답 채우기」·?demo 를 열기 전에 묻는다. 맞는지 셈하는 일은 src/lib/teacher-lock.js 가 한다.
// 한 번 맞히면 이 창(탭)을 새로 고치기 전까지 다시 묻지 않는다(어디에도 저장하지 않는다).
import { h, modal, toast } from '../lib/ui.js';
import { checkPassword, isUnlocked } from '../lib/teacher-lock.js';

const WHY = {
  wait: '여러 번 틀려서 30초 동안 쉬어요. 잠시 뒤에 다시 넣어 주세요.',
  nosubtle: '이 주소에서는 비밀번호를 확인할 수 없어요. https 주소(깃허브 페이지)나 내려받은 파일로 열어 주세요.',
  false: '비밀번호가 맞지 않아요.',
};

// 맞으면 true, 취소하면 false
export async function askTeacher(lead) {
  if (isUnlocked()) return true;
  let msg = '';
  for (;;) {
    const input = h('input', { type: 'password', class: 'pw-in', autocomplete: 'off', spellcheck: 'false', placeholder: '선생님 비밀번호', 'aria-label': '선생님 비밀번호' });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); input.closest('.modal')?.querySelector('.primary')?.click(); }
    });
    const body = h('div', {},
      h('p', {}, lead),
      input,
      msg ? h('p', { class: 'pw-err', role: 'alert' }, `🔒 ${msg}`) : null,
      h('p', { class: 'tiny' }, '비밀번호는 선생님께 여쭤 보세요. 학생은 💡 힌트로 한 칸씩 풀 수 있어요.'));
    setTimeout(() => input.focus(), 30);
    const ok = await modal('🔒 선생님 확인', body, { ok: '확인', cancel: '취소' });
    if (!ok) return false;
    const r = await checkPassword(input.value);
    if (r === true) { toast('선생님 확인 완료 — 이 창을 새로 고치기 전까지 다시 묻지 않아요.'); return true; }
    msg = WHY[String(r)] ?? WHY.false;
  }
}
