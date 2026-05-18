import path from "path";
import { Song } from "../models/song.js";
import e from "express";
import { fileURLToPath } from "url";

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

export async function AddSong(request, response){
    try{
        let song = request.body.song
        await new Song(song)
        response.status(201).end()
    }
    catch{
        response.status(500).end()
    }
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const staticFilesServConfigurations = e.static(path.join(__dirname, '../public'))