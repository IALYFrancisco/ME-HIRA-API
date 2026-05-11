import { Router } from "express";
import { songRouter } from "./song";

export const appRouter = Router()

appRouter.use('/song', songRouter)