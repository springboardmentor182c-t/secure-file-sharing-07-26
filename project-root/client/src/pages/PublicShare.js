import React, { useEffect, useState } from 'react';
import { Download, Eye, FileText, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { sharesAPI } from '../utils/api';

const formatSize = (size) => {
  if (!Number.isFinite(size)) return 'Unknown size';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export default function PublicShare() {
  const { token } = useParams();
  const [details, setDetails] = useState(null);
  const [password, setPassword] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState('');

  const loadDetails = async (sharePassword = '') => {
    setLoading(true);
    setError('');
    try {
      const response = await sharesAPI.publicDetails(token, sharePassword || undefined);
      setDetails(response.data);
      setNeedsPassword(false);
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        setNeedsPassword(true);
        if (sharePassword) setError('The share password is incorrect.');
      } else {
        setError(requestError.response?.data?.detail || 'This share link is unavailable.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
    // The token is the complete identity of this public page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const unlock = (event) => {
    event.preventDefault();
    loadDetails(password);
  };

  const openFile = async () => {
    setOpening(true);
    setError('');
    try {
      const response = await sharesAPI.publicContent(token, password || undefined);
      const objectUrl = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = details.permission === 'download' ? details.file_name : '';
      if (details.permission !== 'download') link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
      setDetails((current) => ({ ...current, access_count: current.access_count + 1 }));
    } catch (requestError) {
      setError(requestError.response?.status === 410
        ? 'This share link has expired or reached its view limit.'
        : 'The shared file could not be opened.');
    } finally {
      setOpening(false);
    }
  };

  return (
    <main className="auth-page" style={{ minHeight: '100vh', padding: '40px 20px', alignItems: 'flex-start', justifyContent: 'center' }}>
      <section className="card" style={{ width: 'min(520px, 100%)', marginTop: '8vh', padding: 32 }}>
        <div className="flex items-center gap-3 mb-6">
          <span className="stat-icon stat-icon-blue"><ShieldCheck size={22} /></span>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>TrustShare secure link</h1>
            <p className="text-secondary text-sm">The sender protected this file with TrustShare.</p>
          </div>
        </div>

        {loading ? (
          <div role="status" className="flex items-center gap-3"><div className="spinner" /> Checking share link...</div>
        ) : needsPassword ? (
          <form onSubmit={unlock}>
            <div className="flex items-center gap-2 mb-4"><LockKeyhole size={18} /> This link requires a password.</div>
            <label className="form-label" htmlFor="share-password">Share password</label>
            <input
              id="share-password"
              className="form-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
            {error && <p role="alert" className="text-sm mt-3" style={{ color: 'var(--rose-400)' }}>{error}</p>}
            <button className="btn btn-primary mt-4" type="submit">Unlock file</button>
          </form>
        ) : details ? (
          <>
            <div className="flex items-center gap-3" style={{ padding: '18px 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
              <FileText size={28} style={{ color: 'var(--blue-400)' }} />
              <div style={{ minWidth: 0 }}>
                <strong style={{ display: 'block', overflowWrap: 'anywhere' }}>{details.file_name}</strong>
                <span className="text-secondary text-sm">{formatSize(details.size)} · {details.permission} access</span>
              </div>
            </div>
            <p className="text-secondary text-sm mt-4">
              {details.max_views == null
                ? `${details.access_count} previous access${details.access_count === 1 ? '' : 'es'}`
                : `${Math.max(details.max_views - details.access_count, 0)} of ${details.max_views} accesses remaining`}
            </p>
            {error && <p role="alert" className="text-sm mt-3" style={{ color: 'var(--rose-400)' }}>{error}</p>}
            <button className="btn btn-primary mt-4" type="button" onClick={openFile} disabled={opening}>
              {details.permission === 'download' ? <Download size={17} /> : <Eye size={17} />}
              {opening ? 'Opening...' : details.permission === 'download' ? 'Download file' : 'View secure file'}
            </button>
          </>
        ) : (
          <div role="alert">
            <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Share unavailable</h2>
            <p className="text-secondary">{error}</p>
          </div>
        )}
      </section>
    </main>
  );
}
