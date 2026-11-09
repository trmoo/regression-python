# © 2026 티쳐무 · 모든 권리 보유
# seaborn 묶음 만들기 — Pyodide 배포판에는 seaborn 이 없다(numpy·pandas·matplotlib 는 있다).
# seaborn 은 순수 파이썬이라 패키지 폴더를 zip 으로 묶어 앱에 넣고, 엔진이 켜질 때 풀어 쓴다.
# 그래서 PyPI 에 따로 접속하지 않는다(교실 방화벽이 막아도 된다).
#
# 쓰는 법(앱 폴더에서):
#   python tools/make_seaborn.py <seaborn 이 설치된 site-packages 경로>
#   예) python tools/make_seaborn.py ../seaborn-catalog/.venv/Lib/site-packages
# 결과: src/engine/seaborn-0.13.2.zip  (seaborn/ 폴더 + BSD 라이선스 전문)
import sys, zipfile
from pathlib import Path

VERSION = '0.13.2'
site = Path(sys.argv[1] if len(sys.argv) > 1 else '../seaborn-catalog/.venv/Lib/site-packages')
pkg = site / 'seaborn'
info = site / f'seaborn-{VERSION}.dist-info'
if not (pkg / '__init__.py').exists() or not info.exists():
    sys.exit(f'seaborn {VERSION} 을 {site} 에서 찾지 못했습니다')

out = Path(__file__).resolve().parent.parent / 'src' / 'engine' / f'seaborn-{VERSION}.zip'
n = 0
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for f in sorted(pkg.rglob('*')):
        if '__pycache__' in f.parts or f.is_dir() or f.suffix == '.pyc':
            continue
        # 같은 내용이면 같은 zip 이 나오도록 시각을 고정한다
        zi = zipfile.ZipInfo(str(f.relative_to(site)).replace('\\', '/'), date_time=(2024, 1, 1, 0, 0, 0))
        zi.compress_type = zipfile.ZIP_DEFLATED
        z.writestr(zi, f.read_bytes())
        n += 1
    # BSD-3-Clause — 다시 나눠 줄 때 라이선스 전문을 함께 넣어야 한다
    zi = zipfile.ZipInfo(f'seaborn-{VERSION}.dist-info/LICENSE.md', date_time=(2024, 1, 1, 0, 0, 0))
    zi.compress_type = zipfile.ZIP_DEFLATED
    z.writestr(zi, (info / 'LICENSE.md').read_bytes())
print(f'{out.name}: 파일 {n}개 · {out.stat().st_size / 1024:.0f}KB')
