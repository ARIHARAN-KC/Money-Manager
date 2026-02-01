import mongoose, { Schema, Types, Model } from "mongoose";

export interface IAccount {
  name: string;
  balance: number;
  user: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const accountSchema = new Schema<IAccount>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    balance: {
      type: Number,
      default: 0,
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

// Prevent duplicate account names per user
accountSchema.index({ name: 1, user: 1 }, { unique: true });

// Ensure correct model reuse in hot-reload / serverless
const Account: Model<IAccount> =
  mongoose.models.Account ??
  mongoose.model<IAccount>("Account", accountSchema);

export default Account;
