/* "Say hello" side panels on catalog pages (owner 11-08).
   Below the left/right side ads: a framed panel that rotates through the pros on this catalog page,
   with their photo, name and city. Pros who signed up themselves come first with a green sun glow;
   directory pros get a warm gold glow. Left panel in English, right panel in Spanish. */
(function () {
  const list = document.getElementById('providers');
  if (!list) return;
  const css = document.createElement('style');
  css.textContent = `
  .tc-hello{pointer-events:auto;box-sizing:border-box;margin-top:12px;border-radius:16px;padding:12px 8px 12px;text-align:center;
    background:linear-gradient(160deg,#101a3a 0%,#1d2b5c 100%);border:2px solid #d4a72c;box-shadow:0 0 0 4px rgba(212,167,44,.18),0 12px 26px rgba(15,23,42,.22);
    font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#fff}
  .tc-hello-top{font-weight:900;font-size:1rem;color:#f6c445;letter-spacing:.02em}
  .tc-hello-sub{font-size:.7rem;color:#cbd5e1;margin-top:1px}
  .tc-hello-card{display:block;text-decoration:none;color:#fff;margin:10px 0 8px;transition:opacity .6s ease}
  .tc-hello-ring{width:78px;height:78px;margin:6px auto 8px;border-radius:50%;padding:3px;box-sizing:border-box}
  .tc-hello-ring .avatar{width:100%!important;height:100%!important;border-radius:50%!important;font-size:.9rem!important}
  .tc-hello-card.is-new .tc-hello-ring{border:3px solid #22c55e;animation:tcHelloSun 1.6s ease-in-out infinite}
  .tc-hello-card.is-dir .tc-hello-ring{border:3px solid #f6c445;animation:tcHelloGold 2.4s ease-in-out infinite}
  .tc-hello-badge{display:inline-block;font-size:.62rem;font-weight:900;letter-spacing:.06em;padding:2px 8px;border-radius:999px;margin-bottom:4px}
  .is-new .tc-hello-badge{background:#22c55e;color:#06210f}
  .is-dir .tc-hello-badge{background:#f6c445;color:#2d2106}
  .tc-hello-name{font-weight:900;font-size:.95rem;line-height:1.15;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
  .tc-hello-city{font-size:.72rem;color:#f6c445;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .tc-hello-join{display:block;margin-top:6px;padding:7px 6px;border-radius:10px;background:linear-gradient(110deg,#ba7c0c,#edb72d 35%,#ffdc58 60%,#d99b14);
    color:#2d2106!important;font-weight:900;font-size:.72rem;line-height:1.2;text-decoration:none}
  @keyframes tcHelloSun{0%,100%{box-shadow:0 0 4px 1px rgba(34,197,94,.35)}50%{box-shadow:0 0 18px 7px rgba(34,197,94,.95),0 0 36px 14px rgba(134,239,172,.5)}}
  @keyframes tcHelloGold{0%,100%{box-shadow:0 0 4px 1px rgba(246,196,69,.35)}50%{box-shadow:0 0 16px 6px rgba(246,196,69,.9),0 0 30px 10px rgba(255,220,88,.45)}}
  @media (prefers-reduced-motion:reduce){.tc-hello-ring{animation:none!important}}`;
  document.head.appendChild(css);

  const T = {
    en: { top: '👋 Say hello', sub: 'to our pros', newB: 'NEW PRO', dirB: 'LOCAL PRO', join: 'Join us and be the pro featured here →' },
    es: { top: '👋 Saluda', sub: 'a nuestros técnicos', newB: 'NUEVO', dirB: 'TÉCNICO LOCAL', join: 'Únete y sé el técnico destacado aquí →' }
  };
  const readPros = () => [...list.querySelectorAll('article.provider')].map((card) => {
    const name = card.querySelector('.provider-name')?.textContent.trim();
    if (!name) return null;
    const status = card.querySelector('.provider-status')?.textContent || '';
    const link = card.querySelector('a[href*="profile.html"]');
    const loc = [...card.querySelectorAll('.provider-rating')].map((p) => p.textContent.trim()).find((t) => /,\s*[A-Z]{2}$/.test(t)) || '';
    return { name, city: loc, isNew: !/local provider/i.test(status), href: link ? link.href : '#', avatar: card.querySelector('.avatar') };
  }).filter(Boolean);

  const getPros = () => { const all = readPros(); return [...all.filter((p) => p.isNew), ...all.filter((p) => !p.isNew).slice(0, 200)]; };
  const build = (aside, lang, offset) => {
    if (!aside || aside.querySelector('.tc-hello')) return;
    const t = T[lang];
    const box = document.createElement('div'); box.className = 'tc-hello'; box.lang = lang;
    box.innerHTML = `<div class="tc-hello-top">${t.top}</div><div class="tc-hello-sub">${t.sub}</div><a class="tc-hello-card"></a><a class="tc-hello-join" href="start.html?src=say_hello">${t.join}</a>`;
    aside.appendChild(box);
    const slot = box.querySelector('.tc-hello-card');
    let i = offset;
    const show = () => {
      const pros = getPros(); if (!pros.length) return; const p = pros[i % pros.length]; i += 1;
      slot.style.opacity = '0';
      setTimeout(() => {
        slot.className = 'tc-hello-card ' + (p.isNew ? 'is-new' : 'is-dir');
        slot.href = p.href;
        slot.innerHTML = '';
        const ring = document.createElement('div'); ring.className = 'tc-hello-ring';
        if (p.avatar) ring.appendChild(p.avatar.cloneNode(true));
        const badge = document.createElement('span'); badge.className = 'tc-hello-badge'; badge.textContent = p.isNew ? t.newB : t.dirB;
        const nm = document.createElement('div'); nm.className = 'tc-hello-name'; nm.textContent = p.name;
        const ct = document.createElement('div'); ct.className = 'tc-hello-city'; ct.textContent = p.city;
        slot.append(ring, badge, nm, ct);
        slot.style.opacity = '1';
      }, 350);
    };
    show();
    setInterval(show, 4000);
  };

  let tries = 0;
  const start = () => {
    const left = document.querySelector('.tc-side-ad-left'), right = document.querySelector('.tc-side-ad-right');
    if ((!left && !right) || !readPros().length) { if (++tries < 180) setTimeout(start, 500); return; }
    // Signed-up pros first (green), then directory pros. The list is re-read on every turn,
    // so pros that finish loading later join the rotation.
    build(left, 'en', 0);
    build(right, 'es', 1);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
