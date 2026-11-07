/* Rotating strip of REAL pros (owner 11-07). Pros who signed up themselves come first (newest first),
   then pros from the directory in the visitor's state. Names, services and cities are real; no numbers shown.
   Usage: <div id="pros-ticker" data-state="TX"></div> + this script. */
(function () {
  const SB = 'https://rryehtaskbjnfbodymjj.supabase.co', K = 'sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r';
  const SKIP_OWNERS = ['6d83440a-820a-4309-b666-cba8e24a8290', '31948bfc-fb9f-490e-af1f-0f3d42dca767', '6e632781-16c6-4b59-8690-3d78d59d2850']; // bulk directory account, owner's own + test accounts
  const NO_STAR = ['57d13423-6c06-4d75-a0ed-6c9d64692f09']; // owner 11-07: no highlight for ISA
  const box = document.getElementById('pros-ticker');
  if (!box) return;
  const es = (document.documentElement.lang || '').startsWith('es');
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const SHORT = [
    [/air condition|hvac|heating/i, '❄️', 'AC repair', 'Reparación de A/C'], [/electric/i, '⚡', 'Electrician', 'Electricista'],
    [/plumb/i, '🔧', 'Plumber', 'Plomero'], [/roof/i, '🏠', 'Roofer', 'Techador'], [/junk/i, '🚛', 'Junk removal', 'Retiro de basura'],
    [/dj/i, '🎧', 'DJ', 'DJ'], [/photo/i, '📸', 'Photographer', 'Fotógrafo'], [/makeup/i, '💄', 'Makeup artist', 'Maquillista'],
    [/paint/i, '🎨', 'Painter', 'Pintor'], [/lawn mower|outdoor equipment/i, '🔩', 'Mower repair', 'Reparación de podadoras'],
    [/landscap|lawn|yard/i, '🌿', 'Landscaping', 'Jardinería'], [/mechanic|auto/i, '🚗', 'Mechanic', 'Mecánico'],
    [/garage door/i, '🚪', 'Garage doors', 'Puertas de garaje'], [/door/i, '🚪', 'Doors', 'Puertas'], [/furniture|assembl/i, '🪑', 'Assembly', 'Armado de muebles'],
    [/clean/i, '🧽', 'Cleaning', 'Limpieza'], [/mov/i, '📦', 'Movers', 'Mudanzas'], [/pool/i, '🏊', 'Pool service', 'Albercas'],
    [/tree/i, '🌳', 'Tree service', 'Árboles'], [/fenc/i, '🪵', 'Fences', 'Cercas'], [/handyman/i, '🛠️', 'Handyman', 'Handyman'],
    [/tv|mount/i, '📺', 'TV mounting', 'Instalación de TV'], [/event|plann/i, '🎉', 'Event planner', 'Organizador de eventos']
  ];
  const label = (service) => { const m = SHORT.find((x) => x[0].test(service || '')); return m ? [m[1], es ? m[3] : m[2]] : ['🛠️', String(service || 'Local pro').slice(0, 26)]; };

  const css = document.createElement('style');
  css.textContent = '.pt-box{margin:14px 0;border-radius:18px;background:linear-gradient(135deg,#0f1b3d,#1b2f63);padding:12px 14px 14px;color:#fff;box-shadow:0 10px 24px rgba(15,27,61,.22);border:2px solid #d9a92b;overflow:hidden}' +
    '.pt-top{font:800 14px system-ui,sans-serif;color:#f2c14e;text-align:center}.pt-win{position:relative;height:66px;margin-top:10px;overflow:hidden}' +
    '.pt-item{position:absolute;inset:0;display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.08);border-radius:14px;padding:0 12px;text-decoration:none;color:#fff;transition:transform .5s ease,opacity .5s ease}' +
    '.pt-ic{width:44px;height:44px;border-radius:50%;background:#f2c14e;display:flex;align-items:center;justify-content:center;font-size:22px;flex:none;overflow:hidden}.pt-ic img{width:100%;height:100%;object-fit:cover}' +
    '.pt-t1{font:700 12px system-ui,sans-serif;color:#c7d2fe}.pt-t1 i{display:inline-block;width:8px;height:8px;border-radius:50%;background:#f2c14e;margin-right:6px}' +
    '@keyframes ptPulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.9)}50%{box-shadow:0 0 0 7px rgba(34,197,94,0)}}@keyframes ptBlink{0%,100%{opacity:1}50%{opacity:.25}}' +
    '.pt-item.pt-star .pt-ic{border-color:#22c55e!important;border-width:3px;border-style:solid;animation:ptPulse 1s ease-in-out infinite}.pt-item.pt-star .pt-t1 i{background:#22c55e!important;animation:ptBlink .8s ease-in-out infinite}.pt-item.pt-star{border-color:#22c55e!important}' +
    '.pt-t2{font:900 17px system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:calc(100vw - 150px)}';
  document.head.appendChild(css);

  const get = (path) => fetch(`${SB}/rest/v1/${path}`, { headers: { apikey: K } }).then((r) => (r.ok ? r.json() : [])).catch(() => []);
  let timer = null, cssDone = false, cities = null;
  const savedLoc = () => { try { return JSON.parse(localStorage.getItem('texcontractor-location') || '{}') || {}; } catch (_) { return {}; } };
  const load = async () => {
    const q = new URLSearchParams(location.search), loc = savedLoc();
    const state = (box.dataset.state || q.get('state') || loc.state || 'TX').toUpperCase();
    const city = String(q.get('city') || loc.city || '').trim();
    const reg = await get(`texcontractor_public_services?select=id,owner_id,display_name,service,city,state,profile_photo_path&is_published=eq.true&owner_id=not.in.(${SKIP_OWNERS.join(',')})&order=created_at.desc&limit=30`);
    // Pros who signed up themselves: same city first, then same state. Elsewhere in the country they are not shown.
    const regAll = reg.filter((r) => r.owner_id && !SKIP_OWNERS.includes(r.owner_id));
    const sameCity = (r) => city && String(r.city || '').toLowerCase() === city.toLowerCase();
    const registered = regAll.filter(sameCity).concat(regAll.filter((r) => !sameCity(r) && String(r.state || '').toUpperCase() === state)).slice(0, 20);
    const cityRows = city ? await get(`texcontractor_approved_imported_directory?select=id,business_name,service,city,state&state=eq.${encodeURIComponent(state)}&city=ilike.${encodeURIComponent(city)}&limit=80`) : [];
    const pages = await Promise.all([0, 400, 400, 400].map((m) => get(`texcontractor_approved_imported_directory?select=id,business_name,service,city,state&state=eq.${encodeURIComponent(state)}&limit=60&offset=${Math.floor(Math.random() * m)}`)));
    const seenSvc = new Set(), seenId = new Set(); const dir = [];
    const take = (list) => list.sort(() => Math.random() - 0.5).forEach((d) => { if (!seenId.has(d.id) && !seenSvc.has(d.service) && dir.length < 18) { seenSvc.add(d.service); seenId.add(d.id); dir.push(d); } });
    take(cityRows);
    // Not enough in the city itself: fill from the nearest cities (owner 11-07: Arlington -> Mansfield, Kennedale, Grand Prairie...).
    if (city && dir.length < 18) {
      try {
        cities = cities || await fetch('/local/cities.json').then((r) => (r.ok ? r.json() : { cities: [] })).then((j) => j.cities || []);
        const st = state.toLowerCase() + '/';
        const me = cities.find((c) => c[0].startsWith(st) && c[1].toLowerCase() === city.toLowerCase());
        if (me) {
          const d2 = (c) => { const x = (c[3] - me[3]) * Math.cos(me[2] * Math.PI / 180), y = c[2] - me[2]; return Math.sqrt(x * x + y * y) * 69; };
          const near = cities.filter((c) => c !== me && c[0].startsWith(st)).map((c) => [c, d2(c)]).filter((x) => x[1] <= 45).sort((a, b) => a[1] - b[1]).slice(0, 14);
          if (near.length) {
            const rank = new Map(near.map((x, k) => [x[0][1].toLowerCase(), k]));
            const rows = await get(`texcontractor_approved_imported_directory?select=id,business_name,service,city,state&state=eq.${encodeURIComponent(state)}&city=in.(${near.map((x) => '"' + encodeURIComponent(x[0][1]) + '"').join(',')})&limit=300`);
            rows.sort(() => Math.random() - 0.5).sort((a, b) => (rank.get(String(a.city).toLowerCase()) ?? 99) - (rank.get(String(b.city).toLowerCase()) ?? 99));
            rows.forEach((d) => { if (!seenId.has(d.id) && !seenSvc.has(d.service) && dir.length < 18) { seenSvc.add(d.service); seenId.add(d.id); dir.push(d); } });
          }
        }
      } catch (_) {}
    }
    take(pages.flat());
    const items = registered.map((r) => ({ star: !NO_STAR.includes(r.id), name: r.display_name, service: r.service, city: [r.city, r.state].filter(Boolean).join(', '),
      href: `profile.html?contractor=${r.id}&service=${encodeURIComponent(r.service || '')}`,
      photo: r.profile_photo_path ? `${SB}/storage/v1/object/public/texcontractor-media/${String(r.profile_photo_path).split('/').map(encodeURIComponent).join('/')}` : '' }))
      .concat(dir.map((d) => ({ name: d.business_name, service: d.service, city: [d.city, d.state].filter(Boolean).join(', '), href: `profile.html?imported=${d.id}&service=${encodeURIComponent(d.service || '')}`, photo: '' })));
    if (!items.length) return;
    const tile = box.dataset.variant === 'tile';
    if (tile && !cssDone) { cssDone = true;
      const tcss = document.createElement('style');
      tcss.textContent = '.pt-tile{height:100%;box-sizing:border-box;border-radius:16px;border:2px solid #e8c766;background:linear-gradient(135deg,#fffaf0,#fff3d6);padding:10px;color:#111827;box-shadow:0 6px 18px rgba(15,23,42,.08);display:flex;flex-direction:column;justify-content:center}' +
        '.pt-tile .pt-top{color:#1b2f63;font-size:13px;text-align:left}.pt-tile .pt-sub{color:#374151;font:600 11.5px system-ui,sans-serif;margin-top:1px}.pt-tile .pt-win{height:70px;margin-top:8px}' +
        '.pt-tile .pt-item{gap:10px;background:linear-gradient(135deg,#0f1b3d,#1b2f63);color:#fff;border:2px solid #d9a92b;padding:0 10px}' +
        '.pt-tile .pt-ic{width:46px;height:46px;font-size:22px;border:2px solid #f2c14e}.pt-tile .pt-t1{color:#f2c14e;font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block}' +
        '.pt-tile .pt-t2{color:#fff;font-size:15px;max-width:none;display:block}.pt-tile .pt-txt{min-width:0;flex:1}.pt-tile .pt-txt br{display:none}' +
        '@media(max-width:760px){.pt-tile{padding:8px}.pt-tile .pt-top{font-size:11px}.pt-tile .pt-sub{display:none}.pt-tile .pt-win{height:96px;margin-top:6px}.pt-tile .pt-item{flex-direction:column;justify-content:center;gap:3px;padding:4px 6px;text-align:center}.pt-tile .pt-ic{width:38px;height:38px;font-size:19px}.pt-tile .pt-t1{font-size:10.5px;white-space:normal;line-height:1.2}.pt-tile .pt-t2{font-size:13px}.pt-tile .pt-txt{flex:none;max-width:100%}}';
      document.head.appendChild(tcss);
    }
    box.innerHTML = tile ? `<div class="pt-box pt-tile">` + `<div class="pt-top">${es ? '🛠️ TÉCNICOS EN TEXCONTRACTOR' : '🛠️ PROS ON TEXCONTRACTOR'}</div><div class="pt-sub">${es ? 'Únete y aparece aquí con tu foto' : 'Join and show up here with your photo'}</div><div class="pt-win"></div></div>` : `<div class="pt-box"><div class="pt-top">${es ? 'Miles de técnicos locales · Escríbeles gratis' : 'Thousands of local pros · Text them free'}</div><div class="pt-win"></div></div>`;
    const win = box.querySelector('.pt-win');
    win.innerHTML = items.map((it) => { const [ic, lab] = label(it.service);
      return `<a class="pt-item${it.star ? ' pt-star' : ''}" href="${esc(it.href)}" style="transform:translateY(100%);opacity:0"><span class="pt-ic">${it.photo ? `<img src="${esc(it.photo)}" alt="" loading="lazy">` : ic}</span><span class="pt-txt"><span class="pt-t1"><i></i>${esc(lab)} ${es ? 'en' : 'in'} ${esc(it.city)}</span><br><span class="pt-t2">${esc(it.name)}</span></span></a>`; }).join('');
    const els = [...win.children]; let i = 0;
    const show = () => { els.forEach((e, k) => { e.style.transform = k === i ? 'translateY(0)' : (k === (i - 1 + els.length) % els.length ? 'translateY(-100%)' : 'translateY(100%)'); e.style.opacity = k === i ? 1 : 0; }); };
    // Pros who signed up themselves stay 4 seconds with a green flash; the others 2.4 seconds.
    const next = () => { timer = setTimeout(() => { if (!document.hidden) { i = (i + 1) % els.length; show(); } next(); }, els[i].classList.contains('pt-star') ? 4000 : 2400); };
    show(); clearTimeout(timer); next();
  };
  window.texProsTickerReload = load;
  load();
})();
