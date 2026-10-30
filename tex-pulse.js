/* Decorative signal animation for the homepage: a red light blinks next to a state in the
   right-hand sidebar and, a moment later, a service card pulses with a phone-style signal.
   Pace follows each state's local time: lively and irregular in the day, very light at night. */
(function () {
  'use strict';
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const css = `
  .tcp-led{position:fixed;width:10px;height:10px;border-radius:50%;background:#e11d2e;box-shadow:0 0 0 2px rgba(225,29,46,.25),0 0 10px 3px rgba(225,29,46,.75);z-index:60;pointer-events:none;transform:translate(-50%,-50%);opacity:0;transition:opacity .25s}
  .tcp-led.on{opacity:1}
  .tcp-led.blink{animation:tcpBlink .32s steps(2,start) infinite}
  @keyframes tcpBlink{50%{opacity:.15}}
  .tcp-wave{position:fixed;width:12px;height:12px;border:2px solid #e11d2e;border-radius:50%;z-index:59;pointer-events:none;transform:translate(-50%,-50%) scale(.4);opacity:.9;animation:tcpWave .9s ease-out forwards}
  @keyframes tcpWave{to{transform:translate(-50%,-50%) scale(4.2);opacity:0}}
  .tcp-hit{animation:tcpHit 1.4s ease-out}
  @keyframes tcpHit{0%,100%{box-shadow:0 0 0 0 rgba(225,29,46,0)}12%,36%,60%{box-shadow:0 0 0 3px rgba(225,29,46,.6),0 0 20px 5px rgba(225,29,46,.3)}24%,48%{box-shadow:0 0 0 1px rgba(225,29,46,.2)}}
  .tcp-sig{position:absolute;top:8px;right:8px;z-index:5;pointer-events:none;width:26px;height:22px}
  .tcp-sig i{position:absolute;right:0;bottom:0;border:2.5px solid #e11d2e;border-left-color:transparent;border-bottom-color:transparent;border-radius:50%;transform:rotate(45deg);opacity:0;animation:tcpBars 1.2s ease-out forwards}
  .tcp-sig i:nth-child(1){width:8px;height:8px}.tcp-sig i:nth-child(2){width:15px;height:15px;animation-delay:.12s}.tcp-sig i:nth-child(3){width:22px;height:22px;animation-delay:.24s}
  @keyframes tcpBars{30%{opacity:1}100%{opacity:0}}`;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  const rnd = (a, b) => a + Math.random() * (b - a);
  const expo = (mean) => -Math.log(1 - Math.random()) * mean; // irregular, natural gaps
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
  const activity = () => Object.keys(W).reduce((s, k) => s + stateWeight(k), 0) / MAXW;

  let sideBusy = 0, running = 0;
  const side = () => document.querySelector('.cr-side');
  const stateLinks = () => [...(side() ? side().querySelectorAll('#cr-states a') : [])].map(a => [a, (a.getAttribute('href') || '').replace(/^.*local\/([a-z]{2}).*$/, '$1')]).filter(x => x[1].length === 2);
  function weighted(list) {
    const ws = list.map(x => stateWeight(x[1])), tot = ws.reduce((a, b) => a + b, 0);
    if (!tot) return null;
    let r = Math.random() * tot, i = 0; while (i < ws.length - 1 && (r -= ws[i]) > 0) i++;
    return list[i][0];
  }
  // Primary event: any state (the sidebar list scrolls itself to it, never the page).
  function pickAny() {
    const s = side(); if (!s || !visible(s)) return null;
    const a = weighted(stateLinks()); if (!a) return null;
    if (!visible(a)) { if (Date.now() < sideBusy) return null; const sr = s.getBoundingClientRect(), ar = a.getBoundingClientRect(); s.scrollTo({ top: s.scrollTop + (ar.top - sr.top) - sr.height / 2, behavior: 'smooth' }); }
    return a;
  }
  // Extra events in a burst: only states already on screen, so the list doesn't jump.
  function pickVisible(exclude) { const l = stateLinks().filter(x => visible(x[0]) && !exclude.includes(x[0])); return l.length ? weighted(l) : null; }
  function pickCard(exclude) { const c = [...document.querySelectorAll('.services-grid .service-card')].filter(el => visible(el) && !exclude.includes(el)); return c.length ? c[Math.floor(Math.random() * c.length)] : null; }

  const busyStates = [], busyCards = [];
  function fire(stateEl) {
    if (!stateEl || running >= 3) return;
    running++; busyStates.push(stateEl);
    const led = document.createElement('div'); led.className = 'tcp-led'; document.body.appendChild(led);
    const done = () => { led.remove(); busyStates.splice(busyStates.indexOf(stateEl), 1); running--; };
    setTimeout(() => {
      if (!visible(stateEl)) return done();
      const r = stateEl.getBoundingClientRect();
      led.style.left = (r.left - 9) + 'px'; led.style.top = (r.top + r.height / 2) + 'px';
      led.classList.add('on', 'blink');
      setTimeout(() => {
        led.classList.remove('blink');
        const lr = led.getBoundingClientRect(), x = lr.left + lr.width / 2, y = lr.top + lr.height / 2;
        for (let i = 0; i < 2; i++) setTimeout(() => { const w = document.createElement('div'); w.className = 'tcp-wave'; w.style.left = x + 'px'; w.style.top = y + 'px'; document.body.appendChild(w); setTimeout(() => w.remove(), 950); }, i * 180);
        setTimeout(() => { led.classList.remove('on'); setTimeout(done, 300); }, 500);
        // The card answers a moment later, on its own (no visible travel).
        setTimeout(() => {
          const card = pickCard(busyCards); if (!card) return;
          busyCards.push(card);
          if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
          card.classList.remove('tcp-hit'); void card.offsetWidth; card.classList.add('tcp-hit');
          const sig = document.createElement('span'); sig.className = 'tcp-sig'; sig.innerHTML = '<i></i><i></i><i></i>'; card.appendChild(sig);
          setTimeout(() => { sig.remove(); busyCards.splice(busyCards.indexOf(card), 1); }, 1500);
        }, rnd(250, 1100));
      }, rnd(900, 2100));
    }, 650);
  }

  function tick() {
    const modal = [...document.querySelectorAll('dialog[open], .join-pop')].some(el => el.offsetParent !== null || (el.tagName === 'DIALOG' && el.open));
    if (!document.hidden && !modal) {
      const act = activity();
      fire(pickAny());
      // Daytime bursts: sometimes 1-2 more states light up within a few seconds.
      if (act > 0.15 && Math.random() < (act > 0.5 ? 0.35 : 0.15)) {
        const extra = Math.random() < 0.3 ? 2 : 1;
        for (let i = 0; i < extra; i++) setTimeout(() => fire(pickVisible(busyStates)), rnd(400, 3000));
      }
    }
    const act = activity();
    const mean = act > 0.5 ? 5200 : act > 0.15 ? 11000 : 50000;
    setTimeout(tick, Math.max(act > 0.5 ? 1800 : 5000, Math.min(expo(mean), act > 0.5 ? 16000 : act > 0.15 ? 30000 : 110000)));
  }
  document.addEventListener('pointerover', (e) => { if (e.target.closest && e.target.closest('.cr-side')) sideBusy = Date.now() + 10000; }, { passive: true });
  document.addEventListener('wheel', (e) => { if (e.target.closest && e.target.closest('.cr-side')) sideBusy = Date.now() + 10000; }, { passive: true });
  const start = () => setTimeout(tick, rnd(1500, 3500));
  if (document.readyState === 'complete') start(); else addEventListener('load', start);
})();
