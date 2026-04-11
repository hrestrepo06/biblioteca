import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { librosRouter } from './routes/libros.routes';
import { authRouter } from './routes/auth.routes';

export const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
// IMPORTANTE: credentials:true es obligatorio para que el navegador
// envíe y reciba las cookies HttpOnly en peticiones cross-origin.
app.use(
  cors({
    origin: process.env['FRONTEND_URL'] ?? 'http://localhost:4200',
    credentials: true, // Permite el envío de cookies entre dominios
  })
);

// ── Parsers ───────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Necesario para leer req.cookies

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);         // Rutas públicas de autenticación
app.use('/api/libros', librosRouter);      // Rutas protegidas de libros

// ── Ruta legada (compatibilidad) ──────────────────────────────────────────────
app.use('/libros', librosRouter);

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error('🚨 Error global capturado:', err);
  res.status(500).json({
    ok: false,
    msg: 'Error interno en el servidor',
    error: process.env['NODE_ENV'] === 'development' ? err.message : undefined,
  });
});