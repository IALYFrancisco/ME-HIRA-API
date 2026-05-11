import mongoose, { Schema, model, Types } from "mongoose";

const songSchema = new Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    fileUrl: { type: String, required: true },
    album: { type: String },
    composer: { type: String, required: true },
    fileType: { type: String, required: true },
    singer: { type: Types.Array, required: true }
})

export const Song = new model('Song', songSchema)