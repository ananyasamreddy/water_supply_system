import express from 'express';
import { getComplaints, submitComplaint, updateComplaintStatus } from '../controllers/complaintController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getComplaints);
router.post('/', authenticateToken, submitComplaint);
router.patch('/:id/status', authenticateToken, updateComplaintStatus);

export default router;
