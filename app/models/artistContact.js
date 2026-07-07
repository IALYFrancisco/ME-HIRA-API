import { model, Schema } from "mongoose";

const contactArtistSchema = new Schema({
    artistId: { type: Schema.Types.ObjectId, ref: "Artist", required: true },
    phoneNumber: { type: String },
    email: { type: String }
})

contactArtistSchema.set("optimisticConcurrency", true)

export const ContactArtist = new model('ContactArtist', contactArtistSchema)