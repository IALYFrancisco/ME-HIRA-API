import { Router } from "e"
import { Login } from "../services/authentication"

export const authenticationRouter = Router()

authenticationRouter.post('/login', Login)