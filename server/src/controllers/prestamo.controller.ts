import { Request, Response } from 'express';
import { Prestamo } from '../models/prestamo.model';
import { Libro } from '../models/libro.model';
import { Usuario } from '../models/usuario.model';
import mongoose from 'mongoose';

/**
 * Registra un nuevo préstamo
 * POST /api/prestamos
 */
export const crearPrestamo = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { libroId, usuarioId } = req.body;

    // 1. Validaciones básicas
    const libro = await Libro.findById(libroId).session(session);
    if (!libro) {
      await session.abortTransaction();
      res.status(404).json({ ok: false, msg: 'Libro no encontrado' });
      return;
    }

    if (!libro.disponible) {
      await session.abortTransaction();
      res.status(400).json({ ok: false, msg: 'El libro ya se encuentra prestado' });
      return;
    }

    const usuario = await Usuario.findById(usuarioId).session(session);
    if (!usuario) {
      await session.abortTransaction();
      res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
      return;
    }

    // 2. Validar límite de 3 libros activos por usuario
    const prestamosActivos = await Prestamo.countDocuments({ 
      usuario: usuarioId, 
      estado: 'activo' 
    }).session(session);

    if (prestamosActivos >= 3) {
      await session.abortTransaction();
      res.status(400).json({ ok: false, msg: 'El usuario ya tiene el límite máximo de 3 libros (Préstamos bloqueados)' });
      return;
    }

    // 3. Calcular fecha de devolución (3 días después)
    const fechaPrestamo = new Date();
    const fechaDevolucionEsperada = new Date();
    fechaDevolucionEsperada.setDate(fechaPrestamo.getDate() + 3);

    // 4. Crear el préstamo
    const nuevoPrestamo = new Prestamo({
      libro: libroId,
      usuario: usuarioId,
      fechaPrestamo,
      fechaDevolucionEsperada,
      estado: 'activo'
    });

    await nuevoPrestamo.save({ session });

    // 5. Actualizar estado del libro a NO DISPONIBLE
    libro.disponible = false;
    await libro.save({ session });

    await session.commitTransaction();
    
    // Devolvemos el préstamo poblado para la UI
    const prestamoPoblado = await Prestamo.findById(nuevoPrestamo._id)
      .populate('libro', 'titulo autor')
      .populate('usuario', 'nombre email');

    res.status(201).json({ ok: true, prestamo: prestamoPoblado });

  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error al procesar el préstamo' });
  } finally {
    session.endSession();
  }
};

/**
 * Registra la devolución de un libro
 * PUT /api/prestamos/devolver/:id
 */
export const devolverLibro = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const prestamo = await Prestamo.findById(id).session(session);
    if (!prestamo || prestamo.estado === 'devuelto') {
      await session.abortTransaction();
      res.status(404).json({ ok: false, msg: 'Préstamo no encontrado o ya devuelto' });
      return;
    }

    // 1. Actualizar el préstamo
    prestamo.estado = 'devuelto';
    prestamo.fechaDevolucionReal = new Date();
    await prestamo.save({ session });

    // 2. Liberar el libro
    const libro = await Libro.findById(prestamo.libro).session(session);
    if (libro) {
      libro.disponible = true;
      await libro.save({ session });
    }

    await session.commitTransaction();
    res.json({ ok: true, msg: 'Libro devuelto exitosamente' });

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ ok: false, msg: 'Error al procesar la devolución' });
  } finally {
    session.endSession();
  }
};

/**
 * Lista todos los préstamos (Historial completo)
 * GET /api/prestamos
 */
export const listarPrestamos = async (req: Request, res: Response) => {
  try {
    const prestamos = await Prestamo.find()
      .populate('libro', 'titulo autor')
      .populate('usuario', 'nombre email')
      .sort({ createdAt: -1 });

    res.json({ ok: true, prestamos });
  } catch (error) {
    res.status(500).json({ ok: false, msg: 'Error al obtener los préstamos' });
  }
};

/**
 * Obtiene los préstamos activos de un usuario específico
 */
export const obtenerPrestamosPorUsuario = async (req: Request, res: Response) => {
  try {
    const { usuarioId } = req.params;
    const prestamos = await Prestamo.find({ usuario: usuarioId })
      .populate('libro', 'titulo autor')
      .sort({ createdAt: -1 });

    res.json({ ok: true, prestamos });
  } catch (error) {
    res.status(500).json({ ok: false, msg: 'Error al obtener préstamos del usuario' });
  }
};

