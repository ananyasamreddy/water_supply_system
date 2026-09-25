import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../api/apiClient';
import {
  Droplets,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  PhoneCall,
  Calendar,
  ShieldCheck,
  MapPin,
  FileText,
  Activity,
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';

export default function CitizenPortal({ onNavigate }) {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Form State
  const [category, setCategory] = useState('LOW_PRESSURE');
  const [description, setDescription] = useState('');
  const [locality, setLocality] = useState('Central Zone - 4th Cross Road');
  const [severity, setSeverity] = useState('MEDIUM');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const loadCitizenComplaints = async () => {
    try {
      setLoading(true);
      const res = await apiService.getComplaints();
      const allComplaints = res.data.complaints || [];
      // Filter by citizen or show recent zone complaints
      setComplaints(allComplaints);
    } catch (err) {
      console.error('Error fetching citizen complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCitizenComplaints();
  }, []);

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!description) return;
    try {
      setSubmitting(true);
      await apiService.submitComplaint({
        category,
        description: `[${locality}] ${description}`,
        citizen_name: user?.name || 'Citizen User',
        phone: user?.phone || '9876543210',
        latitude: 12.9725,
        longitude: 77.5955
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowSubmitModal(false);
        setSubmitSuccess(false);
        setDescription('');
        loadCitizenComplaints();
      }, 1500);
    } catch (err) {
      console.error('Error submitting complaint:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-left">
      
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-sky-950/50 border border-emerald-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Public Consumer Water Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Namaste, {user?.name || 'Citizen'}!
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Welcome to the official municipal water distribution advisory & grievance management portal. 
            Track daily supply schedules, check potable water quality, and report pipeline issues with direct municipal oversight.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Report Water Problem</span>
          </button>
        </div>
      </div>

      {/* Water Supply Schedule & Quality Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Morning Supply */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              Morning Supply
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
              COMPLETED
            </span>
          </div>
          <div className="text-lg font-bold text-white font-mono">06:00 AM - 09:00 AM</div>
          <p className="text-[11px] text-slate-400">Normal pressurized supply delivered across all residential sectors.</p>
        </div>

        {/* Evening Supply */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Evening Supply
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-sky-950 text-sky-400 border border-sky-800 font-semibold">
              SCHEDULED
            </span>
          </div>
          <div className="text-lg font-bold text-white font-mono">06:00 PM - 08:30 PM</div>
          <p className="text-[11px] text-slate-400">Pumping stations primed. Peak evening distribution on schedule.</p>
        </div>

        {/* Water Quality Rating */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              Water Quality Index
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
              POTABLE
            </span>
          </div>
          <div className="text-lg font-bold text-emerald-400 font-mono">98.4% (Grade A)</div>
          <p className="text-[11px] text-slate-400">Chlorine residual 0.6 mg/L, Turbidity 0.8 NTU. Safe for consumption.</p>
        </div>

        {/* Zone Pressure */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              Delivery Pressure
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-sky-950 text-sky-400 border border-sky-800 font-semibold">
              OPTIMAL
            </span>
          </div>
          <div className="text-lg font-bold text-sky-400 font-mono">28.5 psi (2.0 bar)</div>
          <p className="text-[11px] text-slate-400">Sufficient head pressure for overhead storage tanks up to 3 floors.</p>
        </div>

      </div>

      {/* Main Grid: My Grievances & Municipal Bulletins */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Grievances Tracker */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                <span>My Reported Issues & Grievances</span>
              </h2>
              <p className="text-xs text-slate-400">Track resolution milestones by municipal maintenance crews</p>
            </div>
            <button
              onClick={loadCitizenComplaints}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium"
            >
              Refresh Status
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-500">Loading your grievances...</div>
          ) : complaints.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl">
              No active complaints filed. Water distribution operating smoothly in your area.
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.slice(0, 5).map((comp) => {
                const statusColors = {
                  PENDING: 'bg-amber-950 text-amber-400 border-amber-800',
                  IN_PROGRESS: 'bg-sky-950 text-sky-400 border-sky-800',
                  RESOLVED: 'bg-emerald-950 text-emerald-400 border-emerald-800'
                };
                return (
                  <div key={comp.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">#{comp.complaint_id || `GRV-${comp.id}`}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-semibold text-sky-300">{comp.category?.replace('_', ' ')}</span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${statusColors[comp.status] || 'bg-slate-800 text-slate-300'}`}>
                        {comp.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">{comp.description}</p>

                    {/* Progress Step Indicator */}
                    <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> Grievance Logged
                      </span>
                      <span className="h-px flex-1 mx-2 bg-slate-800" />
                      <span className={`flex items-center gap-1 ${comp.status !== 'PENDING' ? 'text-emerald-400' : 'text-slate-500'}`}>
                        <CheckCircle2 className="w-3 h-3" /> Field Inspection
                      </span>
                      <span className="h-px flex-1 mx-2 bg-slate-800" />
                      <span className={`flex items-center gap-1 ${comp.status === 'RESOLVED' ? 'text-emerald-400' : 'text-slate-500'}`}>
                        <CheckCircle2 className="w-3 h-3" /> Repaired & Closed
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Consumer Bulletins & Helpline */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Emergency Helpline Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-950/60 to-slate-900 border border-sky-800/50 space-y-3">
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs">
              <PhoneCall className="w-4 h-4" />
              <span>24x7 Municipal Water Helpline</span>
            </div>
            <div className="text-xl font-bold text-white font-mono tracking-tight">
              1800-425-9283
            </div>
            <p className="text-[11px] text-slate-400">
              For major pipeline bursts, road waterlogging, or emergency drinking water tanker requests.
            </p>
          </div>

          {/* Conservation Advice */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
              <TrendingDown className="w-4 h-4" />
              <span>Water Conservation Advice</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>Install aerators on household taps to reduce flow by up to 35%.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>Check overhead tank overflow valves periodically to eliminate wastage.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>Report underground seepage dampness promptly to prevent major road cave-ins.</span>
              </li>
            </ul>
          </div>

          {/* Maintenance Notice */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <span>
              Municipal pipeline descaling is scheduled in Zone 2 on Sunday midnight. Supply will resume normally at 06:00 AM.
            </span>
          </div>

        </div>

      </div>

      {/* Modal: Report Water Problem */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Report Water Issue</h3>
                <p className="text-xs text-slate-400">Submit a geotagged grievance directly to the municipal water board</p>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                ✕
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Grievance Registered Successfully!</h4>
                <p className="text-xs text-slate-400">Assigned tracking ID: #GRV-{Math.floor(1000 + Math.random() * 9000)}. Maintenance team notified.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitComplaint} className="space-y-3 text-left">
                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">Issue Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="LOW_PRESSURE">Low Water Pressure at Taps</option>
                    <option value="DIRTY_WATER">Discolored / Contaminated Water</option>
                    <option value="VISIBLE_LEAK">Visible Main Road Pipeline Leak / Burst</option>
                    <option value="NO_WATER">Total Water Supply Cutoff</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">Locality Landmark / Street</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      placeholder="e.g. 14th Main Road, Near Water Tank"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">Problem Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the issue, estimated severity, and any visible water accumulation..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-emerald-600/30"
                  >
                    {submitting ? 'Submitting...' : 'Submit Grievance'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
