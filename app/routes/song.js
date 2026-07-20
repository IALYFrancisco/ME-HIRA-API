import { Router } from "express";
import { AddSong, DeleteSong, GetSong, UpdateSong, upload } from "../services/song.js";
import { isAuthenticated } from "../services/authentication.js";
import { isAdminOrSuperuser } from "../services/user.js";

export const songRouter = Router()

songRouter.get('/get', GetSong)
songRouter.post('/add', isAuthenticated, isAdminOrSuperuser, upload.single('file'), AddSong)
songRouter.patch('/update', isAuthenticated, isAdminOrSuperuser, UpdateSong)
songRouter.delete('/remove', isAuthenticated, isAdminOrSuperuser, DeleteSong)