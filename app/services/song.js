import { Song } from "../models/song";

export function GetSong(request, response){
    try{
        let songs = await Song.find()
        response.status(200).json(songs)
    }
    catch{
        response.status(500).end()
    }
}