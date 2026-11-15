/* Owner 11-14: stronger privacy line, red. Owner 11-10: visitors hesitate to type their phone ("why do you need my number?").
   Show a small reassurance line under every sign-up phone box. Text agreed with the owner. */
(function () {
  var IDS = ['phone', 'pb-phone', 'hj-ph', 'tqs-phone'];
  var EN = '🔒 Your number is private. We never sell it or show it to the public. No spam.';
  var ES = '🔒 Tu número es privado. Nunca lo vendemos ni lo mostramos al público. Sin spam.';
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
      p.style.cssText = 'margin:6px 2px 4px;font:800 13.5px/1.35 Inter,system-ui,Arial,sans-serif;color:' + (inp.id === 'hj-ph' ? '#ffd7d7' : '#c81e1e') + ';text-align:left;flex-basis:100%;width:100%';
      // Never inside a row (owner 11-10: on the home hero it squeezed the phone box): put it under the whole row/form.
      var par = inp.parentElement, anchor = inp;
      if (par) {
        var cs = getComputedStyle(par);
        if (/(^|\s)(ph|fld|hj-form)(\s|$)/.test(par.className) || par.tagName === 'LABEL' || par.tagName === 'FORM' || (/flex|grid/.test(cs.display) && cs.flexDirection !== 'column')) anchor = par;
      }
      anchor.insertAdjacentElement('afterend', p);
    });
    var t = isEs() ? ES : EN;
    document.querySelectorAll('.tex-nospam').forEach(function (p) { if (p.textContent !== t) p.textContent = t; });
    // Quick-signup popup has its own red customer line (#tqs-priv); avoid two lines there (owner 11-14).
    var tp = document.getElementById('tqs-priv'), tq = document.getElementById('tqs-phone');
    if (tp && tq) { var nl = tq.parentElement && tq.parentElement.querySelector('.tex-nospam'); var sib = nl || (function(){ var n = tq; for (var i = 0; i < 3 && n; i++) { n = n.parentElement; var f = n && n.querySelector('.tex-nospam'); if (f) return f; } return null; })(); if (sib) sib.hidden = !tp.hidden; }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', place, { once: true }); else place();
  setInterval(place, 1200);
})();
