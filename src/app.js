import  express  from "express";
import Cors from "cors";
import cookieParser from "cookie-parser";
const app=express();


app.use(Cors({
    origin:process.env.CORS_ORIGIN,
    Credential:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// routes 

import router from "./routes/user.routes.js";

// Use the router in your application
app.use('/api/v1/user', router)

export {app}

