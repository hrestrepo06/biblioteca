import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuario } from '../models/usuario.model';
import { registrarAuditoria } from '../services/auditoria.service';

const JWT_SECRET = process.env['JWT_SECRET'] ?? 'CAMBIA_ESTO_EN_PRODUCCION';
const JWT_EXPIRES_IN = process.env['JWT_EXPIRES_IN'] ?? '2h';
const COOKIE_NAME = 'biblio_token';

// ── Opciones de la cookie segura ──────────────────────────────────────────────
const cookieOptions = {
  httpOnly: true,       // JavaScript en el navegador NO puede leer esta cookie
  secure: process.env['NODE_ENV'] === 'production', // Solo HTTPS en producción
  sameSite: 'strict' as const, // Protección CSRF
  maxAge: 2 * 60 * 60 * 1000, // 2 horas en milisegundos
  path: '/',
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      res.status(400).json({ ok: false, msg: 'Email y contraseña son requeridos.' });
      return;
    }

    // Buscamos el usuario incluyendo el campo password (que es select:false por defecto)
    const usuario = await Usuario.findOne({ email, activo: true }).select('+password');

    if (!usuario) {
      // Mensaje genérico para no dar pistas sobre si el email existe o no
      res.status(401).json({ ok: false, msg: 'Credenciales incorrectas.' });
      return;
    }

    const passwordValida = await bcrypt.compare(password, usuario.password as string);

    if (!passwordValida) {
      res.status(401).json({ ok: false, msg: 'Credenciales incorrectas.' });
      return;
    }

    // Creamos el payload del JWT (solo info no sensible)
    const payload = {
      id: usuario._id.toString(),
      email: usuario.email,
      rol: usuario.rol,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);

    // Enviamos el JWT dentro de una cookie HttpOnly — NO en el body
    res.cookie(COOKIE_NAME, token, cookieOptions);

    // Registrar evento de seguridad (fire-and-forget)
    registrarAuditoria({
      accion: 'LOGIN',
      usuarioId: usuario._id.toString(),
      nombreUsuario: usuario.nombre,
      entidad: 'Usuario',
      entidadId: usuario._id.toString(),
      detalle: `Inicio de sesión como ${usuario.rol}`,
      ip: req.ip,
    });

    res.status(200).json({
      ok: true,
      msg: 'Sesión iniciada correctamente.',
      user: {
        id: usuario._id.toString(),
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/auth/verify ──────────────────────────────────────────────────────
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.[COOKIE_NAME] as string | undefined;

    if (!token) {
      res.status(401).json({ ok: false, msg: 'No hay sesión activa.' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    const usuario = await Usuario.findById(decoded['id']);

    if (!usuario || !usuario.activo) {
      res.clearCookie(COOKIE_NAME);
      res.status(401).json({ ok: false, msg: 'Usuario no encontrado o inactivo.' });
      return;
    }

    res.status(200).json({
      ok: true,
      user: {
        id: usuario._id.toString(),
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    // Token inválido o expirado
    res.clearCookie(COOKIE_NAME);
    res.status(401).json({ ok: false, msg: 'Sesión expirada. Inicia sesión de nuevo.' });
  }
};

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
export const logout = (_req: Request, res: Response) => {
  // Borramos la cookie del navegador enviando la misma pero con maxAge=0
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: 0 });
  res.status(200).json({ ok: true, msg: 'Sesión cerrada correctamente.' });
};
