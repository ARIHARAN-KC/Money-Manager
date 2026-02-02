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

    // Get user's account IDs
    const userAccounts = await Account.find({ user: req.userId }).select("_id").lean();
    const accountIds = userAccounts.map(a => a._id);

    // Aggregate transactions with proper account filtering
    const allTransactions: any[] = await Transaction.aggregate([
      {
        $match: {
          account: { $in: accountIds },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" }
        }
      }
    ]);

    // Ensure we always have Income and Expense entries
    const incomeEntry = allTransactions.find(t => t._id === "Income") || { _id: "Income", total: 0 };
    const expenseEntry = allTransactions.find(t => t._id === "Expense") || { _id: "Expense", total: 0 };

    const summary = [incomeEntry, expenseEntry];

    const pageNumber = Math.max(parseInt(page || "1", 10), 1);
    const pageSize = Math.max(parseInt(limit || "10", 10), 1);

    return res.json({
      page: pageNumber,
      limit: pageSize,
      totalPages: 1,
      totalItems: summary.length,
      summary: summary,
    });
  } catch (err: any) {
    console.error("Get Summary Error:", err);
    return res.status(500).json({ message: err.message || "Failed to load summary" });
  }
};

// Get category summary - FIXED
export const categorySummary = async (req: AuthRequest<{}, SummaryQuery>, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const { page, limit } = req.query;
    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    // Get user's accounts first
    const userAccounts = await Account.find({ user: req.userId }).select("_id").lean();
    const accountIds = userAccounts.map(a => a._id);

    const allCategories: any[] = await Transaction.aggregate([
      {
        $match: {
          account: { $in: accountIds }
        }
      },
      {
        $group: {
          _id: "$category",
          income: {
            $sum: {
              $cond: [
                { $eq: ["$type", "Income"] },
                "$amount",
                0
              ]
            }
          },
          expense: {
            $sum: {
              $cond: [
                { $eq: ["$type", "Expense"] },
                "$amount",
                0
              ]
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 1,
          income: 1,
          expense: 1,
          net: { $subtract: ["$income", "$expense"] }
        }
      },
      { $sort: { net: -1 } }
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

// Get transactions within a range - FIXED
export const rangeSummary = async (req: AuthRequest<{}, RangeQuery>, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const { from, to, page, limit } = req.query;
    if (!from || !to) return res.status(400).json({ message: "from and to dates required" });

    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999); // Include entire end date

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime()))
      return res.status(400).json({ message: "Invalid date format" });

    const pageNumber = Math.max(parseInt(page || "1", 10), 1);
    const pageSize = Math.max(parseInt(limit || "10", 10), 1);
    const skip = (pageNumber - 1) * pageSize;

    const userAccounts = await Account.find({ user: req.userId }).select("_id").lean();
    const accountIds = userAccounts.map(a => a._id);

    const [transactions, total] = await Promise.all([
      Transaction.find({
        account: { $in: accountIds },
        createdAt: { $gte: fromDate, $lte: toDate }
      })
        .populate("account", "name balance")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Transaction.countDocuments({
        account: { $in: accountIds },
        createdAt: { $gte: fromDate, $lte: toDate }
      }),
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