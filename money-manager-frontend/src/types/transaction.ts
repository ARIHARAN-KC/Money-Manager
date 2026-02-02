export type Transaction = {
  _id: string;
  type: "Income" | "Expense";
  amount: number;
  description?: string;
  category: string;
  division: "Personal" | "Office";
  account: {
    _id: string;
    name: string;
    balance: number;
    user?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  user?: string;
};