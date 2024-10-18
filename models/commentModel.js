import mongoose, { Schema } from "mongoose";

const commentSchema = mongoose.Schema(
  {
    desc: {
      type: String,
      required: true,
    },
    postId:{
        type:Schema.Types.ObjectId,
        ref :"Posts"
    },
    userId : {
        type:Schema.Types.ObjectId,
        ref:"Users"
    }
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comments", commentSchema);
export default Comment;
