import mongoose, { Schema, Document } from "mongoose";

export type Division = "Personal" | "Office";
export type TransactionType = "Income" | "Expense";

export interface ITransaction extends Document {
    type: TransactionType;
    amount: number;
    description?: string;
    category: string;
    division: Division;
    account: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
    {
        type: {
            type: String,
            enum: ["Income", "Expense"],
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        description: {
            type: String
        },
        category: {
            type: String,
            required: true
        },
        division: {
            type: String,
            enum: ["Personal", "Office"],
            required: true
        },
        account: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
            required: true
        },
    },
    { timestamps: true }
);

export default mongoose.model<ITransaction>("Transaction", transactionSchema);
