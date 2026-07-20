import { Router } from "express"
import { CreateArtistDocument, DeleteArtistDocument, GetArtist, UpdateArtistDocument } from "../services/artist.js"
import { isAuthenticated } from "../services/authentication.js";
import { isAdminOrSuperuser } from "../services/user.js";

export const artistRouter = Router()

artistRouter.get('/get', GetArtist)
artistRouter.post('/create-document', CreateArtistDocument)
artistRouter.patch('/update', UpdateArtistDocument)
artistRouter.delete('/delete', DeleteArtistDocument)