import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { StatCard, Card, Badge, StatusBadge, Avatar, PriorityBadge } from '../../components/ui';
import { useNavigate } from 'react-router-dom';

function QuickStat({ label, value, max, color }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-xs">
        <span className="text-ink-muted">{label}</span>
        <span className="font-semibold text-ink">{value}/{max}</span>
      </div>
      <div className="h-1.5 bg-bg-border rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { visitors, maintenance, bills, announcements, forum } = useApp();
  const navigate = useNavigate();

  const today = new Date().toDateString();
  const visitorsToday = visitors.filter(v => v.checkIn && new Date(v.checkIn).toDateString() === today).length;
  const inside = visitors.filter(v => v.status === 'inside').length;
  const openMaint = maintenance.filter(m => m.status === 'open').length;
  const inProgressMaint = maintenance.filter(m => m.status === 'in-progress').length;
  const pendingBills = bills.filter(b => b.status === 'pending' || b.status === 'overdue').length;
  const totalBills = bills.length;
  const paidBills = bills.filter(b => b.status === 'paid').length;
  const totalCollection = bills.filter(b => b.status === 'paid').reduce((s, b) => s + b.total, 0);
  const pinnedAnn = announcements.filter(a => a.pinned);

  // Role-specific stats
  const residentBills = bills.filter(b => user.role === 'resident' ? b.unit === user.unit : true);
  const myMaint = maintenance.filter(m => user.role === 'resident' ? m.residentId === user.id : user.role === 'staff' ? m.assignedTo === user.id : true);

  const recentActivity = [
    ...visitors.filter(v => v.checkIn).slice(0, 3).map(v => ({
      type: 'visitor', icon: '👤', text: `${v.name} ${v.status === 'inside' ? 'checked in at' : 'visited'} ${v.hostUnit}`,
      time: v.checkIn, color: 'text-accent'
    })),
    ...maintenance.slice(0, 3).map(m => ({
      type: 'maint', icon: '🔧', text: `${m.title} – ${m.status}`, time: m.updatedAt, color: 'text-warn'
    })),
    ...announcements.slice(0, 2).map(a => ({
      type: 'ann', icon: '📢', text: a.title, time: a.postedAt, color: 'text-primary'
    })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-ink">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user.name.split(' ')[0]} 👋</h2>
          <p className="text-sm text-ink-muted mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-bg-card border border-bg-border rounded-xl px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-display font-semibold text-ink-muted">Live System</span>
        </div>
      </div>

      {/* Pinned announcements */}
      {pinnedAnn.length > 0 && (
        <div className="flex flex-col gap-2">
          {pinnedAnn.map(a => (
            <div key={a.id} onClick={() => navigate('/communication')} className="flex items-center gap-3 bg-warn/5 border border-warn/20 rounded-xl px-4 py-3 cursor-pointer hover:border-warn/40 transition-colors">
              <span className="text-warn text-base">📌</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink">{a.title}</p>
                <p className="text-xs text-ink-muted truncate">{a.body}</p>
              </div>
              <Badge variant="warning" size="xs">Pinned</Badge>
            </div>
          ))}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard
          title="Visitors Today"
          value={visitorsToday}
          sub={`${inside} currently inside`}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          color="accent"
        />
        <StatCard
          title="Open Requests"
          value={openMaint + inProgressMaint}
          sub={`${openMaint} new, ${inProgressMaint} in progress`}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>}
          color="warn"
        />
        {user.role !== 'staff' && (
          <StatCard
            title="Pending Bills"
            value={pendingBills}
            sub={`₹${totalCollection.toLocaleString('en-IN')} collected`}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
            color={pendingBills > 0 ? 'danger' : 'accent'}
          />
        )}
        <StatCard
          title="Announcements"
          value={announcements.length}
          sub={`${pinnedAnn.length} pinned`}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/></svg>}
          color="primary"
        />
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity feed */}
        <div className="lg:col-span-2 bg-bg-card border border-bg-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-bg-border flex justify-between items-center">
            <h3 className="font-display font-semibold text-sm text-ink">Recent Activity</h3>
            <span className="text-xs text-ink-faint">Live feed</span>
          </div>
          <div className="divide-y divide-bg-border">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-bg-surface/50 transition-colors">
                <span className="text-base mt-0.5">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink">{item.text}</p>
                  <p className="text-xs text-ink-faint mt-0.5">{new Date(item.time).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-4">
          {/* Collection rate */}
          {user.role === 'management' && (
            <div className="bg-bg-card border border-bg-border rounded-xl p-5">
              <p className="font-display font-semibold text-sm text-ink mb-4">Collection Status</p>
              <div className="flex flex-col gap-3">
                <QuickStat label="Paid" value={paidBills} max={totalBills} color="bg-accent" />
                <QuickStat label="Pending" value={bills.filter(b => b.status === 'pending').length} max={totalBills} color="bg-warn" />
                <QuickStat label="Overdue" value={bills.filter(b => b.status === 'overdue').length} max={totalBills} color="bg-danger" />
              </div>
              <div className="mt-4 pt-4 border-t border-bg-border">
                <p className="text-xs text-ink-faint">Total Collected</p>
                <p className="text-xl font-display font-bold text-accent">₹{totalCollection.toLocaleString('en-IN')}</p>
              </div>
            </div>
          )}

          {/* Recent maintenance */}
          <div className="bg-bg-card border border-bg-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-bg-border flex justify-between items-center">
              <p className="font-display font-semibold text-sm text-ink">Maintenance</p>
              <button onClick={() => navigate('/maintenance')} className="text-xs text-accent hover:underline">View all</button>
            </div>
            <div className="divide-y divide-bg-border">
              {myMaint.slice(0, 4).map(m => (
                <div key={m.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink truncate">{m.title}</p>
                    <p className="text-[10px] text-ink-faint mt-0.5">{m.unit}</p>
                  </div>
                  <StatusBadge status={m.status} />
                </div>
              ))}
              {myMaint.length === 0 && <p className="text-xs text-ink-faint px-4 py-4">No requests</p>}
            </div>
          </div>

          {/* Upcoming visitors */}
          <div className="bg-bg-card border border-bg-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-bg-border">
              <p className="font-display font-semibold text-sm text-ink">Expected Visitors</p>
            </div>
            <div className="divide-y divide-bg-border">
              {visitors.filter(v => v.status === 'pre-approved').slice(0, 3).map(v => (
                <div key={v.id} className="px-4 py-3 flex items-center gap-3">
                  <Avatar name={v.name} size="sm" color="primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink truncate">{v.name}</p>
                    <p className="text-[10px] text-ink-faint">{v.hostUnit} · {v.purpose}</p>
                  </div>
                </div>
              ))}
              {visitors.filter(v => v.status === 'pre-approved').length === 0 && (
                <p className="text-xs text-ink-faint px-4 py-4">No expected visitors</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
