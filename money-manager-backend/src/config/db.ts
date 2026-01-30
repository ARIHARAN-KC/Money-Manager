import mongoose from "mongoose";

const connectDB = async (mongoURI: string) => {
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed");
    console.error(err);
    process.exit(1);
  }
};

export default connectDB;
