import { Schema } from "mongoose";

const contactArtistSchema = new Schema({
    artistId: { type: Schema.Types.ObjectId, ref: "Artist", required: true },
    phoneNumber: { type: String },
    email: { type: String }
})