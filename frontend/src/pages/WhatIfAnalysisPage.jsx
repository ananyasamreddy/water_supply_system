import React, { useState } from 'react';
import { apiService } from '../api/apiClient';
import { GitCompare, Play, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function WhatIfAnalysisPage() {
  const [scenarioType, setScenarioType] = useState('PIPE_FAILURE');
  const [targetComponent, setTargetComponent] = useState('P_102');
  const [multiplier, setMultiplier] = useState(1.4);
  const [leakRate, setLeakRate] = useState(25);
  const [hourStep, setHourStep] = useState(14);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const params = {};
      if (scenarioType === 'DEMAND_SURGE') params.demand_multiplier = multiplier;
      if (scenarioType === 'SIMULATED_LEAK') params.leak_rate_lps = leakRate;

      const res = await apiService.runWhatIf({
        scenario_type: scenarioType,
        target_component: targetComponent,
        parameters: params,
        hour_step: hourStep
      });
      setResult(res.data);
    } catch (err) {
      console.error('Error running what-if scenario:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-sky-400" />
          What-If Scenario Simulation & Analysis
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          Test operational stress situations safely in simulation. See what happens to water pressure and supply if a main pipe bursts, an emergency valve is shut off, or demand spikes.
        </p>
      </div>

      {/* Scenario Configuration Box */}
      <form onSubmit={handleRun} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Configure Scenario Parameters</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Scenario Type</label>
            <select
              value={scenarioType}
              onChange={e => setScenarioType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
            >
              <option value="PIPE_FAILURE">1. Pipe Failure (Burst / Isolation)</option>
              <option value="VALVE_CLOSURE">2. Valve Closure (Emergency Shutoff)</option>
              <option value="DEMAND_SURGE">3. Demand Surge (Heatwave / Firefighting)</option>
              <option value="SIMULATED_LEAK">4. Simulated Leak Discharge</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Target Asset / Component</label>
            <input
              type="text"
              value={targetComponent}
              onChange={e => setTargetComponent(e.target.value)}
              placeholder="e.g. P_102, VALVE_V1, ZONE_A"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          {scenarioType === 'DEMAND_SURGE' ? (
            <div>
              <label className="block text-slate-400 mb-1">Demand Multiplier ({multiplier}x)</label>
              <input
                type="range"
                min="1.1"
                max="2.0"
                step="0.1"
                value={multiplier}
                onChange={e => setMultiplier(parseFloat(e.target.value))}
                className="w-full accent-sky-500 mt-2"
              />
            </div>
          ) : scenarioType === 'SIMULATED_LEAK' ? (
            <div>
              <label className="block text-slate-400 mb-1">Simulated Leak Rate ({leakRate} L/s)</label>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={leakRate}
                onChange={e => setLeakRate(parseInt(e.target.value, 10))}
                className="w-full accent-sky-500 mt-2"
              />
            </div>
          ) : (
            <div>
              <label className="block text-slate-400 mb-1">Simulation Hour</label>
              <input
                type="number"
                min="0"
                max="719"
                value={hourStep}
                onChange={e => setHourStep(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
          )}

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition cursor-pointer"
            >
              <Play className="w-4 h-4" />
              {loading ? 'Simulating...' : 'Simulate Scenario'}
            </button>
          </div>
        </div>
      </form>

      {/* Comparative Simulation Results */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Alert Banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            result.severity === 'CRITICAL' ? 'bg-red-950/40 border-red-800 text-red-300' :
            result.severity === 'MODERATE' ? 'bg-amber-950/40 border-amber-800 text-amber-300' :
            'bg-slate-900 border-slate-800 text-slate-300'
          }`}>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block">
                  Scenario Severity: {result.severity}
                </span>
                <p className="text-xs opacity-90">{result.hydraulic_impact_summary}</p>
              </div>
            </div>
          </div>

          {/* Baseline vs Modified Metrics Comparison Table */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Average Pressure</span>
              <div className="flex items-baseline gap-3">
                <span className="text-xl font-bold text-slate-300 line-through opacity-70">
                  {result.baseline_kpis.avg_pressure_psi} psi
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
                <span className="text-2xl font-bold text-sky-400">
                  {result.modified_kpis.avg_pressure_psi} psi
                </span>
              </div>
              <span className="text-[11px] font-mono text-red-400">
                Delta: {result.kpi_deltas.delta_avg_pressure_psi} psi
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Minimum Node Pressure</span>
              <div className="flex items-baseline gap-3">
                <span className="text-xl font-bold text-slate-300 line-through opacity-70">
                  {result.baseline_kpis.min_pressure_psi} psi
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
                <span className={`text-2xl font-bold ${result.modified_kpis.min_pressure_psi < 20 ? 'text-red-400' : 'text-amber-400'}`}>
                  {result.modified_kpis.min_pressure_psi} psi
                </span>
              </div>
              <span className="text-[11px] font-mono text-amber-400">
                Delta: {result.kpi_deltas.delta_min_pressure_psi} psi
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Affected Downstream Nodes</span>
              <p className="text-2xl font-bold text-white mt-1">
                {result.modified_kpis.affected_nodes_count} Nodes
              </p>
              <span className="text-[11px] text-slate-400">Pressure deficit or supply throttling</span>
            </div>
          </div>

          {/* List of Affected Nodes */}
          {result.affected_nodes?.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Vulnerable Nodes with Pressure Deficits (Sample)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono">
                    <tr>
                      <th className="p-2.5">Node ID</th>
                      <th className="p-2.5">Baseline (psi)</th>
                      <th className="p-2.5">Modified (psi)</th>
                      <th className="p-2.5">Pressure Drop</th>
                      <th className="p-2.5">Deficit Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {result.affected_nodes.map(n => (
                      <tr key={n.node_id} className="hover:bg-slate-800/40">
                        <td className="p-2.5 font-bold font-mono text-sky-400">{n.node_id}</td>
                        <td className="p-2.5">{n.baseline_pressure_psi}</td>
                        <td className="p-2.5 font-semibold text-white">{n.modified_pressure_psi}</td>
                        <td className="p-2.5 font-mono text-red-400">-{n.pressure_drop_psi} psi</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-300 border border-red-800">
                            {n.deficit_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
