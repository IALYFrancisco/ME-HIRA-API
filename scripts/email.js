import { CheckSuperuserAndHisEmail, CreateSuperuser, superuserPassword } from "./services/index.js";
import { config } from "dotenv";
import { dbConnection } from "../app/services/database.js";
import { disconnect } from "mongoose";
import axios from "axios";

config({ quiet: true })

async function CreateSuperuserAndSendEmail(){
    try{
        dbConnection()
        let checkingResult = await CheckSuperuserAndHisEmail()
        if(checkingResult === true){
            return
        }else if (checkingResult === false){
            let emailTemplate = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap');
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                </style>
                <title>Création de superutilisateur</title>
            </head>
            <body style="font-family: Lato;">
                <section style="max-width: 300px; margin: 100px auto; display: flex; justify-content: center; flex-direction: column; text-align: center; row-gap: 25px; color: #191919;">
                    <a href="https://mehira.onrender.com" target="_blank" style="width: max-content; margin: auto;">
                        <img src="logo-de-me-hira.png" alt="logo du plateforme me-hira" style="width: 65px;">
                    </a>
                    <p>Les informations concernant le superutilisateur créé pour <span style="background-color: #FEC700; padding: 3px 5px;border-radius: 5px;font-size: 13px;">Me-Hira</span> sont les suivantes :</p>
                    <div class="superuser-info">
                        <h3>Nom :</h3><p>${process.env.SUPERUSER_NAME}</p>
                    </div>
                    <div class="superuser-info">
                        <h3>Email :</h3><p>${process.env.SUPERUSER_EMAIL}</p>
                    </div>
                    <div class="superuser-info">
                        <h3>Mot de passe :</h3><p>${superuserPassword}</p>
                    </div>
                    <a target="_blank" href="https://mehira.onrender.com/authentication/login" style="display: block;border: 1px solid #FEC700;padding: 2px;width: fit-content;height: fit-content;border-radius: 12px; margin: auto;">
                        <button style="padding: 10px 15px;background-color: #FEC700;border: none;border-radius: 10px;cursor: pointer; color: #191919;">Aller à la page de connexion</button>
                    </a>
                </section>
            </body>
            </html>`
    
            let email = {
                name: "Email provenant du plateforme Me-Hira pour son superutilisateur.",
                subject: "Informations du superutilisateur.",
                sender: {
                    name: "Me-Hira",
                    email: "franciscoialy43@gmail.com"
                },
                to:[{
                    name: `${process.env.SUPERUSER_NAME}`,
                    email: `${process.env.SUPERUSER_EMAIL}`
                }],
                htmlContent: emailTemplate
            }
    
            await axios.post(`${process.env.EMAIL_SERVER_URL}`, email, { headers: {
                "Content-Type": "application/json",
                "api-key": process.env.EMAIL_API_KEY
            } }).then( async ()=>{
                console.log(`Superuser informations sent to the administrator.`)
                await CreateSuperuser()
                console.log('Done!')
            })
        }else if (checkingResult === undefined){
            return
        }
    }
    catch(err){
        console.log(err)
        console.log('Error sending to email the superuser informations.')
    }finally{
        await disconnect()
    }
}

CreateSuperuserAndSendEmail()
