import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../api/apiClient';
import { MetricCard } from '../components/MetricCard';
import GISMap from '../components/GISMap';
import {
  ShieldCheck,
  Building2,
  HardHat,
  Users,
  AlertTriangle,
  Activity,
  Wrench,
  MessageSquareWarning,
  TrendingUp,
  Droplets,
  ArrowUpRight
} from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

export default function Dashboard({ onNavigate }) {
  const { role, user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [networkGeoJSON, setNetworkGeoJSON] = useState(null);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [dashRes, netRes, zoneRes] = await Promise.all([
          apiService.getDashboardOverview(),
          apiService.getNetworkGeoJSON(),
          apiService.getSupplyZones()
        ]);
        setOverview(dashRes.data);
        setNetworkGeoJSON(netRes.data);
        setZones(zoneRes.data.zones || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const summary = overview?.summary || {
    total_pipelines: 106,
    high_risk_pipelines: 25,
    medium_risk_pipelines: 42,
    low_risk_pipelines: 39,
    active_complaints: 3,
    active_maintenance_orders: 3,
    urgent_maintenance_orders: 1,
    hydraulics: { avg_pressure_psi: 32.1, min_pressure_psi: 22.4, total_demand_lps: 1150.0 }
  };

  // Chart 1: Pipeline Risk Distribution (Doughnut)
  const riskChartData = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
    datasets: [
      {
        data: [summary.low_risk_pipelines, summary.medium_risk_pipelines, summary.high_risk_pipelines],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderColor: '#0f172a',
        borderWidth: 2
      }
    ]
  };

  // Chart 2: Complaints by Category (Bar)
  const complaintChartData = {
    labels: overview?.charts?.complaints_by_type?.map(c => c.type) || ['Leakage', 'Low Pressure', 'No Water', 'Quality'],
    datasets: [
      {
        label: 'Reported Issues',
        data: overview?.charts?.complaints_by_type?.map(c => c.count) || [1, 1, 1, 1],
        backgroundColor: '#38bdf8',
        borderRadius: 6
      }
    ]
  };

  // Chart 3: 24-Hour Diurnal Demand Curve
  const demandCurveData = {
    labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
    datasets: [
      {
        label: 'Zone A (m³/h)',
        data: [280, 240, 520, 680, 530, 610, 670, 390],
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        tension: 0.35,
        fill: true
      },
      {
        label: 'Zone B (Commercial)',
        data: [350, 280, 480, 890, 820, 850, 720, 430],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        tension: 0.35
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { size: 11 } } }
    },
    scales: {
      x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: '#1e293b' } },
      y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: '#1e293b' } }
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Role Greeting Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-900/60 text-sky-300 border border-sky-700">
              Role: {role.replace('_', ' ')}
            </span>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Network Live & Monitored
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Welcome, {user?.name}
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {role === 'ADMIN' && 'System overview: Monitor all network assets, inspect pipeline failure predictions, assign maintenance, and manage user access.'}
            {role === 'MUNICIPALITY_OFFICER' && 'Executive portal: Track overall water supply, run hydraulic simulations, and review demand trends.'}
            {role === 'FIELD_ENGINEER' && 'Field operations: Inspect high-risk pipes, review localized leaks, and update maintenance work orders.'}
            {role === 'CITIZEN' && 'Public water portal: Check local water supply status, view drinking water points, and report pipe bursts or low pressure.'}
          </p>
        </div>
      </div>

      {/* Citizen View: Streamlined Portal */}
      {role === 'CITIZEN' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-400" />
                Network Water Supply Status (Sector 4)
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">Current Pressure</span>
                  <p className="text-lg font-bold text-emerald-400 mt-1">Normal (32.4 psi)</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">Supply Schedule</span>
                  <p className="text-lg font-bold text-sky-400 mt-1">24/7 Pressurized</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">Water Quality Index</span>
                  <p className="text-lg font-bold text-emerald-400 mt-1">Potable (98%)</p>
                </div>
              </div>
            </div>

            <div className="h-96 rounded-2xl overflow-hidden border border-slate-800">
              <GISMap networkGeoJSON={networkGeoJSON} zones={zones} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-b from-sky-950/40 to-slate-900 border border-sky-800/40 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquareWarning className="w-4 h-4 text-sky-400" />
                Have a Water Problem?
              </h3>
              <p className="text-xs text-slate-300">
                Notice a pipe burst, low water pressure, or quality issues? Report it directly to municipal engineers.
              </p>
              <button
                onClick={() => onNavigate('complaints')}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition shadow cursor-pointer"
              >
                Submit Citizen Complaint
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Pipelines"
              value={summary.total_pipelines}
              subtitle="Monitored Mains"
              icon={Droplets}
              color="sky"
            />
            <MetricCard
              title="High-Risk Pipelines"
              value={summary.high_risk_pipelines}
              subtitle="Requires Inspection"
              icon={AlertTriangle}
              color="rose"
              alert={summary.high_risk_pipelines > 15}
            />
            <MetricCard
              title="Avg Network Pressure"
              value={`${summary.hydraulics?.avg_pressure_psi || 32.1} psi`}
              subtitle="Optimal Range (20-50 psi)"
              icon={Activity}
              color="emerald"
            />
            <MetricCard
              title="Active Work Orders"
              value={summary.active_maintenance_orders}
              subtitle={`${summary.urgent_maintenance_orders} High Priority`}
              icon={Wrench}
              color="amber"
            />
          </div>

          {/* Quick Action Navigation Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-300">Quick Navigation:</span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onNavigate('gis-map')}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium transition cursor-pointer"
              >
                🗺️ GIS Network Map
              </button>
              <button
                onClick={() => onNavigate('failure-risk')}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium transition cursor-pointer"
              >
                ⚠️ Pipe Failure Risk
              </button>
              <button
                onClick={() => onNavigate('simulation')}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium transition cursor-pointer"
              >
                💧 Hydraulic Simulation
              </button>
              <button
                onClick={() => onNavigate('maintenance')}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium transition cursor-pointer"
              >
                🔧 Work Orders
              </button>
              <button
                onClick={() => onNavigate('complaints')}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium transition cursor-pointer"
              >
                📝 Complaints
              </button>
            </div>
          </div>

          {/* Interactive GIS Preview & Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* GIS Mini Map */}
            <div className="lg:col-span-2 rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    GIS Water Distribution Network Overview
                  </h3>
                </div>
                <button
                  onClick={() => onNavigate('gis-map')}
                  className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium cursor-pointer"
                >
                  Full Map <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="h-80 rounded-xl overflow-hidden border border-slate-800">
                <GISMap networkGeoJSON={networkGeoJSON} zones={zones} />
              </div>
            </div>

            {/* Risk Distribution Chart */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Asset Structural Risk Breakdown
                  </h3>
                </div>
                <div className="h-56 mt-4">
                  <Doughnut data={riskChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } } } }} />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <strong>Asset Assessment:</strong> High risk pipeline segments require field verification within 24 hours.
              </div>
            </div>
          </div>

          {/* Bottom Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-sky-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Municipal Water Demand Profile (Diurnal Peaks)
                  </h3>
                </div>
                <button onClick={() => onNavigate('demand-forecast')} className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1">
                  Forecasts <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="h-60">
                <Line data={demandCurveData} options={chartOptions} />
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <MessageSquareWarning className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Citizen Complaints by Issue Type
                  </h3>
                </div>
                <button onClick={() => onNavigate('complaints')} className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1">
                  Manage <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="h-60">
                <Bar data={complaintChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
