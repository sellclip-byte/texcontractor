/* Pro pricing badge (owner 11-08): hourly rate, starting price, free estimate or "let's make a deal". Set by the pro; optional. */
(function () {
  const css = '.tc-price{display:inline-flex;align-items:center;gap:6px;margin:6px 0 2px;padding:4px 12px;border-radius:999px;font-weight:800;font-size:.9rem;line-height:1.3}' +
    '.tc-price.tcp-hourly{background:#075c4b;color:#fff}.tc-price.tcp-starting{background:#fff3d6;color:#7a5200;border:1px solid #e8c766}' +
    '.tc-price.tcp-estimate{background:#e0f2fe;color:#075985}.tc-price.tcp-deal{background:#f1f5f9;color:#334155;border:1px solid #cbd5e1}';
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const es = () => { try { return localStorage.getItem('texcontractor-language') === 'es'; } catch (_) { return false; } };
  const money = (n) => '$' + Number(n).toLocaleString('en-US');
  window.texPriceBadge = function (p) {
    if (!p || !p.price_type) return null;
    const e = es(), t = p.price_type, a = p.price_amount;
    let txt = '';
    if (t === 'hourly' && a) txt = '⏱ ' + money(a) + (e ? ' / hora' : ' / hour');
    else if (t === 'starting' && a) txt = '💲 ' + (e ? 'Trabajos desde ' : 'Jobs from ') + money(a);
    else if (t === 'estimate') txt = '📋 ' + (e ? 'Presupuesto gratis' : 'Free estimate');
    else if (t === 'deal') txt = '🤝 ' + (e ? 'Hablemos y hacemos trato' : "Let's talk & make a deal");
    if (!txt) return null;
    const s = document.createElement('span'); s.className = 'tc-price tcp-' + t; s.textContent = txt;
    s.title = e ? 'Precio indicado por el técnico' : 'Price set by the pro';
    return s;
  };
})();
