import mongoose from "mongoose";

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('db mongo connected');
    
  } catch (error) {
    console.log("error", error);
  }
};

export default dbConnection;
