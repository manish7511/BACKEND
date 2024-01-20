import router from "../routes/user.routes.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Apierror} from "../utils/Apierror.js"
import{User} from "../models/user.model.js"
import {uploadOncloudnairy} from "../utils/cloudnairy.js"
import {Apiresponse} from "../utils/Apiresponse.js"
import Jwt from "jsonwebtoken"

const generateAccessAndrefreshToken=async(userId)=>{
    try {
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}

    } catch (error) {
        throw new Apierror(500,"something went wrong while generating refresh and access token")
    }
}



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

const loginUser=asyncHandler(async(req,res)=>{
    //  req body -> data
    //  username or email
    //  find the user
    //  password check
    //  access token and refresh token
    //  send cookie 
    //  send response

    const{email,username,password}=req.body
     
    if(!username && !email){
        throw new Apierror(400,"username or password is required")
    }
    const user=await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new Apierror(404,"user doesnot exist")
    }
    const ispasswordvalid=await user.isPasswordCorrect(password)
    if(!ispasswordvalid){
        throw new Apierror(401,"Invalid user credntials ")
    }
    const {accessToken,refreshToken}=await 
    generateAccessAndrefreshToken(user._id)

    const loggedInuser=await User.findById(user._id).
    select("-password -refreshToken")

    const options={    //only server modified cookies
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new Apiresponse(
            200,
            {
                user:loggedInuser,accessToken,
                refreshToken
            },
            "user logged In sucessfully"
        )
    )
})

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,{
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true
    }
    return res.
    status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new Apiresponse(200,{},"user logged Out"))

})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken

    if(incomingRefreshToken){
        throw new Apierror(401,"unauthorized request")
    }

   try {
     const decodedToken=Jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
     const user=await User.findById(decodedToken?._id)
 
     if(!user){
         throw new Apierror(401,"invalid refresh token")
     }
 
     if(!incomingRefreshToken!==user?.refreshToken){
         throw new Apierror(401,"refresh token is expired or used")
     }
 
     const options={
         httpOnly:true,
         secure:true
     }
 
     const {accessToken,refreshToken}=await 
     generateAccessAndrefreshToken(user._id)
 
     return res.status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refresh",refreshToken,options)
     .json(
         new Apiresponse(
             200,
             {accessToken,refreshToken: newrefreshtoken},
             "access token refreshed successfully"
         )
     )
   } catch (error) {
    throw new Apierror(401,error?.message || "Invalid refresh token")
   }
})

 export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken


}