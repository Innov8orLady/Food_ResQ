import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import {
  LayoutDashboard, PlusCircle, ListOrdered, CalendarCheck, History,
  BarChart3, User, Map, Search, ShieldCheck, Users, Truck
} from 'lucide-react';

export default function DashboardLayout() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;
  const role = user.role;

  const donorLinks = [
    { to: '/donor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/donor/add-food', label: 'Add Surplus Food', icon: PlusCircle, highlight: true },
    { to: '/donor/listings', label: 'My Listings', icon: ListOrdered },
    { to: '/donor/claims', label: 'Claims & Pickups', icon: CalendarCheck },
    { to: '/donor/history', label: 'Donation History', icon: History },
    { to: '/donor/analytics', label: 'Waste Analytics', icon: BarChart3 },
    { to: '/donor/profile', label: 'Profile', icon: User }
  ];

  const recipientLinks = [
    { to: '/recipient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/recipient/nearby', label: 'Nearby Food', icon: Search },
    { to: '/recipient/map', label: 'Live Rescue Map', icon: Map, highlight: true },
    { to: '/recipient/claims', label: 'My Claims', icon: ListOrdered },
    { to: '/recipient/pickups', label: 'Route & Pickups', icon: Truck },
    { to: '/recipient/history', label: 'Claim History', icon: History },
    { to: '/recipient/profile', label: 'Profile', icon: User }
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Verification', icon: Users },
    { to: '/admin/listings', label: 'Listing Moderation', icon: ListOrdered },
    { to: '/admin/claims', label: 'Claims Audit', icon: CalendarCheck },
    { to: '/admin/reports', label: 'Impact Reports', icon: ShieldCheck },
    { to: '/admin/analytics', label: 'System Analytics', icon: BarChart3 },
    { to: '/admin/profile', label: 'Security & Profile', icon: User }
  ];

  let navLinks = donorLinks;
  if (role === 'recipient') navLinks = recipientLinks;
  if (role === 'admin') navLinks = adminLinks;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        
        <aside className="w-full md:w-60 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 md:p-4 shadow-sm md:sticky md:top-20">
            <div className="hidden md:block px-3 py-2 mb-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                {role.toUpperCase()} PORTAL
              </span>
              <h3 className="text-xs font-bold text-slate-800 mt-1 truncate">{user.organizationName || user.name}</h3>
              <p className="text-[11px] text-slate-400 truncate">{user.location?.city || "Delhi NCR"}</p>
            </div>

            <nav className="flex md:flex-col gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`shrink-0 flex items-center gap-2 md:gap-3 px-3.5 py-2 md:py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                        : item.highlight
                        ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>

      </div>
    </div>
  );
}