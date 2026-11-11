/* Kisti — sample content: Old Persian cuneiform, Lesson 1.
   Spellings follow the standard editions (Kent 1953; Schmitt 2009). Unicode block U+103A0–U+103DF. */
window.KISTI = {
  signs: [
    { id: 'a', lesson: 1, hint: 'یک سقف روی سه ستون، مثل ایوانِ تخت جمشید. سه ستون = «آ»، بزرگ‌ترین و نخستین نشانه.',  g: '\u{103A0}', tr: 'a / ā', fa: 'اَ / آ', audio: 'audio/s-a.mp3',
      shape: 'یک میخ افقی در بالا و سه میخ ایستاده در زیر آن.',
      text: 'نخستین نشانهٔ این خط. آوای «اَ» را می‌دهد. وقتی پشتِ یک نشانهٔ هم‌خوان بیاید، آن را کشیده می‌کند و «آ» می‌شود؛ مثلاً 𐎱 (پَ) + 𐎠 = «پا».' },
    { id: 'i', lesson: 1, hint: 'دو میخ افقی کنار هم مثل دو ابروی بالا رفته که می‌گویند «ایی!»، روی دو ستون.',  g: '\u{103A1}', tr: 'i / ī', fa: 'اِ / ای', audio: 'audio/s-i.mp3',
      shape: 'دو میخ افقی کنار هم در بالا و دو میخ ایستاده در زیر آن.',
      text: 'آوای «ای» (یا «اِ» کوتاه). هم در آغاز واژه می‌آید و هم پس از هم‌خوان؛ مثلاً در imam یعنی «این را».' },
    { id: 'u', lesson: 1, hint: 'گوشه‌میخ مثل دهانی باز است که می‌گوید «او». بعد یک سقف کوچک روی دو ستون.',  g: '\u{103A2}', tr: 'u / ū', fa: 'اُ / او', audio: 'audio/s-u.mp3',
      shape: 'یک «گوشه‌میخ» (مثل یک زاویه) در چپ، و یک میخ افقی با دو میخ ایستاده در راستِ آن.',
      text: 'آوای «او» (یا «اُ» کوتاه). در نام داریوش، Dārayavauš، همین نشانه پیش از «ش» پایانی می‌آید.' },
    { id: 'da', lesson: 1, hint: 'مثل 𐎠 است اما با «دو» ستون. «دو» با «د» شروع می‌شود: دو ستون = «دَ».', g: '\u{103AD}', tr: 'da', fa: 'دَ', audio: 'audio/s-da.mp3',
      shape: 'یک میخ افقی در بالا و دو میخ ایستاده در زیر آن. با 𐎠 اشتباه نگیر: 𐎠 سه میخ ایستاده دارد، 𐎭 دو تا.',
      text: 'هم‌خوان «د» همراه با یک «اَ»ی پنهان: «دَ». اگر واکه‌ای پس از آن خوانده نشود، فقط «د» است. نخستین نشانهٔ نام داریوش.' },
    { id: 'ma', lesson: 1, hint: 'یک میخ کوچک افقی از چپ به سه ستون «اشاره» می‌کند؛ ستون وسط کوتاه است. «مَ» مثل «مادر».', g: '\u{103B6}', tr: 'ma', fa: 'مَ', audio: 'audio/s-ma.mp3',
      shape: 'یک میخ افقی کوچک در چپ و سه میخ ایستاده (میخ میانی کوتاه‌تر).',
      text: 'هجای «مَ». در پایان واژهٔ adam (من) همین نشانه نوشته می‌شود اما فقط «م» خوانده می‌شود؛ چون خط میخی هم‌خوانِ تنها ندارد.' },
    { id: 'pa', lesson: 2, hint: 'سه میخ افقی روی هم و دو پایهٔ کوچک.', g: '\u{103B1}', tr: 'pa', fa: 'پَ', audio: 'audio/s-pa.mp3',
      shape: 'سه میخ افقی روی هم و دو میخ ایستادهٔ کوچک در پایین.',
      text: 'هجای «پَ». نخستین نشانهٔ واژهٔ Pārsa، یعنی «پارس».' },
    { id: 'ra', lesson: 2, hint: 'سه میخ افقی و یک ستون بلند در راست.', g: '\u{103BC}', tr: 'ra', fa: 'رَ', audio: 'audio/s-ra.mp3',
      shape: 'سه میخ افقی روی هم و یک میخ ایستادهٔ بلند در راستِ آن‌ها.',
      text: 'هجای «رَ». در Pārsa و Dārayavauš می‌آید.' },
    { id: 'sa', lesson: 2, hint: 'یک ستون بلند در چپ و سه میخ افقی؛ وارونهٔ 𐎼.', g: '\u{103BF}', tr: 'sa', fa: 'سَ', audio: 'audio/s-sa.mp3',
      shape: 'یک میخ ایستادهٔ بلند در چپ و سه میخ افقی در راستِ آن؛ وارونهٔ 𐎼.',
      text: 'هجای «سَ». آخرین نشانهٔ Pārsa؛ در pasā (پس) هم می‌آید.' }
  ],
  words: [
    { id: 'adam', signs: ['a', 'da', 'ma'], tr: 'adam', fa: 'من', say: 'اَدَم', audio: 'audio/w-adam.mp3',
      note: '«𐎶» در پایان، فقط «م» خوانده می‌شود: a-d(a)-m(a).',
      today: 'در فارسی امروز «من» داریم که از شکل دیگرِ همین ضمیر، manā (از من / مالِ من)، آمده است.' },
    { id: 'parsa', signs: ['pa', 'a', 'ra', 'sa'], tr: 'Pārsa', fa: 'پارس (سرزمین و مردم پارس)', say: 'پارسَ', audio: 'audio/w-parsa.mp3',
      note: '𐎱 + 𐎠 = «پا» (آ کشیده). بعد «ر» و «سَ».',
      today: 'پارس و فارس؛ نام «پارسی» و «فارسی» هم از همین واژه است.' },
    { id: 'pasa', signs: ['pa', 'sa', 'a'], tr: 'pasā', fa: 'پس، پس از', say: 'پَسا', audio: 'audio/w-pasa.mp3',
      note: '𐎿 + 𐎠 = «سا». در کتیبه‌ها مثلاً pasā manā یعنی «پس از من».',
      today: '«پس» در فارسی امروز.' },
    { id: 'imam', signs: ['i', 'ma', 'ma'], tr: 'imam', fa: 'این (را)', say: 'ایمَم', audio: 'audio/w-imam.mp3',
      note: 'دو بار 𐎶: «ایمَ» + «م». در کتیبهٔ کاخ تچر: imam tacaram «این کاخ را».',
      today: 'ضمیر اشاره‌ای که در کتیبه‌ها بسیار تکرار می‌شود.' }
  ],
  /* inscription words: cuneiform, transliteration, Persian gloss, modern descendant */
  lex: {
    adam:          { g: '𐎠𐎭𐎶', tr: 'adam', fa: 'من', audio: 'audio/w-adam.mp3' },
    darayavaush:   { g: '𐎭𐎠𐎼𐎹𐎺𐎢𐏁', tr: 'Dārayavauš', fa: 'داریوش', today: 'داریوش؛ به معنی «نگه‌دارندهٔ نیکی»', audio: 'audio/w-darayavaush.mp3' },
    xshayathiya:   { g: '𐎧𐏁𐎠𐎹𐎰𐎡𐎹', tr: 'xšāyaθiya', fa: 'شاه', today: 'شاه (در پهلوی: šāh)', audio: 'audio/w-xshayathiya.mp3' },
    vazraka:       { g: '𐎺𐏀𐎼𐎣', tr: 'vazraka', fa: 'بزرگ', today: 'بزرگ (در پهلوی: wuzurg)', audio: 'audio/w-vazraka.mp3' },
    xshayathiyanam:{ g: '𐎧𐏁𐎠𐎹𐎰𐎡𐎹𐎠𐎴𐎠𐎶', tr: 'xšāyaθiyānām', fa: 'شاهانِ', today: 'پسوند ‎-ānām‎ مانند «ـانِ» امروزی است: شاهِ شاهان', audio: 'audio/w-xshayathiyanam.mp3' },
    parsaiy:       { g: '𐎱𐎠𐎼𐎿𐎡𐎹', tr: 'Pārsaiy', fa: 'در پارس', today: 'پسوند ‎-aiy‎ یعنی «در»', audio: 'audio/w-parsaiy.mp3' },
    dahyunam:      { g: '𐎭𐏃𐎹𐎢𐎴𐎠𐎶', tr: 'dahyūnām', fa: 'سرزمین‌هایِ', today: 'dahyu (سرزمین) ← «ده» در فارسی امروز', audio: 'audio/w-dahyunam.mp3' },
    vishtaspahya:  { g: '𐎻𐎡𐏁𐎫𐎠𐎿𐎱𐏃𐎹𐎠', tr: 'Vištāspahyā', fa: 'ویشتاسپِ (پدرِ داریوش)', today: 'گشتاسپ / ویشتاسپ', audio: 'audio/w-vishtaspahya.mp3' },
    pusa:          { g: '𐎱𐎢𐏂', tr: 'puça', fa: 'پسر', today: 'پور، پسر', audio: 'audio/w-pusa.mp3' },
    arshamahya:    { g: '𐎠𐎼𐏁𐎠𐎶𐏃𐎹𐎠', tr: 'Aršāmahyā', fa: 'ارشامِ (پدربزرگ داریوش)', today: 'ارشام', audio: 'audio/w-arshamahya.mp3' },
    napa:          { g: '𐎴𐎱𐎠', tr: 'napā', fa: 'نوه', today: 'نوه، نبیره', audio: 'audio/w-napa.mp3' },
    haxamanishiya: { g: '𐏃𐎧𐎠𐎶𐎴𐎡𐏁𐎡𐎹', tr: 'Haxāmanišiya', fa: 'هخامنشی', today: 'هخامنشی، از خاندان هخامنش', audio: 'audio/w-haxamanishiya.mp3' }
  },
  sentence: {
    words: ['adam', 'darayavaush', 'xshayathiya', 'vazraka'],
    fa: 'من داریوش، شاه بزرگ (هستم).',
    grammar: [
      'در این جمله فعل «هستم» نیامده است. در پارسی باستان، مثل بسیاری از زبان‌های کهن، فعل «بودن» را می‌شد نیاورد.',
      'صفت پس از اسم می‌آید: xšāyaθiya vazraka یعنی «شاهِ بزرگ»؛ درست مانند فارسی امروز.',
      'میان واژه‌ها نشانهٔ جداکنندهٔ 𐏐 (یک میخ کج) نوشته می‌شود؛ این خط فاصله ندارد.'
    ]
  },
  inscription: {
    title: 'کتیبهٔ بیستون، بند ۱',
    ref: 'DB I 1–3 · ستون یکم، سطرهای ۱ تا ۳',
    about: 'داریوش بزرگ حدود ۵۲۰ پیش از میلاد این کتیبه را در دل کوه بیستون، نزدیک کرمانشاه، به سه زبان پارسی باستان، ایلامی و بابلی کَند. بند نخست، داریوش را با نام و تبارش معرفی می‌کند. هر سطر زیر یک «بخش معنایی» است، نه سطرِ اصلی روی سنگ.',
    lines: [
      { w: ['adam', 'darayavaush', 'xshayathiya', 'vazraka'], fa: 'من داریوشم، شاه بزرگ،', audio: 'audio/l-1.mp3' },
      { w: ['xshayathiya', 'xshayathiyanam'], fa: 'شاه شاهان،', audio: 'audio/l-2.mp3' },
      { w: ['xshayathiya', 'parsaiy'], fa: 'شاه در پارس،', audio: 'audio/l-3.mp3' },
      { w: ['xshayathiya', 'dahyunam'], fa: 'شاه سرزمین‌ها،', audio: 'audio/l-4.mp3' },
      { w: ['vishtaspahya', 'pusa'], fa: 'پسر ویشتاسپ،', audio: 'audio/l-5.mp3' },
      { w: ['arshamahya', 'napa'], fa: 'نوهٔ ارشام،', audio: 'audio/l-6.mp3' },
      { w: ['haxamanishiya'], fa: 'هخامنشی.', audio: 'audio/l-7.mp3' }
    ]
  },
  strokes: {"a": [{"t": "h", "x": 0.16, "y": 0.217, "len": 0.681, "w": 0.188}, {"t": "v", "x": 0.278, "y": 0.333, "len": 0.544, "w": 0.188}, {"t": "v", "x": 0.5, "y": 0.333, "len": 0.544, "w": 0.188}, {"t": "v", "x": 0.726, "y": 0.333, "len": 0.544, "w": 0.188}], "i": [{"t": "h", "x": 0.175, "y": 0.217, "len": 0.322, "w": 0.188}, {"t": "h", "x": 0.497, "y": 0.217, "len": 0.328, "w": 0.188}, {"t": "v", "x": 0.346, "y": 0.333, "len": 0.544, "w": 0.188}, {"t": "v", "x": 0.639, "y": 0.333, "len": 0.544, "w": 0.188}], "u": [{"t": "w", "x": 0.109, "y": 0.502, "len": 0.403, "w": 0.763}, {"t": "h", "x": 0.543, "y": 0.21, "len": 0.335, "w": 0.188}, {"t": "v", "x": 0.583, "y": 0.327, "len": 0.545, "w": 0.188}, {"t": "v", "x": 0.798, "y": 0.327, "len": 0.545, "w": 0.187}], "da": [{"t": "h", "x": 0.268, "y": 0.217, "len": 0.463, "w": 0.188}, {"t": "v", "x": 0.392, "y": 0.333, "len": 0.544, "w": 0.188}, {"t": "v", "x": 0.607, "y": 0.333, "len": 0.544, "w": 0.188}], "ma": [{"t": "h", "x": 0.104, "y": 0.512, "len": 0.274, "w": 0.188}, {"t": "v", "x": 0.444, "y": 0.131, "len": 0.737, "w": 0.188}, {"t": "v", "x": 0.627, "y": 0.319, "len": 0.545, "w": 0.187}, {"t": "v", "x": 0.802, "y": 0.131, "len": 0.737, "w": 0.188}]},
  lessons: [
    { n: 1, signs: ['a', 'i', 'u', 'da', 'ma'], title: 'نخستین نشانه‌ها', active: true },
    { n: 2, title: 'هم‌خوان‌های نخست' },
    { n: 3, title: 'ر، س و ش' }, { n: 4, title: 'هجاهای «اِ» و «اُ»' }, { n: 5, title: 'گ، ج و چ' },
    { n: 6, title: 'ن، و، ی' }, { n: 7, title: 'ز، ه، ث، ف' }, { n: 8, title: 'اندیشه‌نگارها و عددها' }
  ],
  parts: [
    { id: 'learn', name: 'یادگیری', desc: 'شکل، صدا و راز به‌یادسپاری', ic: '👁' },
    { id: 'mashq', name: 'مشق', desc: 'هر نشانه پنج بار با انگشت', ic: '✍' },
    { id: 'quiz', name: 'آزمونک', desc: 'شکل ← صدا، صدا ← شکل، نوشتن از حافظه', ic: '?' },
    { id: 'review', name: 'مرور', desc: 'مرور نشانه‌های پیشین', ic: '↺' }
  ],
  scripts: [
    { id: 'cuneiform', name: 'خط میخی هخامنشی', latin: 'Old Persian Cuneiform', sample: '𐎠𐎭𐎶', img: 'images/darius.webp', active: true,
      blurb: 'خط کتیبه‌های داریوش و خشایارشا؛ حدود ۵۲۰ تا ۳۳۰ پیش از میلاد.' },
    { id: 'pahlavi', name: 'خط پهلوی', latin: 'Pahlavi', img: 'images/shapur.webp', active: false,
      blurb: 'خط کتیبه‌های ساسانی و کتاب‌های پهلوی؛ از نقش رستم تا طاق کسری.' },
    { id: 'avestan', name: 'دین‌دبیره (اوستایی)', latin: 'Avestan', img: 'images/zoroaster.webp', active: false,
      blurb: 'خطی که موبدان ساسانی برای نوشتن اوستا و گاهان زرتشت ساختند.' }
  ],
  steps: [
    { id: 'words', n: 2, name: 'واژه‌سازی', desc: 'adam، Pārsa، pasā و imam', icon: '𐎠𐎭𐎶' },
    { id: 'sentence', n: 3, name: 'جمله‌سازی', desc: '«من داریوش، شاه بزرگ»', icon: '𐏐' },
    { id: 'inscription', n: 4, name: 'کتیبه‌خوانی', desc: 'بیستون، بند ۱', icon: '𐏋' }
  ],
  gallery: [
    { img: 'images/cyrus.webp', name: 'کوروش بزرگ در باغ پاسارگاد', era: 'هخامنشی' },
    { img: 'images/cyrus-tomb.webp', name: 'آرامگاه کوروش، پاسارگاد', era: 'هخامنشی' },
    { img: 'images/darius.webp', name: 'داریوش بزرگ در بیستون', era: 'هخامنشی' },
    { img: 'images/xerxes.webp', name: 'خشایارشا در آپادانا', era: 'هخامنشی' },
    { img: 'images/persepolis.webp', name: 'دروازهٔ ملل، تخت جمشید', era: 'هخامنشی' },
    { img: 'images/naqsh-rostam.webp', name: 'نقش رستم', era: 'هخامنشی و ساسانی' },
    { img: 'images/ardashir.webp', name: 'اردشیر بابکان', era: 'ساسانی' },
    { img: 'images/ardashir-palace.webp', name: 'کاخ اردشیر، فیروزآباد', era: 'ساسانی' },
    { img: 'images/shapur.webp', name: 'شاپور یکم', era: 'ساسانی' },
    { img: 'images/khosrow.webp', name: 'خسرو انوشیروان دادگر', era: 'ساسانی' },
    { img: 'images/taq-kasra.webp', name: 'طاق کسری، تیسفون', era: 'ساسانی' },
    { img: 'images/takht-soleyman.webp', name: 'تخت سلیمان (آذرگشنسپ)', era: 'ساسانی' },
    { img: 'images/zoroaster.webp', name: 'زرتشت', era: 'ایران کهن' }
  ]
};
