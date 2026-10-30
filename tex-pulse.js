/* Decorative "signal" animation for the homepage: a red light blinks next to a place
   in the right-hand sidebar, then a phone-style signal travels to a service card.
   Purely visual. Faster 9:00-20:00 (visitor's local time), slow at night. */
(function () {
  'use strict';
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const css = `
  .tcp-led{position:fixed;width:10px;height:10px;border-radius:50%;background:#e11d2e;box-shadow:0 0 0 2px rgba(225,29,46,.25),0 0 10px 3px rgba(225,29,46,.75);z-index:60;pointer-events:none;transform:translate(-50%,-50%);transition:left .55s cubic-bezier(.4,0,.2,1),top .55s cubic-bezier(.4,0,.2,1),opacity .3s}
  .tcp-led.blink{animation:tcpBlink .32s steps(2,start) infinite}
  @keyframes tcpBlink{50%{opacity:.15}}
  .tcp-wave{position:fixed;width:12px;height:12px;border:2px solid #e11d2e;border-radius:50%;z-index:59;pointer-events:none;transform:translate(-50%,-50%) scale(.4);opacity:.9;animation:tcpWave .9s ease-out forwards}
  @keyframes tcpWave{to{transform:translate(-50%,-50%) scale(4.2);opacity:0}}
  .tcp-bolt{position:fixed;width:8px;height:8px;border-radius:50%;background:#e11d2e;box-shadow:0 0 12px 4px rgba(225,29,46,.6);z-index:60;pointer-events:none;transform:translate(-50%,-50%)}
  .tcp-trail{position:fixed;width:5px;height:5px;border-radius:50%;background:rgba(225,29,46,.55);z-index:59;pointer-events:none;transform:translate(-50%,-50%);animation:tcpFade .5s linear forwards}
  @keyframes tcpFade{to{opacity:0;transform:translate(-50%,-50%) scale(.2)}}
  .tcp-hit{animation:tcpHit 1.3s ease-out}
  @keyframes tcpHit{0%{box-shadow:0 0 0 0 rgba(225,29,46,.0)}25%{box-shadow:0 0 0 4px rgba(225,29,46,.55),0 0 22px 6px rgba(225,29,46,.35)}100%{box-shadow:0 0 0 0 rgba(225,29,46,0)}}
  .tcp-sig{position:absolute;top:8px;right:8px;z-index:5;pointer-events:none;width:26px;height:22px}
  .tcp-sig i{position:absolute;right:0;bottom:0;border:2.5px solid #e11d2e;border-left-color:transparent;border-bottom-color:transparent;border-radius:50%;transform:rotate(45deg);opacity:0;animation:tcpBars 1.1s ease-out forwards}
  .tcp-sig i:nth-child(1){width:8px;height:8px;animation-delay:0s}.tcp-sig i:nth-child(2){width:15px;height:15px;animation-delay:.12s}.tcp-sig i:nth-child(3){width:22px;height:22px;animation-delay:.24s}
  @keyframes tcpBars{30%{opacity:1}100%{opacity:0}}`;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.bottom > 70 && r.top < innerHeight - 10 && r.right > 0 && r.left < innerWidth; };
  // Listings per state (sqrt-weighted so no single state dominates) and each state's time zone.
  const W = {tx:5092,ca:2961,fl:1147,la:1110,ny:1015,il:530,ok:451,va:304,nj:223,oh:207,mi:201,in:200,ia:200,pa:200,nc:200,tn:200,wa:200,ma:200,co:200,az:200,wi:180,md:148,mn:125,ga:64,sc:44,mo:43,ut:27,id:26,al:25,nm:25,ne:24,ak:24,hi:24,ks:23,ri:23,ms:23,ar:23,ct:22,or:22,nd:22,ky:22,nv:21,dc:21,sd:21,mt:20,de:18,me:17,vt:16,wv:16,nh:15,wy:13};
  const Z = {E:'America/New_York',C:'America/Chicago',M:'America/Denver',A:'America/Phoenix',P:'America/Los_Angeles',K:'America/Anchorage',H:'Pacific/Honolulu'};
  const TZ = {};
  'ct de dc fl ga in ky me md ma mi nh nj ny nc oh pa ri sc vt va wv'.split(' ').forEach(k => TZ[k] = Z.E);
  'al ar il ia ks la mn ms mo ne nd ok sd tn tx wi'.split(' ').forEach(k => TZ[k] = Z.C);
  'co id mt nm ut wy'.split(' ').forEach(k => TZ[k] = Z.M);
  TZ.az = Z.A; TZ.ak = Z.K; TZ.hi = Z.H; 'ca nv or wa'.split(' ').forEach(k => TZ[k] = Z.P);
  const hourIn = (tz) => { if (window.tcpForceDay) return 12; try { return +new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone: tz }).format(new Date()); } catch (_) { return new Date().getHours(); } };
  const awake = (h) => (h >= 9 && h < 20) ? 1 : (h >= 7 && h < 22) ? 0.3 : 0.03;
  const stateWeight = (k) => Math.sqrt(W[k] || 10) * awake(hourIn(TZ[k] || Z.C));
  const MAXW = Object.keys(W).reduce((s, k) => s + Math.sqrt(W[k]), 0);

  let led = null;
  function ensureLed() { if (!led) { led = document.createElement('div'); led.className = 'tcp-led'; led.style.opacity = '0'; document.body.appendChild(led); } return led; }

  let sideBusy = 0;
  function pickState() {
    const side = document.querySelector('.cr-side');
    if (!side || !visible(side)) return null;
    const links = [...side.querySelectorAll('#cr-states a')].map(a => [a, (a.getAttribute('href') || '').replace(/^.*local\/([a-z]{2}).*$/, '$1')]).filter(x => x[1].length === 2);
    if (!links.length) return null;
    const ws = links.map(x => stateWeight(x[1])), tot = ws.reduce((a, b) => a + b, 0);
    let r = Math.random() * tot, i = 0; while (i < ws.length - 1 && (r -= ws[i]) > 0) i++;
    const a = links[i][0];
    // Bring the state into view inside the sidebar only (never scroll the page), unless the visitor is using the sidebar.
    if (!visible(a) && Date.now() > sideBusy) { const sr = side.getBoundingClientRect(), ar = a.getBoundingClientRect(); side.scrollTo({ top: side.scrollTop + (ar.top - sr.top) - sr.height / 2, behavior: 'smooth' }); }
    return a;
  }
  function targets() { return [...document.querySelectorAll('.services-grid .service-card')].filter(visible); }

  function flyTo(x0, y0, x1, y1, done) {
    const bolt = document.createElement('div'); bolt.className = 'tcp-bolt'; document.body.appendChild(bolt);
    const cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - rnd(60, 140); // curved path
    const dur = rnd(520, 900), t0 = performance.now(); let last = 0;
    (function step(t) {
      const p = Math.min(1, (t - t0) / dur), e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const x = (1 - e) * (1 - e) * x0 + 2 * (1 - e) * e * cx + e * e * x1, y = (1 - e) * (1 - e) * y0 + 2 * (1 - e) * e * cy + e * e * y1;
      bolt.style.left = x + 'px'; bolt.style.top = y + 'px';
      if (t - last > 28) { last = t; const tr = document.createElement('div'); tr.className = 'tcp-trail'; tr.style.left = x + 'px'; tr.style.top = y + 'px'; document.body.appendChild(tr); setTimeout(() => tr.remove(), 520); }
      if (p < 1) requestAnimationFrame(step); else { bolt.remove(); done(); }
    })(t0);
  }

  function cycle() {
    if (document.hidden) return schedule();
    const src = pickState(), t = targets();
    if (!src || !t.length) return schedule();
    const card = pick(t);
    const L = ensureLed();
    setTimeout(() => {
      if (!visible(src)) { L.style.opacity = '0'; return schedule(); }
      const r = src.getBoundingClientRect();
      L.style.left = (r.left - 9) + 'px'; L.style.top = (r.top + r.height / 2) + 'px'; L.style.opacity = '1';
    }, 650);
    setTimeout(() => {
      if (L.style.opacity === '0') return;
      L.classList.add('blink');
      const blinkFor = rnd(900, 2100);
      setTimeout(() => {
        L.classList.remove('blink');
        const lr = L.getBoundingClientRect(), x0 = lr.left + 5, y0 = lr.top + 5;
        for (let i = 0; i < 2; i++) setTimeout(() => { const w = document.createElement('div'); w.className = 'tcp-wave'; w.style.left = x0 + 'px'; w.style.top = y0 + 'px'; document.body.appendChild(w); setTimeout(() => w.remove(), 950); }, i * 180);
        const cr = card.getBoundingClientRect();
        flyTo(x0, y0, cr.left + cr.width / 2, cr.top + Math.min(cr.height / 2, 90), () => {
          card.classList.remove('tcp-hit'); void card.offsetWidth; card.classList.add('tcp-hit');
          if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
          const sig = document.createElement('span'); sig.className = 'tcp-sig'; sig.innerHTML = '<i></i><i></i><i></i>'; card.appendChild(sig); setTimeout(() => sig.remove(), 1500);
          L.style.opacity = '0';
          schedule();
        });
      }, blinkFor);
    }, 1300);
  }
  function schedule() {
    // How much of the country is awake right now decides the pace: busy in the day, very light at night.
    const act = Object.keys(W).reduce((s, k) => s + stateWeight(k), 0) / MAXW;
    const ms = act > 0.5 ? rnd(2500, 7500) : act > 0.15 ? rnd(7000, 16000) : rnd(30000, 75000);
    setTimeout(cycle, ms);
  }
  document.addEventListener('pointerover', (e) => { if (e.target.closest && e.target.closest('.cr-side')) sideBusy = Date.now() + 10000; }, { passive: true });
  document.addEventListener('wheel', (e) => { if (e.target.closest && e.target.closest('.cr-side')) sideBusy = Date.now() + 10000; }, { passive: true });
  const start = () => setTimeout(cycle, rnd(1500, 3500));
  if (document.readyState === 'complete') start(); else addEventListener('load', start);
})();
