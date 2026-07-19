import { useMemo, useState } from 'react';
import { Download, Eye, Files, Grid2X2, List, Search, ShieldCheck, Users } from 'lucide-react';
import { formatDate } from '../../../utils/formatDate';
import SharedFileIcon from './SharedFileIcon';

const EMPTY_FILES = [];

const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / (1024 ** index)).toFixed(index ? 1 : 0)} ${units[index]}`;
};

export default function SharedFilesView({ data, onDownload }) {
  const [query, setQuery] = useState('');
  const [permission, setPermission] = useState('all');
  const [view, setView] = useState('list');
  const [downloading, setDownloading] = useState(null);
  const files = data?.files || EMPTY_FILES;
  const filtered = useMemo(() => files.filter((file) => {
    const matchesQuery = `${file.name} ${file.shared_by}`.toLowerCase().includes(query.toLowerCase());
    const matchesPermission = permission === 'all' || (permission === 'download' ? file.can_download : !file.can_download);
    return matchesQuery && matchesPermission;
  }), [files, permission, query]);

  const handleDownload = async (file) => {
    setDownloading(file.file_id);
    try { await onDownload(file); } finally { setDownloading(null); }
  };

  return (
    <section className="shared-view fade-in">
      <header className="shared-heading">
        <div>
          <span className="shared-eyebrow"><Users size={14} /> Collaboration</span>
          <h1>Shared with me</h1>
          <p>Files that teammates and collaborators have securely shared with you.</p>
        </div>
        <div className="shared-heading-art" aria-hidden="true"><ShieldCheck size={30} /></div>
      </header>

      <div className="shared-stats">
        <div><span className="shared-stat-icon blue"><Files size={19} /></span><p><strong>{data.total}</strong><small>Total shared files</small></p></div>
        <div><span className="shared-stat-icon purple"><Eye size={19} /></span><p><strong>{data.view_only}</strong><small>View only</small></p></div>
        <div><span className="shared-stat-icon green"><Download size={19} /></span><p><strong>{data.downloadable}</strong><small>Available to download</small></p></div>
      </div>

      <div className="shared-panel">
        <div className="shared-toolbar">
          <label className="shared-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search shared files or people" /></label>
          <div className="shared-toolbar-actions">
            <select aria-label="Filter by access" value={permission} onChange={(event) => setPermission(event.target.value)}>
              <option value="all">All access</option><option value="view">View only</option><option value="download">Can download</option>
            </select>
            <div className="shared-view-toggle" aria-label="Change view">
              <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')} aria-label="List view"><List size={17} /></button>
              <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} aria-label="Grid view"><Grid2X2 size={16} /></button>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="shared-empty"><span><Users size={28} /></span><h2>{files.length ? 'No matching files' : 'Nothing shared with you yet'}</h2><p>{files.length ? 'Try a different search or access filter.' : 'Files shared by other people will appear here.'}</p></div>
        ) : (
          <div className={`shared-files shared-files-${view}`}>
            {view === 'list' && <div className="shared-table-head"><span>Name</span><span>Shared by</span><span>Shared on</span><span>Access</span><span /></div>}
            {filtered.map((file) => (
              <article className="shared-file" key={file.permission_id}>
                <div className="shared-file-name"><SharedFileIcon mimetype={file.mimetype} name={file.name} /><p><strong title={file.name}>{file.name}</strong><small>{formatSize(file.size)} · {file.encrypted ? 'Encrypted' : 'Protected'}</small></p></div>
                <div className="shared-owner"><span>{file.shared_by.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><p><strong>{file.shared_by}</strong><small>{file.shared_by_email}</small></p></div>
                <time>{formatDate(file.shared_at)}</time>
                <span className={`shared-access ${file.can_download ? 'download' : 'view'}`}>{file.can_download ? <Download size={13} /> : <Eye size={13} />}{file.can_download ? 'Download' : 'View only'}</span>
                <button className="shared-download" disabled={!file.can_download || downloading === file.file_id} onClick={() => handleDownload(file)} title={file.can_download ? `Download ${file.name}` : 'The owner disabled downloads'}>
                  {downloading === file.file_id ? <span className="spinner spinner-sm" /> : file.can_download ? <Download size={17} /> : <Eye size={17} />}
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
      <p className="shared-security-note"><ShieldCheck size={14} /> Every file is encrypted and access-controlled by its owner.</p>
    </section>
  );
}
