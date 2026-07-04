// ===== TrustShare Analytics Module =====

const Analytics = {
  charts: {},

  render() {
    const content = document.getElementById('page-content-area');
    if (!content) return;

    const user = TS.getCurrentUser();
    const data = TS.analyticsData;

    content.innerHTML = `
      <!-- Header -->
      <div class="dashboard-welcome" style="margin-bottom:20px;">
        <div>
          <div class="welcome-greeting" style="font-size:1.375rem;">Analytics Dashboard</div>
          <div class="welcome-date">Storage, usage & security insights for your account</div>
        </div>
        <div class="flex gap-2">
          <select class="form-input" style="width:auto;padding:8px 14px;font-size:0.875rem;" onchange="Analytics.changeRange(this.value)">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
          </select>
          <button class="btn btn-secondary btn-sm" onclick="Notifications.success('Report Ready','Analytics report exported as PDF.')">📥 Export</button>
        </div>
      </div>

      <!-- KPI Metrics -->
      <div class="analytics-metrics-grid mb-6">
        ${[
          { icon:'📤', label:'Files Uploaded', value:'342', trend:'+12%', up:true, color:'var(--blue-400)' },
          { icon:'🔗', label:'Active Links', value:'4', trend:'+2', up:true, color:'var(--purple-400)' },
          { icon:'👁️', label:'Total Views', value:'802', trend:'+34%', up:true, color:'var(--emerald-400)' },
          { icon:'⬇️', label:'Downloads', value:'212', trend:'-8%', up:false, color:'var(--cyan-400)' },
          { icon:'🔐', label:'Encrypted Files', value:'89%', trend:'↑ 5%', up:true, color:'var(--amber-400)' },
          { icon:'🛡️', label:'Security Score', value:'94/100', trend:'Excellent', up:true, color:'var(--rose-400)' },
        ].map(m => `
          <div class="card metric-card">
            <div class="metric-icon">${m.icon}</div>
            <div class="metric-value" style="color:${m.color};">${m.value}</div>
            <div class="metric-label">${m.label}</div>
            <div style="font-size:0.75rem;margin-top:4px;font-weight:600;color:${m.up ? 'var(--emerald-400)' : 'var(--rose-400)'};">${m.trend}</div>
          </div>
        `).join('')}
      </div>

      <!-- Charts Row 1 -->
      <div class="analytics-grid mb-6">
        <div class="card chart-card">
          <div class="chart-title">File Uploads</div>
          <div class="chart-subtitle">Daily upload activity this week</div>
          <div class="chart-container">
            <canvas id="chart-uploads"></canvas>
          </div>
        </div>
        <div class="card chart-card">
          <div class="chart-title">Storage Growth</div>
          <div class="chart-subtitle">Monthly storage usage trend (GB)</div>
          <div class="chart-container">
            <canvas id="chart-storage"></canvas>
          </div>
        </div>
      </div>

      <!-- Charts Row 2 -->
      <div class="analytics-grid mb-6">
        <div class="card chart-card">
          <div class="chart-title">Access by Type</div>
          <div class="chart-subtitle">How users interact with your files</div>
          <div class="chart-container" style="display:flex;align-items:center;gap:20px;">
            <canvas id="chart-access" style="max-width:200px;max-height:200px;"></canvas>
            <div style="flex:1;">
              ${[
                { label:'Views', value:485, color:'#3b82f6' },
                { label:'Downloads', value:212, color:'#8b5cf6' },
                { label:'Edits', value:67, color:'#10b981' },
                { label:'Shares', value:38, color:'#f59e0b' },
              ].map(item => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;font-size:0.875rem;">
                  <div style="display:flex;align-items:center;gap:8px;">
                    <div style="width:10px;height:10px;border-radius:50%;background:${item.color};flex-shrink:0;"></div>
                    <span style="color:var(--text-secondary);">${item.label}</span>
                  </div>
                  <div style="font-weight:700;">${item.value}</div>
                </div>
                <div class="progress-bar" style="margin-bottom:6px;">
                  <div class="progress-fill" style="width:${Math.round(item.value/802*100)}%;background:${item.color};"></div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        <div class="card chart-card">
          <div class="chart-title">User Activity</div>
          <div class="chart-subtitle">Weekly active users on your files</div>
          <div class="chart-container">
            <canvas id="chart-activity"></canvas>
          </div>
        </div>
      </div>

      <!-- Bottom Row -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
        <!-- Top Files -->
        <div class="card" style="padding:24px;">
          <div style="font-weight:700;font-size:1rem;margin-bottom:16px;">🏆 Top Accessed Files</div>
          ${[
            { name:'Q2 Financial Report.pdf', icon:'📄', views:91, trend:'↑' },
            { name:'Project Alpha (folder)', icon:'📁', views:47, trend:'↑' },
            { name:'Marketing Video.mp4', icon:'🎬', views:38, trend:'↓' },
            { name:'Product Roadmap.xlsx', icon:'📊', views:23, trend:'↑' },
            { name:'Architecture Diagram.png', icon:'🖼️', views:19, trend:'—' },
          ].map((f, i) => `
            <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-subtle);">
              <span style="font-size:1.1rem;color:var(--text-muted);font-weight:800;width:20px;">${i+1}</span>
              <span style="font-size:1.25rem;">${f.icon}</span>
              <div style="flex:1;min-width:0;">
                <div style="font-size:0.875rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${f.name}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);">${f.views} views</div>
              </div>
              <span style="font-size:0.875rem;font-weight:700;color:${f.trend==='↑'?'var(--emerald-400)':f.trend==='↓'?'var(--rose-400)':'var(--text-muted)'};">${f.trend}</span>
            </div>
          `).join('')}
        </div>

        <!-- Security Report -->
        <div class="card" style="padding:24px;">
          <div style="font-weight:700;font-size:1rem;margin-bottom:16px;">🛡️ Security Report</div>
          <div style="margin-bottom:20px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="font-size:0.875rem;font-weight:600;">Overall Security Score</span>
              <span style="font-weight:800;font-size:1.125rem;color:var(--emerald-400);">94/100</span>
            </div>
            <div class="progress-bar" style="height:10px;margin-bottom:8px;">
              <div class="progress-fill" style="width:94%;background:var(--gradient-success);"></div>
            </div>
            <div style="font-size:0.75rem;color:var(--text-muted);">Excellent — Your account security is well-configured</div>
          </div>
          ${[
            { label:'Files Encrypted', value:'89%', status:'good' },
            { label:'MFA Enabled', value:'Yes', status:'good' },
            { label:'Unprotected Links', value:'2', status:'warn' },
            { label:'Failed Logins (7d)', value:'3', status:'warn' },
            { label:'Key Rotation', value:'Current', status:'good' },
            { label:'Anomalies Detected', value:'0', status:'good' },
          ].map(s => `
            <div class="security-stat">
              <span class="security-stat-label">${s.label}</span>
              <span class="security-stat-value" style="color:${s.status==='good'?'var(--emerald-400)':'var(--amber-400)'};">${s.value}</span>
            </div>
          `).join('')}
          <button class="btn btn-secondary w-full mt-3" onclick="Notifications.info('Full Report','Generating detailed security report...')">View Full Report</button>
        </div>
      </div>
    `;

    // Initialize charts after DOM is ready
    requestAnimationFrame(() => this.initCharts());
  },

  initCharts() {
    if (typeof Chart === 'undefined') return;

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 11 } } },
      },
    };

    // Destroy existing charts
    Object.values(this.charts).forEach(c => { try { c.destroy(); } catch(e) {} });
    this.charts = {};

    // Uploads Bar Chart
    const uploadsCtx = document.getElementById('chart-uploads');
    if (uploadsCtx) {
      this.charts.uploads = new Chart(uploadsCtx, {
        type: 'bar',
        data: {
          labels: TS.analyticsData.uploadsByDay.labels,
          datasets: [{
            data: TS.analyticsData.uploadsByDay.data,
            backgroundColor: 'rgba(59,130,246,0.5)',
            borderColor: '#3b82f6',
            borderWidth: 2,
            borderRadius: 6,
            borderSkipped: false,
          }],
        },
        options: { ...commonOptions },
      });
    }

    // Storage Growth Line Chart
    const storageCtx = document.getElementById('chart-storage');
    if (storageCtx) {
      this.charts.storage = new Chart(storageCtx, {
        type: 'line',
        data: {
          labels: TS.analyticsData.storageGrowth.labels,
          datasets: [{
            data: TS.analyticsData.storageGrowth.data,
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139,92,246,0.1)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#8b5cf6',
            pointRadius: 4,
            pointHoverRadius: 6,
          }],
        },
        options: { ...commonOptions },
      });
    }

    // Access Doughnut Chart
    const accessCtx = document.getElementById('chart-access');
    if (accessCtx) {
      this.charts.access = new Chart(accessCtx, {
        type: 'doughnut',
        data: {
          labels: TS.analyticsData.accessByType.labels,
          datasets: [{
            data: TS.analyticsData.accessByType.data,
            backgroundColor: ['rgba(59,130,246,0.8)', 'rgba(139,92,246,0.8)', 'rgba(16,185,129,0.8)', 'rgba(245,158,11,0.8)'],
            borderColor: 'transparent',
            borderWidth: 0,
            hoverOffset: 8,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: { legend: { display: false } },
        },
      });
    }

    // User Activity Line Chart
    const activityCtx = document.getElementById('chart-activity');
    if (activityCtx) {
      this.charts.activity = new Chart(activityCtx, {
        type: 'line',
        data: {
          labels: TS.analyticsData.userActivity.labels,
          datasets: [{
            data: TS.analyticsData.userActivity.data,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16,185,129,0.1)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#10b981',
            pointRadius: 4,
          }],
        },
        options: { ...commonOptions },
      });
    }
  },

  changeRange(range) {
    Notifications.info('Range Changed', `Analytics updated for "${range}".`);
    // Simulate data change
    const factor = { 'Last 7 days': 1, 'Last 30 days': 4.2, 'Last 90 days': 12, 'This year': 52 }[range] || 1;
    if (this.charts.uploads) {
      this.charts.uploads.data.datasets[0].data = TS.analyticsData.uploadsByDay.data.map(v => Math.round(v * factor * (0.8 + Math.random() * 0.4)));
      this.charts.uploads.update('active');
    }
  },
};

window.Analytics = Analytics;
