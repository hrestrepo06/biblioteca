import { Router } from "express";
import { actualizarLibro, 
    crearLibro, eliminarLibro, listarLibros, obtenerLibro } from "../controllers/libros.controller";
import { validateBody, validateParams } from "../middlewares/validate";
import { LibroCreateSchema, LibroIdParamsSchema, LibroUpdateSchema } from "../dto/libro.schema";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

export const librosRouter = Router();

// Todas las rutas de libros requieren que el usuario esté logueado
librosRouter.use(requireAuth);

// Lectura: Cualquier usuario logueado puede ver
librosRouter.get("/", listarLibros);
librosRouter.get("/:id", validateParams(LibroIdParamsSchema), obtenerLibro);

// Escritura: Solo bibliotecario o admin
librosRouter.post("/", requireRole('bibliotecario', 'admin'), validateBody(LibroCreateSchema), crearLibro);
librosRouter.put("/:id", requireRole('bibliotecario', 'admin'), validateParams(LibroIdParamsSchema), validateBody(LibroUpdateSchema), actualizarLibro);
librosRouter.delete("/:id", requireRole('bibliotecario', 'admin'), validateParams(LibroIdParamsSchema), eliminarLibro);
