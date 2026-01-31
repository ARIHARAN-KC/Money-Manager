import apiClient from "../utils/apiClient";

export const createAccount = (data: {
  name: string;
  balance: number;
}) => apiClient.post("/accounts", data);


//Accounts api calls
export const getAccounts = async (page = 1, limit = 10) => {
  const response = await apiClient.get(`/accounts?page=${page}&limit=${limit}`);
  
  if (response.data && Array.isArray(response.data.data)) {
    return { data: { items: response.data.data } };
  }
  
  if (Array.isArray(response.data)) {
    return { data: { items: response.data } };
  }
  
  if (response.data && response.data.items && Array.isArray(response.data.items)) {
    return response;
  }
  
  return { data: { items: [] } };
};

export const getAccountById = (id: string) =>
  apiClient.get(`/accounts/${id}`);

export const updateAccount = (
  id: string,
  data: { name?: string }
) => apiClient.put(`/accounts/${id}`, data);

export const deleteAccount = (id: string) =>
  apiClient.delete(`/accounts/${id}`);