import React, { useState, useEffect } from 'react';
import { apiService } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { MessageSquareWarning, Plus, CheckCircle2, Clock, AlertTriangle, MapPin, Send, Check } from 'lucide-react';

export default function ComplaintsPage() {
  const { role, user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [citizenName, setCitizenName] = useState(user?.name || 'Ananya Gupta');
  const [citizenPhone, setCitizenPhone] = useState('+91 9876543213');
  const [complaintType, setComplaintType] = useState('Pipeline leakage');
  const [locationDesc, setLocationDesc] = useState('Main Road near Sector 4 intersection');
  const [zone, setZone] = useState('ZONE_A');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState(12.9782);
  const [lng, setLng] = useState(77.5920);

  const loadComplaints = async () => {
    try {
      const res = await apiService.getComplaints();
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiService.submitComplaint({
        citizen_name: citizenName,
        citizen_phone: citizenPhone,
        complaint_type: complaintType,
        location_desc: locationDesc,
        related_zone: zone,
        latitude: lat,
        longitude: lng,
        description: description || 'Water oozing onto road surface from pipe joint.'
      });
      setShowSubmitModal(false);
      setDescription('');
      loadComplaints();
    } catch (err) {
      console.error('Error submitting complaint:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (complaintId, status) => {
    try {
      await apiService.updateComplaintStatus(complaintId, {
        status,
        resolution_notes: status === 'RESOLVED' ? 'Repaired leaking collar joint; normal pressure restored.' : 'Crew on-site.'
      });
      loadComplaints();
    } catch (err) {
      console.error('Error updating complaint status:', err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquareWarning className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Citizen Complaint & Issue Management
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Geotagged citizen issue reporting and rapid municipal resolution tracking.
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Water Issue</span>
        </button>
      </div>

      {/* Complaints List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {complaints.map(c => (
          <div key={c.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow space-y-3 text-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[10px] text-slate-500 font-semibold block">TICKET #{c.id}</span>
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5 mt-0.5">
                  <AlertTriangle className={`w-4 h-4 ${c.status === 'RESOLVED' ? 'text-emerald-400' : 'text-amber-400'}`} />
                  {c.complaint_type}
                </h4>
              </div>

              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                c.status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                c.status === 'IN_PROGRESS' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                'bg-blue-950 text-blue-300 border-blue-800'
              }`}>
                {c.status}
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed text-[11px]">{c.description}</p>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-[10px] text-slate-400">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                <span className="truncate">{c.location_desc}</span>
              </div>
              <div className="flex justify-between font-mono pt-0.5">
                <span>Zone: {c.related_zone}</span>
                <span>Lat: {c.latitude?.toFixed(4)}, Lng: {c.longitude?.toFixed(4)}</span>
              </div>
            </div>

            {/* Engineer Resolution Actions */}
            {(role === 'ADMIN' || role === 'MUNICIPALITY_OFFICER' || role === 'FIELD_ENGINEER') && c.status !== 'RESOLVED' && (
              <div className="flex gap-2 pt-2 border-t border-slate-800">
                {c.status === 'SUBMITTED' && (
                  <button
                    onClick={() => handleUpdateStatus(c.id, 'ASSIGNED')}
                    className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 text-[11px] font-medium transition cursor-pointer"
                  >
                    Assign to Engineer
                  </button>
                )}
                {c.status === 'ASSIGNED' && (
                  <button
                    onClick={() => handleUpdateStatus(c.id, 'IN_PROGRESS')}
                    className="flex-1 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium transition cursor-pointer"
                  >
                    Dispatch Crew
                  </button>
                )}
                {c.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleUpdateStatus(c.id, 'RESOLVED')}
                    className="flex-1 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition cursor-pointer"
                  >
                    Mark as Resolved &#10003;
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Submit Complaint Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquareWarning className="w-5 h-5 text-sky-400" />
              Report Water Issue (Citizen Portal)
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={citizenName}
                    onChange={e => setCitizenName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={citizenPhone}
                    onChange={e => setCitizenPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Complaint Type</label>
                  <select
                    value={complaintType}
                    onChange={e => setComplaintType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Pipeline leakage">Pipeline leakage</option>
                    <option value="Low pressure">Low pressure</option>
                    <option value="No water">No water</option>
                    <option value="Water quality issue">Water quality issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Sector / Zone</label>
                  <select
                    value={zone}
                    onChange={e => setZone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="ZONE_A">Zone A (North Residential)</option>
                    <option value="ZONE_B">Zone B (Central Commercial)</option>
                    <option value="ZONE_C">Zone C (South Industrial)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Location Landmark</label>
                <input
                  type="text"
                  value={locationDesc}
                  onChange={e => setLocationDesc(e.target.value)}
                  placeholder="e.g. Near 5th Cross, opposite Community Hall"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lat}
                    onChange={e => setLat(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lng}
                    onChange={e => setLng(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Problem Description</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe what you observed (e.g. pressure dropped to zero, water discoloration, puddle forming on street)..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-1.5 shadow"
                >
                  <Send className="w-3.5 h-3.5" />
                  {loading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
