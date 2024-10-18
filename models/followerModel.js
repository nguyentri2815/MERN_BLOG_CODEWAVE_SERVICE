import mongoose, { Schema } from "mongoose";

const followerSchema = mongoose.Schema({
  writerId: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  followerId: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
});

const Follower = mongoose.model("Followers", followerSchema);
export default Follower;
