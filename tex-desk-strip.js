/* Owner 11-21 (DESKTOP home only, >=1100px; phone unchanged):
   - Open requests become a small pill at the top (still rotating), "Post a request" + "See all requests".
   - New pros: one slow moving row at the top. Signed-up pros come first (nearby first: same city, nearby cities,
     same state, then everywhere; those with photos first), mixed in turn with directory pros of the visitor's area.
   - The hero keeps only two things side by side: the customer box and the technician box (real photo). */
(function () {
  var p = location.pathname;
  if (!(p === '/' || /\/index\.html$/.test(p))) return;
  if (!matchMedia('(min-width:1100px)').matches) return;
  var D = document, H = D.documentElement;
  H.classList.add('dk');
  var SB = 'https://rryehtaskbjnfbodymjj.supabase.co', K = 'sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r';
  var SKIP = ['6d83440a-820a-4309-b666-cba8e24a8290', '6e632781-16c6-4b59-8690-3d78d59d2850'];
  var es = function () { return (H.lang || '').indexOf('es') === 0; };
  var esc = function (v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var get = function (path) { return fetch(SB + '/rest/v1/' + path, { headers: { apikey: K } }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; }); };
  var loc = function () { try { return JSON.parse(localStorage.getItem('texcontractor-location') || '{}') || {}; } catch (_) { return {}; } };

  function layout() {
    var hero = D.getElementById('cust-hero'), rq = D.getElementById('ch-rq');
    if (!hero || !rq || D.getElementById('dk-top')) return null;
    var top = D.createElement('div'); top.id = 'dk-top';
    var np = D.createElement('div'); np.id = 'dk-np';
    np.innerHTML = '<span class="lab">👋 <span>' + (es() ? 'Nuevos técnicos' : 'New pros') + '</span></span><div class="vp"><div class="tr"></div></div>';
    top.appendChild(rq); top.appendChild(np);
    hero.insertBefore(top, hero.firstChild);
    var pro = hero.querySelector('.ch-pro');
    var txt = function () {
      if (pro) pro.innerHTML = '<span class="dk-ph"></span><span class="dk-tx"><b>' + (es() ? '¿Eres técnico?' : 'Are you a technician?') + '</b><small>' +
        (es() ? 'Regístrate gratis · Sin cobro por cliente<br>Los clientes te escriben directo' : 'Sign up free · No lead fees<br>Customers text you directly') +
        '</small><span class="arr">' + (es() ? 'Únete gratis →' : 'Join free →') + '</span></span>';
      var l = np.querySelector('.lab span'); if (l) l.textContent = es() ? 'Nuevos técnicos' : 'New pros';
    };
    // Owner 11-21: no separate call strip on top; the answer line sits right under the technician banner, joined to it.
    var call = D.createElement('a'); call.id = 'dk-call'; call.href = 'tel:+18173440807';
    var callTxt = function () { call.innerHTML = '<span class="ic">📞</span><span class="t">' + (es() ? '¿Preguntas? Llámenos' : 'Questions? Call us') + '</span><b>(817) 344-0807</b>'; };
    callTxt();
    call.addEventListener('click', function () { try { window.texVisit && texVisit('call_click_home') } catch (_) {} });
    if (pro && pro.parentNode) pro.parentNode.insertBefore(call, pro.nextSibling);
    var txt0 = txt; txt = function () { txt0(); callTxt(); };
    txt();
    var last = es();
    new MutationObserver(function () { if (es() !== last) { last = es(); txt(); } }).observe(H, { attributes: true, attributeFilter: ['lang'] });
    return np;
  }

  function dist(a, b) { var x = (b[3] - a[3]) * Math.cos(a[2] * Math.PI / 180), y = b[2] - a[2]; return Math.sqrt(x * x + y * y) * 69; }

  async function load(np) {
    var L = loc(), state = String(L.state || 'TX').toUpperCase(), city = String(L.city || '').trim(), lc = city.toLowerCase();
    var cities = []; try { cities = (await fetch('/local/cities.json').then(function (r) { return r.ok ? r.json() : {}; })).cities || []; } catch (_) {}
    var me = cities.filter(function (c) { return c[0].indexOf(state.toLowerCase() + '/') === 0 && c[1].toLowerCase() === lc; })[0];
    var near = me ? cities.filter(function (c) { return c !== me && c[0].indexOf(state.toLowerCase() + '/') === 0 && dist(me, c) <= 45; }) : [];
    var nearSet = {}; near.forEach(function (c) { nearSet[c[1].toLowerCase()] = 1; });
    var sel = 'select=id,owner_id,display_name,service,city,state,profile_photo_path,created_at&is_published=eq.true';
    var reg = await get('texcontractor_public_services?' + sel + '&owner_id=not.in.(' + SKIP.join(',') + ')&order=created_at.desc&limit=80');
    var added = await get('texcontractor_public_services?' + sel + '&owner_id=eq.' + SKIP[0] + '&created_at=gte.2026-11-11T00:00:00Z&order=created_at.desc&limit=30');
    reg = reg.concat(added);
    var rank = function (r) {
      var c = String(r.city || '').toLowerCase(), s = String(r.state || '').toUpperCase();
      var g = (s === state && c && c === lc) ? 0 : (s === state && nearSet[c]) ? 1 : (s === state) ? 2 : 3;
      return g * 2 + (r.profile_photo_path ? 0 : 1);
    };
    var seen = {}; reg = reg.filter(function (r) { if (!r.id || seen[r.id]) return false; seen[r.id] = 1; return true; })
      .sort(function (a, b) { return rank(a) - rank(b) || String(b.created_at).localeCompare(String(a.created_at)); });
    var DIR = 'texcontractor_approved_imported_directory?select=id,business_name,service,city,state';
    var dir = [], dseen = {};
    var add = function (rows) { rows.forEach(function (d) { if (d && d.id && !dseen[d.id]) { dseen[d.id] = 1; dir.push(d); } }); };
    var mix = function (a) { for (var k = a.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)), t = a[k]; a[k] = a[j]; a[j] = t; } return a; };
    if (city) add(mix(await get(DIR + '&state=eq.' + encodeURIComponent(state) + '&city=ilike.' + encodeURIComponent(city) + '&limit=60')));
    if (dir.length < 30 && near.length) add(mix(await get(DIR + '&state=eq.' + encodeURIComponent(state) + '&city=in.(' + near.slice(0, 14).map(function (c) { return '"' + encodeURIComponent(c[1]) + '"'; }).join(',') + ')&limit=80')));
    if (dir.length < 30) add(mix(await get(DIR + '&state=eq.' + encodeURIComponent(state) + '&limit=60&offset=' + Math.floor(Math.random() * 300))));
    dir = dir.slice(0, 40);
    var R = reg.map(function (r) {
      return { reg: 1, name: r.display_name, service: r.service, city: [r.city, r.state].filter(Boolean).join(', '),
        href: 'profile.html?contractor=' + r.id + '&service=' + encodeURIComponent(r.service || ''),
        photo: r.profile_photo_path ? SB + '/storage/v1/object/public/texcontractor-media/' + String(r.profile_photo_path).split('/').map(encodeURIComponent).join('/') : '' };
    });
    var Dd = dir.map(function (d) { return { name: d.business_name, service: d.service, city: [d.city, d.state].filter(Boolean).join(', '), href: 'profile.html?imported=' + d.id + '&service=' + encodeURIComponent(d.service || '') }; });
    // Mixed in turn: a signed-up pro, then a pro from the area, and so on.
    var items = [], i = 0, j = 0;
    while (i < R.length || j < Dd.length) { if (i < R.length) items.push(R[i++]); if (j < Dd.length) items.push(Dd[j++]); }
    items = items.slice(0, 60);
    if (!items.length) { np.style.display = 'none'; return; }
    var lab = es() ? ' en ' : ' · ';
    // Owner 11-21: no emoji icons. Pro without a photo -> the catalog photo of his service, else his state letters.
    var norm = function (x) { return String(x || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z]+/g, ' ').trim(); };
    var CAT = {};
    [].forEach.call(D.querySelectorAll('img[src*="images/home/catalog-"]'), function (im) { var a = norm(im.alt); if (a && !CAT[a]) CAT[a] = im.getAttribute('src'); });
    // Owner 11-21: Gemini photos for services that have no catalog photo yet.
    [['Barber & Hair Styling Services', 'barber'], ['Tutoring & Education Services', 'tutoring'], ['Babysitting & Childcare Services', 'babysitting'],
     ['Lawn Mower, Water Pump & Outdoor Equipment Repair', 'mower-repair'], ['General Automotive Services: Towing, Key Programming, Window Tinting & Tire Services', 'towing'],
     ['Specialty Meal Preparation & Dietary Cooking', 'meal-prep']].forEach(function (x) { var k = norm(x[0]); if (!CAT[k]) CAT[k] = 'images/home/catalog-x-' + x[1] + '.jpg'; });
    var catImg = function (sv) { sv = norm(sv); if (!sv) return ''; if (CAT[sv]) return CAT[sv];
      for (var k in CAT) if (k.indexOf(sv) === 0 || sv.indexOf(k) === 0 || (sv.length > 14 && k.slice(0, 18) === sv.slice(0, 18))) return CAT[k]; return ''; };
    var st = function (c) { var m = String(c || '').match(/,\s*([A-Za-z]{2})$/); return m ? m[1].toUpperCase() : 'US'; };
    var av = function (it) { var src = it.photo || catImg(it.service);
      return src ? '<img src="' + esc(src) + '" alt="" loading="lazy">' : '<span class="st">' + esc(st(it.city)) + '</span>'; };
    var card = function (it) {
      return '<a class="np' + (it.reg ? ' reg' : '') + '" href="' + esc(it.href) + '"><span class="av">' + av(it) +
        '</span><span class="tx"><small>' + esc(String(it.service || '').slice(0, 30)) + lab + esc(it.city) + '</small><b>' + esc(it.name) + '</b></span></a>';
    };
    var html = items.map(card).join('');
    var tr = np.querySelector('.tr');
    tr.innerHTML = html + html;
    tr.style.animationDuration = Math.max(40, items.length * 4) + 's';
  }

  function go() { var np = layout(); if (np) load(np); }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', go); else go();
})();
