import path from "path";
import { Song } from "../models/song.js";
import e from "express";
import { fileURLToPath } from "url";
import multer from "multer"
import jwt from "jsonwebtoken"
import { execFile } from "child_process";
import { promisify } from "util";
import ffmpegPath from "ffmpeg-static";
import ffprobe from "ffprobe-static";
import { Octokit } from "octokit"
import fs from "fs/promises"

export async function GetSong(request, response){
    try{

        let authorization = request.headers.authorization
        let rt_sid = request.cookies["rt.sid"]
        const decoded = rt_sid ? jwt.verify(rt_sid, process.env.REFRESH_TOKEN_SECRET) : null

        if(authorization && rt_sid && decoded.status==="superuser"){

            if( request.query?.prompt && request.query.prompt.trim() !== "" ){
                const { prompt } = request.query
                const normalized_prompt = normalizeText(prompt)
                const song = await Song.find({
                    $or: [
                        { normalized_title: new RegExp(normalized_prompt, "i") },
                        { normalized_singer: new RegExp(normalized_prompt, "i") }
                    ]
                }).limit(20)
                return response.status(200).json(song)
            }

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
            return response.status(200).json(song)
        }
        if( request.query?.prompt && request.query.prompt.trim() !== "" ){
            const { prompt } = request.query
            const normalized_prompt = normalizeText(prompt)
            const song = await Song.find({
                published:true,
                $or: [
                    { normalized_title: new RegExp(normalized_prompt, "i") },
                    { normalized_singer: new RegExp(normalized_prompt, "i") }
                ]
            }).limit(20)
            return response.status(200).json(song)
        }
        let songs = await Song.find({ published: true })
        response.status(200).json(songs)
    }
    catch(error){
        if(error.name === 'TokenExpiredError'){
            return response.status(209).end()
        }
        response.status(500).end()
    }
}

export async function AddSong(request, response){
    try{
        const song = request.body
        if(request.file){

            let filePath = request.file.path
            const durationSeconds = await getVideoDuration(filePath)
            let newSong = new Song(song)

            if(song.type === "video"){

                const thumbName = `${Date.now()}.jpg`
                const thumbnailPath = path.join("app","public","thumbnails", thumbName)
                await generateThumbnail(filePath, thumbnailPath)
                newSong.thumbnailUrl = `/thumbnails/${thumbName}`

            }
            
            const fileName = request.file.filename
            newSong.fileUrl = `/songs/${fileName}`
            newSong.duration = durationSeconds
            
            await newSong.save()
            return response.status(201).end()
        }else{
            let durationSeconds = await getVideoDuration(song.fileUrl)
            let result = new Song(song)

            if(song.fileType === "video"){

                let thumbName = `${Date.now()}.jpg`
                let thumbnailPath = path.join("app","public","thumbnails", thumbName)
                await generateThumbnail(song.fileUrl, thumbnailPath)
                let thumbnailUrl = `/thumbnails/${thumbName}`
                if(process.env.APP_ENV_STATE === "production"){
                    thumbnailUrl = await uploadThumbnailToGithub(
                        thumbnailPath,
                        thumbName
                    )
                }
                result.thumbnailUrl = thumbnailUrl
                
            }

            result.singer = song.singer.split(", ")
            result.duration = durationSeconds

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

    const { stdout } = await execFileAsync(
        ffprobe.path,
        [
            "-v",
            "quiet",
            "-print_format",
            "json",
            "-show_format",
            filePath
        ]
    )

    const data = JSON.parse(stdout)

    return Math.round(Number(data.format.duration))
}

export async function generateThumbnail(videoPath, outputPath) {

    await execFileAsync(
        ffmpegPath,
        [
            "-ss",
            "10",
            "-i",
            videoPath,
            "-vframes",
            "1",
            "-q:v",
            "2",
            outputPath
        ]
    )

    return outputPath
}

export function normalizeText(text){
    if(Array.isArray(text)){
        text = text.join(" ")
    }

    return String(text || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
}

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
})

export async function uploadThumbnailToGithub(
    thumbnailPath,
    thumbnailName
){
    const fileBuffer = await fs.readFile(thumbnailPath)
    const content = fileBuffer.toString("base64")

    const pathInRepo = `thumbnails/${thumbnailName}`

    let sha = undefined

    try {
        const { data } = await octokit.request(
            "GET /repos/{owner}/{repo}/contents/{path}",
            {
                owner: process.env.GITHUB_OWNER,
                repo: process.env.GITHUB_REPO,
                path: pathInRepo
            }
        )

        sha = data.sha
    } catch (err) {
    }

    await octokit.request(
        "PUT /repos/{owner}/{repo}/contents/{path}",
        {
            owner: process.env.GITHUB_OWNER,
            repo: process.env.GITHUB_REPO,
            path: pathInRepo,
            message: `upload thumbnail ${thumbnailName}`,
            content,
            branch: process.env.GITHUB_BRANCH || "main",
            sha
        }
    )

    return `https://cdn.jsdelivr.net/gh/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}@${process.env.GITHUB_BRANCH || "main"}/thumbnails/${thumbnailName}`
}