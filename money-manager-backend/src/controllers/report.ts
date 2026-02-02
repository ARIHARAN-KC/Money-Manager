import { Response } from "express";
import Transaction from "../models/transaction";
import Account from "../models/account";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";
import { AuthRequest } from "../types/account";
import {
  AuthRequestBody,
  AuthRequestQuery,
  AccountPopulated,
  TransactionPopulated,
  FilterOptions,
  ExportOptions,
  ReportSummary
} from "../types/report";

// Export report (CSV or PDF)
export const exportReport = async (
  req: AuthRequest<AuthRequestBody>,
  res: Response
) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { filters, options }: { filters: FilterOptions; options: ExportOptions } = req.body;
    const { format, include } = options;

    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);
    endDate.setHours(23, 59, 59, 999); // Include entire end day

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Get user's accounts
    const accounts = await Account.find({ user: req.userId }).select("_id").lean();
    if (!accounts.length) {
      return res.status(404).json({ message: "No accounts found" });
    }

    const accountIds = accounts.map(a => a._id);

    // Build query
    const query: any = {
      account: { $in: accountIds },
      createdAt: { $gte: startDate, $lte: endDate },
    };

    if (filters.type && filters.type !== "all") query.type = filters.type;
    if (filters.division && filters.division !== "all") query.division = filters.division;
    if (filters.category) query.category = filters.category;

    if (filters.minAmount || filters.maxAmount) {
      query.amount = {};
      if (filters.minAmount !== undefined) query.amount.$gte = filters.minAmount;
      if (filters.maxAmount !== undefined) query.amount.$lte = filters.maxAmount;
    }

    const transactions = await Transaction.find(query)
      .populate<{ account: AccountPopulated }>("account", "name balance")
      .sort({ createdAt: -1 })
      .lean<TransactionPopulated[]>();

    const summary: ReportSummary = {
      totalIncome: transactions
        .filter(t => t.type === "Income")
        .reduce((sum, t) => sum + t.amount, 0),
      totalExpense: transactions
        .filter(t => t.type === "Expense")
        .reduce((sum, t) => sum + t.amount, 0),
      transactionCount: transactions.length,
      period: { start: filters.startDate, end: filters.endDate },
    };

    // CSV EXPORT
    if (format === "csv") {
      const fields = [
        "Date",
        "Type",
        "Category",
        "Division",
        "Description",
        "Amount",
        "Account",
      ];

      const data = transactions.map(t => ({
        Date: t.createdAt.toISOString().split("T")[0],
        Type: t.type,
        Category: t.category,
        Division: t.division,
        Description: t.description || "",
        Amount: t.amount,
        Account: t.account?.name || "Unknown Account",
      }));

      const parser = new Parser({ fields });
      const csv = parser.parse(data);

      res.header("Content-Type", "text/csv");
      res.attachment(`financial-report-${new Date().toISOString().split("T")[0]}.csv`);
      return res.send(csv);
    }

    //PDF
    if (format === "pdf") {
      const doc = new PDFDocument({ margin: 40 });
      const filename = `financial-report-${new Date().toISOString().split("T")[0]}.pdf`;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      doc.pipe(res);

      doc.fontSize(20).text("Financial Report", { align: "center" });
      doc.moveDown();

      doc.fontSize(12).text(`Period: ${filters.startDate} to ${filters.endDate}`);
      doc.text(`Total Transactions: ${summary.transactionCount}`);
      doc.text(`Total Income: ₹${summary.totalIncome.toLocaleString()}`);
      doc.text(`Total Expense: ₹${summary.totalExpense.toLocaleString()}`);
      doc.text(
        `Net Balance: ₹${(summary.totalIncome - summary.totalExpense).toLocaleString()}`
      );

      doc.moveDown();

      if (include.includes("transactions")) {
        doc.fontSize(14).text("Transaction Details", { underline: true });
        doc.moveDown();

        transactions.forEach((t, idx) => {
          const date = t.createdAt.toISOString().split("T")[0];
          doc.fontSize(10).text(
            `${idx + 1}. ${date} | ${t.type} | ${t.category} | ₹${t.amount.toLocaleString()}`
          );
        });
      }

      doc.end();
      return;
    }

    return res.status(400).json({ message: "Unsupported export format" });

  } catch (err: any) {
    console.error("Export Report Error:", err);
    return res.status(500).json({
      message: err.message || "Failed to export report",
    });
  }
};

export const generateReport = async (
  req: AuthRequest<AuthRequestQuery>,
  res: Response
) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { startDate, endDate, type, division, category } = req.query;

    const accounts = await Account.find({ user: req.userId }).select("_id").lean();
    if (!accounts.length) {
      return res.status(404).json({ message: "No accounts found" });
    }

    const accountIds = accounts.map(a => a._id);

    const query: any = {
      account: { $in: accountIds },
    };

    if (startDate && endDate) {
      const from = new Date(startDate);
      const to = new Date(endDate);
      to.setHours(23, 59, 59, 999);
      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      query.createdAt = { $gte: from, $lte: to };
    }

    if (type && type !== "all") query.type = type;
    if (division && division !== "all") query.division = division;
    if (category) query.category = category;

    const transactions = await Transaction.find(query)
      .populate<{ account: AccountPopulated }>("account", "name balance")
      .sort({ createdAt: -1 })
      .lean<TransactionPopulated[]>();

    const summary: ReportSummary = {
      totalIncome: transactions
        .filter(t => t.type === "Income")
        .reduce((sum, t) => sum + t.amount, 0),
      totalExpense: transactions
        .filter(t => t.type === "Expense")
        .reduce((sum, t) => sum + t.amount, 0),
      transactionCount: transactions.length,
      period: { 
        start: startDate || new Date().toISOString().split('T')[0], 
        end: endDate || new Date().toISOString().split('T')[0] 
      },
    };

    return res.json({ transactions, summary });

  } catch (err: any) {
    console.error("Generate Report Error:", err);
    return res.status(500).json({
      message: err.message || "Failed to generate report",
    });
  }
};