import { Request, Response } from 'express';
import { Auditoria } from '../models/auditoria.model';

/**
 * GET /api/auditoria
 * Lista paginada del Libro Mayor (solo Admin/Bibliotecario)
 * Query params: page, limit, accion, usuarioId
 */
export async function listarAuditoria(req: Request, res: Response) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const accion = req.query.accion as string;
        const usuarioId = req.query.usuarioId as string;

        const skip = (page - 1) * limit;

        // Filtros opcionales
        const filter: any = {};
        if (accion) filter.accion = accion;
        if (usuarioId) filter.usuario = usuarioId;

        const [registros, total] = await Promise.all([
            Auditoria.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('usuario', 'nombre email rol'),
            Auditoria.countDocuments(filter)
        ]);

        return res.status(200).json({
            ok: true,
            registros,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + registros.length < total
            }
        });
    } catch (error: any) {
        return res.status(500).json({
            ok: false,
            msg: `Error al obtener el libro mayor: ${error.message}`
        });
    }
}
