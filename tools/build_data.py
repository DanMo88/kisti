#!/usr/bin/env python3
"""Build js/data-{op,pa,av}.js from tools/content/*.py + derived stroke models. Every sign, word, sentence and text line gets
a Persian-letter reading (`pr`, «خوانش») from tools/reading.py.
Run: python3 tools/build_data.py  (needs /tmp/v3/op_auto.json, pa_auto.json, av_auto.json or tools/models/*.json)"""
import json, os, sys, unicodedata, shutil
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'content'))
import op, pa, av
sys.path.insert(0, os.path.join(ROOT, 'tools'))
from reading import phrase_fa
MOD = os.path.join(ROOT, 'tools', 'models')
def model(name): return json.load(open(os.path.join(MOD, name + '.json')))
def r3(x): return round(x, 3)

# ---------------- Old Persian ----------------
OPW = model('op')
OPW['0x103b8'] = [{'t': 'h', 'x': .09, 'y': .32, 'len': .42, 'w': .19}, {'t': 'h', 'x': .2, 'y': .54, 'len': .2, 'w': .17}, {'t': 'h', 'x': .1, 'y': .74, 'len': .42, 'w': .19},
                  {'t': 'w', 'x': .39, 'y': .52, 'len': .36, 'w': .75}, {'t': 'h', 'x': .66, 'y': .53, 'len': .24, 'w': .17}]   # mu
OPW['0x103bb'] = [{'t': 'h', 'x': .14, 'y': .28, 'len': .74, 'w': .19}, {'t': 'v', 'x': .49, 'y': .09, 'len': .36, 'w': .17},
                  {'t': 'v', 'x': .35, 'y': .47, 'len': .42, 'w': .19}, {'t': 'v', 'x': .67, 'y': .47, 'len': .42, 'w': .19}]   # vi
OPW['0x103bd'] = [{'t': 'h', 'x': .08, 'y': .54, 'len': .3, 'w': .17}, {'t': 'w', 'x': .37, 'y': .54, 'len': .38, 'w': .8}, {'t': 'w', 'x': .58, 'y': .54, 'len': .3, 'w': .8}]  # ru
def opid(i): return op.ID.get(i, i)
NUM_FA = {'1': 'یک', '2': 'دو', '3': 'سه', '4': 'چهار', '10': 'دَه', '20': 'بیست', '100': 'صد', '1000': 'هزار'}
def op_sign_pr(i, tr, fa, kind):
    if kind == 'logo': return phrase_fa(tr.split(' · ')[1], 'op')
    if kind == 'div': return '(خوانده نمی‌شود)'
    if kind == 'num': return NUM_FA[tr]
    return fa.replace(' (چَ؟)', '')
def opg(i): return chr(op.CP[i])
def build_op():
    les_of = {}
    for n, (t, ids) in enumerate(op.LESSONS): 
        for i in ids: les_of[i] = n + 1
    signs = []
    for (i, tr, fa, say, hint, text) in op.SIGNS:
        kind = 'logo' if i[:1].isupper() else 'num' if i[:1] == 'n' and i[1:].isdigit() else 'div' if i == 'div' else 'sign'
        m = None if i in op.NOMASHQ else OPW['0x%x' % op.CP[i]]
        signs.append({'id': opid(i), 'g': opg(i), 'tr': tr, 'fa': fa, 'pr': op_sign_pr(i, tr, fa, kind), 'hint': hint, 'text': text, 'kind': kind, 'lesson': les_of[i], 'm': m})
    lessons = [{'n': n + 1, 'title': t, 'signs': [opid(i) for i in ids], 'mashq': any(i not in op.NOMASHQ for i in ids)} for n, (t, ids) in enumerate(op.LESSONS)]
    lex = {}
    for k, (syl, tr, fa, say, today) in op.LEX.items():
        ids = syl.split('-'); assert all(i in op.CP for i in ids), (k, syl)
        lex[k] = {'s': [opid(i) for i in ids], 'g': ''.join(opg(i) for i in ids), 'tr': tr, 'fa': fa, 'today': today, 'pr': phrase_fa(tr, 'op')}
    return signs, lessons, lex
