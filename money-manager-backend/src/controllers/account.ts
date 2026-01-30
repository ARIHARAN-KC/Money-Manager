import { Request, Response } from "express";
import Account from "../models/account";


interface AuthRequest extends Request {
  userId?: string;
}


//create account endpoint logic
export const createAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { name, balance } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const existing = await Account.findOne({ name, user: req.userId });
    if (existing) return res.status(400).json({ message: "Account already exists" });

    const account = await Account.create({ name, balance: balance ?? 0, user: req.userId });
    res.status(201).json(account);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


//get accounts endpoint logic[admin access]
export const getAccounts = async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const totalItems = await Account.countDocuments({ user: req.userId });
  const accounts = await Account.find({ user: req.userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    page,
    limit,
    totalPages: Math.ceil(totalItems / limit),
    totalItems,
    data: accounts,
  });
};


//get account by id endpoint logic
export const getAccountById = async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

  const account = await Account.findOne({ _id: req.params.id, user: req.userId });
  if (!account) return res.status(404).json({ message: "Account not found" });

  res.json(account);
};


//update account endpoint logic
export const updateAccount = async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

  const account = await Account.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    req.body,
    { new: true }
  );

  if (!account) return res.status(404).json({ message: "Account not found" });
  res.json(account);
};


// Delete account endpoint logic
export const deleteAccount = async (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

  const account = await Account.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!account) return res.status(404).json({ message: "Account not found" });

  res.json({ message: "Account deleted" });
};
