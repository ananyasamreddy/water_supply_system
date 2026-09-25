import express from 'express';
import { getPipelines, getPipelineById } from '../controllers/pipelineController.js';

const router = express.Router();

router.get('/', getPipelines);
router.get('/:id', getPipelineById);

export default router;
