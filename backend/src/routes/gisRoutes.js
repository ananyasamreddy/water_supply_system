import express from 'express';
import { getNetworkGeoJSON, getSupplyZones } from '../controllers/gisController.js';

const router = express.Router();

router.get('/network', getNetworkGeoJSON);
router.get('/zones', getSupplyZones);

export default router;
