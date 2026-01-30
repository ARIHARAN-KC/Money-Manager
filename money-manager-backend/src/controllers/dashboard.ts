import { Request, Response } from "express";
import Transaction from "../models/transaction";


export const getSummary = async (req: Request, res: Response) => {
    try {
        const { type } = req.query;

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

        const result = await Transaction.aggregate([
            {
                $match: {
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

        res.json(result);
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(500).json({ error: "Unknown error occurred" });
        }
    }
};


export const categorySummary = async (_: Request, res: Response) => {
    try {
        const result = await Transaction.aggregate([
            {
                $group: {
                    _id: "$category",
                    total: { $sum: "$amount" }
                }
            }
        ]);

        res.json(result);
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(500).json({ error: "Unknown error occurred" });
        }
    }
};


export const rangeSummary = async (req: Request, res: Response) => {
    try {
        const { from, to } = req.query;

        if (!from || !to) {
            return res.status(400).json({ message: "from and to dates required" });
        }

        const result = await Transaction.find({
            createdAt: {
                $gte: new Date(from as string),
                $lte: new Date(to as string)
            }
        }).populate("account");

        res.json(result);
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(500).json({ error: "Unknown error occurred" });
        }
    }
};
