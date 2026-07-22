import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiBell, FiX, FiCompass, FiUser, FiFolder, FiActivity, FiArrowRight } from 'react-icons/fi';
import { searchAPI } from '../utils/api';

const DEFAULT_PAGES = [
  { title: "Dashboard", description: "System overview & stats", url: "/dashboard" },
  { title: "Analytics", description: "Metrics, charts & system health", url: "/analytics" },
  { title: "Activity Logs", description: "Security audit trail", url: "/activity" },
  { title: "Notifications", description: "User alerts & updates", url: "/notifications" },
  { title: "Settings", description: "Profile, security & MFA", url: "/settings" },
  { title: "Sharing", description: "File sharing management", url: "/sharing" },
  { title: "Admin Panel", description: "User administration", url: "/admin" },
];

export default function Navbar({ unreadCount = 0 }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const avatar = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ pages: [], users: [], folders: [], logs: [] });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults({ pages: [], users: [], folders: [], logs: [] });
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    setLoading(true);

    const timer = setTimeout(() => {
      searchAPI.query(trimmed)
        .then(({ data }) => {
          setResults(data || { pages: [], users: [], folders: [], logs: [] });
        })
        .catch(() => {
          const matchedPages = DEFAULT_PAGES.filter(p =>
            p.title.toLowerCase().includes(trimmed.toLowerCase()) ||
            p.description.toLowerCase().includes(trimmed.toLowerCase())
          );
          setResults({ pages: matchedPages, users: [], folders: [], logs: [] });
        })
        .finally(() => setLoading(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (url) => {
    setIsOpen(false);
    setQuery('');
    if (url) navigate(url);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter') {
      if (results.pages?.length > 0) {
        handleSelect(results.pages[0].url);
      } else if (results.logs?.length > 0) {
        handleSelect('/activity');
      } else if (results.users?.length > 0) {
        handleSelect('/admin');
      } else if (query.trim()) {
        handleSelect('/activity');
      }
    }
  };

  const hasResults =
    (results.pages?.length || 0) +
    (results.users?.length || 0) +
    (results.folders?.length || 0) +
    (results.logs?.length || 0) > 0;

  return (
    <header className="navbar">
      <div className="navbar-search" ref={searchRef}>
        <span className="navbar-search-icon"><FiSearch /></span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search files, users, logs, pages…"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); }}
            style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '0.9rem',
            }}
          >
            <FiX />
          </button>
        )}

        {/* Search Results Dropdown Overlay */}
        {isOpen && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
            background: 'var(--bg-secondary, #0a1628)',
            border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
            borderRadius: 12, boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            maxHeight: 380, overflowY: 'auto', zIndex: 1000, padding: 8,
          }}>
            {loading ? (
              <div style={{ padding: '16px 12px', fontSize: '.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Searching…
              </div>
            ) : !hasResults ? (
              <div style={{ padding: '16px 12px', fontSize: '.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                No results found for "{query}"
              </div>
            ) : (
              <>
                {/* Pages */}
                {results.pages?.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--text-muted)', padding: '6px 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Pages
                    </div>
                    {results.pages.map((p, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelect(p.url)}
                        className="search-result-item"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                          transition: 'background .15s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <FiCompass style={{ color: '#3b82f6' }} />
                          <div>
                            <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.title}</div>
                            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{p.description}</div>
                          </div>
                        </div>
                        <FiArrowRight style={{ fontSize: '.8rem', color: 'var(--text-muted)' }} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Users */}
                {results.users?.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--text-muted)', padding: '6px 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Users
                    </div>
                    {results.users.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => handleSelect(u.url)}
                        className="search-result-item"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                          transition: 'background .15s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <FiUser style={{ color: '#10b981' }} />
                          <div>
                            <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{u.email} ({u.role})</div>
                          </div>
                        </div>
                        <FiArrowRight style={{ fontSize: '.8rem', color: 'var(--text-muted)' }} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Folders */}
                {results.folders?.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--text-muted)', padding: '6px 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Folders
                    </div>
                    {results.folders.map((f) => (
                      <div
                        key={f.id}
                        onClick={() => handleSelect(f.url)}
                        className="search-result-item"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                          transition: 'background .15s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <FiFolder style={{ color: '#818cf8' }} />
                          <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{f.name}</div>
                        </div>
                        <FiArrowRight style={{ fontSize: '.8rem', color: 'var(--text-muted)' }} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Audit Logs */}
                {results.logs?.length > 0 && (
                  <div>
                    <div style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--text-muted)', padding: '6px 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Activity Logs
                    </div>
                    {results.logs.map((l) => (
                      <div
                        key={l.id}
                        onClick={() => handleSelect(l.url)}
                        className="search-result-item"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                          transition: 'background .15s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <FiActivity style={{ color: '#f59e0b' }} />
                          <div>
                            <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{l.action}</div>
                            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{l.resource_name}</div>
                          </div>
                        </div>
                        <FiArrowRight style={{ fontSize: '.8rem', color: 'var(--text-muted)' }} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="navbar-actions">
        <button
          className="icon-btn"
          onClick={() => navigate('/notifications')}
          title="Notifications"
        >
          <FiBell />
          {unreadCount > 0 && <span className="notif-dot" />}
        </button>

        <div className="navbar-user" onClick={() => navigate('/settings')} title={user?.name}>
          <div
            className="avatar av-md"
            style={{ background: user?.avatar_color || 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }}
          >
            {avatar}
          </div>
          <div className="navbar-user-meta">
            <div className="navbar-user-name">{user?.name || 'User'}</div>
            <div className="navbar-user-role">{user?.role || 'member'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
