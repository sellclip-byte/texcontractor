(function () {
  const SUPABASE_URL = 'https://rryehtaskbjnfbodymjj.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r';
  const BUCKET = 'texcontractor-media';
  const SIDE_AD_BUCKET = 'texcontractor-side-ads';
  const TABLE = 'texcontractor_submissions';
  const PUBLIC_TABLE = 'texcontractor_public_services';

  const apiHeaders = (token, json = true) => ({
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${token || SUPABASE_KEY}`,
    ...(json ? { 'Content-Type': 'application/json' } : {})
  });

  const readBody = async (response) => {
    const text = await response.text();
    if (!text) return null;
    try { return JSON.parse(text); } catch (error) { return { message: text }; }
  };

  const request = async (path, options = {}, token) => {
    const response = await fetch(`${SUPABASE_URL}${path}`, {
      ...options,
      headers: { ...apiHeaders(token, !(options.body instanceof Blob)), ...(options.headers || {}) }
    });
    const body = await readBody(response);
    if (!response.ok) {
      const message = body?.message || body?.msg || body?.error_description || body?.error || 'Supabase request failed.';
      throw new Error(message);
    }
    return body;
  };

  const encodeObjectPath = (path) => path.split('/').map((part) => encodeURIComponent(part)).join('/');
  const publicUrl = (path) => path
    ? `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${encodeObjectPath(path)}`
    : '';
  const sideAdPublicUrl = (path) => path
    ? `${SUPABASE_URL}/storage/v1/object/public/${SIDE_AD_BUCKET}/${encodeObjectPath(path)}`
    : '';

  const uploadDataUrl = async (token, path, dataUrl) => {
    if (!dataUrl) return null;
    const source = await fetch(dataUrl);
    const blob = await source.blob();
    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeObjectPath(path)}`, {
      method: 'POST',
      headers: {
        ...apiHeaders(token, false),
        'Content-Type': blob.type || 'image/jpeg',
        'x-upsert': 'false'
      },
      body: blob
    });
    const body = await readBody(response);
    if (!response.ok) {
      const message = body?.message || body?.error || body?.statusCode || 'Media upload failed.';
      throw new Error(message);
    }
    return path;
  };

  const removeObjects = async (token, paths) => {
    if (!paths.length) return;
    await fetch(`${SUPABASE_URL}/storage/v1/object/remove/${BUCKET}`, {
      method: 'POST',
      headers: apiHeaders(token),
      body: JSON.stringify({ prefixes: paths })
    }).catch(() => {});
  };

  const createSubmission = async ({ user, data, media }) => {
    const token = await TexAuth.getAccessToken();
    if (!token || !user?.id) throw new Error('Your sign-in session expired. Please sign in again.');
    const id = crypto.randomUUID();
    const uploaded = [];
    try {
      const profilePath = media.profilePhoto ? `${user.id}/${id}/profile.jpg` : null;
      if (profilePath) {
        await uploadDataUrl(token, profilePath, media.profilePhoto);
        uploaded.push(profilePath);
      }
      const workPaths = [];
      for (let index = 0; index < media.workPhotos.length; index += 1) {
        const path = `${user.id}/${id}/work-${index + 1}.jpg`;
        await uploadDataUrl(token, path, media.workPhotos[index]);
        uploaded.push(path);
        workPaths.push(path);
      }
      const record = {
        id,
        owner_id: user.id,
        owner_email: user.email || '',
        real_name: data.realName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        display_name: data.displayName.trim(),
        years: data.years,
        city: data.city.trim(),
        state: data.state.trim().toUpperCase(),
        service: data.service,
        about: data.about.trim(),
        profile_photo_path: profilePath,
        work_photo_paths: workPaths,
        status: 'approved'
      };
      const rows = await request(`/rest/v1/${TABLE}?select=*`, {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(record)
      }, token);
      await request(`/rest/v1/${PUBLIC_TABLE}`, {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          id,
          owner_id: user.id,
          display_name: data.displayName.trim(),
          years: data.years,
          city: data.city.trim(),
          state: data.state.trim().toUpperCase(),
          service: data.service,
          about: data.about.trim(),
          profile_photo_path: profilePath,
          work_photo_paths: workPaths,
          is_published: true
        })
      }, token);
      return rows?.[0] || record;
    } catch (error) {
      await removeObjects(token, uploaded);
      throw error;
    }
  };

  const getAdminRecord = async (user) => {
    const token = await TexAuth.getAccessToken();
    if (!token || !user?.id) return null;
    const query = `?select=user_id,role&user_id=eq.${encodeURIComponent(user.id)}&limit=1`;
    const rows = await request(`/rest/v1/texcontractor_admins${query}`, { method: 'GET' }, token);
    return rows?.[0] || null;
  };

  const getHomepageBanner = async () => {
    const token = await TexAuth.getAccessToken();
    if (!token) throw new Error('Your sign-in session expired. Please sign in again.');
    const params = new URLSearchParams({
      select: 'key,message_text,style,font_style,text_color,background_color,accent_color,animation,is_enabled',
      key: 'eq.homepage_banner',
      limit: '1'
    });
    const rows = await request(`/rest/v1/texcontractor_site_settings?${params.toString()}`, { method: 'GET' }, token);
    const updated = rows?.[0] || null;
    return updated;
  };

  const updateHomepageBanner = async (patch, user) => {
    const token = await TexAuth.getAccessToken();
    if (!token || !user?.id) throw new Error('Your sign-in session expired. Please sign in again.');
    const body = { ...patch, updated_by: user.id, updated_at: new Date().toISOString() };
    const query = '?key=eq.homepage_banner&select=key,message_text,style,font_style,text_color,background_color,accent_color,animation,is_enabled';
    const rows = await request(`/rest/v1/texcontractor_site_settings${query}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(body)
    }, token);
    return rows?.[0] || null;
  };

  const listSideAds = async () => {
    const token = await TexAuth.getAccessToken();
    if (!token) throw new Error('Your sign-in session expired. Please sign in again.');
    const params = new URLSearchParams({
      select: 'id,side,placement,message_text,style,font_style,text_color,background_color,accent_color,animation,image_path,image_alt,is_enabled',
      order: 'side.asc'
    });
    return request(`/rest/v1/texcontractor_side_ads?${params.toString()}`, { method: 'GET' }, token) || [];
  };

  const uploadSideAdImage = async (file, side, user) => {
    const token = await TexAuth.getAccessToken();
    if (!token || !user?.id) throw new Error('Your sign-in session expired. Please sign in again.');
    if (!file || !String(file.type || '').startsWith('image/')) throw new Error('Please choose an image file.');
    if (file.size > 10 * 1024 * 1024) throw new Error('The image must be 10 MB or smaller.');
    const extension = (file.name.split('.').pop() || 'img').toLowerCase().replace(/[^a-z0-9]/g, '') || 'img';
    const path = `admin/${side}-${crypto.randomUUID()}.${extension}`;
    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${SIDE_AD_BUCKET}/${encodeObjectPath(path)}`, {
      method: 'POST',
      headers: { ...apiHeaders(token, false), 'Content-Type': file.type, 'x-upsert': 'false' },
      body: file
    });
    const body = await readBody(response);
    if (!response.ok) throw new Error(body?.message || body?.error || 'Ad image upload failed.');
    return path;
  };

  const removeSideAdImage = async (path, user) => {
    if (!path || !user?.id) return;
    const token = await TexAuth.getAccessToken();
    if (!token) return;
    await fetch(`${SUPABASE_URL}/storage/v1/object/remove/${SIDE_AD_BUCKET}`, {
      method: 'POST',
      headers: apiHeaders(token),
      body: JSON.stringify({ prefixes: [path] })
    }).catch(() => {});
  };

  const upsertSideAd = async (row, patch, user) => {
    const token = await TexAuth.getAccessToken();
    if (!token || !user?.id) throw new Error('Your sign-in session expired. Please sign in again.');
    const body = { ...patch, updated_by: user.id, updated_at: new Date().toISOString() };
    const select = 'id,side,placement,message_text,style,font_style,text_color,background_color,accent_color,animation,image_path,image_alt,is_enabled';
    const endpoint = row?.id
      ? `/rest/v1/texcontractor_side_ads?id=eq.${encodeURIComponent(row.id)}&select=${select}`
      : '/rest/v1/texcontractor_side_ads';
    const rows = await request(endpoint, {
      method: row?.id ? 'PATCH' : 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(row?.id ? body : { ...body, side: patch.side, placement: patch.placement })
    }, token);
    return rows?.[0] || null;
  };

  const listMembers = async () => {
    const token = await TexAuth.getAccessToken();
    if (!token) throw new Error('Your sign-in session expired. Please sign in again.');
    const params = new URLSearchParams({
      select: 'user_id,email,display_name,avatar_url,provider,status,status_note,status_changed_at,created_at,last_sign_in_at,updated_at',
      order: 'created_at.desc'
    });
    return request(`/rest/v1/texcontractor_members?${params.toString()}`, { method: 'GET' }, token) || [];
  };

  const updateMember = async (userId, patch, user) => {
    const token = await TexAuth.getAccessToken();
    if (!token || !user?.id) throw new Error('Your sign-in session expired. Please sign in again.');
    const body = {
      ...patch,
      status_changed_at: new Date().toISOString(),
      status_changed_by: user.id,
      updated_at: new Date().toISOString()
    };
    const query = `?user_id=eq.${encodeURIComponent(userId)}&select=*`;
    const rows = await request(`/rest/v1/texcontractor_members${query}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(body)
    }, token);
    return rows?.[0] || null;
  };

  const listSubmissions = async (status = 'all') => {
    const token = await TexAuth.getAccessToken();
    if (!token) throw new Error('Your sign-in session expired. Please sign in again.');
    const params = new URLSearchParams({ select: '*', order: 'created_at.desc' });
    if (status && status !== 'all') params.set('status', `eq.${status}`);
    return request(`/rest/v1/${TABLE}?${params.toString()}`, { method: 'GET' }, token) || [];
  };

  const listReports = async () => {
    const token = await TexAuth.getAccessToken();
    if (!token) throw new Error('Your sign-in session expired. Please sign in again.');
    return request(`/rest/v1/texcontractor_reports?select=id,technician_id,reason,details,created_at&order=created_at.desc`, { method: 'GET' }, token) || [];
  };

  const updateSubmission = async (id, patch, user) => {
    const token = await TexAuth.getAccessToken();
    if (!token || !user?.id) throw new Error('Your sign-in session expired. Please sign in again.');
    const body = {
      ...patch,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      updated_at: new Date().toISOString()
    };
    const query = `?id=eq.${encodeURIComponent(id)}&select=*`;
    const rows = await request(`/rest/v1/${TABLE}${query}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(body)
    }, token);
    const updated = rows?.[0] || null;
    if (updated && Object.prototype.hasOwnProperty.call(patch, 'status')) {
      await request(`/rest/v1/${PUBLIC_TABLE}?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ is_published: patch.status === 'approved', updated_at: new Date().toISOString() })
      }, token).catch(() => {});
    }
    return updated;
  };

  window.TexAdminApi = { createSubmission, getAdminRecord, getHomepageBanner, listMembers, listReports, listSideAds, listSubmissions, publicUrl, removeSideAdImage, sideAdPublicUrl, uploadSideAdImage, updateHomepageBanner, updateMember, upsertSideAd, updateSubmission };
})();
