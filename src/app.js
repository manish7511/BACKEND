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

import userRouter from "./routes/user.routes.js"


// routes declartion 

app.use("/api/v1/users",userRouter)

// https://localhost:800/api/v1/users/register

export {app}

