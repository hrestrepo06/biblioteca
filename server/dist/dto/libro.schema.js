"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LibroIdParamsSchema = exports.LibroUpdateSchema = exports.LibroCreateSchema = exports.objectIdSchema = void 0;
const zod_1 = require("zod");
exports.objectIdSchema = zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Id no valido');
exports.LibroCreateSchema = zod_1.z.object({
    titulo: zod_1.z.string().trim().min(1, 'El titulo es obligatorio'),
    autor: zod_1.z.string().trim().min(1, 'El autor es obligatorio'),
    aPublicacion: zod_1.z.string().trim().optional().default(''),
    editorial: zod_1.z.string().trim().optional().default(''),
    categoria: zod_1.z.string().trim().optional().default(''),
    sede: zod_1.z.string().trim().optional().default(''),
}).strict();
exports.LibroUpdateSchema = exports.LibroCreateSchema.partial().refine(data => Object.keys(data).length > 0, { message: 'Al menos un campo debe ser proporcionado para la actualizacion' });
exports.LibroIdParamsSchema = zod_1.z.object({
    id: exports.objectIdSchema
});
//# sourceMappingURL=libro.schema.js.map