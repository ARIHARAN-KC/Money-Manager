import { Router } from "express";
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  transferTransaction,
} from "../controllers/transaction";
import { protect } from "../middlewares/auth";

const router = Router();

// Create new transaction
router.post("/", protect, createTransaction);

// Get user's transactions
router.get("/", protect, getTransactions);

// Get transaction by ID
router.get("/:id", protect, getTransactionById);

// Update transaction
router.put("/:id", protect, updateTransaction);

// Delete transaction
router.delete("/:id", protect, deleteTransaction);

// Account to account transfer
router.post("/transfer", protect, transferTransaction);

export default router;
