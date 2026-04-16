import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Usuario } from '../models/usuario.model';
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

    const [total, usuarios] = await Promise.all([
      Usuario.countDocuments(),
      Usuario.find().skip(skip).limit(limit).sort({ createdAt: -1 })
    ]);

    res.json({
      ok: true,
      usuarios: usuarios.map(u => ({
        id: u.id,
        nombre: u.nombre,
        email: u.email,
        rol: u.rol,
        activo: u.activo,
        createdAt: u.createdAt
      })),
      total,
      limit,
      page
    });
  } catch (error) {
    res.status(500).json({ ok: false, msg: 'Error al obtener usuarios' });
  }
};

export const obtenerUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id);
    
    if (!usuario) {
      res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
      return;
    }
    
    res.json({ 
      ok: true, 
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        activo: usuario.activo,
        createdAt: usuario.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ ok: false, msg: 'Error al obtener usuario' });
  }
};

export const crearUsuario = async (req: Request, res: Response) => {
  try {
    const result = createUsuarioSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ ok: false, msg: 'Datos inválidos', errors: result.error.errors });
      return;
    }

    const { email, password } = result.data;
    
    // Verificar si el email ya existe
    const existeEmail = await Usuario.findOne({ email });
    if (existeEmail) {
      res.status(400).json({ ok: false, msg: 'El correo ya está registrado' });
      return;
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const usuario = new Usuario({
      ...result.data,
      password: passwordHash
    });

    await usuario.save();
    
    // El modelo de Mongoose automáticamente excluye la contraseña gracias a su transform `toJSON`
    // Construimos respuesta limpia de forma explícita
    const registroCreado = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      activo: usuario.activo
    };

    res.status(201).json({ ok: true, usuario: registroCreado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error al crear usuario' });
  }
};

export const actualizarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = updateUsuarioSchema.safeParse(req.body);
    
    if (!result.success) {
      res.status(400).json({ ok: false, msg: 'Datos inválidos', errors: result.error.errors });
      return;
    }

    const updates = result.data;

    // Si se envía un nuevo correo, validar que no le pertenezca a otro
    if (updates.email) {
      const existeEmail = await Usuario.findOne({ email: updates.email, _id: { $ne: id } });
      if (existeEmail) {
        res.status(400).json({ ok: false, msg: 'El correo ya está en uso por otro usuario' });
        return;
      }
    }

    // Si se envía una contraseña, hay que aplicar bcrypt
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true } // Devolver el documento ya actualizado
    );

    if (!usuarioActualizado) {
      res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
      return;
    }

    // Respuesta limpia
    const registroActualizado = {
      id: usuarioActualizado.id,
      nombre: usuarioActualizado.nombre,
      email: usuarioActualizado.email,
      rol: usuarioActualizado.rol,
      activo: usuarioActualizado.activo
    };

    res.json({ ok: true, usuario: registroActualizado });
  } catch (error) {
    res.status(500).json({ ok: false, msg: 'Error al actualizar usuario' });
  }
};

export const eliminarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const usuarioEliminado = await Usuario.findByIdAndDelete(id);
    
    if (!usuarioEliminado) {
      res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
      return;
    }
    
    res.json({ ok: true, msg: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ ok: false, msg: 'Error al eliminar usuario' });
  }
};
