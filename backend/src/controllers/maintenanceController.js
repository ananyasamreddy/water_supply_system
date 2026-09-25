import { db, isPostgresActive } from '../config/db.js';
import pythonService from '../services/pythonServiceClient.js';
import { calculateMaintenancePriority } from '../services/priorityEngine.js';

export async function getMaintenanceList(req, res) {
  try {
    const { status, priority, engineer } = req.query;

    if (isPostgresActive()) {
      let query = 'SELECT * FROM maintenance WHERE 1=1';
      const params = [];
      if (status) {
        params.push(status);
        query += ` AND status = $${params.length}`;
      }
      if (priority) {
        params.push(priority);
        query += ` AND priority_level = $${params.length}`;
      }
      query += ' ORDER BY priority_score DESC, scheduled_date ASC';
      const result = await db.query(query, params);
      return res.json({ total: result.rows.length, maintenance: result.rows });
    }

    const store = db.getFallbackStore();
    let list = [...store.maintenance];
    if (status) list = list.filter(m => m.status === status);
    if (priority) list = list.filter(m => m.priority_level === priority);
    if (engineer) list = list.filter(m => m.assigned_engineer_name?.toLowerCase().includes(engineer.toLowerCase()));

    list.sort((a, b) => b.priority_score - a.priority_score);
    return res.json({ total: list.length, maintenance: list });
  } catch (err) {
    console.error('[Maintenance List Error]:', err);
    return res.status(500).json({ error: 'Failed to retrieve maintenance records' });
  }
}

export async function createMaintenanceTask(req, res) {
  try {
    const { pipeline_id, problem_description, assigned_engineer_id, assigned_engineer_name, priority_level, priority_score, scheduled_date, cost_estimated } = req.body;

    if (!pipeline_id || !problem_description) {
      return res.status(400).json({ error: 'Pipeline ID and problem description are required' });
    }

    const newTask = {
      pipeline_id,
      problem_description,
      assigned_engineer_id: assigned_engineer_id || 3,
      assigned_engineer_name: assigned_engineer_name || 'Priya Sharma',
      priority_level: priority_level || 'HIGH',
      priority_score: priority_score || 75.0,
      status: 'ASSIGNED',
      scheduled_date: scheduled_date || new Date().toISOString().split('T')[0],
      action_taken: '',
      cost_estimated: cost_estimated || 25000.0,
      created_at: new Date().toISOString()
    };

    if (isPostgresActive()) {
      const result = await db.query(
        `INSERT INTO maintenance (pipeline_id, problem_description, assigned_engineer_id, assigned_engineer_name, priority_level, priority_score, status, scheduled_date, cost_estimated)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [newTask.pipeline_id, newTask.problem_description, newTask.assigned_engineer_id, newTask.assigned_engineer_name, newTask.priority_level, newTask.priority_score, newTask.status, newTask.scheduled_date, newTask.cost_estimated]
      );
      return res.status(201).json({ message: 'Maintenance task created', task: result.rows[0] });
    }

    const store = db.getFallbackStore();
    newTask.id = store.maintenance.length + 1;
    store.maintenance.unshift(newTask);
    return res.status(201).json({ message: 'Maintenance task created', task: newTask });
  } catch (err) {
    console.error('[Create Maintenance Error]:', err);
    return res.status(500).json({ error: 'Failed to create maintenance task' });
  }
}

export async function updateMaintenanceStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, action_taken, remarks, cost_estimated } = req.body;

    if (!['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const completionDate = status === 'COMPLETED' ? new Date().toISOString().split('T')[0] : null;

    if (isPostgresActive()) {
      const result = await db.query(
        `UPDATE maintenance
         SET status = $1, action_taken = COALESCE($2, action_taken), remarks = COALESCE($3, remarks),
             cost_estimated = COALESCE($4, cost_estimated), completion_date = COALESCE($5, completion_date),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $6 RETURNING *`,
        [status, action_taken, remarks, cost_estimated, completionDate, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
      return res.json({ message: 'Status updated', task: result.rows[0] });
    }

    const store = db.getFallbackStore();
    const task = store.maintenance.find(m => m.id === parseInt(id, 10));
    if (!task) return res.status(404).json({ error: 'Task not found' });

    task.status = status;
    if (action_taken) task.action_taken = action_taken;
    if (remarks) task.remarks = remarks;
    if (cost_estimated) task.cost_estimated = cost_estimated;
    if (completionDate) task.completion_date = completionDate;

    return res.json({ message: 'Status updated', task });
  } catch (err) {
    console.error('[Update Maintenance Status Error]:', err);
    return res.status(500).json({ error: 'Failed to update maintenance task' });
  }
}

export async function getPrioritizedPipelines(req, res) {
  try {
    let geojson = null;
    try {
      geojson = await pythonService.getNetworkGeoJSON();
    } catch (e) {
      geojson = db.getFallbackStore().networkGeoJSON;
    }

    const store = db.getFallbackStore();
    const complaints = store.complaints;

    const prioritized = geojson.features
      .filter(f => f.properties.component_type === 'PIPELINE')
      .map(f => {
        const props = f.properties;
        const pipeComplaints = complaints.filter(c => c.related_pipeline_id === props.id).length;
        
        let riskClass = 'Low Risk';
        if (props.condition <= 2 || props.age_years > 38 || props.previous_failures >= 3) riskClass = 'High Risk';
        else if (props.condition === 3 || props.age_years > 22 || props.previous_failures >= 1) riskClass = 'Medium Risk';

        const prio = calculateMaintenancePriority({ ...props, current_risk_class: riskClass }, pipeComplaints);
        return {
          id: props.id,
          material: props.material,
          diameter_mm: props.diameter_mm,
          age_years: props.age_years,
          condition: props.condition,
          criticality: props.criticality,
          previous_failures: props.previous_failures,
          current_risk: riskClass,
          priority_level: prio.priority_level,
          priority_score: prio.priority_score,
          factor_breakdown: prio.factor_breakdown,
          recommendation: prio.recommendation,
          complaints_count: pipeComplaints
        };
      });

    prioritized.sort((a, b) => b.priority_score - a.priority_score);

    return res.json({
      total_ranked: prioritized.length,
      urgent_count: prioritized.filter(p => p.priority_level === 'URGENT').length,
      high_count: prioritized.filter(p => p.priority_level === 'HIGH').length,
      medium_count: prioritized.filter(p => p.priority_level === 'MEDIUM').length,
      low_count: prioritized.filter(p => p.priority_level === 'LOW').length,
      priorities: prioritized
    });
  } catch (err) {
    console.error('[Priority Ranking Error]:', err);
    return res.status(500).json({ error: 'Failed to compute maintenance priorities' });
  }
}

export default {
  getMaintenanceList,
  createMaintenanceTask,
  updateMaintenanceStatus,
  getPrioritizedPipelines
};
