import express from 'express';
import { runLeakLocalization } from '../controllers/leakController.js';

const router = express.Router();

router.post('/localize', runLeakLocalization);

export default router;
