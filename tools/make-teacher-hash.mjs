// © 2026 티쳐무 · 모든 권리 보유
// 선생님 비밀번호의 해시 만들기 — 원문은 어디에도 남기지 않고, 이 도구가 찍어 준 두 값만
// src/lib/teacher-lock.js 의 LOCK 에 옮겨 적는다.
// 쓰는 법: node tools/make-teacher-hash.mjs <새 비밀번호>
//   ⚠ 비밀번호를 파일·커밋 메시지에 적지 말 것. 셸 기록에 남는 것이 싫으면 실행 뒤 기록을 지운다.
import { webcrypto } from 'node:crypto';
import { derive, ITER } from '../src/lib/teacher-lock.js';

const pw = process.argv[2];
if (!pw) { console.error('쓰는 법: node tools/make-teacher-hash.mjs <새 비밀번호>'); process.exit(1); }
const salt = Buffer.from(webcrypto.getRandomValues(new Uint8Array(16))).toString('hex');
const hash = await derive(pw, salt, ITER);
console.log(`salt: '${salt}',\nhash: '${hash}',`);
