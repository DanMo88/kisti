#!/usr/bin/env python3
"""Write js/data.js (shared: gallery, labels, tips, caveats, credits)."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def L(sid):
    s = open(os.path.join(ROOT, 'js', 'data-%s.js' % sid), encoding='utf-8').read()
    return json.loads(s.split('window.KISTI_S.%s = ' % sid, 1)[1].strip().rstrip(';'))
op, pa, av = L('op'), L('pa'), L('av')
sample = {'op': op['lex']['parsa']['g'], 'pa': pa['lex']['yran']['g'], 'av': av['lex']['ahura']['g']}
gallery = [
 ('images/cyrus.webp', 'کوروش بزرگ در باغ پاسارگاد', 'هخامنشی'), ('images/cyrus-tomb.webp', 'آرامگاه کوروش، پاسارگاد', 'هخامنشی'),
 ('images/darius.webp', 'داریوش بزرگ در بیستون', 'هخامنشی'), ('images/behistun.webp', 'کتیبهٔ بیستون و یک دبیر هخامنشی', 'هخامنشی'),
 ('images/xerxes.webp', 'خشایارشا در آپادانا', 'هخامنشی'), ('images/persepolis.webp', 'دروازهٔ ملل، تخت جمشید', 'هخامنشی'),
 ('images/naqsh-rostam.webp', 'نقش رستم', 'هخامنشی و ساسانی'), ('images/ardashir.webp', 'اردشیر بابکان', 'ساسانی'),
 ('images/ardashir-palace.webp', 'کاخ اردشیر، فیروزآباد', 'ساسانی'), ('images/shapur.webp', 'شاپور یکم', 'ساسانی'),
 ('images/scribe.webp', 'دبیر ساسانی', 'ساسانی'), ('images/khosrow.webp', 'خسرو انوشیروان دادگر', 'ساسانی'),
 ('images/taq-kasra.webp', 'طاق کسری، تیسفون', 'ساسانی'), ('images/takht-soleyman.webp', 'تخت سلیمان (آذرگشنسپ)', 'ساسانی'),
 ('images/zoroaster.webp', 'زرتشت', 'ایران کهن'), ('images/fire-temple.webp', 'موبد در آتشکده', 'ایران کهن')]
K = {
 'gallery': [{'img': a, 'name': b, 'era': c} for a, b, c in gallery],
 'sample': sample,
 'who': {'op': 'دبیران داریوش', 'pa': 'دبیران ساسانی', 'av': 'موبدانِ دین‌دبیره‌نویس'},
 'src': {'op': 'کتیبه‌های شاهی', 'pa': 'کتیبه‌های ساسانی', 'av': 'اوستا'},
 'readName': {'op': 'کتیبه‌خوانی', 'pa': 'کتیبه‌خوانی', 'av': 'خواندن اوستا'},
 'alt': {'op': 'images/behistun.webp', 'pa': 'images/scribe.webp', 'av': 'images/fire-temple.webp'},
 'tips': {
  'op': ['پسوند <span class="lat">‎-ānām‎</span> = «ـانِ» (جمع، وابستگی): xšāyaθiyānām = «شاهان».', 'پسوند <span class="lat">‎-ahyā‎</span> = کسرهٔ اضافه: Vištāspahyā puça = «پسرِ ویشتاسپ».', 'در برخی کتیبه‌ها «شاه» را با اندیشه‌نگار 𐏋 و «اهورامزدا» را با 𐏈 می‌نویسند.'],
  'pa': ['هزوارش‌ها (با حرف بزرگ: MLKʾ، BRE، MN) آرامی نوشته و پارسی خوانده می‌شوند.', 'واکه‌های کوتاه نوشته نمی‌شوند؛ ʾyrʾn را «Ērān» بخوان.', 'حرف 𐭥 هم w است و هم r؛ از روی واژه می‌فهمیم کدام است.'],
  'av': ['همهٔ واکه‌ها نوشته می‌شوند؛ پس اوستا را همان‌طور که نوشته شده بخوان.', 'میان واژه‌ها نقطهٔ جداکننده ⸱ می‌آید.', 'ii و uu میان واژه همان «یِ» و «وِ» هستند: hiiat̰، uruuan.']},
 'caveat': {
  'op': 'تلفظ پارسی باستان بازسازی است؛ صداهای این اپ با صدای فارسی امروز ساخته شده و تقریبی‌اند. ترتیب میخ‌ها در مشق یک قرارداد آموزشی است.',
  'pa': 'خط پهلوی کتیبه‌ای حرف‌های هم‌شکل دارد (w و r یکی‌اند) و واکه‌های کوتاه را نمی‌نویسد؛ خوانش‌ها بر پایهٔ MacKenzie است. متن پارسی میانهٔ کعبهٔ زرتشت آسیب دیده و سرآغازش با کمک نسخه‌های دیگر خوانده می‌شود. ترتیب کشش‌ها در مشق از شکل قلم گرفته شده و قرارداد آموزشی است.',
  'av': 'آوانویسی به شیوهٔ هوفمان است؛ املای واژه‌ها در ویرایش‌ها و دست‌نوشته‌ها اندکی فرق دارد. ترجمهٔ گاهان بسیار محل بحث است و برگردان‌های این اپ ساده‌شده‌اند. صداها تقریبی‌اند.'},
 'credits': [
  '<p><b>تصویرها:</b> همهٔ تصویرها نقاشی‌های تازه‌اند (به سبک کتاب‌های <span class="en">Dutch in 90 Days</span>) که برای Kisti ساخته شده‌اند؛ عکس واقعی نیستند و جزئیات لباس و بناها بازسازی هنری است.</p><p><b>صداها:</b> با صدای مصنوعی فارسی <span class="en">(fa-IR-FaridNeural)</span> ساخته شده‌اند و بازسازی تقریبیِ تلفظ کهن‌اند، نه ضبط واقعی.</p><p><b>قلم‌ها (SIL Open Font License):</b></p><ul class="en"><li>Noto Sans Old Persian, Inscriptional Pahlavi, Avestan</li><li>Vazirmatn (Saber Rastikerdar)</li><li>Fredoka, Alegreya</li></ul>',
  '<p><b>میخی پارسی باستان:</b> متن و املا بر پایهٔ <span class="en">R. G. Kent, Old Persian (1953)</span> و <span class="en">R. Schmitt, Die altpersischen Inschriften der Achaimeniden (2009)</span>؛ نام بندها به شیوهٔ کنت است (DB، DNa، XPa، DPd، CMa).</p><p class="muted">کتیبهٔ CMa در پاسارگاد به نام کوروش است، اما احتمالاً در روزگار داریوش نوشته شده است.</p><p><b>پهلوی:</b> واژه‌ها و خوانش‌ها بر پایهٔ <span class="en">D. N. MacKenzie, A Concise Pahlavi Dictionary (1971)</span>؛ کتیبه‌ها بر پایهٔ <span class="en">M. Back (1978)</span> و <span class="en">P. Huyse (1999)</span>.</p>',
  '<p><b>اوستا:</b> آوانویسی به شیوهٔ <span class="en">K. Hoffmann &amp; B. Forssman (2004)</span>؛ متن‌ها از ویرایش <span class="en">K. F. Geldner</span> (یسنا ۲۷.۱۳، ۲۷.۱۴، ۲۸.۱). برگردان‌ها ساده‌شده‌اند.</p><p><b>بازسازی‌ها:</b> هر جا متن آسیب‌دیده یا بازسازی‌شده بوده، در خود اپ گفته‌ایم؛ سطری را که از درستی‌اش مطمئن نبودیم نیاورده‌ایم.</p><p><b>مشق:</b> الگوها از روی خودِ قلم‌ها گرفته شده؛ ترتیب و جهت کشش‌ها قراردادی آموزشی است.</p>']
}
open(os.path.join(ROOT, 'js', 'data.js'), 'w', encoding='utf-8').write('/* Kisti v4 · shared data (gallery, labels, credits). Script data: data-op.js, data-pa.js, data-av.js (tools/build_data.py). */\nwindow.KISTI = ' + json.dumps(K, ensure_ascii=False, indent=1) + ';\n')
print(sample)
