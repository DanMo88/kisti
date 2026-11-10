"""Download Wikimedia Commons images, save compressed WebP to images/, write data/credits.json."""
import json, urllib.request, urllib.parse, re, io, time, os
from PIL import Image
UA={'User-Agent':'KistiApp/1.0 (https://danmo88.github.io/kisti/; educational)'}
IMGS_ALL = {
 'behistun': ('File:Behistun inscription reliefs.jpg', 1400),
 'darius-behistun': ('File:Behistun Darius the Great.jpg', 900),
 'apadana': ('File:Persepolis stairs of the Apadana relief.jpg', 1400),
 'persepolis-gate': ('File:Persepolis – Gate of All Nations 01.jpg', 1400),
 'naqsh-rostam': ('File:Tomb of Darius the Great and relief of Shapur I at Naqsh-e Rostam, Iran (16279256871).jpg', 1000),
 'shapur-relief': ('File:The triumph of Shapur I over the Roman emperors Valerian and Philip the Arab, Naqsh-e Rostam, Iran (48098758973).jpg', 1200),
 'shapur-coin': ('File:Shapur I coin - Arthur M. Sackler Gallery - DSC05893.JPG', 800),
 'taq-kasra': ('File:Taq Kasra.jpg', 1200),
 'ardashir-palace': ("File:Ardashir Babakan's Palace in FiruzAbad (cropped).JPG", 1200),
 'takht-soleyman': ('File:Takht-e Soleymān overview.jpg', 1200),
 'pasargadae': ('File:CyrustheGreatTomb 22059.jpg', 1200),
 'zoroaster': ('File:Zoroaster 1.jpg', 760),
}
def clean(s): return re.sub(r'\s+',' ',re.sub('<[^>]+>','',s or '')).strip()
import sys
ONLY=sys.argv[1:]
IMGS={k:v for k,v in IMGS_ALL.items() if not ONLY or k in ONLY}
old=json.load(open('data/credits.json')) if ONLY else []
credits=[c for c in old if c['key'] not in IMGS]
for key,(title,w) in IMGS.items():
    w=min(w,1000)
    u='https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode(dict(action='query',titles=title,prop='imageinfo',iiprop='url|extmetadata',iiurlwidth=w,format='json'))
    pg=next(iter(json.load(urllib.request.urlopen(urllib.request.Request(u,headers=UA)))['query']['pages'].values()))
    ii=pg['imageinfo'][0]; m=ii['extmetadata']
    data=urllib.request.urlopen(urllib.request.Request(ii.get('thumburl',ii['url']),headers=UA)).read()
    im=Image.open(io.BytesIO(data)).convert('RGB')
    if im.width>w: im=im.resize((w,round(im.height*w/im.width)),Image.LANCZOS)
    im.save(f'images/{key}.webp','WEBP',quality=72,method=6)
    credits.append(dict(key=key,file=f'images/{key}.webp',title=title.replace('File:',''),author=clean(m.get('Artist',{}).get('value','')),license=m.get('LicenseShortName',{}).get('value',''),licenseUrl=m.get('LicenseUrl',{}).get('value',''),source=ii['descriptionurl'],w=im.width,h=im.height))
    print(key, im.size, os.path.getsize(f'images/{key}.webp')//1024,'KB', credits[-1]['license'], credits[-1]['author'][:50])
    time.sleep(0.5)
json.dump(credits,open('data/credits.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
