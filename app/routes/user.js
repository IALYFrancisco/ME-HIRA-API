import { Router } from "express";
import { CheckResetPasswordToken, isAuthenticated, isNotAuthenticated } from "../services/authentication.js";
import { CheckUser, GetCurrentUserInformations, isAdminOrSuperuser, UpdateUser, ForgottenPasswordCheckAccount } from "../services/user.js";

export const userRouter = Router()

userRouter.get('/informations', isAuthenticated, GetCurrentUserInformations)
userRouter.post('/check', isAuthenticated, isAdminOrSuperuser, CheckUser)
userRouter.patch('/update', isAuthenticated, isAdminOrSuperuser, UpdateUser)
userRouter.post('/forgotten-password', isNotAuthenticated, ForgottenPasswordCheckAccount)
userRouter.post('/check-k', isNotAuthenticated, CheckResetPasswordToken)