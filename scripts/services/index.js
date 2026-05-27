import { randomBytes } from "crypto"
import { HashPassword } from "../../app/services/authentication.js"
import { User } from "../../app/models/User.js"
import chalk from "chalk"

export async function CheckSuperuserAndHisEmail() {
    try{
        console.log(chalk.bgHex('#4a78a6').hex("#fffbfc")("Checking superuser and his email in the database."))
        if(process.env.SUPERUSER_EMAIL && process.env.SUPERUSER_NAME && process.env.EMAIL_SERVER_URL){
            let _user = await User.findOne({email: process.env.SUPERUSER_EMAIL})
            let user = await User.findOne({status: 'superuser'})
            if(user || _user){
                console.log(chalk.bgHex('#6e4d0cff').hex("#fffbfc")('A superuser already exist or an user with provided email already exist.'))
                return true
            }else{
                console.log(chalk.bgHex('#4a78a6').hex("#fffbfc")("Superuser doesn't exist, superuser creation."))
                return false
            }
        }else{
            console.log(chalk.bgHex('#870202ff').hex('#fffbfc')('Error checking superuser, SUPERUSER_NAME and SUPERUSER_EMAIL aren\'t defined.'))
            return undefined
        }
    }catch(err){
        console.log(chalk.bgHex('#870202ff').hex('#fffbfc')('Error checking superuser in the database.'))
        return undefined
    }
}

export const superuserPassword = randomBytes(32).toString('hex')

export async function CreateSuperuser(){
    try{
        let hashedSuperuserPassword = await HashPassword(superuserPassword)
        let superuser = {
            name: process.env.SUPERUSER_NAME,
            email: process.env.SUPERUSER_EMAIL,
            status: 'superuser',
            password: `${hashedSuperuserPassword}`
        }
        let newSuperuser = new User(superuser)
        let result = await newSuperuser.save()
        if(result){
            console.log(chalk.bgHex('#098702ff').hex('#fffbfc')('Superuser created in the database.'))
            return true
        }else{
            console.log(chalk.bgHex('#870202ff').hex('#fffbfc')('Error saving superuser in the database.'))
            return undefined
        }
    }catch(err){
        console.log(err)
        console.log(chalk.bgHex('#870202ff').hex('#fffbfc')('Error creating superuser.'))
        return undefined
    }
}