/**
 * [LECTOR] Solicita la reserva de un libro remotamente
 * POST /api/prestamos/solicitar
 */
export const solicitarReserva = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { libroId } = req.body;
    const usuarioId = (req as any).user.id; // Lector logueado

    const libro = await Libro.findById(libroId).session(session);
    if (!libro || !libro.disponible) {
      await session.abortTransaction();
      res.status(400).json({ ok: false, msg: 'Libro no disponible para reserva' });
      return;
    }

    // Límite estricto de préstamos/reservas por usuario
    const activos = await Prestamo.countDocuments({
      usuario: usuarioId,
      estado: { $in: ['activo', 'pendiente'] }
    }).session(session);

    if (activos >= 3) {
      await session.abortTransaction();
      res.status(400).json({ ok: false, msg: 'Has alcanzado el límite de 3 solicitudes/préstamos' });
      return;
    }

    // Crear la solicitud
    const nuevaReserva = new Prestamo({
      libro: libroId,
      usuario: usuarioId,
      estado: 'pendiente'
    });
    await nuevaReserva.save({ session });

    // Bloquear el libro en el catálogo
    libro.disponible = false;
    await libro.save({ session });

    await session.commitTransaction();
    
    res.status(201).json({ ok: true, msg: 'Reserva solicitada. Espera aprobación en biblioteca.' });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ ok: false, msg: 'Error al procesar la reserva' });
  } finally {
    session.endSession();
  }
};

/**
 * [ADMIN] Aprueba una reserva pasándola a activa
 * PUT /api/prestamos/:id/aprobar
 */
export const aprobarReserva = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const prestamo = await Prestamo.findById(id);

    if (!prestamo || prestamo.estado !== 'pendiente') {
      res.status(400).json({ ok: false, msg: 'La solicitud no existe o ya no está pendiente' });
      return;
    }

    const fechaPrestamo = new Date();
    const fechaDevolucionEsperada = new Date();
    fechaDevolucionEsperada.setDate(fechaPrestamo.getDate() + 3);

    prestamo.estado = 'activo';
    prestamo.fechaPrestamo = fechaPrestamo;
    prestamo.fechaDevolucionEsperada = fechaDevolucionEsperada;
    await prestamo.save();

    res.json({ ok: true, msg: 'Reserva aprobada con éxito' });
  } catch (error) {
    res.status(500).json({ ok: false, msg: 'Error al aprobar reserva' });
  }
};

/**
 * [ADMIN] Rechaza una reserva y libera el libro
 * PUT /api/prestamos/:id/rechazar
 */
export const rechazarReserva = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const prestamo = await Prestamo.findById(id).session(session);

    if (!prestamo || prestamo.estado !== 'pendiente') {
      await session.abortTransaction();
      res.status(400).json({ ok: false, msg: 'Reserva intrazable o ya gestionada' });
      return;
    }

    // 1. Marcar como rechazado (Historial)
    prestamo.estado = 'rechazado';
    prestamo.fechaDevolucionReal = new Date(); // opcional, para saber cuándo se canceló
    await prestamo.save({ session });

    // 2. Liberar el ejemplar
    const libro = await Libro.findById(prestamo.libro).session(session);
    if (libro) {
      libro.disponible = true;
      await libro.save({ session });
    }

    await session.commitTransaction();
    res.json({ ok: true, msg: 'Reserva cancelada y ejemplar liberado' });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ ok: false, msg: 'Error al cancelar la reserva' });
  } finally {
    session.endSession();
  }
};

/**
 * [ADMIN] Obtiene la bandeja de entrada de reservas pendientes
 * GET /api/prestamos/pendientes
 */
export const obtenerPendientes = async (req: Request, res: Response) => {
  try {
    const solicitudes = await Prestamo.find({ estado: 'pendiente' })
      .populate('libro', 'titulo autor portadaUrl')
      .populate('usuario', 'nombre email')
      .sort({ createdAt: 1 }); // Las más antiguas primero

    res.json({ ok: true, solicitudes });
  } catch (error) {
    res.status(500).json({ ok: false, msg: 'Error al cargar bandeja' });
  }
};
