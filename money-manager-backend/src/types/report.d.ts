import { Types } from "mongoose";

export interface AuthRequestQuery {
  startDate?: string;
  endDate?: string;
  type?: "all" | "Income" | "Expense";
  division?: "all" | "Personal" | "Office";
  category?: string;
}

export interface AuthRequestBody {
  filters: FilterOptions;
  options: ExportOptions;
}

export interface FilterOptions {
  startDate: string;
  endDate: string;
  type: "all" | "Income" | "Expense";
  division: "all" | "Personal" | "Office";
  category?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface ExportOptions {
  format: "csv" | "pdf";
  include: ("transactions" | "summary" | "charts")[];
}

export interface AccountPopulated {
  _id: Types.ObjectId;
  name: string;
  balance: number;
}

export interface TransactionPopulated {
  _id: Types.ObjectId;
  type: "Income" | "Expense";
  amount: number;
  description?: string;
  category: string;
  division: "Personal" | "Office";
  account: AccountPopulated;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance?: number;
  transactionCount?: number;
  period?: { start: string; end: string };
}
