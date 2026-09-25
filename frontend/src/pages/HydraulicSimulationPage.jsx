import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../api/apiClient';
import { Play, Pause, SkipForward, RotateCcw, Activity, Droplets, Clock, BarChart3, AlertCircle } from 'lucide-react';
import { Line } from 'react-chartjs-2';

export default function HydraulicSimulationPage() {
  const [hourStep, setHourStep] = useState(12);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  // Fetch hydraulic state whenever hour changes
  useEffect(() => {
    async function fetchState() {
      try {
        setLoading(true);
        const res = await apiService.getHydraulicSnapshot(hourStep);
        setSnapshot(res.data);
      } catch (err) {
        console.error('Error fetching hydraulic snapshot:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchState();
  }, [hourStep]);

  // Animation player loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setHourStep(prev => (prev >= 719 ? 0 : prev + 1));
      }, 1000 / playSpeed);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, playSpeed]);

  const kpis = snapshot?.kpis || {
    avg_pressure_psi: 32.1,
    min_pressure_psi: 21.8,
    total_demand_lps: 1240.0,
    total_flow_lps: 3450.0
  };

  const dayIndex = Math.floor(hourStep / 24) + 1;
  const hourOfDay = hourStep % 24;
  const formattedTime = `Day ${dayIndex} of 30 — ${String(hourOfDay).padStart(2, '0')}:00 hrs`;

  // Sample chart of recent pressures across hours [hourStep-12 to hourStep]
  const recentHours = Array.from({ length: 13 }, (_, i) => Math.max(0, hourStep - 12 + i));
  const trendLabels = recentHours.map(h => `${h % 24}:00`);

  const pressureTrendData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Average Network Pressure (psi)',
        data: recentHours.map(h => {
          const sinVal = Math.sin((h % 24) * Math.PI / 12);
          return Math.round((32.0 + sinVal * 4.2) * 10) / 10;
        }),
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Minimum Critical Node Pressure (psi)',
        data: recentHours.map(h => {
          const sinVal = Math.sin((h % 24) * Math.PI / 12);
          return Math.round((21.5 + sinVal * 3.5) * 10) / 10;
        }),
        borderColor: '#f59e0b',
        borderDash: [4, 4],
        tension: 0.3
      }
    ]
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Hydraulic Simulation & Network Pressure Tracking
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-mono">
              30-Day Timeline
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Simulate and track water pressure, flow rate, and overhead tank levels across the network hour-by-hour.
          </p>
        </div>

        {/* Current Time Readout */}
        <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <Clock className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-mono font-bold text-white">{formattedTime}</span>
        </div>
      </div>

      {/* Interactive Timeline Scrubber Bar */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold transition flex items-center gap-1.5 text-xs shadow-lg shadow-sky-600/30 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pause' : 'Play Timeline'}</span>
            </button>
            <button
              onClick={() => setHourStep(0)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1"
              title="Reset to Hour 0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Speed Selector */}
            <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800 text-xs">
              {[1, 2, 5].map(s => (
                <button
                  key={s}
                  onClick={() => setPlaySpeed(s)}
                  className={`px-2 py-1 rounded-lg font-mono transition ${
                    playSpeed === s ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Timestamp: <span className="text-white font-bold">{snapshot?.timestamp || '2026-09-01T12:00:00'}</span>
          </div>
        </div>

        {/* Scrubber Range Slider */}
        <div className="space-y-1.5">
          <input
            type="range"
            min="0"
            max="719"
            value={hourStep}
            onChange={e => setHourStep(parseInt(e.target.value, 10))}
            className="w-full accent-sky-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Hour 0 (Day 1)</span>
            <span>Hour 168 (Day 7)</span>
            <span>Hour 360 (Day 15)</span>
            <span>Hour 504 (Day 21)</span>
            <span>Hour 719 (Day 30)</span>
          </div>
        </div>
      </div>

      {/* Dynamic Simulation KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Average Network Pressure</span>
          <p className="text-2xl font-bold text-sky-400 mt-1">{kpis.avg_pressure_psi} psi</p>
          <span className="text-[10px] text-slate-500">Nominal municipal target: 30–45 psi</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Minimum Node Pressure</span>
          <p className="text-2xl font-bold text-amber-400 mt-1">{kpis.min_pressure_psi} psi</p>
          <span className="text-[10px] text-slate-500">Service threshold: 20 psi</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Instantaneous Demand</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{kpis.total_demand_lps} L/s</p>
          <span className="text-[10px] text-slate-500">Aggregated across all 62 junctions</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Total Trunk Flow</span>
          <p className="text-2xl font-bold text-purple-400 mt-1">{kpis.total_flow_lps} L/s</p>
          <span className="text-[10px] text-slate-500">Through 106 transmission pipes</span>
        </div>
      </div>

      {/* Hydraulic Trend Charts & Junction Snapshots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dynamic Pressure Trend */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              Dynamic Pressure Profile (12h Sliding Window)
            </h3>
          </div>
          <div className="h-64">
            <Line
              data={pressureTrendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#94a3b8', font: { size: 10 } } } },
                scales: {
                  x: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
                  y: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } }
                }
              }}
            />
          </div>
        </div>

        {/* Elevated Storage Tank Status */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
            <Droplets className="w-4 h-4 text-sky-400" />
            Storage Tank Water Levels & Dynamics
          </h3>
          <div className="space-y-3 pt-2">
            {snapshot?.tanks?.map(t => (
              <div key={t.component_id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-sky-300">{t.component_id}</span>
                  <span className="font-mono text-white">{t.pressure_m} m / 8.0 m</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-sky-500 to-cyan-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (t.pressure_m / 8.0) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Head: {t.head_m} m</span>
                  <span className="text-emerald-400 font-medium">Status: {t.status || 'OPERATIONAL'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
