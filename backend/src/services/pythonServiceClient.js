import axios from 'axios';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: PYTHON_SERVICE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const pythonService = {
  getHealth: async () => {
    const res = await client.get('/health');
    return res.data;
  },

  getNetworkGeoJSON: async () => {
    const res = await client.get('/network/geojson');
    return res.data;
  },

  getHydraulicSnapshot: async (hour = 12) => {
    const res = await client.get(`/simulation/hydraulic/snapshot?hour=${hour}`);
    return res.data;
  },

  getComponentTimeseries: async (componentId, hours = 72) => {
    const res = await client.get(`/simulation/component-timeseries/${encodeURIComponent(componentId)}?hours=${hours}`);
    return res.data;
  },

  runWhatIf: async (scenarioType, targetComponent, parameters = {}, hourStep = 14) => {
    const res = await client.post('/simulation/what-if', {
      scenario_type: scenarioType,
      target_component: targetComponent,
      parameters,
      hour_step: hourStep
    });
    return res.data;
  },

  runLeakLocalization: async (leakPipeId = 'P_102', simulatedLeakRateLps = 28.0) => {
    const res = await client.post('/simulation/leak-localization', {
      leak_pipe_id: leakPipeId,
      simulated_leak_rate_lps: simulatedLeakRateLps
    });
    return res.data;
  },

  predictFailureRisk: async (features) => {
    const res = await client.post('/ml/failure-risk/predict', features);
    return res.data;
  },

  getDemandForecast: async (zone = 'ZONE_A', horizon = 24) => {
    const res = await client.get(`/ml/demand/forecast?zone=${zone}&horizon=${horizon}`);
    return res.data;
  },

  getAllMetrics: async () => {
    const res = await client.get('/metrics/all');
    return res.data;
  }
};

export default pythonService;
