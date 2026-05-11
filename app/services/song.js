import { Song } from "../models/song.js";

export async function GetSong(request, response){
    try{
        let songs = await Song.find()
        songs = songs.filter((s)=> s.published === true)
        response.status(200).json(songs)
    }
    catch{
        response.status(500).end()
    }
}