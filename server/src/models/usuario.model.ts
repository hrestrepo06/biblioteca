import { Schema, model, InferSchemaType, Types } from 'mongoose';

const usuarioSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // La contraseña se guarda SIEMPRE hasheada con bcrypt — nunca en texto plano
    password: { type: String, required: true, select: false },
    rol: {
      type: String,
      enum: ['admin', 'bibliotecario', 'lector'],
      default: 'lector',
    },
    activo: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id != null ? String(ret._id) : undefined;
        delete ret._id;
        delete ret.password; // Nunca exponer el hash en respuestas JSON
        return ret;
      },
    },
  }
);

export type UsuarioDoc = InferSchemaType<typeof usuarioSchema> & {
  _id: Types.ObjectId;
};

export const Usuario = model<UsuarioDoc>('Usuario', usuarioSchema);
