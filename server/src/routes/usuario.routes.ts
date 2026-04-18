import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import {
  obtenerUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} from '../controllers/usuario.controller';

export const usuarioRouter = Router();

// Todas las rutas de usuarios requieren autenticación
usuarioRouter.use(requireAuth);

// Rutas de consulta: Permitidas para Admin y Bibliotecario
usuarioRouter.get('/', requireRole('admin', 'bibliotecario'), obtenerUsuarios);
usuarioRouter.get('/:id', requireRole('admin', 'bibliotecario'), obtenerUsuario);

// Rutas de modificación: Exclusivas para Admin
usuarioRouter.post('/', requireRole('admin'), crearUsuario);
usuarioRouter.put('/:id', requireRole('admin'), actualizarUsuario);
usuarioRouter.delete('/:id', requireRole('admin'), eliminarUsuario);
