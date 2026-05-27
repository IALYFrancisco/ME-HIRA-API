import { CheckSuperuserAndHisEmail, CreateSuperuser, superuserPassword } from "./services/index.js";
import fs from 'fs'
import path from "path";
import os from 'os'
import { config } from "dotenv";
import { dbConnection } from "../app/services/database.js";
import { disconnect } from "mongoose";

config({ quiet: true })

async function CreateSuperuserAndSaveLocal(){
    try{
        dbConnection()
        let checkingResult = await CheckSuperuserAndHisEmail()
        if(checkingResult === true){
            return
        }else if(checkingResult === false){
            let homedir = os.homedir()
            let superuserInfosLocation = path.join(
                homedir,
                '.mehira',
                'superuser'
            )
            fs.mkdirSync(superuserInfosLocation, { recursive: true })
            let fileContents = `{name: '${process.env.SUPERUSER_NAME}',email: '${process.env.SUPERUSER_EMAIL}',status: 'superuser',password: '${superuserPassword}'}`
            let filePath = path.join(superuserInfosLocation, 'informations.json')
            fs.writeFileSync(filePath, fileContents, 'utf-8')
            console.log(`Superuser informations are saved at ${filePath}`)
            await CreateSuperuser()
            console.log('Done!')
        }else if(checkingResult === undefined){
            return
        }
    }
    catch(err){
        console.log(err)
        console.log(chalk.bgHex('#870202ff').hex('#fffbfc')('Error saving local the superuser informations.'))
    }finally{
        await disconnect()
    }
}

CreateSuperuserAndSaveLocal()