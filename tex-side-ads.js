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
  const BASE_SELECT = 'side,placement,message_text,style,font_style,text_color,background_color,accent_color,animation,image_path,image_alt,is_enabled';
  const fetchAds = (select) => {
    const params = new URLSearchParams({ select, is_enabled: 'eq.true', order: 'side.asc' });
    return fetch(`${SUPABASE_URL}/rest/v1/texcontractor_side_ads?${params.toString()}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
  };
  const getAds = async () => {
    let response = await fetchAds(`${BASE_SELECT},media_type,video_path,video_poster_path`);
    // If the optional video columns are unavailable, keep showing the image ads exactly as before.
    if (!response.ok) response = await fetchAds(BASE_SELECT);
    if (!response.ok) return [];
    const rows = await response.json();
    const current = pageKey();
    const candidates = Array.isArray(rows) ? rows.filter((row) => row.placement === current || row.placement === 'all') : [];
    return ['left', 'right'].map((side) => {
      const sideRows = candidates.filter((row) => row.side === side);
      return sideRows.find((row) => row.placement === current) || sideRows.find((row) => row.placement === 'all');
    }).filter(Boolean);
  };
  // Optional right-slot video: the existing image stays in place (hidden) so the frame keeps
  // exactly the same size and position. Nothing is downloaded until the visitor presses play.
  const addVideo = (imageWrap, image, ad) => {
    const video = document.createElement('video');
    video.className = 'tc-side-ad-video';
    video.controls = true;
    video.preload = 'none';
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.poster = imageUrl(ad.video_poster_path || ad.image_path);
    video.setAttribute('aria-label', ad.image_alt || 'TexContractor intro video');
    const source = document.createElement('source');
    source.src = imageUrl(ad.video_path);
    source.type = 'video/mp4';
    video.appendChild(source);
    const tools = document.createElement('div');
    tools.className = 'tc-side-ad-video-tools';
    const icon = (d) => `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path fill="currentColor" d="${d}"/></svg>`;
    const SOUND_ON = 'M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.47 4.47 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z';
    const SOUND_OFF = 'M16.5 12A4.5 4.5 0 0 0 14 8v2.2l2.45 2.45c.03-.2.05-.42.05-.65zM19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.8 8.8 0 0 0 21 12a9 9 0 0 0-7-8.8v2.1A7 7 0 0 1 19 12zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25A7 7 0 0 1 14 18.7v2.1a9 9 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z';
    const soundButton = document.createElement('button');
    soundButton.type = 'button';
    const syncSound = () => {
      const muted = video.muted || video.volume === 0;
      soundButton.innerHTML = icon(muted ? SOUND_OFF : SOUND_ON);
      soundButton.setAttribute('aria-label', muted ? 'Turn sound on' : 'Turn sound off');
      soundButton.title = muted ? 'Sound on' : 'Sound off';
    };
    soundButton.addEventListener('click', () => { video.muted = !video.muted; if (!video.muted && video.volume === 0) video.volume = 1; syncSound(); });
    video.addEventListener('volumechange', syncSound);
    syncSound();
    const fullButton = document.createElement('button');
    fullButton.type = 'button';
    fullButton.innerHTML = icon('M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z');
    fullButton.setAttribute('aria-label', 'Full screen');
    fullButton.title = 'Full screen';
    fullButton.addEventListener('click', () => {
      if (document.fullscreenElement) return document.exitFullscreen().catch(() => {});
      if (video.requestFullscreen) return video.requestFullscreen().catch(() => {});
      if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
    });
    tools.append(soundButton, fullButton);
    const fallback = () => {
      video.remove();
      tools.remove();
      imageWrap.classList.remove('has-video');
    };
    source.addEventListener('error', fallback, { once: true });
    video.addEventListener('error', fallback, { once: true });
    imageWrap.classList.add('has-video');
    imageWrap.append(video, tools);
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
      if (ad.side === 'right' && ad.media_type === 'video' && ad.video_path) addVideo(imageWrap, image, ad);
    }
    if (ad.message_text) {
      const copy = document.createElement('div');
      copy.className = 'tc-side-ad-copy';
      copy.textContent = ad.message_text;
      body.appendChild(copy);
    }
    aside.appendChild(body);
    if (homepageLeft) document.body.insertBefore(aside, document.querySelector('footer'));
    else document.body.appendChild(aside);
  };
  const injectStyles = () => {
    if (document.getElementById('tc-side-ads-style')) return;
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
      .tc-side-ad-image-wrap.has-video { position: relative; background: #000; }
      .tc-side-ad-image-wrap.has-video img { visibility: hidden; }
      .tc-side-ad-video { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: contain; background: #000; pointer-events: auto; }
      .tc-side-ad-video-tools { position: absolute; top: 6px; right: 6px; display: flex; gap: 6px; pointer-events: auto; }
      .tc-side-ad-video-tools button { display: grid; place-items: center; width: 30px; height: 30px; padding: 0; border: 0; border-radius: 50%; color: #fff; background: rgba(0,0,0,.62); cursor: pointer; }
      .tc-side-ad-video-tools button:hover, .tc-side-ad-video-tools button:focus-visible { background: rgba(0,0,0,.85); outline: 2px solid #fff; outline-offset: 1px; }
      .tc-side-ad-copy { padding: 8px 3px 2px; font-size: .88rem; line-height: 1.35; overflow-wrap: anywhere; }
      .tc-side-ad-body.font-normal .tc-side-ad-copy { font-weight: 500; }
      .tc-side-ad-body.font-bold .tc-side-ad-copy { font-weight: 900; }
      .tc-side-ad-body.font-italic .tc-side-ad-copy { font-style: italic; }
      .tc-side-ad-body.font-uppercase .tc-side-ad-copy { font-weight: 900; text-transform: uppercase; }
      .tc-side-ad-body.motion-pulse { animation: tc-side-ad-pulse 2.8s ease-in-out infinite; }
      .tc-side-ad-body.motion-scroll .tc-side-ad-copy { white-space: nowrap; animation: tc-side-ad-scroll 15s linear infinite; }
      @keyframes tc-side-ad-pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.02); opacity: .84; } }
      @keyframes tc-side-ad-scroll { from { transform: translateX(100%); } to { transform: translateX(-100%); } }
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
