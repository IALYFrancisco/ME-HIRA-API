import { Router } from "express"
import { Login, Logout, RefreshToken } from "../services/authentication.js"

export const authenticationRouter = Router()

authenticationRouter.post('/login', Login)
authenticationRouter.post('/refresh-token', RefreshToken)
authenticationRouter.post('/logout', Logout)