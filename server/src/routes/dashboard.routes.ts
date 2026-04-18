import { Router } from 'express';
import { obtenerEstadisticas } from '../controllers/dashboard.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/stats', requireAuth, obtenerEstadisticas);

export default router;
