import { Router } from "express"
import * as groupController from "./group.controller"
import requireAuth from "../auth/auth.middleware"
import { validate } from "../../middlewares/validate.middleware"
import { createGroupSchema } from "@reparthune/shared"

const router = Router()

router.post("/create", requireAuth, validate(createGroupSchema), groupController.createGroup)

export default router