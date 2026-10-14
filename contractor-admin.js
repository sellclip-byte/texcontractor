(function () {
  let currentUser = null;
  let members = [];
  let submissions = [];
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
    $('#submission-total').textContent = submissions.length;
    $('#pending-total').textContent = submissions.filter((row) => row.status === 'pending').length;
    $('#approved-total').textContent = submissions.filter((row) => row.status === 'approved').length;
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

  const renderSubmissions = () => {
    const filter = statusFilter.value;
    const rows = submissions.filter((row) => filter === 'all' || row.status === filter);
    submissionsList.innerHTML = '';
    $('#submissions-count').textContent = `${rows.length} shown · ${submissions.length} total`;
    submissionsEmpty.hidden = rows.length > 0;
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
          <label>Add Photo<input data-photo-file type="file" accept="image/*"></label>
          <img data-photo-preview alt="Selected photo preview" style="display:none;width:120px;height:120px;object-fit:cover;border-radius:12px">
          <button data-photo-save type="button">Save Photo</button>
          <label>Admin notes<textarea data-notes placeholder="Optional internal note"></textarea></label>
          <button class="save" type="button">Save review</button>
        </div>
        <p class="private-note">Private contact details are visible only inside this protected dashboard.</p>`;
      const avatar = card.querySelector('.avatar');
      if (row.profile_photo_path) {
        const image = document.createElement('img');
        image.src = TexAdminApi.publicUrl(row.profile_photo_path);
        image.alt = `${row.display_name || 'Contractor'} profile`;
        image.onerror = () => image.remove();
        avatar.replaceChildren(image);
      }
      makeMedia(card, row);
      const statusSelect = card.querySelector('[data-status]');
      const notes = card.querySelector('[data-notes]');
      const save = card.querySelector('.save');
      const photoInput = card.querySelector('[data-photo-file]');
      const photoPreview = card.querySelector('[data-photo-preview]');
      const photoSave = card.querySelector('[data-photo-save]');
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
          await TexAdminApi.uploadSubmissionPhoto(row, photoInput.files[0], placementSelect.value, currentUser, placementSelect.value !== 'profile' && workAction.value === 'replace' ? Number(replaceSelect.value) : -1);
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
          photoInput.value = '';
          showMessage('Photo saved and verified. You can continue editing this contractor.', 'ok');
        } catch (error) {
          showMessage(`Photo upload failed: ${error.message}`, 'error');
          photoSave.disabled = false;
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
    bannerTextColor.value = row?.text_color || '#075c4b';
    bannerBackgroundColor.value = row?.background_color || '#ecfff8';
    bannerAccentColor.value = row?.accent_color || '#a9e8d2';
    [bannerTextColor, bannerBackgroundColor, bannerAccentColor].forEach((input) => {
      const label = document.getElementById(`${input.id}-value`);
      if (label) label.textContent = input.value;
    });
    renderBannerPreview();
  };

  const loadHomepageBanner = async () => {
    const row = await TexAdminApi.getHomepageBanner();
    fillBannerForm(row);
  };

  const emptySideAd = (side, placement) => ({ side, placement, is_enabled: false, style: 'card', font_style: 'bold', animation: 'static', text_color: '#075c4b', background_color: '#ecfff8', accent_color: '#a9e8d2', message_text: '', image_alt: '', image_path: null });
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
      if (note) note.textContent = 'Automatic display: maximum 160 px wide, proportional height, no page expansion.';
    } else {
      const empty = document.createElement('span');
      empty.className = 'side-ad-preview-empty';
      empty.textContent = 'No image selected';
      preview.appendChild(empty);
      if (note) note.textContent = 'Automatic display: maximum 160 px wide, proportional height, no page expansion.';
    }
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
        if (note) note.textContent = `${image.naturalWidth} × ${image.naturalHeight} px · automatic display up to 160 px wide, proportional height.`;
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
          is_enabled: sideAdValue(side, 'enabled').value === 'true'
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

  document.querySelectorAll('[data-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.tab;
      document.querySelectorAll('[data-tab]').forEach((tab) => { tab.classList.toggle('active', tab === button); tab.setAttribute('aria-selected', tab === button ? 'true' : 'false'); });
      document.querySelectorAll('[data-panel]').forEach((panel) => { panel.hidden = panel.dataset.panel !== target; });
    });
  });
  memberSearch.addEventListener('input', renderMembers);
  statusFilter.addEventListener('change', renderSubmissions);
  bindSideAd('left');
  bindSideAd('right');
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
      fillBannerForm(row);
      showMessage('Homepage banner saved.', 'ok');
    } catch (error) {
      showMessage(`Could not save the homepage banner: ${error.message}`, 'error');
    } finally {
      button.disabled = false;
      button.textContent = 'Save banner';
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
