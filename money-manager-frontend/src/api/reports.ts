import apiClient from "../utils/apiClient";

export interface FilterOptions {
  startDate: string;
  endDate: string;
  type: "all" | "Income" | "Expense";
  division: "all" | "Personal" | "Office";
  category: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface ExportOptions {
  format: "csv" | "pdf";
  include: ("transactions" | "summary" | "charts")[];
}

export interface ReportResponse {
  transactions: any[];
  summary: {
    totalIncome: number;
    totalExpense: number;
    transactionCount: number;
    period: {
      start: string;
      end: string;
    };
  };
}

// Updated Reports API calls
export const generateReport = async (
  filters: Partial<FilterOptions>
): Promise<ReportResponse> => {
  const queryParams = new URLSearchParams();
  
  if (filters.startDate) queryParams.append('startDate', filters.startDate);
  if (filters.endDate) queryParams.append('endDate', filters.endDate);
  if (filters.type && filters.type !== 'all') queryParams.append('type', filters.type);
  if (filters.division && filters.division !== 'all') queryParams.append('division', filters.division);
  if (filters.category) queryParams.append('category', filters.category);
  
  const res = await apiClient.get(`/reports/generate?${queryParams.toString()}`);
  return res.data;
};

export const exportReport = async (
  filters: FilterOptions,
  options: ExportOptions
): Promise<Blob> => {
  const response = await apiClient.post(
    "/reports/export",
    { filters, options },
    { responseType: 'blob' }
  );
  
  return response.data;
};