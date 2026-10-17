import mongoose from "mongoose"
import { Group } from "./group.model"
import { AppError } from "../../errors/AppError"
import { getAuthPayload } from "../auth/auth.middleware"
import { roleLevels } from "@reparthune/shared"

import type { Request, Response, NextFunction } from "express"
import { Role } from "@reparthune/shared"

async function loadGroup(req: Request<{ groupId: string }>) {
  const groupId = req.params.groupId

  if (!mongoose.isValidObjectId(groupId)) throw new AppError("Syntaxe id de groupe non valide", 400, "VALIDATION_ERROR")

  const userId = getAuthPayload(req).userId

  const group = await Group.findOne({ _id: groupId, "members.userId": userId })

  if (!group) throw new AppError("Ressource introuvable", 404, "NOT_FOUND")

  req.group = group
}

// function groupRoleHandler ()

export function getReqGroup(req: Request) {
  if (!req.group) throw new AppError("Ressource introuvable", 404, "NOT_FOUND")
  return req.group
}

export function requireRole(role: Role, updateOrDeleteExpense?: boolean) {
  return async (req: Request<{ groupId: string }>, res: Response, next: NextFunction) => {
    await loadGroup(req)
    const userId = getAuthPayload(req).userId
    const members = getReqGroup(req).members
    const member = members.find(el => el.userId?.toString() === userId)
    const isBadRole = member?.role  && roleLevels[member.role] < roleLevels[role]
    if (isBadRole) return next(new AppError(`Droits ${role} requis pour cette action`, 403, "FORBIDDEN"))
    // else if (updateOrDeleteExpense && isBadRole && )
    next()
  }
}