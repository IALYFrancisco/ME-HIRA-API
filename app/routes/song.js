import { Router } from "express";
import { AddSong, DeleteSong, GetSong, UpdateSong } from "../services/song.js";

export const songRouter = Router()

songRouter.get('/get', GetSong)
songRouter.post('/add', AddSong)
songRouter.patch('/update', UpdateSong)
songRouter.delete('/remove', DeleteSong)