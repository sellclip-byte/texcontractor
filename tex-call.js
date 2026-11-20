/* Owner 11-20: TexContractor answer line. Anyone who calls hears our recorded message (EN).
   Slim "Call us" bar on top + line in footer. tel: link = one tap on phones. */
(function () {
  var NUM = '(817) 344-0807', TEL = '+18173440807';
  function es() { return (document.documentElement.lang || '').indexOf('es') === 0 || /[?&]lang=es/.test(location.search); }
  function txt() { return es() ? '¿Preguntas? Llámenos' : 'Questions? Call us'; }
  function build() {
    if (document.getElementById('tc-callbar')) return;
    var css = document.createElement('style');
    css.textContent = '#tc-callbar{display:block;background:#0e1b37;color:#fff;text-align:center;font:600 14px/1.2 system-ui,-apple-system,"Segoe UI",Arial,sans-serif;padding:7px 12px}' +
      '#tc-callbar a{color:#fff;text-decoration:none;white-space:nowrap}#tc-callbar b{color:#facc15;letter-spacing:.2px}' +
      '#tc-callbar a:hover b{text-decoration:underline}.tc-call-foot{display:block;margin:10px 0 0;font-weight:700}.tc-call-foot a{color:inherit}';
    document.head.appendChild(css);
    var bar = document.createElement('div'); bar.id = 'tc-callbar';
    bar.innerHTML = '<a href="tel:' + TEL + '" data-tc-call>📞 <span>' + txt() + '</span>: <b>' + NUM + '</b></a>';
    document.body.insertBefore(bar, document.body.firstChild);
    var f = document.querySelector('footer');
    if (f && !f.querySelector('.tc-call-foot')) { var p = document.createElement('span'); p.className = 'tc-call-foot'; p.innerHTML = '📞 <span>' + txt() + '</span>: <a href="tel:' + TEL + '">' + NUM + '</a>';
      var em = [].slice.call(f.querySelectorAll('a')).filter(function (a) { return /texcontractor\.help@gmail\.com/.test(a.textContent); })[0];
      if (em && em.parentNode) em.parentNode.insertBefore(p, em.nextSibling); else f.appendChild(p); }
    bar.querySelector('a').addEventListener('click', function () { try { window.texVisit && texVisit('call_click') } catch (e) { } });
    var last = es();
    new MutationObserver(function () { var now = es(); if (now === last) return; last = now; var t = txt();
      document.querySelectorAll('#tc-callbar span, .tc-call-foot > span').forEach(function (s) { if (s.textContent !== t) s.textContent = t; }); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
