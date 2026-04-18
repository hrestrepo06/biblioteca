import { Schema, model, InferSchemaType, Types } from 'mongoose';

const prestamoSchema = new Schema(
  {
    libro: { 
      type: Schema.Types.ObjectId, 
      ref: 'Libro', 
      required: true 
    },
    usuario: { 
      type: Schema.Types.ObjectId, 
      ref: 'Usuario', 
      required: true 
    },
    fechaPrestamo: { 
      type: Date, 
      default: Date.now 
    },
    fechaDevolucionEsperada: { 
      type: Date, 
      required: true 
    },
    fechaDevolucionReal: { 
      type: Date 
    },
    estado: { 
      type: String, 
      enum: ['activo', 'devuelto', 'atrasado'], 
      default: 'activo' 
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id != null ? String(ret._id) : undefined;
        return ret;
      },
    },
  }
);

// Índice para búsquedas rápidas de préstamos activos por usuario
prestamoSchema.index({ usuario: 1, estado: 1 });
// Índice para preventir que el mismo libro esté en dos préstamos activos (backup de lógica de negocio)
// prestamoSchema.index({ libro: 1, estado: 1 }, { unique: true, partialFilterExpression: { estado: 'activo' } });

export type PrestamoDoc = InferSchemaType<typeof prestamoSchema> & {
  _id: Types.ObjectId;
};

export const Prestamo = model<PrestamoDoc>('Prestamo', prestamoSchema);
