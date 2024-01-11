import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoschema=new Schema({
    videofile:{
        type:String,  // clodnary url
        required:true
    },
    thumbnail:{
        type:String,  
        required:true
    },
    title:{
        type:String,  
        required:true
    },
    description:{
        type:String,  
        required:true
    },
    duration:{
        type:String,  // clodnary url
        required:true
    },
    views:{
        type:Number,
        default:0
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"user"

    }
},{
    timestamps:true
})

videoschema.plugin(mongooseAggregatePaginate)

export const Video=mongoose.model("Video",videoschema)