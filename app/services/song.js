import path from "path";
import { Song } from "../models/song.js";
import e from "express";
import { fileURLToPath } from "url";
import multer from "multer";
import jwt from "jsonwebtoken";
import { execFile } from "child_process";
import { promisify } from "util";
import ffmpegPath from "ffmpeg-static";
import ffprobe from "ffprobe-static";
import { Octokit } from "octokit";
import fs from "fs/promises";
import axios from "axios";
import os from "os";

async function downloadToTempFile(url) {
  const ext = path.extname(new URL(url).pathname) || ".mp4";
  const filePath = path.join(os.tmpdir(), `${Date.now()}${ext}`);

  const response = await axios({
    method: "GET",
    url,
    responseType: "stream",
  });

  const writer = (await import("fs")).createWriteStream(filePath);

  response.data.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });

  return filePath;
  
}

async function safeDelete(filePath) {
  try {
    await fs.unlink(filePath);
  } catch {}
}

export async function GetSong(request, response) {
  try {
    let authorization = request.headers.authorization;
    let rt_sid = request.cookies["rt.sid"];
    const decoded = rt_sid
      ? jwt.verify(rt_sid, process.env.REFRESH_TOKEN_SECRET)
      : null;

    if (authorization && rt_sid && decoded.status === "superuser") {
      if (request.query?.prompt && request.query.prompt.trim() !== "") {
        const { prompt, fileType } = request.query;
        const normalized_prompt = normalizeText(prompt);

        const filter = {
          $or: [
            { normalized_title: new RegExp(normalized_prompt, "i") },
            { normalized_singer: new RegExp(normalized_prompt, "i") },
          ],
        };

        if (fileType) filter.fileType = fileType;

        const song = await Song.find(filter).limit(20);
        return response.status(200).json(song);
      }

      jwt.verify(authorization.split(" ")[1], process.env.ACCESS_TOKEN_SECRET);

      if (request.query.slug) {
        let song = await Song.findOne({ slug: request.query.slug });
        return response.status(200).json(song);
      }

      let songs = await Song.find();
      return response.status(200).json(songs);
    }

    if (request.query.slug) {
      let song = await Song.findOne({
        slug: request.query.slug,
        published: true,
      });
      return response.status(200).json(song);
    }

    if (request.query?.prompt && request.query.prompt.trim() !== "") {
      const { prompt, fileType } = request.query;
      const normalized_prompt = normalizeText(prompt);

      const filter = {
        published: true,
        $or: [
          { normalized_title: new RegExp(normalized_prompt, "i") },
          { normalized_singer: new RegExp(normalized_prompt, "i") },
        ],
      };

      if (fileType) filter.fileType = fileType;

      const song = await Song.find(filter).limit(20);
      return response.status(200).json(song);
    }

    let songs = await Song.find({ published: true });
    return response.status(200).json(songs);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return response.status(209).end();
    }
    return response.status(500).end();
  }
}

