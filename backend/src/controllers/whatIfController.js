import pythonService from '../services/pythonServiceClient.js';

export async function runWhatIfScenario(req, res) {
  try {
    const { scenario_type = 'PIPE_FAILURE', target_component = 'P_102', parameters = {}, hour_step = 14 } = req.body;

    const result = await pythonService.runWhatIf(scenario_type, target_component, parameters, hour_step);
    return res.json(result);
  } catch (err) {
    console.error('[What-If Controller Error]:', err.message);
    return res.status(500).json({ error: 'Failed to run what-if simulation' });
  }
}

export default {
  runWhatIfScenario
};
