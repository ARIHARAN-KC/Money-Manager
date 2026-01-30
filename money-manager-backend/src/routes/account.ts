import { Router } from "express";
import {
  createAccount,
  getAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
} from "../controllers/account";
import { protect } from "../middlewares/auth";

const router = Router();

// Protect ALL account routes
router.use(protect);

// Create new account
router.post("/", createAccount);

// Get all accounts for admin
router.get("/", getAccounts);

// Get account by ID (user-only)
router.get("/:id", getAccountById);

// Update account (user-only)
router.put("/:id", updateAccount);

// Delete account (user-only)
router.delete("/:id", deleteAccount);

export default router;
