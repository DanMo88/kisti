# -*- coding: utf-8 -*-
"""Persian-letter readings («خوانش») from scholarly transliteration.
One rule set for all three languages so the conventions are identical everywhere:
  short a i u e o ə  -> harakat  َ  ِ  ُ  ِ  ُ  ِ      (word-initial: اَ اِ اُ اِ اُ اِ)
  long  ā ī ū        -> ا ی و                     (word-initial: آ ای او)
  long  ē ō          -> ِی ُو                     (word-initial: اِی اُو)
  å ā̊ -> ا (آ), ą -> َن, ą̇ -> ان;  second vowel of a diphthong/hiatus is carried by ئ (au -> َئو), except ai -> َی
  word-final short a -> َه (like Persian «خانه»), final short u/o -> و
  θ ث, x خ, š ش, č/c چ, j/ǰ ج, γ غ, δ ذ, ž ژ, ŋ نگ, xᵛ خو, m̨ هم, ç (Old Persian) ثر
Old Persian: Kent's orthographic -iy/-uv at word end are read ī/ū, -aiy as ai.
Avestan (Hoffmann): ii / uu before a vowel are the glides y / v."""
import re, unicodedata
N = lambda s: unicodedata.normalize('NFD', s)
CONS = {'k': 'ک', 'x': 'خ', 'x́': 'خ', 'xᵛ': 'خو', 'g': 'گ', 'ġ': 'گ', 'γ': 'غ', 'c': 'چ', 'č': 'چ', 'j': 'ج', 'ǰ': 'ج', 't': 'ت', 'θ': 'ث',
        'd': 'د', 'δ': 'ذ', 't̰': 'ت', 'p': 'پ', 'f': 'ف', 'b': 'ب', 'β': 'و', 'ŋ': 'نگ', 'ŋ́': 'نگ', 'ŋᵛ': 'نگو', 'n': 'ن', 'ń': 'ن', 'ṇ': 'ن',
        'm': 'م', 'm̨': 'هم', 'ẏ': 'ی', 'y': 'ی', 'v': 'و', 'w': 'و', 'r': 'ر', 'l': 'ل', 's': 'س', 'z': 'ز', 'š': 'ش', 'ž': 'ژ', 'š́': 'ش',
        'ṣ̌': 'ش', 'h': 'ه', 'ç': 'ثر'}
#            after consonant, word-initial, after a vowel
VOW = {'a': ('َ', 'اَ', 'ئَ'), 'ā': ('ا', 'آ', 'ئا'), 'å': ('ا', 'آ', 'ئا'), 'ā̊': ('ا', 'آ', 'ئا'),
       'i': ('ِ', 'اِ', 'ئی'), 'ī': ('ی', 'ای', 'ئی'), 'u': ('ُ', 'اُ', 'ئو'), 'ū': ('و', 'او', 'ئو'),
       'e': ('ِ', 'اِ', 'ئِ'), 'ē': ('ِی', 'اِی', 'ئِ'), 'o': ('ُ', 'اُ', 'ئو'), 'ō': ('ُو', 'اُو', 'ئو'),
       'ə': ('ِ', 'اِ', 'ئِ'), 'ə̄': ('ِ', 'اِ', 'ئِ'), 'ą': ('َن', 'اَن', 'ئَن'), 'ą̇': ('ان', 'آن', 'ئان')}
TOK = sorted([(N(k), 'C', k) for k in CONS] + [(N(k), 'V', k) for k in VOW] + [(N('ii'), 'II', 'ii'), (N('uu'), 'UU', 'uu')], key=lambda t: -len(t[0]))
def tokens(word):
    s = N(word.lower()); out = []; p = 0
    while p < len(s):
        if s[p] in "-.·'ʾ’": p += 1; continue
        for sym, kind, key in TOK:
            if s.startswith(sym, p): out.append((kind, key)); p += len(sym); break
        else: raise ValueError('reading: cannot parse %r in %r' % (s[p:], word))
    # Avestan glides: ii/uu before a vowel -> y/v; otherwise long ī/ū
    res = []
    for i, (k, v) in enumerate(out):
        nxt = out[i + 1][0] if i + 1 < len(out) else None
        if k == 'II': res.append(('C', 'y') if nxt == 'V' else ('V', 'ī'))
        elif k == 'UU': res.append(('C', 'v') if nxt == 'V' else ('V', 'ū'))
        else: res.append((k, v))
    return res
def word_fa(word, lang):
    w = word
    if lang == 'op':
        w = re.sub(r'aiy$', 'ai', w); w = re.sub(r'(?<=[^aāiīuū])iy$', 'ī', w); w = re.sub(r'(?<=[^aāiīuū])uv$', 'ū', w)
    t = tokens(w); o = []
    for i, (k, v) in enumerate(t):
        if k == 'C': o.append(CONS[v]); continue
        prev = t[i - 1] if i else None; last = i == len(t) - 1
        if prev is None: o.append(VOW[v][1])
        elif prev[0] == 'V':
            o.append('ی' if prev[1] == 'a' and v == 'i' else VOW[v][2])
        elif last and v == 'a': o.append('َ' if o and o[-1] == 'ه' else 'َه')
        elif last and v in ('u', 'o'): o.append('و')
        elif v == 'ą' and i + 1 < len(t) and t[i + 1] == ('C', 'm'): o.append('ا')
        else: o.append(VOW[v][0])
    return ''.join(o)
def phrase_fa(s, lang): return ' '.join(word_fa(w, lang) for w in s.split())
if __name__ == '__main__':
    import sys
    for w in sys.argv[2:]: print(w, '→', phrase_fa(w, sys.argv[1]))
