import type { AuthPayload } from "../modules/auth/auth.payload"
import type { GroupDoc } from "../modules/groups/group.model"

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload,
      group?: GroupDoc,
    }
  }
}