import sys, json, urllib.request, urllib.parse, re
UA={'User-Agent':'KistiApp/1.0 (danmo88.github.io; educational)'}
def api(**p):
    p.update(format='json')
    u='https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode(p)
    return json.load(urllib.request.urlopen(urllib.request.Request(u,headers=UA)))
for q in sys.argv[1:]:
    r=api(action='query',generator='search',gsrsearch=q+' filetype:bitmap',gsrnamespace=6,gsrlimit=8,prop='imageinfo',iiprop='url|size|extmetadata')
    print('==',q)
    for pg in sorted(r.get('query',{}).get('pages',{}).values(),key=lambda x:x['index']):
        ii=pg['imageinfo'][0]; m=ii['extmetadata']
        a=re.sub('<[^>]+>','',m.get('Artist',{}).get('value',''))[:40]
        print(f"  {pg['title'][:80]} | {ii['width']}x{ii['height']} | {m.get('LicenseShortName',{}).get('value','')} | {a}")
