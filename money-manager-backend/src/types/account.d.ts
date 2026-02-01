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
