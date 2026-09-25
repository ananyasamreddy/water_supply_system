import pythonService from '../services/pythonServiceClient.js';

export async function getHydraulicSnapshot(req, res) {
  try {
    const hour = parseInt(req.query.hour || '12', 10);
    const data = await pythonService.getHydraulicSnapshot(hour);
    return res.json(data);
  } catch (err) {
    console.error('[Hydraulic Snapshot Error]:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve simulation snapshot' });
  }
}

export async function getComponentTimeseries(req, res) {
  try {
    const { componentId } = req.params;
    const hours = parseInt(req.query.hours || '72', 10);
    const data = await pythonService.getComponentTimeseries(componentId, hours);
    return res.json(data);
  } catch (err) {
    console.error('[Component Timeseries Error]:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve component timeseries' });
  }
}

export default {
  getHydraulicSnapshot,
  getComponentTimeseries
};
