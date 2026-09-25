import express from 'express';
import { getMaintenanceList, createMaintenanceTask, updateMaintenanceStatus, getPrioritizedPipelines } from '../controllers/maintenanceController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getMaintenanceList);
router.get('/priorities', getPrioritizedPipelines);
router.post('/', authenticateToken, createMaintenanceTask);
router.patch('/:id/status', authenticateToken, updateMaintenanceStatus);

export default router;
