// City + service pages (local/ and es/local/): a clear ZIP box under the title, like the big
// directories do. The ZIP the visitor already gave us is filled in; one tap shows the pros
// for this service nearest that ZIP (owner 11-11).
(function () {
  try {
    if (!/\/local\/[a-z]{2}\/[^/]+\/[^/]+\.html$/.test(location.pathname)) return; // only city+service pages
    var h1 = document.querySelector('h1');
    var link = document.querySelector('a[href*="contractor.html?service="]');
    if (!h1 || !link || document.getElementById('tlz')) return;
    var service = new URL(link.getAttribute('href'), location.href).searchParams.get('service');
    if (!service) return;
    var es = (document.documentElement.lang || '').indexOf('es') === 0;
    var zip = '';
    try { zip = String((JSON.parse(localStorage.getItem('texcontractor-location') || '{}') || {}).zip || '').slice(0, 5); } catch (_) {}
    var box = document.createElement('form');
    box.id = 'tlz';
    box.noValidate = true;
    box.innerHTML =
      '<div class="tlz-t">' + (es ? '📍 Ver técnicos cerca de tu código postal' : '📍 See pros near your ZIP code') + '</div>' +
      '<div class="tlz-r"><input class="tlz-z" inputmode="numeric" autocomplete="postal-code" maxlength="5" placeholder="' + (es ? 'Código postal' : 'ZIP code') + '" aria-label="' + (es ? 'Tu código postal' : 'Your ZIP code') + '">' +
      '<button type="submit" class="tlz-go">' + (es ? 'Ver técnicos →' : 'See pros →') + '</button></div>' +
      '<div class="tlz-f">' + (es ? '✓ Gratis ✓ Le escribes directo al técnico' : '✓ Free ✓ Text the pro directly') + '</div>';
    var css = document.createElement('style');
    css.textContent = '#tlz{margin:14px 0 18px;padding:14px 16px;border:2px solid #e6cf98;border-radius:16px;background:linear-gradient(135deg,#fdf9ef,#f7efdc);box-shadow:0 6px 18px rgba(60,40,0,.07);max-width:620px}' +
      '#tlz .tlz-t{font:900 1.1rem/1.25 system-ui,sans-serif;color:#064e3b}' +
      '#tlz .tlz-r{display:flex;gap:8px;margin-top:10px}' +
      '#tlz .tlz-z{flex:1;min-width:0;height:50px;border:3px solid #a16d0d;border-radius:12px;padding:0 12px;font:700 17px system-ui,sans-serif;color:#111;background:#fff}' +
      '#tlz .tlz-z::placeholder{color:#374151}' +
      '#tlz .tlz-go{height:50px;border:0;border-radius:12px;padding:0 16px;background:linear-gradient(110deg,#ba7c0c,#edb72d 40%,#ffdc58);color:#1b1404;font:900 17px system-ui,sans-serif;white-space:nowrap;cursor:pointer}' +
      '#tlz .tlz-f{margin-top:6px;font:800 13px system-ui,sans-serif;color:#14532d}';
    document.head.appendChild(css);
    h1.insertAdjacentElement('afterend', box);
    var z = box.querySelector('.tlz-z');
    if (/^\d{5}$/.test(zip)) z.value = zip;
    z.addEventListener('input', function () { z.value = z.value.replace(/\D/g, '').slice(0, 5); z.style.borderColor = ''; });
    box.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = z.value.trim();
      if (!/^\d{5}$/.test(v)) { z.style.borderColor = '#ef4444'; z.focus(); return; }
      try { localStorage.setItem('texcontractor-location', JSON.stringify({ zip: v })); } catch (_) {}
      try { window.texVisit && texVisit('local_zip'); } catch (_) {}
      location.href = '/contractor.html?' + new URLSearchParams({ service: service, zip: v }).toString() + (es ? '&lang=es' : '') + '&utm_source=site&utm_medium=local_zip';
    });
  } catch (_) {}
})();
