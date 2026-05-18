import { Schema, model } from "mongoose";
import { nanoid } from "nanoid";
import slugify from "slugify"

const songSchema = new Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    fileUrl: { type: String, required: true },
    album: { type: String },
    composer: { type: String, required: true },
    fileType: { type: String, required: true },
    singer: { type: Array, required: true },
    published: { type: Boolean, required: true, default: false },
    slug: { type: String, unique: true, index: true },
    slugId: { type: String, unique: true, index: true }
}, { timestamps: true })

songSchema.set("optimisticConcurrency", true)

songSchema.pre("save", async function () {

    if (!this.slugId) {
        this.slugId = nanoid(8)
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
    }
})

export const Song = new model('Song', songSchema)