import { Router } from "express";
import { songRouter } from "./song.js";
import { authenticationRouter } from "./authentication.js";

export const appRouter = Router()

appRouter.use('/song', songRouter)
appRouter.use('/authentication', authenticationRouter)