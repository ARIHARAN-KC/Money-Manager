import { Response } from "express";
import Transaction, { ITransaction as TransactionType } from "../models/transaction";
import Account, { IAccount } from "../models/account";
import { canEditTransaction } from "../utils/time";
import { AuthRequest } from "../types/account";
import { ITransaction } from "../types/transaction";

// Create a transaction
export const createTransaction = async (
  req: AuthRequest<ITransaction>,
  res: Response
) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const { account: accountId, amount, type, category, description, tags, division } = req.body;
    if (!accountId || !amount || !type || !category || !division) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const account = await Account.findOne({ _id: accountId, user: req.userId });
    if (!account) return res.status(404).json({ message: "Account not found" });

    const transaction = await Transaction.create({
      account: account._id,
      amount,
      type,
      category,
      division,
      description: description || "",
      tags: tags || [],
      user: req.userId,
    });

    return res.status(201).json(transaction);
  } catch (err: any) {
    console.error("Create Transaction Error:", err);
    return res.status(500).json({ message: err.message || "Failed to create transaction" });
  }
};

// Get transactions with pagination
export const getTransactions = async (
  req: AuthRequest<{}, { page?: string; limit?: string }, {}>,
  res: Response
) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit || "10", 10), 1);
    const skip = (page - 1) * limit;

    const userAccounts = await Account.find({ user: req.userId }).select("_id");
    const accountIds = userAccounts.map(a => a._id);

    const [transactions, total] = await Promise.all([
      Transaction.find({ account: { $in: accountIds } })
        .populate<{ account: IAccount }>("account")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments({ account: { $in: accountIds } }),
    ]);

    return res.json({
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      data: transactions,
    });
  } catch (err: any) {
    console.error("Get Transactions Error:", err);
    return res.status(500).json({ message: err.message || "Failed to fetch transactions" });
  }
};

// Get a single transaction by ID
export const getTransactionById = async (
  req: AuthRequest<{}, {}, { id: string }>,
  res: Response
) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const transaction = await Transaction.findOne({ _id: req.params.id })
      .populate<{ account: IAccount }>("account");

    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    // Cast account to any to access user property
    const account = transaction.account as any;
    if (account.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.json(transaction);
  } catch (err: any) {
    console.error("Get Transaction Error:", err);
    return res.status(500).json({ message: err.message || "Failed to fetch transaction" });
  }
};

// Update transaction
export const updateTransaction = async (
  req: AuthRequest<Partial<ITransaction>, {}, { id: string }>,
  res: Response
) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const transaction = await Transaction.findById(req.params.id)
      .populate<{ account: IAccount }>("account");
    
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    // Cast account to any to access user property
    const account = transaction.account as any;
    if (account.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!canEditTransaction(transaction.createdAt)) {
      return res.status(400).json({ message: "Transaction cannot be edited after 24 hours" });
    }

    Object.assign(transaction, req.body);
    await transaction.save();

    return res.json(transaction);
  } catch (err: any) {
    console.error("Update Transaction Error:", err);
    return res.status(500).json({ message: err.message || "Failed to update transaction" });
  }
};

// Delete transaction
export const deleteTransaction = async (
  req: AuthRequest<{}, {}, { id: string }>,
  res: Response
) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const transaction = await Transaction.findById(req.params.id)
      .populate<{ account: IAccount }>("account");
    
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    // Cast account to any to access user property
    const account = transaction.account as any;
    if (account.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await transaction.deleteOne();
    return res.json({ message: "Transaction deleted successfully" });
  } catch (err: any) {
    console.error("Delete Transaction Error:", err);
    return res.status(500).json({ message: err.message || "Failed to delete transaction" });
  }
};

// Transfer between accounts
export const transferTransaction = async (
  req: AuthRequest<{ fromAccountId: string; toAccountId: string; amount: number; description?: string }>,
  res: Response
) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const { fromAccountId, toAccountId, amount, description } = req.body;
    
    if (!fromAccountId || !toAccountId || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (fromAccountId === toAccountId) {
      return res.status(400).json({ message: "Cannot transfer to the same account" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const [fromAccount, toAccount] = await Promise.all([
      Account.findOne({ _id: fromAccountId, user: req.userId }),
      Account.findOne({ _id: toAccountId, user: req.userId })
    ]);

    if (!fromAccount || !toAccount) {
      return res.status(404).json({ message: "One or both accounts not found" });
    }

    if (fromAccount.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Start a session for transaction
    const session = await Transaction.startSession();
    session.startTransaction();

    try {
      // Update balances
      fromAccount.balance -= amount;
      toAccount.balance += amount;

      // Create expense transaction for from account
      const expenseTransaction = new Transaction({
        account: fromAccountId,
        amount,
        type: "Expense" as const,
        category: "Transfer",
        division: "Personal" as const,
        description: description || `Transfer to ${toAccount.name}`,
        user: req.userId,
      });

      // Create income transaction for to account
      const incomeTransaction = new Transaction({
        account: toAccountId,
        amount,
        type: "Income" as const,
        category: "Transfer",
        division: "Personal" as const,
        description: description || `Transfer from ${fromAccount.name}`,
        user: req.userId,
      });

      await Promise.all([
        fromAccount.save({ session }),
        toAccount.save({ session }),
        expenseTransaction.save({ session }),
        incomeTransaction.save({ session })
      ]);

      await session.commitTransaction();
      
      return res.status(201).json({
        message: "Transfer successful",
        fromAccount: { id: fromAccount._id, balance: fromAccount.balance },
        toAccount: { id: toAccount._id, balance: toAccount.balance }
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (err: any) {
    console.error("Transfer Transaction Error:", err);
    return res.status(500).json({ message: err.message || "Failed to process transfer" });
  }
};