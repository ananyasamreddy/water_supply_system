import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Droplets,
  User,
  ShieldCheck,
  HardHat,
  Building2,
  Users,
  LogOut
} from 'lucide-react';

export default function Navbar() {
  const { user, role, logout } = useAuth();

  const roleColors = {
    ADMIN: 'bg-purple-950/80 text-purple-300 border-purple-700/80',
    MUNICIPALITY_OFFICER: 'bg-blue-950/80 text-blue-300 border-blue-700/80',
    FIELD_ENGINEER: 'bg-amber-950/80 text-amber-300 border-amber-700/80',
    CITIZEN: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
  };

  const roleIcons = {
    ADMIN: ShieldCheck,
    MUNICIPALITY_OFFICER: Building2,
    FIELD_ENGINEER: HardHat,
    CITIZEN: Users
  };

  const CurrentRoleIcon = roleIcons[role] || User;

  return (
    <header className="h-16 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
      
      {/* Brand Title */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <Droplets className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight">
            SmartWater GIS
          </h1>
        </div>
      </div>

      {/* Right User Status & Logout */}
      <div className="flex items-center space-x-4">
        
        {/* Current User Badge */}
        <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-xs font-medium ${roleColors[role] || 'border-slate-700 text-slate-300'}`}>
          <CurrentRoleIcon className="w-4 h-4 shrink-0" />
          <div className="text-left leading-tight">
            <span className="font-semibold block max-w-[140px] truncate text-white">{user?.name || 'Authorized User'}</span>
            <span className="text-[10px] opacity-80 uppercase tracking-wider font-mono">{role?.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
          title="Logout from portal"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>

      </div>
    </header>
  );
}
