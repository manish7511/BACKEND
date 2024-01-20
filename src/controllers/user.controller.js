import router from "../routes/user.routes.js"
import {asyncHandler} from "../utils/asyncHandler.js"


export const registerUser=asyncHandler(async(req,res)=>{
    res.status(200).json({
        message:"success"
    })
})
