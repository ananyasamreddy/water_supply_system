import React, { useState, useEffect } from 'react';
import { apiService } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { Wrench, Plus, CheckCircle2, Clock, AlertTriangle, ArrowRight, DollarSign, Calendar } from 'lucide-react';
import { PriorityBadge } from '../components/MetricCard';

export default function MaintenancePage() {
  const { role, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [activeTab, setActiveTab] = useState('WORK_ORDERS'); // 'WORK_ORDERS' | 'PRIORITY_QUEUE'
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // New task form state
  const [newPipeId, setNewPipeId] = useState('P_102');
  const [newProblem, setNewProblem] = useState('');
  const [newPriority, setNewPriority] = useState('URGENT');

  const loadData = async () => {
    try {
      const [mRes, pRes] = await Promise.all([
        apiService.getMaintenanceList(),
        apiService.getPriorities()
      ]);
      setTasks(mRes.data.maintenance || []);
      setPriorities(pRes.data.priorities || []);
    } catch (err) {
      console.error('Error fetching maintenance:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await apiService.createMaintenanceTask({
        pipeline_id: newPipeId,
        problem_description: newProblem || 'Elevated structural degradation risk detected on distribution main',
        priority_level: newPriority,
        priority_score: newPriority === 'URGENT' ? 88.0 : 72.0,
        assigned_engineer_name: user?.name || 'Priya Sharma'
      });
      setShowModal(false);
      setNewProblem('');
      loadData();
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await apiService.updateMaintenanceStatus(taskId, {
        status: newStatus,
        action_taken: newStatus === 'COMPLETED' ? 'Ultrasonic inspection completed; joint clamp installed and tested to 10 bar.' : 'Dispatched inspection crew to site.'
      });
      loadData();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Kanban buckets
  const pendingTasks = tasks.filter(t => t.status === 'PENDING');
  const assignedTasks = tasks.filter(t => t.status === 'ASSIGNED');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Maintenance Management & Prioritization
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Multi-criteria prioritization and rapid dispatch workflow for proactive water asset rehabilitation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 rounded-xl p-1 border border-slate-800 flex text-xs">
            <button
              onClick={() => setActiveTab('WORK_ORDERS')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'WORK_ORDERS' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Work Orders Kanban
            </button>
            <button
              onClick={() => setActiveTab('PRIORITY_QUEUE')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'PRIORITY_QUEUE' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Multi-Factor Priorities ({priorities.length})
            </button>
          </div>

          {(role === 'ADMIN' || role === 'MUNICIPALITY_OFFICER' || role === 'FIELD_ENGINEER') && (
            <button
              onClick={() => setShowModal(true)}
              className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Work Order</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Kanban Workflow Board */}
      {activeTab === 'WORK_ORDERS' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 1. Pending */}
          <div className="space-y-3">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center text-xs font-bold text-slate-300">
              <span>1. Pending Approval</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">{pendingTasks.length}</span>
            </div>
            <div className="space-y-3">
              {pendingTasks.map(t => (
                <div key={t.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-sky-400">{t.pipeline_id}</span>
                    <PriorityBadge level={t.priority_level} />
                  </div>
                  <p className="text-slate-300 text-[11px]">{t.problem_description}</p>
                  <button
                    onClick={() => handleUpdateStatus(t.id, 'ASSIGNED')}
                    className="w-full mt-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition cursor-pointer"
                  >
                    Assign to Engineer &rarr;
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Assigned */}
          <div className="space-y-3">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center text-xs font-bold text-blue-300">
              <span>2. Assigned</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">{assignedTasks.length}</span>
            </div>
            <div className="space-y-3">
              {assignedTasks.map(t => (
                <div key={t.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-sky-400">{t.pipeline_id}</span>
                    <PriorityBadge level={t.priority_level} />
                  </div>
                  <p className="text-slate-300 text-[11px]">{t.problem_description}</p>
                  <div className="text-[10px] text-slate-400">
                    Lead: <strong className="text-white">{t.assigned_engineer_name}</strong>
                  </div>
                  <button
                    onClick={() => handleUpdateStatus(t.id, 'IN_PROGRESS')}
                    className="w-full mt-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium transition cursor-pointer"
                  >
                    Start Repair &rarr;
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 3. In Progress */}
          <div className="space-y-3">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center text-xs font-bold text-amber-300">
              <span>3. In Progress</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">{inProgressTasks.length}</span>
            </div>
            <div className="space-y-3">
              {inProgressTasks.map(t => (
                <div key={t.id} className="p-4 rounded-xl bg-slate-900 border border-amber-800/40 shadow space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-sky-400">{t.pipeline_id}</span>
                    <PriorityBadge level={t.priority_level} />
                  </div>
                  <p className="text-slate-300 text-[11px]">{t.problem_description}</p>
                  <div className="p-2 rounded bg-slate-950 text-[10px] text-slate-400 border border-slate-800">
                    Action: <span className="text-amber-300">{t.action_taken || 'Crew on-site performing non-destructive testing'}</span>
                  </div>
                  <button
                    onClick={() => handleUpdateStatus(t.id, 'COMPLETED')}
                    className="w-full mt-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition cursor-pointer"
                  >
                    Mark as Completed &#10003;
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Completed */}
          <div className="space-y-3">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center text-xs font-bold text-emerald-300">
              <span>4. Completed History</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">{completedTasks.length}</span>
            </div>
            <div className="space-y-3">
              {completedTasks.map(t => (
                <div key={t.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs opacity-80">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-slate-400">{t.pipeline_id}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Resolved
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] line-clamp-2">{t.problem_description}</p>
                  <div className="text-[10px] text-slate-500 flex justify-between pt-1 border-t border-slate-800">
                    <span>Date: {t.completion_date || 'Recent'}</span>
                    <span>Cost: ₹{t.cost_estimated?.toLocaleString() || '45,000'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Multi-Factor Priority Queue */}
      {activeTab === 'PRIORITY_QUEUE' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Transparent Multi-Factor Prioritization Queue
              </h3>
              <p className="text-[11px] text-slate-400">
                Score (0-100) = (0.30 * Risk) + (0.20 * Condition) + (0.20 * Criticality) + (0.15 * Failures) + (0.10 * Hydraulic) + (0.05 * Complaints)
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Pipeline ID</th>
                  <th className="p-3">Material & Diam</th>
                  <th className="p-3">Age</th>
                  <th className="p-3">Condition</th>
                  <th className="p-3">Bursts</th>
                  <th className="p-3">Risk Class</th>
                  <th className="p-3">Priority Score</th>
                  <th className="p-3">Priority Level</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {priorities.slice(0, 15).map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-sky-400">#{idx + 1}</td>
                    <td className="p-3 font-mono font-bold text-white">{p.id}</td>
                    <td className="p-3">{p.material} ({p.diameter_mm} mm)</td>
                    <td className="p-3">{p.age_years} yrs</td>
                    <td className="p-3">{p.condition}/5</td>
                    <td className="p-3">{p.previous_failures}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        p.current_risk === 'High Risk' ? 'text-red-400 bg-red-950/60' : 'text-amber-400 bg-amber-950/60'
                      }`}>
                        {p.current_risk}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-white">{p.priority_score}</td>
                    <td className="p-3">
                      <PriorityBadge level={p.priority_level} />
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          setNewPipeId(p.id);
                          setNewProblem(`High failure risk asset (${p.current_risk}) prioritized by multi-criteria formula.`);
                          setNewPriority(p.priority_level);
                          setShowModal(true);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 font-medium text-[11px] transition cursor-pointer"
                      >
                        Schedule
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Work Order Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create Maintenance Work Order</h3>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Pipeline ID</label>
                <input
                  type="text"
                  value={newPipeId}
                  onChange={e => setNewPipeId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Priority Level</label>
                <select
                  value={newPriority}
                  onChange={e => setNewPriority(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="URGENT">URGENT (Acoustic / NDT within 24h)</option>
                  <option value="HIGH">HIGH (Scheduled this week)</option>
                  <option value="MEDIUM">MEDIUM (Standard maintenance)</option>
                  <option value="LOW">LOW (Cyclical inspection)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Problem Description</label>
                <textarea
                  rows="3"
                  value={newProblem}
                  onChange={e => setNewProblem(e.target.value)}
                  placeholder="Detail symptoms, risk reasons, or citizen complaint references..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
