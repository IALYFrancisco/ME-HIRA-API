import { Router } from "e"
import { Login, Logout, RefreshToken } from "../services/authentication"

export const authenticationRouter = Router()

authenticationRouter.post('/login', Login)
authenticationRouter.post('/refresh-token', RefreshToken)
authenticationRouter.post('/refresh-token', Logout)