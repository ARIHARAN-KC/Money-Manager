import mongoose, { Schema, Types, Model } from "mongoose";

export interface IBudget {
  category: string;
  division: "Personal" | "Office";
  allocated: number;
  spent?: number;
  period: "weekly" | "monthly" | "yearly";
  user: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const budgetSchema = new Schema<IBudget>(
  {
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
    },
    allocated: {
      type: Number,
      required: true,
      min: 0,
    },
    spent: {
      type: Number,
      default: 0,
      min: 0,
    },
    period: {
      type: String,
      enum: ["weekly", "monthly", "yearly"],
      default: "monthly",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Prevent duplicate budgets per category + division per user
budgetSchema.index(
  { category: 1, division: 1, user: 1 },
  { unique: true }
);

// Safe model reuse (dev hot reload / serverless)
const Budget: Model<IBudget> =
  mongoose.models.Budget ??
  mongoose.model<IBudget>("Budget", budgetSchema);

export default Budget;
