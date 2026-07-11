import { Artist } from "../models/artist.js";
import { ContactArtist } from "../models/artistContact.js";

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
    try{
        const { artist, contact } = request.body
        let newArtistDocument = new Artist(artist)
        let newArtistContact = new ContactArtist(contact)
    }
    catch{
        response.status(500).end()
    }
}