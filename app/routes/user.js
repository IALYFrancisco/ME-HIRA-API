import { Router } from "express";
import { isAuthenticated } from "../services/authentication.js";
import { CheckUser, GetCurrentUserInformations, isAdminOrSuperuser } from "../services/user.js";

export const userRouter = Router()

userRouter.get('/informations', isAuthenticated, GetCurrentUserInformations)
userRouter.post('/check', isAuthenticated, isAdminOrSuperuser, CheckUser)