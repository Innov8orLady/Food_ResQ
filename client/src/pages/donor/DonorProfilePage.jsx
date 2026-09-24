import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { User, CheckCircle2, MapPin, Building2, Phone } from 'lucide-react';

export default function DonorProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user.name || '');
  const [org, setOrg] = useState(user.organizationName || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.location?.address || '');
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/users/profile', {
        name,
        organizationName: org,
        phone,
        location: {
          ...user.location,
          address
        }
      });
      if (res.data.success) {
        updateUser(res.data.user);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      alert("Failed to update profile");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Donor Profile Settings</h1>
        <p className="text-xs text-slate-500">Manage business details and pickup pickup dispatch address</p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 uppercase mb-1">Contact Person</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300" />
        </div>
        <div>
          <label className="block font-bold text-slate-700 uppercase mb-1">Organization / Restaurant Name</label>
          <input type="text" value={org} onChange={e => setOrg(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300" />
        </div>
        <div>
          <label className="block font-bold text-slate-700 uppercase mb-1">Phone Number</label>
          <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300" />
        </div>
        <div>
          <label className="block font-bold text-slate-700 uppercase mb-1">Pickup Location Address</label>
          <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300" />
        </div>
        <button type="submit" className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold uppercase tracking-wider hover:bg-emerald-700">
          Save Changes
        </button>
      </form>
    </div>
  );
}