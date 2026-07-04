// ===== TrustShare File Management Module =====

const Files = {
  currentView: 'list',
  uploadSimInterval: null,
  contextTarget: null,

  // ===== Render File Manager Page =====
  render() {
    const content = document.getElementById('page-content-area');
    if (!content) return;

    const files = TS.getRootFiles();

    content.innerHTML = `
      <!-- Toolbar -->
      <div class="file-manager-toolbar">
        <div class="toolbar-left">
          <div class="breadcrumb-nav">
            <span class="breadcrumb-item" onclick="Files.navigate('root')">🏠 Home</span>
          </div>
          <div class="input-group" style="max-width:260px;">
            <span class="header-search-icon">🔍</span>
            <input type="text" class="form-input" placeholder="Search files..." id="file-search" oninput="Files.searchFiles(this.value)" style="padding-left:36px;">
          </div>
        </div>
        <div class="toolbar-right">
          <div class="view-toggle">
            <button class="view-btn ${this.currentView === 'list' ? 'active' : ''}" onclick="Files.setView('list')" title="List view">☰</button>
            <button class="view-btn ${this.currentView === 'grid' ? 'active' : ''}" onclick="Files.setView('grid')" title="Grid view">⊞</button>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="Files.showNewFolderDialog()">
            📁 New Folder
          </button>
          <button class="btn btn-primary btn-sm" onclick="Files.showUploadDialog()">
            ⬆️ Upload
          </button>
        </div>
      </div>

      <!-- Upload Drop Zone -->
      <div class="upload-drop-zone" id="drop-zone"
           ondragover="Files.onDragOver(event)"
           ondragleave="Files.onDragLeave(event)"
           ondrop="Files.onDrop(event)"
           onclick="Files.showUploadDialog()">
        <div class="upload-icon">☁️</div>
        <div class="upload-title">Drop files here or click to upload</div>
        <div class="upload-desc">Maximum file size: 2GB · All files encrypted with AES-256</div>
        <div class="upload-types">
          ${['PDF', 'DOCX', 'XLSX', 'PNG', 'MP4', 'ZIP', 'Any file type'].map(t =>
            `<span class="badge badge-blue">${t}</span>`
          ).join('')}
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="flex items-center gap-2 mb-3" style="flex-wrap:wrap;">
        <span class="text-sm text-muted">Filter:</span>
        ${['All', 'Folders', 'Documents', 'Images', 'Videos', 'Shared'].map((f, i) =>
          `<button class="notif-filter-btn ${i === 0 ? 'active' : ''}" onclick="Files.filterFiles('${f}', this)">${f}</button>`
        ).join('')}
        <span class="text-muted" style="margin-left:auto;font-size:0.8125rem;">${files.length} items · ${TS.storageData.used} GB used</span>
      </div>

      <!-- File List/Grid -->
      <div class="card" id="file-list-container">
        ${this.currentView === 'list' ? this.renderListView(files) : this.renderGridView(files)}
      </div>
    `;

    // Context menu
    document.addEventListener('contextmenu', this.handleContextMenu.bind(this), { once: false });
    document.addEventListener('click', () => {
      document.getElementById('context-menu')?.classList.add('hidden');
    });
  },

  renderListView(files) {
    if (files.length === 0) {
      return `<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">No files yet</div><div class="empty-desc">Upload your first file to get started</div></div>`;
    }

    return `
      <!-- Header Row -->
      <div style="display:flex;align-items:center;gap:12px;padding:10px 16px;border-bottom:1px solid var(--border-subtle);font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;">
        <div style="width:40px;"></div>
        <div style="flex:1;">Name</div>
        <div style="width:120px;">Modified</div>
        <div style="width:100px;">Encryption</div>
        <div style="width:80px;text-align:right;">Size</div>
        <div style="width:80px;"></div>
      </div>
      <div class="file-list" id="file-list">
        ${files.map(f => this.renderFileItem(f)).join('')}
      </div>
    `;
  },

  renderFileItem(file) {
    const isFolder = file.type === 'folder';
    return `
      <div class="file-item" id="fi-${file.id}" onclick="Files.selectFile('${file.id}')" ondblclick="Files.openFile('${file.id}')" oncontextmenu="Files.showContextMenu(event, '${file.id}')">
        <div class="file-icon" style="background:${file.color}20;color:${file.color};">
          ${file.icon}
        </div>
        <div class="file-info">
          <div class="file-name">${file.name}</div>
          <div class="file-meta">
            ${isFolder ? `${file.itemCount} items` : `v${file.version} · ${file.owner === TS.getCurrentUser().id ? 'You' : TS.users.find(u=>u.id===file.owner)?.name || 'Unknown'}`}
            ${file.shared ? ' · <span style="color:var(--blue-400);">Shared</span>' : ''}
          </div>
        </div>
        <div style="width:120px;font-size:0.8125rem;color:var(--text-muted);">${file.modified}</div>
        <div style="width:100px;">
          ${file.encrypted
            ? '<span class="enc-badge">🔐 AES-256</span>'
            : '<span style="font-size:0.75rem;color:var(--text-muted);">🔓 Unencrypted</span>'}
        </div>
        <div class="file-size">${file.size || '—'}</div>
        <div class="file-actions">
          <button class="btn btn-ghost btn-icon" title="Share" onclick="event.stopPropagation();Sharing.showShareDialog('${file.id}')">🔗</button>
          <button class="btn btn-ghost btn-icon" title="Download" onclick="event.stopPropagation();Files.downloadFile('${file.id}')">⬇️</button>
          <button class="btn btn-ghost btn-icon" title="More" onclick="event.stopPropagation();Files.showContextMenu(event, '${file.id}')">⋯</button>
        </div>
      </div>
    `;
  },

  renderGridView(files) {
    if (files.length === 0) {
      return `<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">No files yet</div></div>`;
    }
    return `
      <div class="files-grid" style="padding:20px;">
        ${files.map(f => `
          <div class="card files-grid-card" id="gfi-${f.id}" onclick="Files.selectFile('${f.id}')" ondblclick="Files.openFile('${f.id}')">
            ${f.encrypted ? `<div class="files-grid-enc" title="AES-256 Encrypted">🔐</div>` : ''}
            <div class="files-grid-icon">${f.icon}</div>
            <div class="files-grid-name">${f.name}</div>
            <div class="files-grid-size">${f.size || (f.itemCount + ' items')}</div>
          </div>
        `).join('')}
      </div>
    `;
  },

  setView(view) {
    this.currentView = view;
    TS.state.viewMode = view;
    this.render();
  },

  selectFile(id) {
    // Deselect all
    document.querySelectorAll('.file-item, .files-grid-card').forEach(el => el.classList.remove('selected'));
    // Select target
    const el = document.getElementById(`fi-${id}`) || document.getElementById(`gfi-${id}`);
    if (el) el.classList.add('selected');
    TS.state.selectedFiles = new Set([id]);
  },

  openFile(id) {
    const file = TS.getFileById(id);
    if (!file) return;
    if (file.type === 'folder') {
      Notifications.info(`Opening "${file.name}"`, `Loading ${file.itemCount} items...`);
    } else {
      this.showFileDetails(file);
    }
  },

  showFileDetails(file) {
    const modal = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    if (!modal || !modalContent) return;

    modalContent.innerHTML = `
      <div class="modal-header">
        <div class="flex items-center gap-3">
          <div style="font-size:2rem;">${file.icon}</div>
          <div>
            <div class="modal-title">${file.name}</div>
            <div style="font-size:0.8125rem;color:var(--text-muted);">File Details</div>
          </div>
        </div>
        <button class="modal-close" onclick="Files.closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
          ${[
            ['Size', file.size || '—'],
            ['Version', `v${file.version || 1}`],
            ['Modified', file.modified],
            ['Created', file.created],
            ['Owner', TS.users.find(u=>u.id===file.owner)?.name || 'Unknown'],
            ['Shared', file.shared ? '✅ Yes' : '❌ No'],
          ].map(([k,v]) => `
            <div>
              <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">${k}</div>
              <div style="font-size:0.9375rem;font-weight:600;">${v}</div>
            </div>
          `).join('')}
        </div>

        <!-- Encryption Info -->
        <div class="card" style="padding:16px;margin-bottom:16px;background:rgba(16,185,129,0.05);border-color:rgba(16,185,129,0.2);">
          <div class="flex items-center gap-2 mb-2">
            <span>🔐</span>
            <span style="font-weight:700;color:var(--emerald-400);">Encryption Details</span>
          </div>
          <div style="font-size:0.8125rem;color:var(--text-secondary);display:grid;gap:6px;">
            <div class="flex justify-between"><span>Algorithm</span><span style="color:var(--text-primary);font-weight:600;">AES-256-GCM</span></div>
            <div class="flex justify-between"><span>Key Rotation</span><span style="color:var(--text-primary);font-weight:600;">Monthly</span></div>
            <div class="flex justify-between"><span>Integrity Hash</span><span style="color:var(--text-primary);font-weight:600;font-family:monospace;font-size:0.75rem;">${file.hash || 'N/A'}</span></div>
          </div>
        </div>

        <!-- Version History -->
        <div class="mb-4">
          <div style="font-weight:700;margin-bottom:10px;">Version History</div>
          ${Array.from({length: Math.min(file.version || 1, 3)}, (_, i) => {
            const v = (file.version || 1) - i;
            return `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-subtle);font-size:0.8125rem;">
                <span style="color:var(--blue-400);font-weight:600;">v${v}</span>
                <span style="color:var(--text-muted);">${i === 0 ? 'Current' : `${i * 3} days ago`}</span>
                <button class="btn btn-ghost btn-sm" onclick="Notifications.info('Restore', 'Restoring version v${v}...')">⟳ Restore</button>
              </div>
            `;
          }).join('')}
        </div>

        <div class="flex gap-2">
          <button class="btn btn-primary flex-1" onclick="Files.downloadFile('${file.id}');Files.closeModal()">⬇️ Download</button>
          <button class="btn btn-secondary" onclick="Sharing.showShareDialog('${file.id}');Files.closeModal()">🔗 Share</button>
          <button class="btn btn-danger" onclick="Files.deleteFile('${file.id}');Files.closeModal()">🗑️</button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
  },

  closeModal() {
    document.getElementById('modal-overlay')?.classList.add('hidden');
  },

  searchFiles(query) {
    const allFiles = TS.getRootFiles();
    const filtered = query
      ? allFiles.filter(f => f.name.toLowerCase().includes(query.toLowerCase()))
      : allFiles;

    const listEl = document.getElementById('file-list');
    if (listEl) {
      listEl.innerHTML = filtered.map(f => this.renderFileItem(f)).join('');
    }

    const gridContainer = document.querySelector('.files-grid');
    if (gridContainer) {
      gridContainer.innerHTML = filtered.map(f => `
        <div class="card files-grid-card" id="gfi-${f.id}" onclick="Files.selectFile('${f.id}')" ondblclick="Files.openFile('${f.id}')">
          ${f.encrypted ? `<div class="files-grid-enc">🔐</div>` : ''}
          <div class="files-grid-icon">${f.icon}</div>
          <div class="files-grid-name">${f.name}</div>
          <div class="files-grid-size">${f.size || (f.itemCount + ' items')}</div>
        </div>
      `).join('');
    }
  },

  filterFiles(filter, btn) {
    document.querySelectorAll('.notif-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const allFiles = TS.getRootFiles();
    let filtered = allFiles;

    if (filter === 'Folders') filtered = allFiles.filter(f => f.type === 'folder');
    else if (filter === 'Documents') filtered = allFiles.filter(f => ['pdf','doc','docx','xlsx','xls'].some(ext => f.name.toLowerCase().endsWith(ext)));
    else if (filter === 'Images') filtered = allFiles.filter(f => ['png','jpg','jpeg','gif'].some(ext => f.name.toLowerCase().endsWith(ext)));
    else if (filter === 'Videos') filtered = allFiles.filter(f => ['mp4','mov','avi'].some(ext => f.name.toLowerCase().endsWith(ext)));
    else if (filter === 'Shared') filtered = allFiles.filter(f => f.shared);

    const listEl = document.getElementById('file-list');
    if (listEl) listEl.innerHTML = filtered.map(f => this.renderFileItem(f)).join('');
  },

  navigate(folderId) {
    Notifications.info('Navigation', `Loading folder contents...`);
  },

  downloadFile(id) {
    const file = TS.getFileById(id);
    if (!file) return;
    Notifications.success('Download Started', `Decrypting and downloading "${file.name}"...`);
    // Add to activity
    TS.activityFeed.unshift({
      icon: '⬇️', bg: 'rgba(6,182,212,0.12)', color: '#22d3ee',
      text: `<strong>You</strong> downloaded "${file.name}"`, time: 'Just now',
    });
  },

  deleteFile(id) {
    const file = TS.getFileById(id);
    if (!file) return;
    const idx = TS.files.indexOf(file);
    if (idx > -1) TS.files.splice(idx, 1);
    Notifications.warning('File Deleted', `"${file.name}" moved to trash.`);
    this.render();
  },

  // ===== Upload Dialog =====
  showUploadDialog() {
    const modal = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    if (!modal || !modalContent) return;

    modalContent.innerHTML = `
      <div class="modal-header">
        <div class="modal-title">Upload Files</div>
        <button class="modal-close" onclick="Files.closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="upload-drop-zone" style="margin-bottom:20px;padding:32px;" onclick="document.getElementById('file-input-hidden').click()">
          <div class="upload-icon">📂</div>
          <div class="upload-title">Select files to upload</div>
          <div class="upload-desc">AES-256 encryption applied automatically</div>
          <input type="file" id="file-input-hidden" multiple style="display:none;" onchange="Files.handleFileSelect(this.files)">
        </div>

        <!-- Options -->
        <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:20px;">
          <label class="toggle-switch" style="font-size:0.875rem;color:var(--text-secondary);">
            <input type="checkbox" class="toggle-input" id="opt-encrypt" checked>
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
            <div>
              <div style="color:var(--text-primary);font-weight:600;">AES-256 Encryption</div>
              <div style="font-size:0.75rem;color:var(--text-muted);">Recommended for sensitive files</div>
            </div>
          </label>
          <label class="toggle-switch" style="font-size:0.875rem;color:var(--text-secondary);">
            <input type="checkbox" class="toggle-input" id="opt-integrity" checked>
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
            <div>
              <div style="color:var(--text-primary);font-weight:600;">Integrity Verification</div>
              <div style="font-size:0.75rem;color:var(--text-muted);">SHA-256 hash generated on upload</div>
            </div>
          </label>
          <label class="toggle-switch" style="font-size:0.875rem;color:var(--text-secondary);">
            <input type="checkbox" class="toggle-input" id="opt-version">
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
            <div>
              <div style="color:var(--text-primary);font-weight:600;">Version History</div>
              <div style="font-size:0.75rem;color:var(--text-muted);">Keep previous versions (uses more storage)</div>
            </div>
          </label>
        </div>

        <div id="upload-queue-area" style="display:none;">
          <div style="font-weight:700;margin-bottom:12px;">Upload Queue</div>
          <div class="upload-queue" id="upload-queue-list"></div>
        </div>

        <div class="flex gap-2 mt-4">
          <button class="btn btn-primary flex-1" onclick="Files.startUpload()">⬆️ Start Upload</button>
          <button class="btn btn-secondary" onclick="Files.closeModal()">Cancel</button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    // Auto-add demo files
    setTimeout(() => this.addDemoUploads(), 300);
  },

  addDemoUploads() {
    const demoFiles = [
      { name: 'Project Brief.pdf', size: '2.4 MB', icon: '📄' },
      { name: 'Wireframes.fig', size: '8.1 MB', icon: '🎨' },
      { name: 'Database Backup.sql', size: '45.2 MB', icon: '🗄️' },
    ];

    const area = document.getElementById('upload-queue-area');
    const list = document.getElementById('upload-queue-list');
    if (!area || !list) return;

    area.style.display = 'block';
    list.innerHTML = demoFiles.map((f, i) => `
      <div class="upload-item" id="upload-item-${i}">
        <span class="upload-file-icon">${f.icon}</span>
        <div class="upload-file-info">
          <div class="upload-file-name">${f.name}</div>
          <div class="progress-bar mt-1" id="uprog-${i}">
            <div class="progress-fill" id="uprog-fill-${i}" style="width:0%"></div>
          </div>
          <div class="upload-status-text" id="uprog-text-${i}">Ready to upload</div>
        </div>
        <span class="upload-percent" id="uprog-pct-${i}">0%</span>
      </div>
    `).join('');
  },

  startUpload() {
    const items = document.querySelectorAll('[id^="upload-item-"]');
    if (items.length === 0) {
      Notifications.warning('No Files', 'Please select files to upload first.');
      return;
    }

    let completed = 0;
    items.forEach((item, i) => {
      this.simulateUpload(i, () => {
        completed++;
        if (completed === items.length) {
          setTimeout(() => {
            this.closeModal();
            Notifications.success('Upload Complete', `${items.length} file(s) encrypted and uploaded successfully.`);
            // Add to file list
            const newFile = {
              id: `f${Date.now()}`,
              type: 'file',
              name: 'Project Brief.pdf',
              parent: 'root',
              icon: '📄',
              color: '#f43f5e',
              created: new Date().toISOString().split('T')[0],
              modified: new Date().toISOString().split('T')[0],
              owner: TS.getCurrentUser().id,
              shared: false,
              encrypted: true,
              size: '2.4 MB',
              version: 1,
              hash: 'a1b2...c3d4',
            };
            TS.files.push(newFile);
            if (TS.state.currentPage === 'files') this.render();
          }, 500);
        }
      });
    });
  },

  simulateUpload(index, onComplete) {
    let progress = 0;
    const textEl = document.getElementById(`uprog-text-${index}`);
    const fillEl = document.getElementById(`uprog-fill-${index}`);
    const pctEl = document.getElementById(`uprog-pct-${index}`);

    if (textEl) textEl.textContent = 'Encrypting with AES-256...';

    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        if (fillEl) fillEl.style.width = '100%';
        if (pctEl) pctEl.textContent = '100%';
        if (textEl) { textEl.textContent = 'Upload complete ✅'; textEl.style.color = 'var(--emerald-400)'; }
        if (onComplete) onComplete();
      } else {
        if (fillEl) fillEl.style.width = `${progress}%`;
        if (pctEl) pctEl.textContent = `${Math.floor(progress)}%`;
        if (progress > 30 && textEl) textEl.textContent = 'Uploading to secure storage...';
        if (progress > 80 && textEl) textEl.textContent = 'Generating integrity hash...';
      }
    }, 200 + index * 100);
  },

  handleFileSelect(files) {
    if (!files || files.length === 0) return;
    const area = document.getElementById('upload-queue-area');
    const list = document.getElementById('upload-queue-list');
    if (!area || !list) return;

    area.style.display = 'block';
    list.innerHTML = Array.from(files).map((f, i) => `
      <div class="upload-item" id="upload-item-${i}">
        <span class="upload-file-icon">📄</span>
        <div class="upload-file-info">
          <div class="upload-file-name">${f.name}</div>
          <div class="progress-bar mt-1" id="uprog-${i}">
            <div class="progress-fill" id="uprog-fill-${i}" style="width:0%"></div>
          </div>
          <div class="upload-status-text" id="uprog-text-${i}">Ready — ${(f.size / 1024 / 1024).toFixed(1)} MB</div>
        </div>
        <span class="upload-percent" id="uprog-pct-${i}">0%</span>
      </div>
    `).join('');
  },

  showNewFolderDialog() {
    const name = prompt('Enter folder name:');
    if (!name) return;
    const newFolder = {
      id: `f${Date.now()}`,
      type: 'folder',
      name: name,
      parent: 'root',
      icon: '📁',
      color: '#3b82f6',
      created: new Date().toISOString().split('T')[0],
      modified: new Date().toISOString().split('T')[0],
      owner: TS.getCurrentUser().id,
      shared: false,
      encrypted: true,
      size: null,
      itemCount: 0,
    };
    TS.files.push(newFolder);
    Notifications.success('Folder Created', `"${name}" folder created successfully.`);
    this.render();
  },

  // ===== Context Menu =====
  showContextMenu(event, fileId) {
    event.preventDefault();
    event.stopPropagation();
    const file = TS.getFileById(fileId);
    if (!file) return;

    let menu = document.getElementById('context-menu');
    if (!menu) {
      menu = document.createElement('div');
      menu.id = 'context-menu';
      menu.className = 'context-menu';
      document.body.appendChild(menu);
    }

    menu.innerHTML = `
      <div class="context-menu-item" onclick="Files.openFile('${fileId}');document.getElementById('context-menu').classList.add('hidden');">
        📂 <span>Open</span>
      </div>
      <div class="context-menu-item" onclick="Sharing.showShareDialog('${fileId}');document.getElementById('context-menu').classList.add('hidden');">
        🔗 <span>Share</span>
      </div>
      <div class="context-menu-item" onclick="Files.downloadFile('${fileId}');document.getElementById('context-menu').classList.add('hidden');">
        ⬇️ <span>Download</span>
      </div>
      <div class="context-menu-item" onclick="Notifications.info('Rename','Enter new name in the prompt...');document.getElementById('context-menu').classList.add('hidden');">
        ✏️ <span>Rename</span>
      </div>
      <div class="context-menu-item" onclick="Notifications.info('Moving...','Select destination folder');document.getElementById('context-menu').classList.add('hidden');">
        📋 <span>Move to</span>
      </div>
      <div class="context-menu-divider"></div>
      <div class="context-menu-item" onclick="Notifications.info('Copy Link','Link copied to clipboard!');document.getElementById('context-menu').classList.add('hidden');">
        🔗 <span>Copy Link</span>
      </div>
      <div class="context-menu-item danger" onclick="Files.deleteFile('${fileId}');document.getElementById('context-menu').classList.add('hidden');">
        🗑️ <span>Delete</span>
      </div>
    `;

    menu.style.left = `${Math.min(event.clientX, window.innerWidth - 200)}px`;
    menu.style.top = `${Math.min(event.clientY, window.innerHeight - 280)}px`;
    menu.classList.remove('hidden');
  },

  handleContextMenu(event) {
    const menu = document.getElementById('context-menu');
    if (menu && !menu.contains(event.target)) {
      menu.classList.add('hidden');
    }
  },

  onDragOver(event) {
    event.preventDefault();
    document.getElementById('drop-zone')?.classList.add('dragover');
  },
  onDragLeave() {
    document.getElementById('drop-zone')?.classList.remove('dragover');
  },
  onDrop(event) {
    event.preventDefault();
    document.getElementById('drop-zone')?.classList.remove('dragover');
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      this.showUploadDialog();
      setTimeout(() => this.handleFileSelect(files), 300);
    }
  },
};

window.Files = Files;
