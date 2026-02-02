import { Request } from "express";

export interface AuthRequest<B = any, Q = any, P = any> extends Request<P, any, B, Q> {
  userId?: string;
}

export interface IAccount {
  _id: string;
  name: string;
  balance: number;
  user: string;
  createdAt?: Date;
  updatedAt?: Date;
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

// Set account as primary
export const setPrimaryAccount = (id: string) =>
  apiClient.put(`/accounts/${id}/set-primary`);