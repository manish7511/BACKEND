import router from "../routes/user.routes.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Apierror} from "../utils/Apierror.js"
import{User} from "../models/user.model.js"
import {uploadOncloudnairy} from "../utils/cloudnairy.js"
import {Apiresponse} from "../utils/Apiresponse.js"

const registerUser=asyncHandler(async(req,res)=>{
    //  get user details from frontend
    //  validation -not empty
    //  check if user is already exist :username,email
    //  check for images ,check for avtar
    // upload them to cloudnary, avatar
    // create user object -create entry in db
    // remove password and refresh token filed fro respone
    // check for user creation
    // return res


    const {fullname,email,username,password}=req.body
    console.log(("email",email));

    if(
        [fullname,email,username,password].some((field)=>field?.trim()==="") 
    ) {
        throw new Apierror(400,"all fields are required")
    }
     
    const existeduser=await User.findOne({
        $or:[{username},{email}]
    })
    if(existeduser){
        throw new Apierror(409),"user with email or username already exists"
    }
    
    const avatarlocalpath=req.files?.avatar[0]?.path
    // const coverimageLocalpath=req.files?.coverimage[0]?.path

    let coverimageLocalpath;
    if (req.files && Array.isArray(req.files.coverimage)
    && req.files.coverimage.length>0) {coverimageLocalpath=req.files.coverimage[0].path
}

    if(!avatarlocalpath){
        throw new Apierror(400,"Avatar file is required")
    }

    const avatar=await uploadOncloudnairy(avatarlocalpath)
    const coverimage=await uploadOncloudnairy(coverimageLocalpath)
    if(!avatar){
        throw new Apierror(400,"Avatar file is required")
    }

    const user=await User.create({
        fullname,
        avatar:avatar.url,
        coverimage:coverimage?.url || "",
        email,
        password,
        username:username.toLowerCase()

    })
    const createduser=await User.findById(user._id).select(
        "-password -refreshtoken"
    )
    if(!createduser){
        throw new Apierror(500,"something went wrong while registering the user ")
    }

    return res.status(201).json(
        new Apiresponse(200,createduser,"user registered sucseesfully")
    )


    // if(fullname===""){
    //     throw new Apierror(400,"fullname is required")
    // }

    
} )


 export {
    registerUser,
}