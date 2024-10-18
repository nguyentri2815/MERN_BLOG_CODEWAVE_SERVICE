import mongoose, { Schema } from "mongoose";

const viewSchema = mongoose.Schema({
  postId: {
    type: Schema.Types.ObjectId,
    ref: "Posts",
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "Users",
  },
});
const Views = mongoose.model("Views", viewSchema);
export default Views;
