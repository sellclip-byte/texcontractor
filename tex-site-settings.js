(function () {
  const SUPABASE_URL = 'https://rryehtaskbjnfbodymjj.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r';
  const DEFAULT_BANNER = {
    key: 'homepage_banner',
    message_text: 'Find a local service, view the work, and text a contractor directly for a quote.',
    style: 'card',
    font_style: 'bold',
    text_color: '#075c4b',
    background_color: '#ecfff8',
    accent_color: '#a9e8d2',
    animation: 'static',
    is_enabled: true,
    banner_image_url: null,
    banner_image_enabled: true
  };

  const safeHex = (value, fallback) => /^#[0-9a-f]{6}$/i.test(String(value || '')) ? String(value) : fallback;
  const allowed = (value, values, fallback) => values.includes(value) ? value : fallback;
  const normalise = (row) => {
    const source = row || DEFAULT_BANNER;
    return {
      ...DEFAULT_BANNER,
      ...source,
      message_text: String(source.message_text || DEFAULT_BANNER.message_text).slice(0, 300),
      style: allowed(source.style, ['card', 'outline', 'minimal'], DEFAULT_BANNER.style),
      font_style: allowed(source.font_style, ['normal', 'bold', 'italic', 'uppercase'], DEFAULT_BANNER.font_style),
      text_color: safeHex(source.text_color, DEFAULT_BANNER.text_color),
      background_color: safeHex(source.background_color, DEFAULT_BANNER.background_color),
      accent_color: safeHex(source.accent_color, DEFAULT_BANNER.accent_color),
      animation: allowed(source.animation, ['static', 'pulse', 'scroll'], DEFAULT_BANNER.animation),
      banner_image_url: typeof source.banner_image_url === 'string' ? source.banner_image_url : null,
      banner_image_enabled: source.banner_image_enabled !== false,
      is_enabled: source.is_enabled !== false
    };
  };

  const getHomepageBanner = async () => {
    const params = new URLSearchParams({
      select: 'key,message_text,style,font_style,text_color,background_color,accent_color,animation,is_enabled,banner_image_url,banner_image_enabled',
      key: 'eq.homepage_banner',
      limit: '1'
    });
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/texcontractor_site_settings?${params.toString()}`, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
      });
      if (!response.ok) return { ...DEFAULT_BANNER };
      const rows = await response.json();
      return normalise(rows?.[0]);
    } catch (error) {
      return { ...DEFAULT_BANNER };
    }
  };

  window.TexSiteSettings = { DEFAULT_BANNER, getHomepageBanner, normalise };
})();

// Keep footer guidance in a dedicated, shareable page without altering catalog artwork.
(function () {
  const footer = document.querySelector('.site-footer');
  if (!footer) return;
  const existing = Array.from(footer.querySelectorAll('[data-footer-key]'));
  for (const link of existing) {
    link.href = 'site-guide.html#' + link.dataset.footerKey;
    link.removeAttribute('data-footer-key');
  }
  const addLink = (anchor, topic, label) => {
    if (!anchor || footer.querySelector('a[href="site-guide.html#' + topic + '"]')) return;
    const link = document.createElement('a');
    link.href = 'site-guide.html#' + topic;
    link.textContent = label;
    anchor.after(link);
    return link;
  };
  const about = footer.querySelector('a[href="site-guide.html#about"]');
  const features = addLink(about, 'features', 'Website Features');
  addLink(features || about, 'share', 'Share TexContractor');
  addLink(footer.querySelector('a[href="site-guide.html#help"]'), 'install', 'Add to Your Phone');
})();
