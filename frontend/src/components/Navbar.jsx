import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Droplets, User, ShieldCheck, HardHat, Building2, Users, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const roleLabels = {
    ADMIN: 'System administrator',
    MUNICIPALITY_OFFICER: 'Municipal officer',
    FIELD_ENGINEER: 'Field engineer',
    CITIZEN: 'Citizen portal'
  };
  const roleIcons = {
    ADMIN: ShieldCheck,
    MUNICIPALITY_OFFICER: Building2,
    FIELD_ENGINEER: HardHat,
    CITIZEN: Users
  };
  const CurrentRoleIcon = roleIcons[role] || User;

  return (
    <header className="app-navbar sticky top-0 z-30 flex h-[72px] items-center justify-between border-b px-5 sm:px-7">
      <div className="flex min-w-0 items-center gap-3">
        <div className="brand-mark flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
          <Droplets className="h-5 w-5 text-white" strokeWidth={2.1} />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-[15px] font-bold tracking-tight text-slate-900">SmartWater GIS</h1>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <div className="hidden items-center gap-2.5 sm:flex">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <CurrentRoleIcon className="h-4 w-4" />
          </span>
          <div className="max-w-[170px] leading-tight">
            <p className="truncate text-xs font-semibold text-slate-800">{user?.name || 'Authorized user'}</p>
            <p className="mt-1 text-[10px] text-slate-500">{roleLabels[role] || 'Workspace user'}</p>
          </div>
        </div>
        <button onClick={logout} title="Sign out" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700">
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
