import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import Transaction from "../models/transaction";
import Account, { IAccount } from "../models/account";


interface AuthRequest<Q = any, P = any, B = any>
    extends Request<P, any, B, Q> {
    userId?: string;
}


interface SummaryQuery {
    type?: "weekly" | "monthly" | "yearly";
    page?: string;
    limit?: string;
}


interface RangeQuery {
    from?: string;
    to?: string;
    page?: string;
    limit?: string;
}


interface LeanAccount {
    _id: Types.ObjectId;
}


//get Summary endpoint logic
export const getSummary = async (req: AuthRequest<SummaryQuery>, res: Response) => {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    try {
        const { type, page, limit } = req.query;
        const now = new Date();
        let startDate: Date;

        switch (type) {
            case "weekly":
                startDate = new Date();
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

        const allTransactions = await Transaction.aggregate([
            {
                $lookup: {
                    from: "accounts",
                    localField: "account",
                    foreignField: "_id",
                    as: "account",
                },
            },
            { $unwind: "$account" },
            {
                $match: {
                    "account.user": userObjectId,
                    createdAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: "$type",
                    total: { $sum: "$amount" },
                },
            },
        ]);

        // Pagination
        const pageNumber = parseInt(page as string) || 1;
        const pageSize = parseInt(limit as string) || 10;
        const skip = (pageNumber - 1) * pageSize;

        const paginated = allTransactions.slice(skip, skip + pageSize);

        res.json({
            page: pageNumber,
            limit: pageSize,
            totalPages: Math.ceil(allTransactions.length / pageSize),
            totalItems: allTransactions.length,
            summary: paginated,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to load summary" });
    }
};


//category summary endpoint logic
export const categorySummary = async (req: AuthRequest<SummaryQuery>, res: Response) => {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    try {
        const { page, limit } = req.query;
        const userObjectId = new mongoose.Types.ObjectId(req.userId);

        const allCategories = await Transaction.aggregate([
            {
                $lookup: {
                    from: "accounts",
                    localField: "account",
                    foreignField: "_id",
                    as: "account",
                },
            },
            { $unwind: "$account" },
            {
                $match: {
                    "account.user": userObjectId,
                },
            },
            {
                $group: {
                    _id: "$category",
                    income: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "Income"] }, "$amount", 0],
                        },
                    },
                    expense: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "Expense"] }, "$amount", 0],
                        },
                    },
                },
            },
        ]);

        // Pagination
        const pageNumber = parseInt(page as string) || 1;
        const pageSize = parseInt(limit as string) || 10;
        const skip = (pageNumber - 1) * pageSize;
        const paginated = allCategories.slice(skip, skip + pageSize);

        res.json({
            page: pageNumber,
            limit: pageSize,
            totalPages: Math.ceil(allCategories.length / pageSize),
            totalItems: allCategories.length,
            summary: paginated,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to load category summary" });
    }
};


//rangeSummary endpoint logic
export const rangeSummary = async (req: AuthRequest<RangeQuery>, res: Response) => {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    try {
        const { from, to, page, limit } = req.query;

        if (!from || !to)
            return res.status(400).json({ message: "from and to dates required" });

        const fromDate = new Date(from);
        const toDate = new Date(to);

        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime()))
            return res.status(400).json({ message: "Invalid date format" });

        const pageNumber = parseInt(page as string) || 1;
        const pageSize = parseInt(limit as string) || 10;
        const skip = (pageNumber - 1) * pageSize;

        // Get user account IDs
        const userAccounts = await Account.find({ user: req.userId })
            .select("_id")
            .lean<LeanAccount[]>();
        const accountIds = userAccounts.map((a) => a._id);

        // Find transactions for these accounts in the range
        const transactions = await Transaction.find({
            account: { $in: accountIds },
            createdAt: { $gte: fromDate, $lte: toDate },
        })
            .populate("account")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize);

        const total = await Transaction.countDocuments({
            account: { $in: accountIds },
            createdAt: { $gte: fromDate, $lte: toDate },
        });

        res.json({
            page: pageNumber,
            limit: pageSize,
            totalPages: Math.ceil(total / pageSize),
            totalTransactions: total,
            transactions,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to load range summary" });
    }
};
