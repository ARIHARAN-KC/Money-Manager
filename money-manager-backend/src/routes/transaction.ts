import express from "express";
import { createTransaction, getTransactions } from "../controllers/transaction";

const router = express.Router();

router.post("/", createTransaction);
router.get("/", getTransactions);

export default router;
