#!/usr/bin/env python3
"""Share pages with a picture card for every self-registered technician (owner 11-06).

For each published listing of a technician who signed up himself (owner with 20 listings or fewer, so the
bulk-imported directory is skipped) this writes:
  p/<listing id>/card.jpg    1200x630 card: photo, name, service, city, TexContractor logo
  p/<listing id>/index.html  link-preview tags (WhatsApp, Facebook, Messenger, texts) + jump to the profile
Pages of listings that are no longer published are removed. Runs in GitHub Actions on a schedule.
Local test: python3 scripts/generate-pro-cards.py --sample data.json  (rows with 'photo_file')
"""
import hashlib, html, io, json, os, shutil, sys, urllib.parse, urllib.request

from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'p')
SB = 'https://rryehtaskbjnfbodymjj.supabase.co'
KEY = 'sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r'
SITE = 'https://texcontractor.com'
FB = os.path.join(ROOT, 'assets/fonts/Poppins-Bold.ttf')
FM = os.path.join(ROOT, 'assets/fonts/Poppins-Medium.ttf')
W, H = 1200, 630
VERSION = '3'  # bump to redraw every card after a design change


def get(url, binary=False):
    req = urllib.request.Request(url, headers={'apikey': KEY, 'User-Agent': 'texcontractor-cards'})
    with urllib.request.urlopen(req, timeout=40) as r:
        data = r.read()
    return data if binary else json.loads(data)


def fetch_rows():
    rows, start = [], 0
    while True:
        q = urllib.parse.urlencode({'select': 'id,owner_id,display_name,service,city,state,profile_photo_path',
                                    'is_published': 'eq.true', 'order': 'id', 'limit': '1000', 'offset': str(start)})
        page = get(f'{SB}/rest/v1/texcontractor_public_services?{q}')
        rows += page
        if len(page) < 1000:
            return rows
        start += 1000


def font(path, size):
    return ImageFont.truetype(path, size)


def fit(draw, text, path, size, max_w, min_size=28):
    while size > min_size and draw.textlength(text, font=font(path, size)) > max_w:
        size -= 2
    return font(path, size)


def wrap(draw, text, f, max_w):
    words, lines, cur = str(text).split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if draw.textlength(t, font=f) > max_w and cur:
            lines.append(cur); cur = w
        else:
            cur = t
    if cur:
        lines.append(cur)
    if len(lines) > 2:
        lines = lines[:2]; lines[1] = lines[1].rstrip(' ,&') + '…'
    return lines


