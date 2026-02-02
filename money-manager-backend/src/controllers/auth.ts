import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/user";
import Account from "../models/account";
import { signToken } from "../utils/jwt";

// Register user
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" });

    const emailNormalized = email.toLowerCase().trim();
    const exists = await User.findOne({ email: emailNormalized });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email: emailNormalized, password });

    // Create a default account for the user (set as primary)
    await Account.create({
      name: "Main Account",
      balance: 0,
      user: user._id,
      isPrimary: true,
    });

    const token = signToken({ id: user._id.toString(), email: user.email });
    const refreshToken = jwt.sign({ id: user._id.toString() }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });

    return res.status(201).json({
      token,
      refreshToken,
      user: { id: user._id.toString(), name: user.name, email: user.email },
    });
  } catch (err: any) {
    console.error("Register Error:", err);
    return res.status(500).json({ message: err.message || "Registration failed" });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "All fields are required" });

    const emailNormalized = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailNormalized }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Check if user has at least one account, if not create a default one
    const accountCount = await Account.countDocuments({ user: user._id });

    if (accountCount === 0) {
      await Account.create({
        name: "Main Account",
        balance: 0,
        user: user._id,
        isPrimary: true,
      });
    }

    const token = signToken({ id: user._id.toString(), email: user.email });
    const refreshToken = jwt.sign({ id: user._id.toString() }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });

    return res.json({ token, refreshToken, user: { id: user._id.toString(), name: user.name, email: user.email } });
  } catch (err: any) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: err.message || "Login failed" });
  }
};

// Google OAuth callback
export const googleCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    if (!user) {
      console.error("Google OAuth: No user in request");
      const errorRedirect = `${process.env.FRONTEND_URL}/oauth-success?popup=true&error=Authentication failed`;
      return res.redirect(errorRedirect);
    }

    // Check if user has at least one account, if not create a default one
    const accountCount = await Account.countDocuments({ user: user._id });

    if (accountCount === 0) {
      await Account.create({
        name: "Main Account",
        balance: 0,
        user: user._id,
        isPrimary: true,
      });
    }

    const token = signToken({ id: user._id.toString(), email: user.email });
    const refreshToken = jwt.sign({ id: user._id.toString() }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });

    const redirectUrl = new URL(`${process.env.FRONTEND_URL}/oauth-success`);
    redirectUrl.searchParams.append("popup", "true");
    redirectUrl.searchParams.append("token", token);
    redirectUrl.searchParams.append("refreshToken", refreshToken);
    redirectUrl.searchParams.append("userId", user._id.toString());
    redirectUrl.searchParams.append("name", user.name);
    redirectUrl.searchParams.append("email", user.email);

    return res.redirect(redirectUrl.toString());
  } catch (err: any) {
    console.error("Google OAuth Error:", err);
    const errorRedirect = `${process.env.FRONTEND_URL}/oauth-success?popup=true&error=${encodeURIComponent(err.message)}`;
    return res.redirect(errorRedirect);
  }
};

// Get current user
export const me = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user: { id: user._id.toString(), name: user.name, email: user.email } });
  } catch (err: any) {
    console.error("Fetch user error:", err);
    return res.status(500).json({ message: err.message || "Failed to fetch user" });
  }
};