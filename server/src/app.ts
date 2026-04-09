import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { librosRouter } from './routes/libros.routes';

export const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/libros',librosRouter);

// Global Error Handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error("🚨 Error global capturado:", err);
  res.status(500).json({ 
    ok: false, 
    msg: "Error interno en el servidor",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});  