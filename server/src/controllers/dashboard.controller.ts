import { Request, Response } from 'express';
import { Libro } from '../models/libro.model';
import { Prestamo } from '../models/prestamo.model';
import { Usuario } from '../models/usuario.model';

export async function obtenerEstadisticas(req: Request, res: Response) {
    try {
        const user = (req as any).user;
        const { id: userId, rol } = user;

        // --- LÓGICA PARA BIBLIOTECARIO / ADMIN ---
        if (rol === 'admin' || rol === 'bibliotecario') {
            const [totalLibros, prestamosActivos, totalUsuarios] = await Promise.all([
                Libro.countDocuments(),
                Prestamo.countDocuments({ estado: 'activo' }),
                Usuario.countDocuments()
            ]);

            const totalDisponibles = await Libro.countDocuments({ disponible: { $ne: false } });

            // Definir rango de "hoy" para los vencimientos
            const hoyInicio = new Date();
            hoyInicio.setHours(0, 0, 0, 0);
            const hoyFin = new Date();
            hoyFin.setHours(23, 59, 59, 999);

            // Consultas detalladas para el Bibliotecario
            const [vencenHoy, atrasadosDetalle, actividadReciente] = await Promise.all([
                // Préstamos que vencen HOY
                Prestamo.find({
                    estado: 'activo',
                    fechaDevolucionEsperada: { $gte: hoyInicio, $lte: hoyFin }
                }).populate('libro', 'titulo').populate('usuario', 'nombre'),

                // Préstamos atrasados (ya pasaron su fecha)
                Prestamo.find({
                    estado: 'activo',
                    fechaDevolucionEsperada: { $lt: hoyInicio }
                }).populate('libro', 'titulo').populate('usuario', 'nombre'),

                // Actividad reciente global
                Prestamo.find()
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .populate('libro', 'titulo portadaUrl')
                    .populate('usuario', 'nombre email')
            ]);

            const prestamosAtrasados = atrasadosDetalle.length;

            return res.status(200).json({
                success: true,
                rol: 'admin_biblio',
                stats: {
                    totalLibros,
                    prestamosActivos,
                    totalDisponibles,
                    prestamosAtrasados,
                    totalUsuarios
                },
                vencenHoy,
                atrasadosDetalle,
                actividadReciente
            });
        }

        // --- FALLBACK: LECTOR o cualquier otro rol ---
        const misPrestamos = await Prestamo.find({
            usuario: userId,
            estado: 'activo'
        })
        .sort({ fechaDevolucionEsperada: 1 })
        .populate('libro', 'titulo portadaUrl autor');

        return res.status(200).json({
            success: true,
            rol: 'lector',
            misPrestamos,
            actividadReciente: []
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            msg: `Error al obtener estadísticas: ${error.message}`
        });
    }
}
