"""Derive pen-stroke centre lines (for mashq tracing) from a font's outlines:
render glyph → skeletonize → trace skeleton graph into polylines → merge smooth joins → simplify.
Output coordinates are in a unit square (y down), glyph fitted into 0.1..0.9."""
import json, sys, math
import numpy as np
from PIL import Image, ImageDraw
from skimage.morphology import skeletonize
sys.path.insert(0, 'tools')
from op_wedges import Flat
from fontTools.ttLib import TTFont

R = 240
def glyph_polys(font, cp):
    gs = font.getGlyphSet(); pen = Flat(gs); gs[font.getBestCmap()[cp]].draw(pen); return pen.c

def raster(font, cp):
    cs = glyph_polys(font, cp)
    xs = [x for c in cs for x, y in c]; ys = [y for c in cs for x, y in c]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    S = max(x1 - x0, y1 - y0) / 0.8
    ox = 0.5 - (x1 - x0) / S / 2; oy = 0.5 - (y1 - y0) / S / 2
    N = lambda p: (((p[0] - x0) / S + ox) * R, ((y1 - p[1]) / S + oy) * R)
    im = Image.new('L', (R, R), 0); d = ImageDraw.Draw(im)
    # even-odd fill via XOR of each contour
    acc = np.zeros((R, R), bool)
    for c in cs:
        m = Image.new('L', (R, R), 0); ImageDraw.Draw(m).polygon([N(p) for p in c], fill=255)
        acc ^= np.array(m) > 0
    return acc, [[N(p) for p in c] for c in cs]

NB = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]
def trace(sk):
    pts = set(zip(*np.nonzero(sk)))
    nb = lambda p: [(p[0] + a, p[1] + b) for a, b in NB if (p[0] + a, p[1] + b) in pts]
    deg = {p: len(nb(p)) for p in pts}
    nodes = {p for p in pts if deg[p] != 2}
    used = set(); paths = []
    def walk(a, b):
        path = [a, b]; used.add(frozenset((a, b)))
        while path[-1] not in nodes:
            cur = path[-1]; nxt = [q for q in nb(cur) if frozenset((cur, q)) not in used and q != path[-2]]
            if not nxt: break
            # prefer 4-neighbours to avoid diagonal shortcuts
            nxt.sort(key=lambda q: abs(q[0] - cur[0]) + abs(q[1] - cur[1]))
            q = nxt[0]; used.add(frozenset((cur, q))); path.append(q)
        return path
    for n in nodes:
        for q in nb(n):
            if frozenset((n, q)) not in used: paths.append(walk(n, q))
    # pure loops (no nodes)
    rest = [p for p in pts if deg[p] == 2 and not any(frozenset((p, q)) in used for q in nb(p))]
    while rest:
        s = rest[0]; q = nb(s)[0]; pth = walk(s, q); paths.append(pth); rest = [p for p in rest if not any(frozenset((p, q)) in used for q in nb(p))]
    return [[(c / R, r / R) for r, c in p] for p in paths]

def plen(p): return sum(math.dist(a, b) for a, b in zip(p, p[1:]))
def rdp(p, eps):
    if len(p) < 3: return p
    a, b = p[0], p[-1]; dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy) or 1e-9
    ds = [abs(dy * (q[0] - a[0]) - dx * (q[1] - a[1])) / L for q in p[1:-1]]
    i = max(range(len(ds)), key=lambda k: ds[k]) + 1
    if ds[i - 1] > eps: return rdp(p[:i + 1], eps)[:-1] + rdp(p[i:], eps)
    return [a, b]
def direction(p, end):
    if end == 0: a, b = p[0], p[min(len(p) - 1, 6)]
    else: a, b = p[-1], p[max(0, len(p) - 7)]
    return math.atan2(b[1] - a[1], b[0] - a[0])   # pointing *into* the path

def merge(paths, tol=0.03):
    changed = True
    while changed:
        changed = False
        best = None
        for i in range(len(paths)):
            for j in range(len(paths)):
                if i == j: continue
                for ei in (0, 1):
                    for ej in (0, 1):
                        pi = paths[i][-1 if ei else 0]; pj = paths[j][-1 if ej else 0]
                        if math.dist(pi, pj) > tol: continue
                        # continuing smoothly: direction into i at its end vs into j at its end should be opposite
                        ang = abs(((direction(paths[i], ei) - direction(paths[j], ej)) + math.pi) % (2 * math.pi) - math.pi)
                        dev = abs(math.pi - ang)
                        if dev < math.radians(50) and (best is None or dev < best[0]): best = (dev, i, j, ei, ej)
        if best:
            _, i, j, ei, ej = best
            a = paths[i] if ei else paths[i][::-1]; b = paths[j][::-1] if ej else paths[j]
            new = a + b[1:]; paths = [p for k, p in enumerate(paths) if k not in (i, j)] + [new]; changed = True
    return paths

def strokes(font, cp):
    acc, polys = raster(font, cp)
    sk = skeletonize(acc)
    ps = trace(sk)
    ps = [p for p in ps if plen(p) > 0.035 or len(ps) == 1]       # drop spurs
    ps = merge(ps)
    ps = [p for p in ps if plen(p) > 0.05 or len(ps) == 1]
    if len(ps) > 1: ps = [p for p in ps if plen(p) > 0.085] or ps
    out = []
    for p in ps:
        # writing direction convention (RTL scripts): start at the upper end; for flat strokes start at the right
        a, b = p[0], p[-1]
        if abs(a[1] - b[1]) > 0.08: start_top = a[1] > b[1]
        else: start_top = a[0] < b[0]
        if start_top: p = p[::-1]
        q = rdp(p, 0.008)
        out.append([[round(x, 3), round(y, 3)] for x, y in q])
    out.sort(key=lambda s: (-round(max(x for x, y in s) / 0.15), min(y for x, y in s)))
    thick = float(acc.sum()) / max(1, sk.sum()) / R      # mean stroke width (unit square)
    return out, round(thick, 3)

if __name__ == '__main__':
    f = TTFont(sys.argv[1]); lo, hi = int(sys.argv[2], 16), int(sys.argv[3], 16)
    res = {}
    for cp in sorted(f.getBestCmap()):
        if lo <= cp <= hi: s, t = strokes(f, cp); res[hex(cp)] = {'s': s, 'w': t}
    json.dump(res, open(sys.argv[4], 'w'))
    for k, v in res.items(): print(k, len(v['s']), v['w'], [len(s) for s in v['s']])
