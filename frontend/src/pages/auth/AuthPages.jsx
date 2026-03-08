import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/ui';

export function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ 
    role: 'resident', 
    name: '', 
    email: '', 
    phone: '', 
    unit: '', 
    password: '', 
    confirm: '' 
  });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const { register, loginWithGoogle, loading, error, setError, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);
  
  const set = (k) => (e) => {
    if (setError) setError(null);
    setErrors(prev => ({ ...prev, [k]: null }));
    setForm(f => ({ ...f, [k]: e.target.value }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name required';
    if (!form.email.includes('@')) e.email = 'Valid email required';
    if (form.role === 'resident' && !form.unit.trim()) e.unit = 'Unit number required';
    if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const ok = await register(form);
    if (ok) setDone(true);
  };

  const handleGoogleSubmit = async () => {
    const ok = await loginWithGoogle(form.role);
    if (ok) setDone(true);
  };

  if (done) return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="bg-bg-surface border border-bg-border rounded-2xl p-8 max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-accent-muted flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 className="font-display font-bold text-lg text-ink">Registration Successful</h2>
        <p className="text-sm text-ink-muted mt-2">Your account has been created securely. You can now access your dashboard.</p>
        <Link to="/dashboard" className="mt-6 inline-block text-sm text-accent hover:underline">Go to Dashboard</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="fixed inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#6EE7B7 1px, transparent 1px), linear-gradient(90deg, #6EE7B7 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="w-full max-w-md relative">
        <div className="text-center mb-7 animate-fade-in">
          <h1 className="text-2xl font-display font-bold text-ink">Request Access</h1>
          <p className="text-sm text-ink-muted mt-1">Join the community platform</p>
        </div>
        
        <div className="bg-bg-surface border border-bg-border rounded-2xl p-7 animate-fade-in shadow-card">
          
          {step === 1 ? (
            <div className="flex flex-col gap-4 animate-fade-in">
              <h3 className="text-sm font-semibold text-ink-muted mb-2 text-center text-xs uppercase tracking-wider">Step 1: Select your role</h3>
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role: 'resident' }))}
                  className={`p-4 rounded-xl border text-left transition-all ${form.role === 'resident' ? 'border-accent bg-accent/5 shadow-[0_0_15px_rgba(110,231,183,0.1)]' : 'border-bg-border bg-bg-card hover:border-accent/40'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-ink">Resident</h4>
                      <p className="text-xs text-ink-muted mt-0.5">I live in or own a flat in the society.</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role: 'management' }))}
                  className={`p-4 rounded-xl border text-left transition-all ${form.role === 'management' ? 'border-accent bg-accent/5 shadow-[0_0_15px_rgba(110,231,183,0.1)]' : 'border-bg-border bg-bg-card hover:border-accent/40'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 8v4l3 3"/></svg>
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-ink">Management</h4>
                      <p className="text-xs text-ink-muted mt-0.5">I manage the society operations.</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role: 'staff' }))}
                  className={`p-4 rounded-xl border text-left transition-all ${form.role === 'staff' ? 'border-accent bg-accent/5 shadow-[0_0_15px_rgba(110,231,183,0.1)]' : 'border-bg-border bg-bg-card hover:border-accent/40'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M5.5 21v-2a4 4 0 0 1 4-4h5a4 4 0 0 1 4 4v2"/></svg>
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-ink">Staff</h4>
                      <p className="text-xs text-ink-muted mt-0.5">I work for the society (Security, Maintenance).</p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-bg-border"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-bg-surface px-2 text-ink-faint">continue with</span>
                </div>
              </div>

              <button 
                type="button" 
                onClick={handleGoogleSubmit}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-bg-card border border-bg-border hover:border-accent/40 text-ink font-semibold rounded-lg px-4 py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34a853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              
              <Button type="button" onClick={() => setStep(2)} className="w-full justify-center mt-1">
                Email
              </Button>

              {error && (
                <div className="flex items-center gap-2 bg-danger/10 border border-danger/20 rounded-lg px-3 py-2.5 text-sm text-danger mt-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4 animate-fade-in">
               <div className="flex items-center gap-3 mb-2">
                 <button type="button" onClick={() => setStep(1)} className="text-ink-faint hover:text-ink">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                 </button>
                 <span className="text-sm font-semibold text-ink-muted capitalize">Step 2: {form.role} Details</span>
               </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Input label="Full Name" value={form.name} onChange={set('name')} error={errors.name} placeholder="Your name" /></div>
                <div className="col-span-2"><Input label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email} placeholder="you@email.com" /></div>
                
                {form.role === 'resident' && (
                  <div className="col-span-2"><Input label="Flat / Unit No." value={form.unit} onChange={set('unit')} error={errors.unit} placeholder="A-101" /></div>
                )}
                
                <div className="col-span-2"><Input label="Password" type="password" value={form.password} onChange={set('password')} error={errors.password} placeholder="••••••" /></div>
                <div className="col-span-2"><Input label="Confirm Password" type="password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} placeholder="••••••" /></div>
              </div>
              
              {error && (
                <div className="flex items-center gap-2 bg-danger/10 border border-danger/20 rounded-lg px-3 py-2.5 text-sm text-danger mt-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}
              
              <Button type="submit" loading={loading} className="w-full justify-center mt-1">Submit Request</Button>
            </form>
          )}

        </div>
        <p className="text-center text-xs text-ink-faint mt-5">
          Already have access? <Link to="/login" className="text-accent hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const { resetPassword, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    await resetPassword(email);
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-7">
          <h1 className="text-2xl font-display font-bold text-ink">Reset Password</h1>
          <p className="text-sm text-ink-muted mt-1">We'll send a reset link to your email</p>
        </div>
        {done ? (
          <div className="bg-bg-surface border border-accent/30 rounded-2xl p-7 text-center">
            <p className="text-sm text-ink">Check your inbox — a reset link has been sent to <span className="text-accent">{email}</span></p>
            <Link to="/login" className="mt-4 inline-block text-sm text-accent hover:underline">Back to Login</Link>
          </div>
        ) : (
          <div className="bg-bg-surface border border-bg-border rounded-2xl p-7">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              <Button type="submit" loading={loading} className="w-full justify-center">Send Reset Link</Button>
            </form>
            <p className="text-center text-xs text-ink-faint mt-4">
              <Link to="/login" className="text-accent hover:underline">Back to Login</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
