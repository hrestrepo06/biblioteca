import { Router } from 'express';
import { login, verifyToken, logout } from '../controllers/auth.controller';

export const authRouter = Router();

// POST /api/auth/login   — Iniciar sesión
authRouter.post('/login', login);

// GET  /api/auth/verify  — Verificar si la cookie JWT es válida (útil al arrancar la app)
authRouter.get('/verify', verifyToken);

// POST /api/auth/logout  — Cerrar sesión (borra la cookie)
authRouter.post('/logout', logout);
