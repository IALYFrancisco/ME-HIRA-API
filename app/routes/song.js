import { Router } from "express";
import { GetSong } from "../services/song";

export const songRouter = Router()

songRouter.get('/get', GetSong)