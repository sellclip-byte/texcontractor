/* Owner 11-21: first visit with no saved location -> guess city/ZIP from the visitor's connection (Cloudflare, no permission popup).
   It only pre-fills. The visitor still sees the ZIP step and confirms or changes it. */
(function () {
  var KEY = 'texcontractor-location';
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) {}
  if (saved.zip || saved.city || /[?&](zip|city)=/.test(location.search)) { window.texGeoReady = Promise.resolve(null); return; }
  var ctl = typeof AbortController === 'function' ? new AbortController() : null;
  var t = setTimeout(function () { if (ctl) ctl.abort(); }, 2500);
  window.texGeoReady = fetch('https://mcp.texcontractor.com/geo', { signal: ctl ? ctl.signal : undefined, credentials: 'omit' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (g) {
      clearTimeout(t);
      if (!g || g.country !== 'US' || !/^\d{5}$/.test(String(g.zip || '')) || !g.city || !/^[A-Z]{2}$/.test(String(g.state || ''))) return null;
      var cur = {}; try { cur = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) {}
      if (cur.zip || cur.city) return null; // visitor picked something meanwhile
      var loc = { city: g.city, state: g.state, zip: g.zip, guess: 1 };
      try { localStorage.setItem(KEY, JSON.stringify(loc)); } catch (_) {}
      try {
        document.querySelectorAll('.location-bar').forEach(function (b) {
          if (/Choose a city|Elige/i.test(b.textContent)) b.textContent = '📍 ' + g.city + ', ' + g.state + ' · ZIP ' + g.zip;
        });
        var ct = document.getElementById('ch-city-t'); if (ct) ct.textContent = g.city;
        if (window.crNear) window.crNear();
        if (window.texProsTickerReload) window.texProsTickerReload();
      } catch (_) {}
      return loc;
    })
    .catch(function () { clearTimeout(t); return null; });
})();
