import { NextFunction, Request, Response } from "express";
import { ZodError, ZodType } from "zod";

// ✅ BODY
export const validateBody = <T>(schema: ZodType<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req.body);
      req.body = data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          ok: false,
          msg: "Body inválido",
          errors: error.issues.map((e) => e.message),
        });
      }
      return next(error);
    }
  };

// ✅ PARAMS
export const validateParams = <T>(schema: ZodType<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req.params);
      req.params = data as typeof req.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          ok: false,
          msg: "Params inválidos",
          errors: error.issues.map((e) => e.message),
        });
      }
      return next(error);
    }
  };