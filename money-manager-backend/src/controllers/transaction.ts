import { Request, Response } from "express";
import Transaction from "../models/transaction";
import Account from "../models/account";
import { checkEditTime } from "../utils/time";

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { type, amount, description, category, division, account } = req.body;

    // Optional: Update account balance
    const acc = await Account.findById(account);
    if (!acc) return res.status(404).json({ error: "Account not found" });

    if (type === "Income") acc.balance += amount;
    else acc.balance -= amount;
    await acc.save();

    const transaction = await Transaction.create({ type, amount, description, category, division, account });
    res.status(201).json(transaction);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Unknown error occurred" });
    }
  }
};

export const getTransactions = async (_req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find().populate("account");
    res.json(transactions);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Unknown error occurred" });
    }
  }
};
