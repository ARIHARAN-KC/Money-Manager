import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/user";
import { signToken } from "../utils/jwt";

// Register logic
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailNormalized = email.toLowerCase().trim();

    const exists = await User.findOne({ email: emailNormalized });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email: emailNormalized,
      password,
    });

    const token = signToken({ id: user._id.toString(), email: user.email });
    const refreshToken = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      refreshToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message || "Registration failed" });
  }
};

// Login logic
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailNormalized = email.toLowerCase().trim();

    // Fetch user including password (since select: false in schema)
    const user = await User.findOne({ email: emailNormalized }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken({ id: user._id.toString(), email: user.email });
    const refreshToken = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      refreshToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message || "Login failed" });
  }
};

// Google oAuth
export const googleCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;

    if (!user) {
      console.error("Google OAuth: No user in request");
      const errorRedirect = `${process.env.FRONTEND_URL}/oauth-success?popup=true&error=Authentication failed`;
      return res.redirect(errorRedirect);
    }

    const token = signToken({ 
      id: user._id.toString(), 
      email: user.email 
    });
    
    const refreshToken = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    );

    // console.log("Google OAuth Success - User ID:", user._id);
    // console.log("Google OAuth Success - Email:", user.email);

    // Redirect with ALL data in URL
    const redirectUrl = new URL(`${process.env.FRONTEND_URL}/oauth-success`);
    redirectUrl.searchParams.append("popup", "true");
    redirectUrl.searchParams.append("token", token);
    redirectUrl.searchParams.append("refreshToken", refreshToken);
    redirectUrl.searchParams.append("userId", user._id.toString());
    redirectUrl.searchParams.append("name", user.name);
    redirectUrl.searchParams.append("email", user.email);

    res.redirect(redirectUrl.toString());
  } catch (err: any) {
    console.error("Google OAuth Error:", err);
    const errorRedirect = `${process.env.FRONTEND_URL}/oauth-success?popup=true&error=${encodeURIComponent(err.message)}`;
    res.redirect(errorRedirect);
  }
};

// me endpoint
export const me = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message || "Failed to fetch user" });
  }
};