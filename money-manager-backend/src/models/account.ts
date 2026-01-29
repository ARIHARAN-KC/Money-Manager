import mongoose, { Schema, Document } from "mongoose";

export interface IAccount extends Document {
    name: string;
    balance: number;
}

const accountSchema = new Schema<IAccount>(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        balance: {
            type: Number,
            default: 0
        },
    },
    {
        timestamps: true
    }
);

export default mongoose.model<IAccount>("Account", accountSchema);
