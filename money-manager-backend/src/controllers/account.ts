import { Response } from "express";
import Account from "../models/account";
import { AuthRequest } from "../types/account";

// Create account
export const createAccount = async (
  req: AuthRequest<{ name: string; balance?: number; isPrimary?: boolean }>,
  res: Response
) => {
  try {
    const { name, balance, isPrimary } = req.body;

    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    if (!name) return res.status(400).json({ message: "Name is required" });

    // Check if account name already exists for this user
    const existing = await Account.findOne({ name, user: req.userId });
    if (existing) return res.status(400).json({ message: "Account already exists" });

    // If user is trying to set this as primary, unset primary from other accounts
    if (isPrimary) {
      await Account.updateMany(
        { user: req.userId, isPrimary: true },
        { isPrimary: false }
      );
    }

    const account = await Account.create({
      name,
      balance: balance ?? 0,
      user: req.userId,
      isPrimary: isPrimary || false,
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

    // Get accounts sorted by primary first, then by creation date
    const accounts = await Account.find({ user: req.userId })
      .sort({
        isPrimary: -1, // Primary accounts first
        createdAt: -1
      })
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
  req: AuthRequest<Partial<{ name: string; balance: number; isPrimary?: boolean }>, {}, { id: string }>,
  res: Response
) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    // If user is trying to set this as primary, unset primary from other accounts
    if (req.body.isPrimary === true) {
      await Account.updateMany(
        { user: req.userId, isPrimary: true, _id: { $ne: req.params.id } },
        { isPrimary: false }
      );
    }

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

// Set account as primary
export const setPrimaryAccount = async (
  req: AuthRequest<{}, {}, { id: string }>,
  res: Response
) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    // Start a session for transaction
    const session = await Account.startSession();
    session.startTransaction();

    try {
      // First, unset primary from all other accounts
      await Account.updateMany(
        { user: req.userId, isPrimary: true, _id: { $ne: req.params.id } },
        { isPrimary: false },
        { session }
      );

      // Then set the selected account as primary
      const account = await Account.findOneAndUpdate(
        { _id: req.params.id, user: req.userId },
        { isPrimary: true },
        { new: true, session }
      );

      if (!account) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "Account not found" });
      }

      await session.commitTransaction();
      session.endSession();

      return res.json(account);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (err: any) {
    console.error("Set Primary Account Error:", err);
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

    const account = await Account.findOne({ _id: req.params.id, user: req.userId });

    if (!account) return res.status(404).json({ message: "Account not found" });

    // Prevent deleting primary account
    if (account.isPrimary) {
      return res.status(400).json({
        message: "Cannot delete primary account. Please set another account as primary first."
      });
    }

    await account.deleteOne();
    return res.json({ message: "Account deleted" });
  } catch (err: any) {
    console.error("Delete Account Error:", err);
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};