// ===== TrustShare Sharing & Permissions Module =====

const Sharing = {

  render() {
    const content = document.getElementById('page-content-area');
    if (!content) return;

    const links = TS.sharedLinks;
    const users = TS.users.slice(1); // other users

    content.innerHTML = `
      <!-- Header -->
      <div class="dashboard-welcome" style="margin-bottom:20px;">
        <div>
          <div class="welcome-greeting" style="font-size:1.375rem;">Sharing Center</div>
          <div class="welcome-date">Manage shared files, permissions & access control</div>
        </div>
        <button class="btn btn-primary" onclick="Sharing.showNewShareDialog()">🔗 Create Share Link</button>
      </div>

      <!-- Stats Row -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px;">
        ${[
          { icon: '🔗', label: 'Active Links', value: links.filter(l=>l.status==='active').length, color: 'var(--blue-400)' },
          { icon: '👥', label: 'Shared With', value: '4 users', color: 'var(--purple-400)' },
          { icon: '👁️', label: 'Total Views', value: links.reduce((a,l)=>a+l.accessCount,0), color: 'var(--emerald-400)' },
          { icon: '⚠️', label: 'Expiring Soon', value: '2 links', color: 'var(--amber-400)' },
        ].map(s => `
          <div class="card" style="padding:16px;display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:var(--radius-md);background:${s.color}18;display:flex;align-items:center;justify-content:center;font-size:1.25rem;flex-shrink:0;">${s.icon}</div>
            <div>
              <div style="font-size:1.25rem;font-weight:800;color:${s.color};">${s.value}</div>
              <div style="font-size:0.75rem;color:var(--text-muted);">${s.label}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <div style="display:grid;grid-template-columns:1fr 360px;gap:20px;">
        <!-- Shared Links Table -->
        <div>
          <div class="card">
            <div style="padding:20px 24px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;justify-content:space-between;">
              <div>
                <div style="font-weight:700;font-size:1rem;">Shared Links</div>
                <div style="font-size:0.8125rem;color:var(--text-muted);">${links.length} total links</div>
              </div>
              <div class="flex gap-2">
                <button class="btn btn-ghost btn-sm" onclick="Notifications.info('Exported','Link report downloaded.')">📥 Export</button>
              </div>
            </div>

            <!-- Column Headers -->
            <div style="display:grid;grid-template-columns:1fr 90px 80px 80px 110px;gap:12px;padding:10px 20px;font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid var(--border-subtle);">
              <div>File</div><div>Permission</div><div>Views</div><div>Expires</div><div>Actions</div>
            </div>

            ${links.map(link => `
              <div style="display:grid;grid-template-columns:1fr 90px 80px 80px 110px;gap:12px;padding:14px 20px;align-items:center;border-bottom:1px solid var(--border-subtle);transition:background var(--transition-fast);" class="hover-row" onmouseover="this.style.background='var(--bg-card)'" onmouseout="this.style.background='transparent'">
                <div style="min-width:0;">
                  <div style="font-weight:600;font-size:0.9375rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${link.fileName}</div>
                  <div style="font-size:0.75rem;color:var(--text-muted);font-family:monospace;margin-top:2px;">${link.link.replace('https://','')}</div>
                  <div class="flex gap-1 mt-1" style="flex-wrap:wrap;">
                    <span class="badge ${link.status === 'active' ? 'badge-emerald' : 'badge-rose'}">${link.status}</span>
                    ${link.password ? '<span class="badge badge-amber">🔑 Password</span>' : ''}
                  </div>
                </div>
                <div>
                  <span class="badge ${link.permissions === 'view' ? 'badge-blue' : link.permissions === 'edit' ? 'badge-purple' : 'badge-cyan'}">
                    ${link.permissions === 'view' ? '👁️' : link.permissions === 'edit' ? '✏️' : '⬇️'} ${link.permissions}
                  </span>
                </div>
                <div style="font-weight:600;">${link.accessCount}</div>
                <div style="font-size:0.8125rem;color:var(--text-muted);">${link.expiresAt}</div>
                <div class="flex gap-1">
                  <button class="btn btn-ghost btn-icon" title="Copy Link" onclick="Sharing.copyLink('${link.link}')">📋</button>
                  <button class="btn btn-ghost btn-icon" title="Settings" onclick="Sharing.showLinkSettings('${link.id}')">⚙️</button>
                  <button class="btn btn-danger btn-icon" title="Revoke" onclick="Sharing.revokeLink('${link.id}')">🚫</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Right Panel -->
        <div style="display:flex;flex-direction:column;gap:16px;">
          <!-- People Access -->
          <div class="card" style="padding:20px;">
            <div style="font-weight:700;font-size:1rem;margin-bottom:4px;">People with Access</div>
            <div style="font-size:0.8125rem;color:var(--text-muted);margin-bottom:16px;">Manage individual permissions</div>
            ${users.map(u => `
              <div class="permission-row">
                <div class="permission-user">
                  <div class="avatar avatar-md" style="background:${u.avatarColor};">${u.avatar}</div>
                  <div>
                    <div style="font-size:0.875rem;font-weight:600;">${u.name}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);">${u.email}</div>
                  </div>
                </div>
                <select class="permission-select" onchange="Sharing.updatePermission('${u.id}', this.value)">
                  <option value="view">Can View</option>
                  <option value="edit">Can Edit</option>
                  <option value="download">Can Download</option>
                  <option value="none">No Access</option>
                </select>
              </div>
            `).join('')}
            <button class="btn btn-secondary w-full mt-3" onclick="Sharing.showInviteDialog()">
              ➕ Invite People
            </button>
          </div>

          <!-- Security Settings -->
          <div class="card" style="padding:20px;">
            <div style="font-weight:700;font-size:1rem;margin-bottom:16px;">🛡️ Security Settings</div>
            <div style="display:flex;flex-direction:column;gap:14px;">
              ${[
                { id: 'opt-watermark', label: 'Watermark PDFs', desc: 'Add viewer name/date', checked: true },
                { id: 'opt-dlprotect', label: 'Download Protection', desc: 'Prevent screen capture', checked: false },
                { id: 'opt-geo', label: 'Geo Restriction', desc: 'India, US only', checked: false },
                { id: 'opt-expiry', label: 'Auto-expire Links', desc: 'After 30 days', checked: true },
              ].map(opt => `
                <label class="toggle-switch" style="font-size:0.8125rem;color:var(--text-secondary);">
                  <input type="checkbox" class="toggle-input" id="${opt.id}" ${opt.checked ? 'checked' : ''} onchange="Sharing.onSecurityToggle('${opt.id}', this.checked)">
                  <span class="toggle-track"><span class="toggle-thumb"></span></span>
                  <div>
                    <div style="color:var(--text-primary);font-weight:600;">${opt.label}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);">${opt.desc}</div>
                  </div>
                </label>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  showShareDialog(fileId) {
    const file = TS.getFileById(fileId);
    if (!file) return;

    const modal = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    if (!modal || !modalContent) return;

    const generatedLink = TS.generateShareLink();

    modalContent.innerHTML = `
      <div class="modal-header">
        <div class="flex items-center gap-3">
          <span style="font-size:1.75rem;">${file.icon}</span>
          <div>
            <div class="modal-title">Share File</div>
            <div style="font-size:0.8125rem;color:var(--text-muted);">${file.name}</div>
          </div>
        </div>
        <button class="modal-close" onclick="document.getElementById('modal-overlay').classList.add('hidden')">&times;</button>
      </div>
      <div class="modal-body">
        <!-- Share via Link -->
        <div style="margin-bottom:20px;">
          <div style="font-weight:700;margin-bottom:12px;">🔗 Share via Link</div>
          <div class="share-link-box">
            <input class="share-link-input" id="share-link-value" value="${generatedLink}" readonly>
            <button class="btn btn-primary btn-sm" onclick="Sharing.copyLink('${generatedLink}')">📋 Copy</button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs mb-4" id="share-tabs">
          <button class="tab-btn active" onclick="Sharing.switchTab('settings', this)">⚙️ Settings</button>
          <button class="tab-btn" onclick="Sharing.switchTab('people', this)">👥 People</button>
          <button class="tab-btn" onclick="Sharing.switchTab('analytics', this)">📊 Analytics</button>
        </div>

        <!-- Settings Tab -->
        <div id="share-tab-settings">
          <div style="display:flex;flex-direction:column;gap:16px;">
            <div class="form-group">
              <label class="form-label">Permission Level</label>
              <select class="form-input" id="share-perm">
                <option value="view">👁️ View only</option>
                <option value="download">⬇️ View & Download</option>
                <option value="edit">✏️ View, Edit & Download</option>
              </select>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label class="form-label">Expiry Date</label>
                <input type="date" class="form-input" id="share-expiry" min="${new Date().toISOString().split('T')[0]}">
              </div>
              <div class="form-group">
                <label class="form-label">Max Views</label>
                <input type="number" class="form-input" id="share-max-views" placeholder="Unlimited" min="1">
              </div>
            </div>
            <label class="toggle-switch" style="font-size:0.875rem;color:var(--text-secondary);">
              <input type="checkbox" class="toggle-input" id="share-password">
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
              <div>
                <div style="color:var(--text-primary);font-weight:600;">Password Protection</div>
                <div style="font-size:0.75rem;color:var(--text-muted);">Require a password to access</div>
              </div>
            </label>
            <label class="toggle-switch" style="font-size:0.875rem;color:var(--text-secondary);">
              <input type="checkbox" class="toggle-input" id="share-notify" checked>
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
              <div>
                <div style="color:var(--text-primary);font-weight:600;">Access Notifications</div>
                <div style="font-size:0.75rem;color:var(--text-muted);">Get notified when file is accessed</div>
              </div>
            </label>
          </div>
        </div>

        <!-- People Tab -->
        <div id="share-tab-people" style="display:none;">
          <div class="form-group mb-4">
            <label class="form-label">Invite by Email</label>
            <div class="flex gap-2">
              <div class="input-group flex-1">
                <span class="input-icon">✉️</span>
                <input type="email" class="form-input" id="invite-email" placeholder="colleague@company.com">
              </div>
              <button class="btn btn-primary btn-sm" onclick="Sharing.sendInvite()">Invite</button>
            </div>
          </div>
          <div style="font-size:0.8125rem;font-weight:600;color:var(--text-muted);margin-bottom:8px;">CURRENTLY SHARED WITH</div>
          ${TS.users.slice(1, 3).map(u => `
            <div class="permission-row">
              <div class="permission-user">
                <div class="avatar avatar-sm" style="background:${u.avatarColor};">${u.avatar}</div>
                <div>
                  <div style="font-size:0.875rem;font-weight:600;">${u.name}</div>
                  <div style="font-size:0.75rem;color:var(--text-muted);">${u.email}</div>
                </div>
              </div>
              <div class="flex items-center gap-6">
                <select class="permission-select">
                  <option>Can View</option><option>Can Edit</option>
                </select>
                <button class="btn btn-ghost btn-icon" onclick="Notifications.warning('Access Removed','User access revoked.')">✕</button>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Analytics Tab -->
        <div id="share-tab-analytics" style="display:none;">
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;">
            ${[
              { icon:'👁️', label:'Total Views', value:'23' },
              { icon:'⬇️', label:'Downloads', value:'8' },
              { icon:'🌍', label:'Countries', value:'3' },
            ].map(s => `
              <div class="card" style="padding:14px;text-align:center;">
                <div style="font-size:1.5rem;margin-bottom:6px;">${s.icon}</div>
                <div style="font-size:1.25rem;font-weight:800;">${s.value}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);">${s.label}</div>
              </div>
            `).join('')}
          </div>
          <div style="font-size:0.8125rem;font-weight:700;color:var(--text-muted);margin-bottom:8px;">RECENT ACCESS LOG</div>
          ${[
            { who: 'priya@acmecorp.com', action: 'Viewed', time: '2 hours ago', location: 'Mumbai, IN' },
            { who: 'rahul@devteam.io', action: 'Downloaded', time: 'Yesterday', location: 'Bangalore, IN' },
            { who: 'Unknown', action: 'Viewed', time: '2 days ago', location: 'New York, US' },
          ].map(a => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border-subtle);font-size:0.8125rem;">
              <div>
                <div style="font-weight:600;">${a.who}</div>
                <div style="color:var(--text-muted);">${a.location} · ${a.time}</div>
              </div>
              <span class="badge ${a.action === 'Downloaded' ? 'badge-cyan' : 'badge-blue'}">${a.action}</span>
            </div>
          `).join('')}
        </div>

        <div class="flex gap-2 mt-4">
          <button class="btn btn-primary flex-1" onclick="Sharing.createLink('${fileId}')">✅ Create & Copy Link</button>
          <button class="btn btn-secondary" onclick="document.getElementById('modal-overlay').classList.add('hidden')">Cancel</button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
  },

  switchTab(tab, btn) {
    // Update button states
    document.querySelectorAll('#share-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // Show/hide content
    ['settings', 'people', 'analytics'].forEach(t => {
      const el = document.getElementById(`share-tab-${t}`);
      if (el) el.style.display = t === tab ? 'block' : 'none';
    });
  },

  copyLink(link) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => {
        Notifications.success('Copied!', 'Share link copied to clipboard.');
      });
    } else {
      Notifications.success('Copied!', 'Share link copied to clipboard.');
    }
  },

  createLink(fileId) {
    const file = TS.getFileById(fileId);
    const perm = document.getElementById('share-perm')?.value || 'view';
    const expiry = document.getElementById('share-expiry')?.value;
    const newLink = TS.generateShareLink();

    const newShare = {
      id: `sl${Date.now()}`,
      fileId,
      fileName: file?.name || 'File',
      link: newLink,
      permissions: perm,
      expiresAt: expiry || '—',
      accessCount: 0,
      password: document.getElementById('share-password')?.checked || false,
      recipients: [],
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
    };

    TS.sharedLinks.push(newShare);
    this.copyLink(newLink);
    document.getElementById('modal-overlay').classList.add('hidden');
    Notifications.success('Link Created!', `Shareable link generated and copied.`);

    if (TS.state.currentPage === 'sharing') this.render();
  },

  revokeLink(linkId) {
    const link = TS.sharedLinks.find(l => l.id === linkId);
    if (!link) return;
    link.status = 'revoked';
    Notifications.warning('Link Revoked', `Access to "${link.fileName}" has been revoked.`);
    this.render();
  },

  showLinkSettings(linkId) {
    const link = TS.sharedLinks.find(l => l.id === linkId);
    if (!link) return;
    const fileId = link.fileId;
    this.showShareDialog(fileId);
  },

  sendInvite() {
    const email = document.getElementById('invite-email')?.value;
    if (!email) { Notifications.warning('No Email', 'Please enter an email address.'); return; }
    Notifications.success('Invitation Sent', `Invite sent to ${email} with access notification.`);
    if (document.getElementById('invite-email')) document.getElementById('invite-email').value = '';
  },

  showInviteDialog() {
    document.getElementById('invite-email')?.focus();
    Notifications.info('Invite', 'Enter an email address in the field above.');
  },

  showNewShareDialog() {
    // Pick first file
    const file = TS.files[3]; // Q2 Financial Report
    if (file) this.showShareDialog(file.id);
  },

  updatePermission(userId, perm) {
    Notifications.info('Permission Updated', `User access changed to "${perm}".`);
  },

  onSecurityToggle(optId, checked) {
    const labels = {
      'opt-watermark': 'PDF Watermarking',
      'opt-dlprotect': 'Download Protection',
      'opt-geo': 'Geo Restriction',
      'opt-expiry': 'Auto-expire Links',
    };
    Notifications.info('Setting Saved', `${labels[optId] || 'Setting'} ${checked ? 'enabled' : 'disabled'}.`);
  },
};

window.Sharing = Sharing;
