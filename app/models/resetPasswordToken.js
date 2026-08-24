import { model, Schema } from "mongoose";

const resetPasswordTokenSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    hashedToken : { type: String, required: true },
    expiresAt : { type: Date, require: true },
    used: { type: Boolean, default: false, required: true }
})