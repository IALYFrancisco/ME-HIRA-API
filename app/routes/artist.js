import { Router } from "express"
import { CreateArtistDocument, GetArtist } from "../services/artist.js"
import { isAuthenticated } from "../services/authentication.js";
import { isAdminOrSuperuser } from "../services/user.js";

export const artistRouter = Router()

artistRouter.get('/get', isAuthenticated, isAdminOrSuperuser, GetArtist)
artistRouter.post('/create-document', isAuthenticated, isAdminOrSuperuser, CreateArtistDocument)