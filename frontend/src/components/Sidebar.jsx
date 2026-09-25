import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Home,
  Map,
  Activity,
  GitCompare,
  Crosshair,
  AlertTriangle,
  TrendingUp,
  Wrench,
  MessageSquareWarning,
  Users
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { role } = useAuth();

  // Navigation schema strictly partitioned per role (Required modules only)
  const getNavItemsForRole = () => {
    switch (role) {
      case 'CITIZEN':
        return [
          { id: 'citizen-portal', label: 'Consumer Dashboard', icon: Home },
          { id: 'gis-map', label: 'GIS Water Network Map', icon: Map },
          { id: 'complaints', label: 'Complaint Management', icon: MessageSquareWarning }
        ];

      case 'FIELD_ENGINEER':
        return [
          { id: 'dashboard', label: 'Field Operations Dashboard', icon: LayoutDashboard },
          { id: 'gis-map', label: 'GIS Network Map', icon: Map },
          { id: 'failure-risk', label: 'Pipeline Failure-Risk Prediction', icon: AlertTriangle },
          { id: 'maintenance', label: 'Maintenance Management', icon: Wrench },
          { id: 'complaints', label: 'Complaint Management', icon: MessageSquareWarning }
        ];

      case 'MUNICIPALITY_OFFICER':
        return [
          { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
          { id: 'gis-map', label: 'GIS Network Map', icon: Map },
          { id: 'simulation', label: 'Hydraulic Simulation', icon: Activity },
          { id: 'what-if', label: 'What-If Scenario Analysis', icon: GitCompare },
          { id: 'leak-localization', label: 'Simulated Leak Localization', icon: Crosshair },
          { id: 'failure-risk', label: 'Pipeline Failure-Risk Prediction', icon: AlertTriangle },
          { id: 'demand-forecast', label: 'Water Demand Forecasting', icon: TrendingUp },
          { id: 'maintenance', label: 'Maintenance Management', icon: Wrench },
          { id: 'complaints', label: 'Complaint Management', icon: MessageSquareWarning }
        ];

      case 'ADMIN':
      default:
        return [
          { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
          { id: 'gis-map', label: 'GIS Network Map', icon: Map },
          { id: 'simulation', label: 'Hydraulic Simulation', icon: Activity },
          { id: 'what-if', label: 'What-If Scenario Analysis', icon: GitCompare },
          { id: 'leak-localization', label: 'Simulated Leak Localization', icon: Crosshair },
          { id: 'failure-risk', label: 'Pipeline Failure-Risk Prediction', icon: AlertTriangle },
          { id: 'demand-forecast', label: 'Water Demand Forecasting', icon: TrendingUp },
          { id: 'maintenance', label: 'Maintenance Management', icon: Wrench },
          { id: 'complaints', label: 'Complaint Management', icon: MessageSquareWarning },
          { id: 'users-admin', label: 'User & Role Management', icon: Users }
        ];
    }
  };

  const navItems = getNavItemsForRole();

  const roleTheme = {
    ADMIN: { label: 'Admin Access', color: 'text-purple-400', border: 'border-purple-800/60' },
    MUNICIPALITY_OFFICER: { label: 'Executive Officer', color: 'text-blue-400', border: 'border-blue-800/60' },
    FIELD_ENGINEER: { label: 'Field Crew', color: 'text-amber-400', border: 'border-amber-800/60' },
    CITIZEN: { label: 'Citizen Consumer', color: 'text-emerald-400', border: 'border-emerald-800/60' }
  };

  const currentTheme = roleTheme[role] || roleTheme.ADMIN;

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      <div className="p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Workspace
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${currentTheme.color} ${currentTheme.border} bg-slate-900 font-semibold`}>
            {currentTheme.label}
          </span>
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                isActive
                  ? 'bg-sky-600 text-white font-semibold shadow-md shadow-sky-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Role-Specific System Status Pill */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/50">
        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 text-[11px] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Digital Twin Engine</span>
            <span className="text-emerald-400 font-mono font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              117 Mains Online
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Active Role</span>
            <span className="text-sky-400 font-mono font-medium">{role || 'GUEST'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
