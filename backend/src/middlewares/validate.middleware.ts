import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppError } from "../errors/AppError";

type ValidationTarget = "body" | "params" | "query";

export function validate(schema: z.ZodType, target: ValidationTarget = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      return next(
        new AppError("Erreur de validation des données",
          400,
          "VALIDATION_ERROR",
          { msg: z.prettifyError(result.error) }
        )
      );
    }

    req[target] = result.data;
    next();
  };
}