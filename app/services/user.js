import { User } from "../models/user.js"

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
    }
    catch{
        return response.status(500).end()
    }
}