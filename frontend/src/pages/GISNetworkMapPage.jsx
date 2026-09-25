import React, { useState, useEffect } from 'react';
import { apiService } from '../api/apiClient';
import GISMap from '../components/GISMap';
import { Search, Filter, Wrench, X, Activity, ShieldAlert, Droplets, Info } from 'lucide-react';
import { PriorityBadge, RiskBadge } from '../components/MetricCard';

export default function GISNetworkMapPage() {
  const [networkGeoJSON, setNetworkGeoJSON] = useState(null);
  const [zones, setZones] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [selectedPipe, setSelectedPipe] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [netRes, zoneRes, compRes] = await Promise.all([
          apiService.getNetworkGeoJSON(),
          apiService.getSupplyZones(),
          apiService.getComplaints()
        ]);
        setNetworkGeoJSON(netRes.data);
        setZones(zoneRes.data.zones || []);
        setComplaints(compRes.data.complaints || []);
      } catch (err) {
        console.error('Error fetching GIS data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectPipeline = (pipeProps) => {
    setSelectedPipe(pipeProps);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col relative overflow-hidden bg-slate-950">
      {/* Top Search & Filter Toolbar */}
      <div className="p-3 bg-slate-900/90 backdrop-blur border-b border-slate-800 flex items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Pipeline ID (e.g. P_102, P_105)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Info className="w-4 h-4 text-sky-400" />
          <span>Click any pipeline on the map to inspect engineering attributes & failure risk</span>
        </div>
      </div>

      {/* Map + Inspector Split */}
      <div className="flex-1 flex relative">
        <div className="flex-1 h-full">
          <GISMap
            networkGeoJSON={networkGeoJSON}
            zones={zones}
            complaints={complaints}
            onSelectPipeline={handleSelectPipeline}
          />
        </div>

        {/* Slide-in Pipeline Inspector Panel */}
        {selectedPipe && (
          <div className="w-84 bg-slate-900 border-l border-slate-800 shadow-2xl p-5 overflow-y-auto space-y-4 z-20">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400">Pipeline Asset</span>
                <h3 className="text-lg font-bold text-white">{selectedPipe.id}</h3>
              </div>
              <button
                onClick={() => setSelectedPipe(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Badges */}
            <div className="flex items-center gap-2">
              <RiskBadge risk={selectedPipe.current_risk_class} />
              <PriorityBadge level={selectedPipe.maintenance_priority} />
            </div>

            {/* Engineering Specifications Grid */}
            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-2 text-xs">
              <h4 className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">Physical Attributes</h4>
              <div className="grid grid-cols-2 gap-2 text-slate-400">
                <div>Material: <span className="text-white font-medium">{selectedPipe.material}</span></div>
                <div>Diameter: <span className="text-white font-medium">{selectedPipe.diameter_mm} mm</span></div>
                <div>Length: <span className="text-white font-medium">{selectedPipe.length_m} m</span></div>
                <div>Roughness (C): <span className="text-white font-medium">{selectedPipe.roughness_c}</span></div>
                <div>Installed: <span className="text-white font-medium">{selectedPipe.installation_year}</span></div>
                <div>Age: <span className="text-white font-medium">{selectedPipe.age_years} yrs</span></div>
              </div>
            </div>

            {/* Structural Degradation Features */}
            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-2 text-xs">
              <h4 className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">Condition & Failure History</h4>
              <div className="space-y-1.5 text-slate-400">
                <div className="flex justify-between">
                  <span>Physical Condition:</span>
                  <span className="text-white font-bold">{selectedPipe.condition} / 5</span>
                </div>
                <div className="flex justify-between">
                  <span>Previous Burst Failures:</span>
                  <span className="text-white font-bold">{selectedPipe.previous_failures}</span>
                </div>
                <div className="flex justify-between">
                  <span>Criticality Rating:</span>
                  <span className="text-white font-bold">{selectedPipe.criticality} / 5</span>
                </div>
                <div className="flex justify-between">
                  <span>Supply Zone:</span>
                  <span className="text-white font-bold">{selectedPipe.zone}</span>
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="p-3 bg-sky-950/30 rounded-xl border border-sky-900/40 text-xs text-sky-200">
              <span className="font-semibold block text-[11px] text-sky-400 uppercase">Recommended Action</span>
              <p className="mt-1 text-[11px]">{selectedPipe.recommendation || 'Standard cyclical inspection scheduled.'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
