import express from 'express';
import { getHydraulicSnapshot, getComponentTimeseries } from '../controllers/simulationController.js';

const router = express.Router();

router.get('/snapshot', getHydraulicSnapshot);
router.get('/timeseries/:componentId', getComponentTimeseries);

export default router;
