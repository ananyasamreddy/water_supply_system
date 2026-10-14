import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Home, Map, Activity, GitCompare, Crosshair,
  AlertTriangle, TrendingUp, Wrench, MessageSquareWarning, Users
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { role } = useAuth();
  const navByRole = {
    CITIZEN: [
      { id: 'citizen-portal', label: 'My water services', icon: Home },
      { id: 'gis-map', label: 'Network map', icon: Map },
      { id: 'complaints', label: 'Service requests', icon: MessageSquareWarning }
    ],
    FIELD_ENGINEER: [
      { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
      { id: 'gis-map', label: 'Network map', icon: Map },
      { id: 'failure-risk', label: 'Pipe risk assessment', icon: AlertTriangle },
      { id: 'maintenance', label: 'Maintenance', icon: Wrench },
      { id: 'complaints', label: 'Service requests', icon: MessageSquareWarning }
    ],
    MUNICIPALITY_OFFICER: [
      { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
      { id: 'gis-map', label: 'Network map', icon: Map },
      { id: 'simulation', label: 'Hydraulic simulation', icon: Activity },
      { id: 'what-if', label: 'Scenario analysis', icon: GitCompare },
      { id: 'leak-localization', label: 'Leak localisation', icon: Crosshair },
      { id: 'failure-risk', label: 'Pipe risk assessment', icon: AlertTriangle },
      { id: 'demand-forecast', label: 'Demand forecast', icon: TrendingUp },
      { id: 'maintenance', label: 'Maintenance', icon: Wrench },
      { id: 'complaints', label: 'Service requests', icon: MessageSquareWarning }
    ],
    ADMIN: [
      { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
      { id: 'gis-map', label: 'Network map', icon: Map },
      { id: 'simulation', label: 'Hydraulic simulation', icon: Activity },
      { id: 'what-if', label: 'Scenario analysis', icon: GitCompare },
      { id: 'leak-localization', label: 'Leak localisation', icon: Crosshair },
      { id: 'failure-risk', label: 'Pipe risk assessment', icon: AlertTriangle },
      { id: 'demand-forecast', label: 'Demand forecast', icon: TrendingUp },
      { id: 'maintenance', label: 'Maintenance', icon: Wrench },
      { id: 'complaints', label: 'Service requests', icon: MessageSquareWarning },
      { id: 'users-admin', label: 'User management', icon: Users }
    ]
  };
  const navItems = navByRole[role] || navByRole.ADMIN;
  const roleLabels = {
    ADMIN: 'Administrator',
    MUNICIPALITY_OFFICER: 'Municipal operations',
    FIELD_ENGINEER: 'Field operations',
    CITIZEN: 'Resident services'
  };

  return (
    <aside className="app-sidebar flex w-[248px] shrink-0 flex-col justify-between select-none">
      <div className="overflow-y-auto px-3 py-5">
        <div className="px-3 pb-3 pt-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
          <p className="mt-1.5 text-xs font-medium text-slate-600">{roleLabels[role] || 'Water operations'}</p>
        </div>
        <nav className="space-y-1" aria-label="Main navigation">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id)} aria-current={isActive ? 'page' : undefined}
                className={`app-nav-item group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[12px] transition-colors ${isActive ? 'is-active' : ''}`}>
                <Icon className="h-[17px] w-[17px] shrink-0" strokeWidth={isActive ? 2.1 : 1.8} />
                <span className="leading-5">{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200/80 p-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-semibold text-slate-700">System workspace</span>
          </div>
          <p className="mt-1.5 pl-4 text-[10px] leading-4 text-slate-500">Network analysis and maintenance tools</p>
          <p className="mt-3 border-t border-slate-200 pt-2.5 text-[10px] text-slate-400">SMART WATER · GIS</p>
        </div>
      </div>
    </aside>
  );
}
