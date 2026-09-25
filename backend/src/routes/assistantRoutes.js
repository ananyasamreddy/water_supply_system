import express from 'express';
import { askAssistant } from '../controllers/assistantController.js';

const router = express.Router();

router.post('/explain', askAssistant);

export default router;
