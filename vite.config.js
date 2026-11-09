// © 2026 티쳐무 · 모든 권리 보유
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// 빌드 결과를 dist/index.html 한 파일로 만든다 — 설명·미리 계산한 결과는 인터넷 없이도 열린다.
// (파이썬 실행 엔진 Pyodide 만은 처음 실행할 때 jsdelivr 에서 받는다)
// 압축하면 주석이 지워지므로 저작권 배너는 /*! 로 시작해 남긴다(legalComments: 'inline').
const BANNER = '/*! 자전거 대여량 회귀 분석 실습실 · © 2026 티쳐무 · 모든 권리 보유 · 학교 수업 목적으로만 이용해 주세요 */';

export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
  // seaborn 묶음(zip)을 자원으로 다뤄야 `?inline` 으로 data: 주소가 된다(없으면 Vite 가 파일 이름째 찾다 실패한다)
  assetsInclude: ['**/*.zip'],
  esbuild: { legalComments: 'inline' },
  // 앱 폴더에 참고 자료(노트북·PDF 등)를 두면 동기화 중에 잠겨 감시가 죽는다 — 감시하지 않는다
  server: { watch: { ignored: ['**/*.ipynb', '**/*.pdf', '**/*.pptx', '**/*.hwp', '**/*.docx', '**/참고자료/**'] } },
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    rollupOptions: { output: { postBanner: BANNER } },   // ⚠ Vite 8 에서 banner 는 압축에서 지워진다 — postBanner 는 압축 뒤에 붙는다
  },
});
