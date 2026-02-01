import apiClient from "../utils/apiClient";

export interface Budget {
  _id: string;
  category: string;
  division: "Personal" | "Office";
  allocated: number;
  spent?: number;
  period: "weekly" | "monthly" | "yearly";
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetData {
  category: string;
  division: "Personal" | "Office";
  allocated: number;
  period: "weekly" | "monthly" | "yearly";
}

export const getBudgets = async (): Promise<Budget[]> => {
  const res = await apiClient.get("/budget");
  return res.data;
};

export const createBudget = async (data: CreateBudgetData): Promise<Budget> => {
  const res = await apiClient.post("/budget", data);
  return res.data;
};

export const updateBudget = async (id: string, data: Partial<CreateBudgetData>): Promise<Budget> => {
  const res = await apiClient.put(`/budget/${id}`, data);
  return res.data;
};

export const deleteBudget = async (id: string): Promise<void> => {
  await apiClient.delete(`/budget/${id}`);
};