import { Router } from "express";
import { actualizarLibro, 
    crearLibro, eliminarLibro, listarLibros, obtenerLibro } from "../controllers/libros.controller";
import { validateBody, validateParams } from "../middlewares/validate";
import { LibroCreateSchema, LibroIdParamsSchema, LibroUpdateSchema } from "../dto/libro.schema";

export const librosRouter = Router();
librosRouter.post("/", validateBody(LibroCreateSchema),crearLibro);
librosRouter.get("/", listarLibros);
librosRouter.get("/:id", validateParams(LibroIdParamsSchema),obtenerLibro);
librosRouter.put("/:id", validateParams(LibroIdParamsSchema),validateBody(LibroUpdateSchema),actualizarLibro);
librosRouter.delete("/:id", validateParams(LibroIdParamsSchema),eliminarLibro);
