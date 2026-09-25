import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('water_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const apiService = {
  // Auth
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  quickLogin: (role) => api.post('/auth/quick-login', { role }),
  getMe: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users'),

  // GIS & Pipelines
  getNetworkGeoJSON: () => api.get('/gis/network'),
  getSupplyZones: () => api.get('/gis/zones'),
  getPipelines: (params) => api.get('/pipelines', { params }),
  getPipelineById: (id) => api.get(`/pipelines/${id}`),

  // Simulation
  getHydraulicSnapshot: (hour) => api.get(`/simulation/snapshot?hour=${hour}`),
  getComponentTimeseries: (id, hours = 72) => api.get(`/simulation/timeseries/${id}?hours=${hours}`),

  // What-If & Leak
  runWhatIf: (data) => api.post('/what-if', data),
  runLeakLocalization: (data) => api.post('/leak-localization/localize', data),

  // Machine Learning
  predictFailureRisk: (features) => api.post('/ml/failure-risk/predict', features),
  getDemandForecast: (zone, horizon = 24) => api.get(`/ml/demand/forecast?zone=${zone}&horizon=${horizon}`),
  getModelMetrics: () => api.get('/ml/metrics'),

  // Maintenance
  getMaintenanceList: (params) => api.get('/maintenance', { params }),
  getPriorities: () => api.get('/maintenance/priorities'),
  createMaintenanceTask: (task) => api.post('/maintenance', task),
  updateMaintenanceStatus: (id, data) => api.patch(`/maintenance/${id}/status`, data),

  // Complaints
  getComplaints: (params) => api.get('/complaints', { params }),
  submitComplaint: (complaint) => api.post('/complaints', complaint),
  updateComplaintStatus: (id, data) => api.patch(`/complaints/${id}/status`, data),

  // Dashboard & Assistant
  getDashboardOverview: () => api.get('/dashboard/overview'),
  askAssistant: (data) => api.post('/assistant/explain', data)
};

export default apiService;
