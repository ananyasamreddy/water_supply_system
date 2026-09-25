import React from 'react';

export function MetricCard({ title, value, subtitle, icon: Icon, color = 'sky', alert = false }) {
  const colorStyles = {
    sky: 'from-sky-500/10 to-transparent border-sky-500/30 text-sky-400',
    emerald: 'from-emerald-500/10 to-transparent border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/10 to-transparent border-amber-500/30 text-amber-400',
    rose: 'from-rose-500/10 to-transparent border-rose-500/30 text-rose-400',
    purple: 'from-purple-500/10 to-transparent border-purple-500/30 text-purple-400'
  };

  return (
    <div className={`p-4 rounded-2xl bg-gradient-to-b ${colorStyles[color] || colorStyles.sky} border bg-slate-900/60 shadow-lg relative overflow-hidden`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        {Icon && <Icon className={`w-5 h-5 ${alert ? 'animate-bounce text-rose-400' : 'opacity-80'}`} />}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
      </div>
      {subtitle && <p className="mt-1 text-[11px] text-slate-400">{subtitle}</p>}
    </div>
  );
}

export function PriorityBadge({ level }) {
  const styles = {
    URGENT: 'bg-red-950/80 text-red-400 border-red-800 animate-pulse',
    HIGH: 'bg-amber-950/80 text-amber-400 border-amber-800',
    MEDIUM: 'bg-blue-950/80 text-blue-400 border-blue-800',
    LOW: 'bg-slate-800/80 text-slate-400 border-slate-700'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${styles[level] || styles.LOW}`}>
      {level}
    </span>
  );
}

export function RiskBadge({ risk }) {
  const styles = {
    'High Risk': 'bg-red-950 text-red-300 border-red-700',
    'Medium Risk': 'bg-amber-950 text-amber-300 border-amber-700',
    'Low Risk': 'bg-emerald-950 text-emerald-300 border-emerald-700'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${styles[risk] || styles['Low Risk']}`}>
      {risk}
    </span>
  );
}

export default {
  MetricCard,
  PriorityBadge,
  RiskBadge
};