# ---------------- Pahlavi ----------------
def pa_letters(tl):
    out = []
    for ch in tl:
        if ch == ' ': continue
        out.append(pa.TL[ch])
    return out
def build_pa():
    les_of = {}
    for n, (t, ids) in enumerate(pa.LESSONS):
        for i in ids: les_of[i] = n + 1
    PM = model('pa')
    signs = []
    for (i, tr, fa, say, hint, text) in pa.SIGNS:
        mm = PM['0x%x' % pa.CP[i]]
        signs.append({'id': i, 'g': chr(pa.CP[i]), 'tr': tr, 'fa': fa, 'hint': hint, 'text': text, 'kind': 'num' if i[0] == 'p' and i[1:].isdigit() else 'sign',
                      'pr': fa, 'lesson': les_of[i], 'm': {'s': mm['s'], 'w': mm['w']}})
    for (i, tl, reading, meaning, say, text) in pa.HZ:
        ls = pa_letters(tl)
        signs.append({'id': i, 'g': ''.join(chr(pa.CP[x]) for x in ls) if ' ' not in tl else ' '.join(''.join(chr(pa.CP[pa.TL[c]]) for c in w) for w in tl.split(' ')),
                      'tr': tl, 'fa': meaning, 'read': reading, 'hint': text, 'text': text, 'kind': 'hz', 'pr': phrase_fa(reading, 'pa'), 'lesson': les_of[i], 'm': None})
    lessons = [{'n': n + 1, 'title': t, 'signs': ids, 'mashq': not ids[0].startswith('hz')} for n, (t, ids) in enumerate(pa.LESSONS)]
    lex = {}
    for k, (tl, reading, fa, say, today) in pa.LEX.items():
        ls = pa_letters(tl)
        lex[k] = {'s': ls, 'g': ''.join(chr(pa.CP[x]) for x in ls), 'tr': tl, 'read': reading, 'fa': fa, 'today': today, 'hz': any(c.isupper() for c in tl), 'pr': phrase_fa(reading, 'pa')}
    return signs, lessons, lex
# ---------------- Avestan ----------------
AVSYM = sorted([(unicodedata.normalize('NFD', s), i) for (i, s, c) in av.L], key=lambda x: -len(x[0]))
AVCP = {i: c for (i, s, c) in av.L}
def av_letters(tl):
    s = unicodedata.normalize('NFD', tl); out = []; p = 0
    while p < len(s):
        for sym, i in AVSYM:
            if s.startswith(sym, p):
                # don't let a bare base letter swallow a following combining mark we failed to match
                out.append(i); p += len(sym); break
        else: raise ValueError('avestan: cannot parse %r at %d in %r' % (s[p], p, tl))
    # sanity: no stray combining marks were silently dropped
    assert unicodedata.normalize('NFD', ''.join(dict((i, s) for (i, s, c) in av.L)[x] for x in out)) == s, (tl, out)
    return out
def build_av():
    les_of = {}
    for n, (t, ids) in enumerate(av.LESSONS):
        for i in ids: les_of[i] = n + 1
    AM = model('av')
    signs = []
    for (i, sym, cp) in av.L:
        fa, say, hint, text = av.INFO[i]; mm = AM['0x%x' % cp]
        signs.append({'id': i, 'g': chr(cp), 'tr': sym, 'fa': fa, 'pr': phrase_fa(sym, 'av'), 'hint': hint, 'text': text, 'kind': 'sign', 'lesson': les_of[i],
                      'm': {'s': mm['s'], 'w': mm['w']}})
    order = {i: k for k, (t, ids) in enumerate(av.LESSONS) for i in ids}
    signs.sort(key=lambda s: (s['lesson'], av.LESSONS[s['lesson'] - 1][1].index(s['id'])))
    lessons = [{'n': n + 1, 'title': t, 'signs': ids, 'mashq': True} for n, (t, ids) in enumerate(av.LESSONS)]
    lex = {}
    for k, (tl, fa, say, today) in av.LEX.items():
        ls = av_letters(tl)
        lex[k] = {'s': ls, 'g': ''.join(chr(AVCP[x]) for x in ls), 'tr': tl, 'fa': fa, 'today': today, 'pr': phrase_fa(tl, 'av')}
    return signs, lessons, lex

