import jwt from "jsonwebtoken"
import { env } from "../../config/env"
import { AppError } from "../../errors/AppError"
import { authPayloadSchema } from "./auth.payload"

import type { Request, Response, NextFunction } from "express"

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const [bearer, token] = req.headers.authorization?.split(" ") || []
  if (bearer !== "Bearer" || !token) {
    return next(unauthorizedError())
  }

  let decoded
  try {
    decoded = jwt.verify(token, env.JWT_SECRET)
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError("Token expiré", 401, "TOKEN_EXPIRED"))
    } else if (error instanceof jwt.JsonWebTokenError) {
      return next(unauthorizedError())
    } else {
      return next(error)
    }
  }

  const payload = authPayloadSchema.safeParse(decoded)

  if (!payload.success) {
    return next(unauthorizedError())
  }

  req.auth = payload.data
  next()
}

function unauthorizedError () {
  return new AppError("Token invalide", 401, "UNAUTHORIZED")
}

export default requireAuth