import { Router } from "express";
import { isAuthenticated } from "../services/authentication.js";
import { GetCurrentUserInformations } from "../services/user.js";

export const userRouter = Router()

userRouter.get('/informations', isAuthenticated, GetCurrentUserInformations)