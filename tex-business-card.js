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
  var IC = {
    wa: '<svg viewBox="0 0 24 24" fill="#25D366"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-3.3-.8-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.3.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"/></svg>',
    fb: '<svg viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v2.9h-1.5c-1.5 0-2 .9-2 1.9V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0 0 24 12z"/></svg>',
    ig: '<svg viewBox="0 0 24 24"><defs><linearGradient id="tbcig" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#feda75"/><stop offset=".4" stop-color="#d62976"/><stop offset="1" stop-color="#4f5bd5"/></linearGradient></defs><rect x="2" y="2" width="20" height="20" rx="6" fill="url(#tbcig)"/><circle cx="12" cy="12" r="4.5" fill="none" stroke="#fff" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.3" fill="#fff"/></svg>',
    sms: '<svg viewBox="0 0 24 24" fill="none" stroke="#0b7a63" stroke-width="2"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.3A8 8 0 1 1 21 12z"/></svg>',
    dl: '<svg viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="2"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>'
  };
  function css() {
    if (document.getElementById('tbc-css')) return;
    var s = document.createElement('style'); s.id = 'tbc-css';
    s.textContent = '.tbc{margin:16px 0;padding:16px;border:2px solid #e8c766;border-radius:16px;background:#fffaf0;text-align:center}' +
      '.tbc h3{margin:0 0 6px;font-size:1.2rem;color:#111827}.tbc p{margin:0 0 12px;color:#374151;font-size:.95rem;line-height:1.35}' +
      '.tbc-img img{display:block;width:min(340px,100%);margin:0 auto 12px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.18)}' +
      '.tbc-share{display:flex;width:100%;min-height:52px;margin:0 0 10px;align-items:center;justify-content:center;border:0;border-radius:14px;background:linear-gradient(135deg,#0b7a63,#075c4b);color:#fff;font:800 1.05rem system-ui,sans-serif;cursor:pointer}' +
      '.tbc-g{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}.tbc-g a,.tbc-g button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-height:64px;padding:4px;border-radius:12px;border:1px solid #e5e7eb;background:#fff;color:#111827;font:700 .72rem system-ui,sans-serif;text-decoration:none;cursor:pointer}' +
      '.tbc-g svg{width:26px;height:26px}.tbc-copy{margin-top:10px;background:none;border:0;color:#0b7a63;font:700 .9rem system-ui,sans-serif;text-decoration:underline;cursor:pointer}' +
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
