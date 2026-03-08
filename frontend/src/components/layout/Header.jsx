import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Avatar, Badge } from '../ui';

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', sub: 'Overview of your society' },
  '/visitors': { title: 'Visitor Management', sub: 'Gate entry & pre-approvals' },
  '/maintenance': { title: 'Maintenance & Complaints', sub: 'Service requests & tracking' },
  '/finance': { title: 'Finance & Billing', sub: 'Bills, payments & transactions' },
  '/communication': { title: 'Communication', sub: 'Announcements & community forum' },
  '/admin': { title: 'Administration', sub: 'System settings & reporting' },
};

export function Header({ onMenuClick }) {
  const { user } = useAuth();
  const { notifications, dispatch } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const page = PAGE_TITLES[location.pathname] || { title: 'Green Valley', sub: '' };
  const myNotifs = notifications.filter(n => n.userId === user?.id || !n.userId);
  const unread = myNotifs.filter(n => !n.read).length;

  const notifIcons = {
    bill: '💰', maintenance: '🔧', visitor: '👤', announcement: '📢',
  };

  return (
    <header className="h-14 bg-bg-surface border-b border-bg-border flex items-center px-4 gap-4 shrink-0">
      {/* Mobile menu button */}
      <button onClick={onMenuClick} className="lg:hidden text-ink-muted hover:text-ink transition-colors p-1 rounded">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="font-display font-bold text-sm text-ink truncate">{page.title}</h1>
        <p className="text-[10px] text-ink-faint hidden sm:block">{page.sub}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-bg-card transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-10 w-80 bg-bg-surface border border-bg-border rounded-xl shadow-2xl z-50 animate-fade-in overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-bg-border">
                <p className="font-display font-semibold text-sm text-ink">Notifications</p>
                <button
                  onClick={() => { dispatch({ type: 'MARK_ALL_READ' }); setShowNotifs(false); }}
                  className="text-xs text-accent hover:underline"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {myNotifs.length === 0 ? (
                  <p className="text-sm text-ink-faint text-center py-8">No notifications</p>
                ) : (
                  myNotifs.map(n => (
                    <button
                      key={n.id}
                      onClick={() => { dispatch({ type: 'MARK_READ', payload: n.id }); setShowNotifs(false); }}
                      className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-bg-card transition-colors text-left border-b border-bg-border/50 last:border-0 ${!n.read ? 'bg-accent-muted/5' : ''}`}
                    >
                      <span className="text-base mt-0.5">{notifIcons[n.type] || '🔔'}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-relaxed ${n.read ? 'text-ink-muted' : 'text-ink'}`}>{n.message}</p>
                        <p className="text-[10px] text-ink-faint mt-1">
                          {new Date(n.time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-accent shrink-0 mt-1.5" />}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-bg-card transition-colors">
          <Avatar name={user?.name} size="sm" />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-display font-semibold text-ink leading-none">{user?.name?.split(' ')[0]}</p>
            <p className="text-[10px] text-ink-faint capitalize">{user?.role}</p>
          </div>
        </button>
      </div>
    </header>
  );
}
