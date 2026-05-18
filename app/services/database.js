import { connect } from "mongoose";

export function dbConnection(){
    connect(process.env.DB_URI)
    .then(() => console.log("The application is connected into the mongodb."))
    .catch(() => console.log("Failed to connect into mongodb."))
}