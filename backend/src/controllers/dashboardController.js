import { db } from '../config/db.js';
import pythonService from '../services/pythonServiceClient.js';

export async function getDashboardOverview(req, res) {
  try {
    let geojson = null;
    try {
      geojson = await pythonService.getNetworkGeoJSON();
    } catch (e) {
      geojson = db.getFallbackStore().networkGeoJSON;
    }

    const store = db.getFallbackStore();
    const complaints = store.complaints;
    const maintenance = store.maintenance;

    // Component counts
    const pipes = geojson?.features?.filter(f => f.properties.component_type === 'PIPELINE') || [];
    const junctions = geojson?.features?.filter(f => f.properties.component_type === 'JUNCTION') || [];
    const tanks = geojson?.features?.filter(f => f.properties.component_type === 'TANK') || [];
    const reservoirs = geojson?.features?.filter(f => f.properties.component_type === 'RESERVOIR') || [];

    // Calculate risk breakdown
    let highRiskCount = 0;
    let medRiskCount = 0;
    let lowRiskCount = 0;

    pipes.forEach(p => {
      const props = p.properties;
      if (props.condition <= 2 || props.age_years > 38 || props.previous_failures >= 3) highRiskCount++;
      else if (props.condition === 3 || props.age_years > 22 || props.previous_failures >= 1) medRiskCount++;
      else lowRiskCount++;
    });

    // Complaint stats
    const activeComplaints = complaints.filter(c => ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS'].includes(c.status)).length;
    const resolvedComplaints = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;

    // Maintenance stats
    const activeMaintenance = maintenance.filter(m => m.status !== 'COMPLETED').length;
    const urgentMaintenance = maintenance.filter(m => m.priority_level === 'URGENT' && m.status !== 'COMPLETED').length;

    // Hydraulic summary
    let hydraulicKpis = {
      avg_pressure_psi: 34.2,
      min_pressure_psi: 21.8,
      total_demand_lps: 940.5,
      total_flow_lps: 1280.0
    };
    try {
      const snap = await pythonService.getHydraulicSnapshot(12);
      if (snap && snap.kpis) hydraulicKpis = snap.kpis;
    } catch (e) {
      // Nominal values
    }

    return res.json({
      summary: {
        total_pipelines: pipes.length,
        high_risk_pipelines: highRiskCount,
        medium_risk_pipelines: medRiskCount,
        low_risk_pipelines: lowRiskCount,
        total_junctions: junctions.length,
        total_tanks: tanks.length,
        total_reservoirs: reservoirs.length,
        active_complaints: activeComplaints,
        resolved_complaints: resolvedComplaints,
        active_maintenance_orders: activeMaintenance,
        urgent_maintenance_orders: urgentMaintenance,
        hydraulics: hydraulicKpis
      },
      charts: {
        risk_distribution: [
          { label: 'Low Risk', count: lowRiskCount, color: '#10b981' },
          { label: 'Medium Risk', count: medRiskCount, color: '#f59e0b' },
          { label: 'High Risk', count: highRiskCount, color: '#ef4444' }
        ],
        complaints_by_type: [
          { type: 'Pipeline leakage', count: complaints.filter(c => c.complaint_type === 'Pipeline leakage').length },
          { type: 'Low pressure', count: complaints.filter(c => c.complaint_type === 'Low pressure').length },
          { type: 'No water', count: complaints.filter(c => c.complaint_type === 'No water').length },
          { type: 'Water quality issue', count: complaints.filter(c => c.complaint_type === 'Water quality issue').length }
        ],
        maintenance_by_priority: [
          { priority: 'URGENT', count: maintenance.filter(m => m.priority_level === 'URGENT').length },
          { priority: 'HIGH', count: maintenance.filter(m => m.priority_level === 'HIGH').length },
          { priority: 'MEDIUM', count: maintenance.filter(m => m.priority_level === 'MEDIUM').length },
          { priority: 'LOW', count: maintenance.filter(m => m.priority_level === 'LOW').length }
        ]
      }
    });
  } catch (err) {
    console.error('[Dashboard Overview Error]:', err);
    return res.status(500).json({ error: 'Failed to retrieve dashboard overview' });
  }
}

export default {
  getDashboardOverview
};
