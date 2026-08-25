import { compare, hash } from "bcrypt"
import { User } from "../models/user.js"
import jwt from "jsonwebtoken"
import { ResetPasswordToken } from "../models/resetPasswordToken.js"
import { createHash } from "crypto"

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
    const at_sid = jwt.sign({ _id: user._id, status: user.status }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "5m" })
    const rt_sid = jwt.sign({ _id: user._id, status: user.status }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1d" })

    response.cookie("rt.sid", rt_sid, {
        httpOnly: true,
        secure: process.env.APP_ENV_STATE === "production",
        sameSite: process.env.APP_ENV_STATE === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    response.status(200).json({ at_sid })
 }
 catch{
    response.status(500).end()
 }
}

export async function RefreshToken(request, response){
    try{
        const rt_sid = request.cookies["rt.sid"]
        if(!rt_sid){
            return response.status(209).end()
        }
        const decoded = jwt.verify(rt_sid, process.env.REFRESH_TOKEN_SECRET)
        const at_sid = jwt.sign({ _id: decoded._id, status: decoded.status }, process.env.ACCESS_TOKEN_SECRET, {expiresIn:"5m"})
        response.status(200).json({at_sid})
    }
    catch{
        response.status(209).end()
    }
}

export async function Logout(request, response){
    try{
        response.clearCookie("rt.sid", {
            httpOnly: true,
            secure: process.env.APP_ENV_STATE === "production",
            sameSite: process.env.APP_ENV_STATE === "production" ? "none" : "lax",
            path: "/"
        })

        response.status(200).end()
    }
    catch{
        response.status(500).end()
    }
}

export async function CheckResetPasswordToken(request, response){
    try{
        const { k } = request.body

        if(!k) return response.status(400).end()

        const hashedK = createHash("sha256").update(k).digest("hex")
        const resetPasswordToken = await ResetPasswordToken.findOne({ hashedToken: hashedK })
        
        if(!resetPasswordToken) return response.status(400).end()

        if(resetPasswordToken.used) return response.status(400).end()

        if(resetPasswordToken.expiresAt <= new Date() ) return response.status(400).end()

        return response.status(200).end()
    }
    catch{
        return response.status(500).end()
    }
}

export function isAuthenticated(request, response, next){
    try{
        const authorization = request.headers.authorization
        const rt_sid = request.cookies["rt.sid"]
        
        if(!authorization || !rt_sid){
            return response.status(209).end()
        }
        const at_sid = authorization.split(" ")[1]
        const decoded = jwt.verify(at_sid, process.env.ACCESS_TOKEN_SECRET)
        jwt.verify(rt_sid, process.env.REFRESH_TOKEN_SECRET)
        request.user = decoded
        next()
    }
    catch{
        response.status(209).end()
    }
}

export function isNotAuthenticated(request, response, next){
    try{
        const authorization = request.headers.authorization
        const rt_sid = request.cookies["rt.sid"]
        
        if(!authorization || !rt_sid){
            return next()
        }
        const at_sid = authorization.split(" ")[1]
        const decoded = jwt.verify(at_sid, process.env.ACCESS_TOKEN_SECRET)
        jwt.verify(rt_sid, process.env.REFRESH_TOKEN_SECRET)
        response.status(209).end()
    }
    catch{
        next()
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
