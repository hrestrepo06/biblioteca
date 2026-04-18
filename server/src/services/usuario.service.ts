import bcrypt from 'bcryptjs';
import { Usuario } from '../models/usuario.model';
import { FilterQuery, UpdateQuery } from 'mongoose';

export class UsuarioService {
  /**
   * Obtiene una lista de usuarios con paginación
   */
  async findAll(skip: number = 0, limit: number = 50) {
    const [total, usuarios] = await Promise.all([
      Usuario.countDocuments(),
      Usuario.find().skip(skip).limit(limit).sort({ createdAt: -1 })
    ]);

    return {
      usuarios: usuarios.map(u => this.mapToPublic(u)),
      total,
      limit,
      page: Math.floor(skip / limit) + 1
    };
  }

  /**
   * Busca un usuario por ID
   */
  async findById(id: string) {
    const usuario = await Usuario.findById(id);
    return usuario ? this.mapToPublic(usuario) : null;
  }

  /**
   * Crea un nuevo usuario con contraseña hasheada
   */
  async create(userData: any) {
    // Verificar duplicado
    const existeEmail = await Usuario.findOne({ email: userData.email });
    if (existeEmail) throw new Error('El correo ya está registrado');

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userData.password, salt);

    const usuario = new Usuario({
      ...userData,
      password: passwordHash
    });

    await usuario.save();
    return this.mapToPublic(usuario);
  }

  /**
   * Actualiza un usuario existente
   */
  async update(id: string, updates: any) {
    // Si hay password, hashearla
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    // Verificar email duplicado si está cambiando
    if (updates.email) {
      const existeEmail = await Usuario.findOne({ 
        email: updates.email, 
        _id: { $ne: id } as any 
      });
      if (existeEmail) throw new Error('El correo ya está en uso por otro usuario');
    }

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    return usuarioActualizado ? this.mapToPublic(usuarioActualizado) : null;
  }

  /**
   * Elimina un usuario
   */
  async delete(id: string) {
    return await Usuario.findByIdAndDelete(id);
  }

  /**
   * Mapea el modelo interno a un objeto público seguro
   */
  private mapToPublic(u: any) {
    return {
      id: u._id || u.id,
      nombre: u.nombre,
      email: u.email,
      rol: u.rol,
      activo: u.activo,
      createdAt: u.createdAt
    };
  }
}

export const usuarioService = new UsuarioService();
