import { Request, Response } from 'express';
import { usuarioService } from '../services/usuario.service';
import { z } from 'zod';

// Esquemas de validación con Zod
const createUsuarioSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  rol: z.enum(['admin', 'bibliotecario', 'lector']).optional(),
  activo: z.boolean().optional(),
});

const updateUsuarioSchema = z.object({
  nombre: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  rol: z.enum(['admin', 'bibliotecario', 'lector']).optional(),
  activo: z.boolean().optional(),
});

export const obtenerUsuarios = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;

    const result = await usuarioService.findAll(skip, limit);
    res.json({ ok: true, ...result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error al obtener usuarios' });
  }
};

export const obtenerUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuario = await usuarioService.findById(id);
    
    if (!usuario) {
      res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
      return;
    }
    
    res.json({ ok: true, usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error al obtener el usuario' });
  }
};

export const crearUsuario = async (req: Request, res: Response) => {
  try {
    const result = createUsuarioSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ ok: false, msg: 'Datos inválidos', errors: result.error.issues });
      return;
    }

    const usuario = await usuarioService.create(result.data);
    res.status(201).json({ ok: true, usuario });
  } catch (error: any) {
    console.error(error);
    const status = error.message === 'El correo ya está registrado' ? 400 : 500;
    res.status(status).json({ ok: false, msg: error.message || 'Error al crear usuario' });
  }
};

export const actualizarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = updateUsuarioSchema.safeParse(req.body);
    
    if (!result.success) {
      res.status(400).json({ ok: false, msg: 'Datos inválidos', errors: result.error.issues });
      return;
    }

    const usuarioActualizado = await usuarioService.update(id, result.data);

    if (!usuarioActualizado) {
      res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
      return;
    }

    res.json({ ok: true, usuario: usuarioActualizado });
  } catch (error: any) {
    console.error(error);
    const status = error.message.includes('en uso') ? 400 : 500;
    res.status(status).json({ ok: false, msg: error.message || 'Error al actualizar usuario' });
  }
};

export const eliminarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuarioEliminado = await usuarioService.delete(id);
    
    if (!usuarioEliminado) {
      res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
      return;
    }
    
    res.json({ ok: true, msg: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error al eliminar usuario' });
  }
};
