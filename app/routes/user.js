import { Router } from "express";
import { isAuthenticated } from "../services/authentication";
import { GetCurrentUserInformations } from "../services/user";

export const userRouer = Router()

userRouer.get('/informations', isAuthenticated, GetCurrentUserInformations)