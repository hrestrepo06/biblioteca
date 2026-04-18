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
    try {
        // Parametrización de entrada
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string;
        const category = req.query.category as string;
        
        const skip = (page - 1) * limit;

        // Construcción del Filtro Optimizado (El buscador se muda al Backend)
        const filter: any = {};
        
        if (search) {
            filter.$or = [
                { titulo: { $regex: search, $options: 'i' } },
                { autor: { $regex: search, $options: 'i' } }
            ];
        }

        if (category && category !== 'Todas') {
            filter.categoria = category;
        }

        // Ejecutar Búsqueda y Conteo Paralelamente (Perfomance)
        const [libros, total] = await Promise.all([
            Libro.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Libro.countDocuments(filter)
        ]);

        return res.status(200).json({ 
            success: true, 
            libros,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + libros.length < total
            }
        });
    } catch (e: any) {
        return res.status(500).json({
            success: false,
            msg: `Error al paginar catálogo: ${e?.message || e}`
        });
    }
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

