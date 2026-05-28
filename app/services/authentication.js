import { compare, hash } from "bcrypt"
import { User } from "../models/user.js"
import jwt from "jsonwebtoken"

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
    const accessToken = jwt.sign({ _id: user._id, status: user.status }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "10m" })
    const refreshToken = jwt.sign({ _id: user._id, status: user.status }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" })

    response.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.APP_ENV_STATE === "production",
        sameSite: process.env.APP_ENV_STATE === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    response.status(200).json({ accessToken })
 }
 catch{
    response.status(500).end()
 }
}

export async function RefreshToken(request, response){
    try{
        const refreshToken = request.cookies.refreshToken
        if(!refreshToken){
            return response.status(401).end()
        }
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        const accessToken = jwt.sign({ _id: decoded._id, status: decoded.status }, process.env.ACCESS_TOKEN_SECRET, {expiresIn:"10m"})
        response.status(200).json({accessToken})
    }
    catch{
        response.status(500).end()
    }
}

export async function Logout(request, response){
    try{
        response.clearCookie("refreshToken")
        response.status(200).end()
    }
    catch{
        response.status(500).end()
    }
}

export function isAuthenticated(request, response, next){
    try{
        const authorization = request.headers.authorization
        if(!authorization){
            return response.status(401).end()
        }
        const token = authorization.split(" ")[1]
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        request.user = decoded
        next()
    }
    catch{
        response.status(401).end()
    }
}

export async function HashPassword(plainText) {
    try {
        let _hash = await hash(plainText, 10)
        return _hash
    }catch{
        return undefined
    }
}