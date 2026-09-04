import { Router } from "express"
import { CreateArtistDocument, DeleteArtistDocument, GetArtist, UpdateArtistDocument, upload } from "../services/artist.js"

export const artistRouter = Router()

artistRouter.get('/get', GetArtist)
artistRouter.post('/create-document', upload.single("artistProfile"), CreateArtistDocument)
artistRouter.patch('/update', UpdateArtistDocument)
artistRouter.delete('/delete', DeleteArtistDocument)