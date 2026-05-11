import e from 'express'
import { config } from 'dotenv'
import { appRouter } from './app/routes/index.js'

config()
const app = e()

app.use(appRouter)

app.listen(1234, ()=>{ console.log(`The application is running at ${process.env.APP_DOMAIN}`) })