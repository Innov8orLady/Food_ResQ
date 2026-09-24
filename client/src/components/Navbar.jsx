import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { UtensilsCrossed, Bell, User, LogOut, ChevronDown, Menu, X, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { user, logout, quickDemoLogin } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDemo = async (role) => {
    try {
      await quickDemoLogin(role);
      if (role === 'donor') navigate('/donor/dashboard');
      else if (role === 'recipient') navigate('/recipient/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'donor') return '/donor/dashboard';
    if (user.role === 'recipient') return '/recipient/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/';
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">Food<span className="text-emerald-600">ResQ</span></span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">AI</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-none">Waste Intelligence Platform</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className={`text-sm font-semibold hover:text-emerald-600 transition-colors ${location.pathname === '/' ? 'text-emerald-600' : 'text-slate-600'}`}>Home</Link>
            <Link to="/about" className={`text-sm font-semibold hover:text-emerald-600 transition-colors ${location.pathname === '/about' ? 'text-emerald-600' : 'text-slate-600'}`}>About</Link>
            <Link to="/how-it-works" className={`text-sm font-semibold hover:text-emerald-600 transition-colors ${location.pathname === '/how-it-works' ? 'text-emerald-600' : 'text-slate-600'}`}>How It Works</Link>
            <Link to="/contact" className={`text-sm font-semibold hover:text-emerald-600 transition-colors ${location.pathname === '/contact' ? 'text-emerald-600' : 'text-slate-600'}`}>Contact</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {!user && (
              <div className="flex items-center bg-slate-100/90 rounded-xl p-1 border border-slate-200 text-xs">
                <span className="text-[11px] font-bold text-slate-400 px-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-500" /> Demo:
                </span>
                <button onClick={() => handleDemo('donor')} className="px-2.5 py-1 rounded-lg font-semibold text-slate-700 hover:bg-emerald-600 hover:text-white transition-all">Donor</button>
                <button onClick={() => handleDemo('recipient')} className="px-2.5 py-1 rounded-lg font-semibold text-slate-700 hover:bg-emerald-600 hover:text-white transition-all">NGO</button>
                <button onClick={() => handleDemo('admin')} className="px-2.5 py-1 rounded-lg font-semibold text-slate-700 hover:bg-emerald-600 hover:text-white transition-all">Admin</button>
              </div>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button onClick={() => setShowNotifs(!showNotifs)} className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center animate-pulse">{unreadCount}</span>
                    )}
                  </button>

                  {showNotifs && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Notifications</span>
                        <span className="text-xs text-emerald-600 font-semibold">{unreadCount} unread</span>
                      </div>
                      <div className="max-h-72 overflow-y-auto space-y-2">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-slate-400 py-4 text-center">No notifications yet.</p>
                        ) : (
                          notifications.slice(0, 8).map((n) => (
                            <div key={n._id || n.id} onClick={() => { markAsRead(n._id || n.id); if (n.link) navigate(n.link); setShowNotifs(false); }} className={`p-2.5 rounded-xl cursor-pointer text-xs ${n.isRead ? 'bg-slate-50 hover:bg-slate-100' : 'bg-emerald-50/70 border border-emerald-100'}`}>
                              <p className="font-bold text-slate-800">{n.title}</p>
                              <p className="text-slate-600 mt-0.5">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Link to={getDashboardLink()} className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all">
                  Dashboard
                </Link>

                <div className="relative">
                  <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">{user.name.charAt(0)}</div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="text-xs font-bold text-slate-800">{user.organizationName || user.name}</p>
                        <p className="text-[11px] text-slate-400">{user.email}</p>
                      </div>
                      <Link to={`/${user.role}/profile`} onClick={() => setShowProfileMenu(false)} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-100">
                        <User className="w-4 h-4 text-slate-400" /> Profile Settings
                      </Link>
                      <button onClick={() => { setShowProfileMenu(false); logout(); navigate('/'); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 rounded-lg hover:bg-rose-50">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-600">Log In</Link>
                <Link to="/register" className="px-4 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md">Join FoodResQ</Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}