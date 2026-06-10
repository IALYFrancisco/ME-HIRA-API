import { Schema, model } from "mongoose";
import { nanoid } from "nanoid";
import slugify from "slugify"
import { normalizeText } from "../services/song.js";

const songSchema = new Schema({
    title: { type: String, required: true },
    author: { type: String },
    fileUrl: { type: String, required: true },
    album: { type: String },
    composer: { type: String },
    fileType: { type: String, required: true },
    singer: { type: Array, required: true },
    published: { type: Boolean, required: true, default: false },
    duration: { type: Number, required:true },
    thumbnailUrl: { type: String, required:true },
    slug: { type: String, unique: true, index: true },
    slugId: { type: String, unique: true, index: true },
    normalized_title : { type: String, required: true },
    normalized_singer : { type: String, required: true }
}, { timestamps: true })

songSchema.set("optimisticConcurrency", true)

songSchema.pre("save", async function () {

    if (!this.slugId) {
        this.slugId = nanoid(8)
    }
    if(!this.normalized_title){
        this.normalized_title = normalizeText(this.title)
    }
    if(!this.normalized_singer){
        this.normalized_singer = normalizeText(this.singer)
    }

    if (
        this.isModified("title") ||
        this.isModified("singer")
    ) {

        const singers = this.singer.join(" ")

        const baseSlug = slugify(
            `${this.title} ${singers}`,
            {
                lower: true,
                strict: true,
                locale: "fr"
            }
        )

        this.slug = `${baseSlug}-${this.slugId}`
        this.normalized_title = normalizeText(this.title)
        let singer = this.singer.split(",")
        this.normalized_singer = normalizeText(singer)
    }
})

export const Song = new model('Song', songSchema)