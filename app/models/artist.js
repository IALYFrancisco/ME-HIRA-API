import { model, Schema } from "mongoose";
import { normalizeText } from "../services/song.js";

const artistSchema = new Schema({
    name: { type: String }, /** this is the full real name of the subject */
    artistName: { type: String },
    roles: { type: Array, required: true },
    about: { type: String },
    address: { type: String },
    image: { type: String }, /** this attribut contains the url to the image of sabject, it can be an image of only subject or an image of group whit precisions */
    birthDayAndPlace : { type: String },
    normalizedName: { type: String },
    normalizedArtistName: { type: String }
})

artistSchema.set("optimisticConcurrency", true)

artistSchema.pre("save", async function () {

    if(this.name && !this.normalizedName){
        this.normalizedName = normalizeText(this.name)
    }

    if(!this.normalizedArtistName){
        this.normalizedArtistName = normalizeText(this.artistName)
    }
    
})

export const Artist = new model('Artist', artistSchema)