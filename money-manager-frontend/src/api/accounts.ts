import apiClient from "../utils/apiClient";

export interface PaginatedResponse {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  data: any[];
}

export interface CreateAccountData {
  name: string;
  balance?: number;
  isPrimary?: boolean;
}

export interface UpdateAccountData {
  name?: string;
  balance?: number;
  isPrimary?: boolean;
}

// Create account
export const createAccount = (data: CreateAccountData) => 
  apiClient.post("/accounts", data);

// Get accounts with pagination
export const getAccounts = async (page = 1, limit = 10): Promise<{ data: PaginatedResponse }> => {
  const response = await apiClient.get(`/accounts?page=${page}&limit=${limit}`);
  return response;
};

// Get account by ID
export const getAccountById = (id: string) =>
  apiClient.get(`/accounts/${id}`);

// Update account
export const updateAccount = (id: string, data: UpdateAccountData) => 
  apiClient.put(`/accounts/${id}`, data);

// Set account as primary
export const setPrimaryAccount = (id: string) =>
  apiClient.put(`/accounts/${id}/set-primary`);

// Delete account
export const deleteAccount = (id: string) =>
  apiClient.delete(`/accounts/${id}`);