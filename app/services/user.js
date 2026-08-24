import { compare } from "bcrypt"
import { User } from "../models/user.js"
import { HashPassword } from "./authentication.js"
import { createHash, randomBytes } from "crypto"
import { ResetPasswordToken } from "../models/resetPasswordToken.js"
import axios from "axios"

export function isAdminOrSuperuser(request, response, next) {
    let { user } = request
    if(user.status === "admin" || user.status === "superuser"){
        next()
    }else{
        response.status(403).end()
    }
}

export async function GetCurrentUserInformations(request, response){
    try{
        let { user } = request
        user = await User.findOne({ _id: user._id }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0 })
        response.status(200).json(user)
    }
    catch{
        response.status(500).end()
    }
}

export async function CheckUser(request, response){
    try{
        const { user } = request.body
        let _user = await User.findOne({ _id: user._id })
        if(!_user) return response.status(404).end()
        const match = await compare(user.password, _user.password)
        if(!match) return response.status(403).end()
        return response.status(200).end()
    }
    catch{
        return response.status(500).end()
    }
}

export async function UpdateUser(request, response){
    try{
        const { user, update } = request.body

        if(update.password){
            update.password = await HashPassword(update.password)
        }

        await User.findByIdAndUpdate(user, update)

        if(update.email || update.password){

            response.clearCookie("rt.sid", {
                httpOnly: true,
                secure: process.env.APP_ENV_STATE === "production",
                sameSite: process.env.APP_ENV_STATE === "production" ? "none" : "lax",
                path: "/"
            })
            
        }

        return response.status(200).end()
    }
    catch{
        return response.status(500).end()
    }
}

// Service permettant de vérifier si l'email fourni est associé à un compte me-hira avant tout action de mot de passe oublié. 
export async function ForgottenPasswordCheckAccount(request, response) {
    try{
        const { email } = request.body
        const user = await User.findOne({ email: email })
        if(user){
            const resetPasswordToken = randomBytes(32).toString("hex")
            const hashedResetPasswordToken = createHash("sha256").update(resetPasswordToken).digest("hex")

            const templateEmail = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link rel="preconnect" href="https://fonts.googleapis.com">
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                    <link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap" rel="stylesheet">
                    <style>
                        .lato-regular {
                            font-family: "Lato", sans-serif;
                            font-weight: 400;
                            font-style: normal;
                        }
                    </style>
                    <title>Me-Hira - Réinitialisation de mot de passe</title>
                </head>
                <body>
                    <section style="max-width: 300px; margin: 100px auto; text-align: center; color: #191919;">
                        <a href="https://mehira.onrender.com" target="_blank" style="width: max-content; margin: auto;">
                            <img src="https://mehira.onrender.com/images/logo-de-me-hira.png" alt="logo du plateforme me-hira" style="width: 65px;">
                        </a>
                        <p class="lato-regular">Bonjour <strong>${user.name}</strong>, veuillez clicker sur le bouton ci-dessous afin de réinitialiser le mot de passe de votre compte utilisateur <span style="background-color: #FEC700; padding: 3px 5px;border-radius: 5px;font-size: 13px;">Me-Hira</span> .</p>
                        <a target="_blank" href="https://mehira.onrender.com/authentication/reset-password?k=${resetPasswordToken}" style="display: block;border: 1px solid #FEC700;padding: 2px;width: fit-content;height: fit-content;border-radius: 12px; margin: 40px auto;">
                            <button class="lato-regular" style="padding: 10px 15px;background-color: #FEC700;border: none;border-radius: 10px;cursor: pointer; color: #191919;">Réinitialiser mon mot de passe</button>
                        </a>
                    </section>
                </body>
                </html>
            `

            await ResetPasswordToken.deleteMany({ userId: user._id })

            const newResetPasswordToken = new ResetPasswordToken({
                userId: user._id,
                hashedToken: hashedResetPasswordToken,
                expiresAt: new Date(Date.now() + 30 * 60 * 1000),
            })

            await newResetPasswordToken.save()

            const email = {
                name: "Email provenant du platefrme Me-Hira.",
                subject: "Email de réinitialisation de mot de passe",
                sender: {
                    name: "Me-Hira",
                    email: "franciscoialy43@gmail.com"
                },
                to: [{
                    name: `${user.name}`,
                    email: `${user.email}`
                }],
                htmlContent: templateEmail
            }

            await axios.post(`${process.env.EMAIL_SERVER_URL}`, email, { headers: {
                "Content-Type": "application/json",
                "api-key": process.env.EMAIL_API_KEY
            } })

        }
        return response.status(200).end()
    }
    catch{
        return response.status(500).end()
    }
}