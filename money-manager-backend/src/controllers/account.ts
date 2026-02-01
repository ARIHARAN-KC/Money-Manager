import { Response } from "express";
import Account from "../models/account";
import { AuthRequest } from "../types/account";

// Create account
export const createAccount = async (
  req: AuthRequest<{ name: string; balance?: number }>,
  res: Response
) => {
  try {
    const { name, balance } = req.body;

    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    if (!name) return res.status(400).json({ message: "Name is required" });

    const existing = await Account.findOne({ name, user: req.userId });
    if (existing) return res.status(400).json({ message: "Account already exists" });

    const account = await Account.create({
      name,
      balance: balance ?? 0,
      user: req.userId,
    });

    return res.status(201).json(account);
  } catch (err: any) {
    console.error("Create Account Error:", err);
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

// Get accounts (paginated)
export const getAccounts = async (
  req: AuthRequest<{}, { page?: string; limit?: string }>,
  res: Response
) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit || "10", 10), 1);
    const skip = (page - 1) * limit;

    const totalItems = await Account.countDocuments({ user: req.userId });
    const accounts = await Account.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      data: accounts,
    });
  } catch (err: any) {
    console.error("Get Accounts Error:", err);
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

// Get account by ID
export const getAccountById = async (
  req: AuthRequest<{}, {}, { id: string }>,
  res: Response
) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const account = await Account.findOne({ _id: req.params.id, user: req.userId });
    if (!account) return res.status(404).json({ message: "Account not found" });

    return res.json(account);
  } catch (err: any) {
    console.error("Get Account By ID Error:", err);
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

// Update account
export const updateAccount = async (
  req: AuthRequest<Partial<{ name: string; balance: number }>, {}, { id: string }>,
  res: Response
) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!account) return res.status(404).json({ message: "Account not found" });

    return res.json(account);
  } catch (err: any) {
    console.error("Update Account Error:", err);
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

// Delete account
export const deleteAccount = async (
  req: AuthRequest<{}, {}, { id: string }>,
  res: Response
) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const account = await Account.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!account) return res.status(404).json({ message: "Account not found" });

    return res.json({ message: "Account deleted" });
  } catch (err: any) {
    console.error("Delete Account Error:", err);
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};
