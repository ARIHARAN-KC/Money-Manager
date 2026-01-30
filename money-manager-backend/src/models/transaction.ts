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
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
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
  },
  { timestamps: true }
);


transactionSchema.index({ account: 1, createdAt: -1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ division: 1 });


const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", transactionSchema);


export default Transaction;
