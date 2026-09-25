import express from 'express';
import { register, login, me, quickDemoLogin, getUsers } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/quick-login', quickDemoLogin);
router.get('/me', authenticateToken, me);
router.get('/users', authenticateToken, requireRole(['ADMIN']), getUsers);

export default router;
