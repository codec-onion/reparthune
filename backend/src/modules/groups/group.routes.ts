import { Router } from "express"
import * as groupController from "./group.controller"
import requireAuth from "../auth/auth.middleware"
import { requireRole } from "./group.middleware"
import { validate } from "../../middlewares/validate.middleware"
import { createGroupSchema, updateGroupSchema } from "@reparthune/shared"

const router = Router()

router.get("/", requireAuth, groupController.getGroups)
router.get("/:groupId", requireAuth, groupController.getOneGroup)
router.post("/", requireAuth, validate(createGroupSchema), groupController.createGroup)
router.patch("/:groupId", requireAuth, requireRole("admin"), validate(updateGroupSchema), groupController.updateGroup)
router.delete("/:groupId", requireAuth, requireRole("admin"), groupController.deleteGroup)

export default router