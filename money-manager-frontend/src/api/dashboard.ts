import apiClient from "../utils/apiClient";

export interface Summary {
  income: number;
  expense: number;
  net: number;
}

export interface CategorySummaryItem {
  _id: string;
  category: string;
  total: number;
}

export interface RangeTransactionsResponse {
  transactions: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Dashboard API calls
export const getSummary = async (
  type: "weekly" | "monthly" | "yearly", 
  page = 1, 
  limit = 10
): Promise<{ data: Summary }> => {
  const res = await apiClient.get(`/dashboard/summary?type=${type}&page=${page}&limit=${limit}`);
  return res.data;
};

export const getCategorySummary = async (
  page = 1, 
  limit = 10
): Promise<{ data: { items: CategorySummaryItem[] } }> => {
  const res = await apiClient.get(`/dashboard/categories?page=${page}&limit=${limit}`);
  
  // Ensure consistent response format
  if (res.data && res.data.data && Array.isArray(res.data.data)) {
    return { data: { items: res.data.data } };
  }
  
  if (res.data && Array.isArray(res.data)) {
    return { data: { items: res.data } };
  }
  
  return { data: { items: [] } };
};

export const getRangeTransactions = async (
  from: string,
  to: string,
  page = 1,
  limit = 10
): Promise<{ data: RangeTransactionsResponse }> => {
  const res = await apiClient.get(
    `/dashboard/range?from=${from}&to=${to}&page=${page}&limit=${limit}`
  );
  
  // Ensure consistent response format
  if (res.data && res.data.data && Array.isArray(res.data.data)) {
    return { data: { 
      transactions: res.data.data,
      total: res.data.total || res.data.data.length,
      page: res.data.page || page,
      limit: res.data.limit || limit,
      totalPages: res.data.totalPages || 1
    } };
  }
  
  if (res.data && Array.isArray(res.data)) {
    return { data: {
      transactions: res.data,
      total: res.data.length,
      page,
      limit,
      totalPages: Math.ceil(res.data.length / limit)
    } };
  }
  
  return { data: {
    transactions: [],
    total: 0,
    page,
    limit,
    totalPages: 0
  } };
};