import express from "express";
import cors from "cors";
import transactionRoutes from "./routes/transaction";
import accountRoutes from "./routes/account";
import dashboardRoutes from "./routes/dashboard";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/transactions", transactionRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check
app.get("/health", (_, res) => res.json({ status: "OK" }));

export default app;
