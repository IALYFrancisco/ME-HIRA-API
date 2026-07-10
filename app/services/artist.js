import { Artist } from "../models/artist.js";

export async function GetArtist(request, response){
    try{
        let artists = await Artist.find()
        response.status(200).json(artists)
    }
    catch{
        response.status(500).end()
    }
}

export async function CreateArtistDocument(request, response) {
    
}