export interface Account {
  _id: string;
  name: string;
  balance: number;
  user: string;
  isPrimary?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}