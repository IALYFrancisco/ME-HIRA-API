import { Artist } from "../models/artist.js";
import { ContactArtist } from "../models/artistContact.js";

export async function GetArtist(request, response){
    try{

        if(request.query?.prompt && request.query.prompt.trim() !== ""){
            
        }

        let artists = await Artist.aggregate([
            { 
                $lookup: { 
                    from: "contactartists",
                    foreignField: "artistId",
                    localField: "_id",
                    as: "contacts"
                }
            },
            { $unwind: "$contacts" },
            {
                $project: {
                    __v: 0,
                    "contacts.__v": 0,
                    "contacts.artistId": 0
                }
            }
        ])

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
        newArtistDocument.roles = artist.roles.split(", ")
        newArtistDocument = await newArtistDocument.save()
        let newArtistContact = new ContactArtist(contact)
        newArtistContact.artistId = newArtistDocument._id
        newArtistContact = await newArtistContact.save()
        if(newArtistDocument && newArtistContact){
            return response.status(201).end()
        }
    }
    catch{
        response.status(500).end()
    }
}