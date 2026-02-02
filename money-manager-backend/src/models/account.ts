import mongoose, { Schema, Types, Model, Document } from "mongoose";

export interface IAccount {
  name: string;
  balance: number;
  user: Types.ObjectId;
  isPrimary?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

type AccountDocument = IAccount & Document;

const accountSchema = new Schema<AccountDocument>(
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
    isPrimary: {
      type: Boolean,
      default: false,
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
const Account: Model<AccountDocument> =
  mongoose.models.Account ??
  mongoose.model<AccountDocument>("Account", accountSchema);

export default Account;