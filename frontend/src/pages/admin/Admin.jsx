import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button, Input, Select, Modal, StatusBadge, Badge, SearchBar, SectionHeader, StatCard, Avatar } from '../../components/ui';
import { UNITS } from '../../data/seed';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const SYSTEM_HEALTH = [
  { label: 'API Server', status: 'online', latency: '12ms' },
  { label: 'Database', status: 'online', latency: '3ms' },
  { label: 'Email Service', status: 'online', latency: '—' },
  { label: 'Payment Gateway', status: 'online', latency: '45ms' },
  { label: 'Storage', status: 'online', latency: '8ms' },
  { label: 'Backup', status: 'online', latency: 'Last: 2h ago' },
];

const ROLE_COLORS = { management: '#6EE7B7', resident: '#818CF8', staff: '#FCD34D' };

export default function Admin() {
  const { users, bills, maintenance, visitors, dispatch, toast } = useApp();
  const [activeTab, setActiveTab] = useState('users');
  const [search, setSearch] = useState('');
  const [addUserModal, setAddUserModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', phone: '', unit: '', role: 'resident', password: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const setForm = (k) => (e) => setUserForm(f => ({ ...f, [k]: e.target.value }));

  const filteredUsers = users.filter(u =>
    search ? u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.unit.toLowerCase().includes(search.toLowerCase()) : true
  );

  const roleData = [
    { name: 'Management', value: users.filter(u => u.role === 'management').length },
    { name: 'Resident', value: users.filter(u => u.role === 'resident').length },
    { name: 'Staff', value: users.filter(u => u.role === 'staff').length },
  ];

  const handleAddUser = () => {
    if (!userForm.name || !userForm.email || !userForm.unit) return;
    dispatch({
      type: 'ADD_USER',
      payload: { id: `u${Date.now()}`, ...userForm, avatar: userForm.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2), verified: true }
    });
    toast('User added successfully');
    setAddUserModal(false);
    setUserForm({ name: '', email: '', phone: '', unit: '', role: 'resident', password: '' });
  };

  const handleEditUser = () => {
    if (!editUser) return;
    dispatch({ type: 'UPDATE_USER', payload: { id: editUser.id, ...userForm } });
    toast('User updated');
    setEditUser(null);
  };

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_USER', payload: id });
    toast('User removed');
    setConfirmDelete(null);
  };

  const openEdit = (u) => {
    setUserForm({ name: u.name, email: u.email, phone: u.phone || '', unit: u.unit, role: u.role, password: '' });
    setEditUser(u);
  };

  const TABS = [
    { id: 'users', label: 'Users' },
    { id: 'units', label: 'Units' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'system', label: 'System' },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <SectionHeader
        title="Administration"
        subtitle="User management, system configuration, and analytics"
      />

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Total Users" value={users.length} sub={`${users.filter(u => u.role === 'resident').length} residents`}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} color="accent" />
        <StatCard title="Occupied Units" value={UNITS.filter(u => u.status === 'occupied').length} sub={`of ${UNITS.length} total units`}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>} color="primary" />
        <StatCard title="Open Issues" value={maintenance.filter(m => m.status !== 'resolved').length} sub="Maintenance requests"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>} color="warn" />
        <StatCard title="Collection Rate" value={`${Math.round((bills.filter(b => b.status === 'paid').length / bills.length) * 100)}%`} sub="Bills collected"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} color="accent" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-bg-border">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setActiveTab(t.id); setSearch(''); }}
            className={`px-4 py-2.5 text-sm font-display font-semibold border-b-2 transition-all -mb-px ${activeTab === t.id ? 'border-accent text-accent' : 'border-transparent text-ink-muted hover:text-ink'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search users..." /></div>
            <Button size="sm" onClick={() => setAddUserModal(true)} icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}>Add User</Button>
          </div>
          <div className="bg-bg-card border border-bg-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr className="border-b border-bg-border">
                    <th className="text-left px-5 py-3 text-ink-faint font-display">User</th>
                    <th className="text-left px-5 py-3 text-ink-faint font-display">Unit</th>
                    <th className="text-left px-5 py-3 text-ink-faint font-display">Role</th>
                    <th className="text-left px-5 py-3 text-ink-faint font-display hidden md:table-cell">Contact</th>
                    <th className="text-left px-5 py-3 text-ink-faint font-display">Status</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bg-border">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} size="sm" color={u.role === 'management' ? 'accent' : u.role === 'staff' ? 'warn' : 'primary'} />
                          <div>
                            <p className="text-sm font-semibold text-ink">{u.name}</p>
                            <p className="text-xs text-ink-faint">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-ink">{u.unit}</td>
                      <td className="px-5 py-3">
                        <Badge variant={u.role === 'management' ? 'success' : u.role === 'staff' ? 'warning' : 'primary'} size="xs">
                          {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell text-sm text-ink-muted">{u.phone || '—'}</td>
                      <td className="px-5 py-3"><StatusBadge status={u.verified ? 'active' : 'inactive'} /></td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => openEdit(u)} className="text-xs text-accent hover:underline">Edit</button>
                          <button onClick={() => setConfirmDelete(u)} className="text-xs text-danger hover:underline">Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Units Tab */}
      {activeTab === 'units' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {UNITS.map(u => (
            <div key={u.id} className="bg-bg-card border border-bg-border rounded-xl p-4 hover:border-accent/20 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display font-bold text-base text-ink">{u.number}</p>
                  <p className="text-xs text-ink-faint mt-0.5">Block {u.block} · Floor {u.floor} · {u.type}</p>
                </div>
                <StatusBadge status={u.status} />
              </div>
              <div className="mt-3 pt-3 border-t border-bg-border text-xs text-ink-muted">
                <p>Owner: <span className="text-ink">{u.owner}</span></p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Role distribution */}
          <div className="bg-bg-card border border-bg-border rounded-xl p-5">
            <p className="font-display font-semibold text-sm text-ink mb-4">User Distribution</p>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={roleData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={3} dataKey="value">
                    {roleData.map((_, i) => (
                      <Cell key={i} fill={Object.values(ROLE_COLORS)[i]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1A1F35', border: '1px solid #252A42', borderRadius: 6, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {roleData.map((r, i) => (
                  <div key={r.name} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: Object.values(ROLE_COLORS)[i] }} />
                    <span className="text-ink-muted">{r.name}</span>
                    <span className="font-display font-bold text-ink ml-auto">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Maintenance stats */}
          <div className="bg-bg-card border border-bg-border rounded-xl p-5">
            <p className="font-display font-semibold text-sm text-ink mb-4">Maintenance Summary</p>
            {[
              { label: 'Total Requests', value: maintenance.length },
              { label: 'Resolved', value: maintenance.filter(m => m.status === 'resolved').length },
              { label: 'In Progress', value: maintenance.filter(m => m.status === 'in-progress').length },
              { label: 'Open', value: maintenance.filter(m => m.status === 'open').length },
              { label: 'Avg. Rating', value: (() => { const rated = maintenance.filter(m => m.rating); return rated.length ? (rated.reduce((s, m) => s + m.rating, 0) / rated.length).toFixed(1) + ' ★' : '—'; })() },
            ].map(s => (
              <div key={s.label} className="flex justify-between py-2 border-b border-bg-border/50 last:border-0 text-sm">
                <span className="text-ink-muted">{s.label}</span>
                <span className="font-display font-semibold text-ink">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Visitor stats */}
          <div className="bg-bg-card border border-bg-border rounded-xl p-5">
            <p className="font-display font-semibold text-sm text-ink mb-4">Visitor Statistics</p>
            {[
              { label: 'Total Visitors', value: visitors.length },
              { label: 'Currently Inside', value: visitors.filter(v => v.status === 'inside').length },
              { label: 'Pre-approved', value: visitors.filter(v => v.status === 'pre-approved').length },
              { label: 'Pre-approved Rate', value: `${Math.round((visitors.filter(v => v.preApproved).length / visitors.length) * 100)}%` },
            ].map(s => (
              <div key={s.label} className="flex justify-between py-2 border-b border-bg-border/50 last:border-0 text-sm">
                <span className="text-ink-muted">{s.label}</span>
                <span className="font-display font-semibold text-ink">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Financial */}
          <div className="bg-bg-card border border-bg-border rounded-xl p-5">
            <p className="font-display font-semibold text-sm text-ink mb-4">Financial Overview</p>
            {[
              { label: 'Total Billed', value: '₹' + bills.reduce((s, b) => s + b.total, 0).toLocaleString('en-IN') },
              { label: 'Collected', value: '₹' + bills.filter(b => b.status === 'paid').reduce((s, b) => s + b.total, 0).toLocaleString('en-IN'), accent: true },
              { label: 'Outstanding', value: '₹' + bills.filter(b => b.status !== 'paid').reduce((s, b) => s + b.total, 0).toLocaleString('en-IN'), danger: true },
              { label: 'Collection Rate', value: `${Math.round((bills.filter(b => b.status === 'paid').length / bills.length) * 100)}%` },
            ].map(s => (
              <div key={s.label} className="flex justify-between py-2 border-b border-bg-border/50 last:border-0 text-sm">
                <span className="text-ink-muted">{s.label}</span>
                <span className={`font-display font-semibold ${s.accent ? 'text-accent' : s.danger ? 'text-danger' : 'text-ink'}`}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div className="flex flex-col gap-4">
          <div className="bg-bg-card border border-bg-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-bg-border">
              <p className="font-display font-semibold text-sm text-ink">System Health Monitor</p>
              <p className="text-xs text-ink-faint mt-0.5">All systems operational</p>
            </div>
            <div className="divide-y divide-bg-border">
              {SYSTEM_HEALTH.map(s => (
                <div key={s.label} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${s.status === 'online' ? 'bg-accent' : 'bg-danger'}`} style={{ boxShadow: s.status === 'online' ? '0 0 6px rgba(110,231,183,0.5)' : 'none' }} />
                    <span className="text-sm text-ink">{s.label}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-ink-faint font-mono">{s.latency}</span>
                    <Badge variant={s.status === 'online' ? 'success' : 'danger'} size="xs">
                      {s.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-bg-card border border-bg-border rounded-xl p-5">
            <p className="font-display font-semibold text-sm text-ink mb-4">Configuration</p>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Society Name', value: 'Green Valley Society' },
                { label: 'Total Units', value: '8' },
                { label: 'Maintenance Cycle', value: 'Monthly' },
                { label: 'Late Penalty', value: '₹300 after 10th' },
                { label: 'Visitor Log Retention', value: '90 days' },
                { label: 'App Version', value: 'v1.0.0' },
              ].map(c => (
                <div key={c.label} className="flex justify-between py-2 border-b border-bg-border/50 last:border-0 text-sm">
                  <span className="text-ink-muted">{c.label}</span>
                  <span className="text-ink font-display font-semibold">{c.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <Modal open={addUserModal} onClose={() => setAddUserModal(false)} title="Add New User">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Input label="Full Name" value={userForm.name} onChange={setForm('name')} placeholder="Full name" /></div>
            <Input label="Email" type="email" value={userForm.email} onChange={setForm('email')} placeholder="email@example.com" />
            <Input label="Phone" value={userForm.phone} onChange={setForm('phone')} placeholder="+91 98765..." />
            <Input label="Unit" value={userForm.unit} onChange={setForm('unit')} placeholder="A-101" />
            <Select label="Role" value={userForm.role} onChange={setForm('role')}>
              <option value="resident">Resident</option>
              <option value="staff">Staff</option>
              <option value="management">Management</option>
            </Select>
            <div className="col-span-2"><Input label="Initial Password" type="password" value={userForm.password} onChange={setForm('password')} placeholder="Temporary password" /></div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setAddUserModal(false)}>Cancel</Button>
            <Button onClick={handleAddUser}>Add User</Button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Input label="Full Name" value={userForm.name} onChange={setForm('name')} /></div>
            <Input label="Email" type="email" value={userForm.email} onChange={setForm('email')} />
            <Input label="Phone" value={userForm.phone} onChange={setForm('phone')} />
            <Input label="Unit" value={userForm.unit} onChange={setForm('unit')} />
            <Select label="Role" value={userForm.role} onChange={setForm('role')}>
              <option value="resident">Resident</option>
              <option value="staff">Staff</option>
              <option value="management">Management</option>
            </Select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={handleEditUser}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Remove User" size="sm">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-muted">Remove <span className="text-ink font-semibold">{confirmDelete?.name}</span> ({confirmDelete?.unit}) from the system? This cannot be undone.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => handleDelete(confirmDelete?.id)}>Remove User</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
