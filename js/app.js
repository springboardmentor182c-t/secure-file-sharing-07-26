// ===== TrustShare Main App Router & Dashboard =====

const Router = {
  routes: {
    landing: 'page-landing',
    auth: 'page-auth',
    dashboard: 'page-app',
    files: 'page-app',
    sharing: 'page-app',
    analytics: 'page-app',
    notifications: 'page-app',
    admin: 'page-app',
  },

  navigate(page) {
    const prevPage = TS.state.currentPage;
    TS.state.currentPage = page;

    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // Show target page wrapper
    const pageId = this.routes[page];
    if (pageId) {
      document.getElementById(pageId)?.classList.add('active');
    }

    // Handle app pages (with sidebar)
    if (['dashboard','files','sharing','analytics','notifications','admin'].includes(page)) {
      if (!TS.state.currentUser) {
        TS.state.currentUser = TS.users[0]; // auto-login for demo
      }
      this.renderAppShell(page);
    }

    // Scroll to top
    window.scrollTo(0, 0);
  },

  renderAppShell(page) {
    // Update sidebar active state
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });

    // Update header title
    const titles = {
      dashboard: 'Dashboard',
      files: 'File Manager',
      sharing: 'Sharing Center',
      analytics: 'Analytics',
      notifications: 'Notifications',
      admin: 'Admin Panel',
    };
    const titleEl = document.getElementById('header-page-title');
    if (titleEl) titleEl.textContent = titles[page] || page;

    // Update notification badge
    const count = TS.getUnreadCount();
    const badge = document.getElementById('sidebar-notif-badge');
    if (badge) badge.textContent = count;
    const headerDot = document.getElementById('header-notif-dot');
    if (headerDot) headerDot.style.display = count > 0 ? 'block' : 'none';

    // Update user info
    const user = TS.getCurrentUser();
    const nameEl = document.getElementById('sidebar-user-name');
    const roleEl = document.getElementById('sidebar-user-role');
    const avatarEl = document.getElementById('sidebar-user-avatar');
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = `${user.role} · ${user.plan}`;
    if (avatarEl) { avatarEl.textContent = user.avatar; avatarEl.style.background = user.avatarColor; }

    // Render page content
    Dashboard.renderPage(page);
  },
};

