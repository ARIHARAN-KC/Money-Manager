import apiClient from "../utils/apiClient";

export interface Account {
  _id: string;
  name: string;
  balance: number;
  user: string;
  createdAt?: string;
  updatedAt?: string;
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
  createdAt?: string;
  updatedAt?: string;
  user?: string;
}

export interface CreateTransactionData {
  type: "Income" | "Expense";
  amount: number;
  description?: string;
  category: string;
  division: "Personal" | "Office";
  account: string;
  tags?: string[];
}

export interface UpdateTransactionData {
  type?: "Income" | "Expense";
  amount?: number;
  description?: string;
  category?: string;
  division?: "Personal" | "Office";
  account?: string;
  tags?: string[];
}

// Pagination Response
export interface PaginatedTransactions {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  data: Transaction[];
}

// Transaction API Calls
export const getTransactions = async (page = 1, limit = 10): Promise<PaginatedTransactions> => {
  const res = await apiClient.get(`/transactions?page=${page}&limit=${limit}`);
  return res.data;
};

export const getTransactionById = async (id: string): Promise<Transaction> => {
  const res = await apiClient.get(`/transactions/${id}`);
  return res.data;
};

export const createTransaction = async (data: CreateTransactionData): Promise<Transaction> => {
  const res = await apiClient.post("/transactions", data);
  return res.data;
};

export const updateTransaction = async (id: string, data: UpdateTransactionData): Promise<Transaction> => {
  const res = await apiClient.put(`/transactions/${id}`, data);
  return res.data;
};

export const deleteTransaction = async (id: string): Promise<void> => {
  await apiClient.delete(`/transactions/${id}`);
};

// Transfer API
export interface TransferPayload {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description?: string;
}

export const transferTransaction = async (data: TransferPayload): Promise<any> => {
  const res = await apiClient.post("/transactions/transfer", data);
  return res.data;
};