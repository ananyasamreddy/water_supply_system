import React, { useState } from 'react';
import { apiService } from '../api/apiClient';
import { Crosshair, Play, AlertCircle, CheckCircle2, Droplets, BarChart2 } from 'lucide-react';

export default function LeakLocalizationPage() {
  const [selectedPipeId, setSelectedPipeId] = useState('P_102');
  const [leakRate, setLeakRate] = useState(28);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await apiService.runLeakLocalization({
        leak_pipe_id: selectedPipeId,
        simulated_leak_rate_lps: leakRate
      });
      setResult(res.data);
    } catch (err) {
      console.error('Error localizing simulated leak:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Description */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Crosshair className="w-5 h-5 text-sky-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">
            Pipeline Leak Localization & Detection
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-mono">
            Pressure-Drop Matching
          </span>
        </div>
        <p className="text-xs text-slate-300">
          Simulate a pipeline leak and let the system pinpoint which pipe is leaking by analyzing pressure drops across monitored junction nodes.
        </p>
      </div>

      {/* Configuration Box */}
      <form onSubmit={handleRun} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Simulate Leak Event</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Simulated Leak Target Pipeline</label>
            <select
              value={selectedPipeId}
              onChange={e => setSelectedPipeId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 font-mono"
            >
              {['P_101', 'P_102', 'P_103', 'P_104', 'P_105', 'P_108', 'P_112', 'P_115', 'P_120'].map(p => (
                <option key={p} value={p}>{p} (Distribution Main)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Simulated Leak Rate ({leakRate} L/s)</label>
            <input
              type="range"
              min="10"
              max="60"
              step="2"
              value={leakRate}
              onChange={e => setLeakRate(parseInt(e.target.value, 10))}
              className="w-full accent-sky-500 mt-2"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition cursor-pointer"
            >
              <Crosshair className="w-4 h-4" />
              {loading ? 'Running Sensitivity Match...' : 'Execute Localization'}
            </button>
          </div>
        </div>
      </form>

      {/* Results Presentation */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Prediction Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/60 via-slate-900 to-slate-900 border border-sky-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-sky-400 uppercase font-semibold">
                Localization Match Result
              </span>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Top Candidate: <span className="text-amber-400 font-mono">{result.top_candidate_pipeline}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Confidence: {result.top_confidence}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Methodology: {result.methodology}
              </p>
            </div>

            <button
              onClick={() => onExplainAI('GENERAL', { leak_scenario: result })}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Explain Localization Math
            </button>
          </div>

          {/* Candidate Pipelines Ranking Table */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Candidate Pipelines Ranked by Sensitivity Matching Score
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono">
                  <tr>
                    <th className="p-2.5">Rank</th>
                    <th className="p-2.5">Candidate Pipeline</th>
                    <th className="p-2.5">Sensitivity Score</th>
                    <th className="p-2.5">Observed ΔP (psi)</th>
                    <th className="p-2.5">Inferred Excess Flow</th>
                    <th className="p-2.5">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {result.candidate_rankings?.map(c => (
                    <tr
                      key={c.candidate_pipeline_id}
                      className={c.is_simulated_target ? 'bg-sky-950/30' : 'hover:bg-slate-800/40'}
                    >
                      <td className="p-2.5 font-bold font-mono text-sky-400">#{c.rank}</td>
                      <td className="p-2.5 font-mono font-bold text-white flex items-center gap-2">
                        {c.candidate_pipeline_id}
                        {c.is_simulated_target && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-900 text-sky-300 border border-sky-700">
                            Target
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 font-mono font-semibold text-emerald-400">
                        {c.localization_score}
                      </td>
                      <td className="p-2.5 font-mono text-red-400">-{c.observed_pressure_drop_psi} psi</td>
                      <td className="p-2.5 font-mono">{c.inferred_excess_flow_lps} L/s</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          c.confidence_level === 'VERY HIGH' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          c.confidence_level === 'HIGH' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {c.confidence_level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monitored Sensor Pit / Junction Pressure Drop Sample */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Monitored Junction Node Pressure Drops (ΔP)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {result.monitored_junctions_pressure_drop?.map(j => (
                <div key={j.junction_id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-mono text-slate-400 font-bold">{j.junction_id}</span>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-white">{j.abnormal_pressure_psi} psi</span>
                    <span className="text-xs font-mono text-red-400 font-bold">-{j.pressure_drop_psi} psi</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Baseline: {j.baseline_pressure_psi} psi</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
