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

// IMPORTANTE: Por seguridad, sólo los 'admin' pueden gestionar usuarios
usuarioRouter.use(requireRole('admin'));

usuarioRouter.get('/', obtenerUsuarios);
usuarioRouter.get('/:id', obtenerUsuario);
usuarioRouter.post('/', crearUsuario);
usuarioRouter.put('/:id', actualizarUsuario);
usuarioRouter.delete('/:id', eliminarUsuario);
