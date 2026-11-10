/* Residential / Commercial badges (owner 11-09): a pro picks who they work for when signing up.
   work_type = 'residential' | 'commercial' | 'both' | null. Blue = residential, orange = commercial. */
(function () {
  if (window.texWorkBadge) return;
  const css = document.createElement('style');
  css.textContent = '.tc-wt{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.tc-wt span{display:inline-flex;align-items:center;gap:4px;font:800 .78rem/1.2 system-ui,-apple-system,sans-serif;padding:4px 10px;border-radius:999px;color:#fff}.tc-wt .wt-r{background:#1d4ed8}.tc-wt .wt-c{background:#ea580c}.tc-wt.sm span{font-size:.7rem;padding:3px 8px}';
  document.head.appendChild(css);
  const es = () => { try { return localStorage.getItem('texcontractor-language') === 'es'; } catch (_) { return false; } };
  window.texWorkBadge = function (type, small) {
    if (!type || !/^(residential|commercial|both)$/.test(type)) return null;
    const box = document.createElement('div'); box.className = 'tc-wt' + (small ? ' sm' : '');
    const add = (cls, txt) => { const s = document.createElement('span'); s.className = cls; s.textContent = txt; box.append(s); };
    if (type !== 'commercial') add('wt-r', '🏠 ' + (es() ? 'Residencial' : 'Residential'));
    if (type !== 'residential') add('wt-c', '🏢 ' + (es() ? 'Comercial' : 'Commercial'));
    return box;
  };
})();
