from PIL import Image, ImageDraw, ImageFont
BROWN=(94,58,34); CREAM=(246,236,214)
def icon(size, maskable=False, border=True):
    S=size*4
    im=Image.new('RGB',(S,S),BROWN); d=ImageDraw.Draw(im)
    if border:
        inset = S*0.17 if maskable else S*0.07
        d.rounded_rectangle([inset,inset,S-inset,S-inset],radius=S*0.08,outline=CREAM,width=int(S*0.022))
    f=ImageFont.truetype('/tmp/op.ttf',int(S*(0.50 if maskable else 0.62)))
    g='\U000103A0'
    bb=d.textbbox((0,0),g,font=f)
    w,h=bb[2]-bb[0],bb[3]-bb[1]
    d.text(((S-w)/2-bb[0],(S-h)/2-bb[1]),g,font=f,fill=CREAM)
    return im.resize((size,size),Image.LANCZOS)
icon(192).save('icons/icon-192.png'); icon(512).save('icons/icon-512.png')
icon(192,True).save('icons/maskable-192.png'); icon(512,True).save('icons/maskable-512.png')
icon(180).save('icons/apple-touch-icon.png'); icon(64).save('icons/favicon-64.png')
icon(1024).save('/workspace/kisti-shots/_icon.png')
