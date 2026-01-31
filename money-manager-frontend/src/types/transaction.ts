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

// Pagination Response
export interface PaginatedTransactions {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  data: Transaction[];
}