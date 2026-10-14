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
    banner_image_url: null,
    banner_image_link_url: null,
    banner_height_px: 180,
    banner_width_percent: 100,
    banner_font_size_px: 28,
    is_enabled: true
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
      banner_image_url: /^https:\/\//i.test(source.banner_image_url || '') ? source.banner_image_url : null,
      banner_image_link_url: /^https:\/\//i.test(source.banner_image_link_url || '') ? source.banner_image_link_url : null,
      banner_height_px: Math.max(60,Math.min(700,Number(source.banner_height_px)||180)),
      banner_width_percent: Math.max(30,Math.min(100,Number(source.banner_width_percent)||100)),
      banner_font_size_px: Math.max(12,Math.min(80,Number(source.banner_font_size_px)||28)),
      is_enabled: source.is_enabled !== false
    };
  };

  const getHomepageBanner = async () => {
    const params = new URLSearchParams({
      select: 'key,message_text,style,font_style,text_color,background_color,accent_color,animation,is_enabled,banner_image_url,banner_image_link_url,banner_height_px,banner_width_percent,banner_font_size_px',
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
