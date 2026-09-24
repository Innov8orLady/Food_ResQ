import React from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Home, LogIn } from 'lucide-react';

export default function RouteGuard({ allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-semibold text-slate-600">Verifying security session...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in, but role is not allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If attempting to access the Admin Console with non-admin privileges
    if (location.pathname.startsWith('/admin')) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-3xl p-8 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/10">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-400 bg-rose-950/80 border border-rose-800 px-3 py-1 rounded-full">
              403 • Restricted Access
            </span>

            <h2 className="text-2xl font-black mt-3">Administrator Privileges Required</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Your account (<span className="text-slate-200 font-semibold">{user.email}</span>) is assigned the role <span className="font-bold text-emerald-400 uppercase">{user.role}</span>. You do not possess central command clearances to view or modify platform administration records.
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              <Link
                to={`/${user.role}/dashboard`}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
              >
                <Home className="w-4 h-4" /> Return to My Portal
              </Link>
              <Link
                to="/admin/login"
                className="w-full py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In with Admin Credentials
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}