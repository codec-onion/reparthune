import * as groupService from "./group.service"
import { getAuthPayload } from "../auth/auth.middleware"

import type { Request, Response } from "express"

export const createGroup = async (req: Request, res: Response) => {
  const userId = getAuthPayload(req).userId
  const group = await groupService.createGroup(req.body, userId)
  return res.status(201).json(group)
}