/* Owner 11-10: visitors hesitate to type their phone ("why do you need my number?").
   Show a small reassurance line under every sign-up phone box. Text agreed with the owner. */
(function () {
  var IDS = ['phone', 'pb-phone', 'hj-ph', 'tqs-phone'];
  var EN = '🔒 We only use your number to sign you in. No spam.';
  var ES = '🔒 Solo usamos tu número para que entres. Sin spam.';
  function isEs() {
    var b = document.querySelector('[data-l="es"][aria-pressed="true"]'); if (b) return true;
    if (document.querySelector('[data-l="en"][aria-pressed="true"]')) return false;
    if ((document.documentElement.lang || '').indexOf('es') === 0) return true;
    try { return localStorage.getItem('texcontractor-language') === 'es'; } catch (_) { return false; }
  }
  function place() {
    IDS.forEach(function (id) {
      var inp = document.getElementById(id); if (!inp || inp.dataset.nospam) return;
      inp.dataset.nospam = '1';
      var p = document.createElement('p'); p.className = 'tex-nospam';
      p.style.cssText = 'margin:6px 2px 4px;font:600 12.5px/1.35 Inter,system-ui,Arial,sans-serif;color:#475569;text-align:left';
      var anchor = inp.parentElement && /(^|\s)(ph|fld)(\s|$)/.test(inp.parentElement.className) ? inp.parentElement
        : (inp.parentElement && inp.parentElement.tagName === 'LABEL' ? inp.parentElement : inp);
      anchor.insertAdjacentElement('afterend', p);
    });
    var t = isEs() ? ES : EN;
    document.querySelectorAll('.tex-nospam').forEach(function (p) { if (p.textContent !== t) p.textContent = t; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', place, { once: true }); else place();
  setInterval(place, 1200);
})();
