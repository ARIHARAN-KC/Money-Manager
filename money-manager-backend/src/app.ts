import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import passport from "./config/passport";

import authRoutes from "./routes/auth";
import accountRoutes from "./routes/account";
import transactionRoutes from "./routes/transaction";
import dashboardRoutes from "./routes/dashboard";
import budgetRoutes from "./routes/budget";
import reportRoutes from "./routes/report";

const app = express();

// --- Global Middleware --- //

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Security headers
app.use(helmet());

//Google oAuth
app.use(passport.initialize());

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

app.use("/api/budget", budgetRoutes);
app.use("/api/reports", reportRoutes);

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
