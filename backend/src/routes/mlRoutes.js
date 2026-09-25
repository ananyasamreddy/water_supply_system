import express from 'express';
import { predictFailureRisk, getDemandForecast, getAllMetrics } from '../controllers/mlController.js';

const router = express.Router();

router.post('/failure-risk/predict', predictFailureRisk);
router.get('/demand/forecast', getDemandForecast);
router.get('/metrics', getAllMetrics);

export default router;
