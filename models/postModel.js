// Tên thư mục : models
// Tên features: featuresModel
// + featuresSchema = mongoose.schema : type, required, unique, default ....
// + Features = mongoose.model : { Tên Features , featuresSchema }
// + export default

import mongoose, { Schema } from "mongoose";

const postSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    category: {
      type: String,
    },
    image: {
      type: String,
    },
    desc: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },

    //Ý đồ tác giả đề đơn giản cho việc filter data popular posts
    views: [
      {
        type: Schema.Types.ObjectId,
        ref: "Views",
      },
    ],

    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comments",
      },
    ],
  },
  { timestamps: true }
);

const Post = mongoose.model("Posts", postSchema);

export default Post;
