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
VERSION = '1'  # bump to redraw every card after a design change


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


def card(row, photo):
    S = 2  # draw at 2x, then shrink for smooth edges
    im = gold((W * S, H * S))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([18 * S, 18 * S, (W - 18) * S, (H - 18) * S], 26 * S, fill=(255, 250, 240))
    d.rounded_rectangle([32 * S, 32 * S, (W - 32) * S, (H - 32) * S], 18 * S, outline=(217, 178, 90), width=2 * S)
    # photo circle
    r, cx, cy = 175 * S, 255 * S, 262 * S
    ring = gold((2 * r + 24 * S, 2 * r + 24 * S)); m = Image.new('L', ring.size, 0)
    ImageDraw.Draw(m).ellipse([0, 0, ring.size[0] - 1, ring.size[1] - 1], fill=255)
    im.paste(ring, (cx - r - 12 * S, cy - r - 12 * S), m)
    if photo is not None:
        ph = face_square(photo).resize((2 * r, 2 * r), Image.LANCZOS)
    else:
        ph = Image.new('RGB', (2 * r, 2 * r), (11, 122, 99)); pd = ImageDraw.Draw(ph)
        ini = ''.join(w[0] for w in str(row['display_name'] or '?').split()[:2]).upper()
        f = font(FB, 150 * S); tw = pd.textlength(ini, font=f)
        pd.text(((2 * r - tw) / 2, r - 105 * S), ini, font=f, fill='white')
    m = Image.new('L', ph.size, 0); ImageDraw.Draw(m).ellipse([0, 0, 2 * r - 1, 2 * r - 1], fill=255)
    im.paste(ph, (cx - r, cy - r), m)
    # logo
    logo = Image.open(os.path.join(ROOT, 'texcontractor-logo.png')).convert('RGBA')
    lw = 250 * S; logo = logo.resize((lw, int(lw * logo.height / logo.width)), Image.LANCZOS)
    x_text = 490 * S; tw_max = (W - 70) * S - x_text
    im.paste(logo, (x_text + (tw_max - lw) // 2, 46 * S), logo)
    mid = x_text + tw_max / 2
    name = str(row['display_name'] or '').strip()
    f = fit(d, name, FB, 64 * S, tw_max)
    d.text((mid, 258 * S), name, font=f, fill=(17, 24, 39), anchor='ms')
    fs = font(FM, 34 * S)
    lines = wrap(d, row['service'] or '', fs, tw_max)
    y = 312 * S
    for ln in lines:
        d.text((mid, y), ln, font=fs, fill=(11, 122, 99), anchor='ms'); y += 44 * S
    place = ', '.join(x for x in [row.get('city'), row.get('state')] if x)
    if place:
        fp = font(FM, 30 * S); pw = d.textlength(place, font=fp)
        d.text((mid + 14 * S, y + 6 * S), place, font=fp, fill=(75, 85, 99), anchor='ms')
        dx = mid + 14 * S - pw / 2 - 20 * S; dy = y - 4 * S
        d.ellipse([dx - 8 * S, dy - 8 * S, dx + 8 * S, dy + 8 * S], fill=(201, 151, 28))
    # footer band
    d.rounded_rectangle([x_text - 20 * S, 470 * S, (W - 50) * S, (H - 50) * S], 18 * S, fill=(7, 92, 75))
    bm = (x_text - 20 * S + (W - 50) * S) / 2
    d.text((bm, 503 * S), 'Text me directly on', font=font(FM, 24 * S), fill=(209, 250, 229), anchor='ms')
    fb2 = font(FB, 44 * S); a, b = 'Tex', 'Contractor.com'
    wa, wb = d.textlength(a, font=fb2), d.textlength(b, font=fb2); x0 = bm - (wa + wb) / 2
    d.text((x0, 556 * S), a, font=fb2, fill=(242, 193, 78), anchor='ls')
    d.text((x0 + wa, 556 * S), b, font=fb2, fill='white', anchor='ls')
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
