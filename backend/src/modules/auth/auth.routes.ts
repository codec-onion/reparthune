import { Router } from "express"
import * as authControllers from "./auth.controller"
import { validate } from "../../middlewares/validate.middleware"
import { registerSchema, loginSchema } from "@reparthune/shared"

const router = Router()

router.post("/register", validate(registerSchema), authControllers.register)
router.post("/login", validate(loginSchema), authControllers.login)

export default router

