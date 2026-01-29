import mongoose from "mongoose";

const connectDB = async (mongoURI: string) => {
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
};

export default connectDB;
