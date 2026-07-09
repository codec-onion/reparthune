// backend/src/middlewares/error.middleware.ts
import type { Request, Response, NextFunction } from "express"
import { AppError } from "../errors/AppError"
import logger from "../config/logger"

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof AppError) {
    logger.error(err.message, { errorCode: err.errorCode, context: err.context })
    res.status(err.statusCode).json({
      errorCode: err.errorCode,
      message: err.message,
    })
    return
  }

  // Erreur inattendue (bug, panne DB...) — on ne fuite pas les détails techniques
  logger.error(err.message, { stack: err.stack })
  res.status(500).json({
    errorCode: "INTERNAL_ERROR",
    message: "Une erreur est survenue",
  })
}