def common(mod, sid, signs, lessons, lex, meta):
    words = []
    for w in mod.WORDS:
        k, note = w[0], w[1]
        L = lex[k]; words.append({'id': k, 'note': note})
    sents = [{'w': s[0], 'fa': s[1], 'ref': s[2], 'grammar': s[3], 'pr': ' '.join(lex[k]['pr'] for k in s[0])} for n, s in enumerate(mod.SENTENCES)]
    texts = []
    for t in mod.TEXTS:
        tt = {k: v for k, v in t.items() if k != 'lines'}
        tt['lines'] = [{'w': l[0], 'fa': l[1], 'pr': ' '.join(lex[k]['pr'] for k in l[0])} for n, l in enumerate(t['lines'])]
        for l in t['lines']:
            for k in l[0]: assert k in lex, (sid, t['id'], k)
        texts.append(tt)
    for s in mod.SENTENCES:
        for k in s[0]: assert k in lex, (sid, k)
    d = dict(meta); d.update({'id': sid, 'about': mod.ABOUT, 'signs': signs, 'lessons': lessons, 'lex': lex, 'words': words, 'sentences': sents, 'texts': texts})
    return d

META = {
 'op': {'name': 'میخی پارسی باستان', 'short': 'میخی', 'latin': 'Old Persian cuneiform', 'dir': 'ltr', 'cls': 'cu', 'div': '\U000103D0', 'era': 'هخامنشی · ۵۲۰–۳۳۰ پ.م.',
        'img': 'images/darius.webp', 'mascot': 'دبیر کوچک تخت جمشید', 'unit': 'نشانه'},
 'pa': {'name': 'پهلوی کتیبه‌ای', 'short': 'پهلوی', 'latin': 'Inscriptional Pahlavi', 'dir': 'rtl', 'cls': 'pa', 'div': ' ', 'era': 'ساسانی · سدهٔ ۳ و ۴ م.',
        'img': 'images/shapur.webp', 'mascot': 'دبیر کوچک ساسانی', 'unit': 'حرف'},
 'av': {'name': 'دین‌دبیره (اوستایی)', 'short': 'اوستایی', 'latin': 'Avestan', 'dir': 'rtl', 'cls': 'av', 'div': '\u2E31', 'era': 'ساسانی · برای متن‌های کهن‌تر',
        'img': 'images/zoroaster.webp', 'mascot': 'موبد کوچک', 'unit': 'حرف'},
}
def main():
    out = {}
    out['op'] = common(op, 'op', *build_op(), META['op'])
    out['pa'] = common(pa, 'pa', *build_pa(), META['pa'])
    out['av'] = common(av, 'av', *build_av(), META['av'])
    for sid, d in out.items():
        js = 'window.KISTI_S = window.KISTI_S || {};\nwindow.KISTI_S.%s = %s;\n' % (sid, json.dumps(d, ensure_ascii=False, separators=(',', ':')))
        open(os.path.join(ROOT, 'js', 'data-%s.js' % sid), 'w', encoding='utf-8').write(js)
        print(sid, 'lessons', len(d['lessons']), 'signs', len(d['signs']), 'lex', len(d['lex']), 'words', len(d['words']), 'sents', len(d['sentences']),
              'texts', len(d['texts']), 'lines', sum(len(t['lines']) for t in d['texts']), 'bytes', len(js.encode()))
main()
