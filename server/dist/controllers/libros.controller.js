"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearLibro = crearLibro;
exports.listarLibros = listarLibros;
exports.obtenerLibro = obtenerLibro;
exports.actualizarLibro = actualizarLibro;
exports.eliminarLibro = eliminarLibro;
const libro_model_1 = require("../models/libro.model");
async function crearLibro(req, res) {
    try {
        const libro = await libro_model_1.Libro.create(req.body);
        return res.status(201).json({
            success: true,
            libro
        });
    }
    catch (e) {
        if (e?.code === 11000) {
            return res.status(400).json({
                success: false,
                msg: "El libro ya existe"
            });
        }
        return res.status(500).json({
            success: false,
            msg: `Error al crear el libro: ${e?.message || e}`
        });
    }
}
async function listarLibros(req, res) {
    const libros = await libro_model_1.Libro.find().sort({ createdAt: -1 });
    return res.status(200).json({
        success: true,
        libros
    });
}
;
async function obtenerLibro(req, res) {
    try {
        const libro = await libro_model_1.Libro.findById(req.params.id);
        if (!libro) {
            return res.status(404).json({
                success: false,
                msg: "Libro no encontrado"
            });
        }
        return res.status(200).json({
            success: true,
            libro
        });
    }
    catch (e) {
        return res.status(500).json({
            success: false,
            msg: `Error al obtener el libro: ${e?.message || e}`
        });
    }
}
async function actualizarLibro(req, res) {
    try {
        const libro = await libro_model_1.Libro.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!libro) {
            return res.status(404).json({
                success: false,
                msg: "Libro no existe"
            });
        }
        return res.status(200).json({
            success: true,
            libro
        });
    }
    catch (e) {
        if (e?.code === 11000) {
            return res.status(400).json({
                success: false,
                msg: "El libro ya existe"
            });
        }
        return res.status(500).json({
            success: false,
            msg: `Error al actualizar el libro: ${e?.message || e}`
        });
    }
}
async function eliminarLibro(req, res) {
    try {
        const libro = await libro_model_1.Libro.findByIdAndDelete(req.params.id);
        if (!libro) {
            return res.status(404).json({
                success: false,
                msg: "Libro no existe"
            });
        }
        return res.status(200).json({
            success: true,
            msg: "Libro eliminado correctamente"
        });
    }
    catch (e) {
        return res.status(500).json({
            success: false,
            msg: `Error al eliminar el libro: ${e?.message || e}`
        });
    }
}
//# sourceMappingURL=libros.controller.js.map