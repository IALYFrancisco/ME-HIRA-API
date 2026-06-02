import { Router } from "express"
import { isNotAuthenticated, Login, Logout, RefreshToken } from "../services/authentication.js"

export const authenticationRouter = Router()

authenticationRouter.post('/login', isNotAuthenticated, Login)
authenticationRouter.post('/refresh-token', RefreshToken)
authenticationRouter.post('/logout', Logout)