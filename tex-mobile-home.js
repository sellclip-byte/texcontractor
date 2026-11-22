/* Owner 11-21: clean PHONE homepage (like Angi) — one question, then ZIP, then "post a request" or "browse pros".
   Desktop is unchanged. Only runs on index.html at phone width. */
(function () {
  if (!matchMedia('(max-width:700px)').matches) return;
  var p = location.pathname;
  if (!(p === '/' || /\/index\.html$/.test(p))) return;
  var D = document, H = D.documentElement;
  var es = function () { return (H.lang || '').indexOf('es') === 0; };
  var T = {
    h: ['Find a local pro near you', 'Encuentra un profesional cerca de ti'],
    q: ['What do you need fixed?', '¿Qué necesitas arreglar?'],
    pro1: ['Are you a technician?', '¿Eres técnico?'],
    pro2: ['Add your service free · No lead fees', 'Agrega tu servicio gratis · Sin cobro por cliente'],
    join: ['Join free', 'Únete gratis'],
    near: [' pros near you', ': profesionales cerca de ti'],
    where: ['Where is the job?', '¿Dónde es el trabajo?'],
    zip: ['ZIP code', 'Código postal'],
    next: ['Next', 'Siguiente'], back: ['← Back', '← Atrás'], cont: ['Continue', 'Continuar'],
    how: ['How do you want to find your pro?', '¿Cómo quieres encontrar a tu profesional?'],
    o1: ['Post your request', 'Publica tu solicitud'],
    o1s: ['Pros near {c} contact you the way you choose: text, chat or call.', 'Profesionales cerca de {c} te contactan como tú elijas: texto, chat o llamada.'],
    easy: ['Easiest', 'Lo más fácil'],
    o2: ['Browse pros near me', 'Ver profesionales cerca de mí'],
    o2s: ['See pros near {z} with photos of their work, and text the one you like.', 'Mira profesionales cerca de {z} con fotos de su trabajo y escríbele al que te guste.'],
    badzip: ['Enter a 5-digit ZIP code', 'Escribe un código postal de 5 dígitos'],
    menu: ['Menu', 'Menú']
  };
  var t = function (k) { return T[k][es() ? 1 : 0]; };
  var css = D.createElement('style');
  css.textContent = [
    'html.mh .header-search,html.mh #share-site,html.mh #media-toggle,html.mh #account-toggle{display:none!important}',
    'html.mh #cust-hero{display:none!important}',
    'html.mh #location-result{display:none!important}',
    'html.mh header .header-inner{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;align-items:center!important;gap:8px!important;padding:8px 12px!important;min-height:0!important}',
    'html.mh header .logo-image{height:34px!important;width:auto!important}',
    'html.mh header .header-actions{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;align-items:center!important;gap:14px!important;margin:0 0 0 auto!important;width:auto!important;padding:0!important}',
    'html.mh header .tex-language-wrap{margin:0!important;padding:2px!important;border-width:1px!important;flex:none!important}',
    'html.mh header .tex-lang-btn{font-size:0!important;padding:5px 6px!important;min-height:0!important;height:auto!important;line-height:0!important;gap:0!important}',
    'html.mh header .tex-lang-btn svg{width:26px!important;height:18px!important;margin:0!important;border-radius:3px}',
    
    'html.mh header .header-tools{display:flex!important;flex-wrap:nowrap!important;align-items:center!important;gap:14px!important;margin:0!important;width:auto!important}',
    'html.mh header .req-tool{position:relative!important;height:auto!important;min-height:0!important;padding:6px 10px!important;border-radius:999px!important;flex-direction:row!important;gap:4px!important;font-size:13px!important;width:auto!important;min-width:0!important;flex:none!important}',
    'html.mh header .req-tool .header-tool-icon{font-size:15px!important}',
    'html.mh header .req-tool .req-tool-label{display:none!important}',
    'html.mh header .req-tool .req-tool-n{position:absolute!important;top:-6px!important;right:-6px!important}',
    'html.mh header .logo-image{max-width:38vw!important}',
    'html.mh .tex-panel{display:none!important}',
    '#mh-burger{border:0;background:none;font-size:26px;line-height:1;padding:4px 6px;color:#0f172a}',
    '#mh-menu{position:absolute;right:12px;top:58px;z-index:60;background:#fff;border:1px solid #e2e8f0;border-radius:14px;box-shadow:0 12px 30px rgba(15,23,42,.18);padding:8px;min-width:210px}',
    '#mh-menu button,#mh-menu a{display:block;width:100%;text-align:left;border:0;background:none;padding:12px 14px;font:600 16px system-ui,sans-serif;color:#0f172a;border-radius:10px;text-decoration:none}',
    '#mh-menu button:active,#mh-menu a:active{background:#f1f5f9}',
    '#mh-hero{position:relative;height:380px;display:flex;align-items:center;justify-content:center;padding:0 16px;overflow:hidden}',
    '#mh-hero .bg{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;transition:opacity 1s}',
    '#mh-hero .bg.on{opacity:1}',
    '#mh-hero:after{content:"";position:absolute;inset:0;background:rgba(15,23,42,.35)}',
    '#mh-hero .pn{position:relative;z-index:2;width:100%;background:rgba(15,23,42,.55);border-radius:16px;padding:22px 16px}',
    '#mh-hero h1{color:#fff;font-size:30px;line-height:1.15;text-align:center;font-weight:800;margin:0 0 16px}',
    '#mh-q{display:flex;align-items:center;gap:10px;width:100%;background:#fff;border:0;border-radius:999px;padding:16px 18px;font:16px system-ui,sans-serif;color:#64748b;text-align:left}',
    '#mh-dots{position:absolute;bottom:12px;left:0;right:0;display:flex;justify-content:center;gap:6px;z-index:2}#mh-dots i{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.5)}#mh-dots i.on{background:#fff}',
    '#mh-pro{display:flex;align-items:center;gap:14px;margin:44px 16px 30px;border:2px solid #f5b400;background:linear-gradient(135deg,#fffbeb,#fef3c7);border-radius:16px;padding:16px;box-shadow:0 6px 18px rgba(180,120,0,.15);text-decoration:none;color:#0f172a}',
    '#mh-pro .ic{width:48px;height:48px;border-radius:12px;background:#b7791f;color:#fff;display:flex;align-items:center;justify-content:center;font-size:24px;flex:none}',
    '#mh-pro b{display:block;font-size:16px}#mh-pro small{color:#475569;font-size:14px}#mh-pro .j{margin-left:auto;background:#0f2a4a;color:#fff;font-weight:800;padding:10px 14px;border-radius:10px;white-space:nowrap}',
    '#mh-flow{position:fixed;inset:0;z-index:2147482000;background:#fff;display:flex;flex-direction:column;font-family:system-ui,-apple-system,sans-serif;color:#0f172a}',
    '#mh-flow .tp{display:flex;align-items:center;justify-content:center;padding:12px;border-bottom:1px solid #e5e7eb;position:relative}#mh-flow .tp img{height:38px}',
    '#mh-flow .x{position:absolute;right:12px;top:10px;border:0;background:none;font-size:28px;color:#475569}',
    '#mh-flow .bar{height:5px;background:#e5e7eb}#mh-flow .bar i{display:block;height:100%;background:#1d4ed8;transition:width .3s}',
    '#mh-flow .mn{padding:24px 20px;overflow:auto;flex:1}#mh-flow h2{font-size:25px;line-height:1.2;margin:0 0 20px}',
    '#mh-flow .srch{display:flex;align-items:center;gap:10px;border:2px solid #0f172a;border-radius:12px;padding:12px 14px}#mh-flow .srch input{border:0;outline:0;font:17px system-ui,sans-serif;flex:1;min-width:0}',
    '#mh-flow .ls{margin-top:8px}#mh-flow .ls button{display:block;width:100%;text-align:left;border:0;border-bottom:1px solid #f1f5f9;background:none;padding:14px 6px;font:600 17px system-ui,sans-serif;color:#0f172a}',
    '#mh-flow label{display:block;font-weight:700;color:#334155;margin-bottom:10px}',
    '#mh-flow .zp{display:flex;gap:10px}#mh-flow .zp .in{flex:1;border:2px solid #0f172a;border-radius:10px;padding:8px 14px;display:flex;align-items:center;justify-content:space-between}',
    '#mh-flow .zp small{display:block;color:#475569;font-size:13px;font-weight:600}#mh-flow .zp input{border:0;outline:0;font:700 21px system-ui,sans-serif;width:100%;padding:2px 0}',
    '#mh-flow .ok{width:28px;height:28px;border-radius:50%;background:#dcfce7;color:#16a34a;display:none;align-items:center;justify-content:center;font-weight:900;flex:none}#mh-flow .ok.on{display:flex}',
    '#mh-flow .city{color:#16a34a;font-size:17px;margin-top:10px;font-weight:600;min-height:22px}#mh-flow .err{color:#b91c1c}',
    '#mh-flow .btn{display:block;width:100%;text-align:center;background:#1d4ed8;color:#fff;font:800 18px system-ui,sans-serif;padding:16px;border-radius:12px;border:0;margin-top:24px}',
    '#mh-flow .bk{display:block;width:100%;border:0;background:none;color:#475569;font:700 16px system-ui,sans-serif;margin-top:16px}',
    '#mh-flow .opt{display:flex;gap:14px;align-items:flex-start;width:100%;text-align:left;border:2px solid #e2e8f0;background:#fff;border-radius:14px;padding:18px;margin-bottom:14px;font-family:inherit;color:#0f172a}',
    '#mh-flow .opt.sel{border-color:#1d4ed8;background:#eff6ff}#mh-flow .opt .e{font-size:30px}#mh-flow .opt b{display:block;font-size:18px;margin-bottom:4px}#mh-flow .opt span.d{color:#475569;font-size:15px;line-height:1.35}',
    '#mh-flow .tag{display:inline-block;background:#dcfce7;color:#166534;font-size:12px;font-weight:800;padding:3px 8px;border-radius:999px;margin-top:8px}'
  ].join('\n');
  D.head.appendChild(css);
  H.classList.add('mh');

  var pics = ['catalog-41c6fdd548fb7e0c', 'catalog-d62107fb07c7078f', 'catalog-761209465a696f45', 'catalog-eb3123aa3163fb0b', 'catalog-98d2c8f81847aa2d'];
  var st = { svc: '', label: '', zip: '', city: '', state: '' };
  function ev(n) { try { window.texVisit && texVisit(n); } catch (_) {} }
  function names() {
    var n = [].slice.call(D.querySelectorAll('.services-grid .service-title')).map(function (e) { return e.textContent.trim(); }).filter(Boolean);
    if (!n.length) n = [].slice.call(D.querySelectorAll('#cust-quick .ch-c img')).map(function (e) { return e.alt; }).filter(Boolean);
    var seen = {}; return n.filter(function (x) { if (seen[x]) return false; seen[x] = 1; return true; });
  }
  function saved() { try { return JSON.parse(localStorage.getItem('texcontractor-location') || '{}') || {}; } catch (_) { return {}; } }

  function build() {
    var hero = D.getElementById('cust-hero'); if (!hero || D.getElementById('mh-hero')) return;
    // header: burger menu with the hidden tools
    var tools = D.querySelector('.header-tools');
    if (tools && !D.getElementById('mh-burger')) {
      var bg = D.createElement('button'); bg.id = 'mh-burger'; bg.type = 'button'; bg.setAttribute('aria-label', t('menu')); bg.textContent = '☰';
      tools.appendChild(bg);
      var m = D.createElement('div'); m.id = 'mh-menu'; m.hidden = true;
      var acct = (D.getElementById('account-label') || {}).textContent || 'Sign in';
      m.innerHTML = '<button data-c="account-toggle">👤 ' + acct + '</button><a href="start.html?src=mh_menu">🛠️ ' + t('pro1').replace('?', '') + '</a><a href="requests.html">📋 Requests</a><button data-c="share-site">↗ Share</button><button data-c="media-toggle">◉ Media</button>';
      D.body.appendChild(m);
      bg.onclick = function (e) { e.stopPropagation(); m.hidden = !m.hidden; };
      m.onclick = function (e) { var b = e.target.closest('[data-c]'); if (!b) return; m.hidden = true; var o = D.getElementById(b.dataset.c); if (o) { o.style.setProperty('display', 'inline-flex', 'important'); o.click(); o.style.removeProperty('display'); } };
      D.addEventListener('click', function (e) { if (!m.hidden && !m.contains(e.target)) m.hidden = true; });
    }
    var h = D.createElement('section'); h.id = 'mh-hero';
    h.innerHTML = pics.map(function (p, i) { return '<div class="bg' + (i ? '' : ' on') + '" style="background-image:url(images/home/' + p + '.jpg)"></div>'; }).join('') +
      '<div class="pn"><h1 id="mh-h"></h1><button id="mh-q" type="button">🔍 <span id="mh-qt"></span></button></div><div id="mh-dots">' + pics.map(function (_, i) { return '<i' + (i ? '' : ' class="on"') + '></i>'; }).join('') + '</div>';
    hero.parentNode.insertBefore(h, hero);
    var pro = D.createElement('a'); pro.id = 'mh-pro'; pro.href = 'start.html?src=mh_pro';
    pro.innerHTML = '<span class="ic">🛠️</span><div><b id="mh-p1"></b><small id="mh-p2"></small></div><span class="j" id="mh-pj"></span>';
    h.parentNode.insertBefore(pro, h.nextSibling);
    var tick = D.querySelector('.cl-pros'); if (tick) pro.parentNode.insertBefore(tick, pro.nextSibling);
    var bgs = h.querySelectorAll('.bg'), dots = h.querySelectorAll('#mh-dots i'), k = 0;
    setInterval(function () { if (D.hidden) return; bgs[k].classList.remove('on'); dots[k].classList.remove('on'); k = (k + 1) % bgs.length; bgs[k].classList.add('on'); dots[k].classList.add('on'); }, 4500);
    D.getElementById('mh-q').onclick = function () { ev('mh_open'); flow(1); };
    text(); setInterval(text, 1000);
  }
  var lastL = '';
  function text() {
    var L = es() ? 'es' : 'en'; if (L === lastL) return; lastL = L;
    var set = function (id, v) { var e = D.getElementById(id); if (e) e.textContent = v; };
    set('mh-h', t('h')); set('mh-qt', t('q')); set('mh-p1', t('pro1')); set('mh-p2', t('pro2')); set('mh-pj', t('join'));
  }

  var F;
  function shell(pct, inner) {
    if (!F) { F = D.createElement('div'); F.id = 'mh-flow'; D.body.appendChild(F); H.style.overflow = 'hidden'; }
    F.innerHTML = '<div class="tp"><img src="texcontractor-logo.png" alt="TexContractor"><button class="x" type="button" aria-label="Close">×</button></div><div class="bar"><i style="width:' + pct + '%"></i></div><div class="mn">' + inner + '</div>';
    F.querySelector('.x').onclick = close;
  }
  function close() { if (F) { F.remove(); F = null; } H.style.overflow = ''; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function flow(step) {
    if (step === 1) {
      shell(20, '<h2>' + esc(t('q')) + '</h2><div class="srch">🔍<input id="mf-s" type="search" autocomplete="off" placeholder="' + esc(es() ? 'Ej. plomero, aire acondicionado' : 'e.g. plumber, AC repair') + '"></div><div class="ls" id="mf-l"></div>');
      var all = names(), inp = D.getElementById('mf-s'), ls = D.getElementById('mf-l');
      var draw = function () {
        var q = inp.value.trim().toLowerCase();
        var hit = all.filter(function (n) { return !q || n.toLowerCase().indexOf(q) >= 0; }).slice(0, q ? 30 : 12);
        if (q && !hit.length) hit = all.filter(function (n) { return q.split(/\s+/).some(function (w) { return w.length > 2 && n.toLowerCase().indexOf(w.slice(0, 4)) >= 0; }); }).slice(0, 12);
        ls.innerHTML = hit.map(function (n) { return '<button type="button" data-n="' + esc(n) + '">' + esc(n) + '</button>'; }).join('');
      };
      inp.oninput = draw; draw(); setTimeout(function () { inp.focus(); }, 50);
      ls.onclick = function (e) { var b = e.target.closest('[data-n]'); if (!b) return; st.svc = b.dataset.n; st.label = b.dataset.n; ev('mh_service'); flow(2); };
      return;
    }
    if (step === 2) {
      var sv = saved(); st.zip = st.zip || sv.zip || ''; st.city = st.city || sv.city || ''; st.state = st.state || sv.state || '';
      shell(55, '<h2>' + esc(st.label + t('near')) + '</h2><label>' + esc(t('where')) + '</label><div class="zp"><div class="in"><div style="flex:1"><small>' + esc(t('zip')) + '</small><input id="mf-z" inputmode="numeric" maxlength="5" autocomplete="postal-code" value="' + esc(st.zip) + '"></div><span class="ok" id="mf-ok">✓</span></div></div><div class="city" id="mf-c"></div><button class="btn" id="mf-n" type="button">' + esc(t('next')) + '</button><button class="bk" id="mf-b" type="button">' + esc(t('back')) + '</button>');
      var z = D.getElementById('mf-z'), c = D.getElementById('mf-c'), ok = D.getElementById('mf-ok'), seq = 0;
      var look = function () {
        var v = (z.value.match(/\d{5}/) || [''])[0]; ok.classList.remove('on'); c.className = 'city'; c.textContent = '';
        if (!v) return; var my = ++seq;
        fetch('https://api.zippopotam.us/us/' + v).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
          if (my !== seq) return; var pl = j && j.places && j.places[0];
          if (pl) { st.city = pl['place name']; st.state = pl['state abbreviation']; c.textContent = st.city + ', ' + st.state; ok.classList.add('on'); }
          else { st.city = ''; st.state = /^(7[5-9]|885)/.test(v) ? 'TX' : ''; c.textContent = st.state ? 'TX' : ''; ok.classList.toggle('on', !!st.state); }
        }).catch(function () { if (my === seq) { st.state = /^(7[5-9]|885)/.test(v) ? 'TX' : ''; } });
      };
      z.oninput = function () { z.value = z.value.replace(/\D/g, '').slice(0, 5); if (z.value.length === 5) look(); else { ok.classList.remove('on'); c.textContent = ''; } };
      if (st.zip) look(); else setTimeout(function () { z.focus(); }, 50);
      D.getElementById('mf-b').onclick = function () { flow(1); };
      D.getElementById('mf-n').onclick = function () {
        var v = (z.value.match(/\d{5}/) || [''])[0];
        if (!v) { c.className = 'city err'; c.textContent = t('badzip'); return; }
        st.zip = v;
        try { localStorage.setItem('texcontractor-location', JSON.stringify({ city: st.city || '', state: st.state || '', zip: v })); } catch (_) {}
        ev('mh_zip'); flow(3);
      };
      return;
    }
    if (step === 3) {
      var place = st.city || st.zip;
      shell(85, '<h2>' + esc(t('how')) + '</h2>' +
        '<button class="opt sel" data-o="post" type="button"><span class="e">📝</span><span><b>' + esc(t('o1')) + '</b><span class="d">' + esc(t('o1s').replace('{c}', place)) + '</span><br><span class="tag">' + esc(t('easy')) + '</span></span></button>' +
        '<button class="opt" data-o="browse" type="button"><span class="e">🔎</span><span><b>' + esc(t('o2')) + '</b><span class="d">' + esc(t('o2s').replace('{z}', st.zip)) + '</span></span></button>' +
        '<button class="btn" id="mf-go" type="button">' + esc(t('cont')) + '</button><button class="bk" id="mf-b" type="button">' + esc(t('back')) + '</button>');
      var pick = 'post';
      F.querySelectorAll('.opt').forEach(function (o) { o.onclick = function () { F.querySelectorAll('.opt').forEach(function (x) { x.classList.remove('sel'); }); o.classList.add('sel'); pick = o.dataset.o; }; });
      D.getElementById('mf-b').onclick = function () { flow(2); };
      D.getElementById('mf-go').onclick = function () {
        var q = new URLSearchParams({ service: st.svc, zip: st.zip, utm_source: 'site', utm_medium: 'mh_' + pick });
        if (st.city) q.set('city', st.city); if (st.state) q.set('state', st.state); if (es()) q.set('lang', 'es');
        ev('mh_' + pick);
        if (pick === 'post') { q.set('post', '1'); location.href = 'requests.html?' + q.toString(); }
        else location.href = 'contractor.html?' + q.toString();
      };
    }
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', build); else build();
})();
