import { Router } from "express";
import { songRouter } from "./song.js";
import { authenticationRouter } from "./authentication.js";
import { userRouter } from "./user.js";
import { artistRouter } from "./artist.js";

export const appRouter = Router()

appRouter.use('/song', songRouter)
appRouter.use('/authentication', authenticationRouter)
appRouter.use('/user', userRouter)
appRouter.use('/artist', isAuthenticated, isAdminOrSuperuser, artistRouter)