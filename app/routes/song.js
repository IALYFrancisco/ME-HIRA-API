import { Router } from "express";
import { AddSong, GetSong, UpdateSong } from "../services/song.js";

export const songRouter = Router()

songRouter.get('/get', GetSong)
songRouter.post('/add', AddSong)
songRouter.patch('/update', UpdateSong)