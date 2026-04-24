import { Schema, model, InferSchemaType, Types } from 'mongoose';

// Tipos de acciones auditables del sistema
export type AccionAuditoria =
    | 'LOGIN'
    | 'CREAR_LIBRO'
    | 'EDITAR_LIBRO'
    | 'ELIMINAR_LIBRO'
    | 'CREAR_PRESTAMO'
    | 'DEVOLVER_LIBRO'
    | 'SOLICITAR_RESERVA'
    | 'APROBAR_RESERVA'
    | 'RECHAZAR_RESERVA'
    | 'CREAR_USUARIO'
    | 'EDITAR_USUARIO'
    | 'ELIMINAR_USUARIO';

const auditoriaSchema = new Schema(
    {
        accion: {
            type: String,
            required: true,
            enum: [
                'LOGIN',
                'CREAR_LIBRO', 'EDITAR_LIBRO', 'ELIMINAR_LIBRO',
                'CREAR_PRESTAMO', 'DEVOLVER_LIBRO',
                'SOLICITAR_RESERVA', 'APROBAR_RESERVA', 'RECHAZAR_RESERVA',
                'CREAR_USUARIO', 'EDITAR_USUARIO', 'ELIMINAR_USUARIO',
            ]
        },
        // Quién realizó la acción
        usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
        nombreUsuario: { type: String, required: true }, // Desnormalizado para historial inmutable
        // Sobre qué entidad (Libro, Prestamo, Usuario...)
        entidad: { type: String, required: true },
        entidadId: { type: String },
        // Descripción legible de lo que pasó
        detalle: { type: String },
        // Trazabilidad de red
        ip: { type: String, default: 'desconocida' },
    },
    {
        timestamps: true,     // createdAt es nuestra marca de tiempo inmutable
        versionKey: false,
        // Sin toJSON transform: queremos _id nativo para paginación eficiente
    }
);

// Índices para búsquedas frecuentes en el Libro Mayor
auditoriaSchema.index({ accion: 1 });
auditoriaSchema.index({ usuario: 1 });
auditoriaSchema.index({ createdAt: -1 });

export type AuditoriaDoc = InferSchemaType<typeof auditoriaSchema> & { _id: Types.ObjectId };
export const Auditoria = model<AuditoriaDoc>('Auditoria', auditoriaSchema);
