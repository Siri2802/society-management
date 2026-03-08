import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Button, Input, Select, Modal, StatusBadge, Badge, SearchBar, EmptyState, SectionHeader, Tabs, Avatar } from '../../components/ui';

const TAB_CONF = [
  { id: 'all', label: 'All Visitors' },
  { id: 'inside', label: 'Inside' },
  { id: 'pre-approved', label: 'Pre-approved' },
  { id: 'exited', label: 'Exited' },
];

function fmt(dt) {
  if (!dt) return '–';
  return new Date(dt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
}

export default function Visitors() {
  const { user } = useAuth();
  const { visitors, dispatch, toast } = useApp();
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', purpose: '', vehicleNo: '', hostUnit: user.role === 'resident' ? user.unit : '' });
  const [formErrors, setFormErrors] = useState({});

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const filtered = visitors
    .filter(v => tab === 'all' || v.status === tab)
    .filter(v => user.role === 'resident' ? v.hostUnit === user.unit : true)
    .filter(v => search ? v.name.toLowerCase().includes(search.toLowerCase()) || v.hostUnit.toLowerCase().includes(search.toLowerCase()) : true);

  const tabsWithCount = TAB_CONF.map(t => ({
    ...t,
    count: visitors.filter(v => t.id === 'all' || v.status === t.id).filter(v => user.role === 'resident' ? v.hostUnit === user.unit : true).length
  }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!form.purpose.trim()) e.purpose = 'Required';
    if (!form.hostUnit.trim()) e.hostUnit = 'Required';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = () => {
    if (!validate()) return;
    const v = {
      id: `v${Date.now()}`,
      ...form,
      hostName: user.name,
      status: 'pre-approved',
      checkIn: null, checkOut: null,
      preApproved: true,
      approvedBy: user.id,
    };
    dispatch({ type: 'ADD_VISITOR', payload: v });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { id: `n${Date.now()}`, type: 'visitor', message: `Visitor ${v.name} pre-approved for ${v.hostUnit}.`, time: new Date().toISOString(), read: false, userId: user.id } });
    toast('Visitor pre-approved successfully');
    setShowAdd(false);
    setForm({ name: '', phone: '', purpose: '', vehicleNo: '', hostUnit: user.role === 'resident' ? user.unit : '' });
  };

  const handleCheckIn = (v) => {
    dispatch({ type: 'UPDATE_VISITOR', payload: { id: v.id, status: 'inside', checkIn: new Date().toISOString() } });
    toast(`${v.name} checked in`);
    setShowDetail(null);
  };

  const handleCheckOut = (v) => {
    dispatch({ type: 'UPDATE_VISITOR', payload: { id: v.id, status: 'exited', checkOut: new Date().toISOString() } });
    toast(`${v.name} checked out`);
    setShowDetail(null);
  };

  const detail = showDetail ? visitors.find(v => v.id === showDetail) : null;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <SectionHeader
        title="Visitor Management"
        subtitle="Track gate entries, pre-approvals, and visitor logs"
        actions={
          <Button onClick={() => setShowAdd(true)} icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}>
            Pre-approve Visitor
          </Button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Currently Inside', value: visitors.filter(v => v.status === 'inside').length, color: 'text-accent' },
          { label: 'Pre-approved', value: visitors.filter(v => v.status === 'pre-approved').length, color: 'text-primary' },
          { label: 'Today\'s Visitors', value: visitors.filter(v => v.checkIn && new Date(v.checkIn).toDateString() === new Date().toDateString()).length, color: 'text-warn' },
          { label: 'Total Logged', value: visitors.length, color: 'text-ink' },
        ].map(s => (
          <div key={s.label} className="bg-bg-card border border-bg-border rounded-xl px-4 py-3">
            <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-ink-muted mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search by name or unit..." /></div>
        <div className="sm:w-auto overflow-x-auto">
          <Tabs tabs={tabsWithCount} active={tab} onChange={setTab} />
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-bg-card border border-bg-border rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}
            title="No visitors found"
            subtitle="Pre-approve a visitor or adjust your filters"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-bg-border">
                  <th className="text-left px-5 py-3 text-ink-faint font-display">Visitor</th>
                  <th className="text-left px-5 py-3 text-ink-faint font-display">Host</th>
                  <th className="text-left px-5 py-3 text-ink-faint font-display">Purpose</th>
                  <th className="text-left px-5 py-3 text-ink-faint font-display hidden md:table-cell">Check In</th>
                  <th className="text-left px-5 py-3 text-ink-faint font-display hidden md:table-cell">Check Out</th>
                  <th className="text-left px-5 py-3 text-ink-faint font-display">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border">
                {filtered.map(v => (
                  <tr key={v.id} className="transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={v.name} size="sm" color={v.status === 'inside' ? 'accent' : 'primary'} />
                        <div>
                          <p className="text-sm font-semibold text-ink">{v.name}</p>
                          <p className="text-xs text-ink-faint">{v.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm text-ink">{v.hostUnit}</p>
                      <p className="text-xs text-ink-faint">{v.hostName}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm text-ink">{v.purpose}</p>
                      {v.vehicleNo && <p className="text-xs text-ink-faint font-mono">{v.vehicleNo}</p>}
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell text-sm text-ink-muted">{fmt(v.checkIn)}</td>
                    <td className="px-5 py-3 hidden md:table-cell text-sm text-ink-muted">{fmt(v.checkOut)}</td>
                    <td className="px-5 py-3"><StatusBadge status={v.status} /></td>
                    <td className="px-5 py-3">
                      <button onClick={() => setShowDetail(v.id)} className="text-xs text-accent hover:underline">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pre-approve Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Pre-approve Visitor">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Input label="Visitor Name" value={form.name} onChange={set('name')} placeholder="Full name" error={formErrors.name} /></div>
            <Input label="Phone" value={form.phone} onChange={set('phone')} placeholder="+91 98765..." error={formErrors.phone} />
            <Select label="Purpose" value={form.purpose} onChange={set('purpose')} error={formErrors.purpose}>
              <option value="">Select purpose</option>
              {['Personal Visit', 'Delivery', 'Medical Visit', 'Maintenance Work', 'Relative Visit', 'Service'].map(p => <option key={p} value={p}>{p}</option>)}
            </Select>
            {user.role !== 'resident' && (
              <Input label="Host Unit" value={form.hostUnit} onChange={set('hostUnit')} placeholder="A-401" error={formErrors.hostUnit} />
            )}
            <Input label="Vehicle No. (optional)" value={form.vehicleNo} onChange={set('vehicleNo')} placeholder="MH01AB1234" />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Pre-approve</Button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      {detail && (
        <Modal open={!!showDetail} onClose={() => setShowDetail(null)} title="Visitor Details">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <Avatar name={detail.name} size="lg" color="accent" />
              <div>
                <h3 className="font-display font-bold text-lg text-ink">{detail.name}</h3>
                <p className="text-sm text-ink-muted">{detail.phone}</p>
                <div className="mt-1"><StatusBadge status={detail.status} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 bg-bg-surface rounded-xl p-4">
              {[
                { label: 'Host Unit', value: detail.hostUnit },
                { label: 'Host Name', value: detail.hostName },
                { label: 'Purpose', value: detail.purpose },
                { label: 'Vehicle', value: detail.vehicleNo || '—' },
                { label: 'Check In', value: fmt(detail.checkIn) },
                { label: 'Check Out', value: fmt(detail.checkOut) },
              ].map(r => (
                <div key={r.label}>
                  <p className="text-[10px] font-display font-semibold text-ink-faint uppercase tracking-wider">{r.label}</p>
                  <p className="text-sm text-ink mt-0.5">{r.value}</p>
                </div>
              ))}
            </div>
            {(user.role === 'management' || user.role === 'staff') && (
              <div className="flex gap-3">
                {detail.status === 'pre-approved' && (
                  <Button className="flex-1 justify-center" onClick={() => handleCheckIn(detail)}>
                    Check In
                  </Button>
                )}
                {detail.status === 'inside' && (
                  <Button variant="secondary" className="flex-1 justify-center" onClick={() => handleCheckOut(detail)}>
                    Check Out
                  </Button>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
