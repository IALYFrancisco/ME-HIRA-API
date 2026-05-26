import { Schema, model } from "mongoose";

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    status: { type: String, required: true, default: 'user' },
}, { timestamps: true })

userSchema.set('optimisticConcurrency', true)

export const User = new model('Users', userSchema)