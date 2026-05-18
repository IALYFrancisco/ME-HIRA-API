import { Router } from "express";
import { songRouter } from "./song.js";

export const appRouter = Router()

appRouter.use('/song', songRouter)