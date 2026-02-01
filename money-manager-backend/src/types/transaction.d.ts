import { Types } from "mongoose";

export interface AuthRequestQuery {
  page?: string;
  limit?: string;
}

export interface ITransaction {
  type: "Income" | "Expense";
  amount: number;
  description?: string;
  category: string;
  division: "Personal" | "Office";
  account: string;
  tags?: string[];
}

export interface UpdateTransactionBody {
  type?: "Income" | "Expense";
  amount?: number;
  description?: string;
  category?: string;
  division?: "Personal" | "Office";
  account?: string;
  tags?: string[];
}

export interface TransferTransactionBody {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description?: string;
}

// Interface for populated account
export interface PopulatedAccount {
  _id: Types.ObjectId;
  name: string;
  balance: number;
  user: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TransactionPopulated {
  _id: Types.ObjectId;
  type: "Income" | "Expense";
  amount: number;
  description?: string;
  category: string;
  division: "Personal" | "Office";
  account: PopulatedAccount;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}