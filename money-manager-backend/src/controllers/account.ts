import { Request, Response } from "express";
import Account from "../models/account";
import { error } from "node:console";

// create a new account
export const createAccount = async (req: Request, res: Response) => {
    try {
        const { name, balance } = req.body;
        const existing = await Account.findOne({ name });

        if (existing) return res.status(400).json({
            error: "Account already exists"
        });

        const account = await Account.create({
            name,
            balance: balance || 0
        })
    } catch (err) {
        if (err instanceof Error) res.status(500).json({ error: err.message });
        else res.status(500).json({ error: "Unknown error occurred" });
    }
};

// get all accounts
export const getAccounts = async (_req: Request, res: Response) => {
    try {
        const accounts = await Account.find();
        res.json(accounts);
    } catch (err) {
        if (err instanceof Error) res.status(500).json({ error: err.message });
        else res.status(500).json({ error: "Unknown error occurred" });
    }
}

// update account balance or name
export const updateAccount = async( req: Request, res: Response ) =>{
    try {
        const { name, balance } = req.body;
        const account = await Account.findById(req.params.id);
        if(!account) res
    } catch (err) {
        
    }
}