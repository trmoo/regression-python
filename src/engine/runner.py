# © 2026 티쳐무 · 모든 권리 보유
# 셀 하나를 실행하는 파이썬 쪽 도우미 — 브라우저 일꾼(worker.js)과 node 의 기준 출력 만들기(tools/golden.mjs)가
# **이 파일 하나를 똑같이** 쓴다. 그래서 화면에 미리 실어 둔 결과와 학생이 직접 돌린 결과가 글자까지 같다.
#
# 하는 일
#   ① 레슨마다 변수 보관함(이름 공간)을 따로 둔다 — 코랩에서 노트북을 따로 여는 것과 같다
#   ② print 출력·경고·오류를 차례대로 모은다
#   ③ 마지막 줄이 식이면 코랩처럼 그 값을 보여 준다(표는 표로)
#   ④ 그린 그래프(matplotlib·seaborn)를 PNG 그림으로 받아 돌려준다 — 코랩의 그림 칸과 같다
#   ⑤ 채점에 쓸 변수 값을 짧은 「지문」으로 바꿔 돌려준다
import sys, io, ast, json, re, traceback, warnings, base64, hashlib

NS = {}
DPI = 80          # 그림 해상도 — 코랩 화면 크기와 비슷하게
_CUR = None       # 지금 실행 중인 셀의 출력 목록(plt.show( ) 가 그림을 여기에 넣는다)


def setup(seaborn_zip):
    """엔진이 켜질 때 한 번 — seaborn 풀기, 그림 그리는 방식 정하기, 무거운 라이브러리 미리 불러오기"""
    import os, zipfile
    pkgs = '/home/pyodide/.pkgs'
    os.makedirs(pkgs, exist_ok=True)
    with zipfile.ZipFile(seaborn_zip) as z:
        z.extractall(pkgs)
    if pkgs not in sys.path:
        sys.path.insert(0, pkgs)
    import matplotlib
    matplotlib.use('Agg')                       # 화면 없이 그림만 그리는 방식(일꾼 안에는 화면이 없다)
    import matplotlib.pyplot as plt
    plt.show = _plt_show                        # plt.show( ) 를 부르면 그 자리에서 그림을 내보낸다(코랩과 같은 차례)
    import numpy, pandas, seaborn, statsmodels.api  # noqa: F401
    import sklearn.linear_model, sklearn.model_selection, sklearn.metrics  # noqa: F401


class _Cap(io.TextIOBase):
    """print 가 쓰는 글자를 갈래(out·err)별로 차례대로 모은다"""

    def __init__(self, kind, items):
        self.kind, self.items = kind, items

    def writable(self):
        return True

    def write(self, s):
        if not s:
            return 0
        if self.items and self.items[-1]['kind'] == self.kind:
            self.items[-1]['text'] += s
        else:
            self.items.append({'kind': self.kind, 'text': s})
        return len(s)


_ADDR = re.compile(r' at 0x[0-9a-fA-F]+')


def _text(v):
    """값을 사람이 읽는 글자로 — 통계 결과 요약표(summary)는 표 글자 그대로"""
    if hasattr(v, 'as_text') and callable(v.as_text):
        return v.as_text()
    return _ADDR.sub('', repr(v))


def _flush_figs(items):
    """열려 있는 그림을 모두 PNG 로 받아 출력 목록에 넣고 닫는다"""
    import matplotlib.pyplot as plt
    for num in plt.get_fignums():
        fig = plt.figure(num)
        buf = io.BytesIO()
        with warnings.catch_warnings():
            warnings.simplefilter('ignore')     # 그림을 저장할 때 맷플롯립 속에서 나는 알림은 학생 코드와 상관없다
            fig.savefig(buf, format='png', dpi=DPI, bbox_inches='tight', facecolor='white', metadata={'Software': None})
        w, h = fig.get_size_inches() * DPI
        items.append({'kind': 'image', 'png': base64.b64encode(buf.getvalue()).decode('ascii'),
                      'text': f'<Figure size {w * 100 / DPI:.0f}x{h * 100 / DPI:.0f} with {len(fig.axes)} Axes>'})
    plt.close('all')


def _plt_show(*args, **kwargs):
    if _CUR is not None:
        _flush_figs(_CUR)


def _show(v, items):
    if v is None:
        return
    try:
        import pandas as pd
        if isinstance(v, pd.DataFrame):
            # 코랩(판다스 기본 설정)처럼 — 60줄이 넘으면 앞뒤 5줄씩만, 아래에 크기를 적는다
            mr = 10 if len(v) > 60 else None
            items.append({'kind': 'table', 'text': v.to_string(max_rows=mr, max_cols=20, show_dimensions='truncate'),
                          'html': v.to_html(max_rows=mr, max_cols=20, border=0, show_dimensions='truncate')})
            return
    except Exception:
        pass
    items.append({'kind': 'display', 'text': _text(v)})


