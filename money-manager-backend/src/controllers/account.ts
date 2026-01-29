import { Request, Response } from "express";
import Account from "../models/account";

// Create a new account
export const createAccount = async (req: Request, res: Response) => {
    try {
        const { name, balance } = req.body;
        const existing = await Account.findOne({ name });

        if (existing) return res.status(400).json({ error: "Account already exists" });

        const account = await Account.create({ name, balance: balance || 0 });
        res.status(201).json(account);
    } catch (err) {
        if (err instanceof Error) res.status(500).json({ error: err.message });
        else res.status(500).json({ error: "Unknown error occurred" });
    }
};

// Get all accounts
export const getAccounts = async (_req: Request, res: Response) => {
    try {
        const accounts = await Account.find();
        res.json(accounts);
    } catch (err) {
        if (err instanceof Error) res.status(500).json({ error: err.message });
        else res.status(500).json({ error: "Unknown error occurred" });
    }
};

// Get a single account by ID
export const getAccountById = async (req: Request, res: Response) => {
    try {
        const account = await Account.findById(req.params.id);
        if (!account) return res.status(404).json({ error: "Account not found" });
        res.json(account);
    } catch (err) {
        if (err instanceof Error) res.status(500).json({ error: err.message });
        else res.status(500).json({ error: "Unknown error occurred" });
    }
};

// Update account balance or name
export const updateAccount = async (req: Request, res: Response) => {
    try {
        const { name, balance } = req.body;
        const account = await Account.findById(req.params.id);

        if (!account) return res.status(404).json({ error: "Account not found" });

        if (name) account.name = name;
        if (balance !== undefined) account.balance = balance;

        await account.save();
        res.json(account);
    } catch (err) {
        if (err instanceof Error) res.status(500).json({ error: err.message });
        else res.status(500).json({ error: "Unknown error occurred" });
    }
};

// Delete account
export const deleteAccount = async (req: Request, res: Response) => {
    try {
        const account = await Account.findByIdAndDelete(req.params.id);

        if (!account) return res.status(404).json({ error: "Account not found" });

        res.json({ message: "Account deleted successfully" });
    } catch (err) {
        if (err instanceof Error) res.status(500).json({ error: err.message });
        else res.status(500).json({ error: "Unknown error occurred" });
    }
};
