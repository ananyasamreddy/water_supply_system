import React, { useState } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Polygon, Popup, Marker } from 'react-leaflet';
import L from 'leaflet';
import { Wrench, AlertTriangle, Layers, Droplets } from 'lucide-react';
import { PriorityBadge, RiskBadge } from './MetricCard';

// Custom icons using Leaflet DivIcon
const tankIcon = new L.DivIcon({
  html: `<div style="background-color: #0284c7; width: 26px; height: 26px; border-radius: 6px; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5);">
          <span style="color: white; font-size: 13px;">🏰</span>
        </div>`,
  className: '',
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

const reservoirIcon = new L.DivIcon({
  html: `<div style="background-color: #059669; width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5);">
          <span style="color: white; font-size: 14px;">🌊</span>
        </div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const complaintIcon = new L.DivIcon({
  html: `<div style="background-color: #dc2626; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; animation: pulse 1.5s infinite; box-shadow: 0 0 10px rgba(220,38,38,0.8);">
          <span style="color: white; font-size: 11px;">⚠️</span>
        </div>`,
  className: '',
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

const leakBeaconIcon = new L.DivIcon({
  html: `<div style="background-color: #f97316; width: 30px; height: 30px; border-radius: 50%; border: 3px solid #ffedd5; display: flex; align-items: center; justify-content: center; animation: ping 1s infinite; box-shadow: 0 0 20px #f97316;">
          <span style="color: white; font-size: 14px;">💧</span>
        </div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

export default function GISMap({
  networkGeoJSON,
  zones = [],
  complaints = [],
  activeLeakPipeId = null,
  onSelectPipeline = null,
  onExplainAI = null
}) {
  const [showPipes, setShowPipes] = useState(true);
  const [showJunctions, setShowJunctions] = useState(true);
  const [showTanks, setShowTanks] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [showComplaints, setShowComplaints] = useState(true);
  const [filterRisk, setFilterRisk] = useState('ALL');

  const features = networkGeoJSON?.features || [];

  const pipelines = features.filter(f => f.properties.component_type === 'PIPELINE');
  const junctions = features.filter(f => f.properties.component_type === 'JUNCTION');
  const tanks = features.filter(f => f.properties.component_type === 'TANK');
  const reservoirs = features.filter(f => f.properties.component_type === 'RESERVOIR');

  const filteredPipes = pipelines.filter(p => {
    if (filterRisk === 'ALL') return true;
    return p.properties.current_risk_class === filterRisk;
  });

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      {/* Map Layer Control Bar */}
      <div className="absolute top-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur border border-slate-800 p-3 rounded-xl shadow-xl text-xs space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-slate-200 border-b border-slate-800 pb-1.5">
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          <span>GIS Layer Controls</span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-300">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={showPipes} onChange={e => setShowPipes(e.target.checked)} className="rounded text-sky-500" />
            <span>Pipelines ({filteredPipes.length})</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={showJunctions} onChange={e => setShowJunctions(e.target.checked)} className="rounded text-sky-500" />
            <span>Junctions ({junctions.length})</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={showTanks} onChange={e => setShowTanks(e.target.checked)} className="rounded text-sky-500" />
            <span>Tanks / Sources</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={showZones} onChange={e => setShowZones(e.target.checked)} className="rounded text-sky-500" />
            <span>Supply Zones</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={showComplaints} onChange={e => setShowComplaints(e.target.checked)} className="rounded text-sky-500" />
            <span>Citizen Issues</span>
          </label>
        </div>

        {/* Risk Filter Buttons */}
        <div className="pt-2 border-t border-slate-800 flex items-center gap-1">
          <span className="text-[10px] text-slate-400">Risk:</span>
          {['ALL', 'High Risk', 'Medium Risk', 'Low Risk'].map(r => (
            <button
              key={r}
              onClick={() => setFilterRisk(r)}
              className={`text-[10px] px-1.5 py-0.5 rounded transition ${
                filterRisk === r ? 'bg-sky-600 text-white font-semibold' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {r === 'ALL' ? 'All' : r.replace(' Risk', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur border border-slate-800 p-2.5 rounded-xl shadow-xl text-[11px] text-slate-300 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 bg-red-500 rounded" />
          <span>High Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 bg-amber-500 rounded" />
          <span>Medium Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 bg-emerald-500 rounded" />
          <span>Low Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
          <span>Junction</span>
        </div>
      </div>

      <MapContainer
        center={[17.3850, 78.4867]}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 1. Supply Zone Polygons */}
        {showZones && zones.map(z => (
          <Polygon
            key={z.id}
            positions={z.coordinates}
            pathOptions={{
              color: z.color,
              fillColor: z.color,
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: '4'
            }}
          >
            <Popup>
              <div className="text-xs p-1 text-slate-800">
                <p className="font-bold text-sm text-sky-700">{z.name}</p>
                <p>Population: {z.population?.toLocaleString()}</p>
                <p>Avg Daily Demand: {z.avg_daily_demand_m3h} m³/h</p>
              </div>
            </Popup>
          </Polygon>
        ))}

        {/* 2. Pipelines (Polylines) */}
        {showPipes && filteredPipes.map(p => {
          const coords = p.geometry.coordinates.map(c => [c[1], c[0]]); // [lat, lng]
          const props = p.properties;
          const isLeakTarget = activeLeakPipeId === props.id;

          return (
            <Polyline
              key={props.id}
              positions={coords}
              pathOptions={{
                color: isLeakTarget ? '#f97316' : props.color || '#10b981',
                weight: isLeakTarget ? 6 : (props.current_risk_class === 'High Risk' ? 4.5 : 3),
                opacity: 0.9
              }}
              eventHandlers={{
                click: () => onSelectPipeline && onSelectPipeline(props)
              }}
            >
              <Popup>
                <div className="text-xs p-2 space-y-2 text-slate-900 max-w-[260px]">
                  <div className="flex items-center justify-between border-b pb-1.5">
                    <span className="font-bold text-sm text-sky-800">{props.id}</span>
                    <RiskBadge risk={props.current_risk_class} />
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-700">
                    <div><strong>Material:</strong> {props.material}</div>
                    <div><strong>Diameter:</strong> {props.diameter_mm} mm</div>
                    <div><strong>Length:</strong> {props.length_m} m</div>
                    <div><strong>Age:</strong> {props.age_years} yrs</div>
                    <div><strong>Condition:</strong> {props.condition}/5</div>
                    <div><strong>Burst History:</strong> {props.previous_failures}</div>
                  </div>

                  <div className="pt-1.5 border-t flex items-center justify-between">
                    <span className="text-[10px] text-slate-600">Priority Score:</span>
                    <PriorityBadge level={props.maintenance_priority} />
                  </div>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* 3. Junction Nodes */}
        {showJunctions && junctions.map(j => {
          const [lng, lat] = j.geometry.coordinates;
          const props = j.properties;
          return (
            <CircleMarker
              key={props.id}
              center={[lat, lng]}
              radius={4}
              pathOptions={{
                color: '#0369a1',
                fillColor: '#38bdf8',
                fillOpacity: 0.9,
                weight: 1
              }}
            >
              <Popup>
                <div className="text-xs p-1 text-slate-800">
                  <p className="font-bold text-sky-700">Junction: {props.id}</p>
                  <p>Elevation: {props.elevation_m} m</p>
                  <p>Base Demand: {props.base_demand_lps} L/s</p>
                  <p>Zone: {props.zone}</p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* 4. Tanks */}
        {showTanks && tanks.map(t => {
          const [lng, lat] = t.geometry.coordinates;
          const props = t.properties;
          return (
            <Marker key={props.id} position={[lat, lng]} icon={tankIcon}>
              <Popup>
                <div className="text-xs p-1 text-slate-800">
                  <p className="font-bold text-sky-800">{props.name || props.id}</p>
                  <p>Elev: {props.elevation_m} m | Diam: {props.diameter_m} m</p>
                  <p>Water Level: {props.init_level_m} m (Range: {props.min_level_m} - {props.max_level_m} m)</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 5. Reservoirs */}
        {showTanks && reservoirs.map(r => {
          const [lng, lat] = r.geometry.coordinates;
          const props = r.properties;
          return (
            <Marker key={props.id} position={[lat, lng]} icon={reservoirIcon}>
              <Popup>
                <div className="text-xs p-1 text-slate-800">
                  <p className="font-bold text-emerald-800">{props.name || props.id}</p>
                  <p>Total Head: {props.head_m} m</p>
                  <p className="text-[10px] text-slate-600">Water Treatment Source</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 6. Citizen Complaints */}
        {showComplaints && complaints.map(c => {
          if (!c.latitude || !c.longitude) return null;
          return (
            <Marker key={c.id} position={[c.latitude, c.longitude]} icon={complaintIcon}>
              <Popup>
                <div className="text-xs p-1 text-slate-800 max-w-[200px]">
                  <p className="font-bold text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {c.complaint_type}
                  </p>
                  <p className="text-[11px] mt-1">{c.description}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Status: <strong>{c.status}</strong></p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
