import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
import { response } from "express";
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDNAIRY_CLOUD_NAME, 
  api_key: process.env.CLOUDNAIRY_API_KEY, 
  api_secret:process.env.CLOUDNAIRY_API_SECRET 
});

const uploadOncloudnairy=async (localfilepath)=>{
    try {
        if(!localfilepath) return null
        //upload the file on cloudnary
        const response=await cloudinary.uploader.upload(localfilepath,{
            resource_type:"auto"
        })
        //file has been uploaded succesfully 
        console.log("file is uploaded on cloudnairy",
        response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localfilepath) //remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

export {uploadOncloudnairy }