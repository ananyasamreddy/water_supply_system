import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import gisRoutes from './routes/gisRoutes.js';
import pipelineRoutes from './routes/pipelineRoutes.js';
import simulationRoutes from './routes/simulationRoutes.js';
import whatIfRoutes from './routes/whatIfRoutes.js';
import leakRoutes from './routes/leakRoutes.js';
import mlRoutes from './routes/mlRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import assistantRoutes from './routes/assistantRoutes.js';
import { isPostgresActive } from './config/db.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Base health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Smart Water Supply Network Node.js Backend',
    database_mode: isPostgresActive() ? 'PostgreSQL + PostGIS (Active)' : 'Embedded Resilient Store (Active)',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/gis', gisRoutes);
app.use('/api/pipelines', pipelineRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/what-if', whatIfRoutes);
app.use('/api/leak-localization', leakRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/assistant', assistantRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Global Error]:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error occurred'
  });
});

export default app;
