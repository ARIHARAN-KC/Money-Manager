import mongoose, { Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";


export interface IUser {
    name: string;
    email: string;
    password: string;
    comparePassword(password: string): Promise<boolean>;
    createdAt?: Date;
    updatedAt?: Date;
}


const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false,
        },
    },
    { timestamps: true }
);


userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});


userSchema.methods.comparePassword = async function (
    this: IUser,
    password: string
): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};


const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", userSchema);


export default User;
