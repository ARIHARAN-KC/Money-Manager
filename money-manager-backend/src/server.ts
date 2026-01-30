import app from "./app";
import connectDB from "./config/db";
import { PORT, MONGO_URI } from "./config/env";

const startServer = async () => {
  try {
    if (!MONGO_URI) throw new Error("MONGO_URI is required");

    await connectDB(MONGO_URI);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
