import { Request, Response } from "express";
import Transaction, { ITransaction } from "../models/transaction";
import Account from "../models/account";
import { canEditTransaction } from "../utils/time";

// Create a new transaction
export const createTransaction = async (req: Request, res: Response) => {
  try {
    const {
      type,
      amount,
      description,
      category,
      division,
      account
    } = req.body;

    const acc = await Account.findById(account);

    if (!acc) return res.status(404).json({ error: "Account not found" });

    // Update account balance
    if (type === "Income") acc.balance += amount;
    else acc.balance -= amount;
    await acc.save();

    const transaction = await Transaction.create({
      type,
      amount,
      description,
      category,
      division,
      account
    });
    res.status(201).json(transaction);
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
    else res.status(500).json({ error: "Unknown error occurred" });
  }
};

// Get all transactions
export const getTransactions = async (_req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find().populate("account");
    res.json(transactions);
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
    else res.status(500).json({ error: "Unknown error occurred" });
  }
};

// Get single transaction
export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate("account");
    if (!transaction) return res.status(404).json({ error: "Transaction not found" });
    res.json(transaction);
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
    else res.status(500).json({ error: "Unknown error occurred" });
  }
};

// Update transaction (within 12 hours only)
export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ error: "Transaction not found" });

    if (!canEditTransaction(transaction.createdAt))
      return res.status(403).json({ error: "Cannot edit after 12 hours" });

    const { type, amount, description, category, division, account } = req.body;

    // Adjust old account balance
    const oldAccount = await Account.findById(transaction.account);
    if (!oldAccount) return res.status(404).json({ error: "Original account not found" });
    if (transaction.type === "Income") oldAccount.balance -= transaction.amount;
    else oldAccount.balance += transaction.amount;
    await oldAccount.save();

    // Update transaction
    transaction.type = type || transaction.type;
    transaction.amount = amount !== undefined ? amount : transaction.amount;
    transaction.description = description ?? transaction.description;
    transaction.category = category ?? transaction.category;
    transaction.division = division ?? transaction.division;
    transaction.account = account || transaction.account;

    // Adjust new account balance
    const newAccount = await Account.findById(transaction.account);
    if (!newAccount) return res.status(404).json({ error: "New account not found" });
    if (transaction.type === "Income") newAccount.balance += transaction.amount;
    else newAccount.balance -= transaction.amount;
    await newAccount.save();

    await transaction.save();
    res.json(transaction);
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
    else res.status(500).json({ error: "Unknown error occurred" });
  }
};

// Delete transaction
export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) return res.status(404).json({ error: "Transaction not found" });

    // Adjust account balance
    const acc = await Account.findById(transaction.account);
    if (acc) {
      if (transaction.type === "Income") acc.balance -= transaction.amount;
      else acc.balance += transaction.amount;
      await acc.save();
    }

    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
    else res.status(500).json({ error: "Unknown error occurred" });
  }
};
