import mongoose, { Schema, Types, Model } from "mongoose";

export type Division = "Personal" | "Office";
export type TransactionType = "Income" | "Expense";

export interface ITransaction {
  type: TransactionType;
  amount: number;
  description?: string;
  category: string;
  division: Division;
  account: Types.ObjectId;
  user: Types.ObjectId;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    type: {
      type: String,
      enum: ["Income", "Expense"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    division: {
      type: String,
      enum: ["Personal", "Office"],
      required: true,
      index: true,
    },
    account: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Query performance indexes
transactionSchema.index({ account: 1, createdAt: -1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ division: 1 });
transactionSchema.index({ user: 1 });

// Safe model reuse (dev hot reload / serverless)
const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ??
  mongoose.model<ITransaction>("Transaction", transactionSchema);

export default Transaction;