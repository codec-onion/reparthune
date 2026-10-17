import * as groupService from "./group.service"
import { getAuthPayload } from "../auth/auth.middleware"

import type { Request, Response } from "express"
import { getReqGroup } from "./group.middleware"

export const getGroups = async (req: Request, res: Response) => {
  const userId = getAuthPayload(req).userId
  const groups = await groupService.getGroups(userId)
  return res.status(200).json(groups)
}

export const getOneGroup = async (req: Request<{ groupId: string }>, res: Response) => {
  const userId = getAuthPayload(req).userId
  const group = await groupService.getOneGroup(req.params.groupId, userId)
  return res.status(200).json(group)
}

export const createGroup = async (req: Request, res: Response) => {
  const userId = getAuthPayload(req).userId
  const group = await groupService.createGroup(req.body, userId)
  return res.status(201).json(group)
}

export const updateGroup = async (req: Request, res: Response) => {
  const reqGroup = getReqGroup(req)
  const group = await groupService.updateGroup(reqGroup, req.body)
  return res.status(200).json(group)
}

export const deleteGroup = async (req: Request, res: Response) => {
  const reqGroup = getReqGroup(req)
  await groupService.deleteGroup(reqGroup)
  res.status(200).json({ message: "Groupe supprimé" })
}