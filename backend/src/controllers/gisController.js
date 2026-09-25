import { db, isPostgresActive } from '../config/db.js';
import pythonService from '../services/pythonServiceClient.js';
import { calculateMaintenancePriority } from '../services/priorityEngine.js';

export async function getNetworkGeoJSON(req, res) {
  try {
    // 1. Fetch base GeoJSON from Python service or fallback
    let geojson = null;
    try {
      geojson = await pythonService.getNetworkGeoJSON();
    } catch (e) {
      const store = db.getFallbackStore();
      geojson = store.networkGeoJSON;
    }

    if (!geojson || !geojson.features) {
      return res.status(500).json({ error: 'Network GeoJSON not available' });
    }

    // 2. Augment pipeline features with current failure risk & maintenance priority
    const store = db.getFallbackStore();
    const complaints = store.complaints;

    const augmentedFeatures = geojson.features.map(f => {
      const props = f.properties || {};
      if (props.component_type === 'PIPELINE') {
        const pipeComplaints = complaints.filter(c => c.related_pipeline_id === props.id).length;
        
        // Calculate risk class based on age, condition, failures
        let riskClass = 'Low Risk';
        if (props.condition <= 2 || props.age_years > 38 || props.previous_failures >= 3) {
          riskClass = 'High Risk';
        } else if (props.condition === 3 || props.age_years > 22 || props.previous_failures >= 1) {
          riskClass = 'Medium Risk';
        }

        const prio = calculateMaintenancePriority({
          ...props,
          current_risk_class: riskClass
        }, pipeComplaints, 1.15);

        // Color coding for Leaflet GIS map
        let strokeColor = '#10b981'; // green = Low Risk
        if (riskClass === 'High Risk') strokeColor = '#ef4444'; // red = High Risk
        else if (riskClass === 'Medium Risk') strokeColor = '#f59e0b'; // amber = Medium Risk

        return {
          ...f,
          properties: {
            ...props,
            current_risk_class: riskClass,
            maintenance_priority: prio.priority_level,
            priority_score: prio.priority_score,
            color: strokeColor,
            complaint_count: pipeComplaints
          }
        };
      }
      return f;
    });

    return res.json({
      type: 'FeatureCollection',
      name: 'AugmentedSmartWaterNetwork',
      metadata: {
        total_features: augmentedFeatures.length,
        network_benchmark: 'EPANET Net3 Standard Public Model',
        disclaimer: 'Virtual/simulated water distribution network dataset for B.Tech project'
      },
      features: augmentedFeatures
    });
  } catch (err) {
    console.error('[GIS GeoJSON Error]:', err);
    return res.status(500).json({ error: 'Failed to retrieve GIS network GeoJSON' });
  }
}

export async function getSupplyZones(req, res) {
  const zones = [
    {
      id: 'ZONE_A',
      name: 'Zone 1: Cyberabad & Hitec City (HMWSSB Div 9 & 15)',
      color: '#3b82f6',
      population: 145000,
      avg_daily_demand_m3h: 450.0,
      coordinates: [
        [17.398, 78.445], [17.398, 78.530], [17.435, 78.530], [17.435, 78.445]
      ]
    },
    {
      id: 'ZONE_B',
      name: 'Zone 2: Secunderabad & Begumpet (HMWSSB Div 6 & 7)',
      color: '#10b981',
      population: 180000,
      avg_daily_demand_m3h: 780.0,
      coordinates: [
        [17.375, 78.445], [17.375, 78.530], [17.398, 78.530], [17.398, 78.445]
      ]
    },
    {
      id: 'ZONE_C',
      name: 'Zone 3: Old City & Charminar (HMWSSB Div 1 & 2)',
      color: '#f59e0b',
      population: 125000,
      avg_daily_demand_m3h: 620.0,
      coordinates: [
        [17.350, 78.445], [17.350, 78.530], [17.375, 78.530], [17.375, 78.445]
      ]
    }
  ];
  return res.json({ zones });
}

export default {
  getNetworkGeoJSON,
  getSupplyZones
};
