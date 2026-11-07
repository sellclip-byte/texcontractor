/* Rotating strip of REAL pros (owner 11-07). Pros who signed up themselves come first (newest first),
   then pros from the directory in the visitor's state. Names, services and cities are real; no numbers shown.
   Usage: <div id="pros-ticker" data-state="TX"></div> + this script. */
(function () {
  const SB = 'https://rryehtaskbjnfbodymjj.supabase.co', K = 'sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r';
  const SKIP_OWNERS = ['6d83440a-820a-4309-b666-cba8e24a8290', '31948bfc-fb9f-490e-af1f-0f3d42dca767']; // bulk directory account, owner's own account
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
    '.pt-t2{font:900 17px system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:calc(100vw - 150px)}';
  document.head.appendChild(css);

  const get = (path) => fetch(`${SB}/rest/v1/${path}`, { headers: { apikey: K } }).then((r) => (r.ok ? r.json() : [])).catch(() => []);
  (async () => {
    const state = (box.dataset.state || new URLSearchParams(location.search).get('state') || 'TX').toUpperCase();
    const reg = await get(`texcontractor_public_services?select=id,owner_id,display_name,service,city,state,profile_photo_path&is_published=eq.true&owner_id=not.in.(${SKIP_OWNERS.join(',')})&order=created_at.desc&limit=30`);
    const registered = reg.filter((r) => r.owner_id && !SKIP_OWNERS.includes(r.owner_id)).slice(0, 20);
    const pages = await Promise.all([0, 1, 2, 3].map(() => get(`texcontractor_approved_imported_directory?select=id,business_name,service,city,state&state=eq.${encodeURIComponent(state)}&limit=60&offset=${Math.floor(Math.random() * 1500)}`)));
    const seenSvc = new Set(); const dir = [];
    pages.flat().sort(() => Math.random() - 0.5).forEach((d) => { if (!seenSvc.has(d.service) && dir.length < 18) { seenSvc.add(d.service); dir.push(d); } });
    const items = registered.map((r) => ({ name: r.display_name, service: r.service, city: [r.city, r.state].filter(Boolean).join(', '),
      href: `profile.html?contractor=${r.id}&service=${encodeURIComponent(r.service || '')}`,
      photo: r.profile_photo_path ? `${SB}/storage/v1/object/public/texcontractor-media/${String(r.profile_photo_path).split('/').map(encodeURIComponent).join('/')}` : '' }))
      .concat(dir.slice(0, 18).map((d) => ({ name: d.business_name, service: d.service, city: d.city, href: `profile.html?imported=${d.id}&service=${encodeURIComponent(d.service || '')}`, photo: '' })));
    if (!items.length) return;
    box.innerHTML = `<div class="pt-box"><div class="pt-top">${es ? 'Miles de técnicos locales · Escríbeles gratis' : 'Thousands of local pros · Text them free'}</div><div class="pt-win"></div></div>`;
    const win = box.querySelector('.pt-win');
    win.innerHTML = items.map((it) => { const [ic, lab] = label(it.service);
      return `<a class="pt-item" href="${esc(it.href)}" style="transform:translateY(100%);opacity:0"><span class="pt-ic">${it.photo ? `<img src="${esc(it.photo)}" alt="" loading="lazy">` : ic}</span><span><span class="pt-t1"><i></i>${esc(lab)} ${es ? 'en' : 'in'} ${esc(it.city)}</span><br><span class="pt-t2">${esc(it.name)}</span></span></a>`; }).join('');
    const els = [...win.children]; let i = 0;
    const show = () => { els.forEach((e, k) => { e.style.transform = k === i ? 'translateY(0)' : (k === (i - 1 + els.length) % els.length ? 'translateY(-100%)' : 'translateY(100%)'); e.style.opacity = k === i ? 1 : 0; }); };
    show(); setInterval(() => { if (document.hidden) return; i = (i + 1) % els.length; show(); }, 2400);
  })();
})();
