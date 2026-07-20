import { Router } from "express"
import { CreateArtistDocument, DeleteArtistDocument, GetArtist, UpdateArtistDocument } from "../services/artist.js"

export const artistRouter = Router()

artistRouter.get('/get', GetArtist)
artistRouter.post('/create-document', CreateArtistDocument)
artistRouter.patch('/update', UpdateArtistDocument)
artistRouter.delete('/delete', DeleteArtistDocument)