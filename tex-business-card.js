/* Framed business card for technicians (owner 11-06): photo, name, service, city + TexContractor.
   Drawn in the browser, so it is ready the moment the pro publishes. Share as an image (WhatsApp, Instagram,
   Facebook) or download it.
   TexBusinessCard.render(el, {name, service, city, state, photoUrl, profileUrl, lang}) */
(function () {
  var W = 1080, H = 1350;
  var T = {
    en: { h: 'Your free business card', p: 'A gift from TexContractor. Post it on your status, stories and groups so friends share it and customers find you.',
          share: 'Share my card', dl: 'Download', link: 'Copy my link', copied: 'Link copied ✓', foot1: 'Text me directly on', partner: 'Be our partner: every share spreads your name.',
          shareText: function (n, s) { return (n ? n + ' · ' : '') + (s || 'Local pro') + ' on TexContractor. Text me directly: '; } },
    es: { h: 'Tu tarjeta de presentación gratis', p: 'Un regalo de TexContractor. Publícala en tu estado, historias y grupos para que tus amigos la compartan y te encuentren clientes.',
          share: 'Compartir mi tarjeta', dl: 'Descargar', link: 'Copiar mi enlace', copied: 'Enlace copiado ✓', foot1: 'Escríbeme directo en', partner: 'Sé nuestro socio: cada vez que la compartes, tu nombre llega más lejos.',
          shareText: function (n, s) { return (n ? n + ' · ' : '') + (s || 'Técnico local') + ' en TexContractor. Escríbeme directo: '; } }
  };
  var fontsReady = null;
  function loadFonts() {
    if (fontsReady) return fontsReady;
    var list = [['TCB', '/assets/fonts/Poppins-Bold.ttf'], ['TCM', '/assets/fonts/Poppins-Medium.ttf']];
    fontsReady = Promise.all(list.map(function (f) {
      try { var ff = new FontFace(f[0], 'url(' + f[1] + ')'); return ff.load().then(function (x) { document.fonts.add(x); }).catch(function () {}); }
      catch (_) { return Promise.resolve(); }
    }));
    return fontsReady;
  }
  function img(src) {
    return new Promise(function (ok) {
      if (!src) return ok(null);
      var i = new Image(); i.crossOrigin = 'anonymous';
      i.onload = function () { ok(i); }; i.onerror = function () { ok(null); }; i.src = src;
    });
  }
  function fit(ctx, text, font, size, max) {
    var s = size; do { ctx.font = s + 'px ' + font; if (ctx.measureText(text).width <= max) break; s -= 2; } while (s > 26); return s;
  }
  function wrap(ctx, text, max) {
    var words = String(text).split(/\s+/), lines = [], cur = '';
    words.forEach(function (w) { var t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > max && cur) { lines.push(cur); cur = w; } else cur = t; });
    if (cur) lines.push(cur); return lines.slice(0, 2);
  }
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function gold(ctx, x0, y0, x1, y1) {
    var g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, '#9c6a0a'); g.addColorStop(.25, '#e7b33a'); g.addColorStop(.5, '#fff0a8'); g.addColorStop(.75, '#d79a16'); g.addColorStop(1, '#8a5b06'); return g;
  }
  async function draw(o) {
    await loadFonts();
    var c = document.createElement('canvas'); c.width = W; c.height = H; var ctx = c.getContext('2d');
    var t = T[o.lang === 'es' ? 'es' : 'en'];
    // background + frame
    ctx.fillStyle = gold(ctx, 0, 0, W, H); ctx.fillRect(0, 0, W, H);
    rr(ctx, 30, 30, W - 60, H - 60, 34); ctx.fillStyle = '#fffaf0'; ctx.fill();
    rr(ctx, 52, 52, W - 104, H - 104, 24); ctx.lineWidth = 3; ctx.strokeStyle = '#d9b25a'; ctx.stroke();
    // logo
    var logo = await img('/texcontractor-logo.png');
    if (logo) { var lw = 380, lh = lw * logo.height / logo.width; ctx.drawImage(logo, (W - lw) / 2, 74, lw, lh); }
    // photo
    var cx = W / 2, cy = 505, r = 205, photo = await img(o.photoUrl);
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r + 16, 0, Math.PI * 2); ctx.fillStyle = gold(ctx, cx - r, cy - r, cx + r, cy + r); ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8; ctx.fill(); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    if (photo) { var s = Math.max(2 * r / photo.width, 2 * r / photo.height), pw = photo.width * s, ph = photo.height * s; ctx.drawImage(photo, cx - pw / 2, cy - ph / 2, pw, ph); }
    else { ctx.fillStyle = '#0b7a63'; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r); ctx.fillStyle = '#fff'; ctx.font = '200px TCB, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(o.name || '?').trim().split(/\s+/).map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase(), cx, cy + 10); }
    ctx.restore();
    // name, service, city
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    var name = String(o.name || '').trim(); ctx.fillStyle = '#111827';
    var ns = fit(ctx, name, 'TCB, sans-serif', 86, W - 200); ctx.font = ns + 'px TCB, sans-serif'; ctx.fillText(name, cx, 818);
    ctx.font = '46px TCM, sans-serif'; ctx.fillStyle = '#0b7a63';
    var lines = wrap(ctx, o.service || '', W - 220); lines.forEach(function (l, i) { ctx.fillText(l, cx, 886 + i * 56); });
    var place = [o.city, o.state].filter(Boolean).join(', ');
    if (place) { ctx.font = '40px TCM, sans-serif'; ctx.fillStyle = '#4b5563'; var py = 886 + lines.length * 56 + 14; var pw2 = ctx.measureText(place).width; ctx.fillText(place, cx + 16, py); ctx.beginPath(); ctx.arc(cx + 16 - pw2 / 2 - 22, py - 13, 9, 0, Math.PI * 2); ctx.fillStyle = '#c9971c'; ctx.fill(); }
    // footer band
    rr(ctx, 52, H - 262, W - 104, 210, 24); ctx.fillStyle = '#075c4b'; ctx.fill();
    ctx.fillStyle = '#d1fae5'; ctx.font = '38px TCM, sans-serif'; ctx.fillText(t.foot1, cx, H - 182);
    ctx.font = '68px TCB, sans-serif'; var a = 'Tex', b = 'Contractor.com', wa = ctx.measureText(a).width, wb = ctx.measureText(b).width, x0 = cx - (wa + wb) / 2;
    ctx.textAlign = 'left'; ctx.fillStyle = '#f2c14e'; ctx.fillText(a, x0, H - 98); ctx.fillStyle = '#ffffff'; ctx.fillText(b, x0 + wa, H - 98);
    return c;
  }
  function css() {
    if (document.getElementById('tbc-css')) return;
    var s = document.createElement('style'); s.id = 'tbc-css';
    s.textContent = '.tbc{margin:16px 0;padding:16px;border:2px solid #e8c766;border-radius:16px;background:#fffaf0;text-align:center}' +
      '.tbc h3{margin:0 0 6px;font-size:1.2rem;color:#111827}.tbc p{margin:0 0 12px;color:#374151;font-size:.95rem;line-height:1.35}' +
      '.tbc img{display:block;width:min(340px,100%);margin:0 auto 12px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.18)}' +
      '.tbc-b{display:grid;grid-template-columns:1fr 1fr;gap:8px}.tbc-b button,.tbc-b a{min-height:48px;border-radius:12px;font:800 .95rem system-ui,sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;text-decoration:none}' +
      '.tbc-share{grid-column:1/-1;background:linear-gradient(135deg,#0b7a63,#075c4b);color:#fff;border:0}.tbc-b .tbc-sec{background:#fff;color:#111827;border:1px solid #d1d5db}' +
      '.tbc small{display:block;margin-top:10px;color:#92400e;font-weight:700}.tbc-ok{min-height:1em;margin-top:6px;color:#0b7a63;font-weight:700}';
    document.head.appendChild(s);
  }
  async function render(el, o) {
    if (!el) return; css();
    var t = T[o.lang === 'es' ? 'es' : 'en'];
    el.innerHTML = '<div class="tbc"><h3>' + t.h + '</h3><p>' + t.p + '</p><div class="tbc-img">…</div><div class="tbc-b">' +
      '<button type="button" class="tbc-share">' + t.share + '</button><a class="tbc-sec tbc-dl" download="texcontractor-card.png">' + t.dl + '</a>' +
      '<button type="button" class="tbc-sec tbc-link">' + t.link + '</button></div><div class="tbc-ok" aria-live="polite"></div><small>' + t.partner + '</small></div>';
    var canvas = await draw(o), blob = await new Promise(function (ok) { canvas.toBlob(ok, 'image/png'); });
    var url = URL.createObjectURL(blob), im = new Image(); im.src = url; im.alt = 'Business card for ' + (o.name || 'technician');
    var box = el.querySelector('.tbc-img'); box.textContent = ''; box.appendChild(im);
    el.querySelector('.tbc-dl').href = url;
    var file = new File([blob], 'texcontractor-card.png', { type: 'image/png' }), text = t.shareText(o.name, o.service) + o.profileUrl;
    function ev(ch) { try { window.gtag && gtag('event', 'business_card', { action: ch }); } catch (_) {} }
    el.querySelector('.tbc-share').onclick = async function () {
      ev('share');
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text: text }); return; }
        if (navigator.share) { await navigator.share({ title: 'TexContractor', text: text, url: o.profileUrl }); return; }
      } catch (e) { if (e && e.name === 'AbortError') return; }
      el.querySelector('.tbc-dl').click();
    };
    el.querySelector('.tbc-dl').addEventListener('click', function () { ev('download'); });
    el.querySelector('.tbc-link').onclick = function () {
      ev('copy');
      (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () { el.querySelector('.tbc-ok').textContent = t.copied; })
        .catch(function () { window.prompt(t.link, o.profileUrl); });
    };
  }
  window.TexBusinessCard = { render: render, draw: draw };
})();