// =========================
// ADD SONG (FIXED)
// =========================
export async function AddSong(request, response) {
  let tempFile = null;

  try {
    const song = request.body;
    const allowedExt = [".mp4", ".mp3", ".webm", ".wav"];
    const isProd = process.env.APP_ENV_STATE === "production";

    let fileSource = null;

    // =========================
    // LOCAL UPLOAD
    // =========================
    if (request.file) {
      fileSource = request.file.path;

      const ext = path.extname(request.file.filename).toLowerCase();
      if (!allowedExt.includes(ext)) {
        return response.status(400).json({
          message: "Extension non supportée",
        });
      }
    }

    // =========================
    // EXTERNAL URL
    // =========================
    else {
      const url = new URL(song.fileUrl);
      const ext = path.extname(url.pathname).toLowerCase();

      if (!allowedExt.includes(ext)) {
        return response.status(400).json({
          message: "Lien non supporté",
        });
      }

      fileSource = song.fileUrl;

      // 🔥 IMPORTANT FIX : DOWNLOAD ONLY IN PROD
      if (isProd) {
        tempFile = await downloadToTempFile(song.fileUrl);
        fileSource = tempFile;
      }
    }

    // =========================
    // DURATION (SAFE)
    // =========================
    const durationSeconds = await getVideoDuration(fileSource);

    const newSong = new Song(song);

    // =========================
    // THUMBNAIL
    // =========================
    if (song.fileType === "video") {
      const thumbName = `${Date.now()}.jpg`;

      const thumbnailPath = path.join(
        "app",
        "public",
        "thumbnails",
        thumbName
      );

      await generateThumbnail(fileSource, thumbnailPath);

      let thumbnailUrl = `/thumbnails/${thumbName}`;

      if (isProd) {
        thumbnailUrl = await uploadThumbnailToGithub(
          thumbnailPath,
          thumbName
        );
      }

      newSong.thumbnailUrl = thumbnailUrl;
    }

    newSong.fileUrl = request.file
      ? `/songs/${request.file.filename}`
      : song.fileUrl;

    newSong.duration = durationSeconds;

    newSong.singer = song.singer
      ? song.singer.split(",").map((s) => s.trim())
      : [];

    await newSong.save();

    return response.status(201).end();
  } catch {
    return response.status(500).end();
  } finally {
    // =========================
    // CLEANUP TEMP FILE
    // =========================
    if (tempFile) {
      await safeDelete(tempFile);
    }
  }
}

export async function UpdateSong(request, response) {
  try {
    await Song.findByIdAndUpdate(request.body.song, request.body.update);
    response.status(200).end();
  } catch {
    response.status(500).end();
  }
}

export async function SongPublication(request, response) {
  try {
    await Song.findByIdAndUpdate(request.body.song, request.body.update);
    response.status(200).end();
  } catch {
    response.status(500).end();
  }
}

export async function DeleteSong(request, response) {
  try {
    await Song.findByIdAndDelete(request.body.song);
    response.status(200).end();
  } catch {
    response.status(500).end();
  }
}

// =========================
// MULTER CONFIG
// =========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const staticFilesServConfigurations = e.static(
  path.join(__dirname, "../public")
);

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "./app/public/songs/");
  },
  filename(req, file, cb) {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
    "video/mp4",
    "video/webm",
    "video/ogg",
  ];

  cb(null, allowed.includes(file.mimetype));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 },
});

// =========================
// FFPROBE / FFMPEG
// =========================
const execFileAsync = promisify(execFile);

export async function getVideoDuration(filePath) {
  const { stdout } = await execFileAsync(ffprobe.path, [
    "-v",
    "quiet",
    "-print_format",
    "json",
    "-show_format",
    filePath,
  ]);

  const data = JSON.parse(stdout);
  return Math.round(Number(data.format.duration));
}

export async function generateThumbnail(videoPath, outputPath) {
  await execFileAsync(ffmpegPath, [
    "-i",              // 🔥 FIX IMPORTANT (no -ss before input)
    videoPath,
    "-ss",
    "10",
    "-vframes",
    "1",
    "-q:v",
    "2",
    outputPath,
  ]);

  return outputPath;
}

// =========================
// HELPERS
// =========================
export function normalizeText(text) {
  if (Array.isArray(text)) text = text.join(" ");

  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// =========================
// GITHUB THUMB UPLOAD
// =========================
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function uploadThumbnailToGithub(
  thumbnailPath,
  thumbnailName
) {
  const fileBuffer = await fs.readFile(thumbnailPath);
  const content = fileBuffer.toString("base64");

  const pathInRepo = `thumbnails/${thumbnailName}`;

  let sha;

  try {
    const { data } = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}",
      {
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO,
        path: pathInRepo,
      }
    );

    sha = data.sha;
  } catch {}

  await octokit.request(
    "PUT /repos/{owner}/{repo}/contents/{path}",
    {
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      path: pathInRepo,
      message: `upload thumbnail ${thumbnailName}`,
      content,
      branch: process.env.GITHUB_BRANCH || "main",
      sha,
    }
  );

  return `https://cdn.jsdelivr.net/gh/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}@${process.env.GITHUB_BRANCH || "main"}/thumbnails/${thumbnailName}`;
}
