import React, { useState, useEffect } from 'react';
import { apiService } from '../api/apiClient';
import {
  Users,
  ShieldCheck,
  Building2,
  HardHat,
  UserCheck,
  Search,
  Calendar,
  Phone,
  Mail,
  RefreshCw,
  Plus
} from 'lucide-react';

export default function UsersAdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await apiService.getUsers();
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const roleColors = {
    ADMIN: 'bg-purple-950 text-purple-300 border-purple-800',
    MUNICIPALITY_OFFICER: 'bg-blue-950 text-blue-300 border-blue-800',
    FIELD_ENGINEER: 'bg-amber-950 text-amber-300 border-amber-800',
    CITIZEN: 'bg-emerald-950 text-emerald-300 border-emerald-800'
  };

  const roleIcons = {
    ADMIN: ShieldCheck,
    MUNICIPALITY_OFFICER: Building2,
    FIELD_ENGINEER: HardHat,
    CITIZEN: UserCheck
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const totalAdmins = users.filter(u => u.role === 'ADMIN').length;
  const totalOfficers = users.filter(u => u.role === 'MUNICIPALITY_OFFICER').length;
  const totalEngineers = users.filter(u => u.role === 'FIELD_ENGINEER').length;
  const totalCitizens = users.filter(u => u.role === 'CITIZEN').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            <span>User & Access Control Management</span>
          </h1>
          <p className="text-xs text-slate-400">
            System Administrator registry of registered municipal personnel and public citizen accounts.
          </p>
        </div>

        <button
          onClick={loadUsers}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Accounts</span>
        </button>
      </div>

      {/* Role Counts Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40">
          <div className="flex items-center justify-between text-xs text-purple-400 font-medium">
            <span>Administrators</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{totalAdmins}</div>
          <span className="text-[10px] text-purple-300/80">Master System Access</span>
        </div>

        <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/40">
          <div className="flex items-center justify-between text-xs text-blue-400 font-medium">
            <span>Municipal Officers</span>
            <Building2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{totalOfficers}</div>
          <span className="text-[10px] text-blue-300/80">Planning & Scenarios</span>
        </div>

        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40">
          <div className="flex items-center justify-between text-xs text-amber-400 font-medium">
            <span>Field Engineers</span>
            <HardHat className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{totalEngineers}</div>
          <span className="text-[10px] text-amber-300/80">Work Orders & Repairs</span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-medium">
            <span>Citizen Consumers</span>
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{totalCitizens}</div>
          <span className="text-[10px] text-emerald-300/80">Public Grievances Portal</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, department..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Administrator</option>
            <option value="MUNICIPALITY_OFFICER">Municipal Officer</option>
            <option value="FIELD_ENGINEER">Field Engineer</option>
            <option value="CITIZEN">Citizen</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl bg-slate-900/90 border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-mono">
            <tr>
              <th className="py-3 px-4">User ID</th>
              <th className="py-3 px-4">Full Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role / Persona</th>
              <th className="py-3 px-4">Department / Locality</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No accounts found matching the criteria.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const RoleIcon = roleIcons[u.role] || UserCheck;
                return (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-400">USR-{u.id.toString().padStart(3, '0')}</td>
                    <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                        <RoleIcon className="w-3.5 h-3.5" />
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-semibold ${roleColors[u.role] || 'border-slate-700 text-slate-300'}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{u.department || 'General Public'}</td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">{u.phone || 'N/A'}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
