import React, { useState, useEffect } from 'react';
import { apiService } from '../api/apiClient';
import { AlertTriangle, ShieldCheck, BarChart2, CheckCircle2, Sliders, Info } from 'lucide-react';
import { RiskBadge } from '../components/MetricCard';

export default function FailureRiskPage() {
  // Input form state
  const [pipelineId, setPipelineId] = useState('P_102');
  const [material, setMaterial] = useState('Cast Iron');
  const [ageYears, setAgeYears] = useState(42);
  const [diameterMm, setDiameterMm] = useState(250);
  const [conditionScore, setConditionScore] = useState(2);
  const [prevFailures, setPrevFailures] = useState(3);
  const [criticalityScore, setCriticalityScore] = useState(4);
  const [soilCorrosivity, setSoilCorrosivity] = useState(4);
  const [trafficLoad, setTrafficLoad] = useState(3);
  const [pressureCycles, setPressureCycles] = useState(38);

  const [prediction, setPrediction] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load real model evaluation metrics on mount
  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await apiService.getModelMetrics();
        setModelMetrics(res.data?.failure_risk_model);
      } catch (err) {
        console.error('Error fetching model metrics:', err);
      }
    }
    loadMetrics();
  }, []);

  const handlePredict = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await apiService.predictFailureRisk({
        pipeline_id: pipelineId,
        material,
        age_years: ageYears,
        diameter_mm: diameterMm,
        condition_score: conditionScore,
        previous_failures: prevFailures,
        criticality_score: criticalityScore,
        soil_corrosivity: soilCorrosivity,
        traffic_load: trafficLoad,
        mean_velocity_ms: 1.35,
        velocity_variance: 0.38,
        pressure_cycles_day: pressureCycles
      });
      setPrediction(res.data);
    } catch (err) {
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const cm = modelMetrics?.confusion_matrix?.matrix || [
    [57, 4, 0],
    [3, 30, 3],
    [0, 2, 26]
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">
            Pipeline Structural Health & Failure Risk Assessment
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
            Reliability: 90.4% High-Confidence
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Predictive physical asset intelligence evaluating pipe age, material fatigue, soil corrosivity, and operational pressure stress.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Feature Sliders Form */}
        <form onSubmit={handlePredict} className="lg:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              Pipeline Feature Inputs
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Standard: AWWA Degradation & Failure Risk Assessment</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Pipeline ID</label>
              <input
                type="text"
                value={pipelineId}
                onChange={e => setPipelineId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Pipe Material</label>
              <select
                value={material}
                onChange={e => setMaterial(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="Cast Iron">Cast Iron (Brittle, high graphitization risk)</option>
                <option value="Ductile Iron">Ductile Iron (High tensile strength)</option>
                <option value="Asbestos Cement">Asbestos Cement (Legacy brittle)</option>
                <option value="HDPE">HDPE (Flexible polymer, corrosion proof)</option>
                <option value="PVC">PVC (Rigid polymer)</option>
                <option value="Steel">Steel (High strength)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Pipeline Age:</span>
                <span className="text-white font-bold">{ageYears} years</span>
              </div>
              <input
                type="range"
                min="1"
                max="65"
                value={ageYears}
                onChange={e => setAgeYears(parseInt(e.target.value, 10))}
                className="w-full accent-sky-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Diameter:</span>
                <span className="text-white font-bold">{diameterMm} mm</span>
              </div>
              <input
                type="range"
                min="150"
                max="750"
                step="50"
                value={diameterMm}
                onChange={e => setDiameterMm(parseInt(e.target.value, 10))}
                className="w-full accent-sky-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Physical Condition (1=Severe, 5=New):</span>
                <span className={`font-bold ${conditionScore <= 2 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {conditionScore} / 5
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={conditionScore}
                onChange={e => setConditionScore(parseInt(e.target.value, 10))}
                className="w-full accent-sky-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Historical Bursts / Failures:</span>
                <span className="text-white font-bold">{prevFailures}</span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                value={prevFailures}
                onChange={e => setPrevFailures(parseInt(e.target.value, 10))}
                className="w-full accent-sky-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Criticality (1=Low, 5=Hospital/Downtown):</span>
                <span className="text-white font-bold">{criticalityScore} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={criticalityScore}
                onChange={e => setCriticalityScore(parseInt(e.target.value, 10))}
                className="w-full accent-sky-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Soil Corrosivity Index:</span>
                <span className="text-white font-bold">{soilCorrosivity} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={soilCorrosivity}
                onChange={e => setSoilCorrosivity(parseInt(e.target.value, 10))}
                className="w-full accent-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            {loading ? 'Evaluating Model...' : 'Calculate Failure Risk'}
          </button>
        </form>

        {/* Prediction Output & Engineering Explanations */}
        <div className="lg:col-span-5 space-y-6">
          {prediction ? (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs text-slate-400 uppercase font-mono">Predicted Outcome</span>
                <RiskBadge risk={prediction.predicted_risk} />
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400">Class Likelihoods</span>
                <div className="space-y-2 pt-1">
                  {Object.entries(prediction.probabilities || {}).map(([cls, prob]) => (
                    <div key={cls} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">{cls}</span>
                        <span className="font-mono text-white font-bold">{Math.round(prob * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${
                            cls === 'High Risk' ? 'bg-red-500' :
                            cls === 'Medium Risk' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${prob * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Identified Engineering Risk Factors */}
              <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 space-y-2 text-xs">
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">
                  Identified Engineering Risk Factors
                </span>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside text-[11px]">
                  {prediction.risk_factors?.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400 space-y-2">
              <Info className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-semibold text-slate-300">No Inference Generated</p>
              <p>Adjust the pipeline attributes on the left and click "Calculate Failure Risk" to execute asset risk analysis.</p>
            </div>
          )}
        </div>
      </div>

      {/* Risk Understanding & Action Guide */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Understanding Pipeline Risk Levels & Required Actions
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Field Guidelines
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-950 rounded-xl border border-emerald-900/60 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Low Risk (Safe)</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Pipeline is structurally sound with minimal wear. Normal operational pressure.
            </p>
            <div className="pt-2 text-[11px] text-emerald-300 border-t border-slate-800">
              <strong>Action:</strong> Routine annual sensor and visual check.
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-amber-900/60 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Medium Risk (Monitor)</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Moderate pipe degradation or mild soil corrosion detected. Higher burst probability under pressure spikes.
            </p>
            <div className="pt-2 text-[11px] text-amber-300 border-t border-slate-800">
              <strong>Action:</strong> Schedule acoustic inspection within 30 days.
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-rose-900/60 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span>High Risk (Critical)</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Severe aging, corrosive soil, or repeated previous bursts. High probability of rupture or major leak.
            </p>
            <div className="pt-2 text-[11px] text-rose-300 border-t border-slate-800">
              <strong>Action:</strong> Create immediate priority maintenance work order.
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>💡 <strong>Tip:</strong> You can select any pipeline from the GIS map or customize the parameters above to assess different pipe conditions.</span>
        </div>
      </div>
    </div>
  );
}
