import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import passport from "./config/passport";

import connectDB from "./config/db";
import { MONGO_URI } from "./config/env";

import authRoutes from "./routes/auth";
import accountRoutes from "./routes/account";
import transactionRoutes from "./routes/transaction";
import dashboardRoutes from "./routes/dashboard";
import budgetRoutes from "./routes/budget";
import reportRoutes from "./routes/report";

const app = express();

app.use(async (_req, _res, next) => {
  try {
    await connectDB(MONGO_URI);
    next();
  } catch (err) {
    next(err);
  }
});

/* Middleware */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(helmet());
app.use(passport.initialize());

/* Rate limit */
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/* Routes */
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/reports", reportRoutes);

/* Health */
app.get("/health", (_req, res) => {
  res.json({ status: "OK" });
});

/* 404 */
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* Error handler */
app.use((err: any, _req: express.Request, res: express.Response) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Internal server error" });
});

export default app;
