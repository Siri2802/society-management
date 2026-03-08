import { useEffect } from 'react';
import { useApp } from '../../context/AppContext';

// ── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'default', size = 'sm' }) {
  const variants = {
    default: 'bg-bg-card text-ink-muted border border-bg-border',
    success: 'bg-accent-muted text-accent border border-accent/20',
    warning: 'bg-warn/10 text-warn border border-warn/20',
    danger: 'bg-danger/10 text-danger border border-danger/20',
    primary: 'bg-primary-muted text-primary border border-primary/20',
    info: 'bg-blue-900/30 text-blue-300 border border-blue-500/20',
  };
  const sizes = { xs: 'px-1.5 py-0.5 text-[10px]', sm: 'px-2 py-0.5 text-xs', md: 'px-3 py-1 text-sm' };
  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full font-display ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    'paid': { variant: 'success', label: 'Paid' },
    'pending': { variant: 'warning', label: 'Pending' },
    'overdue': { variant: 'danger', label: 'Overdue' },
    'open': { variant: 'primary', label: 'Open' },
    'in-progress': { variant: 'warning', label: 'In Progress' },
    'resolved': { variant: 'success', label: 'Resolved' },
    'inside': { variant: 'success', label: 'Inside' },
    'exited': { variant: 'default', label: 'Exited' },
    'pre-approved': { variant: 'primary', label: 'Pre-approved' },
    'occupied': { variant: 'success', label: 'Occupied' },
    'vacant': { variant: 'default', label: 'Vacant' },
    'under-renovation': { variant: 'warning', label: 'Renovation' },
    'active': { variant: 'success', label: 'Active' },
    'inactive': { variant: 'default', label: 'Inactive' },
  };
  const conf = map[status] || { variant: 'default', label: status };
  return <Badge variant={conf.variant}>{conf.label}</Badge>;
}

