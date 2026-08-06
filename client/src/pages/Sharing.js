import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, Link2, Mail, Clock, Copy, Check, Eye, Download,
  Edit3, Lock, Calendar, AlertCircle, ChevronDown, X, Send,
  FileText, RefreshCw,
} from 'lucide-react';
import { filesAPI, sharesAPI } from '../utils/api';
import './Sharing.css';

/* ─── helpers ─── */
function formatBytes(bytes = 0) {
  const n = Number(bytes) || 0;
  if (n === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1);
  const v = n / 1024 ** i;
  return `${v >= 10 || i === 0 ? Math.round(v) : v.toFixed(1)} ${units[i]}`;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getFileExt(name = '') {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  return ext;
}

function FileIcon({ name, size = 18 }) {
  const ext = getFileExt(name);
  const colors = {
    xlsx: '#10b981', xls: '#10b981', csv: '#10b981',
    pdf: '#ef4444',
    docx: '#3b82f6', doc: '#3b82f6',
    pptx: '#f59e0b', ppt: '#f59e0b',
    zip: '#8b5cf6', rar: '#8b5cf6',
    png: '#06b6d4', jpg: '#06b6d4', jpeg: '#06b6d4', gif: '#06b6d4', svg: '#06b6d4',
  };
  const color = colors[ext] || '#64748b';
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 8,
      background: `${color}18`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <FileText size={size} color={color} />
    </div>
  );
}

/* ─── Toggle Switch ─── */
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: 40, height: 22, borderRadius: 11,
        background: checked ? '#3b82f6' : 'rgba(255,255,255,0.12)',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: checked ? 21 : 3,
        width: 16, height: 16, borderRadius: '50%',
        background: '#fff', transition: 'left 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </button>
  );
}

/* ─── Permission Selector ─── */
const PERMS = [
  { id: 'view',     label: 'View Only', Icon: Eye },
  { id: 'download', label: 'Download',  Icon: Download },
  { id: 'edit',     label: 'Edit',      Icon: Edit3 },
];

