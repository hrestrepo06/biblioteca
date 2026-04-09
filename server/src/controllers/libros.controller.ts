import { Request, Response } from 'express';
import { Libro } from '../models/libro.model';


export async function crearLibro(req: Request, res: Response) {
    try {
        const libro = await Libro.create(req.body);
        return res.status(201).json({
            success: true,
            libro
        })
    } catch (e: any) {
        if (e?.code === 11000) {
            return res.status(400).json({
                success: false,
                msg: "El libro ya existe"
            })
        }
        return res.status(500).json({
            success: false,
            msg: `Error al crear el libro: ${e?.message || e}`
        })
    }   
}

export async function listarLibros(req: Request, res: Response) {
    const libros = await Libro.find().sort({ createdAt: -1 });
    return res.status(200).json({ 
        success: true, 
        libros 
    });
};

export async function obtenerLibro(req: Request, res: Response) {
    try {
        const libro = await Libro.findById(req.params.id);
        if (!libro) {
            return res.status(404).json({
                success: false,
                msg: "Libro no encontrado"
            })
        }
        return res.status(200).json({
            success: true,
            libro
        })
    } catch (e: any) {
        return res.status(500).json({
            success: false,
            msg: `Error al obtener el libro: ${e?.message || e}`
        })
    }
}

export async function actualizarLibro(req: Request, res: Response) {
    try {
        const libro = await Libro.findByIdAndUpdate(req.params.id, req.body, 
            { new: true, runValidators: true });
        if (!libro) {
            return res.status(404).json({
                success: false,
                msg: "Libro no existe"
            })
        }
        return res.status(200).json({
            success: true,
            libro
        })
    } catch (e: any) {
        if (e?.code === 11000) {
            return res.status(400).json({
                success: false,
                msg: "El libro ya existe"
            })
        }
        return res.status(500).json({
            success: false,
            msg: `Error al actualizar el libro: ${e?.message || e}`
        })
    }
}

export async function eliminarLibro(req: Request, res: Response) {
    try {
        const libro = await Libro.findByIdAndDelete(req.params.id);
        if (!libro) {
            return res.status(404).json({
                success: false,
                msg: "Libro no existe"
            })
        }
        return res.status(200).json({
            success: true,
            msg: "Libro eliminado correctamente"
        })
    } catch (e: any) {
        return res.status(500).json({
            success: false,
            msg: `Error al eliminar el libro: ${e?.message || e}`
        })
    }
}   

