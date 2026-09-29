import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UtensilsCrossed, Lock, Mail, AlertCircle, ShieldCheck, CheckCircle2, KeyRound, ExternalLink, RefreshCw } from 'lucide-react';

export default function LoginPage() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(location.state?.message || '');
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);

  // Forgot / Reset Password state
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState('');
  const [resetErr, setResetErr] = useState('');

  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data && data.database) {
          setDbStatus(data.database);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const cleanEmail = email.trim();
      const cleanPassword = password.trim();
      const res = await login(cleanEmail, cleanPassword);
      if (res.user.role === 'donor') navigate('/donor/dashboard');
      else if (res.user.role === 'recipient') navigate('/recipient/dashboard');
      else if (res.user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetErr('');
    setResetMsg('');
    setResetLoading(true);
    try {
      const res = await resetPassword(resetEmail, resetPasswordVal);
      setSuccessMsg(res.message || 'Password reset successfully! Please sign in with your new password.');
      setEmail(resetEmail.trim());
      setPassword(resetPasswordVal.trim());
      setShowReset(false);
      setResetPasswordVal('');
    } catch (err) {
      setResetErr(err.message || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  const isDisconnectedDb = dbStatus && !dbStatus.isMongoConnected;

  return (
    <div
      className="relative min-h-[90vh] flex items-center justify-center px-4 py-12 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg-auth.jpg')" }}
    >
      {/* Dark gradient backdrop overlay */}
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px]"></div>

      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md p-8 rounded-3xl border border-white/40 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-600/30">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Welcome Back</h2>
          <p className="text-xs text-slate-500">Sign in to your FoodResQ rescue portal</p>
        </div>

        {/* Advisory if current deployment is not connected to MongoDB Atlas */}
        {isDisconnectedDb && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-900 space-y-2 shadow-sm">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Cloud Database Disconnected on this Domain</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              This domain (<code>{typeof window !== 'undefined' ? window.location.hostname : 'current URL'}</code>) is missing <code>MONGODB_URI</code> in Vercel. 
              Registered users and live logins are safely stored in your primary cluster.
            </p>
            <div className="pt-1">
              <a
                href="https://food-res-q-jf52.vercel.app/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                <span>Switch to Live Connected App</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {typeof window !== 'undefined' && window.location.hostname.includes('-projects.vercel.app') && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              Private Preview Link Detected
            </p>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Vercel protects preview URLs with authentication. Please sign in on the official live domain:{' '}
              <a href="https://food-res-q-jf52.vercel.app/login" className="font-bold underline text-amber-900">
                food-res-q-jf52.vercel.app
              </a>
            </p>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!showReset ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.org"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                <button
                  type="button"
                  onClick={() => { setShowReset(true); setResetEmail(email); }}
                  className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Forgot / Reset?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        ) : (
          /* Self-service password reset form */
          <form onSubmit={handleResetSubmit} className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <span>Reset Account Password</span>
              </div>
              <button
                type="button"
                onClick={() => setShowReset(false)}
                className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold"
              >
                Cancel
              </button>
            </div>

            {resetErr && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{resetErr}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Registered Email</label>
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="pp@gmail.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">New Password (min 6 chars)</label>
              <input
                type="password"
                required
                minLength={6}
                value={resetPasswordVal}
                onChange={(e) => setResetPasswordVal(e.target.value)}
                placeholder="Enter new secure password"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={resetLoading}
              className="w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all disabled:opacity-50"
            >
              {resetLoading ? 'Resetting...' : 'Update & Save New Password'}
            </button>
          </form>
        )}

        <div className="pt-4 text-center border-t border-slate-100">
          <Link
            to="/admin/login"
            className="text-[11px] font-semibold text-slate-500 hover:text-emerald-700 inline-flex items-center gap-1.5 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Platform Administrator? Sign in via Secure Admin Portal &rarr;
          </Link>
        </div>

        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-600 font-bold hover:underline">
            Register here
          </Link>
        </p>

      </div>
    </div>
  );
}