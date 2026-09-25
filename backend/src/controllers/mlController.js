import pythonService from '../services/pythonServiceClient.js';

export async function predictFailureRisk(req, res) {
  try {
    const features = req.body;
    const prediction = await pythonService.predictFailureRisk(features);
    return res.json(prediction);
  } catch (err) {
    console.error('[ML Failure Risk Error]:', err.message);
    return res.status(500).json({ error: 'Failed to predict failure risk' });
  }
}

export async function getDemandForecast(req, res) {
  try {
    const zone = req.query.zone || 'ZONE_A';
    const horizon = parseInt(req.query.horizon || '24', 10);
    const forecast = await pythonService.getDemandForecast(zone, horizon);
    return res.json(forecast);
  } catch (err) {
    console.error('[ML Demand Forecast Error]:', err.message);
    return res.status(500).json({ error: 'Failed to generate demand forecast' });
  }
}

export async function getAllMetrics(req, res) {
  try {
    const metrics = await pythonService.getAllMetrics();
    return res.json({
      timestamp: new Date().toISOString(),
      disclaimer: 'Actual cross-validation and test set evaluation metrics from trained scikit-learn and XGBoost models',
      ...metrics
    });
  } catch (err) {
    console.error('[ML Metrics Error]:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve model metrics' });
  }
}

export default {
  predictFailureRisk,
  getDemandForecast,
  getAllMetrics
};
