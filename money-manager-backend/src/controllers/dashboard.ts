import mongoose from "mongoose";
import { Response } from "express";
import Transaction from "../models/transaction";
import Account from "../models/account";
import { AuthRequest } from "../types/account";

export interface SummaryQuery {
  type?: string;
  page?: string;
  limit?: string;
}

export interface RangeQuery {
  from?: string;
  to?: string;
  page?: string;
  limit?: string;
}

// Get summary (Income/Expense totals by type)
export const getSummary = async (req: AuthRequest<{}, SummaryQuery>, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const { type, page, limit } = req.query;
    const now = new Date();
    let startDate: Date;

    switch (type) {
      case "weekly":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return res.status(400).json({ message: "Invalid type" });
    }

    const userObjectId = new mongoose.Types.ObjectId(req.userId);
    const allTransactions: any[] = await Transaction.aggregate([
      {
        $lookup: {
          from: "accounts",
          localField: "account",
          foreignField: "_id",
          as: "account",
        },
      },
      { $unwind: "$account" },
      { $match: { "account.user": userObjectId, createdAt: { $gte: startDate } } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]);

    const pageNumber = Math.max(parseInt(page || "1", 10), 1);
    const pageSize = Math.max(parseInt(limit || "10", 10), 1);
    const skip = (pageNumber - 1) * pageSize;

    return res.json({
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(allTransactions.length / pageSize),
      totalItems: allTransactions.length,
      summary: allTransactions.slice(skip, skip + pageSize),
    });
  } catch (err: any) {
    console.error("Get Summary Error:", err);
    return res.status(500).json({ message: err.message || "Failed to load summary" });
  }
};

// Get category summary
export const categorySummary = async (req: AuthRequest<{}, SummaryQuery>, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const { page, limit } = req.query;
    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    const allCategories: any[] = await Transaction.aggregate([
      { $lookup: { from: "accounts", localField: "account", foreignField: "_id", as: "account" } },
      { $unwind: "$account" },
      { $match: { "account.user": userObjectId } },
      {
        $group: {
          _id: "$category",
          income: { $sum: { $cond: [{ $eq: ["$type", "Income"] }, "$amount", 0] } },
          expense: { $sum: { $cond: [{ $eq: ["$type", "Expense"] }, "$amount", 0] } },
        },
      },
    ]);

    const pageNumber = Math.max(parseInt(page || "1", 10), 1);
    const pageSize = Math.max(parseInt(limit || "10", 10), 1);
    const skip = (pageNumber - 1) * pageSize;

    return res.json({
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(allCategories.length / pageSize),
      totalItems: allCategories.length,
      summary: allCategories.slice(skip, skip + pageSize),
    });
  } catch (err: any) {
    console.error("Category Summary Error:", err);
    return res.status(500).json({ message: err.message || "Failed to load category summary" });
  }
};

// Get transactions within a range
export const rangeSummary = async (req: AuthRequest<{}, RangeQuery>, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const { from, to, page, limit } = req.query;
    if (!from || !to) return res.status(400).json({ message: "from and to dates required" });

    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime()))
      return res.status(400).json({ message: "Invalid date format" });

    const pageNumber = Math.max(parseInt(page || "1", 10), 1);
    const pageSize = Math.max(parseInt(limit || "10", 10), 1);
    const skip = (pageNumber - 1) * pageSize;

    const userAccounts = await Account.find({ user: req.userId }).select("_id").lean();
    const accountIds = userAccounts.map(a => a._id);

    const [transactions, total] = await Promise.all([
      Transaction.find({ account: { $in: accountIds }, createdAt: { $gte: fromDate, $lte: toDate } })
        .populate("account")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      Transaction.countDocuments({ account: { $in: accountIds }, createdAt: { $gte: fromDate, $lte: toDate } }),
    ]);

    return res.json({
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
      totalTransactions: total,
      transactions,
    });
  } catch (err: any) {
    console.error("Range Summary Error:", err);
    return res.status(500).json({ message: err.message || "Failed to load range summary" });
  }
};