import { Schema, model } from "mongoose";

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    status: { type: String, required: true, default: 'user' },
    theme: { type: String, enum: ["light", "dark", "system"], default: "light" }
}, { timestamps: true })

userSchema.set('optimisticConcurrency', true)

export const User = new model('Users', userSchema)