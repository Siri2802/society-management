import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Button, Input, Select, Textarea, Modal, StatusBadge, PriorityBadge, Badge, SearchBar, EmptyState, SectionHeader, Tabs, Avatar, Stars, Timeline } from '../../components/ui';

const CATEGORIES = ['Plumbing', 'Electrical', 'HVAC', 'Elevator', 'Common Area', 'Structural', 'Pest Control', 'Security', 'Other'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

function fmt(dt) {
  if (!dt) return '–';
  return new Date(dt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function Maintenance() {
  const { user } = useAuth();
  const { maintenance, users, dispatch, toast } = useApp();
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [detail, setDetail] = useState(null);
  const [assignModal, setAssignModal] = useState(null);
  const [ratingFor, setRatingFor] = useState(null);
  const [rating, setRating] = useState(0);
  const [workNote, setWorkNote] = useState('');
  const [form, setForm] = useState({ title: '', description: '', category: '', priority: 'medium', unit: user.role === 'resident' ? user.unit : '' });
  const [formErrors, setFormErrors] = useState({});
  const [assignTo, setAssignTo] = useState('');

  const staff = users.filter(u => u.role === 'staff');
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const TABS = [
    { id: 'all', label: 'All' },
    { id: 'open', label: 'Open' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'resolved', label: 'Resolved' },
  ];

  const filtered = maintenance
    .filter(m => tab === 'all' || m.status === tab)
    .filter(m => user.role === 'resident' ? m.residentId === user.id : user.role === 'staff' ? m.assignedTo === user.id || m.status === 'open' : true)
    .filter(m => search ? m.title.toLowerCase().includes(search.toLowerCase()) || m.unit.toLowerCase().includes(search.toLowerCase()) : true);

  const tabsWithCount = TABS.map(t => ({
    ...t,
    count: maintenance
      .filter(m => t.id === 'all' || m.status === t.id)
      .filter(m => user.role === 'resident' ? m.residentId === user.id : user.role === 'staff' ? m.assignedTo === user.id || m.status === 'open' : true)
      .length
  }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Required';
    if (!form.description.trim()) e.description = 'Required';
    if (!form.category) e.category = 'Required';
    if (!form.unit.trim()) e.unit = 'Required';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = () => {
    if (!validate()) return;
    const req = {
      id: `mr${Date.now()}`,
      ...form,
      residentId: user.id,
      residentName: user.name,
      status: 'open',
      assignedTo: null, assignedName: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rating: null,
      workLog: [],
    };
    dispatch({ type: 'ADD_MAINTENANCE', payload: req });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { id: `n${Date.now()}`, type: 'maintenance', message: `New request "${req.title}" submitted by ${user.name}.`, time: new Date().toISOString(), read: false, userId: 'u4' } });
    toast('Maintenance request submitted');
    setShowAdd(false);
    setForm({ title: '', description: '', category: '', priority: 'medium', unit: user.role === 'resident' ? user.unit : '' });
  };

  const handleAssign = () => {
    if (!assignTo) return;
    const s = staff.find(s => s.id === assignTo);
    const now = new Date().toISOString();
    dispatch({
      type: 'UPDATE_MAINTENANCE',
      payload: {
        id: assignModal.id, assignedTo: assignTo, assignedName: s?.name,
        status: 'in-progress', updatedAt: now,
        workLog: [...(assignModal.workLog || []), { time: now, note: `Assigned to ${s?.name}` }]
      }
    });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { id: `n${Date.now()}`, type: 'maintenance', message: `Your request "${assignModal.title}" has been assigned to ${s?.name}.`, time: now, read: false, userId: assignModal.residentId } });
    toast('Request assigned successfully');
    setAssignModal(null); setAssignTo('');
    setDetail(null);
  };

  const handleWorkLog = (m) => {
    if (!workNote.trim()) return;
    const now = new Date().toISOString();
    dispatch({
      type: 'UPDATE_MAINTENANCE',
      payload: { id: m.id, updatedAt: now, workLog: [...(m.workLog || []), { time: now, note: workNote }] }
    });
    toast('Work log updated');
    setWorkNote('');
    // Refresh detail
    setDetail(maintenance.find(x => x.id === m.id)?.id);
  };

  const handleResolve = (m) => {
    const now = new Date().toISOString();
    dispatch({
      type: 'UPDATE_MAINTENANCE',
      payload: { id: m.id, status: 'resolved', updatedAt: now, workLog: [...(m.workLog || []), { time: now, note: 'Issue resolved and closed.' }] }
    });
    toast('Request marked as resolved');
    setDetail(null);
  };

  const handleRate = (m) => {
    dispatch({ type: 'UPDATE_MAINTENANCE', payload: { id: m.id, rating } });
    toast('Thank you for your feedback!');
    setRatingFor(null); setRating(0);
    setDetail(null);
  };

  const detailItem = detail ? maintenance.find(m => m.id === detail) : null;

  const prioritySort = { urgent: 0, high: 1, medium: 2, low: 3 };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <SectionHeader
        title="Maintenance & Complaints"
        subtitle="Service requests, task assignment, and resolution tracking"
        actions={
          (user.role === 'resident' || user.role === 'management') && (
            <Button onClick={() => setShowAdd(true)} icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}>
              New Request
            </Button>
          )
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Open', value: maintenance.filter(m => m.status === 'open').length, color: 'text-primary' },
          { label: 'In Progress', value: maintenance.filter(m => m.status === 'in-progress').length, color: 'text-warn' },
          { label: 'Resolved', value: maintenance.filter(m => m.status === 'resolved').length, color: 'text-accent' },
          { label: 'Urgent/High', value: maintenance.filter(m => ['urgent', 'high'].includes(m.priority) && m.status !== 'resolved').length, color: 'text-danger' },
        ].map(s => (
          <div key={s.label} className="bg-bg-card border border-bg-border rounded-xl px-4 py-3">
            <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-ink-muted mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search by title or unit..." /></div>
        <Tabs tabs={tabsWithCount} active={tab} onChange={setTab} />
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>}
            title="No requests found"
            subtitle="Submit a new maintenance request or adjust filters"
          />
        ) : (
          [...filtered].sort((a, b) => (prioritySort[a.priority] ?? 3) - (prioritySort[b.priority] ?? 3)).map(m => (
            <div
              key={m.id}
              onClick={() => setDetail(m.id)}
              className="bg-bg-card border border-bg-border rounded-xl p-5 cursor-pointer hover:border-accent/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <PriorityBadge priority={m.priority} />
                    <Badge variant="default" size="xs">{m.category}</Badge>
                    {m.rating && <span className="text-xs text-warn">{'★'.repeat(m.rating)}</span>}
                  </div>
                  <h3 className="font-display font-semibold text-sm text-ink mt-2">{m.title}</h3>
                  <p className="text-xs text-ink-muted mt-1 line-clamp-2">{m.description}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-ink-faint">
                    <span>{m.unit}</span>
                    <span>·</span>
                    <span>{m.residentName}</span>
                    {m.assignedName && <><span>·</span><span className="text-accent">↪ {m.assignedName}</span></>}
                    <span>·</span>
                    <span>{fmt(m.createdAt)}</span>
                  </div>
                </div>
                <StatusBadge status={m.status} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Request Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Submit Maintenance Request">
        <div className="flex flex-col gap-4">
          <Input label="Issue Title" value={form.title} onChange={set('title')} placeholder="Brief description" error={formErrors.title} />
          <Textarea label="Description" value={form.description} onChange={set('description')} placeholder="Detailed explanation of the issue..." rows={3} error={formErrors.description} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Category" value={form.category} onChange={set('category')} error={formErrors.category}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select label="Priority" value={form.priority} onChange={set('priority')}>
              {PRIORITIES.map(p => <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </Select>
            {user.role !== 'resident' && (
              <Input label="Unit" value={form.unit} onChange={set('unit')} placeholder="A-401" error={formErrors.unit} />
            )}
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Submit Request</Button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      {detailItem && (
        <Modal open={!!detail} onClose={() => { setDetail(null); setWorkNote(''); }} title="Request Details" size="lg">
          <div className="flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <PriorityBadge priority={detailItem.priority} />
                  <Badge variant="default" size="xs">{detailItem.category}</Badge>
                  <StatusBadge status={detailItem.status} />
                </div>
                <h3 className="font-display font-bold text-base text-ink mt-2">{detailItem.title}</h3>
                <p className="text-sm text-ink-muted mt-1">{detailItem.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-bg-surface rounded-xl p-4 text-sm">
              <div><p className="text-[10px] font-display font-semibold text-ink-faint uppercase tracking-wider">Unit</p><p className="text-ink mt-0.5">{detailItem.unit}</p></div>
              <div><p className="text-[10px] font-display font-semibold text-ink-faint uppercase tracking-wider">Resident</p><p className="text-ink mt-0.5">{detailItem.residentName}</p></div>
              <div><p className="text-[10px] font-display font-semibold text-ink-faint uppercase tracking-wider">Assigned To</p><p className="text-ink mt-0.5">{detailItem.assignedName || '—'}</p></div>
              <div><p className="text-[10px] font-display font-semibold text-ink-faint uppercase tracking-wider">Submitted</p><p className="text-ink mt-0.5">{fmt(detailItem.createdAt)}</p></div>
            </div>

            {/* Work Log */}
            {detailItem.workLog?.length > 0 && (
              <div>
                <p className="text-xs font-display font-semibold text-ink-muted uppercase tracking-wider mb-3">Work Log</p>
                <Timeline items={detailItem.workLog} />
              </div>
            )}

            {/* Rating */}
            {detailItem.status === 'resolved' && detailItem.rating && (
              <div className="bg-warn/5 border border-warn/20 rounded-xl p-4">
                <p className="text-xs text-ink-muted mb-1">Resident Rating</p>
                <Stars value={detailItem.rating} />
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-bg-border">
              {/* Assign – management only */}
              {user.role === 'management' && detailItem.status !== 'resolved' && (
                <Button variant="secondary" size="sm" onClick={() => { setAssignModal(detailItem); setDetail(null); }}>Assign Staff</Button>
              )}
              {/* Work log update – staff */}
              {(user.role === 'staff' || user.role === 'management') && detailItem.status !== 'resolved' && (
                <div className="flex-1 flex gap-2">
                  <input
                    value={workNote}
                    onChange={e => setWorkNote(e.target.value)}
                    placeholder="Add work note..."
                    className="flex-1 bg-bg-card border border-bg-border rounded-lg px-3 py-1.5 text-sm text-ink placeholder-ink-faint outline-none focus:border-accent/50"
                  />
                  <Button size="sm" onClick={() => handleWorkLog(detailItem)}>Add</Button>
                </div>
              )}
              {/* Resolve */}
              {(user.role === 'staff' || user.role === 'management') && detailItem.status !== 'resolved' && (
                <Button variant="primary" size="sm" onClick={() => handleResolve(detailItem)}>Mark Resolved</Button>
              )}
              {/* Rate – resident, resolved, unrated */}
              {user.role === 'resident' && detailItem.status === 'resolved' && !detailItem.rating && (
                <Button size="sm" onClick={() => { setRatingFor(detailItem); setDetail(null); }}>Rate Service</Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Assign Modal */}
      <Modal open={!!assignModal} onClose={() => setAssignModal(null)} title="Assign Staff Member">
        <div className="flex flex-col gap-4">
          <Select label="Select Staff" value={assignTo} onChange={e => setAssignTo(e.target.value)}>
            <option value="">Choose staff member</option>
            {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setAssignModal(null)}>Cancel</Button>
            <Button onClick={handleAssign}>Assign</Button>
          </div>
        </div>
      </Modal>

      {/* Rating Modal */}
      <Modal open={!!ratingFor} onClose={() => { setRatingFor(null); setRating(0); }} title="Rate Service Quality">
        <div className="flex flex-col gap-5">
          <p className="text-sm text-ink-muted">How was the service for: <span className="text-ink font-semibold">{ratingFor?.title}</span>?</p>
          <div className="flex justify-center">
            <Stars value={rating} onChange={setRating} />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => { setRatingFor(null); setRating(0); }}>Skip</Button>
            <Button onClick={() => handleRate(ratingFor)} disabled={!rating}>Submit Rating</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
