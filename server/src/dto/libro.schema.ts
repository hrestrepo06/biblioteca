import {z} from 'zod';

export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/,'Id no valido');

export const LibroCreateSchema = z.object({
    titulo: z.string().trim().min(1,'El titulo es obligatorio'),
    autor: z.string().trim().min(1,'El autor es obligatorio'),
    aPublicacion: z.string().trim().optional().default(''),
    editorial: z.string().trim().optional().default(''),
    categoria: z.string().trim().optional().default(''),
    sede: z.string().trim().optional().default(''),
}).strict();

export const LibroUpdateSchema = LibroCreateSchema.partial().refine(
    data => Object.keys(data).length > 0,
    { message: 'Al menos un campo debe ser proporcionado para la actualizacion'}
);

export const LibroIdParamsSchema = z.object({
    id: objectIdSchema
});