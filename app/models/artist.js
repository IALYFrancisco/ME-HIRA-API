import { model, Schema } from "mongoose";
import { normalizeText } from "../services/song.js";

const artistSchema = new Schema({
    name: { type: String }, /** this is the full real name of the subject */
    artistName: { type: String, required: true },

    roles: { 
        type: [{
            type: String,
            enum: ["singer", "songwriter", "composer"]
        }],
        required: true,
        validate: {
            validator: roles => roles.length > 0,
            message: "At least one role is required"
        }
    },
    
    about: { type: String },
    address: { type: String },
    image: { type: String }, /** this attribut contains the url to the image of subject, it can be an image of only subject or an image of group with precisions */
    birthDayAndPlace : { type: String },
    normalizedName: { type: String },
    normalizedArtistName: { type: String }
}, { timestamps: true })

artistSchema.set("optimisticConcurrency", true)

artistSchema.pre("save", async function () {
    normalizeArtistFields(this)
})

function normalizeArtistFields(document){
    if(Object.prototype.hasOwnProperty.call(document, "name")){
        document.normalizedName = document.name ? normalizeText(document.name):"";
    }
    if(Object.prototype.hasOwnProperty.call(document, "artistName")){
        document.normalizedArtistName = normalizeText(document.artistName)
    }
}

export const Artist = new model('Artist', artistSchema)