import e from 'express'
import { config } from 'dotenv'

config()
const app = e()

app.listen(1234, ()=>{ console.log(`The application is running at ${}`) })