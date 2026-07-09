// backend/src/middlewares/asyncHandler.ts
import type { Request, Response, NextFunction, RequestHandler } from "express"

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next) // équivalent à .catch(error => next(error))
  }
}

export default asyncHandler