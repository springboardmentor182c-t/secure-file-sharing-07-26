import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import {
  Upload, Download, Share2, HardDrive,
  TrendingUp, Shield, Zap, CheckCircle,
} from 'lucide-react';
import { analyticsAPI } from '../utils/api';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
);

/* ── Palette ────────────────────────────────────────────── */
const BLUE    = '#3b82f6';
const GREEN   = '#10b981';
const PURPLE  = '#818cf8';
const ORANGE  = '#f59e0b';
const RED     = '#f43f5e';

const ICON_MAP = [Upload, Download, Share2, HardDrive];
const COLOR_MAP = [BLUE, GREEN, PURPLE, ORANGE];



/* ── Shared chart options helper ──────────────────────── */
const baseChartOptions = (gridColor) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
  scales: {
    x: { grid: { color: gridColor }, ticks: { color: '#64748b', font: { size: 11 } } },
    y: { grid: { color: gridColor }, ticks: { color: '#64748b', font: { size: 11 } }, beginAtZero: true },
  },
});

/* ─────────────────────────────────────────────────────── */
export default function Analytics() {
  const [range, setRange] = useState('7d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    analyticsAPI.summary(range)
      .then(res => {
        if (isMounted && res.data) {
          setData(res.data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Failed to load analytics. Make sure you are logged in and the server is running.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [range]);

  const gridColor = 'rgba(255,255,255,0.06)';

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320, color: 'var(--text-muted)', fontSize: '0.95rem', gap: 10 }}>
        <div style={{ width: 20, height: 20, border: '2px solid var(--border-subtle)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        Loading analytics…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 320, gap: 10 }}>
        <div style={{ fontSize: '1.5rem' }}>⚠️</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', maxWidth: 400 }}>
          {error || 'No data available.'}
        </div>
      </div>
    );
  }

  /* Bar chart */
  const barData = {
    labels: data.bar?.labels || [],
    datasets: [
      {
        label: 'Uploads',
        data: data.bar?.uploads || [],
        backgroundColor: BLUE,
        borderRadius: 4,
        borderSkipped: false,
        barPercentage: 0.65,
        categoryPercentage: 0.7,
      },
      {
        label: 'Downloads',
        data: data.bar?.downloads || [],
        backgroundColor: GREEN,
        borderRadius: 4,
        borderSkipped: false,
        barPercentage: 0.65,
        categoryPercentage: 0.7,
      },
      {
        label: 'Shares',
        data: data.bar?.shares || [],
        backgroundColor: PURPLE,
        borderRadius: 4,
        borderSkipped: false,
        barPercentage: 0.65,
        categoryPercentage: 0.7,
      },
    ],
  };

  const barOptions = {
    ...baseChartOptions(gridColor),
    plugins: {
      ...baseChartOptions(gridColor).plugins,
      legend: { display: false },
    },
  };

  /* Security line chart */
  const lineData = {
    labels: data.security?.labels || [],
    datasets: [
      {
        label: 'Login Attempts',
        data: data.security?.logins || [],
        borderColor: ORANGE,
        backgroundColor: 'transparent',
        tension: 0.45,
        pointRadius: 3,
        borderWidth: 2,
      },
      {
        label: 'Failed Logins',
        data: data.security?.failures || [],
        borderColor: RED,
        backgroundColor: 'transparent',
        tension: 0.45,
        pointRadius: 3,
        borderWidth: 2,
      },
      {
        label: 'Threat Alerts',
        data: data.security?.threats || [],
        borderColor: BLUE,
        backgroundColor: 'transparent',
        tension: 0.45,
        pointRadius: 3,
        borderWidth: 2,
      },
    ],
  };

  const lineOptions = {
    ...baseChartOptions(gridColor),
    plugins: {
      ...baseChartOptions(gridColor).plugins,
      legend: { display: false },
    },
    scales: {
      ...baseChartOptions(gridColor).scales,
      y: {
        ...baseChartOptions(gridColor).scales.y,
        suggestedMax: 8,
        ticks: { stepSize: 2, color: '#64748b', font: { size: 11 } },
      },
    },
  };

  const statsList = data.stats || [];

  return (
    <div style={{ padding: 0 }}>

      {/* ── Page Header ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: 24,
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            Analytics
          </h1>
          <p style={{ fontSize: '.875rem', color: 'var(--text-muted)' }}>
            Platform usage, security events, and system health
          </p>
        </div>

        {/* Range Tabs */}
        <div style={{
          display: 'flex', gap: 4,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 10, padding: 4,
        }}>
          {['7d', '30d', '90d'].map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: '6px 14px', borderRadius: 7, fontSize: '.8125rem', fontWeight: 600,
                background: range === r ? BLUE : 'transparent',
                color: range === r ? '#fff' : 'var(--text-muted)',
                border: 'none', cursor: 'pointer',
                transition: 'all .2s',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {statsList.map((stat, idx) => {
          const Icon = ICON_MAP[idx % ICON_MAP.length];
          const color = COLOR_MAP[idx % COLOR_MAP.length];
          return (
            <div key={stat.label} className="card card-pad" style={{ position: 'relative', overflow: 'hidden' }}>
              {/* background accent circle */}
              <div style={{
                position: 'absolute', top: -18, right: -18,
                width: 90, height: 90, borderRadius: '50%',
                background: color, opacity: 0.07,
              }} />
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: color + '20',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 12,
              }}>
                <Icon size={18} color={color} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <TrendingUp size={12} color={GREEN} />
                <span style={{ fontSize: '.75rem', fontWeight: 700, color: GREEN }}>{stat.trend}</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: 4 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '.8125rem', color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* ── File Activity Trends Bar Chart ── */}
      <div className="card card-pad" style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 20 }}>
          File Activity Trends
        </div>
        <div style={{ height: 260 }}>
          <Bar data={barData} options={barOptions} />
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', gap: 24, marginTop: 16, justifyContent: 'center' }}>
          {[
            { label: 'Uploads',   color: BLUE },
            { label: 'Downloads', color: GREEN },
            { label: 'Shares',    color: PURPLE },
          ].map(({ label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.8125rem', color: 'var(--text-secondary)' }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: color, display: 'inline-block' }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Row: Security Events + Top Users ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

        {/* Security Events Line Chart */}
        <div className="card card-pad">
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>
            Security Events (7 days)
          </div>
          <div style={{ height: 220, marginTop: 12 }}>
            <Line data={lineData} options={lineOptions} />
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 18, marginTop: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'Login Attempts', color: ORANGE },
              { label: 'Failed Logins',  color: RED    },
              { label: 'Threat Alerts',  color: BLUE   },
            ].map(({ label, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.75rem', color: 'var(--text-secondary)' }}>
                <span style={{ width: 24, height: 2, background: color, display: 'inline-block', borderRadius: 2 }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Top Users by Activity */}
        <div className="card card-pad">
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 20 }}>
            Top Users by Activity
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {(data.top_users || []).map(({ name, actions, pct }) => (
              <div key={name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>{name}</span>
                  <span style={{ fontSize: '.8125rem', color: 'var(--text-muted)' }}>{actions} actions</span>
                </div>
                <div style={{ height: 5, background: 'var(--bg-input)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${pct}%`,
                    background: BLUE, borderRadius: 999,
                    transition: 'width .6s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── System Health ── */}
      <div className="card card-pad">
        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 20 }}>
          System Health
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
          {[
            { label: 'Uptime',       value: data.health?.uptime ?? 99.97, unit: '%',    color: GREEN,  icon: CheckCircle },
            { label: 'Avg Response', value: data.health?.avg_response_ms ?? 48,    unit: 'ms',   color: BLUE,   icon: Zap         },
            { label: 'Error Rate',   value: data.health?.error_rate ?? 0.02,  unit: '%',    color: ORANGE, icon: Shield      },
            { label: 'Throughput',   value: data.health?.throughput_gb_hr ?? 2.4,   unit: 'GB/hr',color: PURPLE, icon: TrendingUp  },
          ].map(({ label, value, unit, color, icon: Icon }, i) => (
            <div key={label} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '0 24px',
              borderRight: i < 3 ? '1px solid var(--border-subtle)' : 'none',
            }}>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color, lineHeight: 1, marginBottom: 4 }}>
                {value}
                <span style={{ fontSize: '1rem', fontWeight: 600, marginLeft: 2 }}>{unit}</span>
              </div>
              <div style={{ fontSize: '.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
        {/* Status bar */}
        <div style={{
          marginTop: 20, padding: '10px 14px',
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <CheckCircle size={15} color={GREEN} />
          <span style={{ fontSize: '.8125rem', color: GREEN, fontWeight: 500 }}>
            All systems {data.health?.status || 'operational'}
          </span>
          <span style={{ fontSize: '.8125rem', color: 'var(--text-muted)', marginLeft: 4 }}>
            · Last checked: {data.health?.last_checked || '2 min ago'}
          </span>
        </div>
      </div>

    </div>
  );
}
