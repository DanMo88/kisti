"""Derive Old Persian wedge models (for mashq) from Noto Sans Old Persian outlines.
Each wedge in the font is its own closed contour; we classify it as vertical (v), horizontal (h)
or Winkelhaken (w) by its bounding box and where its wide 'head' is."""
import json, sys
from fontTools.ttLib import TTFont
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.basePen import BasePen

class Flat(BasePen):
    def __init__(s, gs): super().__init__(gs); s.c = []; s.cur = []
    def _moveTo(s, p): s.cur = [p]
    def _lineTo(s, p): s.cur.append(p)
    def _curveToOne(s, a, b, p):
        x0, y0 = s.cur[-1]
        for i in range(1, 9):
            t = i / 8; mt = 1 - t
            s.cur.append((mt**3*x0+3*mt*mt*t*a[0]+3*mt*t*t*b[0]+t**3*p[0], mt**3*y0+3*mt*mt*t*a[1]+3*mt*t*t*b[1]+t**3*p[1]))
    def _qCurveToOne(s, a, p):
        x0, y0 = s.cur[-1]
        for i in range(1, 7):
            t = i / 6; mt = 1 - t
            s.cur.append((mt*mt*x0+2*mt*t*a[0]+t*t*p[0], mt*mt*y0+2*mt*t*a[1]+t*t*p[1]))
    def _closePath(s): s.c.append(s.cur); s.cur = []
    _endPath = _closePath

def contours(font, cp):
    gs = font.getGlyphSet(); name = font.getBestCmap()[cp]; pen = Flat(gs); gs[name].draw(pen); return pen.c

def analyse(font, cp):
    cs = contours(font, cp)
    xs = [x for c in cs for x, y in c]; ys = [y for c in cs for x, y in c]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    S = max(x1 - x0, y1 - y0) / 0.8
    ox = 0.5 - (x1 - x0) / S / 2; oy = 0.5 - (y1 - y0) / S / 2
    N = lambda p: ((p[0] - x0) / S + ox, (y1 - p[1]) / S + oy)   # y down
    out = []
    for c in cs:
        P = [N(p) for p in c]; X = [p[0] for p in P]; Y = [p[1] for p in P]
        bx0, bx1, by0, by1 = min(X), max(X), min(Y), max(Y); w, h = bx1 - bx0, by1 - by0
        def width_at(frac, axis):   # thickness of the shape near one end along an axis
            if axis == 'y':
                lim = by0 + h * frac; pts = [p[0] for p in P if p[1] <= lim] if frac < .5 else [p[0] for p in P if p[1] >= by0 + h * frac]
            else:
                lim = bx0 + w * frac; pts = [p[1] for p in P if p[0] <= lim] if frac < .5 else [p[1] for p in P if p[0] >= bx0 + w * frac]
            return (max(pts) - min(pts)) if pts else 0
        r3 = lambda v: round(v, 3)
        if h > 1.5 * w:
            top, bot = width_at(.15, 'y'), width_at(.85, 'y')
            out.append({'t': 'v', 'x': r3((bx0 + bx1) / 2), 'y': r3(by0 if top >= bot else by0), 'len': r3(h), 'w': r3(w)})
        elif w > 1.5 * h:
            out.append({'t': 'h', 'x': r3(bx0), 'y': r3((by0 + by1) / 2), 'len': r3(w), 'w': r3(h)})
        else:
            # Winkelhaken '<': vertex = leftmost point
            lp = min(P, key=lambda p: p[0])
            out.append({'t': 'w', 'x': r3(lp[0]), 'y': r3(lp[1]), 'len': r3(w), 'w': r3(h), 'diag': r3(abs(lp[1] - (by0 + by1) / 2) / max(h, 1e-6))})
    # order: left→right, top→bottom (reading direction of cuneiform; teaching convention)
    out.sort(key=lambda d: (round(d['x'] / 0.12), d['y']))
    return out

if __name__ == '__main__':
    f = TTFont(sys.argv[1]); cps = [int(c, 16) for c in sys.argv[2:]]
    for cp in cps: print(hex(cp), json.dumps(analyse(f, cp)))
