import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Button, Modal, StatusBadge, Badge, SearchBar, EmptyState, SectionHeader, Tabs, StatCard } from '../../components/ui';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function fmt(dt) { if (!dt) return '–'; return new Date(dt).toLocaleDateString('en-IN', { dateStyle: 'medium' }); }
function fmtCurr(n) { return '₹' + n.toLocaleString('en-IN'); }

const MONTHS = ['January 2024', 'December 2023', 'November 2023'];

const CHART_DATA = [
  { month: 'Aug', collected: 82000, pending: 12000 },
  { month: 'Sep', collected: 91000, pending: 8000 },
  { month: 'Oct', collected: 78000, pending: 15000 },
  { month: 'Nov', collected: 95000, pending: 5000 },
  { month: 'Dec', collected: 88000, pending: 10000 },
  { month: 'Jan', collected: 72000, pending: 18000 },
];

function PaymentModal({ bill, onClose, onPay }) {
  const [step, setStep] = useState(1); // 1=details, 2=gateway, 3=success
  const [method, setMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);
  const [txnId, setTxnId] = useState('');

  const handlePay = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000)); // simulate gateway
    const id = 'TXN' + Date.now();
    setTxnId(id);
    setProcessing(false);
    setStep(3);
    onPay(bill, id);
  };

  if (step === 3) return (
    <div className="flex flex-col items-center gap-5 py-4">
      <div className="w-16 h-16 rounded-2xl bg-accent-muted flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div className="text-center">
        <h3 className="font-display font-bold text-lg text-ink">Payment Successful!</h3>
        <p className="text-sm text-ink-muted mt-1">Transaction ID: <span className="text-accent font-mono text-xs">{txnId}</span></p>
        <p className="text-2xl font-display font-bold text-accent mt-3">{fmtCurr(bill.total)}</p>
        <p className="text-xs text-ink-faint mt-1">{bill.unit} · {bill.month}</p>
      </div>
      <Button onClick={onClose} className="w-full justify-center">Download Receipt</Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Bill breakdown */}
      <div className="bg-bg-surface rounded-xl p-4 text-sm">
        <div className="flex justify-between font-display font-semibold text-ink mb-3 pb-3 border-b border-bg-border">
          <span>{bill.month}</span><span>{bill.unit}</span>
        </div>
        {[
          { label: 'Maintenance Charge', amount: bill.maintenance },
          { label: 'Water Charges', amount: bill.water },
          { label: 'Parking', amount: bill.parking },
          ...(bill.penalty ? [{ label: 'Late Payment Penalty', amount: bill.penalty }] : []),
        ].map(row => (
          <div key={row.label} className="flex justify-between py-1.5 text-ink-muted">
            <span>{row.label}</span><span className={row.label.includes('Penalty') ? 'text-danger' : ''}>{fmtCurr(row.amount)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-3 mt-3 border-t border-bg-border font-display font-bold text-ink text-base">
          <span>Total</span><span className="text-accent">{fmtCurr(bill.total)}</span>
        </div>
      </div>

      {/* Payment method */}
      <div>
        <p className="text-xs font-display font-semibold text-ink-muted uppercase tracking-wider mb-2">Payment Method</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'upi', label: 'UPI', icon: '⚡' },
            { id: 'card', label: 'Card', icon: '💳' },
            { id: 'netbanking', label: 'Net Banking', icon: '🏦' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border transition-all text-sm font-display font-semibold ${method === m.id ? 'bg-accent-muted border-accent text-accent' : 'bg-bg-card border-bg-border text-ink-muted hover:border-accent/30'}`}
            >
              <span className="text-xl">{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {method === 'upi' && (
        <div className="bg-bg-surface rounded-xl p-4 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-white rounded-xl mx-auto mb-2 flex items-center justify-center text-bg font-mono text-xs font-bold">QR</div>
            <p className="text-xs text-ink-faint">Scan with any UPI app</p>
            <p className="text-sm font-display font-semibold text-ink mt-1">greenvalley@paytm</p>
          </div>
        </div>
      )}

      <Button loading={processing} onClick={handlePay} className="w-full justify-center" size="lg">
        {processing ? 'Processing...' : `Pay ${fmtCurr(bill.total)}`}
      </Button>
    </div>
  );
}

export default function Finance() {
  const { user } = useAuth();
  const { bills, dispatch, toast } = useApp();
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [payModal, setPayModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');

  const myBills = user.role === 'resident' ? bills.filter(b => b.unit === user.unit) : bills;

  const filtered = myBills
    .filter(b => tab === 'all' || b.status === tab)
    .filter(b => search ? b.unit.toLowerCase().includes(search.toLowerCase()) || b.residentName.toLowerCase().includes(search.toLowerCase()) : true);

  const TABS = [
    { id: 'all', label: 'All', count: myBills.length },
    { id: 'pending', label: 'Pending', count: myBills.filter(b => b.status === 'pending').length },
    { id: 'overdue', label: 'Overdue', count: myBills.filter(b => b.status === 'overdue').length },
    { id: 'paid', label: 'Paid', count: myBills.filter(b => b.status === 'paid').length },
  ];

  const totalCollected = myBills.filter(b => b.status === 'paid').reduce((s, b) => s + b.total, 0);
  const totalPending = myBills.filter(b => b.status !== 'paid').reduce((s, b) => s + b.total, 0);
  const overdueBills = myBills.filter(b => b.status === 'overdue');

  const handlePay = (bill, txnId) => {
    dispatch({
      type: 'UPDATE_BILL',
      payload: { id: bill.id, status: 'paid', paidOn: new Date().toISOString().split('T')[0], txnId, receipt: true }
    });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { id: `n${Date.now()}`, type: 'bill', message: `Payment of ${fmtCurr(bill.total)} received for ${bill.unit}.`, time: new Date().toISOString(), read: false, userId: user.id } });
  };

  const detailBill = detailModal ? bills.find(b => b.id === detailModal) : null;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <SectionHeader
        title="Finance & Billing"
        subtitle="Maintenance bills, payments, and financial reports"
        actions={
          user.role === 'management' && (
            <Button variant="secondary" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}>
              Export Report
            </Button>
          )
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard title="Total Collected" value={fmtCurr(totalCollected)} sub="Current cycle" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>} color="accent" />
        <StatCard title="Pending" value={fmtCurr(totalPending)} sub={`${myBills.filter(b => b.status !== 'paid').length} bills outstanding`} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} color="warn" />
        <StatCard title="Overdue Bills" value={overdueBills.length} sub="Requires immediate action" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>} color={overdueBills.length > 0 ? 'danger' : 'accent'} />
        <StatCard title="Collection Rate" value={`${Math.round((myBills.filter(b => b.status === 'paid').length / myBills.length) * 100)}%`} sub="Bills settled" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} color="primary" />
      </div>

      {/* Chart – management only */}
      {user.role === 'management' && (
        <div className="bg-bg-card border border-bg-border rounded-xl p-5">
          <p className="font-display font-semibold text-sm text-ink mb-5">6-Month Collection Overview</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={CHART_DATA} barGap={4}>
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
              <Tooltip
                contentStyle={{ background: '#1A1F35', border: '1px solid #252A42', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#E2E8F0', fontFamily: 'Syne', fontWeight: 600 }}
                formatter={(v, n) => [fmtCurr(v), n === 'collected' ? 'Collected' : 'Pending']}
              />
              <Bar dataKey="collected" fill="#6EE7B7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" fill="#FCD34D" radius={[4, 4, 0, 0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-ink-muted"><span className="w-3 h-3 rounded-sm bg-accent inline-block" />Collected</div>
            <div className="flex items-center gap-1.5 text-xs text-ink-muted"><span className="w-3 h-3 rounded-sm bg-warn/70 inline-block" />Pending</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {user.role === 'management' && (
          <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search by unit or resident..." /></div>
        )}
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>

      {/* Bills table */}
      <div className="bg-bg-card border border-bg-border rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
            title="No bills found"
            subtitle="Bills will appear here once generated"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-bg-border">
                  {user.role === 'management' && <th className="text-left px-5 py-3 text-ink-faint font-display">Resident</th>}
                  <th className="text-left px-5 py-3 text-ink-faint font-display">Month</th>
                  <th className="text-left px-5 py-3 text-ink-faint font-display hidden sm:table-cell">Breakdown</th>
                  <th className="text-right px-5 py-3 text-ink-faint font-display">Amount</th>
                  <th className="text-left px-5 py-3 text-ink-faint font-display">Status</th>
                  <th className="text-left px-5 py-3 text-ink-faint font-display hidden md:table-cell">Paid On</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border">
                {filtered.map(b => (
                  <tr key={b.id} className="transition-colors">
                    {user.role === 'management' && (
                      <td className="px-5 py-3">
                        <p className="text-sm font-semibold text-ink">{b.unit}</p>
                        <p className="text-xs text-ink-faint">{b.residentName}</p>
                      </td>
                    )}
                    <td className="px-5 py-3 text-sm text-ink">{b.month}</td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-xs text-ink-faint">Maint: {fmtCurr(b.maintenance)}</span>
                        <span className="text-xs text-ink-faint">Water: {fmtCurr(b.water)}</span>
                        {b.parking > 0 && <span className="text-xs text-ink-faint">Parking: {fmtCurr(b.parking)}</span>}
                        {b.penalty > 0 && <span className="text-xs text-danger">Penalty: {fmtCurr(b.penalty)}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="font-display font-bold text-sm text-ink">{fmtCurr(b.total)}</span>
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-5 py-3 hidden md:table-cell text-sm text-ink-muted">{fmt(b.paidOn)}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setDetailModal(b.id)} className="text-xs text-ink-faint hover:text-ink">View</button>
                        {b.status !== 'paid' && (user.role === 'resident') && (
                          <button onClick={() => setPayModal(b)} className="text-xs text-accent hover:underline font-semibold">Pay Now</button>
                        )}
                        {b.receipt && <button className="text-xs text-primary hover:underline">Receipt</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <Modal open={!!payModal} onClose={() => setPayModal(null)} title="Pay Maintenance Bill">
        {payModal && <PaymentModal bill={payModal} onClose={() => setPayModal(null)} onPay={handlePay} />}
      </Modal>

      {/* Detail Modal */}
      {detailBill && (
        <Modal open={!!detailModal} onClose={() => setDetailModal(null)} title="Bill Details">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-display font-bold text-lg text-ink">{detailBill.month}</p>
                <p className="text-sm text-ink-muted">{detailBill.unit} · {detailBill.residentName}</p>
              </div>
              <StatusBadge status={detailBill.status} />
            </div>
            <div className="bg-bg-surface rounded-xl divide-y divide-bg-border overflow-hidden">
              {[
                { label: 'Maintenance Charge', value: fmtCurr(detailBill.maintenance) },
                { label: 'Water Charges', value: fmtCurr(detailBill.water) },
                { label: 'Parking', value: fmtCurr(detailBill.parking) },
                ...(detailBill.penalty ? [{ label: 'Late Penalty', value: fmtCurr(detailBill.penalty), danger: true }] : []),
              ].map(r => (
                <div key={r.label} className="flex justify-between px-4 py-2.5 text-sm">
                  <span className="text-ink-muted">{r.label}</span>
                  <span className={r.danger ? 'text-danger font-semibold' : 'text-ink'}>{r.value}</span>
                </div>
              ))}
              <div className="flex justify-between px-4 py-3 font-display font-bold text-base">
                <span className="text-ink">Total</span>
                <span className="text-accent">{fmtCurr(detailBill.total)}</span>
              </div>
            </div>
            {detailBill.txnId && (
              <div className="bg-accent-muted/30 border border-accent/20 rounded-xl px-4 py-3 text-sm">
                <p className="text-xs text-ink-faint mb-1">Transaction ID</p>
                <p className="font-mono text-accent text-xs">{detailBill.txnId}</p>
                <p className="text-xs text-ink-faint mt-2">Paid on {fmt(detailBill.paidOn)}</p>
              </div>
            )}
            {detailBill.status !== 'paid' && user.role === 'resident' && (
              <Button className="w-full justify-center" onClick={() => { setDetailModal(null); setPayModal(detailBill); }}>
                Pay {fmtCurr(detailBill.total)}
              </Button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
