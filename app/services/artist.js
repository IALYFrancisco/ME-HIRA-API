import multer from "multer";
import { Artist } from "../models/artist.js";
import { ContactArtist } from "../models/artistContact.js";
import { normalizeText } from "./song.js";
import path from "path"

export async function GetArtist(request, response){
    try{

        const { prompt } = request.query
        let artists = []

        if(prompt && prompt.trim() !== ""){

            const normalized_prompt = normalizeText(prompt)
            
            const stages = [
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
                },
                { 
                    $match: {
                        $or: [
                            { normalizedName: new RegExp(normalized_prompt, "i") },
                            { normalizedArtistName: new RegExp(normalized_prompt, "i") },
                        ]
                    } 
                }
            ]

            artists = await Artist.aggregate(stages)

            return response.status(200).json(artists)
            
        }

        artists = await Artist.aggregate([
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

        return response.status(200).json(artists)
    }
    catch{
        return response.status(500).end()
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

export async function UpdateArtistDocument(request, response){
    try{

        const { artist, artistContact, docId } = request.body.update
        
        if(artist){
            await Artist.findByIdAndUpdate(docId, artist)
            return response.status(200).end()
        }

        if(artistContact){
            await ContactArtist.findOneAndUpdate({ artistId: docId }, artistContact)
            return response.status(200).end()
        }

        return response.status(400).end()

    }
    catch{
        return response.status(500).end()
    }
}

export async function DeleteArtistDocument( request, response ){
    try{
        const { docId } = request.body
        await Artist.findByIdAndDelete(docId)
        await ContactArtist.findOneAndDelete({ artistId: docId })
        return response.status(200).end()
    }
    catch {
        return response.status(500).end()
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./app/public/artist/profiles")
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname)
        const uniqueName = `${Date.now()}${extension}`
        cb(null, uniqueName)
    }
})

// Cette configuration upload est utilisée uniquement par la route de création de document artiste.
// Plus précisement pour uploder l'image d'un artiste.
export const upload = multer({})