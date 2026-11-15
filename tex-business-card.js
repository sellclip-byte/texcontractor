/* Framed business card for technicians (owner 11-06): photo, name, service, city + TexContractor.
   Drawn in the browser, so it is ready the moment the pro publishes. Share as an image (WhatsApp, Instagram,
   Facebook) or download it.
   TexBusinessCard.render(el, {name, service, city, state, photoUrl, profileUrl, shareUrl, lang, imported}) */
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
  function gold_unused(ctx, x0, y0, x1, y1) {
    var g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, '#9c6a0a'); g.addColorStop(.25, '#e7b33a'); g.addColorStop(.5, '#fff0a8'); g.addColorStop(.75, '#d79a16'); g.addColorStop(1, '#8a5b06'); return g;
  }
  // Owner 11-14 design ("3"): navy + gold brand colors. With a photo: the pro's photo fills the top of the card,
  // service tag + big name over it, navy bottom with "Text me directly on TexContractor.com", contact chips and QR.
  // Without a photo: clean white card with the initials in a gold ring (looks finished even with no picture).
  var qrReady = null;
  function loadQR() {
    if (window.TexQR) return Promise.resolve();
    if (qrReady) return qrReady;
    qrReady = new Promise(function (ok) { var s = document.createElement('script'); s.src = '/tex-qr.js?v=1'; s.onload = ok; s.onerror = ok; document.head.appendChild(s); });
    return qrReady;
  }
  var NAVY = '#141B2E', NAVY2 = '#1E2A47', GOLD = '#E0A82E', GOLD2 = '#C98A13';
  function cover(ctx, im, x, y, w, h, fy) { var s = Math.max(w / im.width, h / im.height), pw = im.width * s, ph = im.height * s; ctx.drawImage(im, x + (w - pw) / 2, y + (h - ph) * fy, pw, ph); }
  function initials(n) { return String(n || '?').trim().split(/\s+/).map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase(); }
  function pin(ctx, x, y) { ctx.save(); ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(x, y - 6, 11, Math.PI, 0); ctx.lineTo(x, y + 14); ctx.closePath(); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.arc(x, y - 6, 4, 0, 7); ctx.fill(); ctx.restore(); }
  function check(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = GOLD; ctx.fill(); ctx.beginPath(); ctx.moveTo(x - r * .42, y + r * .02); ctx.lineTo(x - r * .12, y + r * .32); ctx.lineTo(x + r * .45, y - r * .3); ctx.lineWidth = r * .22; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = NAVY; ctx.stroke(); }
  function site(ctx, x, y, size, a, b, center) { ctx.font = size + 'px TCB, sans-serif'; ctx.textAlign = 'left'; var w1 = ctx.measureText('Tex').width, w = ctx.measureText('TexContractor.com').width; if (center) x -= w / 2; ctx.fillStyle = a; ctx.fillText('Tex', x, y); ctx.fillStyle = b; ctx.fillText('Contractor.com', x + w1, y); }
  function qrBox(ctx, url, x, y, size) {
    var m = null; try { m = window.TexQR ? window.TexQR(url) : null; } catch (_) { m = null; } if (!m) return false;
    var n = m.length, pad = Math.round(size * .06), cell = (size - 2 * pad) / n, P = function (k) { return Math.round(pad + k * cell); };
    rr(ctx, x, y, size, size, 18); ctx.fillStyle = '#fff'; ctx.fill(); ctx.fillStyle = NAVY;
    for (var j = 0; j < n; j++) for (var i = 0; i < n; i++) if (m[j][i]) ctx.fillRect(x + P(i), y + P(j), P(i + 1) - P(i), P(j + 1) - P(j));
    return true;
  }
  // name in one line, or two lines when it is long; returns {lines, size}
  function nameLines(ctx, name, max, big, small) {
    var s = fit(ctx, name, 'TCB, sans-serif', big, max);
    if (s >= small || !/\s/.test(name)) return { lines: [name], size: s };
    ctx.font = small + 'px TCB, sans-serif'; var l = wrap(ctx, name, max), z = small;
    l.forEach(function (x) { z = Math.min(z, fit(ctx, x, 'TCB, sans-serif', small, max)); });
    return { lines: l, size: z };
  }
  function chipsFor(o, es) {
    var m = Array.isArray(o.contacts) && o.contacts.length ? o.contacts : ['text', 'call', 'chat'];
    var L = es ? { text: 'Texto', call: 'Llamada', chat: 'Chat' } : { text: 'Text', call: 'Call', chat: 'Chat' };
    return ['text', 'call', 'chat'].filter(function (k) { return m.indexOf(k) > -1; }).map(function (k) { return L[k]; });
  }
  async function draw(o) {
    await Promise.all([loadFonts(), loadQR()]);
    var c = document.createElement('canvas'); c.width = W; c.height = H; var ctx = c.getContext('2d');
    var es = o.lang === 'es', t = T[es ? 'es' : 'en'], cx = W / 2;
    var name = String(o.name || '').trim() || (es ? 'Técnico local' : 'Local pro');
    var svc = String(o.service || (es ? 'Técnico local' : 'Local pro')).trim();
    var place = [o.city, o.state].filter(Boolean).join(', ');
    var badge = o.imported ? (es ? 'Encuéntrame en TexContractor' : 'Find me on TexContractor') : (es ? 'Miembro orgulloso de TexContractor' : 'Proud member of TexContractor');
    var scan = es ? 'Escanéame' : 'Scan me', chips = chipsFor(o, es);
    var qrUrl = (o.qrUrl || o.shareUrl || o.profileUrl || 'https://texcontractor.com/').replace(/utm_source=share&utm_medium=[\w-]+/, 'utm_source=qr').replace(/&service=[^&]*/, '');
    var photo = await img(o.photoUrl), logo = await img('/texcontractor-logo.png');
    ctx.textBaseline = 'alphabetic';
    if (photo) {
      // ---- photo card ----
      ctx.fillStyle = NAVY; ctx.fillRect(0, 0, W, H);
      var hh = 860; ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, hh); ctx.clip(); cover(ctx, photo, 0, 0, W, hh, .25); ctx.restore();
      var g = ctx.createLinearGradient(0, 360, 0, hh); g.addColorStop(0, 'rgba(20,27,46,0)'); g.addColorStop(.7, 'rgba(20,27,46,.86)'); g.addColorStop(1, NAVY); ctx.fillStyle = g; ctx.fillRect(0, 0, W, hh + 2);
      var g2 = ctx.createLinearGradient(0, 0, 0, 220); g2.addColorStop(0, 'rgba(20,27,46,.55)'); g2.addColorStop(1, 'rgba(20,27,46,0)'); ctx.fillStyle = g2; ctx.fillRect(0, 0, W, 220);
      rr(ctx, 50, 50, 330, 100, 50); ctx.fillStyle = '#fff'; ctx.fill();
      if (logo) { var lw = 270, lh = lw * logo.height / logo.width; ctx.drawImage(logo, 80, 50 + (100 - lh) / 2, lw, lh); }
      // name block from the bottom up: city at 880, name above, service tag above the name
      var nl = nameLines(ctx, name, W - 140, 108, 74), lh2 = Math.round(nl.size * 1.02), base = 812 - (nl.lines.length - 1) * lh2;
      ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; ctx.font = nl.size + 'px TCB, sans-serif';
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 18; nl.lines.forEach(function (l, i) { ctx.fillText(l, 66, base + i * lh2); }); ctx.restore();
      var S = svc.toUpperCase(), ts = fit(ctx, S, 'TCB, sans-serif', 34, W - 200); ctx.font = ts + 'px TCB, sans-serif';
      var tw = ctx.measureText(S).width + 60, ty = base - nl.size * .78 - 30 - 66;
      rr(ctx, 70, ty, tw, 66, 12); ctx.fillStyle = GOLD; ctx.fill(); ctx.fillStyle = NAVY; ctx.fillText(S, 100, ty + 46);
      if (place) { ctx.font = '36px TCM, sans-serif'; ctx.fillStyle = '#D6DDEA'; ctx.fillText(place, 112, 880); pin(ctx, 84, 870); }
      ctx.fillStyle = GOLD; ctx.fillRect(70, 935, 120, 8);
      var hasQR = qrBox(ctx, qrUrl, W - 70 - 240, 985, 240), tmax = hasQR ? 640 : W - 140;
      ctx.textAlign = 'left'; ctx.fillStyle = '#C9D2E3'; ctx.font = '32px TCM, sans-serif'; ctx.fillText(t.foot1, 70, 1030);
      site(ctx, 70, 1100, fit(ctx, 'TexContractor.com', 'TCB, sans-serif', 56, tmax), GOLD, '#fff');
      ctx.font = '30px TCB, sans-serif'; var x = 70;
      chips.forEach(function (ch) { var w = ctx.measureText(ch).width + 56; rr(ctx, x, 1160, w, 60, 30); ctx.strokeStyle = 'rgba(224,168,46,.85)'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(ch, x + w / 2, 1201); ctx.textAlign = 'left'; x += w + 16; });
      check(ctx, 86, 1272, 16); ctx.fillStyle = '#AEB8CC'; ctx.font = fit(ctx, badge, 'TCB, sans-serif', 24, tmax - 50) + 'px TCB, sans-serif'; ctx.fillText(badge, 112, 1281);
      if (hasQR) { ctx.textAlign = 'center'; ctx.fillStyle = GOLD; ctx.font = '24px TCB, sans-serif'; ctx.fillText(scan, W - 70 - 120, 1265); }
      return c;
    }
    // ---- no photo: clean white card ----
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = NAVY; ctx.fillRect(0, 0, W, 330); ctx.fillStyle = GOLD; ctx.fillRect(0, 330, W, 12);
    var rg = ctx.createRadialGradient(W * .85, 0, 10, W * .85, 0, 500); rg.addColorStop(0, 'rgba(224,168,46,.35)'); rg.addColorStop(1, 'rgba(224,168,46,0)'); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, 330);
    rr(ctx, cx - 190, 54, 380, 118, 59); ctx.fillStyle = '#fff'; ctx.fill();
    if (logo) { var lw2 = 310, lh3 = lw2 * logo.height / logo.width; ctx.drawImage(logo, cx - lw2 / 2, 54 + (118 - lh3) / 2, lw2, lh3); }
    var cy = 420, R = 200;
    ctx.save(); ctx.shadowColor = 'rgba(15,23,42,.3)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16; ctx.beginPath(); ctx.arc(cx, cy, R + 14, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.arc(cx, cy, R + 6, 0, 7); ctx.fillStyle = GOLD; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fillStyle = NAVY; ctx.fill();
    ctx.fillStyle = GOLD; ctx.font = '150px TCB, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(initials(name), cx, cy + 8); ctx.textBaseline = 'alphabetic';
    var nb = nameLines(ctx, name, W - 160, 90, 64), lhb = Math.round(nb.size * 1.05), y = 730 - (nb.lines.length - 1) * lhb * .6;
    ctx.fillStyle = NAVY; ctx.font = nb.size + 'px TCB, sans-serif'; nb.lines.forEach(function (l, i) { ctx.fillText(l, cx, y + i * lhb); }); y += (nb.lines.length - 1) * lhb;
    var S2 = svc.toUpperCase(); ctx.font = fit(ctx, S2, 'TCB, sans-serif', 36, W - 360) + 'px TCB, sans-serif'; ctx.fillStyle = GOLD2; ctx.fillText(S2, cx, y + 65);
    var sw = ctx.measureText(S2).width; ctx.fillStyle = GOLD; ctx.fillRect(cx - sw / 2 - 90, y + 52, 60, 4); ctx.fillRect(cx + sw / 2 + 30, y + 52, 60, 4);
    if (place) { ctx.font = '34px TCM, sans-serif'; var pw = ctx.measureText(place).width; ctx.fillStyle = '#475569'; ctx.fillText(place, cx + 16, y + 132); pin(ctx, cx + 16 - pw / 2 - 24, y + 122); }
    ctx.font = '30px TCB, sans-serif'; var gap = 22, ws = chips.map(function (ch) { return ctx.measureText(ch).width + 64; }), tot = ws.reduce(function (a, b) { return a + b; }, 0) + gap * (chips.length - 1), xx = cx - tot / 2, cyy = Math.min(y + 172, 940);
    chips.forEach(function (ch, i) { rr(ctx, xx, cyy, ws[i], 64, 32); ctx.fillStyle = '#F4F6FA'; ctx.fill(); ctx.strokeStyle = '#D9DFEA'; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = NAVY; ctx.fillText(ch, xx + ws[i] / 2, cyy + 43); xx += ws[i] + gap; });
    rr(ctx, 50, 1025, W - 100, 280, 32); ctx.fillStyle = NAVY; ctx.fill();
    var hasQR2 = qrBox(ctx, qrUrl, W - 98 - 215, 1048, 215), tmax2 = hasQR2 ? 620 : W - 200;
    ctx.textAlign = 'left'; ctx.fillStyle = '#C9D2E3'; ctx.font = '30px TCM, sans-serif'; ctx.fillText(t.foot1, 98, 1115);
    site(ctx, 98, 1177, fit(ctx, 'TexContractor.com', 'TCB, sans-serif', 50, tmax2), GOLD, '#fff');
    check(ctx, 114, 1243, 17); ctx.fillStyle = '#E8ECF4'; ctx.font = fit(ctx, badge, 'TCB, sans-serif', 25, tmax2 - 50) + 'px TCB, sans-serif'; ctx.textAlign = 'left'; ctx.fillText(badge, 142, 1252);
    if (hasQR2) { ctx.textAlign = 'center'; ctx.fillStyle = GOLD; ctx.font = '22px TCB, sans-serif'; ctx.fillText(scan, W - 98 - 107, 1290); }
    return c;
  }
  var IC = {
    wa: '<svg viewBox="0 0 24 24" fill="#25D366"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-3.3-.8-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.3.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"/></svg>',
    fb: '<svg viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v2.9h-1.5c-1.5 0-2 .9-2 1.9V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0 0 24 12z"/></svg>',
    ig: '<svg viewBox="0 0 24 24"><defs><linearGradient id="tbcig" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#feda75"/><stop offset=".4" stop-color="#d62976"/><stop offset="1" stop-color="#4f5bd5"/></linearGradient></defs><rect x="2" y="2" width="20" height="20" rx="6" fill="url(#tbcig)"/><circle cx="12" cy="12" r="4.5" fill="none" stroke="#fff" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.3" fill="#fff"/></svg>',
    sms: '<svg viewBox="0 0 24 24" fill="none" stroke="#a16d0d" stroke-width="2"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.3A8 8 0 1 1 21 12z"/></svg>',
    dl: '<svg viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="2"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>'
  };
  function css() {
    if (document.getElementById('tbc-css')) return;
    var s = document.createElement('style'); s.id = 'tbc-css';
    s.textContent = '.tbc{margin:16px 0;padding:16px;border:2px solid #E0A82E;border-radius:16px;background:#fff;text-align:center}' +
      '.tbc h3{margin:0 0 6px;font-size:1.2rem;color:#111827}.tbc p{margin:0 0 12px;color:#374151;font-size:.95rem;line-height:1.35}' +
      '.tbc-img img{display:block;width:min(340px,100%);margin:0 auto 12px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.18)}' +
      '.tbc-share{display:flex;width:100%;min-height:52px;margin:0 0 10px;align-items:center;justify-content:center;border:2px solid #c99a3a;border-radius:14px;background:#141B2E;color:#E0A82E;font:800 1.05rem system-ui,sans-serif;cursor:pointer}' +
      '.tbc-g{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}.tbc-g a,.tbc-g button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-height:64px;padding:4px;border-radius:12px;border:1px solid #e5e7eb;background:#fff;color:#111827;font:700 .72rem system-ui,sans-serif;text-decoration:none;cursor:pointer}' +
      '.tbc-g svg{width:26px;height:26px}.tbc-copy{margin-top:10px;background:none;border:0;color:#7a5200;font:700 .9rem system-ui,sans-serif;text-decoration:underline;cursor:pointer}' +
      '.tbc small{display:block;margin-top:10px;color:#92400e;font-weight:700}.tbc-ok{min-height:1em;margin-top:6px;color:#0b7a63;font-weight:700}';
    document.head.appendChild(s);
  }
  async function render(el, o) {
    if (!el) return; css();
    var t = T[o.lang === 'es' ? 'es' : 'en'], es = o.lang === 'es';
    var link = o.shareUrl || o.profileUrl, text = (o.third ? (o.name ? o.name + ' · ' : '') + (o.service || 'Local pro') + (es ? ' en TexContractor. Escríbele directo: ' : ' on TexContractor. Text them directly: ') : t.shareText(o.name, o.service)) + link, e = encodeURIComponent;
    var ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    el.innerHTML = '<div class="tbc"><h3>' + (o.title || t.h) + '</h3><p>' + (o.note || t.p) + '</p><div class="tbc-img">…</div>' +
      '<button type="button" class="tbc-share">' + (o.third ? (es ? 'Compartir esta tarjeta' : 'Share this card') : t.share) + '</button><div class="tbc-g">' +
      '<a data-ch="facebook" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=' + e(link) + '">' + IC.fb + 'Facebook</a>' +
      '<a data-ch="whatsapp" target="_blank" rel="noopener" href="https://wa.me/?text=' + e(text) + '">' + IC.wa + 'WhatsApp</a>' +
      '<a data-ch="text" href="sms:' + (ios ? '&' : '?') + 'body=' + e(text) + '">' + IC.sms + (es ? 'Texto' : 'Text') + '</a>' +
      '<button type="button" data-ch="instagram">' + IC.ig + 'Instagram</button>' +
      '<a data-ch="download" class="tbc-dl" download="texcontractor-card.png">' + IC.dl + t.dl + '</a>' +
      '</div><button type="button" class="tbc-copy">' + (o.third ? (es ? 'Copiar enlace' : 'Copy link') : t.link) + '</button><div class="tbc-ok" aria-live="polite"></div>' + (o.note ? '' : '<small>' + t.partner + '</small>') + '</div>';
    var canvas = await draw(o), blob = await new Promise(function (ok) { canvas.toBlob(ok, 'image/png'); });
    var url = URL.createObjectURL(blob), im = new Image(); im.src = url; im.alt = 'Business card for ' + (o.name || 'technician');
    var box = el.querySelector('.tbc-img'); box.textContent = ''; box.appendChild(im);
    el.querySelector('.tbc-dl').href = url;
    var file = new File([blob], 'texcontractor-card.png', { type: 'image/png' });
    var ok = el.querySelector('.tbc-ok');
    function ev(ch) { try { window.gtag && gtag('event', 'business_card', { action: ch }); } catch (_) {} }
    async function shareFile() {
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text: text }); return true; }
      } catch (er) { if (er && er.name === 'AbortError') return true; }
      return false;
    }
    el.querySelector('.tbc-share').onclick = async function () {
      ev('share');
      if (await shareFile()) return;
      try { if (navigator.share) { await navigator.share({ title: 'TexContractor', text: text, url: link }); return; } } catch (er) { if (er && er.name === 'AbortError') return; }
      el.querySelector('.tbc-dl').click();
    };
    el.addEventListener('click', async function (x) {
      var b = x.target.closest('[data-ch]'); if (!b) return; var ch = b.getAttribute('data-ch'); ev(ch);
      // Owner 11-10: on WhatsApp people should SEE the card, not just a blue link.
      // Phones: send the card picture itself (+ the link) through the share sheet. Computers: copy the picture so it can be
      // pasted in the chat (Ctrl+V), and open WhatsApp with the link as before.
      if (ch === 'whatsapp') {
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          x.preventDefault();
          if (await shareFile()) return;
          window.open(b.href, '_blank');
          return;
        }
        try {
          if (navigator.clipboard && window.ClipboardItem) {
            navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).then(function () {
              ok.textContent = es ? 'Tarjeta copiada ✓ En WhatsApp, pégala en el chat (Ctrl+V) para que vean la tarjeta.' : 'Card copied ✓ In WhatsApp, paste it in the chat (Ctrl+V) so they see the card.';
            }).catch(function () {});
          }
        } catch (_) {}
        return;
      }
      if (ch === 'instagram') {
        x.preventDefault();
        if (await shareFile()) return;
        el.querySelector('.tbc-dl').click();
        ok.textContent = es ? 'Tarjeta descargada: súbela a tu historia de Instagram.' : 'Card saved: post it to your Instagram story.';
      }
    });
    el.querySelector('.tbc-copy').onclick = function () {
      ev('copy');
      (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () { ok.textContent = t.copied; })
        .catch(function () { window.prompt(t.link, link); });
    };
  }
  window.TexBusinessCard = { render: render, draw: draw };
})();