def _digest(b):
    return hashlib.md5(b).hexdigest()[:16]


def _var(v):
    """채점용 변수 값 — 큰 표·배열은 통째로 견주지 않고 모양과 내용의 지문(md5)으로 바꾼다"""
    try:
        import pandas as pd, numpy as np
        if isinstance(v, pd.DataFrame):
            return f'DataFrame {v.shape} {list(v.columns)} {_digest(v.to_csv().encode())}'
        if isinstance(v, pd.Series):
            return f'Series {v.shape} {v.name} {_digest(v.to_csv().encode())}'
        if isinstance(v, np.ndarray):
            return f'ndarray {v.shape} {_digest(np.round(v.astype(float), 9).tobytes())}'
        if isinstance(v, pd.Index):
            return f'Index {list(v)}'
    except Exception:
        pass
    if hasattr(v, 'params') and hasattr(v, 'model'):          # statsmodels 결과
        return type(v).__name__ + '\n' + v.params.to_string()
    if hasattr(v, 'coef_') and hasattr(v, 'intercept_'):      # 학습한 scikit-learn 모델
        import numpy as np
        return f'{type(v).__name__} {np.round(v.coef_, 9).tolist()} {round(float(v.intercept_), 9)}'
    return _ADDR.sub('', repr(v))


def _error(e, code):
    lines = code.split('\n')
    frames = [f for f in traceback.extract_tb(e.__traceback__) if f.filename == '<cell>']
    if isinstance(e, SyntaxError) and e.filename == '<cell>':
        line = e.lineno
    else:
        line = frames[-1].lineno if frames else None
    src = lines[line - 1].strip() if line and 0 < line <= len(lines) else ''
    # 트레이스백은 학생 코드(<cell>)부터 — Pyodide·라이브러리 속살 앞부분은 걷어 낸다
    # ⚠ 파이썬 3.14 는 NameError 에 「혹시 이 이름?」 제안을 붙이려고 이름 공간을 뒤지는데,
    #   그 과정이 또 오류를 낼 수 있다. 그때는 제안 없이 간단히 만든다.
    try:
        full = ''.join(traceback.format_exception(type(e), e, e.__traceback__)).split('\n')
    except Exception:
        full = ['Traceback (most recent call last):'] + \
            [f'  File "{f.filename}", line {f.lineno}, in {f.name}' for f in traceback.extract_tb(e.__traceback__)] + \
            [f'{type(e).__name__}: {e}']
    start = next((i for i, l in enumerate(full) if '"<cell>"' in l), 1)
    trace = '\n'.join(['Traceback (most recent call last):'] + full[start:]).rstrip()
    msg = str(e) if not isinstance(e, SyntaxError) else (e.msg or '')
    return {'type': type(e).__name__, 'message': msg, 'line': line, 'source': src, 'trace': trace}


def run(ns_name, code, var_names_json='[]'):
    global _CUR
    ns = NS.setdefault(ns_name, {'__name__': '__main__'})
    items, error = [], None
    _CUR = items
    old = sys.stdout, sys.stderr
    sys.stdout, sys.stderr = _Cap('out', items), _Cap('err', items)
    try:
        with warnings.catch_warnings():
            # 같은 경고가 두 번째 실행부터 사라지면 결과가 들쭉날쭉해진다 — 늘 보여 준다
            warnings.simplefilter('always')
            # Pyodide(32비트 wasm)의 맷플롯립 3.10 이 글자를 그릴 때마다 내는 알림 — 코랩에서는 나오지 않는다
            warnings.filterwarnings('ignore', message=r'The [xy] parameter as float was deprecated')
            warnings.showwarning = lambda message, category, filename, lineno, file=None, line=None: \
                items.append({'kind': 'warn', 'text': f'{category.__name__}: {message}'})
            tree = ast.parse(code, '<cell>', 'exec')
            last = None
            if tree.body and isinstance(tree.body[-1], ast.Expr):
                last = ast.Expression(tree.body.pop().value)
            exec(compile(tree, '<cell>', 'exec'), ns)
            if last is not None:
                _show(eval(compile(last, '<cell>', 'eval'), ns), items)
    except BaseException as e:  # SystemExit·KeyboardInterrupt 도 셀 안에서 끝낸다
        error = _error(e, code)
    finally:
        sys.stdout, sys.stderr = old
        try:
            _flush_figs(items)      # 셀이 끝날 때 남은 그림을 내보낸다(코랩도 셀 끝에서 그린다)
        except Exception:
            pass
        _CUR = None
    names = json.loads(var_names_json)
    vars_ = {n: (_var(ns[n]) if n in ns else None) for n in names}
    return json.dumps({'items': items, 'error': error, 'vars': vars_}, ensure_ascii=False)


def reset(ns_name):
    NS.pop(ns_name, None)
    try:
        import matplotlib.pyplot as plt
        plt.close('all')
    except Exception:
        pass
