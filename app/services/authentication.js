import { compare } from "bcrypt"
import { User } from "../models/user"
import { sign } from "jsonwebtoken"

export async function Login(request, response) {
 try{
    const { email, password } = request.body
    const user = await User.findOne({ email })
    if(!user){
        return response.status(401).end()
    }
    const match = await compare(password, user.password)
    if(!match){
        return response.status(401).end()
    }
    const accessToken = sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "10m" })
    const refreshToken = sign({ _id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" })

    response.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: 
    })
 }
 catch{
    response.status(500).end()
 }
}