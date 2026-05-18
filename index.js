import e from 'express'
import { config } from 'dotenv'
import { appRouter } from './app/routes/index.js'
import { dbConnection } from './app/services/database.js'
import { corsConfigurations } from './app/services/cors.js'
import { staticFilesServConfigurations } from './app/services/song.js'

config()
const app = e()
dbConnection()

app.use(staticFilesServConfigurations)
app.use(corsConfigurations)
app.use(e.json())
app.use(appRouter)

app.listen(1234, ()=>{ console.log(`The application is running at ${process.env.APP_DOMAIN}`) })