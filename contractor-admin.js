(function () {
  let currentUser = null;
  let members = [];
  let submissions = [];
  let importedBusinesses = [];
  let reports = [];
  let homepageBanner = null;
  const sideAds = { left: {}, right: {} };

  const $ = (selector) => document.querySelector(selector);
  const message = $('#message');
  const dashboard = $('#dashboard');
  const membersLoading = $('#members-loading');
  const submissionsLoading = $('#submissions-loading');
  const membersEmpty = $('#members-empty');
  const submissionsEmpty = $('#submissions-empty');
  const membersList = $('#members');
  const submissionsList = $('#submissions');
  const reportsLoading = $('#reports-loading');
  const reportsEmpty = $('#reports-empty');
  const reportsList = $('#reports');
  const memberSearch = $('#member-search');
  const statusFilter = $('#status-filter');
  const bannerForm = $('#banner-form');
  const bannerMessage = $('#banner-message');
  const bannerStyle = $('#banner-style');
  const bannerFontStyle = $('#banner-font-style');
  const bannerAnimation = $('#banner-animation');
  const bannerEnabled = $('#banner-enabled');
  const bannerTextColor = $('#banner-text-color');
  const bannerBackgroundColor = $('#banner-background-color');
  const bannerAccentColor = $('#banner-accent-color');
  const bannerPreviewText = $('#banner-preview-text');
  const sideAdValue = (side, name) => document.getElementById(`side-${side}-${name}`);
  const sideAdPreview = (side) => document.getElementById(`side-${side}-preview`);
  const sideAdPreviewNote = (side) => document.getElementById(`side-${side}-preview-note`);
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[character]));
  const initials = (value) => String(value || 'TC').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'TC';
  const displayDate = (value, empty = 'Not available') => {
    if (!value) return empty;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? empty : date.toLocaleString('en-US', { dateStyle:'medium', timeStyle:'short' });
  };
  const showMessage = (text, kind = 'info') => { message.textContent = text; message.className = `message show ${kind}`; };
  const formatProvider = (provider) => String(provider || 'email').split(',').map((part) => part.trim()).filter(Boolean).join(' + ');
  const mediaPaths = (row) => {
    let work = row.work_photo_paths;
    if (typeof work === 'string') { try { work = JSON.parse(work); } catch (error) { work = []; } }
    return [row.profile_photo_path, ...(Array.isArray(work) ? work : [])].filter(Boolean);
  };

  const updateSummary = () => {
    $('#member-total').textContent = members.length;
    $('#submission-total').textContent = submissions.length + importedBusinesses.length;
    $('#pending-total').textContent = submissions.filter((row) => row.status === 'pending').length + importedBusinesses.filter((row) => row.review_status === 'pending').length;
    $('#approved-total').textContent = submissions.filter((row) => row.status === 'approved').length + importedBusinesses.filter((row) => row.review_status === 'approved').length;
  };

  const renderMembers = () => {
    const query = String(memberSearch.value || '').trim().toLowerCase();
    const rows = members.filter((row) => [row.email, row.display_name, row.provider].some((value) => String(value || '').toLowerCase().includes(query)));
    membersList.innerHTML = '';
    $('#members-count').textContent = `${rows.length} shown · ${members.length} total`;
    membersEmpty.hidden = rows.length > 0;
    rows.forEach((row) => {
      const name = row.display_name || 'No profile name';
      const isCurrentAdmin = row.user_id === currentUser?.id;
      const blocked = row.status === 'blocked';
      const card = document.createElement('article');
      card.className = 'member-row';
      card.innerHTML = `
        <div class="member-avatar"><span>${escapeHtml(initials(name))}</span></div>
        <div>
          <h2 class="member-name">${escapeHtml(name)}</h2>
          <p class="member-email">${escapeHtml(row.email)}</p>
          <div class="member-meta"><span class="member-badge">${escapeHtml(formatProvider(row.provider))}</span>${isCurrentAdmin ? '<span class="member-role">Admin</span>' : ''}<span>Joined ${escapeHtml(displayDate(row.created_at, 'Unknown'))}</span></div>
        </div>
        <div class="member-side"><span class="member-state${blocked ? ' blocked' : ''}">${blocked ? 'Blocked' : 'Active'}</span><span>Last sign-in</span><strong>${escapeHtml(displayDate(row.last_sign_in_at))}</strong>${row.status_note ? `<span class="member-note">${escapeHtml(row.status_note)}</span>` : ''}<div class="member-actions">${isCurrentAdmin ? '' : `<button class="member-action ${blocked ? 'allow' : 'block'}" data-member-action type="button">${blocked ? 'Allow' : 'Block'}</button>`}</div></div>`;
      const avatar = card.querySelector('.member-avatar');
      if (row.avatar_url) {
        const image = document.createElement('img');
        image.src = row.avatar_url;
        image.alt = `${name} profile`;
        image.referrerPolicy = 'no-referrer';
        image.onerror = () => image.remove();
        avatar.replaceChildren(image);
      }
      const actions = card.querySelector('.member-actions');
      if (!isCurrentAdmin) {
        const chat = document.createElement('a');
        chat.className = 'member-action allow';
        chat.href = `messages.html?member=${encodeURIComponent(row.user_id)}`;
        chat.textContent = 'Chat';
        chat.title = 'Open the private TexContractor conversation';
        actions.prepend(chat);
      }
      if (row.email) {
        const email = document.createElement('a');
        email.className = 'member-action';
        email.href = `mailto:${row.email}?subject=${encodeURIComponent('TexContractor')}`;
        email.textContent = 'Email';
        email.title = 'Open a new email to this member';
        actions.prepend(email);
      }
      const memberAction = card.querySelector('[data-member-action]');
      if (memberAction) {
        memberAction.addEventListener('click', async () => {
          memberAction.disabled = true;
          memberAction.textContent = blocked ? 'Allowing…' : 'Blocking…';
          try {
            await TexAdminApi.updateMember(row.user_id, {
              status: blocked ? 'active' : 'blocked',
              status_note: blocked ? null : 'Blocked by administrator'
            }, currentUser);
            showMessage(blocked ? 'Member access allowed again.' : 'Member blocked from new submissions.', 'ok');
            await loadDashboard();
          } catch (error) {
            showMessage(`Could not change this member: ${error.message}`, 'error');
            memberAction.disabled = false;
            memberAction.textContent = blocked ? 'Allow' : 'Block';
          }
        });
      }
      membersList.appendChild(card);
    });
  };

  const makeMedia = (card, row) => {
    const paths = mediaPaths(row);
    if (!paths.length) return;
    const gallery = document.createElement('div');
    gallery.className = 'media';
    paths.forEach((path, index) => {
      const figure = document.createElement('figure');
      const image = document.createElement('img');
      image.src = TexAdminApi.publicUrl(path);
      image.alt = index === 0 ? 'Profile photo' : `Work photo ${index}`;
      image.loading = 'lazy';
      image.onerror = () => figure.remove();
      const caption = document.createElement('figcaption');
      caption.textContent = index === 0 ? 'Profile' : `Work ${index}`;
      figure.append(image, caption);
      gallery.appendChild(figure);
    });
    card.appendChild(gallery);
  };

  const editTechnician = (row, imported) => {
    document.querySelector('[data-technician-editor]')?.remove();
    const fields = imported
      ? [['business_name','Business name'],['phone','Phone'],['city','City'],['state','State'],['service','Service catalog'],['about','Description']]
      : [['display_name','Display name'],['real_name','Private real name'],['phone','Phone'],['email','Email'],['city','City'],['state','State'],['service','Service catalog'],['years','Years of experience'],['about','Description']];
    const overlay = document.createElement('div');
    overlay.dataset.technicianEditor = 'true';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;padding:16px';
    const panel = document.createElement('form');
    panel.style.cssText = 'background:white;color:#111827;border-radius:16px;padding:24px;width:min(680px,100%);max-height:90vh;overflow:auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px';
    const heading = document.createElement('h2');
    heading.textContent = 'Edit technician / تعديل بيانات الفني';
    heading.style.cssText = 'grid-column:1/-1;margin:0 0 8px';
    panel.appendChild(heading);
    const inputs = {};
    for (const [key,label] of fields) {
      const wrap = document.createElement('label');
      wrap.textContent = label;
      wrap.style.cssText = 'display:flex;flex-direction:column;gap:5px;font-weight:600';
      const input = key === 'about' ? document.createElement('textarea') : document.createElement('input');
      if (key === 'years') { input.type = 'number'; input.min = '0'; input.max = '80'; }
      else if (key === 'email') input.type = 'email';
      else if (key === 'website') input.type = 'url';
      else input.type = 'text';
      input.value = String(row[key] ?? '');
      input.style.cssText = 'width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:8px;color:#111827;background:#fff';
      wrap.appendChild(input); panel.appendChild(wrap); inputs[key] = input;
    }
    let profileFile, workFiles, photoAction, replaceIndex;
    {
      const photos = document.createElement('section');
      photos.style.cssText = 'grid-column:1/-1;border-top:1px solid #ddd;padding-top:12px;display:grid;gap:10px';
      const title = document.createElement('h3');
      title.textContent = 'Profile & work photos / صور البروفايل والأعمال';
      photos.appendChild(title);
      const current = document.createElement('div');
      current.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px';
      const paths = [row.profile_photo_path, ...(Array.isArray(row.work_photo_paths) ? row.work_photo_paths : [])].filter(Boolean);
      paths.forEach((path,i) => {
        const img = document.createElement('img');
        img.src = TexAdminApi.publicUrl(path);
        img.alt = i === 0 ? 'Current photo' : 'Work photo';
        img.style.cssText = 'width:78px;height:78px;object-fit:cover;border-radius:8px';
        current.appendChild(img);
      });
      photos.appendChild(current);
      const profileLabel = document.createElement('label');
      profileLabel.textContent = 'Replace profile photo / تغيير صورة البروفايل';
      profileFile = document.createElement('input');
      profileFile.type = 'file'; profileFile.accept = 'image/*';
      profileLabel.appendChild(profileFile); photos.appendChild(profileLabel);
      const workLabel = document.createElement('label');
      workLabel.textContent = 'Work photos / صور الأعمال (maximum 10)';
      workFiles = document.createElement('input');
      workFiles.type = 'file'; workFiles.accept = 'image/*'; workFiles.multiple = true;
      workLabel.appendChild(workFiles); photos.appendChild(workLabel);
      photoAction = document.createElement('select');
      for (const [value,label] of [['add','Add work photos / إضافة صور'],['replace','Replace one work photo / استبدال صورة']]) {
        const option = document.createElement('option'); option.value=value; option.textContent=label; photoAction.appendChild(option);
      }
      photos.appendChild(photoAction);
      replaceIndex = document.createElement('select');
      (Array.isArray(row.work_photo_paths) ? row.work_photo_paths : []).forEach((path,i)=>{
        const option=document.createElement('option');option.value=String(i);option.textContent='Work photo '+(i+1);replaceIndex.appendChild(option);
      });
      replaceIndex.hidden=true;photos.appendChild(replaceIndex);
      photoAction.addEventListener('change',()=>{replaceIndex.hidden=photoAction.value!=='replace';workFiles.multiple=photoAction.value!=='replace';});
      panel.appendChild(photos);
    }
    const actions = document.createElement('div');
    actions.style.cssText = 'grid-column:1/-1;display:flex;justify-content:flex-end;gap:10px';
    const cancel = document.createElement('button');
    cancel.type = 'button'; cancel.textContent = 'Cancel / إلغاء';
    cancel.addEventListener('click',()=>overlay.remove());
    const save = document.createElement('button');
    save.type = 'submit'; save.textContent = 'Save Changes / حفظ التعديلات';
    save.className = 'save';
    actions.append(cancel,save);panel.appendChild(actions);overlay.appendChild(panel);document.body.appendChild(overlay);
    panel.addEventListener('submit', async (event) => {
      event.preventDefault();
      const changes = {};
      for (const [key] of fields) {
        const value = inputs[key].value.trim();
        if (value !== String(row[key] ?? '')) changes[key] = key === 'years' ? (value === '' ? null : Number(value)) : value;
      }
      const hasPhotos = !imported && (profileFile?.files?.length || workFiles?.files?.length);
      if (!Object.keys(changes).length && !hasPhotos) { overlay.remove(); return; }
      save.disabled = true; save.textContent = 'Saving…';
      try {
        let updated;
        if (imported) {
          const token = await TexAuth.getAccessToken();
          if (!token) throw new Error('Sign in again');
          const response = await fetch('https://rryehtaskbjnfbodymjj.supabase.co/rest/v1/texcontractor_public_business_imports?id=eq.' + encodeURIComponent(row.id), {
            method:'PATCH',
            headers:{apikey:'sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r',Authorization:'Bearer '+token,'Content-Type':'application/json',Prefer:'return=representation'},
            body:JSON.stringify(changes)
          });
          if (!response.ok) throw new Error('Update failed (HTTP ' + response.status + ')');
          const result = await response.json();
          if (result.length !== 1) throw new Error('Permission denied or record not found');
          updated = result[0];
        } else {
          updated = await TexAdminApi.updateSubmission(row.id,changes,currentUser);
          if (!updated) throw new Error('Update was not confirmed');
        }
        Object.assign(row,updated);
        if (imported) {
          const token = await TexAuth.getAccessToken();
          const upload = async (file) => {
            if (!file.type.startsWith('image/') || file.size > 8*1024*1024) throw new Error('Choose an image under 8 MB');
            const ext = ['image/png','image/webp','image/gif'].includes(file.type) ? file.type.split('/')[1] : 'jpg';
            const path = 'imported/' + row.id + '/admin-' + crypto.randomUUID() + '.' + ext;
            const response = await fetch('https://rryehtaskbjnfbodymjj.supabase.co/storage/v1/object/texcontractor-media/' + path, {method:'POST',headers:{apikey:'sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r',Authorization:'Bearer '+token,'Content-Type':file.type,'x-upsert':'false'},body:file});
            if (!response.ok) throw new Error('Photo storage permission denied (HTTP ' + response.status + ')');
            return path;
          };
          const patch = {};
          if (profileFile.files.length) patch.profile_photo_path = await upload(profileFile.files[0]);
          if (workFiles.files.length) {
            const selected = Array.from(workFiles.files);
            const existing = Array.isArray(row.work_photo_paths) ? [...row.work_photo_paths] : [];
            if (photoAction.value === 'replace') {
              if (selected.length !== 1 || !existing.length) throw new Error('Choose one work photo to replace');
              existing[Number(replaceIndex.value)] = await upload(selected[0]);
            } else {
              if (existing.length + selected.length > 10) throw new Error('Maximum 10 work photos');
              for (const file of selected) existing.push(await upload(file));
            }
            patch.work_photo_paths = existing;
          }
          if (Object.keys(patch).length) {
            const response = await fetch('https://rryehtaskbjnfbodymjj.supabase.co/rest/v1/texcontractor_public_business_imports?id=eq.'+encodeURIComponent(row.id),{method:'PATCH',headers:{apikey:'sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r',Authorization:'Bearer '+token,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify(patch)});
            if (!response.ok) throw new Error('Photo metadata save failed (HTTP '+response.status+')');
            const saved = await response.json();
            if (saved.length !== 1) throw new Error('Photo update not confirmed');
            Object.assign(row,saved[0]);
          }
        } else {
          if (profileFile.files.length) {
            Object.assign(row,await TexAdminApi.uploadSubmissionPhotos(row,Array.from(profileFile.files),'profile',currentUser));
          }
          if (workFiles.files.length) {
            const selected = Array.from(workFiles.files);
            const existing = Array.isArray(row.work_photo_paths) ? row.work_photo_paths.length : 0;
            if (photoAction.value === 'replace' && selected.length !== 1) throw new Error('Choose exactly one photo to replace.');
            if (photoAction.value === 'add' && existing + selected.length > 10) throw new Error('Maximum 10 work photos.');
            Object.assign(row,await TexAdminApi.uploadSubmissionPhotos(row,selected,'work',currentUser,photoAction.value === 'replace' ? Number(replaceIndex.value) : -1));
          }
        }
        overlay.remove();renderSubmissions();
        showMessage('Technician profile changes saved.', 'ok');
      } catch(error) {
        showMessage('Could not save changes: ' + error.message,'error');
        save.disabled = false; save.textContent = 'Save Changes / حفظ التعديلات';
      }
    });
  };

  const renderSubmissions = () => {
    const filter = statusFilter.value;
    const rows = submissions.filter((row) => filter === 'all' || row.status === filter);
    const imported = importedBusinesses.filter((entry) => filter === 'all' || entry.review_status === filter);
    submissionsList.innerHTML = '';
    $('#submissions-count').textContent = `${rows.length + imported.length} shown · ${submissions.length + importedBusinesses.length} total`;
    submissionsEmpty.hidden = rows.length + imported.length > 0;
    imported.forEach((entry) => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `<div class="card-head"><div class="card-title"><div class="avatar" style="background:${['linear-gradient(135deg,#1d4ed8,#0e7490)','linear-gradient(135deg,#7c3aed,#db2777)','linear-gradient(135deg,#b45309,#ea580c)','linear-gradient(135deg,#0f766e,#15803d)','linear-gradient(135deg,#9f1239,#7c2d12)','linear-gradient(135deg,#4338ca,#0369a1)'][Array.from(entry.business_name || '').reduce((sum,char)=>sum+char.charCodeAt(0),0)%6]}"><span>${escapeHtml(initials(entry.business_name))}</span></div><div><h2>${escapeHtml(entry.business_name)}</h2><p class="service">${escapeHtml(entry.service)}</p></div></div><span class="status ${escapeHtml(entry.review_status || 'pending')}">${escapeHtml(entry.review_status || 'pending')}</span></div><div class="detail-grid"><div class="detail"><span class="detail-label">Phone</span><span class="detail-value">${escapeHtml(entry.phone || 'Not provided')}</span></div><div class="detail"><span class="detail-label">Location</span><span class="detail-value">${escapeHtml(entry.city + ', ' + entry.state)}</span></div></div><p class="about">${escapeHtml(entry.about || '')}</p>`;
      if (entry.profile_photo_path) { const avatar = card.querySelector('.avatar'); if (avatar) { const img = document.createElement('img'); img.src = TexAdminApi.publicUrl(entry.profile_photo_path); img.alt = 'Profile photo'; avatar.replaceChildren(img); } }
      const actions = document.createElement('div');
      actions.className = 'review';
      for (const [label, value] of [['Approve', 'approved'], ['Reject', 'rejected']]) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.addEventListener('click', async () => {
          button.disabled = true;
          try {
            const token = await TexAuth.getAccessToken();
            const endpoint = 'https://rryehtaskbjnfbodymjj.supabase.co/rest/v1/texcontractor_public_business_imports?id=eq.' + encodeURIComponent(entry.id);
            const response = await fetch(endpoint, {
              method: 'PATCH',
              headers: {
                apikey: 'sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r',
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json',
                Prefer: 'return=representation'
              },
              body: JSON.stringify({ review_status: value })
            });
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const changed = await response.json();
            if (changed.length !== 1) throw new Error('Permission denied or record not found');
            entry.review_status = changed[0].review_status;
            updateSummary();
            renderSubmissions();
          } catch (error) {
            button.disabled = false;
            showMessage('Review update failed: ' + error.message, 'error');
          }
        });
        actions.appendChild(button);
      }
      const edit = document.createElement('button');
      edit.type = 'button'; edit.textContent = 'Edit / تعديل';
      edit.addEventListener('click', () => editTechnician(entry,true));
      actions.appendChild(edit);
      card.appendChild(actions);
      submissionsList.appendChild(card);
    });
    rows.forEach((row) => {
      const card = document.createElement('article');
      card.className = 'card';
      const status = ['pending', 'approved', 'rejected'].includes(row.status) ? row.status : 'pending';
      card.innerHTML = `
        <div class="card-head">
          <div class="card-title"><div class="avatar"><span>${escapeHtml(initials(row.display_name))}</span></div><div><h2>${escapeHtml(row.display_name)}</h2><p class="service">${escapeHtml(row.service)}</p><p class="date">Submitted ${escapeHtml(displayDate(row.created_at))}</p></div></div>
          <span class="status ${status}">${escapeHtml(status)}</span>
        </div>
        <div class="detail-grid">
          <div class="detail"><span class="detail-label">Private contact</span><span class="detail-value">${escapeHtml(row.real_name)}</span></div>
          <div class="detail"><span class="detail-label">Phone</span><span class="detail-value">${escapeHtml(row.phone)}</span></div>
          <div class="detail"><span class="detail-label">Applicant email</span><span class="detail-value">${escapeHtml(row.email)}</span></div>
          <div class="detail"><span class="detail-label">Location</span><span class="detail-value">${escapeHtml(`${row.city || ''}, ${row.state || ''}`)}</span></div>
          <div class="detail"><span class="detail-label">Experience</span><span class="detail-value">${escapeHtml(row.years)} years</span></div>
          <div class="detail"><span class="detail-label">Account email</span><span class="detail-value">${escapeHtml(row.owner_email)}</span></div>
        </div>
        <p class="about">${escapeHtml(row.about)}</p>
        <div class="review">
          <label>Status<select data-status><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></label>
          <label>Photo placement<select data-photo-placement><option value="profile">Profile photo</option><option value="work">Work photos (up to 10)</option><option value="both">Both</option></select></label>
          <label>Work photo action<select data-work-action><option value="add">Add new photo</option><option value="replace">Replace existing photo</option></select></label>
          <label data-replace-label style="display:none">Photo to replace<select data-replace-index></select></label>
          <label data-photo-label>Choose profile photo<input data-photo-file type="file" accept="image/*"></label>
          <img data-photo-preview alt="Selected photo preview" style="display:none;width:120px;height:120px;object-fit:cover;border-radius:12px">
          <button data-photo-save type="button">Save Photo</button>
          <label>Admin notes<textarea data-notes placeholder="Optional internal note"></textarea></label>
          <button class="save" type="button">Save review</button>
        </div>
        <p class="private-note">Private contact details are visible only inside this protected dashboard.</p>`;
      if (status === 'pending') {
        const review = card.querySelector('.review');
        review.innerHTML = `
          <label>Profile photo (one image)<input data-pending-profile type="file" accept="image/*"></label>
          <label>Work photos (select up to 10 images)<input data-pending-work type="file" accept="image/*" multiple></label>
          <div data-pending-preview style="display:flex;flex-wrap:wrap;gap:8px;grid-column:1/-1"></div>
          <button data-pending-approve class="save" type="button" style="grid-column:1/-1">Approve &amp; Publish</button>
        `;
        const profileInput = review.querySelector('[data-pending-profile]');
        const workInput = review.querySelector('[data-pending-work]');
        const preview = review.querySelector('[data-pending-preview]');
        const approve = review.querySelector('[data-pending-approve]');
        const refreshPreview = () => {
          preview.replaceChildren();
          const selected = [...Array.from(profileInput.files || []), ...Array.from(workInput.files || [])];
          selected.forEach((file, index) => {
            const image = document.createElement('img');
            const url = URL.createObjectURL(file);
            image.src = url;
            image.alt = index === 0 && profileInput.files.length ? 'Selected profile photo' : 'Selected work photo';
            image.style.cssText = 'width:90px;height:90px;object-fit:cover;border-radius:10px';
            image.onload = () => URL.revokeObjectURL(url);
            preview.appendChild(image);
          });
        };
        profileInput.addEventListener('change', refreshPreview);
        workInput.addEventListener('change', refreshPreview);
        approve.addEventListener('click', async () => {
          const profileFiles = Array.from(profileInput.files || []);
          const workFiles = Array.from(workInput.files || []);
          const existingWork = Array.isArray(row.work_photo_paths) ? row.work_photo_paths.length : 0;
          if (existingWork + workFiles.length > 10) {
            showMessage('Maximum 10 work photos. Choose fewer images.', 'error');
            return;
          }
          approve.disabled = true;
          approve.textContent = 'Uploading and publishing…';
          try {
            let updated = row;
            if (profileFiles.length) updated = await TexAdminApi.uploadSubmissionPhotos(updated, profileFiles, 'profile', currentUser);
            if (workFiles.length) updated = await TexAdminApi.uploadSubmissionPhotos(updated, workFiles, 'work', currentUser);
            const approved = await TexAdminApi.updateSubmission(row.id, { status: 'approved' }, currentUser);
            if (!approved || approved.status !== 'approved') throw new Error('Approval could not be confirmed.');
            row.status = 'approved';
            row.profile_photo_path = approved.profile_photo_path;
            row.work_photo_paths = approved.work_photo_paths;
            updateSummary();
            renderSubmissions();
            showMessage('Contractor approved and published. Continue with the next pending contractor.', 'ok');
          } catch (error) {
            showMessage('Could not publish: ' + error.message + '. You can retry without leaving this page.', 'error');
            approve.disabled = false;
            approve.textContent = 'Approve & Publish';
          }
        });
        const editPending = document.createElement('button');
        editPending.type = 'button'; editPending.textContent = 'Edit / تعديل';
        editPending.addEventListener('click', () => editTechnician(row,false));
        review.prepend(editPending);
        submissionsList.appendChild(card);
        return;
      }
      const avatar = card.querySelector('.avatar');
      if (row.profile_photo_path) {
        const image = document.createElement('img');
        image.src = TexAdminApi.publicUrl(row.profile_photo_path);
        image.alt = `${row.display_name || 'Contractor'} profile`;
        image.onerror = () => image.remove();
        avatar.replaceChildren(image);
      }
      makeMedia(card, row);
      const editProfile = document.createElement('button');
      editProfile.type = 'button'; editProfile.textContent = 'Edit / تعديل';
      editProfile.className = 'save';
      editProfile.addEventListener('click', () => editTechnician(row,false));
      card.querySelector('.review').prepend(editProfile);
      const statusSelect = card.querySelector('[data-status]');
      const notes = card.querySelector('[data-notes]');
      const save = card.querySelector('.review > button.save:last-of-type');
      const photoInput = card.querySelector('[data-photo-file]');
      const photoPreview = card.querySelector('[data-photo-preview]');
      const photoSave = card.querySelector('[data-photo-save]');
      const photoLabel = card.querySelector('[data-photo-label]');
      const placementSelect = card.querySelector('[data-photo-placement]');
      const workAction = card.querySelector('[data-work-action]');
      const replaceLabel = card.querySelector('[data-replace-label]');
      const replaceSelect = card.querySelector('[data-replace-index]');
      const existingWork = Array.isArray(row.work_photo_paths) ? row.work_photo_paths : [];
      existingWork.forEach((path, i) => {
        const option = document.createElement('option');
        option.value = String(i);
        option.textContent = `Work photo ${i + 1}`;
        replaceSelect.appendChild(option);
      });
      const syncPhotoControls = () => {
        if (!existingWork.length) workAction.value = 'add';
        workAction.querySelector('[value="replace"]').disabled = !existingWork.length;
        workAction.parentElement.style.display = placementSelect.value === 'profile' ? 'none' : '';
        replaceLabel.style.display = placementSelect.value !== 'profile' && workAction.value === 'replace' ? '' : 'none';
        photoInput.multiple = placementSelect.value !== 'profile' && workAction.value !== 'replace';
        photoLabel.firstChild.textContent = placementSelect.value === 'profile' ? 'Choose profile photo (one image)' : photoInput.multiple ? 'Choose work photos (multiple images, up to 10)' : 'Choose replacement work photo';
        photoInput.value = '';
        photoPreview.style.display = 'none';
      };
      placementSelect.addEventListener('change', syncPhotoControls);
      workAction.addEventListener('change', syncPhotoControls);
      syncPhotoControls();
      photoInput.addEventListener('change', () => {
        const file = photoInput.files?.[0];
        if (!file) { photoPreview.style.display = 'none'; return; }
        photoPreview.src = URL.createObjectURL(file);
        photoPreview.style.display = 'block';
        photoPreview.onload = () => URL.revokeObjectURL(photoPreview.src);
      });
      photoSave.addEventListener('click', async () => {
        if (!photoInput.files?.[0]) { showMessage('Choose a photo first.', 'error'); return; }
        photoSave.disabled = true;
        try {
          const selectedFiles = Array.from(photoInput.files);
          const available = 10 - (Array.isArray(row.work_photo_paths) ? row.work_photo_paths.length : 0);
          if (placementSelect.value !== 'profile' && workAction.value !== 'replace' && selectedFiles.length > available) throw new Error(`Select no more than ${available} work photos.`);
          photoSave.textContent = 'Saving photos…';
          await TexAdminApi.uploadSubmissionPhotos(row, selectedFiles, placementSelect.value, currentUser, placementSelect.value !== 'profile' && workAction.value === 'replace' ? Number(replaceSelect.value) : -1);
          const fresh = await TexAdminApi.listSubmissions('all');
          const saved = fresh.find((item) => item.id === row.id);
          if (!saved) throw new Error('Could not verify the saved photo.');
          const photoPath = saved.profile_photo_path;
          const workPaths = Array.isArray(saved.work_photo_paths) ? saved.work_photo_paths : [];
          if ((placementSelect.value === 'profile' || placementSelect.value === 'both') && !photoPath) throw new Error('Profile photo was not saved.');
          if (placementSelect.value !== 'profile' && !workPaths.length) throw new Error('Work photo was not saved.');
          Object.assign(row, saved);
          submissions = fresh;
          if (photoPath) {
            const image = document.createElement('img');
            image.src = TexAdminApi.publicUrl(photoPath) + '?v=' + Date.now();
            image.alt = 'Contractor profile photo';
            avatar.replaceChildren(image);
          }
          card.querySelectorAll('.media').forEach((element) => element.remove());
          makeMedia(card, row);
          photoSave.disabled = false;
          photoSave.textContent = 'Save Photo';
          photoInput.value = '';
          showMessage('Photo saved and verified. You can continue editing this contractor.', 'ok');
        } catch (error) {
          showMessage(`Photo upload failed: ${error.message}`, 'error');
          photoSave.disabled = false;
          photoSave.textContent = 'Save Photo';
        }
      });
      statusSelect.value = status;
      notes.value = row.admin_notes || '';
      save.addEventListener('click', async () => {
        save.disabled = true;
        save.textContent = 'Saving…';
        try {
          await TexAdminApi.updateSubmission(row.id, { status: statusSelect.value, admin_notes: notes.value.trim() }, currentUser);
          row.status = statusSelect.value;
          row.admin_notes = notes.value.trim();
          card.querySelector('.status').className = 'status ' + row.status;
          card.querySelector('.status').textContent = row.status;
          updateSummary();
          if (statusFilter.value === 'pending' && row.status !== 'pending') {
            renderSubmissions();
            showMessage('Review saved. Contractor published and removed from Pending review. Find it under Approved or All applications to edit photos.', 'ok');
          } else {
            showMessage('Review saved. You can continue working in the admin dashboard.', 'ok');
          }
          save.disabled = false;
          save.textContent = 'Save review';
        } catch (error) {
          showMessage(`Could not save this review: ${error.message}`, 'error');
          save.disabled = false;
          save.textContent = 'Save review';
        }
      });
      submissionsList.appendChild(card);
    });
  };

  const renderReports = () => {
    reportsList.innerHTML = '';
    reportsEmpty.hidden = reports.length > 0;
    $('#reports-count').textContent = `${reports.length} report${reports.length === 1 ? '' : 's'}`;
    reports.forEach((report) => {
      const provider = submissions.find((row) => row.id === report.technician_id);
      const card = document.createElement('article');
      card.className = 'report-row';
      card.innerHTML = `<h3>${escapeHtml(provider?.display_name || 'Unknown contractor')} · ${escapeHtml(provider?.service || 'Service unavailable')}</h3><p><strong>Reason:</strong> ${escapeHtml(report.reason)}</p>${report.details ? `<p><strong>Details:</strong> ${escapeHtml(report.details)}</p>` : ''}<p><strong>Reported:</strong> ${escapeHtml(displayDate(report.created_at))}</p>`;
      reportsList.appendChild(card);
    });
  };

  const renderBannerPreview = () => {
    if (!bannerPreviewText) return;
    const value = {
      message_text: bannerMessage.value.trim() || 'Your message preview will appear here.',
      style: bannerStyle.value,
      font_style: bannerFontStyle.value,
      animation: bannerAnimation.value,
      text_color: bannerTextColor.value,
      background_color: bannerBackgroundColor.value,
      accent_color: bannerAccentColor.value
    };
    bannerPreviewText.textContent = value.message_text;
    bannerPreviewText.style.color = value.text_color;
    bannerPreviewText.style.background = value.background_color;
    bannerPreviewText.style.border = value.style === 'outline' ? `2px solid ${value.accent_color}` : value.style === 'card' ? `1px solid ${value.accent_color}` : '0';
    bannerPreviewText.style.boxShadow = value.style === 'card' ? '0 8px 18px rgba(16,24,40,.08)' : 'none';
    bannerPreviewText.style.fontWeight = value.font_style === 'bold' || value.font_style === 'uppercase' ? '900' : '500';
    bannerPreviewText.style.fontStyle = value.font_style === 'italic' ? 'italic' : 'normal';
    bannerPreviewText.style.textTransform = value.font_style === 'uppercase' ? 'uppercase' : 'none';
    bannerPreviewText.className = `settings-preview-text motion-${value.animation}`;
  };

  const fillBannerForm = (row) => {
    homepageBanner = row || {};
    bannerMessage.value = row?.message_text || '';
    bannerStyle.value = row?.style || 'card';
    bannerFontStyle.value = row?.font_style || 'bold';
    bannerAnimation.value = row?.animation || 'static';
    bannerEnabled.value = String(row?.is_enabled !== false);
    document.getElementById('banner-image-enabled').value = String(row?.banner_image_enabled !== false);
    bannerTextColor.value = row?.text_color || '#075c4b';
    bannerBackgroundColor.value = row?.background_color || '#ecfff8';
    bannerAccentColor.value = row?.accent_color || '#a9e8d2';
    [bannerTextColor, bannerBackgroundColor, bannerAccentColor].forEach((input) => {
      const label = document.getElementById(`${input.id}-value`);
      if (label) label.textContent = input.value;
    });
    const preview = document.getElementById('banner-image-preview');
    if (preview) {
      preview.replaceChildren();
      if (row?.banner_image_url) {
        const img = document.createElement('img');
        img.src = row.banner_image_url; img.alt = 'Current homepage banner';
        img.style.cssText = 'display:block;width:100%;max-width:800px;aspect-ratio:4/1;object-fit:contain;border-radius:10px';
        preview.appendChild(img);
      }
    }
    renderBannerPreview();
  };

  const loadHomepageBanner = async () => {
    const row = await TexAdminApi.getHomepageBanner();
    fillBannerForm(row);
  };

  const emptySideAd = (side, placement) => ({ side, placement, is_enabled: false, style: 'card', font_style: 'bold', animation: 'static', text_color: '#075c4b', background_color: '#ecfff8', accent_color: '#a9e8d2', message_text: '', image_alt: '', image_path: null, media_type: 'image', video_path: null, video_poster_path: null });
  const cacheSideAd = (row) => {
    if (row?.side && row?.placement) sideAds[row.side][row.placement] = row;
  };
  const fillSideAdForm = (side, row) => {
    const placement = sideAdValue(side, 'placement').value || 'homepage';
    const current = row || emptySideAd(side, placement);
    sideAdValue(side, 'placement').value = current.placement || placement;
    sideAdValue(side, 'message').value = current.message_text || '';
    sideAdValue(side, 'enabled').value = String(current.is_enabled === true);
    sideAdValue(side, 'style').value = current.style || 'card';
    sideAdValue(side, 'font').value = current.font_style || 'bold';
    sideAdValue(side, 'animation').value = current.animation || 'static';
    sideAdValue(side, 'alt').value = current.image_alt || '';
    sideAdValue(side, 'text-color').value = current.text_color || '#075c4b';
    sideAdValue(side, 'background-color').value = current.background_color || '#ecfff8';
    sideAdValue(side, 'accent-color').value = current.accent_color || '#a9e8d2';
    ['text-color', 'background-color', 'accent-color'].forEach((name) => {
      const input = sideAdValue(side, name);
      const label = document.getElementById(`${input.id}-value`);
      if (label) label.textContent = input.value;
    });
    const preview = sideAdPreview(side);
    const note = sideAdPreviewNote(side);
    preview.replaceChildren();
    if (current.image_path) {
      const image = document.createElement('img');
      image.src = TexAdminApi.sideAdPublicUrl(current.image_path);
      image.alt = current.image_alt || 'Current advertisement image';
      preview.appendChild(image);
      if (note) note.textContent = side === 'left' && document.getElementById('side-left-placement').value === 'homepage' ? 'Homepage: 200 px wide, full proportional height; no green frame. On narrower screens, shown in the page flow before the footer.' : 'Automatic display: maximum 160 px wide, proportional height, no page expansion.';
    } else {
      const empty = document.createElement('span');
      empty.className = 'side-ad-preview-empty';
      empty.textContent = 'No image selected';
      preview.appendChild(empty);
      if (note) note.textContent = side === 'left' && document.getElementById('side-left-placement').value === 'homepage' ? 'Homepage: 200 px wide, full proportional height; no green frame. On narrower screens, shown in the page flow before the footer.' : 'Automatic display: maximum 160 px wide, proportional height, no page expansion.';
    }
    if (side === 'right') fillSideVideo(current);
  };

  // Right-slot intro video (optional). The image fields above are never changed by these controls.
  const sideVideoEl = (name) => document.getElementById(`side-right-${name}`);
  const setVideoStatus = (text, kind = '') => {
    const status = sideVideoEl('video-status');
    if (!status) return;
    status.textContent = text;
    status.className = `side-ad-video-status ${kind}`.trim();
  };
  const fillSideVideo = (row) => {
    const type = sideVideoEl('media-type');
    if (!type) return;
    type.value = row?.media_type === 'video' && row?.video_path ? 'video' : 'image';
    const preview = sideVideoEl('video-preview');
    preview.replaceChildren();
    if (row?.video_path) {
      const video = document.createElement('video');
      video.controls = true;
      video.preload = 'metadata';
      video.playsInline = true;
      video.src = TexAdminApi.sideAdPublicUrl(row.video_path);
      const posterPath = row.video_poster_path || row.image_path;
      if (posterPath) video.poster = TexAdminApi.sideAdPublicUrl(posterPath);
      preview.appendChild(video);
    } else {
      const empty = document.createElement('span');
      empty.className = 'side-ad-preview-empty';
      empty.textContent = 'No video uploaded';
      preview.appendChild(empty);
    }
    sideVideoEl('video-remove').disabled = !row?.video_path;
  };
  const bindSideVideo = () => {
    const uploadButton = sideVideoEl('video-upload');
    if (!uploadButton) return;
    const videoInput = sideVideoEl('video');
    const posterInput = sideVideoEl('poster');
    const progress = sideVideoEl('video-progress');
    const removeButton = sideVideoEl('video-remove');
    const currentRow = () => sideAds.right[sideAdValue('right', 'placement').value] || null;
    videoInput.addEventListener('change', () => {
      const file = videoInput.files?.[0];
      if (!file) return setVideoStatus('');
      const mb = file.size / 1048576;
      if (file.size > TexAdminApi.SIDE_AD_VIDEO_MAX_BYTES) setVideoStatus(`Selected: ${file.name} (${mb.toFixed(1)} MB). Too large: the maximum is 50 MB.`, 'error');
      else setVideoStatus(`Selected: ${file.name} (${mb.toFixed(1)} MB). Press "Upload video".`);
    });
    uploadButton.addEventListener('click', async () => {
      const row = currentRow();
      const file = videoInput.files?.[0];
      const poster = posterInput.files?.[0];
      if (!row?.id) return setVideoStatus('Save this right ad slot first, then upload the video.', 'error');
      if (!file && !poster) return setVideoStatus('Choose an MP4 video (and optionally a cover image) first.', 'error');
      if (!file && !row.video_path) return setVideoStatus('Choose an MP4 video first.', 'error');
      uploadButton.disabled = true;
      removeButton.disabled = true;
      let newVideo = null;
      let newPoster = null;
      try {
        if (file) {
          progress.hidden = false;
          progress.value = 0;
          newVideo = await TexAdminApi.uploadSideAdVideo(file, 'right', currentUser, (ratio) => {
            progress.value = Math.round(ratio * 100);
            setVideoStatus(`Uploading video… ${Math.round(ratio * 100)}%`);
          });
          progress.value = 100;
        }
        if (poster) {
          setVideoStatus('Uploading cover image…');
          newPoster = await TexAdminApi.uploadSideAdImage(poster, 'right-poster', currentUser);
        }
        const patch = { side: 'right', placement: row.placement };
        if (newVideo) patch.video_path = newVideo;
        if (newPoster) patch.video_poster_path = newPoster;
        const updated = await TexAdminApi.upsertSideAd(row, patch, currentUser);
        if (!updated?.id) throw new Error('The video was uploaded but the ad settings were not saved.');
        if (newVideo && row.video_path && row.video_path !== newVideo) await TexAdminApi.removeSideAdImage(row.video_path, currentUser);
        if (newPoster && row.video_poster_path && row.video_poster_path !== newPoster) await TexAdminApi.removeSideAdImage(row.video_poster_path, currentUser);
        videoInput.value = '';
        posterInput.value = '';
        cacheSideAd(updated);
        fillSideAdForm('right', updated);
        setVideoStatus(updated.media_type === 'video'
          ? 'Upload complete and saved. The new video is now live in the right frame.'
          : 'Upload complete and saved. To show it, set Content type to "Video", Visibility to "Show ad", then press "Save right ad".', 'ok');
      } catch (error) {
        if (newVideo) await TexAdminApi.removeSideAdImage(newVideo, currentUser);
        if (newPoster) await TexAdminApi.removeSideAdImage(newPoster, currentUser);
        setVideoStatus(`Upload failed: ${error.message} Nothing was changed on the site.`, 'error');
      } finally {
        progress.hidden = true;
        uploadButton.disabled = false;
        removeButton.disabled = !currentRow()?.video_path;
      }
    });
    removeButton.addEventListener('click', async () => {
      const row = currentRow();
      if (!row?.video_path) return;
      removeButton.disabled = true;
      try {
        const updated = await TexAdminApi.upsertSideAd(row, { side: 'right', placement: row.placement, media_type: 'image', video_path: null, video_poster_path: null }, currentUser);
        if (!updated?.id) throw new Error('The ad settings were not saved.');
        await TexAdminApi.removeSideAdImage(row.video_path, currentUser);
        if (row.video_poster_path) await TexAdminApi.removeSideAdImage(row.video_poster_path, currentUser);
        cacheSideAd(updated);
        fillSideAdForm('right', updated);
        setVideoStatus('Video removed. The current image is shown again.', 'ok');
      } catch (error) {
        setVideoStatus(`Could not remove the video: ${error.message}`, 'error');
        removeButton.disabled = false;
      }
    });
  };

  const loadSideAds = async () => {
    const rows = await TexAdminApi.listSideAds();
    sideAds.left = {};
    sideAds.right = {};
    rows.forEach(cacheSideAd);
    ['left', 'right'].forEach((side) => {
      const placement = sideAdValue(side, 'placement').value || 'homepage';
      fillSideAdForm(side, sideAds[side][placement]);
    });
  };

  const bindSideAd = (side) => {
    const form = document.querySelector(`[data-side-ad-form="${side}"]`);
    const imageInput = sideAdValue(side, 'image');
    ['text-color', 'background-color', 'accent-color'].forEach((name) => {
      const input = sideAdValue(side, name);
      input.addEventListener('input', () => {
        const label = document.getElementById(`${input.id}-value`);
        if (label) label.textContent = input.value;
      });
    });
    imageInput.addEventListener('change', () => {
      const file = imageInput.files?.[0];
      const preview = sideAdPreview(side);
      const note = sideAdPreviewNote(side);
      preview.replaceChildren();
      if (!file) return fillSideAdForm(side, sideAds[side][sideAdValue(side, 'placement').value]);
      const image = document.createElement('img');
      image.src = URL.createObjectURL(file);
      image.alt = sideAdValue(side, 'alt').value || 'Selected advertisement image';
      image.onload = () => {
        if (note) note.textContent = `${image.naturalWidth} × ${image.naturalHeight} px · automatic display up to ${side === 'left' && document.getElementById('side-left-placement').value === 'homepage' ? 200 : 160} px wide, proportional height.`;
        URL.revokeObjectURL(image.src);
      };
      preview.appendChild(image);
    });
    sideAdValue(side, 'placement').addEventListener('change', () => {
      imageInput.value = '';
      fillSideAdForm(side, sideAds[side][sideAdValue(side, 'placement').value]);
    });
    document.querySelector(`[data-side-ad-remove="${side}"]`).addEventListener('click', async (event) => {
      const placement = sideAdValue(side, 'placement').value;
      const row = sideAds[side][placement];
      if (!row?.image_path) return;
      const button = event.currentTarget;
      button.disabled = true;
      try {
        const updated = await TexAdminApi.upsertSideAd(row, { side, placement, image_path: null }, currentUser);
        await TexAdminApi.removeSideAdImage(row.image_path, currentUser);
        cacheSideAd(updated);
        fillSideAdForm(side, updated);
        showMessage(`${side[0].toUpperCase() + side.slice(1)} ad image removed.`, 'ok');
      } catch (error) {
        showMessage(`Could not remove the ${side} ad image: ${error.message}`, 'error');
      } finally {
        button.disabled = false;
      }
    });
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = form.querySelector('button[type="submit"]');
      const placement = sideAdValue(side, 'placement').value;
      const oldRow = sideAds[side][placement] || null;
      button.disabled = true;
      button.textContent = 'Saving…';
      try {
        let imagePath = oldRow?.image_path || null;
        const file = imageInput.files?.[0];
        const mediaPatch = {};
        if (side === 'right' && sideVideoEl('media-type')) {
          const wantsVideo = sideVideoEl('media-type').value === 'video';
          if (wantsVideo && !oldRow?.video_path) throw new Error('upload an MP4 video first (Upload video), or keep Content type on "Current image".');
          if (wantsVideo && !(file || imagePath)) throw new Error('the video uses the current image frame, so this slot needs its image.');
          mediaPatch.media_type = wantsVideo ? 'video' : 'image';
        }
        if (file) imagePath = await TexAdminApi.uploadSideAdImage(file, side, currentUser);
        const updated = await TexAdminApi.upsertSideAd(oldRow, {
          side,
          placement,
          message_text: sideAdValue(side, 'message').value.trim(),
          style: sideAdValue(side, 'style').value,
          font_style: sideAdValue(side, 'font').value,
          animation: sideAdValue(side, 'animation').value,
          text_color: sideAdValue(side, 'text-color').value,
          background_color: sideAdValue(side, 'background-color').value,
          accent_color: sideAdValue(side, 'accent-color').value,
          image_path: imagePath,
          image_alt: sideAdValue(side, 'alt').value.trim(),
          is_enabled: sideAdValue(side, 'enabled').value === 'true',
          ...mediaPatch
        }, currentUser);
        if (file && oldRow?.image_path && oldRow.image_path !== imagePath) await TexAdminApi.removeSideAdImage(oldRow.image_path, currentUser);
        imageInput.value = '';
        cacheSideAd(updated);
        fillSideAdForm(side, updated);
        showMessage(`${side[0].toUpperCase() + side.slice(1)} ad saved.`, 'ok');
      } catch (error) {
        showMessage(`Could not save the ${side} ad: ${error.message}`, 'error');
      } finally {
        button.disabled = false;
        button.textContent = `Save ${side} ad`;
      }
    });
  };

  const loadDashboard = async () => {
    membersLoading.hidden = false;
    submissionsLoading.hidden = false;
    reportsLoading.hidden = false;
    try {
      const result = await Promise.all([TexAdminApi.listMembers(), TexAdminApi.listSubmissions('all'), TexAdminApi.listReports()]);
      members = result[0];
      submissions = result[1];
      try {
        const token = await TexAuth.getAccessToken();
        importedBusinesses = [];
        const pageSize = 500;
        for (let offset = 0; ; offset += pageSize) {
          const importedResponse = await fetch('https://rryehtaskbjnfbodymjj.supabase.co/rest/v1/texcontractor_public_business_imports?select=id,business_name,service,city,state,phone,about,review_status,profile_photo_path,work_photo_paths&order=business_name.asc&limit=' + pageSize + '&offset=' + offset, { headers: { apikey: 'sb_publishable_10LgFmHximAplWyQXKNopw_2peqDb7r', Authorization: 'Bearer ' + token } });
          if (!importedResponse.ok) throw new Error('HTTP ' + importedResponse.status);
          const page = await importedResponse.json();
          importedBusinesses.push(...page);
          if (page.length < pageSize) break;
        }
      } catch (error) { importedBusinesses = []; showMessage('Imported applications could not load: ' + error.message, 'error'); }
      reports = result[2];
      updateSummary();
      renderMembers();
      renderSubmissions();
      renderReports();
      await loadHomepageBanner();
      await loadSideAds();
      membersLoading.hidden = true;
      submissionsLoading.hidden = true;
      reportsLoading.hidden = true;
    } catch (error) {
      membersLoading.hidden = true;
      submissionsLoading.hidden = true;
      reportsLoading.hidden = true;
      showMessage(`Could not load the dashboard: ${error.message}`, 'error');
    }
  };

  const exportMembers = () => {
    const cell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const lines = [
      ['Email', 'Name', 'Provider', 'Registered at', 'Last sign-in'],
      ...members.map((row) => [row.email, row.display_name || '', formatProvider(row.provider), row.created_at || '', row.last_sign_in_at || ''])
    ].map((row) => row.map(cell).join(','));
    const blob = new Blob([lines.join('\n')], { type:'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'texcontractor-members.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const ADMIN_TAB_KEY = 'texcontractor-admin-active-tab';
  const selectAdminTab = (target) => {
    const tab = Array.from(document.querySelectorAll('[data-tab]')).find((item) => item.dataset.tab === target);
    if (!tab) return;
    document.querySelectorAll('[data-tab]').forEach((item) => {
      item.classList.toggle('active', item === tab);
      item.setAttribute('aria-selected', item === tab ? 'true' : 'false');
    });
    document.querySelectorAll('[data-panel]').forEach((panel) => { panel.hidden = panel.dataset.panel !== target; });
    try { sessionStorage.setItem(ADMIN_TAB_KEY, target); } catch (error) {}
  };
  document.querySelectorAll('[data-tab]').forEach((button) => {
    button.addEventListener('click', () => selectAdminTab(button.dataset.tab));
  });
  const requestedTab = new URLSearchParams(window.location.search).get('tab');
  let savedTab = '';
  try { savedTab = sessionStorage.getItem(ADMIN_TAB_KEY) || ''; } catch (error) {}
  selectAdminTab(requestedTab || savedTab || 'submissions');
  memberSearch.addEventListener('input', renderMembers);
  statusFilter.addEventListener('change', renderSubmissions);
  bindSideAd('left');
  bindSideAd('right');
  bindSideVideo();
  [bannerMessage, bannerStyle, bannerFontStyle, bannerAnimation, bannerEnabled, bannerTextColor, bannerBackgroundColor, bannerAccentColor].forEach((input) => {
    input.addEventListener('input', () => {
      if (input.type === 'color') {
        const label = document.getElementById(`${input.id}-value`);
        if (label) label.textContent = input.value;
      }
      renderBannerPreview();
    });
    input.addEventListener('change', renderBannerPreview);
  });
  const bannerFileInput = document.getElementById('banner-image-file');
  bannerFileInput.addEventListener('change', () => {
    const file = bannerFileInput.files?.[0];
    const preview = document.getElementById('banner-image-preview');
    if (!file || !preview) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
      showMessage('Use JPG, PNG or WebP, maximum 10 MB.', 'error');
      bannerFileInput.value = '';
      return;
    }
    const url = URL.createObjectURL(file);
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Banner preview before saving';
    img.style.cssText = 'display:block;width:100%;max-width:800px;aspect-ratio:4/1;object-fit:contain;border-radius:10px';
    img.addEventListener('load', () => URL.revokeObjectURL(url), {once:true});
    preview.replaceChildren(img);
  });
  bannerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = $('#save-banner');
    button.disabled = true;
    button.textContent = 'Saving…';
    try {
      const row = await TexAdminApi.updateHomepageBanner({
        message_text: bannerMessage.value.trim(),
        style: bannerStyle.value,
        font_style: bannerFontStyle.value,
        animation: bannerAnimation.value,
        is_enabled: bannerEnabled.value === 'true',
        text_color: bannerTextColor.value,
        background_color: bannerBackgroundColor.value,
        accent_color: bannerAccentColor.value
      }, currentUser);
      homepageBanner = row;
      showMessage('Text banner saved.', 'ok');
    } catch (error) {
      showMessage(`Could not save the homepage banner: ${error.message}`, 'error');
    } finally {
      button.disabled = false;
      button.textContent = 'Save text banner';
    }
  });
  document.getElementById('banner-image-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = document.getElementById('save-banner-image');
    button.disabled = true;
    button.textContent = 'Saving…';
    try {
      const file = bannerFileInput.files?.[0];
      const patch = { banner_image_enabled: document.getElementById('banner-image-enabled').value === 'true' };
      if (file) patch.banner_image_url = await TexAdminApi.uploadHomepageBannerImage(file, currentUser);
      else if (document.getElementById('banner-remove-image').checked) patch.banner_image_url = null;
      const row = await TexAdminApi.updateHomepageBanner(patch, currentUser);
      homepageBanner = row;
      bannerFileInput.value = '';
      document.getElementById('banner-remove-image').checked = false;
      const preview = document.getElementById('banner-image-preview');
      preview.replaceChildren();
      if (row.banner_image_url) {
        const img = document.createElement('img');
        img.src = row.banner_image_url;
        img.alt = 'Saved homepage image banner';
        img.style.cssText = 'display:block;width:100%;max-width:800px;height:auto;object-fit:contain;border-radius:10px';
        preview.appendChild(img);
      }
      showMessage('Image banner saved.', 'ok');
    } catch (error) {
      showMessage(`Could not save the image banner: ${error.message}`, 'error');
    } finally {
      button.disabled = false;
      button.textContent = 'Save image banner';
    }
  });
  $('#export-members').addEventListener('click', exportMembers);
  $('#refresh').addEventListener('click', loadDashboard);
  $('#signout').addEventListener('click', async () => { await TexAuth.signOut(); window.location.assign('auth.html?return_to=contractor-admin.html'); });

  (async () => {
    currentUser = await TexAuth.requireUser(`contractor-admin.html${window.location.search}`);
    if (!currentUser) return;
    document.body.classList.add('auth-ready');
    $('#account-email').textContent = currentUser.email || 'Signed-in account';
    try {
      const admin = await TexAdminApi.getAdminRecord(currentUser);
      if (!admin) throw new Error('This account is not enabled as a TexContractor administrator yet.');
      $('#role-badge').textContent = admin.role || 'admin';
      dashboard.hidden = false;
      await loadDashboard();
    } catch (error) {
      showMessage(error.message, 'error');
    }
  })();
})();
