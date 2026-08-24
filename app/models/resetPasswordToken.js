import { model, Schema } from "mongoose";

const resetPasswordTokenSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    hashedToken : { type: String, required: true },
    expiresAt : { type: Date, required: true },
    used: { type: Boolean, default: false, required: true }
}, { timestamps: true })

resetPasswordTokenSchema.set("optimisticConcurrency", true)

export const ResetPasswordToken = new model("ResetPasswordToken", resetPasswordTokenSchema)