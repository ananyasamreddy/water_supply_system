import express from 'express';
import { runWhatIfScenario } from '../controllers/whatIfController.js';

const router = express.Router();

router.post('/', runWhatIfScenario);

export default router;
