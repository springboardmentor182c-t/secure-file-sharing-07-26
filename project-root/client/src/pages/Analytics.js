import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const CHART_OPTS = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 11 } } },
    y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 11 } } },
  },
};

export default function Analytics() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.summary()
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}><div className="spinner" /></div>;

  const storagePct = data?.storage ? Math.round(data.storage.used_bytes / data.storage.quota_bytes * 100) : 0;

  const uploadChart = {
    labels: data?.upload_trend?.map(d => d.date) || [],
    datasets: [{
      data: data?.upload_trend?.map(d => d.count) || [],
      backgroundColor: 'rgba(59,130,246,0.5)',
      borderColor: '#3b82f6', borderWidth: 2,
      borderRadius: 6, borderSkipped: false,
    }],
  };

  const typeEntries = Object.entries(data?.top_file_types || {}).slice(0, 6);
  const typeChart = {
    labels: typeEntries.map(([k]) => k.toUpperCase()),
    datasets: [{
      data: typeEntries.map(([, v]) => v),
      backgroundColor: ['rgba(59,130,246,.8)', 'rgba(139,92,246,.8)', 'rgba(16,185,129,.8)', 'rgba(245,158,11,.8)', 'rgba(236,72,153,.8)', 'rgba(6,182,212,.8)'],
      borderColor: 'transparent', hoverOffset: 8,
    }],
  };

  const kpis = [
    { icon: '📁', label: 'Total Files', value: data?.total_files ?? 0, color: 'var(--blue-400)', bg: 'rgba(59,130,246,.1)' },
    { icon: '🔗', label: 'Active Links', value: data?.active_share_links ?? 0, color: 'var(--purple-400)', bg: 'rgba(139,92,246,.1)' },
    { icon: '👁️', label: 'Share Views', value: data?.total_share_views ?? 0, color: 'var(--emerald-400)', bg: 'rgba(16,185,129,.1)' },
    { icon: '💾', label: 'Storage Used', value: `${data?.storage?.used_gb ?? 0} GB`, color: 'var(--amber-400)', bg: 'rgba(245,158,11,.1)' },
    { icon: '📊', label: 'Storage %', value: `${storagePct}%`, color: 'var(--cyan-400)', bg: 'rgba(6,182,212,.1)' },
    { icon: '🛡️', label: 'Plan', value: user?.plan || 'free', color: 'var(--rose-400)', bg: 'rgba(244,63,94,.1)' },
  ];

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Analytics Dashboard</h1>
          <p className="text-muted text-sm mt-1">Storage, usage & access insights from live data</p>
        </div>
        <select className="form-input" style={{ width: 'auto', padding: '8px 14px', fontSize: '.875rem' }}>
          <option>Last 7 days</option>
          <option>Last 30 days</option>
        </select>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12, marginBottom: 24 }}>
        {kpis.map(k => (
          <div key={k.label} className="card" style={{ padding: '16px 14px', textAlign: 'center' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: k.bg, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontSize: '1rem' }}>{k.icon}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: '.6875rem', color: 'var(--text-muted)', marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-2 mb-6">
        <div className="card card-pad">
          <div style={{ fontWeight: 700, marginBottom: 4 }}>📤 Daily Uploads</div>
          <div className="text-xs text-muted mb-4">File upload activity by day</div>
          <div style={{ height: 180 }}>
            {data?.upload_trend?.length ? (
              <Bar data={uploadChart} options={{ ...CHART_OPTS }} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>No uploads yet</div>
            )}
          </div>
        </div>

        <div className="card card-pad">
          <div style={{ fontWeight: 700, marginBottom: 4 }}>📂 File Types</div>
          <div className="text-xs text-muted mb-4">Breakdown by file extension</div>
          <div style={{ height: 180, display: 'flex', alignItems: 'center', gap: 20 }}>
            {typeEntries.length ? (
              <>
                <div style={{ width: 150, height: 150, flexShrink: 0 }}>
                  <Doughnut data={typeChart} options={{ responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { display: false } } }} />
                </div>
                <div style={{ flex: 1 }}>
                  {typeEntries.map(([k, v], i) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '.8125rem' }}>
                      <div className="flex items-center gap-2">
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: typeChart.datasets[0].backgroundColor[i] }} />
                        <span className="text-secondary">.{k}</span>
                      </div>
                      <span style={{ fontWeight: 700 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', color: 'var(--text-muted)' }}>No files yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Storage + Security */}
      <div className="grid-2">
        <div className="card card-pad">
          <div style={{ fontWeight: 700, marginBottom: 16 }}>💾 Storage Breakdown</div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold">Storage Usage</span>
            <span style={{ fontWeight: 800, color: 'var(--emerald-400)' }}>{storagePct}%</span>
          </div>
          <div className="progress-bar" style={{ height: 10, marginBottom: 16 }}>
            <div className="progress-fill" style={{ width: `${storagePct}%` }} />
          </div>
          {[
            { label: 'Used', value: `${data?.storage?.used_gb ?? 0} GB`, color: 'var(--blue-400)' },
            { label: 'Available', value: `${(data?.storage?.quota_gb - data?.storage?.used_gb || 0).toFixed(1)} GB`, color: 'var(--emerald-400)' },
            { label: 'Total Quota', value: `${data?.storage?.quota_gb ?? 5} GB`, color: 'var(--text-muted)' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '.875rem' }}>
              <span className="text-secondary">{s.label}</span>
              <span style={{ fontWeight: 700, color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>

        <div className="card card-pad">
          <div style={{ fontWeight: 700, marginBottom: 16 }}>🛡️ Security Overview</div>
          {[
            { label: 'MFA Status', value: user?.mfa_enabled ? '✅ Enabled' : '⚠️ Disabled', ok: user?.mfa_enabled },
            { label: 'File Encryption', value: '✅ AES-256', ok: true },
            { label: 'Active Share Links', value: data?.active_share_links ?? 0, ok: true },
            { label: 'Total Share Views', value: data?.total_share_views ?? 0, ok: true },
            { label: 'Account Role', value: user?.role, ok: true },
            { label: 'Compliance', value: 'SOC 2 · GDPR', ok: true },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '.875rem' }}>
              <span className="text-secondary">{s.label}</span>
              <span style={{ fontWeight: 600, color: s.ok ? 'var(--emerald-400)' : 'var(--amber-400)' }}>{String(s.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
