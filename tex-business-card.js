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
  function gold(ctx, x0, y0, x1, y1) {
    var g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, '#9c6a0a'); g.addColorStop(.25, '#e7b33a'); g.addColorStop(.5, '#fff0a8'); g.addColorStop(.75, '#d79a16'); g.addColorStop(1, '#8a5b06'); return g;
  }
  // Owner 11-10 design: charcoal + gold + cream (no green), big round photo, name, service pill, city,
  // "Proud member of TexContractor" badge (self-registered pros only), QR code to the pro's page.
  var qrReady = null;
  function loadQR() {
    if (window.TexQR) return Promise.resolve();
    if (qrReady) return qrReady;
    qrReady = new Promise(function (ok) { var s = document.createElement('script'); s.src = '/tex-qr.js?v=1'; s.onload = ok; s.onerror = ok; document.head.appendChild(s); });
    return qrReady;
  }
  function dark(ctx, x0, y0, x1, y1) { var g = ctx.createRadialGradient(x0 + (x1 - x0) * .3, y0 + (y1 - y0) * .2, 10, x0 + (x1 - x0) * .5, y0 + (y1 - y0) * .5, Math.max(x1 - x0, y1 - y0)); g.addColorStop(0, '#2b2622'); g.addColorStop(1, '#14110f'); return g; }
  async function draw(o) {
    await Promise.all([loadFonts(), loadQR()]);
    var c = document.createElement('canvas'); c.width = W; c.height = H; var ctx = c.getContext('2d');
    var es = o.lang === 'es', t = T[es ? 'es' : 'en'], cx = W / 2;
    // gold frame + cream card
    ctx.fillStyle = gold(ctx, 0, 0, W, H); ctx.fillRect(0, 0, W, H);
    rr(ctx, 16, 16, W - 32, H - 32, 28); ctx.fillStyle = '#fffaf0'; ctx.fill();
    // dark top with a soft curved bottom
    ctx.save(); rr(ctx, 16, 16, W - 32, H - 32, 28); ctx.clip();
    ctx.beginPath(); ctx.moveTo(16, 16); ctx.lineTo(W - 16, 16); ctx.lineTo(W - 16, 426);
    ctx.ellipse(cx, 426, cx - 16, 90, 0, 0, Math.PI); ctx.closePath(); ctx.fillStyle = dark(ctx, 16, 16, W - 16, 516); ctx.fill(); ctx.restore();
    // logo on a cream pill
    var logo = await img('/texcontractor-logo.png');
    rr(ctx, cx - 110, 106, 220, 104, 20); ctx.fillStyle = '#fffaf0'; ctx.fill();
    if (logo) { var lh = 88, lw = lh * logo.width / logo.height; ctx.drawImage(logo, cx - lw / 2, 114, lw, lh); }
    // photo: gold ring, cream border, soft shadow
    var cy = 406, R = 170, r = 151, photo = await img(o.photoUrl);
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = gold(ctx, cx - R, cy - R, cx + R, cy + R);
    ctx.shadowColor = 'rgba(0,0,0,.22)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 20; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.arc(cx, cy, R - 12, 0, Math.PI * 2); ctx.fillStyle = '#fffaf0'; ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    if (photo) { var s = Math.max(2 * r / photo.width, 2 * r / photo.height), pw = photo.width * s, ph = photo.height * s; ctx.drawImage(photo, cx - pw / 2, cy - ph / 2, pw, ph); }
    else { ctx.fillStyle = dark(ctx, cx - r, cy - r, cx + r, cy + r); ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r); ctx.fillStyle = '#f2c14e'; ctx.font = '150px TCB, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(o.name || '?').trim().split(/\s+/).map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase(), cx, cy + 8); }
    ctx.restore();
    // name
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    var name = String(o.name || '').trim(); ctx.fillStyle = '#0f172a';
    var ns = fit(ctx, name, 'TCB, sans-serif', 96, W - 180);
    if (ns < 62 && /\s/.test(name)) { ctx.font = '58px TCB, sans-serif'; var nl = wrap(ctx, name, W - 180); if (nl.length > 1) { nl.forEach(function (l, i) { var z = fit(ctx, l, 'TCB, sans-serif', 58, W - 180); ctx.font = z + 'px TCB, sans-serif'; ctx.fillText(l, cx, 683 + i * 64); }); } else { ctx.font = ns + 'px TCB, sans-serif'; ctx.fillText(name, cx, 745); } }
    else { ctx.font = ns + 'px TCB, sans-serif'; ctx.fillText(name, cx, 745); }
    // service pill
    var svc = String(o.service || (es ? 'Técnico local' : 'Local pro')).trim();
    var ss = fit(ctx, svc, 'TCB, sans-serif', 40, W - 300); ctx.font = ss + 'px TCB, sans-serif';
    var sw = ctx.measureText(svc).width + 72;
    rr(ctx, cx - sw / 2, 767, sw, 88, 44); ctx.fillStyle = '#fff3d6'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#e6cf98'; ctx.stroke();
    ctx.fillStyle = '#7a5200'; ctx.fillText(svc, cx, 825);
    // city
    var place = [o.city, o.state].filter(Boolean).join(', ');
    if (place) { ctx.font = '34px TCM, sans-serif'; ctx.fillStyle = '#475569'; var pw2 = ctx.measureText(place).width; ctx.fillText(place, cx + 14, 912);
      ctx.beginPath(); ctx.arc(cx + 14 - pw2 / 2 - 22, 900, 8, 0, Math.PI * 2); ctx.fillStyle = '#c99a3a'; ctx.fill(); }
    // badge
    var badge = o.imported ? (es ? 'Encuéntrame en TexContractor' : 'Find me on TexContractor') : (es ? 'Miembro orgulloso de TexContractor' : 'Proud member of TexContractor');
    ctx.font = '28px TCB, sans-serif'; var bw = ctx.measureText(badge).width + 104, bx = cx - bw / 2;
    rr(ctx, bx, 942, bw, 64, 32); ctx.fillStyle = '#fffaf0'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#e6cf98'; ctx.stroke();
    ctx.beginPath(); ctx.arc(bx + 40, 974, 23, 0, Math.PI * 2); ctx.fillStyle = gold(ctx, bx + 17, 951, bx + 63, 997); ctx.fill();
    ctx.beginPath(); ctx.moveTo(bx + 30, 975); ctx.lineTo(bx + 37, 982); ctx.lineTo(bx + 51, 967); ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#2d2106'; ctx.stroke();
    ctx.textAlign = 'left'; ctx.fillStyle = '#7a5200'; ctx.fillText(badge, bx + 76, 984);
    // bottom bar: text + QR
    rr(ctx, 56, 1029, W - 112, 265, 28); ctx.fillStyle = dark(ctx, 56, 1029, W - 56, 1294); ctx.fill();
    var qrUrl = (o.qrUrl || o.shareUrl || o.profileUrl || 'https://texcontractor.com/').replace(/utm_source=share&utm_medium=[\w-]+/, 'utm_source=qr').replace(/&service=[^&]*/, ''), m = null;
    try { m = window.TexQR ? window.TexQR(qrUrl) : null; } catch (_) { m = null; }
    var textMax = m ? 680 : W - 224;
    ctx.fillStyle = '#fffaf0'; ctx.globalAlpha = .9; ctx.font = '30px TCM, sans-serif'; ctx.fillText(t.foot1, 92, 1132); ctx.globalAlpha = 1;
    var fs = fit(ctx, 'TexContractor.com', 'TCB, sans-serif', 52, textMax); ctx.font = fs + 'px TCB, sans-serif';
    var wa = ctx.measureText('Tex').width; ctx.fillStyle = '#f4c95d'; ctx.fillText('Tex', 92, 1199); ctx.fillStyle = '#ffffff'; ctx.fillText('Contractor.com', 92 + wa, 1199);
    if (m) {
      var qx = W - 56 - 36 - 190, qy = 1052, n = m.length, cell = 172 / n, off = 9, P = function (k) { return Math.round(off + k * cell); };
      rr(ctx, qx, qy, 190, 190, 16); ctx.fillStyle = '#fffaf0'; ctx.fill(); ctx.fillStyle = '#1c1917';
      for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) if (m[y][x]) ctx.fillRect(qx + P(x), qy + P(y), P(x + 1) - P(x), P(y + 1) - P(y));
      ctx.textAlign = 'center'; ctx.fillStyle = '#ffffff'; ctx.font = '22px TCB, sans-serif'; ctx.fillText(es ? 'Escanéame' : 'Scan me', qx + 95, 1272);
    }
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
    s.textContent = '.tbc{margin:16px 0;padding:16px;border:2px solid #e8c766;border-radius:16px;background:#fffaf0;text-align:center}' +
      '.tbc h3{margin:0 0 6px;font-size:1.2rem;color:#111827}.tbc p{margin:0 0 12px;color:#374151;font-size:.95rem;line-height:1.35}' +
      '.tbc-img img{display:block;width:min(340px,100%);margin:0 auto 12px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.18)}' +
      '.tbc-share{display:flex;width:100%;min-height:52px;margin:0 0 10px;align-items:center;justify-content:center;border:2px solid #c99a3a;border-radius:14px;background:radial-gradient(circle at 30% 20%,#2b2622,#14110f);color:#f4c95d;font:800 1.05rem system-ui,sans-serif;cursor:pointer}' +
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
