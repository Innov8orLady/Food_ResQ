import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Users, ShieldCheck, ShieldAlert, Check, X } from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      if (res.data.success) setUsers(res.data.users);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleVerify = async (id) => {
    try {
      await api.put('/users/' + id + '/verify');
      fetchUsers();
    } catch (e) {
      alert("Failed to update user verification");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">User Management & Verification</h1>
        <p className="text-xs text-slate-500">Verify food donor businesses and recipient NGO legitimacy</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <p className="text-xs text-slate-400 py-8 text-center">Loading user records...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="p-3 font-bold">Name & Organization</th>
                  <th className="p-3 font-bold">Email</th>
                  <th className="p-3 font-bold">Role</th>
                  <th className="p-3 font-bold">City</th>
                  <th className="p-3 font-bold">Verified</th>
                  <th className="p-3 font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id || u.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <p className="font-bold text-slate-800">{u.organizationName || u.name}</p>
                      <p className="text-slate-400 text-[11px]">{u.name}</p>
                    </td>
                    <td className="p-3 text-slate-600">{u.email}</td>
                    <td className="p-3">
                      <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{u.location?.city || "Delhi NCR"}</td>
                    <td className="p-3">
                      {u.verified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                          <Check className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
                          <X className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleVerify(u._id || u.id)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold"
                      >
                        {u.verified ? "Revoke" : "Approve"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}