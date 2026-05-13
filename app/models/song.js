import mongoose, { Schema, model } from "mongoose";

const songSchema = new Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    fileUrl: { type: String, required: true },
    album: { type: String },
    composer: { type: String, required: true },
    fileType: { type: String, required: true },
    singer: { type: Array, required: true },
    published: { type: Boolean, required: true, default: false }
}, { timestamps: true })

export const Song = new model('Song', songSchema)