function PermSelector({ value, onChange }) {
  return (
    <div className="ss-perm-row">
      {PERMS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`ss-perm-btn ${value === id ? 'active' : ''}`}
        >
          <Icon size={16} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

/* ─── Generated Link Panel ─── */
function GeneratedLinkPanel({ link, permission, expiresAt, passwordEnabled, downloadLimitEnabled, recipientEmails, isEmail }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (link) {
      navigator.clipboard.writeText(link).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const permLabel = { view: 'View Only', download: 'Download', edit: 'Edit' }[permission] || 'View Only';
  const expiresLabel = expiresAt ? formatDate(expiresAt) : 'Never';

  return (
    <div className="ss-card ss-link-panel">
      <div className="ss-link-panel-title">
        {isEmail ? <Mail size={16} color="#3b82f6" /> : <Shield size={16} color="#10b981" />}
        <span>{isEmail ? 'Secure Email Dispatch' : 'Generated Link'}</span>
      </div>

      {link ? (
        <>
          {recipientEmails && recipientEmails.length > 0 && (
            <div style={{
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.25)',
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: '16px',
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                Secure Email Sent To
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#f1f5f9', fontWeight: 500, wordBreak: 'break-all' }}>
                {recipientEmails.join(', ')}
              </div>
            </div>
          )}

          <div className="ss-link-row">
            <a href={link} className="ss-link-url" target="_blank" rel="noreferrer">{link}</a>
            <button type="button" className="ss-copy-btn" onClick={handleCopy} title="Copy link">
              {copied ? <Check size={15} color="#10b981" /> : <Copy size={15} />}
            </button>
          </div>

          <div className="ss-link-meta">
            <div className="ss-meta-row">
              <span className="ss-meta-icon"><Eye size={13} /></span>
              <span className="ss-meta-label">Permission Rights</span>
              <span className="ss-meta-value">{permLabel}</span>
            </div>
            <div className="ss-meta-row">
              <span className="ss-meta-icon"><Calendar size={13} /></span>
              <span className="ss-meta-label">Expiration Rule</span>
              <span className="ss-meta-value">{expiresLabel}</span>
            </div>
            <div className="ss-meta-row">
              <span className="ss-meta-icon"><Lock size={13} /></span>
              <span className="ss-meta-label">Password Rule</span>
              <span className="ss-meta-value">{passwordEnabled ? 'Required' : 'Disabled'}</span>
            </div>
            <div className="ss-meta-row">
              <span className="ss-meta-icon"><Download size={13} /></span>
              <span className="ss-meta-label">Download Rule</span>
              <span className="ss-meta-value">{downloadLimitEnabled ? 'Limited' : 'Unlimited'}</span>
            </div>
            <div className="ss-meta-row">
              <span className="ss-meta-icon"><Shield size={13} /></span>
              <span className="ss-meta-label">Encryption</span>
              <span className="ss-meta-value">AES-256-GCM</span>
            </div>
          </div>

          <div className="ss-e2ee-notice">
            <Check size={14} color="#10b981" style={{ flexShrink: 0 }} />
            <span>
              {isEmail
                ? 'An email detailing the secure link and these assigned access rules & rights was dispatched to the recipient(s).'
                : 'This link is protected with end-to-end encryption. Even SecureShare cannot access the file contents.'}
            </span>
          </div>
        </>
      ) : (
        <div className="ss-link-empty">
          {isEmail ? <Mail size={32} color="#334155" /> : <Shield size={32} color="#334155" />}
          <p>{isEmail ? 'Send a secure email to view dispatch details and assigned rights here' : 'Generate a secure link to see details here'}</p>
        </div>
      )}
    </div>
  );
}

/* ─── File Selector ─── */
function FileSelector({ files, selected, onSelect, onChangeClick }) {
  const [open, setOpen] = useState(false);

  const selectedFile = files.find(f => f.id === selected);

  return (
    <div className="ss-field-group">
      <label className="ss-field-label">Select File</label>
      {selectedFile ? (
        <div className="ss-file-selected">
          <FileIcon name={selectedFile.filename || selectedFile.original_name || ''} />
          <div className="ss-file-info">
            <div className="ss-file-name">{selectedFile.filename || selectedFile.original_name || 'Unknown File'}</div>
            <div className="ss-file-size">
              {formatBytes(selectedFile.size_bytes || selectedFile.size || 0)}
              {selectedFile.encrypted || selectedFile.mime_type?.startsWith('e2ee:') ? ' · Encrypted' : ''}
            </div>
          </div>
          <button type="button" className="ss-change-btn" onClick={() => setOpen(o => !o)}>
            Change
          </button>
        </div>
      ) : (
        <button type="button" className="ss-file-picker-btn" onClick={() => setOpen(o => !o)}>
          <FileText size={16} />
          <span>Choose a file…</span>
          <ChevronDown size={14} style={{ marginLeft: 'auto' }} />
        </button>
      )}

      {open && (
        <div className="ss-file-dropdown">
          {files.length === 0 ? (
            <div className="ss-dropdown-empty">No files available</div>
          ) : (
            files.map(f => (
              <button
                key={f.id}
                type="button"
                className={`ss-dropdown-item ${f.id === selected ? 'active' : ''}`}
                onClick={() => { onSelect(f.id); setOpen(false); }}
              >
                <FileIcon name={f.filename || f.original_name || ''} size={14} />
                <div>
                  <div className="ss-dropdown-name">{f.filename || f.original_name || 'File'}</div>
                  <div className="ss-dropdown-size">{formatBytes(f.size_bytes || f.size || 0)}</div>
                </div>
                {f.id === selected && <Check size={14} color="#3b82f6" style={{ marginLeft: 'auto' }} />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TAB 1 — Generate Link
═══════════════════════════════════════════════════ */
function GenerateLinkTab({ files }) {
  const [selectedFile, setSelectedFile] = useState('');
  const [permission, setPermission]     = useState('view');
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [password, setPassword]         = useState('');
  const [expiresAt, setExpiresAt]       = useState('');
  const [downloadLimit, setDownloadLimit] = useState(false);
  const [maxDownloads, setMaxDownloads] = useState(10);
  const [generatedLink, setGeneratedLink] = useState('');
  const [generating, setGenerating]     = useState(false);
  const [error, setError]               = useState('');
  const [shareData, setShareData]       = useState(null);

  const handleGenerate = async () => {
    if (!selectedFile) { setError('Please select a file first.'); return; }
    setError('');
    setGenerating(true);
    try {
      const payload = {
        file_id: selectedFile,
        permission,
        password: passwordEnabled ? password : null,
        expires_at: expiresAt || null,
        max_downloads: downloadLimit ? maxDownloads : null,
      };
      const res = await sharesAPI.create(payload);
      const data = res.data;
      setShareData(data);
      const token = data.token || data.share_token || data.id;
      const base = window.location.origin;
      setGeneratedLink(`${base}/share/${token}`);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || 'Failed to generate link. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="ss-tab-layout">
      {/* Left panel */}
      <div className="ss-card ss-form-panel">
        <FileSelector
          files={files}
          selected={selectedFile}
          onSelect={setSelectedFile}
          onChangeClick={() => setSelectedFile('')}
        />

        <div className="ss-field-group">
          <label className="ss-field-label">Permission Level</label>
          <PermSelector value={permission} onChange={setPermission} />
        </div>

        {/* Password Protection */}
        <div className="ss-toggle-row">
          <div className="ss-toggle-left">
            <Lock size={14} />
            <span>Password Protection</span>
          </div>
          <Toggle checked={passwordEnabled} onChange={setPasswordEnabled} />
        </div>
        {passwordEnabled && (
          <div className="ss-field-group ss-indent">
            <input
              type="password"
              className="ss-input"
              placeholder="Set a password…"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
        )}

        {/* Expiration Date */}
        <div className="ss-toggle-row">
          <div className="ss-toggle-left">
            <Calendar size={14} />
            <span>Expiration Date</span>
          </div>
          <input
            type="date"
            className="ss-date-input"
            value={expiresAt}
            onChange={e => setExpiresAt(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Download Limit */}
        <div className="ss-toggle-row">
          <div className="ss-toggle-left">
            <Download size={14} />
            <span>Download Limit</span>
          </div>
          <Toggle checked={downloadLimit} onChange={setDownloadLimit} />
        </div>
        {downloadLimit && (
          <div className="ss-field-group ss-indent">
            <input
              type="number"
              className="ss-input"
              placeholder="Max downloads"
              value={maxDownloads}
              min={1}
              onChange={e => setMaxDownloads(Number(e.target.value))}
            />
          </div>
        )}

        {error && (
          <div className="ss-error-msg">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          className="ss-generate-btn"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? (
            <><RefreshCw size={15} className="spin" /> Generating…</>
          ) : (
            <><Link2 size={15} /> Generate Secure Link</>
          )}
        </button>
      </div>

      {/* Right panel */}
      <GeneratedLinkPanel
        link={generatedLink}
        permission={permission}
        expiresAt={expiresAt || shareData?.expires_at}
        passwordEnabled={passwordEnabled}
        downloadLimitEnabled={downloadLimit}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TAB 2 — Email Share
═══════════════════════════════════════════════════ */
function EmailShareTab({ files }) {
  const [selectedFile, setSelectedFile] = useState('');
  const [emails, setEmails]             = useState('');
  const [permission, setPermission]     = useState('view');
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [password, setPassword]         = useState('');
  const [expiresAt, setExpiresAt]       = useState('');
  const [downloadLimit, setDownloadLimit] = useState(false);
  const [maxDownloads, setMaxDownloads] = useState(10);
  const [sending, setSending]           = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');
  const [shareData, setShareData]       = useState(null);
  const [sentLink, setSentLink]         = useState('');
  const [sentRecipients, setSentRecipients] = useState([]);

  const handleSend = async () => {
    if (!selectedFile) { setError('Please select a file.'); return; }
    if (!emails.trim()) { setError('Please enter at least one email address.'); return; }
    setError(''); setSuccess('');
    setSending(true);
    try {
      const emailList = emails.split(',').map(e => e.trim()).filter(Boolean);
      const payload = {
        file_id: selectedFile,
        permission,
        recipient_emails: emailList,
        password: passwordEnabled ? password : null,
        expires_at: expiresAt || null,
        max_downloads: downloadLimit ? maxDownloads : null,
      };
      const res = await sharesAPI.create(payload);
      const data = res.data;
      setShareData(data);
      const token = data.token || data.share_token || data.id;
      setSentRecipients(emailList);
      setSentLink(`${window.location.origin}/share/${token}`);
      setSuccess(`Secure email sent to ${emailList.join(', ')} with assigned rules & rights.`);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || 'Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="ss-tab-layout">
      {/* Left panel */}
      <div className="ss-card ss-form-panel">
        <FileSelector
          files={files}
          selected={selectedFile}
          onSelect={setSelectedFile}
          onChangeClick={() => setSelectedFile('')}
        />

        <div className="ss-field-group">
          <label className="ss-field-label">Recipient Email(s)</label>
          <div className="ss-input-wrap">
            <Mail size={14} className="ss-input-icon" />
            <input
              type="text"
              className="ss-input ss-input-icon-left"
              placeholder="james@partner.com, mary@lawfirm.com"
              value={emails}
              onChange={e => setEmails(e.target.value)}
            />
          </div>
          <p className="ss-field-hint">Separate multiple addresses with commas</p>
        </div>

        <div className="ss-field-group">
          <label className="ss-field-label">Permission Level</label>
          <PermSelector value={permission} onChange={setPermission} />
        </div>

        {/* Password Protection */}
        <div className="ss-toggle-row">
          <div className="ss-toggle-left">
            <Lock size={14} />
            <span>Password Protection</span>
          </div>
          <Toggle checked={passwordEnabled} onChange={setPasswordEnabled} />
        </div>
        {passwordEnabled && (
          <div className="ss-field-group ss-indent">
            <input
              type="password"
              className="ss-input"
              placeholder="Set a password…"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
        )}

        {/* Expiration Date */}
        <div className="ss-toggle-row">
          <div className="ss-toggle-left">
            <Calendar size={14} />
            <span>Expiration Date</span>
          </div>
          <input
            type="date"
            className="ss-date-input"
            value={expiresAt}
            onChange={e => setExpiresAt(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Download Limit */}
        <div className="ss-toggle-row">
          <div className="ss-toggle-left">
            <Download size={14} />
            <span>Download Limit</span>
          </div>
          <Toggle checked={downloadLimit} onChange={setDownloadLimit} />
        </div>
        {downloadLimit && (
          <div className="ss-field-group ss-indent">
            <input
              type="number"
              className="ss-input"
              placeholder="Max downloads"
              value={maxDownloads}
              min={1}
              onChange={e => setMaxDownloads(Number(e.target.value))}
            />
          </div>
        )}

        {error && (
          <div className="ss-error-msg">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="ss-success-msg">
            <Check size={14} />
            <span>{success}</span>
          </div>
        )}

        <button
          type="button"
          className="ss-generate-btn"
          onClick={handleSend}
          disabled={sending}
        >
          {sending ? (
            <><RefreshCw size={15} className="spin" /> Sending…</>
          ) : (
            <><Send size={15} /> Send Secure Email</>
          )}
        </button>
      </div>

      {/* Right panel */}
      <GeneratedLinkPanel
        link={sentLink}
        permission={permission}
        expiresAt={expiresAt || shareData?.expires_at}
        passwordEnabled={passwordEnabled}
        downloadLimitEnabled={downloadLimit}
        recipientEmails={sentRecipients}
        isEmail={true}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TAB 3 — Sharing History
═══════════════════════════════════════════════════ */
const PERM_BADGE = {
  view:     { label: 'View',     cls: 'ss-badge-view'     },
  download: { label: 'Download', cls: 'ss-badge-download' },
  edit:     { label: 'Edit',     cls: 'ss-badge-edit'     },
};

const STATUS_BADGE = {
  active:  { label: 'active',  cls: 'ss-status-active'  },
  expired: { label: 'expired', cls: 'ss-status-expired' },
  revoked: { label: 'revoked', cls: 'ss-status-revoked' },
};

function SharingHistoryTab() {
  const [shares, setShares]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [revoking, setRevoking] = useState(null);

  const loadShares = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sharesAPI.list();
      const data = Array.isArray(res.data) ? res.data : (res.data?.shares || []);
      setShares(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load sharing history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadShares(); }, [loadShares]);

  const handleRevoke = async (id) => {
    setRevoking(id);
    try {
      await sharesAPI.revoke(id);
      setShares(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setRevoking(null);
    }
  };

  const getStatus = (share) => {
    if (share.revoked) return 'revoked';
    if (share.expires_at && new Date(share.expires_at) < new Date()) return 'expired';
    return 'active';
  };

  const activeCount = shares.filter(s => getStatus(s) === 'active').length;

  return (
    <div className="ss-card ss-history-panel">
      <div className="ss-history-header">
        <h3 className="ss-history-title">Sharing History</h3>
        <span className="ss-history-count">{activeCount} share{activeCount !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="ss-state-center">
          <RefreshCw size={24} className="spin" color="#3b82f6" />
          <span>Loading history…</span>
        </div>
      ) : error ? (
        <div className="ss-state-center">
          <AlertCircle size={24} color="#ef4444" />
          <span style={{ color: '#ef4444' }}>{error}</span>
        </div>
      ) : shares.length === 0 ? (
        <div className="ss-state-center">
          <Shield size={40} color="#334155" />
          <p style={{ color: '#64748b', marginTop: 8 }}>No shares created yet</p>
        </div>
      ) : (
        <div className="ss-history-table-wrap">
          <table className="ss-history-table">
            <thead>
              <tr>
                <th>FILE</th>
                <th>RECIPIENT</th>
                <th>PERMISSION</th>
                <th>ACCESSED</th>
                <th>EXPIRES</th>
                <th>STATUS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {shares.map(share => {
                const fileName = share.file_name || share.filename || share.original_name || 'File';
                const recipient = share.recipient_email || share.recipient_emails?.[0] || 'Link Share';
                const perm = share.permission || 'view';
                const accessed = share.access_count != null ? `${share.access_count}×` : '—';
                const expires = share.expires_at ? formatDate(share.expires_at) : 'Never';
                const status = getStatus(share);
                const badge = STATUS_BADGE[status] || STATUS_BADGE.active;
                const permBadge = PERM_BADGE[perm] || PERM_BADGE.view;
                const isExpiredOrRevoked = status !== 'active';

                return (
                  <tr key={share.id} className="ss-history-row">
                    <td className="ss-cell-file">
                      <span title={fileName}>
                        {fileName.length > 24 ? fileName.substring(0, 24) + '…' : fileName}
                      </span>
                    </td>
                    <td className="ss-cell-email">{recipient}</td>
                    <td>
                      <span className={`ss-perm-badge ${permBadge.cls}`}>{permBadge.label}</span>
                    </td>
                    <td className="ss-cell-accessed">{accessed}</td>
                    <td className="ss-cell-expires">
                      <span className={status === 'expired' ? 'ss-expired-text' : ''}>
                        {status === 'expired' ? 'Expired' : expires}
                      </span>
                    </td>
                    <td>
                      <span className={`ss-status-badge ${badge.cls}`}>{badge.label}</span>
                    </td>
                    <td>
                      {!isExpiredOrRevoked && (
                        <button
                          type="button"
                          className="ss-revoke-btn"
                          onClick={() => handleRevoke(share.id)}
                          disabled={revoking === share.id}
                          title="Revoke share"
                        >
                          {revoking === share.id ? <RefreshCw size={13} className="spin" /> : <X size={13} />}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Main Sharing Page
═══════════════════════════════════════════════════ */
const TABS = [
  { id: 'generate', label: 'Generate Link', Icon: Link2 },
  { id: 'email',    label: 'Email Share',   Icon: Mail  },
  { id: 'history',  label: 'Sharing History', Icon: Clock },
];

export default function Sharing() {
  const [activeTab, setActiveTab] = useState('generate');
  const [files, setFiles]         = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(true);

  useEffect(() => {
    filesAPI.list()
      .then(res => {
        const data = res.data;
        const arr = Array.isArray(data) ? data : (data?.files || []);
        setFiles(arr);
      })
      .catch(() => {})
      .finally(() => setLoadingFiles(false));
  }, []);

  return (
    <div className="ss-page">
      {/* Page heading */}
      <div className="ss-page-header">
        <h1 className="ss-page-title">Secure Sharing</h1>
        <p className="ss-page-sub">Generate encrypted share links with granular access control</p>
      </div>

      {/* Tabs */}
      <div className="ss-tabs">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`ss-tab-btn ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {loadingFiles && activeTab !== 'history' ? (
        <div className="ss-state-center" style={{ marginTop: 60 }}>
          <RefreshCw size={24} className="spin" color="#3b82f6" />
          <span>Loading files…</span>
        </div>
      ) : (
        <>
          {activeTab === 'generate' && <GenerateLinkTab files={files} />}
          {activeTab === 'email'    && <EmailShareTab   files={files} />}
          {activeTab === 'history'  && <SharingHistoryTab />}
        </>
      )}
    </div>
  );
}
