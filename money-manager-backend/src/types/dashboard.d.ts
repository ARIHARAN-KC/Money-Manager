import { Types } from "mongoose";

export interface SummaryQuery {
  type?: "weekly" | "monthly" | "yearly";
  page?: string;
  limit?: string;
}

export interface RangeQuery {
  from?: string;
  to?: string;
  page?: string;
  limit?: string;
}

export interface SummaryResult {
  _id: string;
  total: number;
}

export interface CategorySummaryResult {
  _id: string;
  income: number;
  expense: number;
}

export interface LeanAccount {
  _id: Types.ObjectId;
}