export function PriorityBadge({ priority }) {
  const map = {
    urgent: { variant: 'danger', label: '● Urgent' },
    high: { variant: 'warning', label: '● High' },
    medium: { variant: 'primary', label: '● Medium' },
    low: { variant: 'default', label: '● Low' },
  };
  const conf = map[priority] || { variant: 'default', label: priority };
  return <Badge variant={conf.variant} size="xs">{conf.label}</Badge>;
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', className = '', loading = false, icon, ...props }) {
  const variants = {
    primary: 'bg-accent text-bg hover:bg-accent-dim active:scale-95 font-semibold',
    secondary: 'bg-bg-card border border-bg-border text-ink hover:border-accent/50 hover:text-accent active:scale-95',
    danger: 'bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20 active:scale-95',
    ghost: 'text-ink-muted hover:text-ink hover:bg-bg-card active:scale-95',
    primary_dim: 'bg-primary text-white hover:bg-primary-dim active:scale-95 font-semibold',
  };
  const sizes = {
    xs: 'px-2.5 py-1 text-xs gap-1',
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2',
  };
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`inline-flex items-center justify-center rounded-lg transition-all duration-150 font-body disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? <Spinner size={14} /> : icon}
      {children}
    </button>
  );
}

// ── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, error, icon, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-display font-semibold text-ink-muted uppercase tracking-wider">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint">{icon}</span>}
        <input
          {...props}
          className={`w-full bg-bg-card border ${error ? 'border-danger/50 focus:border-danger' : 'border-bg-border focus:border-accent/60'} rounded-lg px-3 py-2.5 text-sm text-ink placeholder-ink-faint transition-colors outline-none ${icon ? 'pl-9' : ''} ${className}`}
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-display font-semibold text-ink-muted uppercase tracking-wider">{label}</label>}
      <select
        {...props}
        className={`w-full bg-bg-card border ${error ? 'border-danger/50' : 'border-bg-border focus:border-accent/60'} rounded-lg px-3 py-2.5 text-sm text-ink transition-colors outline-none ${className}`}
      >
        {children}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-display font-semibold text-ink-muted uppercase tracking-wider">{label}</label>}
      <textarea
        {...props}
        className={`w-full bg-bg-card border ${error ? 'border-danger/50' : 'border-bg-border focus:border-accent/60'} rounded-lg px-3 py-2.5 text-sm text-ink placeholder-ink-faint transition-colors outline-none resize-none ${className}`}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

// ── Card ────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', hover = false }) {
  return (
    <div className={`bg-bg-card border border-bg-border rounded-xl ${hover ? 'hover:border-accent/30 transition-colors cursor-pointer' : ''} ${className}`}>
      {children}
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={onClose}>
      <div
        className={`w-full ${sizes[size]} bg-bg-surface border border-bg-border rounded-2xl shadow-2xl animate-fade-in`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border">
          <h3 className="font-display font-semibold text-base text-ink">{title}</h3>
          <button onClick={onClose} className="text-ink-faint hover:text-ink transition-colors p-1 rounded-lg hover:bg-bg-card">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ── Spinner ────────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"
      style={{ animation: 'spin 0.7s linear infinite' }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeOpacity="0.3"/>
      <path d="M12 2v4" stroke={color}/>
    </svg>
  );
}

// ── Toast ────────────────────────────────────────────────────────────────────
export function ToastContainer() {
  const { toast } = useApp();
  if (!toast) return null;

  const icons = {
    success: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    error: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    info: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="8"/><line x1="12" y1="12" x2="12" y2="16"/></svg>,
  };
  const colors = { success: 'border-accent/40 text-accent', error: 'border-danger/40 text-danger', info: 'border-primary/40 text-primary' };

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-fade-in">
      <div className={`flex items-center gap-3 bg-bg-surface border ${colors[toast.type] || colors.success} rounded-xl px-4 py-3 shadow-2xl`}>
        <span>{icons[toast.type] || icons.success}</span>
        <span className="text-sm text-ink font-body">{toast.message}</span>
      </div>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-bg-card border border-bg-border flex items-center justify-center text-ink-faint">
        {icon}
      </div>
      <div>
        <p className="font-display font-semibold text-ink">{title}</p>
        {subtitle && <p className="text-sm text-ink-muted mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────────────────────────────
export function StatCard({ title, value, sub, icon, trend, color = 'accent' }) {
  const colorMap = {
    accent: { icon: 'bg-accent-muted text-accent', border: 'hover:border-accent/30' },
    primary: { icon: 'bg-primary-muted text-primary', border: 'hover:border-primary/30' },
    warn: { icon: 'bg-warn/10 text-warn', border: 'hover:border-warn/30' },
    danger: { icon: 'bg-danger/10 text-danger', border: 'hover:border-danger/30' },
  };
  const c = colorMap[color] || colorMap.accent;
  return (
    <div className={`bg-bg-card border border-bg-border rounded-xl p-5 flex flex-col gap-3 transition-colors ${c.border}`}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-display font-semibold ${trend >= 0 ? 'text-accent' : 'text-danger'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-ink">{value}</p>
        <p className="text-sm font-semibold text-ink-muted mt-0.5">{title}</p>
        {sub && <p className="text-xs text-ink-faint mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ name, size = 'md', color = 'accent' }) {
  const initials = name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
  const sizes = { xs: 'w-6 h-6 text-[10px]', sm: 'w-8 h-8 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' };
  const colors = {
    accent: 'bg-accent-muted text-accent',
    primary: 'bg-primary-muted text-primary',
    warn: 'bg-warn/10 text-warn',
  };
  return (
    <div className={`rounded-full flex items-center justify-center font-display font-bold ${sizes[size]} ${colors[color] || colors.accent}`}>
      {initials}
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-xl font-display font-bold text-ink">{title}</h2>
        {subtitle && <p className="text-sm text-ink-muted mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

// ── Stars ────────────────────────────────────────────────────────────────────
export function Stars({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          className={`text-xl transition-colors ${n <= value ? 'text-warn' : 'text-ink-faint'}`}
        >★</button>
      ))}
    </div>
  );
}

// ── Tabs ────────────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 bg-bg-surface border border-bg-border rounded-xl p-1">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-display font-semibold transition-all ${
            active === t.id
              ? 'bg-accent text-bg shadow-sm'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          {t.icon}
          {t.label}
          {t.count !== undefined && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${active === t.id ? 'bg-bg/30 text-bg' : 'bg-bg-card text-ink-faint'}`}>
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Search Bar ────────────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-bg-card border border-bg-border rounded-lg pl-9 pr-3 py-2 text-sm text-ink placeholder-ink-faint focus:border-accent/50 outline-none transition-colors"
      />
    </div>
  );
}

// ── Timeline ────────────────────────────────────────────────────────────────────
export function Timeline({ items }) {
  return (
    <div className="relative pl-5 flex flex-col gap-4">
      <div className="absolute left-1.5 top-2 bottom-2 w-px bg-bg-border" />
      {items.map((item, i) => (
        <div key={i} className="relative flex gap-3">
          <div className="absolute -left-[14px] w-2 h-2 rounded-full bg-accent mt-1.5 ring-2 ring-bg-surface" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-ink">{item.note}</p>
            <p className="text-xs text-ink-faint mt-0.5">{new Date(item.time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
