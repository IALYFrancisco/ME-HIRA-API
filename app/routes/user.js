import { Router } from "express";
import { isAuthenticated } from "../services/authentication";
import { getCurrentUserInformations } from "../services/user";

export const userRouer = Router()

userRouer.get('/informations', isAuthenticated, getCurrentUserInformations)