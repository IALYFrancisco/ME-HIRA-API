import path from "path";
import { Song } from "../models/song.js";
import e from "express";
import { fileURLToPath } from "url";
import multer from "multer"
import jwt from "jsonwebtoken"
import { execFile } from "child_process";
import { promisify } from "util";

export async function GetSong(request, response){
    try{

        let authorization = request.headers.authorization
        let rt_sid = request.cookies["rt.sid"]
        const decoded = rt_sid ? jwt.verify(rt_sid, process.env.REFRESH_TOKEN_SECRET) : null

        if(authorization && rt_sid && decoded.status==="superuser"){
            let at_sid = authorization.split(" ")[1]
            jwt.verify(at_sid, process.env.ACCESS_TOKEN_SECRET)
            if( request.query.slug ){
                let song = await Song.findOne({ slug: request.query.slug})
                response.status(200).json(song)
            }
            let songs = await Song.find()
            response.status(200).json(songs)
        }

        if( request.query.slug ){
            let song = await Song.findOne({ slug: request.query.slug, published: true })
            response.status(200).json(song)
        }
        let songs = await Song.find({ published: true })
        response.status(200).json(songs)
    }
    catch{
        response.status(500).end()
    }
}

export async function AddSong(request, response){
    try{
        const song = request.body
        if(request.file){
            const fileName = request.file.filename
            let newSong = new Song(song)
            newSong.fileUrl = `/songs/${fileName}`
            await newSong.save()
            return response.status(201).end()
        }else{
            let result = new Song(song)
            await result.save()
            response.status(201).end()
        }
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
        const originalName = file.originalname
        callback(null, originalName)
    }
})

export const upload = multer({ storage })

const execFileAsync = promisify(execFile)

export async function getVideoDuration(filePath) {
    const {stdout} = await execFileAsync("ffprobe", [
        "-v",
        "quiet",
        "-print_format",
        "json",
        "-show_format",
        filePath
    ])
    const data = JSON.parse(stdout)
    return Math.round(data.format.duration)
}

export async function generateThumbnail(videoPath, outputPath) {
    await execFileAsync("ffmpeg", [
        "-i",
        videoPath,
        "-ss",
        "00:00:30.000",
        "-vframes",
        "1",
        "-q:v",
        "2",
        outputPath
    ])
    return outputPath
}