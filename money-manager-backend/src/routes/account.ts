import express from "express";
import {
  createAccount,
  getAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
} from "../controllers/account";

const router = express.Router();

router.post("/", createAccount);           // Create new account

router.get("/", getAccounts);              // Get all accounts

router.get("/:id", getAccountById);        // Get account by ID

router.put("/:id", updateAccount);         // Update account

router.delete("/:id", deleteAccount);      // Delete account

export default router;