const Dashboard = {

  renderPage(page) {
    switch(page) {
      case 'dashboard': this.renderDashboard(); break;
      case 'files': Files.render(); break;
      case 'sharing': Sharing.render(); break;
      case 'analytics': Analytics.render(); break;
      case 'notifications': this.renderNotifications(); break;
      case 'admin': this.renderAdmin(); break;
    }
  },

  renderDashboard() {
    const content = document.getElementById('page-content-area');
    if (!content) return;

    const user = TS.getCurrentUser();
    const files = TS.getRootFiles();
    const storage = TS.storageData;
    const unread = TS.getUnreadCount();

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    content.innerHTML = `
      <!-- Welcome -->
      <div class="dashboard-welcome">
        <div>
          <div class="welcome-greeting">${greeting}, ${user.name.split(' ')[0]} 👋</div>
          <div class="welcome-date">${new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</div>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-secondary" onclick="Router.navigate('files')">📁 My Files</button>
          <button class="btn btn-primary" onclick="Files.showUploadDialog()">⬆️ Upload File</button>
        </div>
      </div>

      <!-- Security Banner (if MFA disabled) -->
      ${!user.mfaEnabled ? `
        <div class="card mb-6" style="padding:16px 20px;background:rgba(245,158,11,0.08);border-color:rgba(245,158,11,0.25);display:flex;align-items:center;justify-content:space-between;gap:16px;">
          <div class="flex items-center gap-12">
            <span style="font-size:1.25rem;">⚠️</span>
            <div>
              <div style="font-weight:700;color:var(--amber-400);">Enable Two-Factor Authentication</div>
              <div style="font-size:0.8125rem;color:var(--text-secondary);">Protect your account with an additional layer of security</div>
            </div>
          </div>
          <button class="btn btn-sm" style="background:rgba(245,158,11,0.2);color:var(--amber-400);border:1px solid rgba(245,158,11,0.4);white-space:nowrap;" onclick="Notifications.success('MFA Setup','Authenticator app setup started.')">Enable MFA</button>
        </div>
      ` : ''}

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="card stat-card stat-card-blue">
          <div class="stat-card-header">
            <div class="stat-card-icon" style="background:rgba(59,130,246,0.15);color:var(--blue-400);">📁</div>
            <span class="stat-card-trend trend-up">↑ 8%</span>
          </div>
          <div class="stat-card-value">${user.filesOwned}</div>
          <div class="stat-card-label">Total Files</div>
        </div>
        <div class="card stat-card stat-card-purple">
          <div class="stat-card-header">
            <div class="stat-card-icon" style="background:rgba(139,92,246,0.15);color:var(--purple-400);">🔗</div>
            <span class="stat-card-trend trend-up">↑ 3</span>
          </div>
          <div class="stat-card-value">${user.filesShared}</div>
          <div class="stat-card-label">Files Shared</div>
        </div>
        <div class="card stat-card stat-card-emerald">
          <div class="stat-card-header">
            <div class="stat-card-icon" style="background:rgba(16,185,129,0.15);color:var(--emerald-400);">💾</div>
            <span class="stat-card-trend trend-up">↑ 4.2 GB</span>
          </div>
          <div class="stat-card-value">${user.storageUsed} GB</div>
          <div class="stat-card-label">Storage Used</div>
        </div>
        <div class="card stat-card stat-card-amber">
          <div class="stat-card-header">
            <div class="stat-card-icon" style="background:rgba(245,158,11,0.15);color:var(--amber-400);">🔔</div>
            <span class="stat-card-trend trend-up">${unread} new</span>
          </div>
          <div class="stat-card-value">${unread}</div>
          <div class="stat-card-label">Notifications</div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="dashboard-grid">
        <div class="dashboard-main">
          <!-- Recent Files -->
          <div class="card" style="padding:20px;">
            <div class="section-header">
              <div class="section-title">📄 Recent Files</div>
              <button class="btn btn-ghost btn-sm" onclick="Router.navigate('files')">View All →</button>
            </div>
            <div class="file-list">
              ${files.slice(0, 6).map(f => `
                <div class="file-item" onclick="Files.openFile('${f.id}')">
                  <div class="file-icon" style="background:${f.color}20;color:${f.color};">${f.icon}</div>
                  <div class="file-info">
                    <div class="file-name">${f.name}</div>
                    <div class="file-meta">
                      ${f.type === 'folder' ? `${f.itemCount} items` : `${f.size}`}
                      ${f.shared ? ' · <span style="color:var(--blue-400);">Shared</span>' : ''}
                    </div>
                  </div>
                  <div style="font-size:0.8125rem;color:var(--text-muted);">${f.modified}</div>
                  ${f.encrypted ? '<span class="enc-badge">🔐</span>' : '<span style="font-size:0.75rem;color:var(--text-muted);">🔓</span>'}
                  <div class="file-actions">
                    <button class="btn btn-ghost btn-icon" onclick="event.stopPropagation();Sharing.showShareDialog('${f.id}')">🔗</button>
                    <button class="btn btn-ghost btn-icon" onclick="event.stopPropagation();Files.downloadFile('${f.id}')">⬇️</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="card" style="padding:20px;">
            <div class="section-header">
              <div class="section-title">⚡ Quick Actions</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
              ${[
                { icon:'⬆️', label:'Upload File', color:'#3b82f6', action:"Files.showUploadDialog()" },
                { icon:'📁', label:'New Folder', color:'#8b5cf6', action:"Files.showNewFolderDialog()" },
                { icon:'🔗', label:'Share File', color:'#10b981', action:"Sharing.showNewShareDialog()" },
                { icon:'🔍', label:'Search', color:'#f59e0b', action:"document.querySelector('.header-search input')?.focus()" },
                { icon:'📊', label:'Analytics', color:'#06b6d4', action:"Router.navigate('analytics')" },
                { icon:'🛡️', label:'Security', color:'#ec4899', action:"Router.navigate('admin')" },
                { icon:'📥', label:'Download All', color:'#6366f1', action:"Notifications.info('Bulk Download','Preparing your files...')" },
                { icon:'🗑️', label:'Empty Trash', color:'#f43f5e', action:"Notifications.warning('Trash Cleared','All deleted files permanently removed.')" },
              ].map(a => `
                <button onclick="${a.action}" style="padding:16px 8px;background:${a.color}12;border:1px solid ${a.color}25;border-radius:var(--radius-md);display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;transition:all var(--transition-base);color:${a.color};" onmouseover="this.style.transform='translateY(-2px)';this.style.borderColor='${a.color}50'" onmouseout="this.style.transform='';this.style.borderColor='${a.color}25'">
                  <span style="font-size:1.5rem;">${a.icon}</span>
                  <span style="font-size:0.75rem;font-weight:600;color:var(--text-secondary);">${a.label}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Right Sidebar -->
        <div class="dashboard-side">
          <!-- Storage Overview -->
          <div class="card" style="padding:0;overflow:hidden;">
            <div style="padding:16px 20px;border-bottom:1px solid var(--border-subtle);font-weight:700;">💾 Storage Overview</div>
            <div class="storage-ring-wrapper">
              <div class="storage-ring">
                <svg viewBox="0 0 100 100" style="transform:rotate(-90deg);width:100%;height:100%;">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="12"/>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="url(#storageGrad)" stroke-width="12"
                    stroke-dasharray="${2 * Math.PI * 40}" stroke-dashoffset="${2 * Math.PI * 40 * (1 - storage.used/storage.total)}"
                    stroke-linecap="round"/>
                  <defs>
                    <linearGradient id="storageGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#3b82f6"/>
                      <stop offset="100%" stop-color="#8b5cf6"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div class="storage-ring-text">
                  <div class="storage-ring-percent">${Math.round(storage.used/storage.total*100)}%</div>
                  <div class="storage-ring-used">used</div>
                </div>
              </div>
              <div class="storage-breakdown">
                <div style="font-size:0.875rem;font-weight:700;margin-bottom:8px;">${storage.used} GB of ${storage.total} GB</div>
                ${storage.types.map(t => `
                  <div class="storage-type">
                    <div class="storage-type-label">
                      <div class="storage-dot" style="background:${t.color};"></div>
                      <span style="font-size:0.8125rem;color:var(--text-secondary);">${t.label}</span>
                    </div>
                    <span style="font-size:0.8125rem;font-weight:600;">${t.value} GB</span>
                  </div>
                `).join('')}
              </div>
            </div>
            <div style="padding:0 20px 16px;">
              <div class="progress-bar">
                <div class="progress-fill" style="width:${Math.round(storage.used/storage.total*100)}%"></div>
              </div>
            </div>
          </div>

          <!-- Activity Feed -->
          <div class="card" style="padding:20px;">
            <div class="section-header">
              <div class="section-title">🕐 Activity</div>
              <button class="btn btn-ghost btn-sm" onclick="Router.navigate('notifications')">See all</button>
            </div>
            <div class="activity-list">
              ${TS.activityFeed.map(a => `
                <div class="activity-item">
                  <div class="activity-icon" style="background:${a.bg};color:${a.color};">${a.icon}</div>
                  <div class="activity-body">
                    <div class="activity-text">${a.text}</div>
                    <div class="activity-time">${a.time}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Shared With Me -->
          <div class="card" style="padding:20px;">
            <div class="section-header">
              <div class="section-title">👥 Shared With Me</div>
              <button class="btn btn-ghost btn-sm" onclick="Router.navigate('sharing')">Manage</button>
            </div>
            ${TS.users.slice(1, 4).map(u => `
              <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-subtle);">
                <div class="avatar avatar-sm" style="background:${u.avatarColor};">${u.avatar}</div>
                <div style="flex:1;min-width:0;">
                  <div style="font-size:0.875rem;font-weight:600;">${u.name}</div>
                  <div style="font-size:0.75rem;color:var(--text-muted);">Shared ${u.filesShared} files</div>
                </div>
                <div class="status-dot status-${u.status}"></div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  renderNotifications() {
    const content = document.getElementById('page-content-area');
    if (!content) return;

    const notifs = TS.notificationsData;
    const unread = notifs.filter(n => n.unread);

    content.innerHTML = `
      <div class="dashboard-welcome" style="margin-bottom:20px;">
        <div>
          <div class="welcome-greeting" style="font-size:1.375rem;">Notifications</div>
          <div class="welcome-date">${unread.length} unread · ${notifs.length} total</div>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-secondary btn-sm" onclick="Dashboard.markAllRead()">✅ Mark All Read</button>
          <button class="btn btn-ghost btn-sm" onclick="Dashboard.clearNotifications()">🗑️ Clear All</button>
        </div>
      </div>

      <div class="notif-filters">
        ${['All', 'Unread', 'Security', 'Shares', 'Activity', 'Uploads'].map((f, i) =>
          `<button class="notif-filter-btn ${i === 0 ? 'active' : ''}" onclick="Dashboard.filterNotifs('${f.toLowerCase()}', this)">${f} ${i === 1 ? `(${unread.length})` : ''}</button>`
        ).join('')}
      </div>

      <div class="notif-list" id="notif-list">
        ${notifs.map(n => this.renderNotifItem(n)).join('')}
      </div>
    `;
  },

  renderNotifItem(n) {
    return `
      <div class="notif-item ${n.unread ? 'unread' : ''}" id="notif-${n.id}" onclick="Dashboard.readNotif('${n.id}')">
        <div class="notif-icon" style="background:${n.iconBg};color:${n.iconColor};">${n.icon}</div>
        <div class="notif-content">
          <div class="notif-title">${n.title}</div>
          <div class="notif-desc">${n.desc}</div>
          <div class="notif-meta">
            <span class="notif-time">${n.time}</span>
            <span class="badge ${n.type === 'security' ? 'badge-rose' : n.type === 'share' ? 'badge-blue' : 'badge-cyan'}">${n.type}</span>
          </div>
        </div>
        ${n.unread ? '<div class="unread-dot"></div>' : ''}
      </div>
    `;
  },

  filterNotifs(filter, btn) {
    document.querySelectorAll('.notif-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    let filtered = TS.notificationsData;
    if (filter === 'unread') filtered = TS.notificationsData.filter(n => n.unread);
    else if (filter !== 'all') filtered = TS.notificationsData.filter(n => n.category === filter);

    const list = document.getElementById('notif-list');
    if (list) list.innerHTML = filtered.map(n => this.renderNotifItem(n)).join('');
  },

  readNotif(id) {
    const n = TS.notificationsData.find(n => n.id === id);
    if (n) n.unread = false;
    const el = document.getElementById(`notif-${id}`);
    if (el) {
      el.classList.remove('unread');
      el.querySelector('.unread-dot')?.remove();
    }
    Router.renderAppShell(TS.state.currentPage);
  },

  markAllRead() {
    TS.notificationsData.forEach(n => n.unread = false);
    this.renderNotifications();
    Router.renderAppShell(TS.state.currentPage);
    Notifications.success('Done', 'All notifications marked as read.');
  },

  clearNotifications() {
    TS.notificationsData.length = 0;
    this.renderNotifications();
    Notifications.info('Cleared', 'All notifications cleared.');
  },

  renderAdmin() {
    const content = document.getElementById('page-content-area');
    if (!content) return;

    content.innerHTML = `
      <div class="dashboard-welcome" style="margin-bottom:20px;">
        <div>
          <div class="welcome-greeting" style="font-size:1.375rem;">Admin Panel</div>
          <div class="welcome-date">System management, users & security monitoring</div>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-secondary btn-sm" onclick="Notifications.info('Backup','System backup initiated...')">💾 Backup</button>
          <button class="btn btn-primary btn-sm" onclick="Notifications.success('Report','Admin report generated.')">📊 Report</button>
        </div>
      </div>

      <!-- System Stats -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px;">
        ${[
          { icon:'👥', label:'Total Users', value: TS.users.length, color:'var(--blue-400)' },
          { icon:'📁', label:'Total Files', value: TS.files.length, color:'var(--purple-400)' },
          { icon:'🔗', label:'Active Links', value: TS.sharedLinks.filter(l=>l.status==='active').length, color:'var(--emerald-400)' },
          { icon:'🛡️', label:'Security Score', value:'94/100', color:'var(--amber-400)' },
        ].map(s => `
          <div class="card" style="padding:16px;display:flex;align-items:center;gap:12px;">
            <div style="width:42px;height:42px;border-radius:var(--radius-md);background:${s.color}18;display:flex;align-items:center;justify-content:center;font-size:1.25rem;">${s.icon}</div>
            <div>
              <div style="font-size:1.25rem;font-weight:800;color:${s.color};">${s.value}</div>
              <div style="font-size:0.75rem;color:var(--text-muted);">${s.label}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="admin-grid">
        <!-- User Management -->
        <div class="card" style="padding:0;overflow:hidden;">
          <div style="padding:16px 20px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;justify-content:space-between;">
            <div style="font-weight:700;">👥 User Management</div>
            <button class="btn btn-primary btn-sm" onclick="Dashboard.showAddUserDialog()">+ Add User</button>
          </div>
          <div>
            ${TS.users.map(u => `
              <div class="user-row">
                <div class="avatar avatar-md" style="background:${u.avatarColor};">${u.avatar}</div>
                <div class="user-row-info">
                  <div class="user-row-name">${u.name}</div>
                  <div class="user-row-email">${u.email}</div>
                </div>
                <span class="badge ${u.role === 'Admin' ? 'badge-purple' : u.role === 'Member' ? 'badge-blue' : 'badge-amber'}">${u.role}</span>
                <div class="status-dot status-${u.status}"></div>
                <div class="user-row-actions">
                  <button class="btn btn-ghost btn-icon" title="Edit" onclick="Notifications.info('Edit User','Opening user settings for ${u.name}')">✏️</button>
                  <button class="btn btn-danger btn-icon" title="Disable" onclick="Notifications.warning('User Disabled','${u.name} access has been suspended.')">🚫</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Audit Log -->
        <div class="card" style="padding:0;overflow:hidden;">
          <div style="padding:16px 20px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;justify-content:space-between;">
            <div style="font-weight:700;">📋 Audit Log</div>
            <button class="btn btn-ghost btn-sm" onclick="Notifications.info('Export','Audit log exported.')">Export CSV</button>
          </div>
          <div style="max-height:340px;overflow-y:auto;">
            ${TS.auditLog.map(a => `
              <div class="audit-item">
                <span class="audit-time">${a.time}</span>
                <span class="audit-event">${a.event}</span>
                <span class="badge ${a.levelClass} audit-level">${a.level}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Security Monitor -->
        <div class="card" style="padding:20px;">
          <div style="font-weight:700;font-size:1rem;margin-bottom:16px;">🛡️ Security Monitor</div>
          ${[
            { label:'API Gateway Status', value:'🟢 Healthy', color:'var(--emerald-400)' },
            { label:'SSL Certificate', value:'Valid · 247d left', color:'var(--emerald-400)' },
            { label:'Rate Limiting', value:'Active', color:'var(--emerald-400)' },
            { label:'Intrusion Detection', value:'🟢 No threats', color:'var(--emerald-400)' },
            { label:'Failed Logins (24h)', value:'3 blocked', color:'var(--amber-400)' },
            { label:'Anomaly Detection', value:'ML model active', color:'var(--emerald-400)' },
            { label:'Key Rotation', value:'7 days ago', color:'var(--blue-400)' },
            { label:'SIEM Integration', value:'Connected', color:'var(--emerald-400)' },
          ].map(s => `
            <div class="security-stat">
              <span class="security-stat-label">${s.label}</span>
              <span class="security-stat-value" style="color:${s.color};">${s.value}</span>
            </div>
          `).join('')}
          <button class="btn btn-secondary w-full mt-3" onclick="Notifications.info('Scan','Running full security scan...')">🔍 Run Security Scan</button>
        </div>

        <!-- Infrastructure -->
        <div class="card" style="padding:20px;">
          <div style="font-weight:700;font-size:1rem;margin-bottom:16px;">⚙️ Infrastructure Status</div>
          ${[
            { name:'Auth Service', status:'online', latency:'12ms' },
            { name:'File Service', status:'online', latency:'8ms' },
            { name:'Encryption Service', status:'online', latency:'45ms' },
            { name:'Sharing Service', status:'online', latency:'15ms' },
            { name:'Notification Service', status:'online', latency:'22ms' },
            { name:'Analytics Service', status:'online', latency:'38ms' },
            { name:'Message Queue', status:'online', latency:'5ms' },
            { name:'Storage (AWS S3)', status:'online', latency:'120ms' },
          ].map(s => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-subtle);font-size:0.875rem;">
              <div class="flex items-center gap-2">
                <div class="status-dot status-${s.status}"></div>
                <span>${s.name}</span>
              </div>
              <span style="color:var(--text-muted);font-family:monospace;">${s.latency}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  showAddUserDialog() {
    Notifications.info('Add User', 'Opening user invitation form...');
  },
};

// ===== App Initialization =====
document.addEventListener('DOMContentLoaded', () => {
  // Init
  Router.navigate('landing');

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.getElementById('modal-overlay')?.classList.add('hidden');
      document.getElementById('context-menu')?.classList.add('hidden');
    }
  });

  // Sidebar mobile toggle
  document.getElementById('sidebar-toggle-btn')?.addEventListener('click', () => {
    const sidebar = document.getElementById('app-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar?.classList.toggle('open');
    overlay?.classList.toggle('open');
    TS.state.sidebarOpen = !TS.state.sidebarOpen;
  });

  document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
    document.getElementById('app-sidebar')?.classList.remove('open');
    document.getElementById('sidebar-overlay')?.classList.remove('open');
  });

  // Global search
  document.getElementById('global-search')?.addEventListener('input', e => {
    if (TS.state.currentPage === 'files') {
      Files.searchFiles(e.target.value);
    }
  });

  // Modal close on overlay click
  document.getElementById('modal-overlay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) {
      document.getElementById('modal-overlay').classList.add('hidden');
    }
  });

  // Simulate periodic notification
  setTimeout(() => {
    if (TS.state.currentPage !== 'landing' && TS.state.currentPage !== 'auth') {
      Notifications.info('New Access', 'Someone just viewed your shared file.');
    }
  }, 8000);
});

window.Router = Router;
window.Dashboard = Dashboard;
