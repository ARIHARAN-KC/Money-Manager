import mongoose from "mongoose";

const connectDB = async (mongoURI: string): Promise<void> => {
  try {
    if (!mongoURI) {
      throw new Error("MongoDB URI is missing");
    }

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    process.exit(1);
  }
};

export default connectDB;
