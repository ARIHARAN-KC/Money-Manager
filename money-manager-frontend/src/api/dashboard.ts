import apiClient from "../utils/apiClient";

export interface SummaryResponse {
  _id: string;
  total: number;
}

export interface CategorySummaryResponse {
  _id: string;
  income: number;
  expense: number;
}

export interface RangeTransactionsResponse {
  transactions: any[];
  totalTransactions: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardSummaryResponse {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  summary: SummaryResponse[];
}

export interface CategorySummaryApiResponse {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  summary: CategorySummaryResponse[];
}

export interface RangeSummaryApiResponse {
  page: number;
  limit: number;
  totalPages: number;
  totalTransactions: number;
  transactions: any[];
}

// Get summary (Income/Expense totals by type)
export const getSummary = async (
  type: "weekly" | "monthly" | "yearly", 
  page = 1, 
  limit = 10
): Promise<DashboardSummaryResponse> => {
  const res = await apiClient.get(`/dashboard/summary?type=${type}&page=${page}&limit=${limit}`);
  return res.data;
};

// Get category summary
export const getCategorySummary = async (
  page = 1, 
  limit = 10
): Promise<CategorySummaryApiResponse> => {
  const res = await apiClient.get(`/dashboard/categories?page=${page}&limit=${limit}`);
  return res.data;
};

// Get range transactions
export const getRangeTransactions = async (
  from: string,
  to: string,
  page = 1,
  limit = 10
): Promise<RangeSummaryApiResponse> => {
  const res = await apiClient.get(
    `/dashboard/range?from=${from}&to=${to}&page=${page}&limit=${limit}`
  );
  return res.data;
};