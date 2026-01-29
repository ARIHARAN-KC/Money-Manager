import app from "./app";
import connectDB from "./config/db";
import { PORT, MONGO_URI } from "./config/env";

const startServer = async () => {
  await connectDB(MONGO_URI!);
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
