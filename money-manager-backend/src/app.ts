import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth";
import accountRoutes from "./routes/account";
import transactionRoutes from "./routes/transaction";
import dashboardRoutes from "./routes/dashboard";

const app = express();

// --- Global Middleware --- //

// Enable CORS
app.use(cors({ origin: "*" }));

// Parse JSON bodies
app.use(express.json());

// Security headers
app.use(helmet());

// Rate limiting
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 min
        max: 100, // limit each IP
        standardHeaders: true,
        legacyHeaders: false,
    })
);

// --- Routes ---
app.use("/api/auth", authRoutes);

// Protected routes
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check
app.get("/health", (_req, res) => {
    res.json({ status: "OK" });
});

// 404 Handler
app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

export default app;
