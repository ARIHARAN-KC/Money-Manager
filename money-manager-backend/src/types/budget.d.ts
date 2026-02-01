export interface IBudget {
  category: string;
  division: "Personal" | "Office";
  allocated: number;
  period: string; 
}

export interface IBudgetWithSpent extends IBudget {
  _id: string;
  user: string;
  createdAt?: Date;
  updatedAt?: Date;
  spent: number;
}
