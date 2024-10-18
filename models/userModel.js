// Select:true?

import mongoose, { Schema } from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    accountType: {
        type: String,
        default: "user",
    },
    provider: {
        type: String,
        default: "admin",
    },

    password: {
      type: String,
      Select: true,
    },
    image: {
      type: String,
    },
    

    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Followers",
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("Users", userSchema);
export default User;
