(function () {
  const SUPABASE_URL = 'https://rryehtaskbjnfbodymjj.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r';
  const BUCKET = 'texcontractor-side-ads';
  const pageKey = () => {
    const page = window.location.pathname.split('/').pop().toLowerCase();
    return ({
      '': 'homepage',
      'index.html': 'homepage',
      'index': 'homepage',
      'contractor.html': 'contractor',
      'contractor': 'contractor',
      'contractor-register.html': 'register',
      'contractor-register': 'register',
      'messages.html': 'messages',
      'messages': 'messages',
      'profile.html': 'profile',
      'profile': 'profile',
      'auth.html': 'auth',
      'auth': 'auth'
    })[page] || 'other';
  };
  const encodePath = (path) => path.split('/').map((part) => encodeURIComponent(part)).join('/');
  const imageUrl = (path) => path ? `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${encodePath(path)}` : '';
  const getAds = async () => {
    const params = new URLSearchParams({
      select: 'side,placement,message_text,style,font_style,text_color,background_color,accent_color,animation,image_path,image_alt,is_enabled',
      is_enabled: 'eq.true',
      order: 'side.asc'
    });
    const response = await fetch(`${SUPABASE_URL}/rest/v1/texcontractor_side_ads?${params.toString()}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
    if (!response.ok) return [];
    const rows = await response.json();
    const current = pageKey();
    const candidates = Array.isArray(rows) ? rows.filter((row) => row.placement === current || row.placement === 'all') : [];
    return ['left', 'right'].map((side) => {
      const sideRows = candidates.filter((row) => row.side === side);
      return sideRows.find((row) => row.placement === current) || sideRows.find((row) => row.placement === 'all');
    }).filter(Boolean);
  };
  const render = (ad) => {
    const aside = document.createElement('aside');
    aside.className = `tc-side-ad tc-side-ad-${ad.side}`;
    const homepageLeft = pageKey() === 'homepage' && ad.side === 'left';
    if (homepageLeft) aside.classList.add('tc-home-left-ad');
    aside.style.setProperty('--side-ad-text', ad.text_color || '#075c4b');
    aside.style.setProperty('--side-ad-background', ad.background_color || '#ecfff8');
    aside.style.setProperty('--side-ad-accent', ad.accent_color || '#a9e8d2');
    const body = document.createElement('div');
    body.className = `tc-side-ad-body ad-${ad.style || 'card'} font-${ad.font_style || 'bold'} motion-${ad.animation || 'static'}`;
    if (ad.image_path) {
      const imageWrap = document.createElement('div');
      imageWrap.className = 'tc-side-ad-image-wrap';
      const image = document.createElement('img');
      image.src = imageUrl(ad.image_path);
      image.alt = ad.image_alt || 'TexContractor advertisement';
      image.loading = 'lazy';
      imageWrap.appendChild(image);
      body.appendChild(imageWrap);
    }
    if (ad.message_text) {
      const copy = document.createElement('div');
      copy.className = 'tc-side-ad-copy';
      if (ad.style === 'vertical') {
        // Lines are separated by "|"; a line wrapped in *stars* is emphasized. Typed out like a typewriter.
        const lines = ad.message_text.split('|').map((part) => part.trim()).filter(Boolean).map((part) => {
          const big = /^\*.*\*$/.test(part);
          const el = document.createElement('span');
          el.className = big ? 'tc-side-ad-word tc-side-ad-big' : 'tc-side-ad-word tc-side-ad-small';
          el.dataset.text = big ? part.slice(1, -1) : part;
          el.textContent = el.dataset.text;
          copy.appendChild(el);
          return el;
        });
        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!reduce && lines.length) {
          const wait = (ms) => new Promise((r) => setTimeout(r, ms));
          const type = async () => {
            for (;;) {
              lines.forEach((el) => { el.textContent = '\u00a0'; el.classList.remove('tc-typing'); });
              for (const el of lines) {
                el.classList.add('tc-typing');
                const text = el.dataset.text;
                for (let i = 1; i <= text.length; i++) { el.textContent = text.slice(0, i); await wait(85); }
                el.classList.remove('tc-typing');
                await wait(250);
              }
              lines[lines.length - 1].classList.add('tc-typing');
              await wait(9000);
            }
          };
          type();
        }
      } else {
        copy.textContent = ad.message_text;
      }
      body.appendChild(copy);
    }
    aside.appendChild(body);
    if (homepageLeft) document.body.insertBefore(aside, document.querySelector('footer'));
    else document.body.appendChild(aside);
  };
  const injectStyles = () => {
    if (document.getElementById('tc-side-ads-style')) return;
    if (!document.getElementById('tc-side-ads-font')) { const font = document.createElement('link'); font.id = 'tc-side-ads-font'; font.rel = 'stylesheet'; font.href = 'https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap'; document.head.appendChild(font); }
    const style = document.createElement('style');
    style.id = 'tc-side-ads-style';
    style.textContent = `
      .tc-side-ad { box-sizing: border-box; position: fixed; z-index: 40; top: 150px; width: min(160px, 12vw); max-height: calc(100vh - 170px); color: var(--side-ad-text); pointer-events: none; }
      .tc-side-ad-left { left: 14px; }
      .tc-side-ad-right { right: 14px; }
      .tc-side-ad-body { box-sizing: border-box; max-height: calc(100vh - 170px); overflow: hidden; border-radius: 14px; padding: 9px; text-align: center; background: var(--side-ad-background); border: 1px solid var(--side-ad-accent); box-shadow: 0 10px 26px rgba(15,23,42,.12); }
      .tc-side-ad-body.ad-outline { background: transparent; border: 2px solid var(--side-ad-accent); box-shadow: none; }
      .tc-side-ad-body.ad-minimal { padding: 4px 0; background: transparent; border: 0; border-bottom: 2px solid var(--side-ad-accent); border-radius: 0; box-shadow: none; }
      .tc-side-ad-image-wrap { display: flex; align-items: center; justify-content: center; width: 100%; max-height: calc(100vh - 250px); min-height: 0; overflow: hidden; border-radius: 10px; background: rgba(255,255,255,.72); }
      .tc-side-ad-image-wrap img { display: block; width: 100%; max-width: 100%; height: auto; max-height: calc(100vh - 250px); object-fit: contain; }
      .tc-side-ad-copy { padding: 8px 3px 2px; font-size: .88rem; line-height: 1.35; overflow-wrap: anywhere; }
      .tc-side-ad-body.font-normal .tc-side-ad-copy { font-weight: 500; }
      .tc-side-ad-body.font-bold .tc-side-ad-copy { font-weight: 900; }
      .tc-side-ad-body.font-italic .tc-side-ad-copy { font-style: italic; }
      .tc-side-ad-body.font-uppercase .tc-side-ad-copy { font-weight: 900; text-transform: uppercase; }
      .tc-side-ad-body.motion-pulse { animation: tc-side-ad-pulse 2.8s ease-in-out infinite; }
      .tc-side-ad-body.motion-scroll .tc-side-ad-copy { white-space: nowrap; animation: tc-side-ad-scroll 15s linear infinite; }
      @keyframes tc-side-ad-pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.02); opacity: .84; } }
      @keyframes tc-side-ad-scroll { from { transform: translateX(100%); } to { transform: translateX(-100%); } }
      .tc-side-ad-body.ad-vertical { display: flex; align-items: center; justify-content: center; padding: 20px 8px; background: #0c3b2c; border: 0; border-radius: 16px; box-shadow: 0 0 0 2px #d4a72c, 0 12px 28px rgba(15,23,42,.18); }
      .tc-side-ad-body.ad-vertical .tc-side-ad-copy { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 0; font-family: 'Courier Prime', 'Courier New', Courier, monospace; text-align: center; overflow-wrap: normal; white-space: nowrap; }
      .tc-side-ad-word { display: block; min-height: 1.1em; }
      .tc-side-ad-big { font-size: 1.12rem; line-height: 1.1; font-weight: 700; text-transform: uppercase; letter-spacing: 0; color: #f6c445; }
      .tc-side-ad-small { font-size: .92rem; line-height: 1.15; font-weight: 700; color: #ffffff; }
      .tc-typing::after { content: '|'; margin-left: 1px; color: #f6c445; font-weight: 400; animation: tc-caret 1s steps(1) infinite; }
      @keyframes tc-caret { 50% { opacity: 0; } }
      .tc-side-ad-body.motion-shimmer { animation: tc-side-ad-glow 7s ease-in-out infinite; }
      @keyframes tc-side-ad-glow { 0%,100% { box-shadow: 0 0 0 2px #d4a72c, 0 12px 28px rgba(15,23,42,.18); } 50% { box-shadow: 0 0 0 2px #2fbf7a, 0 0 22px rgba(47,191,122,.45); } }
      @media (prefers-reduced-motion: reduce) { .tc-side-ad-body.motion-shimmer { animation: none; } }
      @media (max-width: 1120px) { .tc-side-ad { display: none; } }
      .tc-side-ad.tc-home-left-ad { display: block; position: static; width: min(200px, calc(100% - 28px)); max-height: none; margin: 20px 14px; }
      .tc-home-left-ad .tc-side-ad-body { max-height: none; overflow: visible; padding: 0; border: 0; border-radius: 0; background: transparent; box-shadow: none; }
      .tc-home-left-ad .tc-side-ad-image-wrap { max-height: none; overflow: visible; border-radius: 0; background: transparent; }
      .tc-home-left-ad .tc-side-ad-image-wrap img { width: 100%; height: auto; max-height: none; object-fit: contain; }
      @media (min-width: 1696px) { .tc-side-ad.tc-home-left-ad { position: absolute; top: 150px; left: 14px; width: 200px; margin: 0; } }
    `;
    document.head.appendChild(style);
  };
  const init = async () => {
    try {
      const ads = await getAds();
      if (!ads.length) return;
      injectStyles();
      ads.forEach(render);
    } catch (error) {
      // Side advertising is optional and must never interrupt the main site.
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();

/* Keep the welcome panel dismissed across browser sessions. */
(function () {
  const key = 'texcontractor-welcome-closed';
  const panel = document.getElementById('welcome-screen');
  const close = document.getElementById('welcome-close');
  if (!panel || !close) return;
  try {
    if (window.localStorage.getItem(key) === '1') panel.hidden = true;
  } catch (_) {}
  close.addEventListener('click', function () {
    panel.hidden = true;
    try { window.localStorage.setItem(key, '1'); } catch (_) {}
  });
})();

/* Validate numeric location searches before the homepage resolves or saves them. */
(function () {
  const input = document.getElementById('service-search');
  const form = input?.form;
  if (!form || typeof renderLocation !== 'function') return;
  let latest = 0;
  const feedback = document.createElement('p');
  feedback.id = 'zip-search-feedback';
  feedback.setAttribute('role', 'status');
  feedback.style.cssText = 'box-sizing:border-box;width:calc(100% - 32px);max-width:580px;grid-column:1 / -1;justify-self:center;text-align:center;color:#991b1b;background:#fff1f2;font-weight:700;font-size:14px;line-height:1.5;white-space:normal;padding:10px 14px;border:1px solid #fecdd3;border-radius:10px;margin:10px auto';
  feedback.hidden = true;
  const resultArea = document.getElementById('location-result')?.closest('.message-bridge');
  if (resultArea) resultArea.appendChild(feedback);
  else form.closest('header').insertAdjacentElement('afterend', feedback);
  form.addEventListener('submit', async event => {
    const raw = input.value.trim();
    const request = ++latest;
    feedback.hidden = true;
    if (!/^[0-9][0-9\s-]*$/.test(raw)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const validFormat = /^\d{5}(?:-\d{4})?$/.test(raw);
    // Keep this attempted ZIP in service links so an old city cannot be used.
    localStorage.setItem('texcontractor-location', JSON.stringify({city:'', state:'', zip:raw}));
    updateServiceLinks();
    const fail = message => {
      feedback.textContent = message;
      feedback.hidden = false;
      locationBars.forEach(bar => { bar.textContent = '📍 Not valid'; });
    };
    if (!validFormat) {
      fail('Not valid');
      return;
    }
    feedback.textContent = 'Checking ZIP code…'; feedback.hidden = false;
    try {
      const response = await fetch('https://api.zippopotam.us/us/' + encodeURIComponent(raw.slice(0,5)), {signal:AbortSignal.timeout(10000)});
      if (request !== latest) return;
      if (response.status === 404) {
        fail('Not valid');
        return;
      }
      if (!response.ok) throw new Error('ZIP lookup unavailable');
      const data = await response.json();
      if (request !== latest) return;
      const place = data.places?.[0];
      if (!place) throw new Error('ZIP lookup unavailable');
      renderLocation(place['place name'], place['state abbreviation'], raw.slice(0,5));
      serviceCards.forEach(card => { card.style.display = ''; });
      feedback.hidden = true;
    } catch (_) {
      if (request === latest) fail('We could not verify this ZIP code right now. Please try again or search by city and state.');
    }
  }, true);
})();

/* Show the chosen state's flag immediately below the homepage location result. */
(function () {
  const bars = [...document.querySelectorAll('.location-bar')];
  const input = document.getElementById('service-search');
  if (!input) return;
  const names = {"AL":"Alabama","AK":"Alaska","AZ":"Arizona","AR":"Arkansas","CA":"California","CO":"Colorado","CT":"Connecticut","DE":"Delaware","FL":"Florida","GA":"Georgia","HI":"Hawaii","ID":"Idaho","IL":"Illinois","IN":"Indiana","IA":"Iowa","KS":"Kansas","KY":"Kentucky","LA":"Louisiana","ME":"Maine","MD":"Maryland","MA":"Massachusetts","MI":"Michigan","MN":"Minnesota","MS":"Mississippi","MO":"Missouri","MT":"Montana","NE":"Nebraska","NV":"Nevada","NH":"New Hampshire","NJ":"New Jersey","NM":"New Mexico","NY":"New York","NC":"North Carolina","ND":"North Dakota","OH":"Ohio","OK":"Oklahoma","OR":"Oregon","PA":"Pennsylvania","RI":"Rhode Island","SC":"South Carolina","SD":"South Dakota","TN":"Tennessee","TX":"Texas","UT":"Utah","VT":"Vermont","VA":"Virginia","WA":"Washington","WV":"West Virginia","WI":"Wisconsin","WY":"Wyoming","DC":"District of Columbia"};
  const renderFlag = () => {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem('texcontractor-location') || '{}'); } catch (_) {}
    const state = String(saved.state || '').toUpperCase();
    const name = names[state];
    document.getElementById('homepage-state-flag')?.remove();
    if (!name) return;
    const target = bars[0] || document.querySelector('#service-catalog');
    if (!target) return;
    const badge = document.createElement('div');
    badge.id = 'homepage-state-flag';
    badge.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:8px;margin:10px 0;font-size:14px;color:#475569';
    const image = document.createElement('img');
    image.src = 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent('Flag of ' + (state === 'DC' ? 'the District of Columbia' : name) + '.svg');
    image.alt = name + ' flag'; image.width = 48; image.height = 32;
    image.style.cssText = 'display:block!important;width:48px;height:32px;object-fit:contain';
    const label = document.createElement('span'); label.textContent = name;
    badge.append(image, label);
    target.insertAdjacentElement(bars[0] ? 'afterend' : 'beforebegin', badge);
  };
  if (typeof renderLocation === 'function') {
    const original = renderLocation;
    renderLocation = function (...args) { original(...args); renderFlag(); };
  }
  const feedback = document.getElementById('zip-search-feedback');
  if (feedback) new MutationObserver(() => { if (!feedback.hidden) document.getElementById('homepage-state-flag')?.remove(); }).observe(feedback, {attributes:true,childList:true,subtree:true});
  renderFlag();
})();
