import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env['JWT_SECRET'] ?? 'CAMBIA_ESTO_EN_PRODUCCION';
const COOKIE_NAME = 'biblio_token';

/**
 * Middleware que protege rutas que requieren autenticación.
 * Verifica que la cookie HttpOnly contenga un JWT válido y no expirado.
 * Si es válido, inyecta el payload del usuario en req.user.
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies?.[COOKIE_NAME] as string | undefined;

  if (!token) {
    res.status(401).json({ ok: false, msg: 'Acceso no autorizado. Se requiere autenticación.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    // Adjuntamos la info del usuario a la petición para uso posterior en los controladores
    (req as any).user = { id: decoded['id'], email: decoded['email'], rol: decoded['rol'] };
    next();
  } catch {
    res.clearCookie(COOKIE_NAME);
    res.status(401).json({ ok: false, msg: 'Sesión expirada o token inválido.' });
  }
};

/**
 * Middleware de autorización por roles.
 * Uso: requireRole('admin') o requireRole('admin', 'bibliotecario')
 */
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;

    if (!user || !roles.includes(user.rol)) {
      res.status(403).json({
        ok: false,
        msg: `Acceso denegado. Se requiere el rol: ${roles.join(' o ')}.`,
      });
      return;
    }

    next();
  };
};
