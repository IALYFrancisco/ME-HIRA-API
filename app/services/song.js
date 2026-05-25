import path from "path";
import { Song } from "../models/song.js";
import e from "express";
import { fileURLToPath } from "url";
import multer from "multer"

export async function GetSong(request, response){
    try{
        if( request.query.slug ){
            let song = await Song.findOne({ slug: request.query.slug })
            response.status(200).json(song)
        }
        let songs = await Song.find()
        response.status(200).json(songs)
    }
    catch{
        response.status(500).end()
    }
}

export async function AddSong(request, response){
    try{
        const song = request.body
        let _song = new Song(song)
        _song = await _song.save()
        response.status(201).end()
    }
    catch{
        response.status(500).end()
    }
}

export async function UpdateSong(request, response) {
    try{
        const { song, update } = request.body
        await Song.findByIdAndUpdate(song, update)
        response.status(200).end()
    }
    catch{
        response.status(500).end()
    }
}

export async function SongPublication(request, response){
    try{
        const { song, update } = request.body
        await Song.findByIdAndUpdate(song, update)
        response.status(200).end()
    }
    catch{
        response.status(500).end()
    }
}

export async function DeleteSong(request, response) {
    try{
        const { song } = request.body
        await Song.findByIdAndDelete(song)
        response.status(200).end()
    }catch{
        response.status(500).end()
    }
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const staticFilesServConfigurations = e.static(path.join(__dirname, '../public'))

const storage = multer.diskStorage({
    destination: function(request, file, callback){
        callback(null, "./app/public/songs/")
    },
    filename: function(request, file, callback){
        const originalName: file.originalname
        callback(null, originalName)
    }
})

export const upload = multer({ storage })