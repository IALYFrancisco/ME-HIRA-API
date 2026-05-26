import { Router } from "express";
import { AddSong, DeleteSong, GetSong, SongPublication, UpdateSong, upload } from "../services/song.js";

export const songRouter = Router()

songRouter.get('/get', GetSong)
songRouter.post('/add', upload.single('file'), AddSong)
songRouter.patch('/update', UpdateSong)
songRouter.delete('/remove', DeleteSong)
songRouter.patch('/publication', SongPublication)