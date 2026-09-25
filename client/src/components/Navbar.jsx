import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  UtensilsCrossed, Bell, User, LogOut, ChevronDown, Menu, X,
  LayoutDashboard, PlusCircle, ListOrdered, CalendarCheck, History,
  BarChart3, Map, Search, Users, Truck, ShieldCheck
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-close menus on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowProfileMenu(false);
    setShowNotifs(false);
  }, [location.pathname]);

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'donor') return '/donor/dashboard';
    if (user.role === 'recipient') return '/recipient/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/';
  };

  const getRoleLinks = () => {
    if (!user) return [];
    if (user.role === 'donor') {
      return [
        { to: '/donor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/donor/add-food', label: 'Add Surplus Food', icon: PlusCircle, highlight: true },
        { to: '/donor/listings', label: 'My Listings', icon: ListOrdered },
        { to: '/donor/claims', label: 'Claims & Pickups', icon: CalendarCheck },
        { to: '/donor/history', label: 'Donation History', icon: History },
        { to: '/donor/analytics', label: 'Waste Analytics', icon: BarChart3 },
        { to: '/donor/profile', label: 'Profile Settings', icon: User },
      ];
    }
    if (user.role === 'recipient') {
      return [
        { to: '/recipient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/recipient/nearby', label: 'Nearby Food', icon: Search },
        { to: '/recipient/map', label: 'Live Rescue Map', icon: Map, highlight: true },
        { to: '/recipient/claims', label: 'My Claims', icon: ListOrdered },
        { to: '/recipient/pickups', label: 'Route & Pickups', icon: Truck },
        { to: '/recipient/history', label: 'Claim History', icon: History },
        { to: '/recipient/profile', label: 'Profile Settings', icon: User },
      ];
    }
    if (user.role === 'admin') {
      return [
        { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
        { to: '/admin/users', label: 'User Verification', icon: Users },
        { to: '/admin/listings', label: 'Listing Moderation', icon: ListOrdered },
        { to: '/admin/claims', label: 'Claims Audit', icon: CalendarCheck },
        { to: '/admin/reports', label: 'Impact Reports', icon: ShieldCheck },
        { to: '/admin/analytics', label: 'System Analytics', icon: BarChart3 },
        { to: '/admin/profile', label: 'Security & Profile', icon: User },
      ];
    }
    return [];
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
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

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className={`text-sm font-semibold hover:text-emerald-600 transition-colors ${location.pathname === '/' ? 'text-emerald-600' : 'text-slate-600'}`}>Home</Link>
            <Link to="/about" className={`text-sm font-semibold hover:text-emerald-600 transition-colors ${location.pathname === '/about' ? 'text-emerald-600' : 'text-slate-600'}`}>About</Link>
            <Link to="/how-it-works" className={`text-sm font-semibold hover:text-emerald-600 transition-colors ${location.pathname === '/how-it-works' ? 'text-emerald-600' : 'text-slate-600'}`}>How It Works</Link>
            <Link to="/contact" className={`text-sm font-semibold hover:text-emerald-600 transition-colors ${location.pathname === '/contact' ? 'text-emerald-600' : 'text-slate-600'}`}>Contact</Link>
          </div>

          {/* Desktop User / Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
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
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">{user.name?.charAt(0) || 'U'}</div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="text-xs font-bold text-slate-800 truncate">{user.organizationName || user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
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

          {/* Mobile Right Controls: Notification Bell + Hamburger Toggle */}
          <div className="md:hidden flex items-center gap-1">
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Notifications</span>
                      <span className="text-xs text-emerald-600 font-semibold">{unreadCount} unread</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 py-3 text-center">No notifications yet.</p>
                      ) : (
                        notifications.slice(0, 6).map((n) => (
                          <div key={n._id || n.id} onClick={() => { markAsRead(n._id || n.id); if (n.link) navigate(n.link); setShowNotifs(false); }} className={`p-2 rounded-xl cursor-pointer text-xs ${n.isRead ? 'bg-slate-50' : 'bg-emerald-50/70 border border-emerald-100'}`}>
                            <p className="font-bold text-slate-800">{n.title}</p>
                            <p className="text-slate-600 mt-0.5">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-slate-900" /> : <Menu className="w-6 h-6 text-slate-900" />}
            </button>
          </div>

        </div>
      </div>

      {/* Fully Functional Mobile Slide-Down Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/90 bg-white/98 backdrop-blur-xl px-4 pt-3 pb-6 space-y-4 shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* User Profile Summary (if logged in) */}
          {user ? (
            <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{user.organizationName || user.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  <span className="inline-block mt-1 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                    {user.role} Portal
                  </span>
                </div>
              </div>
              <button
                onClick={() => { setMobileMenuOpen(false); logout(); navigate('/'); }}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : null}

          {/* Role Portal Menu (if logged in) */}
          {user && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                {user.role} Workspace
              </p>
              <div className="grid grid-cols-1 gap-1">
                {getRoleLinks().map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                          : item.highlight
                          ? 'text-emerald-700 bg-emerald-100/70 hover:bg-emerald-100'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* General Site Navigation */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Pages
            </p>
            <div className="grid grid-cols-2 gap-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${location.pathname === '/' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Home
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${location.pathname === '/about' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                About
              </Link>
              <Link
                to="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${location.pathname === '/how-it-works' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                How It Works
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${location.pathname === '/contact' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Authentication Actions */}
          {!user ? (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center py-2.5 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
              >
                Join FoodResQ
              </Link>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => { setMobileMenuOpen(false); logout(); navigate('/'); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out from Account
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}