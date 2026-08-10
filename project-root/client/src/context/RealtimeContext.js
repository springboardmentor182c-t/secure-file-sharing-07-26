import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { Bell, Share2, CheckCircle2, AlertCircle, X } from 'lucide-react';

const RealtimeContext = createContext(null);

export function RealtimeProvider({ children }) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [toasts, setToasts] = useState([]);
  const wsRef = useRef(null);
  const listenersRef = useRef(new Map());
  const reconnectTimeoutRef = useRef(null);
  const backoffRef = useRef(1000);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Add toast helper
  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    const newToast = { id, type: 'info', duration: 5000, ...toast };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, [removeToast]);

  // Event subscription helper
  const subscribe = useCallback((event, callback) => {
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event).add(callback);

    return () => {
      if (listenersRef.current.has(event)) {
        listenersRef.current.get(event).delete(callback);
      }
    };
  }, []);

  const emitLocal = useCallback((event, data) => {
    if (listenersRef.current.has(event)) {
      listenersRef.current.get(event).forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(`Error in realtime subscriber for event ${event}:`, e);
        }
      });
    }
  }, []);

  // Connect WebSocket
  const connect = useCallback(() => {
    const token = localStorage.getItem('access_token');
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use window.location.hostname and default port 8000 for local dev
    const host = process.env.REACT_APP_WS_URL || `${protocol}//${window.location.hostname || '127.0.0.1'}:8000/ws`;
    const url = token ? `${host}?token=${encodeURIComponent(token)}` : host;

    try {
      if (wsRef.current) {
        wsRef.current.close();
      }

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        backoffRef.current = 1000;
        // Ping every 25 seconds to keep connection alive
        ws._pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          
          if (payload.type === 'event' && payload.event) {
            // Dispatch to registered subscribers
            emitLocal(payload.event, payload.data);

            // Trigger visual toast based on event
            if (payload.event === 'share_accessed') {
              addToast({
                type: 'share',
                title: 'Share Link Accessed',
                message: `Someone just accessed '${payload.data?.file_name || 'your file'}' (${payload.data?.permission?.toUpperCase()} - Access #${payload.data?.access_count})`,
              });
            } else if (payload.event === 'email_share_sent') {
              addToast({
                type: 'success',
                title: 'Secure Email Sent (Real-Time)',
                message: `Email dispatched to ${payload.data?.recipients?.join(', ')} with ${payload.data?.permission?.toUpperCase()} rights.`,
                duration: 4500,
              });
            } else if (payload.event === 'share_received') {
              addToast({
                type: 'share',
                title: 'New Secure File Shared',
                message: `${payload.data?.sender_email || 'A user'} shared '${payload.data?.file_name}' with you (${payload.data?.permission?.toUpperCase()} rights).`,
                duration: 6000,
              });
            } else if (payload.event === 'notification_new') {
              addToast({
                type: payload.data?.type || 'info',
                title: payload.data?.title || 'New Notification',
                message: payload.data?.message || '',
              });
            } else if (payload.event === 'files_updated') {
              if (payload.data?.action === 'upload') {
                addToast({
                  type: 'success',
                  title: 'File Upload Synced',
                  message: `Uploaded '${payload.data?.file_name}'`,
                  duration: 3500,
                });
              }
            }
          }
        } catch (err) {
          console.debug('Realtime message parse error:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (ws._pingInterval) clearInterval(ws._pingInterval);
        // Exponential backoff reconnect
        const timeout = Math.min(backoffRef.current, 15000);
        backoffRef.current *= 1.5;
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, timeout);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (e) {
      console.warn('Realtime connection attempt failed:', e);
    }
  }, [addToast, emitLocal]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        if (wsRef.current._pingInterval) clearInterval(wsRef.current._pingInterval);
        wsRef.current.close();
      }
    };
  }, [connect, user]);

  return (
    <RealtimeContext.Provider value={{ isConnected, subscribe, addToast, removeToast }}>
      {children}
      {/* ── Toast Container ── */}
      <div style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'none',
        maxWidth: 380,
        width: '100%',
      }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              background: 'rgba(15, 23, 42, 0.94)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.45), 0 0 15px rgba(59,130,246,0.2)',
              borderRadius: 12,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              animation: 'slideInToast 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              color: '#f8fafc',
            }}
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: toast.type === 'share' ? 'rgba(59,130,246,0.18)' : toast.type === 'success' ? 'rgba(16,185,129,0.18)' : toast.type === 'warn' ? 'rgba(245,158,11,0.18)' : 'rgba(99,102,241,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {toast.type === 'share' ? <Share2 size={16} color="#3b82f6" /> :
               toast.type === 'success' ? <CheckCircle2 size={16} color="#10b981" /> :
               toast.type === 'warn' ? <AlertCircle size={16} color="#f59e0b" /> :
               <Bell size={16} color="#818cf8" />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#fff', marginBottom: 2 }}>
                {toast.title}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: 1.4, wordBreak: 'break-word' }}>
                {toast.message}
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideInToast {
          from {
            opacity: 0;
            transform: translateX(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
      `}</style>
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
