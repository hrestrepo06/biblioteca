import { Router } from 'express';
import { crearPrestamo, devolverLibro, listarPrestamos, obtenerPrestamosPorUsuario } from '../controllers/prestamo.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

export const prestamosRouter = Router();

// Todas las rutas de préstamos requieren autenticación
prestamosRouter.use(requireAuth);

// Gestión total solo para bibliotecarios y admins
prestamosRouter.get('/', requireRole('bibliotecario', 'admin'), listarPrestamos);
prestamosRouter.post('/', requireRole('bibliotecario', 'admin'), crearPrestamo);
prestamosRouter.put('/devolver/:id', requireRole('bibliotecario', 'admin'), devolverLibro);
prestamosRouter.get('/usuario/:usuarioId', requireRole('bibliotecario', 'admin'), obtenerPrestamosPorUsuario);

// TODO: Endpoint para que un Lector vea sus propios préstamos
// prestamosRouter.get('/mis-prestamos', obtenerMisPrestamos);
