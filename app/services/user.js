import { compare } from "bcrypt"
import { User } from "../models/user.js"
import { HashPassword } from "./authentication.js"

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

// Service permettant de vérifier si l'email fourni est associé à un count me-hira avant tout action de mot de passe oublié. 
export async function ForgottenPasswordCheckAccount(request, response) {
    try{
        
    }
    catch{
        return response.status(500).end()
    }
}