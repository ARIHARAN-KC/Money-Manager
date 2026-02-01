import apiClient from "../utils/apiClient";

export interface Account {
  _id: string;
  name: string;
  balance: number;
}

export interface Transaction {
  _id: string;
  type: "Income" | "Expense";
  amount: number;
  description?: string;
  category: string;
  division: "Personal" | "Office";
  account: Account;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionData {
  type: "Income" | "Expense";
  amount: number;
  description?: string;
  category: string;
  division: "Personal" | "Office";
  account: string;
}

// Pagination Response
export interface PaginatedTransactions {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  data: Transaction[];
}

// transaction api Calls
export const getTransactions = async (page = 1, limit = 10): Promise<PaginatedTransactions> => {
  const res = await apiClient.get(`/transactions?page=${page}&limit=${limit}`);

  // Ensure consistent format
  if (res.data && Array.isArray(res.data.data)) {
    return res.data;
  }

  return { page, limit, totalPages: 0, totalItems: 0, data: [] };
};

export const getTransactionById = async (id: string): Promise<Transaction> => {
  const res = await apiClient.get(`/transactions/${id}`);
  return res.data;
};

export const createTransaction = async (data: CreateTransactionData): Promise<Transaction> => {
  const res = await apiClient.post("/transactions", data);
  return res.data;
};

export const updateTransaction = async (id: string, data: Partial<CreateTransactionData>): Promise<Transaction> => {
  const res = await apiClient.put(`/transactions/${id}`, data);
  return res.data;
};

export const deleteTransaction = async (id: string): Promise<void> => {
  await apiClient.delete(`/transactions/${id}`);
};

// Transfer api calls
export interface TransferPayload {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description?: string;
}

export const transferTransaction = async (data: TransferPayload) => {
  const res = await apiClient.post("/transactions/transfer", data);
  return res.data;
};

// ----------------- ACCOUNT API -----------------
export const getAccounts = async (page = 1, limit = 10) => {
  const res = await apiClient.get(`/accounts?page=${page}&limit=${limit}`);

  if (res.data && Array.isArray(res.data.data)) {
    return { data: { items: res.data.data } };
  }

  if (Array.isArray(res.data)) {
    return { data: { items: res.data } };
  }

  return { data: { items: [] } };
};

export const createAccount = async (data: { name: string; balance?: number }) => {
  const res = await apiClient.post("/accounts", data);
  return res.data;
};

export const getAccountById = async (id: string) => {
  const res = await apiClient.get(`/accounts/${id}`);
  return res.data;
};

export const updateAccount = async (id: string, data: { name?: string; balance?: number }) => {
  const res = await apiClient.put(`/accounts/${id}`, data);
  return res.data;
};

export const deleteAccount = async (id: string) => {
  await apiClient.delete(`/accounts/${id}`);
};