  import { Response } from "express";
  import Budget from "../models/budget";
  import Transaction from "../models/transaction";
  import Account from "../models/account";
  import { getPeriodStartDate } from "../utils/startDate";
  import { AuthRequest } from "../types/account";
  import { IBudget, IBudgetWithSpent } from "../types/budget";

  // Create a new budget
  export const createBudget = async (
    req: AuthRequest<IBudget>,
    res: Response
  ) => {
    try {
      if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

      const { category, division, allocated, period } = req.body;
      if (!category || !division || !allocated || !period) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const existing = await Budget.findOne({ category, division, user: req.userId, period });
      if (existing) return res.status(400).json({ message: "Budget already exists for this category and period" });

      const budget = await Budget.create({ category, division, allocated, period, user: req.userId });
      return res.status(201).json({ ...budget.toObject(), _id: budget._id.toString(), user: budget.user.toString() });
    } catch (err: any) {
      console.error("Create Budget Error:", err);
      return res.status(500).json({ message: err.message || "Failed to create budget" });
    }
  };

  // Get budgets with spent amounts - FIXED
  export const getBudgets = async (
    req: AuthRequest<{}, {}, {}>,
    res: Response
  ) => {
    try {
      if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

      const budgets = await Budget.find({ user: req.userId });
      const accounts = await Account.find({ user: req.userId }).select("_id");
      const accountIds = accounts.map(a => a._id);

      const budgetsWithSpent: IBudgetWithSpent[] = await Promise.all(
        budgets.map(async (budget) => {
          const periodStartDate = getPeriodStartDate(budget.period);

          const spentResult = await Transaction.aggregate([
            {
              $match: {
                account: { $in: accountIds },
                category: budget.category,
                division: budget.division,
                type: "Expense",
                createdAt: { $gte: periodStartDate },
              },
            },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ]);

          const spent = spentResult.length > 0 ? spentResult[0].total : 0;
          const b = budget.toObject();
          return {
            ...b,
            _id: b._id.toString(),
            user: b.user.toString(),
            spent,
            remaining: budget.allocated - spent
          };
        })
      );

      return res.json(budgetsWithSpent);
    } catch (err: any) {
      console.error("Get Budgets Error:", err);
      return res.status(500).json({ message: err.message || "Failed to fetch budgets" });
    }
  };

  // Update budget
  export const updateBudget = async (
    req: AuthRequest<Partial<IBudget>, {}, { id: string }>,
    res: Response
  ) => {
    try {
      if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

      const budget = await Budget.findOneAndUpdate(
        { _id: req.params.id, user: req.userId },
        req.body,
        { new: true, runValidators: true }
      );

      if (!budget) return res.status(404).json({ message: "Budget not found" });
      return res.json({ ...budget.toObject(), _id: budget._id.toString(), user: budget.user.toString() });
    } catch (err: any) {
      console.error("Update Budget Error:", err);
      return res.status(500).json({ message: err.message || "Failed to update budget" });
    }
  };

  // Delete budget
  export const deleteBudget = async (
    req: AuthRequest<{}, {}, { id: string }>,
    res: Response
  ) => {
    try {
      if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

      const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.userId });
      if (!budget) return res.status(404).json({ message: "Budget not found" });

      return res.json({ message: "Budget deleted successfully" });
    } catch (err: any) {
      console.error("Delete Budget Error:", err);
      return res.status(500).json({ message: err.message || "Failed to delete budget" });
    }
  };