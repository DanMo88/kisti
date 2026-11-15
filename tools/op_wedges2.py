import json, sys, math
sys.path.insert(0, 'tools')
from op_wedges import Flat, contours
from fontTools.ttLib import TTFont

def cross_extent(P, axis, v):
    """extent of polygon P across the line axis=v (axis 'x': vertical line x=v → y extent)."""
    hits = []
    n = len(P)
    for i in range(n):
        a, b = P[i], P[(i + 1) % n]
        if axis == 'x':
            if (a[0] - v) * (b[0] - v) <= 0 and a[0] != b[0]:
                t = (v - a[0]) / (b[0] - a[0]); hits.append(a[1] + t * (b[1] - a[1]))
        else:
            if (a[1] - v) * (b[1] - v) <= 0 and a[1] != b[1]:
                t = (v - a[1]) / (b[1] - a[1]); hits.append(a[0] + t * (b[0] - a[0]))
    return (max(hits) - min(hits)) if len(hits) >= 2 else 0

def profile(P, axis, lo, hi, n=24):
    return [(lo + (hi - lo) * (i + .5) / n, cross_extent(P, axis, lo + (hi - lo) * (i + .5) / n)) for i in range(n)]

def split_points(prof):
    """indices where profile dips then rises again strongly → merged wedges"""
    vals = [v for _, v in prof]; cuts = []
    for i in range(2, len(vals) - 2):
        if vals[i] <= vals[i - 1] and vals[i] <= vals[i + 1]:
            after = max(vals[i + 1:i + 5]); before = max(vals[max(0, i - 6):i])
            if after > 1.5 * vals[i] + 0.01 and before > 1.5 * vals[i] + 0.01: cuts.append(prof[i][0])
    return cuts

def norm(font, cp):
    cs = contours(font, cp)
    xs = [x for c in cs for x, y in c]; ys = [y for c in cs for x, y in c]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    S = max(x1 - x0, y1 - y0) / 0.8
    ox = 0.5 - (x1 - x0) / S / 2; oy = 0.5 - (y1 - y0) / S / 2
    return [[((p[0] - x0) / S + ox, (y1 - p[1]) / S + oy) for p in c] for c in cs]

def wedges_of(P):
    X = [p[0] for p in P]; Y = [p[1] for p in P]
    bx0, bx1, by0, by1 = min(X), max(X), min(Y), max(Y); w, h = bx1 - bx0, by1 - by0
    r3 = lambda v: round(v, 3)
    px = profile(P, 'x', bx0, bx1); py = profile(P, 'y', by0, by1)
    tx_l = max(v for _, v in px[:4]); tx_r = max(v for _, v in px[-4:])
    if tx_r > 1.7 * tx_l and h > 0.12:      # opening on the right → Winkelhaken '<'
        lp = min(P, key=lambda p: p[0])
        return [{'t': 'w', 'x': r3(bx0), 'y': r3(lp[1]), 'len': r3(w), 'w': r3(h)}]
    if h >= w:
        cuts = split_points(py)
        if cuts:
            out = []; edges = [by0] + cuts + [by1]
            for a, b in zip(edges, edges[1:]): out.append({'t': 'v', 'x': r3((bx0 + bx1) / 2), 'y': r3(a), 'len': r3(b - a), 'w': r3(w)})
            return out
        return [{'t': 'v', 'x': r3((bx0 + bx1) / 2), 'y': r3(by0), 'len': r3(h), 'w': r3(w)}]
    cuts = split_points(px)
    if cuts:
        out = []; edges = [bx0] + cuts + [bx1]
        for a, b in zip(edges, edges[1:]): out.append({'t': 'h', 'x': r3(a), 'y': r3((by0 + by1) / 2), 'len': r3(b - a), 'w': r3(h)})
        return out
    return [{'t': 'h', 'x': r3(bx0), 'y': r3((by0 + by1) / 2), 'len': r3(w), 'w': r3(h)}]

def analyse(font, cp):
    out = []
    for P in norm(font, cp): out += wedges_of(P)
    out.sort(key=lambda d: (round(d['x'] / 0.1), d['y']))
    return out

if __name__ == '__main__':
    f = TTFont('fonts/NotoSansOldPersian-Regular.woff2')
    cps = [c for c in f.getBestCmap() if c >= 0x103A0]
    res = {hex(c): analyse(f, c) for c in cps}
    json.dump(res, open('/tmp/v3/op_auto.json', 'w'))
    for k, v in res.items(): print(k, len(v), ' '.join(d['t'] + ('%.2f' % d['w']) for d in v))
