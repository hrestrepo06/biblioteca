import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { logger } from './utils/logger';

import { librosRouter } from './routes/libros.routes';
import { authRouter } from './routes/auth.routes';
import { usuarioRouter } from './routes/usuario.routes';
import { prestamosRouter } from './routes/prestamo.routes';
import dashboardRouter from './routes/dashboard.routes';

export const app = express();

// ── SEGURIDAD ÉLITE ────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Permite que Angular lea recursos del server
  contentSecurityPolicy: false, // Desactivar CSP en desarrollo para evitar bloqueos de scripts/estilos
}));
app.use(hpp());    // Protección contra contaminación de parámetros HTTP

// Limitación de tasa para el Login (Prevenir Fuerza Bruta)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Máximo 10 intentos por IP
  message: { ok: false, msg: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env['FRONTEND_URL'] ?? 'http://localhost:4200',
    credentials: true,
  })
);

app.use(express.static('public'));

// ── Parsers ───────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' })); // Límite de tamaño para evitar ataques DoS
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use('/api/auth/login', loginLimiter); // Aplicar límite solo al login
app.use('/api/auth', authRouter);
app.use('/api/libros', librosRouter);
app.use('/api/usuarios', usuarioRouter);
app.use('/api/prestamos', prestamosRouter);
app.use('/api/dashboard', dashboardRouter);

// ── Global Error Handler Profesional ──────────────────────────────────────────
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  // Registro profesional del error
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  if (err.stack) {
    logger.debug(err.stack);
  }

  res.status(err.status || 500).json({
    ok: false,
    msg: err.message || 'Error interno en el servidor',
    error: process.env['NODE_ENV'] === 'development' ? err : undefined,
  });
});