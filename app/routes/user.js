import { Router } from "express";
import { isAuthenticated } from "../services/authentication.js";
import { GetCurrentUserInformations } from "../services/user.js";

export const userRouer = Router()

userRouer.get('/informations', isAuthenticated, GetCurrentUserInformations)