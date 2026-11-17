/* Owner 11-17: show only the last 3 digits of a pro's phone on the "Text this contractor" button.
   The full number stays private (still revealed only after sign-in). */
(function () {
  var URL_ = 'https://rryehtaskbjnfbodymjj.supabase.co/rest/v1/rpc/texcontractor_phone_last3';
  var KEY = 'sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r';
  var cache = {}, timer = null, busy = false;
  function pending() { return Array.prototype.slice.call(document.querySelectorAll('[data-pid]:not([data-l3])')); }
  function apply() {
    pending().forEach(function (el) { var v = cache[el.dataset.pid]; if (v) el.setAttribute('data-l3', v); });
  }
  function run() {
    timer = null; apply(); if (busy) return;
    var ids = [];
    pending().forEach(function (el) { var id = el.dataset.pid; if (!(id in cache) && ids.indexOf(id) < 0 && /^[0-9a-f-]{36}$/i.test(id)) ids.push(id); });
    if (!ids.length) return;
    ids = ids.slice(0, 120); ids.forEach(function (id) { cache[id] = ''; });
    busy = true;
    fetch(URL_, { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_ids: ids }) })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (rows) { (rows || []).forEach(function (r) { if (/^\d{3}$/.test(r.last3 || '')) cache[r.id] = r.last3; }); })
      .catch(function () {})
      .then(function () { busy = false; apply(); if (pending().some(function (el) { return !(el.dataset.pid in cache); })) schedule(); });
  }
  function schedule() { if (!timer) timer = setTimeout(run, 250); }
  function start() { schedule(); try { new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true }); } catch (e) {} }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
