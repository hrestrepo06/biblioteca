"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.librosRouter = void 0;
const express_1 = require("express");
const libros_controller_1 = require("../controllers/libros.controller");
const validate_1 = require("../middlewares/validate");
const libro_schema_1 = require("../dto/libro.schema");
exports.librosRouter = (0, express_1.Router)();
exports.librosRouter.post("/", (0, validate_1.validateBody)(libro_schema_1.LibroCreateSchema), libros_controller_1.crearLibro);
exports.librosRouter.get("/", libros_controller_1.listarLibros);
exports.librosRouter.get("/:id", (0, validate_1.validateParams)(libro_schema_1.LibroIdParamsSchema), libros_controller_1.obtenerLibro);
exports.librosRouter.put("/:id", (0, validate_1.validateParams)(libro_schema_1.LibroIdParamsSchema), (0, validate_1.validateBody)(libro_schema_1.LibroUpdateSchema), libros_controller_1.actualizarLibro);
exports.librosRouter.delete("/:id", (0, validate_1.validateParams)(libro_schema_1.LibroIdParamsSchema), libros_controller_1.eliminarLibro);
//# sourceMappingURL=libros.routes.js.map