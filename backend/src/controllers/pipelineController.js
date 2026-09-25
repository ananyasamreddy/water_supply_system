import { db } from '../config/db.js';
import pythonService from '../services/pythonServiceClient.js';
import { calculateMaintenancePriority } from '../services/priorityEngine.js';

export async function getPipelines(req, res) {
  try {
    let geojson = null;
    try {
      geojson = await pythonService.getNetworkGeoJSON();
    } catch (e) {
      geojson = db.getFallbackStore().networkGeoJSON;
    }

    if (!geojson || !geojson.features) {
      return res.status(500).json({ error: 'Network data not loaded' });
    }

    const store = db.getFallbackStore();
    const complaints = store.complaints;

    const pipes = geojson.features
      .filter(f => f.properties.component_type === 'PIPELINE')
      .map(f => {
        const props = f.properties;
        const pipeComplaints = complaints.filter(c => c.related_pipeline_id === props.id).length;

        let riskClass = 'Low Risk';
        if (props.condition <= 2 || props.age_years > 38 || props.previous_failures >= 3) {
          riskClass = 'High Risk';
        } else if (props.condition === 3 || props.age_years > 22 || props.previous_failures >= 1) {
          riskClass = 'Medium Risk';
        }

        const prio = calculateMaintenancePriority({ ...props, current_risk_class: riskClass }, pipeComplaints);

        return {
          ...props,
          current_risk_class: riskClass,
          maintenance_priority: prio.priority_level,
          priority_score: prio.priority_score,
          recommendation: prio.recommendation,
          complaint_count: pipeComplaints
        };
      });

    // Sorting options: priority_score, age_years, length_m
    const sortBy = req.query.sort || 'priority_score';
    pipes.sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));

    return res.json({
      total: pipes.length,
      pipelines: pipes
    });
  } catch (err) {
    console.error('[Pipelines Controller Error]:', err);
    return res.status(500).json({ error: 'Failed to retrieve pipelines' });
  }
}

export async function getPipelineById(req, res) {
  try {
    const { id } = req.params;
    let geojson = null;
    try {
      geojson = await pythonService.getNetworkGeoJSON();
    } catch (e) {
      geojson = db.getFallbackStore().networkGeoJSON;
    }

    const feature = geojson?.features?.find(f => f.properties.id === id);
    if (!feature) {
      return res.status(404).json({ error: `Pipeline ${id} not found` });
    }

    const props = feature.properties;
    const store = db.getFallbackStore();
    const complaints = store.complaints.filter(c => c.related_pipeline_id === id);
    const maintenance = store.maintenance.filter(m => m.pipeline_id === id);

    let riskClass = 'Low Risk';
    if (props.condition <= 2 || props.age_years > 38 || props.previous_failures >= 3) {
      riskClass = 'High Risk';
    } else if (props.condition === 3 || props.age_years > 22 || props.previous_failures >= 1) {
      riskClass = 'Medium Risk';
    }

    const prio = calculateMaintenancePriority({ ...props, current_risk_class: riskClass }, complaints.length);

    return res.json({
      pipeline: {
        ...props,
        geometry: feature.geometry,
        current_risk_class: riskClass,
        priority: prio,
        complaints,
        maintenance_history: maintenance
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching pipeline details' });
  }
}

export default {
  getPipelines,
  getPipelineById
};
