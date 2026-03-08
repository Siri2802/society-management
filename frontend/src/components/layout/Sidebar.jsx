import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui';

const icons = {
  dashboard: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  visitors: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  maintenance: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  finance: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  communication: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  admin: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 8v4l3 3"/></svg>,
};

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: icons.dashboard, roles: ['resident', 'management', 'staff'] },
  { to: '/visitors', label: 'Visitors', icon: icons.visitors, roles: ['resident', 'management', 'staff'] },
  { to: '/maintenance', label: 'Maintenance', icon: icons.maintenance, roles: ['resident', 'management', 'staff'] },
  { to: '/finance', label: 'Finance', icon: icons.finance, roles: ['resident', 'management'] },
  { to: '/communication', label: 'Communication', icon: icons.communication, roles: ['resident', 'management', 'staff'] },
  { to: '/admin', label: 'Administration', icon: icons.admin, roles: ['management'] },
];

export function Sidebar({ mobile, onClose }) {
  const { user, logout } = useAuth();
  const { notifications } = useApp();
  const navigate = useNavigate();
  const unread = notifications.filter(n => !n.read && n.userId === user?.id).length;

  const filtered = NAV_ITEMS.filter(item => item.roles.includes(user?.role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`
      flex flex-col h-full bg-bg-surface border-r border-bg-border w-60
      ${mobile ? 'fixed inset-y-0 left-0 z-50' : ''}
    `}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-bg-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0C0F1A" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div className="leading-tight">
            <p className="font-display font-bold text-sm text-ink">Green Valley</p>
            <p className="text-[10px] text-ink-faint uppercase tracking-widest">Society</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5 overflow-y-auto">
        <p className="text-[10px] font-display font-semibold text-ink-faint uppercase tracking-widest px-3 py-2 mt-1">Menu</p>
        {filtered.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body font-medium transition-all
              ${isActive
                ? 'nav-active bg-accent-muted text-accent'
                : 'text-ink-muted hover:text-ink hover:bg-bg-card'
              }`
            }
          >
            {item.icon}
            {item.label}
            {item.to === '/communication' && unread > 0 && (
              <span className="ml-auto bg-accent text-bg text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unread}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-bg-border">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-bg-card transition-colors">
          <Avatar name={user?.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-display font-semibold text-ink truncate">{user?.name || user?.email}</p>
            <p className="text-[10px] text-ink-faint capitalize">
              {user?.role} {user?.unit ? `· ${user.unit}` : ''}
            </p>
          </div>
          <button onClick={handleLogout} title="Logout" className="text-ink-faint hover:text-danger transition-colors p-1 rounded">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
