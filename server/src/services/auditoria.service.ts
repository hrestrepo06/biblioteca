import { Auditoria, AccionAuditoria } from '../models/auditoria.model';

interface AuditoriaPayload {
    accion: AccionAuditoria;
    usuarioId: string;
    nombreUsuario: string;
    entidad: string;
    entidadId?: string;
    detalle?: string;
    ip?: string;
}

/**
 * Registra un evento de auditoría de forma asíncrona (fire-and-forget).
 * NO bloquea la respuesta HTTP — el registro ocurre en segundo plano.
 * 
 * Uso en controladores:
 *   registrarAuditoria({ accion: 'CREAR_LIBRO', ... }); // Sin await intencional
 */
export function registrarAuditoria(payload: AuditoriaPayload): void {
    Auditoria.create({
        accion: payload.accion,
        usuario: payload.usuarioId,
        nombreUsuario: payload.nombreUsuario,
        entidad: payload.entidad,
        entidadId: payload.entidadId,
        detalle: payload.detalle,
        ip: payload.ip ?? 'desconocida',
    }).catch(err => {
        // El fallo de auditoría nunca debe interrumpir el flujo principal
        console.error('[AUDITORIA] Error al registrar evento:', err.message);
    });
}
