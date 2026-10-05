import jwt from "jsonwebtoken"
import { env } from "../config/env"

import type { Request, Response, NextFunction } from "express"

function verifyJwt (req: Request, res: Response, next: NextFunction) {
  // try {
  const token = req.headers.authorization?.split(" ")[1] || ""
  const decodedToken = jwt.verify(token, `${env.JWT_SECRET}`)
  const userId = decodedToken.userId
  req.auth = { userId: userId }
  next()
  // } catch(error) {
  //   res.status(401).json({ message: "Vous n'êtes pas autorisé à accéder à la page demandée.", error })
  // }
}

export default verifyJwt