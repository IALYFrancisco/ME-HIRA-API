import { Schema } from "mongoose";

const artistSchema = new Schema({
    name: { type: String, required: true }, /** this is the full real name of the subject */
    artistName: { type: String, required: true },
    roles: { type: Array, required: true },
    about: { type: String, required: true },
    address: { type: String, required: true },
    image: { type: String, required: true }, /** this attribut contains the url to the image of sabject, it can be an image of only subject or an image of group whit precisions */
})