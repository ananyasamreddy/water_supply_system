import pythonService from '../services/pythonServiceClient.js';

export async function runLeakLocalization(req, res) {
  try {
    const { leak_pipe_id = 'P_102', simulated_leak_rate_lps = 28.0 } = req.body;

    const result = await pythonService.runLeakLocalization(leak_pipe_id, parseFloat(simulated_leak_rate_lps));
    return res.json(result);
  } catch (err) {
    console.error('[Leak Localization Error]:', err.message);
    return res.status(500).json({ error: 'Failed to execute simulated leak localization' });
  }
}

export default {
  runLeakLocalization
};
