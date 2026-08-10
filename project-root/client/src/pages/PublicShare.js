import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Shield, Lock, Unlock, Download, Eye, Edit3, Calendar, FileText,
  AlertCircle, CheckCircle2, RefreshCw, Copy, Check, ArrowLeft,
} from 'lucide-react';
import { sharesAPI } from '../utils/api';
import './PublicShare.css';

function formatBytes(bytes = 0) {
  const n = Number(bytes) || 0;
  if (n === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1);
  const v = n / 1024 ** i;
  return `${v >= 10 || i === 0 ? Math.round(v) : v.toFixed(1)} ${units[i]}`;
}

function formatDate(d) {
  if (!d) return 'Never (No Expiration)';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getFileExt(name = '') {
  return name.split('.').pop()?.toLowerCase() || '';
}

export default function PublicShare() {
  const { token } = useParams();
  const [shareInfo, setShareInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Password gate
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState('');

  // Preview & Download states
  const [previewContent, setPreviewContent] = useState(null);
  const [previewType, setPreviewType] = useState(null); // 'text' | 'image' | 'pdf' | 'none'
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [copied, setCopied] = useState(false);

  // 1. Fetch metadata on load
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError('');
    sharesAPI.getInfo(token)
      .then((res) => {
        const data = res.data;
        setShareInfo(data);
        setHasPassword(data.has_password);
        if (!data.has_password) {
          setIsUnlocked(true);
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.detail || 'This share link does not exist, has expired, or was revoked.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  // 2. Fetch preview content once unlocked if permission allows
  const loadPreview = useCallback(async (pw = null) => {
    if (!token || !shareInfo) return;
    const ext = getFileExt(shareInfo.file_name);
    const isImg = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext);
    const isText = ['txt', 'md', 'json', 'js', 'py', 'html', 'css', 'csv', 'sql', 'xml', 'log'].includes(ext);
    const isPdf = ext === 'pdf';

    if (!isImg && !isText && !isPdf && shareInfo.permission !== 'edit') {
      setPreviewType('none');
      return;
    }

    setLoadingPreview(true);
    try {
      // Record access / trigger realtime notification on backend
      await sharesAPI.access(token, pw || password).catch(() => {});

      const res = await sharesAPI.downloadPublic(token, pw || password);
      const blob = res.data;

      if (isImg) {
        const objUrl = URL.createObjectURL(blob);
        setPreviewContent(objUrl);
        setPreviewType('image');
      } else if (isPdf) {
        const objUrl = URL.createObjectURL(blob);
        setPreviewContent(objUrl);
        setPreviewType('pdf');
      } else {
        // Text / code preview
        const text = await blob.text();
        setPreviewContent(text);
        setEditContent(text);
        setPreviewType('text');
      }
    } catch (e) {
      console.warn('Failed to load inline preview:', e);
      setPreviewType('none');
    } finally {
      setLoadingPreview(false);
    }
  }, [token, shareInfo, password]);

  useEffect(() => {
    if (isUnlocked && shareInfo && !previewContent && previewType === null) {
      loadPreview(password);
    }
  }, [isUnlocked, shareInfo, previewContent, previewType, loadPreview, password]);

  // 3. Unlock with password
  const handleUnlock = async (e) => {
    e?.preventDefault();
    if (!password) {
      setUnlockError('Please enter the password');
      return;
    }
    setUnlocking(true);
    setUnlockError('');
    try {
      await sharesAPI.verifyPassword(token, password);
      setIsUnlocked(true);
      loadPreview(password);
    } catch (err) {
      setUnlockError(err.response?.data?.detail || 'Incorrect password. Access denied.');
    } finally {
      setUnlocking(false);
    }
  };

  // 4. Download file
  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Record access on backend
      await sharesAPI.access(token, password).catch(() => {});

      const res = await sharesAPI.downloadPublic(token, password);
      const blob = res.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = shareInfo?.file_name || 'download';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Download failed. Please check access permissions.');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(editContent || previewContent || '').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="ps-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <RefreshCw size={36} className="spin" color="#3b82f6" />
        <p style={{ marginTop: 16, color: '#94a3b8', fontSize: '0.95rem' }}>Decrypting share link security credentials…</p>
      </div>
    );
  }

  if (error || !shareInfo) {
    return (
      <div className="ps-container">
        <header className="ps-header">
          <Link to="/" className="ps-brand">
            <div className="ps-logo-icon"><Shield size={20} color="#fff" /></div>
            <span className="ps-brand-title">SecureShare</span>
          </Link>
        </header>
        <main className="ps-main">
          <div className="ps-card" style={{ textAlign: 'center', padding: '48px 32px' }}>
            <AlertCircle size={54} color="#ef4444" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: 8 }}>Access Denied or Link Expired</h2>
            <p style={{ color: '#94a3b8', maxWidth: 420, margin: '0 auto 24px', lineHeight: 1.5 }}>
              {error || 'This secure link is either invalid, revoked by the sender, or has exceeded its maximum access limit.'}
            </p>
            <Link to="/login" className="ps-btn-secondary" style={{ display: 'inline-flex', margin: '0 auto', textDecoration: 'none' }}>
              <ArrowLeft size={16} /> Return to SecureShare
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const perm = shareInfo.permission || 'view';
  const canDownload = perm === 'download' || perm === 'edit';
  const isEdit = perm === 'edit';

  return (
    <div className="ps-container">
      {/* Top Bar */}
      <header className="ps-header">
        <Link to="/" className="ps-brand">
          <div className="ps-logo-icon"><Shield size={20} color="#fff" /></div>
          <span className="ps-brand-title">SecureShare</span>
        </Link>
        <div className="ps-badge-secure">
          <CheckCircle2 size={14} />
          <span>AES-256 E2EE Protected</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="ps-main">
        <div className="ps-card">
          {/* Card Header */}
          <div className="ps-card-header">
            <div className="ps-file-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <FileText size={28} color="#38bdf8" />
            </div>
            <div className="ps-file-meta">
              <h1 className="ps-file-title">{shareInfo.file_name}</h1>
              <div className="ps-file-sub">
                <span>{formatBytes(shareInfo.size_bytes)}</span>
                <span>•</span>
                <span style={{ textTransform: 'capitalize' }}>{perm} Access</span>
                {shareInfo.is_encrypted && (
                  <>
                    <span>•</span>
                    <span style={{ color: '#34d399' }}>Encrypted</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="ps-card-body">
            {/* Password Gate if locked */}
            {hasPassword && !isUnlocked ? (
              <div className="ps-lock-screen">
                <div className="ps-lock-icon">
                  <Lock size={32} color="#f59e0b" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: 8 }}>Password Required</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: 16 }}>
                  The sender protected this file with a password. Enter it below to access the contents.
                </p>
                <form onSubmit={handleUnlock} style={{ maxWidth: 360, margin: '0 auto' }}>
                  <input
                    type="password"
                    className="ps-input-pw"
                    placeholder="Enter security password…"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                  />
                  {unlockError && (
                    <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <AlertCircle size={14} /> {unlockError}
                    </div>
                  )}
                  <button type="submit" className="ps-btn-primary" disabled={unlocking} style={{ width: '100%' }}>
                    {unlocking ? <><RefreshCw size={16} className="spin" /> Unlocking…</> : <><Unlock size={16} /> Unlock File</>}
                  </button>
                </form>
              </div>
            ) : (
              /* Unlocked Content View */
              <>
                {/* Meta details grid */}
                <div className="ps-grid-meta">
                  <div className="ps-meta-item">
                    <div className="ps-meta-icon-circle">
                      {perm === 'view' ? <Eye size={16} /> : perm === 'download' ? <Download size={16} /> : <Edit3 size={16} />}
                    </div>
                    <div>
                      <div className="ps-meta-label">Permission</div>
                      <div className="ps-meta-val">{perm.toUpperCase()} ONLY</div>
                    </div>
                  </div>

                  <div className="ps-meta-item">
                    <div className="ps-meta-icon-circle"><Calendar size={16} /></div>
                    <div>
                      <div className="ps-meta-label">Expires</div>
                      <div className="ps-meta-val">{formatDate(shareInfo.expires_at)}</div>
                    </div>
                  </div>
                </div>

                {/* Inline Preview / Editor */}
                {loadingPreview ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8' }}>
                    <RefreshCw size={24} className="spin" color="#38bdf8" />
                    <p style={{ marginTop: 12, fontSize: '0.875rem' }}>Loading secure file preview in-memory…</p>
                  </div>
                ) : isEdit ? (
                  /* Editor for Edit Permission */
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 600 }}>LIVE IN-BROWSER EDITOR</span>
                      <button type="button" className="ps-btn-secondary" onClick={handleCopyText} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                        {copied ? <><Check size={13} color="#10b981" /> Copied</> : <><Copy size={13} /> Copy Text</>}
                      </button>
                    </div>
                    <textarea
                      className="ps-editor-textarea"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="File contents…"
                    />
                  </div>
                ) : previewType === 'image' ? (
                  <div className="ps-preview-box">
                    <img src={previewContent} alt={shareInfo.file_name} className="ps-preview-img" />
                  </div>
                ) : previewType === 'pdf' ? (
                  <div className="ps-preview-box" style={{ height: 380 }}>
                    <iframe src={previewContent} title={shareInfo.file_name} width="100%" height="100%" style={{ border: 'none', borderRadius: 8 }} />
                  </div>
                ) : previewType === 'text' ? (
                  <div className="ps-preview-box">
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                      <button type="button" className="ps-btn-secondary" onClick={handleCopyText} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                        {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                      </button>
                    </div>
                    <pre className="ps-preview-text">{previewContent}</pre>
                  </div>
                ) : null}

                {/* Action Buttons */}
                <div className="ps-action-row">
                  {canDownload && (
                    <button
                      type="button"
                      className="ps-btn-primary"
                      onClick={handleDownload}
                      disabled={downloading}
                    >
                      {downloading ? (
                        <><RefreshCw size={16} className="spin" /> Preparing Download…</>
                      ) : (
                        <><Download size={16} /> Download File ({formatBytes(shareInfo.size_bytes)})</>
                      )}
                    </button>
                  )}

                  {perm === 'view' && !canDownload && (
                    <div style={{
                      width: '100%',
                      background: 'rgba(59, 130, 246, 0.08)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: 12,
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      color: '#93c5fd',
                      fontSize: '0.85rem',
                    }}>
                      <Eye size={18} />
                      <span>This file is configured for <strong>View Only</strong> access. Direct downloads and copying are disabled by the owner.</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
