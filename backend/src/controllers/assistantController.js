import { explainWithAI } from '../services/geminiService.js';

export async function askAssistant(req, res) {
  try {
    const { promptType = 'GENERAL', contextData = {}, userQuestion = '' } = req.body;

    const response = await explainWithAI({
      promptType,
      contextData,
      userQuestion
    });

    return res.json(response);
  } catch (err) {
    console.error('[Assistant Controller Error]:', err);
    return res.status(500).json({ error: 'Failed to generate explanation' });
  }
}

export default {
  askAssistant
};
