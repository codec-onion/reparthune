import { type AuthPayload } from "../modules/auth/auth.payload"

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload
    }
  }
}