def face_square(im):
    """Square crop around the face when one is found, else around the upper middle."""
    im = ImageOps.exif_transpose(im).convert('RGB')
    w, h = im.size
    side = min(w, h)
    cx, cy = w / 2, h * 0.45
    try:
        import cv2, numpy as np
        g = cv2.cvtColor(np.array(im), cv2.COLOR_RGB2GRAY)
        det = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = det.detectMultiScale(g, 1.1, 6, minSize=(max(40, side // 10),) * 2)
        if len(faces):
            x, y, fw, fh = max(faces, key=lambda f: f[2] * f[3])
            cx, cy = x + fw / 2, y + fh / 2 + fh * 0.15
            side = min(side, int(fw * 2.6))
    except Exception:
        pass
    x0 = int(min(max(cx - side / 2, 0), w - side)); y0 = int(min(max(cy - side / 2, 0), h - side))
    return im.crop((x0, y0, x0 + side, y0 + side))


def gold(size):
    g = Image.new('RGB', size)
    d = ImageDraw.Draw(g)
    stops = [(0, (156, 106, 10)), (.25, (231, 179, 58)), (.5, (255, 240, 168)), (.75, (215, 154, 22)), (1, (138, 91, 6))]
    n = size[0] + size[1]
    for i in range(n):
        t = i / n
        for (a, ca), (b, cb) in zip(stops, stops[1:]):
            if a <= t <= b:
                k = (t - a) / (b - a); c = tuple(int(ca[j] + (cb[j] - ca[j]) * k) for j in range(3)); break
        d.line([(i, 0), (i - size[1], size[1])], fill=c, width=2)
    return g


def dark_bg(size):
    """Charcoal background with a soft glow at the top left (owner 11-10: black + gold + cream, no green)."""
    w, h = size
    g = Image.new('RGB', size, (20, 17, 15))
    glow = Image.new('L', size, 0)
    ImageDraw.Draw(glow).ellipse([-w * 0.3, -h * 0.6, w * 0.7, h * 0.9], fill=255)
    from PIL import ImageFilter
    glow = glow.filter(ImageFilter.GaussianBlur(h // 3))
    g.paste(Image.new('RGB', size, (43, 38, 34)), (0, 0), glow)
    return g


NAVY, NAVY2, GOLDC, WHITE, SOFT = (20, 27, 46), (30, 42, 71), (224, 168, 46), (255, 255, 255), (201, 210, 227)


def card(row, photo):
    """1200x630 link-preview card, owner 11-14 design "3": navy + gold, the pro's photo on the right fading
    into navy, service tag, big name, city, "Text me directly on TexContractor.com", member badge."""
    S = 2
    w, h = W * S, H * S
    im = Image.new('RGB', (w, h), NAVY)
    pw = 560 * S
    if photo is not None:
        ph = face_square(photo)
        ph = ImageOps.fit(ph, (pw, h), Image.LANCZOS, centering=(0.5, 0.35))
        im.paste(ph, (w - pw, 0))
        fade = Image.new('L', (pw, h), 0); fd = ImageDraw.Draw(fade)
        for i in range(pw):  # navy -> transparent from left to right over the photo
            a = max(0, 255 - int(255 * (i / (pw * 0.55)) ** 1.2)) if i < pw * 0.55 else 0
            fd.line([(i, 0), (i, h)], fill=a)
        im.paste(Image.new('RGB', (pw, h), NAVY), (w - pw, 0), fade)
    else:
        d0 = ImageDraw.Draw(im)
        r, cx, cy = 170 * S, w - 290 * S, h // 2
        d0.ellipse([cx - r - 10 * S, cy - r - 10 * S, cx + r + 10 * S, cy + r + 10 * S], fill=GOLDC)
        d0.ellipse([cx - r, cy - r, cx + r, cy + r], fill=NAVY2)
        ini = ''.join(x[0] for x in str(row['display_name'] or '?').split()[:2]).upper()
        d0.text((cx, cy + 6 * S), ini, font=font(FB, 150 * S), fill=GOLDC, anchor='mm')
    d = ImageDraw.Draw(im)
    x = 64 * S; tw_max = (w - pw - 20 * S) - x if photo is not None else w - 560 * S - x
    # logo on a white pill
    try:
        logo = Image.open(os.path.join(ROOT, 'texcontractor-logo.png')).convert('RGBA')
        lw = 250 * S; lh = int(lw * logo.height / logo.width); logo = logo.resize((lw, lh), Image.LANCZOS)
        d.rounded_rectangle([x - 4 * S, 44 * S, x + lw + 28 * S, 44 * S + lh + 28 * S], (lh + 28 * S) // 2, fill=WHITE)
        im.paste(logo, (x + 12 * S, 44 * S + 14 * S), logo)
    except Exception:
        pass
    # service tag
    svc = str(row['service'] or 'Local pro').strip().upper()
    ft = fit(d, svc, FB, 26 * S, tw_max - 44 * S, 18 * S)
    tw = d.textlength(svc, font=ft) + 44 * S
    d.rounded_rectangle([x, 200 * S, x + tw, 250 * S], 10 * S, fill=GOLDC)
    d.text((x + 22 * S, 235 * S), svc, font=ft, fill=NAVY, anchor='ls')
    # name (1 or 2 lines)
    name = str(row['display_name'] or '').strip()
    f = fit(d, name, FB, 68 * S, tw_max, 46 * S)
    lines = [name] if d.textlength(name, font=f) <= tw_max else wrap(d, name, font(FB, 52 * S), tw_max)
    if len(lines) > 1:
        f = font(FB, 52 * S)
    y = 326 * S
    for ln in lines:
        d.text((x, y), ln, font=f, fill=WHITE, anchor='ls'); y += int(f.size * 1.05)
    place = ', '.join(v for v in [row.get('city'), row.get('state')] if v)
    if place:
        py = y + 6 * S
        d.ellipse([x + 2 * S, py - 24 * S, x + 20 * S, py - 6 * S], fill=GOLDC)
        d.text((x + 32 * S, py), place, font=font(FM, 28 * S), fill=SOFT, anchor='ls')
    d.rectangle([x, 470 * S, x + 90 * S, 476 * S], fill=GOLDC)
    d.text((x, 525 * S), 'Text me directly on', font=font(FM, 24 * S), fill=SOFT, anchor='ls')
    fb2 = font(FB, 44 * S); wa = d.textlength('Tex', font=fb2)
    d.text((x, 575 * S), 'Tex', font=fb2, fill=GOLDC, anchor='ls'); d.text((x + wa, 575 * S), 'Contractor.com', font=fb2, fill=WHITE, anchor='ls')
    return im.resize((W, H), Image.LANCZOS)


PAGE = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, follow">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:type" content="profile">
<meta property="og:site_name" content="TexContractor">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{img}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:url" content="{url}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{img}">
<link rel="canonical" href="{profile}">
<link rel="icon" href="/favicon.ico">
<script>location.replace({profile_js} + (location.search ? '&' + location.search.slice(1) : ''));</script>
</head>
<body style="font-family:system-ui,sans-serif;text-align:center;padding:24px">
<p><a href="{profile}"><img src="card.jpg" alt="{name}" style="max-width:100%;border-radius:12px"></a></p>
<p><a href="{profile}">Text {name} on TexContractor</a></p>
</body>
</html>
'''


def page(row, sig):
    e = html.escape
    name = str(row['display_name'] or 'Local pro').strip()
    service = str(row['service'] or 'Local service').strip()
    place = ', '.join(x for x in [row.get('city'), row.get('state')] if x)
    profile = f"{SITE}/profile.html?" + urllib.parse.urlencode({'contractor': row['id'], 'service': service})
    return PAGE.format(title=e(f'{name} · {service}'), desc=e(f"Text {name} directly on TexContractor{' · ' + place if place else ''}. Free for customers."),
                       img=f"{SITE}/p/{row['id']}/card.jpg?v={sig[:8]}", url=f"{SITE}/p/{row['id']}/", profile=e(profile),
                       profile_js=json.dumps(profile), name=e(name))


def main():
    sample = sys.argv[2] if len(sys.argv) > 2 and sys.argv[1] == '--sample' else None
    rows = json.load(open(sample)) if sample else fetch_rows()
    count = {}
    for r in rows:
        count[r.get('owner_id')] = count.get(r.get('owner_id'), 0) + 1
    pros = [r for r in rows if r.get('owner_id') and count[r['owner_id']] <= 20]
    os.makedirs(OUT, exist_ok=True)
    keep = set()
    for r in pros:
        sig = hashlib.sha1(json.dumps([VERSION, r.get('display_name'), r.get('service'), r.get('city'), r.get('state'),
                                       r.get('profile_photo_path')], sort_keys=True).encode()).hexdigest()
        folder = os.path.join(OUT, r['id']); keep.add(r['id'])
        sig_file = os.path.join(folder, '.sig')
        if os.path.exists(sig_file) and open(sig_file).read().strip() == sig:
            continue
        photo = None
        try:
            if r.get('photo_file'):
                photo = Image.open(r['photo_file'])
            elif r.get('profile_photo_path'):
                path = '/'.join(urllib.parse.quote(p) for p in str(r['profile_photo_path']).split('/'))
                photo = Image.open(io.BytesIO(get(f'{SB}/storage/v1/object/public/texcontractor-media/{path}', binary=True)))
        except Exception as ex:
            print('photo failed', r['id'], ex)
        os.makedirs(folder, exist_ok=True)
        card(r, photo).save(os.path.join(folder, 'card.jpg'), quality=86, optimize=True)
        open(os.path.join(folder, 'index.html'), 'w').write(page(r, sig))
        open(sig_file, 'w').write(sig)
        print('card', r['id'], r.get('display_name'))
    if not sample:
        for d in os.listdir(OUT):
            if os.path.isdir(os.path.join(OUT, d)) and d not in keep:
                shutil.rmtree(os.path.join(OUT, d)); print('removed', d)
    print('pros with cards:', len(keep))


if __name__ == '__main__':
    main()
