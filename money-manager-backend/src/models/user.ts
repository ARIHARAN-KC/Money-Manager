import mongoose, { Schema, Model, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  provider: "manual" | "google";
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
    provider: {
      type: String,
      enum: ["manual", "google"],
      default: "manual",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Hash password ONLY for manual login/register users
userSchema.pre<IUser>("save", async function () {
  if (this.provider !== "manual") return;
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (
  this: IUser,
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Safe model reuse (dev hot reload / serverless)
const User: Model<IUser> =
  mongoose.models.User ??
  mongoose.model<IUser>("User", userSchema);

export default User;
