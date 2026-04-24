import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { listarAuditoria } from '../controllers/auditoria.controller';

const auditoriaRouter = Router();

// Solo Admin y Bibliotecario pueden consultar el Libro Mayor
auditoriaRouter.get('/', requireAuth, requireRole('admin', 'bibliotecario'), listarAuditoria);

export default auditoriaRouter;
