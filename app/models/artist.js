import { Schema } from "mongoose";

const artistSchema = new Schema({
    name: { type: String, required: true }, /** this is the full real name of the subject */
    artistName: { type: String, required: true },
    roles: { type: Array, required: true },
})