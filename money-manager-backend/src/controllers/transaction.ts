import { Request, Response } from "express";
import Transaction from "../models/transaction";
import Account from "../models/account";
import { canEditTransaction } from "../utils/time";


interface AuthRequest extends Request {
  userId?: string;
}


// Create transaction endpoint logic
export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { type, amount, description, category, division, account } = req.body;

    if (!type || !amount || !category || !division || !account) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be positive" });
    }

    const acc = await Account.findOne({
      _id: account,
      user: req.userId,
    });

    if (!acc) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Update account balance
    acc.balance += type === "Income" ? amount : -amount;
    await acc.save();

    const transaction = await Transaction.create({
      type,
      amount,
      description,
      category,
      division,
      account: acc._id,
    });

    res.status(201).json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create transaction" });
  }
};


// Get user's transactions endpoint logic
export const getTransactions = async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get user's account IDs
    const userAccounts = await Account.find({ user: req.userId }).select("_id").lean();
    const accountIds = userAccounts.map((a) => a._id);

    const totalItems = await Transaction.countDocuments({ account: { $in: accountIds } });
    const transactions = await Transaction.find({ account: { $in: accountIds } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("account");

    res.json({
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      data: transactions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
};


// Get transaction by ID endpoint logic
export const getTransactionById = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const transaction = await Transaction.findById(req.params.id).populate({
    path: "account",
    match: { user: req.userId },
  });

  if (!transaction || !transaction.account) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  res.json(transaction);
};


// Update transaction endpoint logic
export const updateTransaction = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const transaction = await Transaction.findById(req.params.id);
  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  if (!transaction.createdAt) {
    return res.status(400).json({ message: "Transaction timestamp missing" });
  }

  if (!canEditTransaction(transaction.createdAt)) {
    return res.status(403).json({ message: "Edit window expired" });
  }

  const oldAccount = await Account.findOne({
    _id: transaction.account,
    user: req.userId,
  });

  if (!oldAccount) {
    return res.status(403).json({ message: "Access denied" });
  }

  // Revert old balance
  oldAccount.balance +=
    transaction.type === "Income"
      ? -transaction.amount
      : transaction.amount;

  await oldAccount.save();

  // Apply updates
  transaction.type = req.body.type ?? transaction.type;
  transaction.amount = req.body.amount ?? transaction.amount;
  transaction.description = req.body.description ?? transaction.description;
  transaction.category = req.body.category ?? transaction.category;
  transaction.division = req.body.division ?? transaction.division;
  transaction.account = req.body.account ?? transaction.account;

  const newAccount = await Account.findOne({
    _id: transaction.account,
    user: req.userId,
  });

  if (!newAccount) {
    return res.status(404).json({ message: "New account not found" });
  }

  // Apply new balance
  newAccount.balance +=
    transaction.type === "Income"
      ? transaction.amount
      : -transaction.amount;

  await newAccount.save();
  await transaction.save();

  res.json(transaction);
};


// delete transaction endpoint logic
export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const transaction = await Transaction.findById(req.params.id);
  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  const acc = await Account.findOne({
    _id: transaction.account,
    user: req.userId,
  });

  if (!acc) {
    return res.status(403).json({ message: "Access denied" });
  }

  // Revert balance
  acc.balance +=
    transaction.type === "Income"
      ? -transaction.amount
      : transaction.amount;

  await acc.save();
  await transaction.deleteOne();

  res.json({ message: "Transaction deleted successfully" });
};


// account to account transfer endpoint logic
export const transferTransaction = async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { fromAccountId, toAccountId, amount, description } = req.body;

    if (!fromAccountId || !toAccountId || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be positive" });
    }

    if (fromAccountId === toAccountId) {
      return res.status(400).json({ message: "Cannot transfer to the same account" });
    }

    // Fetch accounts
    const fromAccount = await Account.findOne({ _id: fromAccountId, user: req.userId });
    const toAccount = await Account.findOne({ _id: toAccountId, user: req.userId });

    if (!fromAccount || !toAccount) {
      return res.status(404).json({ message: "One or both accounts not found" });
    }

    if (fromAccount.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance in source account" });
    }

    // Update balances
    fromAccount.balance -= amount;
    toAccount.balance += amount;

    await fromAccount.save();
    await toAccount.save();

    // Save transaction records
    const debitTransaction = await Transaction.create({
      type: "Expense",
      amount,
      description: description ?? `Transfer to ${toAccount.name}`,
      category: "Transfer",
      division: "Personal",
      account: fromAccount._id,
    });

    const creditTransaction = await Transaction.create({
      type: "Income",
      amount,
      description: description ?? `Transfer from ${fromAccount.name}`,
      category: "Transfer",
      division: "Personal",
      account: toAccount._id,
    });

    res.status(201).json({
      message: "Transfer successful",
      debitTransaction,
      creditTransaction,
    });
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ message: err.message });
    else res.status(500).json({ message: "Unknown error" });
  }
};