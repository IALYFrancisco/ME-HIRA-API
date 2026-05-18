import { Router } from "express";
import { GetSong } from "../services/song.js";

export const songRouter = Router()

songRouter.get('/get', GetSong)